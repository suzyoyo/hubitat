// 文章分類：側邊導覽、身分專區、首頁「依功能分類」都依這份清單排列
//   id：文章的 category 填這個
//   shared：true 的分類三種身分都看得到（認識好彼社區、開始使用），會排在最前面
//   order：數字小的排前面
// 新增分類時只要在這裡加一筆，畫面會自動出現（裡面至少要有一篇已發布的文章）
export const CATEGORIES = [
  { id: 'about', title: '認識好彼社區', description: '好彼社區是什麼、好彼管家是誰。', shared: true, order: 1 },
  { id: 'start', title: '開始使用', description: '正式開始使用之前，建議先了解 App 的基本畫面。知道通知在哪裡看、底部分頁和右下角按鈕的用途，之後通報問題、追蹤處理進度，或在住戶與管委會身分之間切換時，都會更快上手。', shared: true, order: 2 },
  { id: 'report', title: '通報與追蹤', description: '發現社區有問題時怎麼通報，之後怎麼看進度。', order: 10 },
  { id: 'notice', title: '公告與會議', description: '社區公告、會議紀錄，以及留言給管委會。', order: 11 },
  { id: 'account', title: '我的與加入管委會', description: '「我的」頁，以及用邀請碼加入管委會。', order: 12 },
  { id: 'daily', title: '首頁與待辦', description: '每天打開先看哪裡、要處理的事在哪裡。', order: 20 },
  { id: 'case', title: '案件處理', description: '從受理、派廠商、完工驗收到結案。', order: 21 },
  { id: 'task', title: '交辦', description: '把工作交給管理人員，以及被交辦後怎麼回報。', order: 22 },
  { id: 'announce', title: '公告管理', description: '發布、修改、撤回公告。', order: 23 },
  { id: 'vendor', title: '廠商、合約與設備', description: '緊急聯絡廠商、查看合約與設備維修紀錄。', order: 24 },
]

export function findCategory(id) {
  return CATEGORIES.find((category) => category.id === id)
}
