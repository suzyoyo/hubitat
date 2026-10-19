// 頂部列、抽屜、頁尾共用的主要連結

// 三種身分的專區
export const ROLE_LINKS = [
  { to: '/resident', label: '住戶' },
  { to: '/committee', label: '管委會' },
  { to: '/staff', label: '管理人員' },
]

// 頂部列（桌機）的順序：認識我們、開始使用、使用身分（下拉選單）、常見問題、聯絡支援
//   有 children 的是下拉選單
export const NAV_ITEMS = [
  { to: '/about', label: '認識我們' },
  { to: '/start', label: '開始使用' },
  { label: '使用身分', children: ROLE_LINKS },
  { to: '/faq', label: '常見問題' },
  { to: '/contact', label: '聯絡支援' },
]

// 抽屜、頁尾用的平面清單（順序和頂部列一樣，身分展開成三個連結）
export const MAIN_LINKS = NAV_ITEMS.flatMap((item) => item.children ?? [item])
