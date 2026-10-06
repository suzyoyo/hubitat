// 社區公告假資料
// 欄位說明：
//   id          唯一編號
//   type        公告類型，見下方 ANNOUNCEMENT_TYPES
//   title       標題
//   content     內容說明
//   startAt     開始時間  ┐ 只有一天的活動，兩個寫同一天
//   endAt       結束時間  ┘
//   timeText    每日時段的說明文字（多日的公告用，沒有就不寫）
//   areaIds     影響範圍（對應 community.js 的 areas）；['all'] 代表全社區
//   impact      影響範圍的文字說明（沒有就不寫）
//   place       活動地點（活動類公告用）
//   organizer   主辦或負責單位
//   isUrgent    是否標示為緊急
//   push        推播對象：'affected' 影響範圍內住戶 / 'all' 全社區 / 'none' 不推播
//   status      狀態，見下方 ANNOUNCEMENT_STATUSES
//   authorId    發布（送出）的人
//   createdAt   送出時間
//   publishedAt 正式發布的時間（還沒發布就不寫）
//   reviewerId  審核的人（免審核、或還沒審核就不寫）
//   withdrawnAt 撤回時間  ┐
//   withdrawnBy 撤回的人  ├ 已撤回的公告才有
//   withdrawReason 撤回原因（選填）┘
//   caseId      關聯案件（只有管理端看得到，沒有就不寫）
//   equipmentId 關聯設備（只有管理端看得到，沒有就不寫）

// 審核規則（判斷的程式在 src/mocks/api/announcements.js 的 announcementNeedsReview）：
//   委員發布的公告     → 不用審核，直接發布
//   管理人員發布的公告 → 要先經過主委或副主委審核
//   管理人員標示為緊急 → 不用審核，直接發布，並同步通知管委會

export const ANNOUNCEMENT_TYPES = {
  construction: { label: '施工' },
  maintenance: { label: '維護' },
  activity: { label: '活動' },
  other: { label: '其他' },
}

export const ANNOUNCEMENT_STATUSES = {
  draft: { label: '待補' },
  pending: { label: '待審核' },
  published: { label: '已發布' },
  rejected: { label: '已退回' },
  withdrawn: { label: '已撤回' },
}

// 退回公告時可以選的原因
export const REJECT_REASONS = ['日期錯誤', '地點錯誤', '內容不清楚', '其他']

export const announcements = [
  // ── 已發布、還沒結束 ─────────────────────────────────────
  {
    id: 'an-001',
    type: 'maintenance',
    title: '社區年度消毒與除蟲',
    content:
      '本次消毒除蟲作業範圍包含公共區域、梯廳及地下室。作業期間請勿將寵物帶入公共區域，施作後 2 小時內請避免接觸地面。',
    startAt: '2026-10-05T09:00',
    endAt: '2026-10-07T17:00',
    timeText: '每日 09:00–17:00',
    areaIds: ['all'],
    impact: '各棟公設地下室、1F 中庭花園與垃圾集中場，施作期間請緊閉門窗。',
    organizer: '環安病媒防治',
    isUrgent: false,
    push: 'all',
    status: 'published',
    authorId: 'u-s01',
    createdAt: '2026-09-29T14:20',
    publishedAt: '2026-09-30T09:00',
    reviewerId: 'u-c01',
  },
  {
    id: 'an-002',
    type: 'maintenance',
    title: 'A 棟電梯定期保養',
    content: '保養期間 A 棟電梯暫停使用，請改走樓梯或使用 B 棟電梯。造成不便，敬請見諒。',
    startAt: '2026-10-10T09:00',
    endAt: '2026-10-10T12:00',
    areaIds: ['area-a'],
    impact: 'A 棟電梯暫停使用，請改走樓梯或使用 B 棟電梯。',
    organizer: '大同電梯',
    isUrgent: false,
    push: 'affected',
    status: 'published',
    authorId: 'u-s01',
    createdAt: '2026-09-30T10:00',
    publishedAt: '2026-10-01T10:40',
    reviewerId: 'u-c02',
    equipmentId: 'e-001',
  },
  {
    id: 'an-003',
    type: 'maintenance',
    title: 'B1 游泳池換水與例行水質檢驗',
    content: '游泳池進行例行換水與水質檢驗，當日暫停開放。',
    startAt: '2026-10-09T08:00',
    endAt: '2026-10-09T18:00',
    areaIds: ['area-pool'],
    impact: '游泳池及淋浴更衣間暫停開放一日，健身房正常開放。',
    organizer: '欣欣機電',
    isUrgent: false,
    push: 'none',
    status: 'published',
    authorId: 'u-s01',
    createdAt: '2026-09-29T09:30',
    publishedAt: '2026-09-29T20:30',
    reviewerId: 'u-c02',
    equipmentId: 'e-011',
  },
  {
    id: 'an-004',
    type: 'construction',
    title: 'B 棟頂樓防水施工',
    content: 'B 棟頂樓進行防水層修補，施工期間頂樓暫停開放，並有機具搬運使用貨梯。',
    startAt: '2026-09-24T08:30',
    endAt: '2026-10-01T17:00',
    timeText: '每日 08:30–17:00',
    areaIds: ['area-b'],
    impact: 'B 棟頂樓暫停開放；貨梯於上午時段優先供施工使用。',
    organizer: '昇益工程行',
    isUrgent: false,
    push: 'affected',
    status: 'published',
    authorId: 'u-c04',
    createdAt: '2026-09-22T16:00',
    publishedAt: '2026-09-22T16:00',
    caseId: 'CASE-20260918-001',
  },
  {
    id: 'an-005',
    type: 'activity',
    title: '重陽敬老茶會',
    content: '邀請社區長輩與家人一起喝茶聊天，現場備有茶點與小禮物。',
    startAt: '2026-10-18T14:00',
    endAt: '2026-10-18T16:00',
    areaIds: ['all'],
    place: '1F 中庭花園',
    organizer: '管理委員會',
    isUrgent: false,
    push: 'all',
    status: 'published',
    authorId: 'u-c02',
    createdAt: '2026-09-27T11:00',
    publishedAt: '2026-09-27T11:00',
  },

  {
    id: 'an-006',
    type: 'activity',
    title: '中秋社區烤肉聯誼',
    content: '歡迎住戶攜家帶眷參加，現場備有烤肉食材與飲品。',
    startAt: '2026-10-04T18:00',
    endAt: '2026-10-04T21:00',
    areaIds: ['all'],
    place: 'A 棟中庭',
    organizer: '管理委員會',
    isUrgent: false,
    push: 'all',
    status: 'published',
    authorId: 'u-c04',
    createdAt: '2026-09-30T21:00',
    publishedAt: '2026-09-30T21:00',
  },
  // 管理人員標示為緊急：不用審核，直接發布
  {
    id: 'an-011',
    type: 'maintenance',
    title: 'B2 車道臨時封閉',
    content: 'B2 車道因漏水搶修臨時封閉，請改走 B1 車道出入。作業完成前請勿停放在 B2。',
    startAt: '2026-10-01T14:00',
    endAt: '2026-10-01T18:00',
    areaIds: ['area-parking'],
    impact: '地下停車場 B2 車道暫時封閉，請改走 B1 車道。',
    organizer: '管理室',
    isUrgent: true,
    push: 'all',
    status: 'published',
    authorId: 'u-s02',
    createdAt: '2026-10-01T13:40',
    publishedAt: '2026-10-01T13:40',
  },

  // ── 待審核（管理人員送出的一般公告）────────────────────────
  {
    id: 'an-007',
    type: 'other',
    title: 'C 棟電梯停機檢測通知',
    content: 'C 棟電梯異音檢修完成後需停機複檢，檢測期間請改走樓梯。',
    startAt: '2026-10-06T10:00',
    endAt: '2026-10-06T11:30',
    areaIds: ['area-c'],
    impact: 'C 棟電梯暫停使用約 1.5 小時。',
    organizer: '管理室',
    isUrgent: false,
    push: 'affected',
    status: 'pending',
    authorId: 'u-s02',
    createdAt: '2026-10-01T13:30',
    caseId: 'CASE-20260922-002',
    equipmentId: 'e-003',
  },

  // ── 已撤回 ──────────────────────────────────────────────
  {
    id: 'an-012',
    type: 'construction',
    title: '3F 健身房燈具更換維修',
    content: '健身房重訓區燈具更換，施工期間局部封閉。',
    startAt: '2026-10-13T10:00',
    endAt: '2026-10-13T12:00',
    areaIds: ['area-a'],
    impact: '健身房局部重訓區暫時封閉 2 小時，跑步機區正常使用。',
    organizer: '立信水電行',
    isUrgent: false,
    push: 'none',
    status: 'withdrawn',
    authorId: 'u-s01',
    createdAt: '2026-09-29T11:00',
    publishedAt: '2026-09-29T18:30',
    reviewerId: 'u-c02',
    withdrawnAt: '2026-10-01T09:20',
    withdrawnBy: 'u-s01',
    withdrawReason: '廠商改期，日期確認後重新公告',
  },

  // ── 已結束（標示過緊急的，用來產生「緊急標示使用紀錄」）──────
  {
    id: 'an-008',
    type: 'other',
    title: '颱風來襲，地下停車場封閉',
    content: '因颱風來襲，地下停車場暫時封閉，請住戶提前將車輛移至地面車位。解除時間另行公告。',
    startAt: '2026-09-28T18:00',
    endAt: '2026-09-29T12:00',
    areaIds: ['area-parking'],
    impact: '地下停車場暫時封閉。',
    organizer: '管理室',
    isUrgent: true,
    push: 'all',
    status: 'published',
    authorId: 'u-c04',
    createdAt: '2026-09-28T18:42',
    publishedAt: '2026-09-28T18:42',
  },
  {
    id: 'an-009',
    type: 'maintenance',
    title: '緊急停水搶修',
    content: '揚水管線破裂，全社區緊急停水搶修，預計中午前恢復供水。',
    startAt: '2026-08-15T07:00',
    endAt: '2026-08-15T12:00',
    areaIds: ['all'],
    impact: '全社區停水。',
    organizer: '立信水電行',
    isUrgent: true,
    push: 'all',
    status: 'published',
    authorId: 'u-s01',
    createdAt: '2026-08-15T07:10',
    publishedAt: '2026-08-15T07:10',
  },
  {
    id: 'an-010',
    type: 'other',
    title: '電梯故障停用公告',
    content: 'B 棟電梯故障停用，已通知廠商搶修，恢復時間另行公告。',
    startAt: '2026-06-03T21:30',
    endAt: '2026-06-04T12:00',
    areaIds: ['area-b'],
    impact: 'B 棟電梯暫停使用。',
    organizer: '管理室',
    isUrgent: true,
    push: 'affected',
    status: 'published',
    authorId: 'u-c01',
    createdAt: '2026-06-03T21:30',
    publishedAt: '2026-06-03T21:30',
  },
]
