// 社區公告假資料
// 欄位說明：
//   id        唯一編號
//   type      公告類型，見下方 ANNOUNCEMENT_TYPES
//   title     標題
//   startDate 開始日期  ┐ 只有一天時，兩個寫同一天
//   endDate   結束日期  ┘
//   timeText  每日時段的說明文字（沒有就不寫）
//   scope     影響的範圍：'全區' 或棟別，例如 'A棟'
//   impact    影響範圍說明（活動類公告沒有這一項，改用 place 地點）
//   advice    給住戶的建議做法
//   place     地點（活動類公告用）
//   organizer 負責單位或廠商

export const ANNOUNCEMENT_TYPES = {
  maintenance: { label: '定期保養' },
  construction: { label: '工程施工' },
  activity: { label: '活動' },
  other: { label: '其他' },
}

export const announcements = [
  {
    id: 'a-001',
    type: 'maintenance',
    title: 'A 棟電梯定期保養',
    startDate: '2026-09-28',
    endDate: '2026-09-29',
    timeText: '每日 09:00–17:00',
    scope: 'A棟',
    impact: 'A 棟前門電梯暫停使用',
    advice: '請改搭 A 棟後門電梯或走樓梯',
    organizer: '永安電梯',
  },
  {
    id: 'a-002',
    type: 'maintenance',
    title: 'B 棟電梯定期保養',
    startDate: '2026-09-30',
    endDate: '2026-10-01',
    timeText: '每日 09:00–17:00',
    scope: 'B棟',
    impact: 'B 棟前門電梯暫停使用',
    advice: '請改搭 B 棟後門電梯或走樓梯',
    organizer: '永安電梯',
  },
  {
    id: 'a-003',
    type: 'construction',
    title: '社區年度消毒與除蟲',
    startDate: '2026-10-05',
    endDate: '2026-10-07',
    timeText: '每日 09:00–17:00',
    scope: '全區',
    impact: '各棟公設地下室、1F 中庭花園與垃圾集中場',
    advice: '施作期間請緊閉門窗',
    organizer: '環安病媒防治',
  },
  {
    id: 'a-004',
    type: 'activity',
    title: '社區烤肉聯歡',
    startDate: '2026-10-11',
    endDate: '2026-10-11',
    timeText: '17:00–20:00',
    scope: '全區',
    place: '1F 中庭花園',
    organizer: '管委會',
  },
]
