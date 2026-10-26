// 三端的新手導覽步驟（app/HomeTour.vue）：首頁和「我的」頁共用同一份，步驟編號才接得起來
//   target 對到畫面上的 data-tour：鈴鐺在 AppHeader；「＋」fab、分頁 tab-○○、住戶的「通報」在 BottomNav；help 在「我的」；其他在首頁
//   page：這一步在哪一頁（不寫就是首頁）；tap：點亮起來的地方也算下一步（「我的」分頁，點了就切過去）
//   用敘述的口氣，講清楚這裡能做什麼、看得到什麼；動詞換著用，不要每句都是「可以」；\n 是換行（2026-10-22 013）

// 最後兩步三端一樣：亮「我的」分頁時請他點進去，再亮「使用說明」（大家都不知道有使用手冊，2026-10-26 013）
const TO_ME = '\n還有其他問題嗎？點「我的」看看。'
const HELP_STEP = { target: 'help', page: 'me', text: '遇到任何操作問題時，點擊「使用說明」，\n裡面有教學和常見問題。' }

export const TOUR_STEPS = {
  resident: [
    { target: 'bell', text: '有新通知時，鈴鐺上會出現紅點，點進去就能看到所有通知。' },
    { target: 'new-report', text: '社區有問題時，按這兩個按鈕都能通報。', place: 'below' }, // 說明框夾在兩個按鈕中間（放不下時導覽會先往上捲）
    { target: 'notices', text: '社區的公告和活動會列在這裡，點「看全部」查看所有公告。', merge: true },
    { target: 'tab-home', text: '「首頁」隨時掌握你通報的處理進度和最新公告。' },
    { target: 'tab-files', text: '「社區」收錄社區的大小事，像是管委會報告、社區規約和設備維修紀錄。' },
    // 「我的留言」藏在「我的」裡面比較難找，特別寫出來
    { target: 'tab-me', tap: true, text: '「我的」管理個人資料和各種設定，\n你給管委會的留言和回覆也在這裡。' + TO_ME },
    HELP_STEP,
  ],
  committee: [
    { target: 'bell', text: '有新通知時，鈴鐺上會出現紅點，點進去就能看到所有通知。' },
    { target: 'todos', text: '等你處理的事會列在這裡，點右上角查看全部待辦。' },
    { target: 'shortcuts', text: '「交辦進度」追蹤交辦給管理人員的工作，\n「提案與簽核」處理委員之間的提案。' },
    { target: 'fab', text: '按「＋」新增交辦、通報、公告，或快速留存單據照片。' },
    { target: 'tab-home', text: '「首頁」一眼看到你的待辦、住戶意見和最新公告。' },
    { target: 'tab-cases', text: '「案件」列出所有住戶通報，處理進度一目了然。' },
    { target: 'tab-vendors', text: '「廠商」有廠商名冊、緊急聯絡電話和社區的鑰匙清單。' },
    { target: 'tab-files', text: '「社區」收錄社區的大小事，像是會議紀錄、規約、合約和設備清冊。' },
    { target: 'tab-me', tap: true, text: '「我的」管理個人資料和各種設定，\n管委會的換屆交接也在這裡。' + TO_ME },
    HELP_STEP,
  ],
  staff: [
    { target: 'bell', text: '有新通知時，鈴鐺上會出現紅點，點進去就能看到所有通知。' },
    { target: 'todos', text: '等你處理的事會列在這裡，點右上角查看全部待辦。' },
    { target: 'fab', text: '按「＋」新增通報、發布公告，或快速留存單據照片。' },
    { target: 'tab-home', text: '「首頁」一眼看到你的待辦和最新公告。' },
    { target: 'tab-cases', text: '「案件」列出所有住戶通報，處理進度一目了然。' },
    { target: 'tab-vendors', text: '「廠商」有廠商名冊、緊急聯絡電話和社區的鑰匙清單。' },
    { target: 'tab-files', text: '「社區」收錄社區的大小事，像是會議紀錄、規約和設備清冊。' },
    { target: 'tab-me', tap: true, text: '「我的」調整個人資料、字體大小和通知設定。' + TO_ME },
    HELP_STEP,
  ],
}
