// 幫使用手冊截 App 的畫面（用 Playwright 開一個看不見的瀏覽器，照清單一張一張截）
//   全部重截：npm run shoot:help
//   只截幾張：npm run shoot:help -- resident-home case-pending（檔名，不用打 .jpg）
// 截圖存到 help/src/assets/screenshots/，尺寸是手機 375×812、2 倍解析度
// 每一張都會重新打開網頁，所以假資料每次都是原本的樣子，互不影響
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { createServer } from 'vite'

const helpDir = join(dirname(fileURLToPath(import.meta.url)), '..')
const rootDir = join(helpDir, '..')
const outDir = join(helpDir, 'src', 'assets', 'screenshots')
mkdirSync(outDir, { recursive: true })

const CHEN = 'u-r01' // 不是委員的示範住戶陳先生；沒寫的用預設的李先生

// ── 小工具 ──
// 點畫面上「文字剛好是這樣」的按鈕
const tap = (page, text) => page.getByRole('button', { name: text, exact: true }).first().click()
const wait = (page, ms = 700) => page.waitForTimeout(ms)
// 把某段文字捲到畫面上方附近（offset：離畫面頂端多遠）
async function scrollTo(page, text, offset = 80) {
  const el = page.getByText(text, { exact: true }).first()
  await el.scrollIntoViewIfNeeded()
  const box = await el.boundingBox()
  await page.mouse.wheel(0, box.y - offset)
  await wait(page, 500)
}
// 只截到某段文字的上面（用來避開字體大小設定、QR Code 這類手冊不寫的東西）
async function clipAbove(page, text) {
  const box = await page.getByText(text, { exact: true }).first().boundingBox()
  return { x: 0, y: 0, width: 375, height: Math.round(box.y - 12) }
}

// 截圖前先調整瀏覽器裡的假資料（只改這次打開的網頁，不會改到程式）
// 示範資料刻意讓李先生一開始沒有通報、通知全部已讀（現場展示用），
// 但手冊要看得到通報卡片和未讀的紅點，所以截住戶畫面前先改一下
async function stageResident(page) {
  await page.evaluate(async () => {
    const { cases } = await import('/src/mocks/data/cases.js')
    const { notifications } = await import('/src/mocks/data/notifications.js')
    for (const id of ['CASE-20261022-003', 'CASE-20261028-001']) cases.find((c) => c.id === id).reporterId = 'u-c04'
    for (const id of ['n-001', 'n-003']) notifications.find((n) => n.id === id).read = false
  })
}

// 管委會、管理人員也一樣：通知假資料全部已讀，首頁的鈴鐺沒有紅點
// 「認識 App 首頁」要介紹紅點，所以各改一則成未讀（2026-10-19 加）
async function stageUnread(page) {
  await page.evaluate(async () => {
    const { notifications } = await import('/src/mocks/data/notifications.js')
    for (const id of ['n-106', 'n-201']) notifications.find((n) => n.id === id).read = false
  })
}

// 新增通報：一路做到第 step 步（A 棟 → 1F 大廳，這裡有別人通報過的問題）
async function reportUntil(page, step) {
  await tap(page, 'A 棟')
  await tap(page, '1F 大廳')
  if (step === 1) return
  await tap(page, '下一步')
  await wait(page, 900)
  if (step === 2) return
  await page.getByRole('button', { name: /都不是/ }).click()
  await wait(page)
  await page.getByText('公共設施問題', { exact: true }).click()
  if (step === 3) return
  await tap(page, '下一步')
  await wait(page)
  await page.locator('#report-subject').fill('信箱的門關不起來')
  await page.locator('#report-description').fill('3 號信箱的門歪掉了，關上又會自己彈開。')
  if (step === 4) return
  await tap(page, '下一步：確認資料')
  await wait(page)
  if (step === 5) return
  await tap(page, '送出通報')
  await wait(page, 1200)
}

// ── 截圖清單 ──
// file：檔名；path：網址；resident：示範住戶；stage：先調整假資料；run：打開後要做的動作；clip：只截一部分
const SHOTS = [
  // 住戶
  { file: 'resident-home', path: '/resident/home', stage: stageResident },
  { file: 'resident-reports', path: '/resident/reports', stage: stageResident },
  { file: 'resident-report-detail', path: '/resident/reports/CASE-20261022-003', stage: stageResident },
  {
    file: 'resident-report-edit', path: '/resident/reports/CASE-20261028-001', stage: stageResident,
    run: async (page) => {
      await page.locator('#report-description').fill('今天早上積水更多了，靠近樓梯那邊也開始滴水。')
      await scrollTo(page, '處理進度', 70)
    },
  },
  { file: 'resident-announcements', path: '/resident/announcements' },
  {
    file: 'resident-announcement-detail', path: '/resident/announcements',
    run: async (page) => {
      await page.getByText('查看詳情').first().click()
      await wait(page)
    },
  },
  { file: 'resident-meeting-summary', path: '/resident/meetings/m-2026-03', run: (page) => scrollTo(page, '重點摘要', 70) },
  {
    file: 'resident-meeting-search', path: '/resident/meetings/m-2026-03',
    run: async (page) => {
      await page.getByRole('tab', { name: '全文記錄' }).click()
      await wait(page)
      await page.getByRole('searchbox').or(page.getByPlaceholder(/搜尋/)).first().fill('電梯')
      await wait(page)
      await scrollTo(page, '全文記錄', 70)
    },
  },
  {
    file: 'resident-meeting-comment', path: '/resident/meetings/m-2026-03',
    run: async (page) => {
      await scrollTo(page, '重點摘要', 70) // 先捲過「下載」按鈕（手冊不寫下載）
      await page.getByRole('button', { name: '留言' }).last().click()
      await wait(page, 900)
    },
  },
  { file: 'resident-my-comments', path: '/resident/me/comments' },
  { file: 'resident-notifications', path: '/resident/notifications', stage: stageResident },
  { file: 'resident-me', path: '/resident/me', resident: CHEN, clip: (page) => clipAbove(page, '顯示設定') },
  { file: 'resident-me-committee', path: '/resident/me', clip: (page) => clipAbove(page, '顯示設定') },
  { file: 'join-code', path: '/resident/me/join', resident: CHEN, clip: (page) => clipAbove(page, '或掃描 QR Code') },
  {
    file: 'join-confirm', path: '/resident/me/join', resident: CHEN,
    run: async (page) => {
      await page.getByPlaceholder(/6 位數字/).fill('482913')
      await wait(page, 1500)
    },
  },
  { file: 'report-step1', path: '/resident/reports/new', run: (page) => reportUntil(page, 1) },
  {
    file: 'report-step1-other', path: '/resident/reports/new',
    run: async (page) => {
      await tap(page, 'A 棟')
      await tap(page, '其他')
      await page.getByLabel('其他地點').fill('5 樓住戶門口')
      await scrollTo(page, 'A 棟', 90)
    },
  },
  { file: 'report-step2', path: '/resident/reports/new', run: (page) => reportUntil(page, 2) },
  { file: 'report-step3', path: '/resident/reports/new', run: (page) => reportUntil(page, 3) },
  { file: 'report-step4', path: '/resident/reports/new', run: (page) => reportUntil(page, 4) },
  { file: 'report-step5', path: '/resident/reports/new', run: (page) => reportUntil(page, 5) },
  { file: 'report-submitted', path: '/resident/reports/new', run: (page) => reportUntil(page, 6) },
  {
    file: 'report-supported', path: '/resident/reports/new',
    run: async (page) => {
      await reportUntil(page, 2)
      await tap(page, '我也遇到了')
      await wait(page, 1200)
    },
  },
  // 管委會
  { file: 'committee-home', path: '/committee/home', stage: stageUnread },
  {
    file: 'committee-fab-menu', path: '/committee/home',
    run: (page) => page.getByRole('button', { name: /新增/ }).last().click(),
  },
  { file: 'committee-todos', path: '/committee/todos' },
  { file: 'committee-cases', path: '/committee/cases' },
  { file: 'case-pending', path: '/committee/cases/CASE-20261028-001' },
  { file: 'case-processing', path: '/committee/cases/CASE-20261015-001' },
  { file: 'case-to-verify', path: '/committee/cases/CASE-20261019-002' },
  { file: 'case-log-form', path: '/committee/cases/CASE-20261015-001', run: (page) => scrollTo(page, '處理進度與留痕', 70) },
  {
    file: 'case-vendor', path: '/committee/cases/CASE-20261015-001',
    run: async (page) => {
      await scrollTo(page, '廠商', 70)
      // 清掉原本的廠商，打開名冊清單
      const input = page.getByPlaceholder('從名冊選，或輸入其他廠商名稱')
      await input.fill('')
      await input.click()
    },
  },
  {
    file: 'case-equipment', path: '/committee/cases/CASE-20261015-001',
    run: async (page) => {
      await scrollTo(page, '關聯設備', 70)
      await page.getByPlaceholder('選擇或搜尋設備').click()
    },
  },
  { file: 'case-assign', path: '/committee/tasks/new?caseId=CASE-20261028-001' },
  { file: 'case-complete', path: '/committee/cases/CASE-20261015-001/complete' },
  { file: 'case-close', path: '/committee/cases/CASE-20261019-002/close' },
  { file: 'committee-tasks', path: '/committee/tasks' },
  { file: 'committee-new-repair', path: '/committee/cases/new' },
  { file: 'committee-announcement-detail', path: '/committee/announcements/an-001' },
  { file: 'committee-announcement-form', path: '/committee/announcements/new' },
  { file: 'committee-vendors', path: '/committee/vendors' },
  { file: 'committee-vendor-list', path: '/committee/vendors/list' },
  { file: 'committee-vendor-detail', path: '/committee/vendors/v-001' },
  { file: 'committee-contracts', path: '/committee/contracts' },
  { file: 'committee-equipment-list', path: '/committee/equipment' },
  { file: 'committee-equipment-detail', path: '/committee/equipment/e-001', run: (page) => scrollTo(page, '保養', 70) },
  { file: 'committee-urgent-log', path: '/committee/me/urgent-log' },
  // 2026-10-19 加：「換畫面才放圖」補的
  {
    file: 'committee-announcement-notify', path: '/committee/announcements/new',
    run: async (page) => {
      await page.getByText('施工', { exact: true }).first().click() // 施工、維護才有「推播通知」
      await wait(page)
      await scrollTo(page, '標示為緊急', 90)
    },
  },
  {
    file: 'committee-announcement-withdraw', path: '/committee/announcements/an-001',
    run: async (page) => {
      await tap(page, '撤回公告')
      await wait(page)
    },
  },
  {
    file: 'case-return', path: '/committee/cases/CASE-20261019-002',
    run: async (page) => {
      await tap(page, '退回')
      await page.getByRole('dialog').locator('textarea, input').first().fill('門把還是會鬆，請再確認一次')
    },
  },
  // 快速留存（2026-10-19 加）
  {
    file: 'quick-save-form', path: '/committee/quick-saves/new',
    run: async (page) => {
      await page.locator('#quick-save-name').fill('電梯保養單 10/01')
      await page.locator('#quick-save-note').fill('保養廠商現場給的單據，之後歸到電梯的案件')
    },
  },
  { file: 'quick-save-detail', path: '/committee/quick-saves/qs-003' }, // 李主委還沒補齊的「中庭植栽報價單」
  { file: 'committee-contract-detail', path: '/committee/contracts/ct-001', clip: (page) => clipAbove(page, '下載 PDF') },
  { file: 'committee-task-detail', path: '/committee/tasks/TASK-104' }, // 對方已回報、待我確認
  { file: 'resident-report-progress', path: '/resident/reports/CASE-20261022-003', stage: stageResident, run: (page) => scrollTo(page, '處理進度', 70) },
  // 管理人員
  { file: 'staff-home', path: '/staff/home', stage: stageUnread },
  { file: 'staff-task-detail', path: '/staff/tasks/TASK-099' },
  {
    file: 'staff-task-report', path: '/staff/tasks/TASK-099/report',
    run: (page) => page.locator('#report-note').fill('各棟滅火器都檢查完了，過期的 3 支已列清單。'),
  },
  // 文章最後「完成了！」那一頁的截圖（做完動作後的畫面，2026-10-19 加）
  {
    file: 'done-join-accepted', path: '/resident/me/join', resident: CHEN,
    run: async (page) => {
      await page.getByPlaceholder(/6 位數字/).fill('482913')
      await wait(page, 1500)
      await tap(page, '接受邀請')
      await wait(page, 1200)
    },
  },
  {
    file: 'done-report-edit', path: '/resident/reports/CASE-20261028-001', stage: stageResident,
    run: async (page) => {
      await page.locator('#report-description').fill('今天早上積水更多了，靠近樓梯那邊也開始滴水。')
      await tap(page, '送出補充')
      await wait(page, 900)
    },
  },
  {
    file: 'done-case-accepted', path: '/committee/cases/CASE-20261028-001',
    run: async (page) => {
      await tap(page, '受理')
      await wait(page, 900)
    },
  },
  {
    // 先受理、再交辦給張管理員（交辦完會回到案件詳情）
    file: 'done-case-assigned', path: '/committee/cases/CASE-20261028-001',
    run: async (page) => {
      await tap(page, '受理')
      await wait(page, 900)
      await tap(page, '交辦')
      await wait(page, 900)
      await page.locator('#task-title').fill('聯繫水電廠商處理漏水')
      await page.locator('#task-assignee').fill('張管理員')
      await wait(page, 400)
      await page.getByText('張管理員').first().click()
      await tap(page, '確認新增')
      await wait(page, 1200)
    },
  },
  {
    file: 'done-case-equipment', path: '/committee/cases/CASE-20261015-001',
    run: async (page) => {
      await scrollTo(page, '關聯設備', 70)
      await page.getByPlaceholder('選擇或搜尋設備').click()
      await page.getByRole('option').first().click()
      await wait(page)
      await tap(page, '更新進度') // 存起來才會出現「查看設備」
      await wait(page, 900)
      await scrollTo(page, '關聯設備', 70)
    },
  },
  {
    file: 'done-case-updated', path: '/committee/cases/CASE-20261015-001',
    run: async (page) => {
      await scrollTo(page, '處理進度與留痕', 70)
      await page.locator('#log-resident').fill('廠商 10/5 再來處理')
      await page.getByPlaceholder('例：零件調貨中').fill('零件調貨中，廠商約 10/5 再來更換')
      await tap(page, '更新進度')
      await wait(page, 900)
    },
  },
  {
    file: 'done-case-returned', path: '/committee/cases/CASE-20261019-002',
    run: async (page) => {
      await tap(page, '退回')
      await page.getByRole('dialog').locator('textarea, input').first().fill('門把還是會鬆，請再確認一次')
      await tap(page, '確認退回')
      await wait(page, 900)
    },
  },
  {
    file: 'done-case-closed', path: '/committee/cases/CASE-20261019-002/close',
    run: async (page) => {
      await tap(page, '結案')
      await wait(page, 1200)
    },
  },
  {
    // 從首頁按「＋」進來，留存後才會回到首頁（直接打網址進來也會回首頁，這樣比較像真的操作）
    file: 'done-quick-save', path: '/committee/home',
    run: async (page) => {
      await page.getByRole('button', { name: /新增/ }).last().click()
      await wait(page)
      await page.getByText('快速留存', { exact: true }).click()
      await wait(page, 900)
      await page.locator('#quick-save-name').fill('電梯保養單 10/01')
      await tap(page, '留存')
      await wait(page, 1200)
    },
  },
  {
    file: 'done-task-reported', path: '/staff/tasks/TASK-099/report',
    run: async (page) => {
      await page.locator('#report-note').fill('各棟滅火器都檢查完了，過期的 3 支已列清單。')
      await tap(page, '回報')
      await tap(page, '確認回報')
      await wait(page, 1200)
    },
  },
]

// ── 開始截圖 ──
const only = process.argv.slice(2)
const list = only.length ? SHOTS.filter((s) => only.includes(s.file)) : SHOTS
if (only.length && list.length !== only.length) console.warn('⚠️ 有檔名不在清單裡：', only.filter((f) => !SHOTS.some((s) => s.file === f)))

// 自己開一個 App 的開發伺服器，截完就關掉
const server = await createServer({ configFile: join(rootDir, 'vite.config.js'), root: rootDir, server: { port: 5198, strictPort: false } })
await server.listen()
const base = server.resolvedUrls.local[0].replace(/\/$/, '')

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true })

// 暖機：第一次打開時 Vite 會先整理套件、自動重新整理，等它穩定
{
  const warm = await context.newPage()
  await warm.goto(base + '/resident/home')
  await warm.waitForTimeout(4000)
  await warm.close()
}

let failed = 0
for (const shot of list) {
  const page = await context.newPage()
  try {
    // 先設好示範住戶，再打開要截的那一頁
    // 「開啟通知」提醒卡設成這次已按過「先不要」，截圖裡不會出現
    await page.addInitScript((id) => {
      localStorage.setItem('hubitat-demo-resident', id)
      sessionStorage.setItem('notification-reminder-dismissed', '1')
      // 首頁導覽（app/HomeTour.vue）當作看過了，不然首頁會被遮罩和說明框蓋住
      localStorage.setItem('hubitat-tour-resident', 'done')
      localStorage.setItem('hubitat-tour-committee', 'done')
      localStorage.setItem('hubitat-tour-staff', 'done')
    }, shot.resident ?? 'u-c04')
    if (shot.stage) {
      // 先開一個不讀資料的頁面、改好假資料，再用 App 自己的換頁（不重新整理，改過的資料才會留著）
      await page.goto(base + '/')
      await page.waitForLoadState('networkidle')
      await shot.stage(page)
      await page.evaluate((path) => document.querySelector('#app').__vue_app__.config.globalProperties.$router.push(path), shot.path)
    } else {
      await page.goto(base + shot.path)
    }
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(900) // 假 API 會延遲 400ms
    if (shot.run) {
      await shot.run(page)
      await page.waitForTimeout(700)
    }
    const clip = shot.clip ? await shot.clip(page) : undefined
    await page.screenshot({ path: join(outDir, shot.file + '.jpg'), type: 'jpeg', quality: 82, clip })
    console.log('✅', shot.file)
  } catch (err) {
    failed++
    console.log('❌', shot.file, err.message.split('\n')[0])
  }
  await page.close()
}

await browser.close()
await server.close()
console.log(failed ? `\n${failed} 張失敗` : `\n全部 ${list.length} 張完成`)
process.exit(failed ? 1 : 0)
