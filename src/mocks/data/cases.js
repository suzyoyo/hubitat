// 案件假資料：住戶的「通報」和管理端的「案件」是同一份資料
// 欄位說明：
//   id          案件編號，格式 CASE-日期-流水號
//   place       地點（簡短）        ┐ 住戶端顯示成「1F 大廳｜感應門故障」
//   subject     主旨（簡短）        ┘ 這兩項送出後不能修改
//   title       管理端顯示的標題，例如「B2 車道排水孔堵塞」
//   areaId      所在範圍（對應 community.js 的 areas）
//   category    問題分類（對應 community.js 的 ISSUE_CATEGORIES）
//   source      來源，見下方 CASE_SOURCES
//   isPrivate   是否保密。true：涉及住戶行為，只有管委會與管理人員看得到
//   reporterId  通報人（對應 users.js）。管委會、管理人員代住戶登記時，是登記的人
//   reporterUnit 代哪一戶登記：{ building: 'A', unit: '6樓之3' }（代登記時才有）
//               同一戶的住戶在「我的通報」都看得到這一筆
//   reportedAt  通報時間
//   description 通報人寫的問題描述
//   photos      照片或影片的檔名（欄位名稱沿用 photos，影片也放這裡，例如 '異音.mp4'）
//   status      狀態，見下方 CASE_STATUSES
//   （處理期限不存在案件上：用交辦的完成期限，由假 API 算，見 api/cases.js 的 caseDeadlineOf，2026-10-18）
//   scheduledAt 廠商預約到場的時間（派廠商、改期時選填，沒有就不寫）
//   firstVisitAt 廠商第一次到場的時間（假 API 依 scheduledAt 自動記，不用自己填）。這天起關聯設備算「維修中」
//   assigneeId  負責人（還沒指派就不寫）
//   vendorId    指派的廠商（還沒指派就不寫）
//   vendorName  名冊裡沒有、自己打的廠商名字（這時沒有 vendorId）
//   equipmentId 相關設備（沒有就不寫）
//   supporters  按了「我也遇到了」的住戶（附議）
//   logs        處理進度紀錄（由舊到新）
//                 at 時間 / actorId 誰做的（不寫代表系統，畫面顯示「好彼管家」）
//                 label 這一步的名稱 / text 管理端看到的說明
//                 residentText 住戶端看到的說明（不寫代表這一筆不給住戶看）
//                 note 備註小字（選填，例如住戶修改的內容、附上留存的備註）
//                 files 附上的照片、檔案的檔名（選填，例如快速留存歸到案件時，2026-10-18）
//   completion  完工紀錄：at 時間 / note 備註 / photos 照片（還沒完工就不寫）
//   rating      廠商評分：score 1～5 分 / comment 評語（還沒評就不寫）
//   closedAt    結案時間（還沒結案就不寫）

// 案件狀態：同一個狀態，管理端和住戶端顯示的文字不同
//   label         管委會、管理人員看到的
//   residentLabel 住戶看到的（住戶不需要知道那麼細）
//   isOpen        是否算「未結案」
export const CASE_STATUSES = {
  pending: { label: '待受理', residentLabel: '已收到', isOpen: true },
  // 2026-10-15：管理端也顯示「處理中」（和 in_progress 一樣）。資料的值不變，假 API 還是分得出「已受理、還沒派廠商」
  accepted: { label: '處理中', residentLabel: '處理中', isOpen: true },
  // 2026-10-15 改名（docs/case-flow.md）：施工中 → 處理中、待驗收 → 待結案
  in_progress: { label: '處理中', residentLabel: '處理中', isOpen: true },
  to_verify: { label: '待結案', residentLabel: '處理中', isOpen: true }, // 管理人員已完工驗收，等負責人結案
  closed: { label: '已結案', residentLabel: '已完成', isOpen: false },
}

// 案件來源
export const CASE_SOURCES = {
  resident: { label: '住戶通報' },
  staff: { label: '管理人員登記' },
  committee: { label: '委員登記' },
  patrol: { label: '巡查發現' },
}

// 公開或保密（住戶通報時選的「問題類型」）
//   label 和住戶新增通報用的 REPORT_TYPES（src/lib/report.js）同一組名稱（2026-10-18 統一，原本是「公共設施修繕／住戶違規」）
export const CASE_VISIBILITY = {
  public: { label: '公共設施問題', note: '公共區域・公開顯示' },
  private: { label: '涉及住戶行為', note: '僅你本人與管委會可見' },
}

export const cases = [
  // ── 未結案 ──────────────────────────────────────────────
  {
    id: 'CASE-20261028-001',
    place: 'A 棟 2F',
    subject: '水管漏水',
    title: 'A 棟 2F 水管漏水',
    areaId: 'area-a',
    category: 'plumbing',
    source: 'resident',
    isPrivate: false,
    reporterId: 'u-r02',
    reportedAt: '2026-10-28T07:00',
    description: '2 樓公共走廊靠茶水間的牆面一直滲水，地板已經積水，走過去容易滑倒。',
    photos: ['漏水牆面.jpg'],
    status: 'pending',
    supporters: [],
    logs: [
      {
        at: '2026-10-28T07:00',
        label: '住戶通報',
        text: '吳小姐（A 棟 2 樓）通報，附 1 張照片',
        residentText: '已收到，好彼管家已通知管理人員。',
      },
    ],
  },
  {
    id: 'CASE-20261022-003',
    place: 'B2 車道',
    subject: '排水孔堵塞',
    title: 'B2 車道排水孔堵塞',
    areaId: 'area-parking',
    category: 'leak',
    source: 'resident',
    isPrivate: false,
    reporterId: 'u-r03', // 2026-10-16 從陳先生改成周小姐（展示用：陳先生一開始沒有進行中的通報）
    reportedAt: '2026-10-22T10:12',
    description:
      '昨晚大雨後 B2 車道轉角入口處嚴重積水約 5 公分，排水溝孔蓋卡滿大量枯枝落葉，機車下坡轉彎時輪胎打滑十分危險。',
    photos: ['車道積水.jpg', '排水孔.jpg'],
    status: 'accepted',
    assigneeId: 'u-c04',
    supporters: ['u-r04', 'u-c03', 'u-c05'],
    logs: [
      {
        at: '2026-10-22T10:12',
        label: '住戶通報',
        text: '周小姐（A 棟 5 樓）通報，附 2 張照片',
        residentText: '已收到，好彼管家已通知管理人員。',
      },
      {
        at: '2026-10-23T09:30',
        actorId: 'u-c04',
        label: '已受理',
        text: '李主委受理',
        residentText: '管委會已受理。',
      },
      {
        at: '2026-10-24T15:00',
        actorId: 'u-s01',
        label: '處理紀錄',
        text: '已聯絡通管廠商（順達環保、安欣工程）安排現場查勘估價，現正等待報價單。',
        residentText: '已聯絡廠商安排現場查勘。',
      },
      { at: '2026-10-26T00:00', label: '逾期', text: '超過交辦的完成期限，已通知主責委員' },
    ],
  },
  {
    id: 'CASE-20261019-002',
    place: 'C 棟電梯',
    subject: '運轉異音',
    title: 'C 棟電梯異音檢修',
    areaId: 'area-c',
    category: 'equipment',
    source: 'resident',
    isPrivate: false,
    reporterId: 'u-r04',
    reportedAt: '2026-10-19T19:05',
    description: 'C 棟電梯上下樓時有明顯的金屬摩擦聲，到 4 樓附近特別大聲。',
    photos: [],
    status: 'to_verify',
    assigneeId: 'u-c02',
    vendorId: 'v-001',
    equipmentId: 'e-003',
    supporters: ['u-c03'],
    // 張管理員完工驗收的紀錄（和下面「完工驗收」那一筆處理紀錄同一個時間）
    completion: { at: '2026-10-22T16:30', note: '大同電梯修好了，現場測試運轉正常', photos: [] },
    logs: [
      {
        at: '2026-10-19T19:05',
        label: '住戶通報',
        text: '許先生（C 棟 4 樓）通報',
        residentText: '已收到，好彼管家已通知管理人員。',
      },
      {
        at: '2026-10-20T09:10',
        actorId: 'u-c02',
        label: '已受理',
        text: '張副主委受理，指派大同電梯檢修',
        residentText: '管委會已受理，已請電梯廠商檢修。',
      },
      {
        at: '2026-10-22T14:00',
        actorId: 'u-s02',
        label: '施工',
        text: '大同電梯到場檢修，更換導軌潤滑油並調整門機',
        residentText: '廠商已到場檢修。',
      },
      {
        at: '2026-10-22T16:30',
        actorId: 'u-s02',
        label: '完工驗收',
        text: '大同電梯修好了，現場測試運轉正常',
        residentText: '維修已完成，等待管委會結案。',
      },
    ],
  },
  {
    id: 'CASE-20261015-001',
    place: 'B 棟頂樓',
    subject: '防水層滲漏',
    title: 'B 棟頂樓防水施工',
    areaId: 'area-b',
    category: 'leak',
    source: 'patrol',
    isPrivate: false,
    reporterId: 'u-s01',
    reportedAt: '2026-10-15T10:00',
    description: '巡查發現 B 棟頂樓防水層多處龜裂，雨後 10 樓梯間天花板有水漬。',
    photos: ['頂樓龜裂.jpg', '梯間水漬.jpg'],
    status: 'in_progress',
    assigneeId: 'u-c04',
    vendorId: 'v-008',
    supporters: [],
    logs: [
      { at: '2026-10-15T10:00', actorId: 'u-s01', label: '巡查登記', text: '王總幹事巡查登記，附 2 張照片' },
      { at: '2026-10-16T11:20', actorId: 'u-c04', label: '已受理', text: '李主委受理，指派昇益工程行' },
      { at: '2026-10-21T08:30', actorId: 'u-s02', label: '施工', text: '昇益工程行進場，預計 10/28 完工' },
    ],
  },
  {
    id: 'CASE-20261027-002',
    place: '1F 中庭花園',
    subject: '照明感應器故障',
    title: '中庭照明感應器故障',
    areaId: 'area-outdoor',
    category: 'lighting',
    source: 'resident',
    isPrivate: false,
    reporterId: 'u-r03',
    reportedAt: '2026-10-27T20:15',
    description: '晚上經過中庭時感應燈不會亮，要走到很近才閃一下，長輩散步很危險。',
    photos: ['中庭夜間.jpg'],
    status: 'pending',
    equipmentId: 'e-007',
    supporters: [],
    logs: [
      {
        at: '2026-10-27T20:15',
        label: '住戶通報',
        text: '周小姐（A 棟 5 樓）通報，附 1 張照片',
        residentText: '已收到，好彼管家已通知管理人員。',
      },
    ],
  },
  {
    id: 'CASE-20261024-001',
    place: 'B 棟 5 樓',
    subject: '夜間噪音',
    title: 'B 棟 5 樓噪音問題',
    areaId: 'area-b',
    category: 'noise',
    source: 'resident',
    isPrivate: true,
    reporterId: 'u-r05', // 2026-10-16 從陳先生改成林小姐（同上）
    reportedAt: '2026-10-24T23:40',
    description: '樓下住戶連續幾晚半夜拖動家具、大聲播放音樂。',
    photos: [],
    status: 'accepted',
    assigneeId: 'u-c02',
    supporters: [],
    logs: [
      {
        at: '2026-10-24T23:40',
        label: '住戶通報',
        text: '林小姐（B 棟 6 樓）通報',
        residentText: '已收到通報，好彼管家已轉交管委會。',
      },
      {
        at: '2026-10-25T10:00',
        actorId: 'u-c02',
        label: '已受理',
        text: '張副主委受理，將先行勸導',
        residentText: '管委會已受理。',
      },
    ],
  },

  // 展示「我也遇到了」用（2026-10-19 013）：示範故事第 1 步陳先生選「B 棟・電梯／電梯口」時，會先看到這兩件
  // 地點要和新增通報選的一模一樣（電梯／電梯口）才找得到；不關聯設備，B 棟電梯的狀態才不會變
  // 交給張副主委：不是示範故事裡的人，不會多出李主委、張管理員的待辦
  {
    id: 'CASE-20261026-001',
    place: '電梯／電梯口',
    subject: '照明一閃一閃',
    title: 'B 棟電梯內照明閃爍',
    areaId: 'area-b',
    category: 'lighting',
    source: 'resident',
    isPrivate: false,
    reporterId: 'u-r05',
    reportedAt: '2026-10-26T19:10',
    description: '電梯裡的燈一直閃，晚上搭有點不舒服。',
    photos: [],
    status: 'accepted',
    assigneeId: 'u-c02',
    supporters: ['u-r03'],
    logs: [
      {
        at: '2026-10-26T19:10',
        label: '住戶通報',
        text: '林小姐（B 棟 6 樓）通報',
        residentText: '已收到，好彼管家已通知管理人員。',
      },
      {
        at: '2026-10-27T09:30',
        actorId: 'u-c02',
        label: '已受理',
        text: '張副主委受理，請管理室先檢查燈管',
        residentText: '管委會已受理。',
      },
    ],
  },
  {
    id: 'CASE-20261027-003',
    place: '電梯／電梯口',
    subject: '電梯口地磚翹起',
    title: 'B 棟 1 樓電梯口地磚翹起',
    areaId: 'area-b',
    category: 'other',
    source: 'resident',
    isPrivate: false,
    reporterId: 'u-r03',
    reportedAt: '2026-10-27T08:15',
    description: '1 樓電梯口有一塊地磚翹起來，推嬰兒車會卡到，長輩也容易絆倒。',
    photos: [],
    status: 'accepted',
    assigneeId: 'u-c02',
    supporters: [],
    logs: [
      {
        at: '2026-10-27T08:15',
        label: '住戶通報',
        text: '周小姐（A 棟 5 樓）通報',
        residentText: '已收到，好彼管家已通知管理人員。',
      },
      {
        at: '2026-10-27T10:00',
        actorId: 'u-c02',
        label: '已受理',
        text: '張副主委受理，先放警示牌，再請廠商報價',
        residentText: '管委會已受理。',
      },
    ],
  },

  // ── 原本是李先生自己通報的（2026-10-16 前三件改給鄰居，李先生只剩已結案的；展示時住戶首頁一開始是空狀態）─────
  {
    id: 'CASE-20261017-001',
    place: '1F 大廳',
    subject: '感應門故障',
    title: 'A 棟 1F 大廳感應門故障',
    areaId: 'area-a',
    category: 'door',
    source: 'resident',
    isPrivate: false,
    reporterId: 'u-r03', // 2026-10-16 從李先生改過來：展示時李先生的住戶首頁一開始是空狀態
    reportedAt: '2026-10-17T10:15',
    description: '進入大廳時，感應門偶爾不會自動開啟，需要用力推才會動，已持續約三天。',
    photos: ['門框.jpg'],
    status: 'accepted',
    assigneeId: 'u-s01',
    vendorId: 'v-005',
    supporters: ['u-r02'],
    logs: [
      {
        at: '2026-10-17T10:15',
        label: '住戶通報',
        text: '周小姐（A 棟 5 樓）通報，附 1 張照片',
        residentText: '已收到，好彼管家已通知管理人員。',
      },
      {
        at: '2026-10-19T09:00',
        actorId: 'u-s01',
        label: '已受理',
        text: '王總幹事受理',
        residentText: '管理人員已受理。',
      },
      {
        at: '2026-10-22T14:30',
        actorId: 'u-s01',
        label: '處理紀錄',
        text: '已通報原廠工程師排查線路，預計近日到場檢修。',
        residentText: '已通報原廠工程師排查線路，預計近日到場檢修。',
      },
    ],
  },
  {
    id: 'CASE-20261023-001',
    place: '1F 大廳',
    subject: '大廳燈光閃爍',
    title: 'A 棟 1F 大廳燈光閃爍',
    areaId: 'area-a',
    category: 'lighting',
    source: 'resident',
    isPrivate: false,
    reporterId: 'u-r03',
    reportedAt: '2026-10-23T18:20',
    description: '沙發區上方崁燈持續微弱閃爍，訪客休息時光線不適。',
    photos: [],
    status: 'pending',
    supporters: [],
    logs: [
      {
        at: '2026-10-23T18:20',
        label: '住戶通報',
        text: '周小姐（A 棟 5 樓）通報',
        residentText: '已收到，好彼管家已通知管理人員。',
      },
    ],
  },
  {
    id: 'CASE-20261022-001',
    place: '地下室 B2',
    subject: '電梯口燈不亮',
    title: 'B2 電梯口燈不亮',
    areaId: 'area-parking',
    category: 'lighting',
    source: 'resident',
    isPrivate: false,
    reporterId: 'u-r02', // 2026-10-16 從李先生改過來：展示時李先生的住戶首頁一開始是空狀態
    reportedAt: '2026-10-22T08:40',
    description: 'B2 電梯口靠車道側的燈不亮，晚上取車時很暗。',
    photos: [],
    status: 'pending',
    supporters: [],
    logs: [
      {
        at: '2026-10-22T09:30',
        actorId: 'u-s01',
        label: '住戶通報',
        text: '吳小姐（A 棟 2 樓）通報，總幹事已登記',
        residentText: '已收到通報，總幹事已登記並將巡檢更換燈泡。',
      },
    ],
  },
  {
    id: 'CASE-20261020-001',
    place: '頂樓花園',
    subject: '灑水噴頭漏水',
    title: '頂樓花園灑水噴頭漏水',
    areaId: 'area-outdoor',
    category: 'leak',
    source: 'resident',
    isPrivate: false,
    reporterId: 'u-r04', // 2026-10-16 從李先生改過來：展示時李先生的住戶首頁一開始是空狀態
    reportedAt: '2026-10-20T16:05',
    description: '頂樓花園東側的灑水噴頭一直滴水，地面有積水。',
    photos: ['噴頭.jpg'],
    status: 'accepted',
    assigneeId: 'u-s01',
    vendorId: 'v-003',
    supporters: [],
    logs: [
      {
        at: '2026-10-20T16:05',
        label: '住戶通報',
        text: '許先生（C 棟 4 樓）通報，附 1 張照片',
        residentText: '已收到，好彼管家已通知管理人員。',
      },
      {
        at: '2026-10-21T15:20',
        actorId: 'u-s01',
        label: '已受理',
        text: '王總幹事受理，立信水電行已初步查勘，待料更換止水閥',
        residentText: '水電廠商已初步查勘，待料更換止水閥。',
      },
    ],
  },

  // ── 已結案 ──────────────────────────────────────────────
  {
    id: 'CASE-20261005-001',
    place: '8F 住戶',
    subject: '夜間裝潢噪音',
    title: 'A 棟 8 樓夜間裝潢噪音',
    areaId: 'area-a',
    category: 'noise',
    source: 'resident',
    isPrivate: true,
    reporterId: 'u-c04',
    reportedAt: '2026-10-05T23:20',
    description: '深夜 11 點後隔壁仍在裝潢施工，連續三晚影響睡眠。',
    photos: [],
    status: 'closed',
    assigneeId: 'u-c02',
    supporters: [],
    logs: [
      {
        at: '2026-10-05T23:20',
        label: '住戶通報',
        text: '李先生（A 棟 8 樓）通報',
        residentText: '已收到通報，好彼管家已轉交管委會。',
      },
      { at: '2026-10-06T10:00', actorId: 'u-c02', label: '已受理', text: '張副主委受理', residentText: '管委會已受理。' },
      {
        at: '2026-10-07T14:00',
        actorId: 'u-c02',
        label: '處理紀錄',
        text: '已聯繫相關住戶並說明規約第 18 條',
        residentText: '管委會已聯繫相關住戶，持續追蹤。',
      },
      {
        at: '2026-10-09T11:00',
        actorId: 'u-c02',
        label: '已結案',
        text: '該住戶已調整施工時間，結案',
        residentText: '該住戶已調整施工時間，本案結案。',
      },
    ],
    closedAt: '2026-10-09T11:00',
  },
  {
    id: 'CASE-20260929-001',
    place: '停車場 B1',
    subject: '車道反光鏡歪斜',
    title: 'B1 車道反光鏡歪斜',
    areaId: 'area-parking',
    category: 'other',
    source: 'resident',
    isPrivate: false,
    reporterId: 'u-c04',
    reportedAt: '2026-09-29T18:30',
    description: 'B1 車道轉彎處的反光鏡角度歪掉，看不到對向來車。',
    photos: [],
    status: 'closed',
    assigneeId: 'u-s02',
    supporters: [],
    logs: [
      {
        at: '2026-09-29T18:30',
        label: '住戶通報',
        text: '李先生（A 棟 8 樓）通報',
        residentText: '已收到，好彼管家已通知管理人員。',
      },
      {
        at: '2026-10-01T10:10',
        actorId: 'u-s02',
        label: '已結案',
        text: '張管理員已重新固定反光鏡並確認角度',
        residentText: '管理人員已重新固定反光鏡並確認角度。',
      },
    ],
    completion: { at: '2026-10-01T10:10', note: '已重新固定並確認角度', photos: ['反光鏡完成.jpg'] },
    closedAt: '2026-10-01T10:10',
  },
  {
    id: 'CASE-20261012-001',
    place: 'C 棟信箱區',
    subject: '信箱門片損壞',
    title: 'C 棟信箱損壞更換',
    areaId: 'area-c',
    category: 'door',
    source: 'staff',
    isPrivate: false,
    reporterId: 'u-s03',
    reportedAt: '2026-10-12T09:00',
    description: '住戶臨櫃反映 C 棟 3 樓之 2 信箱門片鉸鏈斷裂，無法上鎖。',
    photos: ['信箱.jpg'],
    status: 'closed',
    assigneeId: 'u-s02',
    vendorId: 'v-013',
    supporters: [],
    logs: [
      { at: '2026-10-12T09:00', actorId: 'u-s03', label: '管理人員登記', text: '黃警衛代住戶登記，附 1 張照片' },
      { at: '2026-10-13T10:00', actorId: 'u-s02', label: '已受理', text: '張管理員受理，聯絡金城五金' },
      { at: '2026-10-17T15:30', actorId: 'u-s02', label: '已結案', text: '金城五金更換門片與鎖頭，測試正常' },
    ],
    completion: { at: '2026-10-17T15:30', note: '已更換門片與鎖頭', photos: ['施工前.jpg', '施工後.jpg'] },
    rating: { score: 4, comment: '到場準時，施工俐落' },
    closedAt: '2026-10-17T15:30',
  },

  // ── 大同電梯過去處理的報修（用來計算廠商的平均修復時間）──────
  {
    id: 'CASE-20260727-001',
    place: 'A 棟電梯',
    subject: '運轉抖動',
    title: 'A 棟電梯運轉抖動',
    areaId: 'area-a',
    category: 'equipment',
    source: 'resident',
    isPrivate: false,
    reporterId: 'u-r02',
    reportedAt: '2026-07-27T08:20',
    description: '電梯上升時明顯抖動，並有異常聲響。',
    photos: [],
    status: 'closed',
    assigneeId: 'u-c04',
    vendorId: 'v-001',
    equipmentId: 'e-001',
    supporters: ['u-r03'],
    logs: [
      { at: '2026-07-27T08:20', label: '住戶通報', text: '吳小姐（A 棟 2 樓）通報', residentText: '已收到，好彼管家已通知管理人員。' },
      { at: '2026-07-29T17:00', actorId: 'u-s01', label: '已結案', text: '大同電梯更換曳引機鋼索', residentText: '廠商已更換零件，恢復正常。' },
    ],
    completion: { at: '2026-07-29T17:00', note: '更換曳引機鋼索', photos: [] },
    rating: { score: 5, comment: '隔天就到場，處理迅速' },
    closedAt: '2026-07-29T17:00',
  },
  {
    id: 'CASE-20260707-001',
    place: 'B 棟電梯',
    subject: '門機異音',
    title: 'B 棟電梯門機異音',
    areaId: 'area-b',
    category: 'equipment',
    source: 'resident',
    isPrivate: false,
    reporterId: 'u-r01',
    reportedAt: '2026-07-07T12:00',
    description: '電梯門開關時有刮擦聲。',
    photos: [],
    status: 'closed',
    assigneeId: 'u-c04',
    vendorId: 'v-001',
    equipmentId: 'e-002',
    supporters: [],
    logs: [
      { at: '2026-07-07T12:00', label: '住戶通報', text: '陳先生（B 棟 8 樓）通報', residentText: '已收到，好彼管家已通知管理人員。' },
      { at: '2026-07-09T15:00', actorId: 'u-s01', label: '已結案', text: '大同電梯調整門機並潤滑', residentText: '廠商已檢修完成。' },
    ],
    completion: { at: '2026-07-09T15:00', note: '門機異音檢修', photos: [] },
    rating: { score: 4, comment: '' },
    closedAt: '2026-07-09T15:00',
  },
  {
    id: 'CASE-20260408-001',
    place: 'A 棟電梯',
    subject: '車廂門感應不良',
    title: 'A 棟電梯車廂門感應不良',
    areaId: 'area-a',
    category: 'equipment',
    source: 'staff',
    isPrivate: false,
    reporterId: 'u-s02',
    reportedAt: '2026-04-08T09:30',
    description: '住戶反映電梯門會夾到人，感應器反應慢。',
    photos: [],
    status: 'closed',
    assigneeId: 'u-c04',
    vendorId: 'v-001',
    equipmentId: 'e-001',
    supporters: [],
    logs: [
      { at: '2026-04-08T09:30', actorId: 'u-s02', label: '管理人員登記', text: '張管理員代住戶登記' },
      { at: '2026-04-11T11:00', actorId: 'u-s01', label: '已結案', text: '大同電梯更換車廂門感應器' },
    ],
    completion: { at: '2026-04-11T11:00', note: '車廂門感應器維修', photos: [] },
    rating: { score: 4, comment: '' },
    closedAt: '2026-04-11T11:00',
  },
  {
    id: 'CASE-20260213-001',
    place: 'C 棟電梯',
    subject: '樓層按鈕失靈',
    title: 'C 棟電梯樓層按鈕失靈',
    areaId: 'area-c',
    category: 'equipment',
    source: 'resident',
    isPrivate: false,
    reporterId: 'u-r04',
    reportedAt: '2026-02-13T14:00',
    description: '6 樓按鈕按了沒反應。',
    photos: [],
    status: 'closed',
    assigneeId: 'u-c04',
    vendorId: 'v-001',
    equipmentId: 'e-003',
    supporters: [],
    logs: [
      { at: '2026-02-13T14:00', label: '住戶通報', text: '許先生（C 棟 4 樓）通報', residentText: '已收到，好彼管家已通知管理人員。' },
      { at: '2026-02-16T16:00', actorId: 'u-s01', label: '已結案', text: '大同電梯更換按鈕面板', residentText: '廠商已更換按鈕面板。' },
    ],
    completion: { at: '2026-02-16T16:00', note: '更換樓層按鈕面板', photos: [] },
    rating: { score: 5, comment: '' },
    closedAt: '2026-02-16T16:00',
  },
]
