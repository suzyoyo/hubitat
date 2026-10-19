export default {
  id: 'app-screen',
  title: '認識 App 首頁',
  description: '上方的鈴鐺、下方的分頁、右下角的按鈕，各是做什麼的。',
  category: 'start',
  hideDescription: true, // 文章頁不顯示 description（2026-10-19）
  applicableRoles: ['resident', 'committee', 'staff'],
  order: 1,
  keywords: ['首頁', '畫面', '分頁', '導覽', '鈴鐺', '按鈕', '待辦', '新手', '入門'],
  published: true,
  popular: true,
  sections: [
    {
      blocks: [
        {
          // 用 tab 切身分，每個身分是一組輪播，一張只亮一個地方（2026-10-19 從「截圖＋下面一段清單」改來）
          // marks 的順序就是輪播的順序；boxes：亮起來的地方 [[x, y, 寬, 高], …]，是截圖上的 px（App 畫面改了要重量）
          // 底部分頁那一張 2026-10-19 拿掉（藍色就是現在那一頁，不用教）
          type: 'tour',
          slides: [
            {
              role: 'resident',
              file: 'resident-home.jpg',
              alt: '住戶首頁',
              marks: [
                { boxes: [[313, 10, 44, 44]], zone: 'top', align: 'right', text: '有新通知時，鈴鐺上會有紅點。' },
                { boxes: [[20, 385, 335, 44], [280, 723, 68, 68]], top: 441, align: 'left', text: '社區有問題時，按這兩個按鈕都可以通報。' }, // top：貼在「新增通報」下面
                { boxes: [[12, 453, 351, 204]], top: 665, align: 'left', text: '社區的公告和活動會列在這裡，點選右上角可以查看全部。' }, // 亮「公告與動態」的標題＋第一張卡片（第二張被導覽列蓋住）
              ],
            },
            {
              role: 'committee',
              file: 'committee-home.jpg',
              alt: '管委會首頁',
              marks: [
                { boxes: [[313, 10, 44, 44]], zone: 'top', align: 'right', text: '有新通知時，鈴鐺上會有紅點。' },
                { boxes: [[12, 180, 351, 328]], top: 520, align: 'left', text: '等待你處理的事會列在這裡，點選右上角可以查看全部。' }, // top：貼在待辦區下面
                { boxes: [[20, 534, 162, 106]], top: 652, align: 'left', text: '交辦給管理人員的工作，可以在這裡看進度。' }, // 只有管委會有交辦進度
                { boxes: [[299, 731, 56, 56]], zone: 'bottom', align: 'right', text: '按這裡新增交辦、通報、公告等。' },
              ],
            },
            {
              role: 'staff',
              file: 'staff-home.jpg',
              alt: '管理人員首頁',
              marks: [
                { boxes: [[313, 10, 44, 44]], zone: 'top', align: 'right', text: '有新通知時，鈴鐺上會有紅點。' },
                { boxes: [[12, 180, 351, 328]], top: 520, align: 'left', text: '等待你處理的事會列在這裡，點選右上角可以查看全部。' }, // top：貼在待辦區下面
                { boxes: [[299, 731, 56, 56]], zone: 'bottom', align: 'right', text: '按這裡新增通報、公告等。' },
              ],
            },
          ],
        },
      ],
    },
  ],
  relatedArticles: ['notifications', 'resident-home', 'committee-home'],
}
