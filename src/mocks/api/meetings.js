// 會議相關的假 API：會議紀錄、決議事項、住戶留言
// 三種角色看到的不同：
//   管委會   → 所有會議（含待整理、待發布）、內部檔案、所有住戶留言
//   管理人員 → 只有已發布的會議
//   住戶     → 只有已發布的會議的「住戶版內容」，留言只看得到自己的
import {
  EXECUTION_STATUSES,
  MEETING_STATUSES,
  MEETING_TYPES,
  RESOLUTION_RESULTS,
  meetings,
  nextMeeting,
} from '../data/meetings'
import { delay } from './helpers'
import { findUser, userLabel } from './users'

// 決議結果的顯示文字
//   管委會看到完整票數：「通過（同意 5、反對 0）」
//   住戶看到簡化的：    「通過（5 票）」
function resultText(resolution, forResident) {
  const label = RESOLUTION_RESULTS[resolution.result].label
  if (!resolution.votes) return label
  if (forResident) return `${label}（${resolution.votes.yes} 票）`
  return `${label}（同意 ${resolution.votes.yes}、反對 ${resolution.votes.no}）`
}

// 出席狀況的顯示文字：「5 席出席、1 席委託」
function attendanceText(attendance) {
  const parts = [`${attendance.present} 席出席`]
  if (attendance.proxy > 0) parts.push(`${attendance.proxy} 席委託`)
  return parts.join('、')
}

// 留言人的顯示文字。管委會看到的是遮蔽過的「A 棟 5 樓住戶」，不顯示姓名
function maskedAuthor(userId) {
  const user = findUser(userId)
  const floor = user.unit.split('樓')[0]
  return `${user.building} 棟 ${floor} 樓住戶`
}

function presentResolution(resolution, meeting, forResident) {
  return {
    ...resolution,
    meetingId: meeting.id,
    meetingTitle: meeting.title,
    meetingDate: meeting.heldAt,
    resultText: resultText(resolution, forResident),
    ownerLabel: userLabel(resolution.ownerId),
    executionLabel: resolution.execution ? EXECUTION_STATUSES[resolution.execution].label : '',
  }
}

function presentComment(comment, meeting) {
  return {
    ...comment,
    meetingId: meeting.id,
    meetingTitle: meeting.title,
    authorLabel: maskedAuthor(comment.userId),
    isReplied: Boolean(comment.reply),
    replyByLabel: comment.reply ? userLabel(comment.reply.byId) : '',
  }
}

// 管委會看的完整會議
function presentForCommittee(meeting) {
  return {
    ...meeting,
    typeLabel: MEETING_TYPES[meeting.type].label,
    statusLabel: MEETING_STATUSES[meeting.status].label,
    attendanceText: attendanceText(meeting.attendance),
    guestLabels: meeting.attendance.guests.map(userLabel),
    isMissingSignIn: meeting.files.signIn.length === 0, // 缺簽名簿檔案
    resolutions: meeting.resolutions.map((item) => presentResolution(item, meeting, false)),
    comments: meeting.comments.map((item) => presentComment(item, meeting)),
    pendingCommentCount: meeting.comments.filter((item) => !item.reply).length,
  }
}

// 住戶、管理人員看的會議：沒有內部檔案，留言只有自己的
function presentForPublic(meeting, userId) {
  return {
    id: meeting.id,
    type: meeting.type,
    typeLabel: MEETING_TYPES[meeting.type].label,
    title: meeting.title,
    heldAt: meeting.heldAt,
    attendanceText: attendanceText(meeting.attendance),
    highlights: meeting.highlights,
    summary: meeting.summary,
    // 議案列表：只給標題、補充說明、結果
    agenda: meeting.resolutions.map((item) => ({
      id: item.id,
      title: item.title,
      note: item.note,
      resultText: resultText(item, true),
    })),
    resolutionCount: meeting.resolutions.length,
    fullText: meeting.fullText,
    minutesFile: meeting.files.minutes, // 下載原始檔案（PDF）
    myComments: meeting.comments
      .filter((item) => item.userId === userId)
      .map((item) => presentComment(item, meeting)),
  }
}

// 取得會議列表，新的在前
//   role 是 'committee'：回傳所有會議
//   其他角色：只回傳已發布的；userId 用來挑出「我的留言」
export async function getMeetings(role = 'resident', userId) {
  await delay()
  const sorted = meetings.toSorted((a, b) => b.heldAt.localeCompare(a.heldAt))
  if (role === 'committee') return sorted.map(presentForCommittee)
  return sorted
    .filter((meeting) => meeting.status === 'published')
    .map((meeting) => presentForPublic(meeting, userId))
}

// 取得單一會議的詳情
// 還沒發布的會議，只有管委會拿得到，其他角色會得到 undefined
export async function getMeetingById(id, role = 'resident', userId) {
  await delay()
  const meeting = meetings.find((item) => item.id === id)
  if (!meeting) return undefined
  if (role === 'committee') return presentForCommittee(meeting)
  if (meeting.status !== 'published') return undefined
  return presentForPublic(meeting, userId)
}

// 取得下一次定期會議的時間與地點
export async function getNextMeeting() {
  await delay()
  return nextMeeting
}

// 取得決議事項：把所有會議的決議彙整成一份清單，新的會議在前
// execution 可以不傳（全部需要執行的），或傳 'not_started' 未執行 / 'in_progress' 進行中 / 'done' 已完成
// 「報告事項」和「下次續審」不需要執行，不會出現在這裡
export async function getResolutions(execution) {
  await delay()
  return meetings
    .toSorted((a, b) => b.heldAt.localeCompare(a.heldAt))
    .flatMap((meeting) => meeting.resolutions.map((item) => presentResolution(item, meeting, false)))
    .filter((item) => item.execution)
    .filter((item) => !execution || item.execution === execution)
}

// 取得住戶意見（管委會首頁用）：把所有會議的住戶留言彙整起來，新的在前
// pendingOnly 傳 true 只回傳還沒回覆的
export async function getResidentOpinions(pendingOnly = false) {
  await delay()
  return meetings
    .flatMap((meeting) => meeting.comments.map((item) => presentComment(item, meeting)))
    .filter((item) => !pendingOnly || !item.isReplied)
    .toSorted((a, b) => b.at.localeCompare(a.at))
}

// 取得「我的留言」（住戶用）：我在各場會議留過的言，新的在前
export async function getMyComments(userId) {
  await delay()
  return meetings
    .flatMap((meeting) =>
      meeting.comments
        .filter((item) => item.userId === userId)
        .map((item) => presentComment(item, meeting)),
    )
    .toSorted((a, b) => b.at.localeCompare(a.at))
}
