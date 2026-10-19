// 使用手冊網站的自動檢查（用 Playwright 開一個看不見的瀏覽器，實際點點看）
//   執行：npm run test:help
// 會檢查：
//   1. 320、375、768、1024、1440 五種寬度，每一頁都沒有水平捲軸
//   2. 每一篇文章都打得開，頁面上的文章連結都不會連到不存在的教學
//   3. 可以點的按鈕、連結高度至少 44px（文字段落裡的連結除外）
//   4. 鍵盤：Tab 第一個是「跳到主要內容」、抽屜按 Esc 會關、常見問題可以用鍵盤展開、截圖放大可以用 Esc 關
//   5. 搜尋、身分篩選、逐步教學的「下一步」
// 加上 --shots 會把每種寬度的首頁和文章頁截圖存到 help/test-results/（不會 commit）
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { createServer } from 'vite'

const helpDir = join(dirname(fileURLToPath(import.meta.url)), '..')
const takeShots = process.argv.includes('--shots')
const outDir = join(helpDir, 'test-results')
if (takeShots) mkdirSync(outDir, { recursive: true })

// 自己開一個開發伺服器，檢查完就關掉
const server = await createServer({ configFile: join(helpDir, 'vite.config.js'), server: { port: 5199, strictPort: false } })
await server.listen()
const base = server.resolvedUrls.local[0].replace(/\/$/, '')

const browser = await chromium.launch()

// 暖機：第一次打開時 Vite 會先整理套件、自動重新整理一次，等它穩定再開始檢查
{
  const warm = await browser.newPage()
  for (let i = 0; i < 5; i++) {
    try {
      await warm.goto(base + '/')
      await warm.waitForSelector('main h1', { state: 'attached', timeout: 10000 })
      await warm.waitForTimeout(1500)
      break
    } catch {
      // 再試一次
    }
  }
  await warm.close()
}

const problems = []
const fail = (text) => problems.push(text)

const WIDTHS = [320, 375, 768, 1024, 1440]
const PAGES = ['/', '/about', '/start', '/resident', '/committee', '/staff', '/faq', '/contact', '/search', '/search?q=通報', '/search?q=找不到的字xyz', '/articles/new-report', '/articles/case-flow', '/articles/app-screen', '/articles/what-is', '/articles/不存在', '/不存在的頁面']

// ── 1. 各種寬度沒有水平捲軸、按鈕夠大 ──
for (const width of WIDTHS) {
  const page = await browser.newPage({ viewport: { width, height: 900 } })
  for (const path of PAGES) {
    await page.goto(base + encodeURI(path))
    await page.waitForSelector('main h1', { state: 'attached' })
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    if (overflow > 0) fail(`${width}px ${path}：水平溢出 ${overflow}px`)

    // 太小的點擊目標（看得到的按鈕和連結；段落文字裡的連結不算）
    const small = await page.evaluate(() =>
      [...document.querySelectorAll('a, button, summary, input')]
        .filter((el) => {
          const r = el.getBoundingClientRect()
          if (r.width === 0 || r.height === 0) return false
          if (el.closest('p') && el.tagName === 'A') return false // 句子裡的文字連結
          if (el.classList.contains('sr-only')) return false
          return r.height < 43.5 || r.width < 43.5
        })
        .map((el) => `${el.tagName.toLowerCase()}「${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 12)}」${Math.round(el.getBoundingClientRect().width)}×${Math.round(el.getBoundingClientRect().height)}`),
    )
    if (small.length) fail(`${width}px ${path}：點擊目標小於 44px：${[...new Set(small)].join('、')}`)

    if (takeShots && ['/', '/articles/new-report'].includes(path)) {
      await page.screenshot({ path: join(outDir, `${width}${path.replaceAll('/', '_') || '_home'}.png`), fullPage: true })
    }
  }
  await page.close()
}

// ── 2. 所有文章打得開、連結都存在 ──
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto(base + '/resident')
const articleLinks = new Set()
for (const roleId of ['resident', 'committee', 'staff']) {
  await page.goto(`${base}/${roleId}`)
  await page.waitForSelector('main h1')
  for (const href of await page.$$eval('main a[href^="/articles/"]', (as) => as.map((a) => a.getAttribute('href')))) articleLinks.add(href)
}
for (const path of ['/about', '/start']) {
  await page.goto(base + path)
  await page.waitForSelector('main h1')
  for (const href of await page.$$eval('main a[href^="/articles/"]', (as) => as.map((a) => a.getAttribute('href')))) articleLinks.add(href)
}
const visited = new Set()
const queue = [...articleLinks]
while (queue.length) {
  const href = queue.shift()
  if (visited.has(href)) continue
  visited.add(href)
  await page.goto(base + href)
  await page.waitForSelector('main h1')
  const title = await page.textContent('main h1')
  if (title.includes('找不到')) fail(`${href}：文章不存在（${title}）`)
  for (const next of await page.$$eval('a[href^="/articles/"]', (as) => as.map((a) => a.getAttribute('href')))) {
    if (!visited.has(next)) queue.push(next)
  }
  // 頁內目錄的每一個錨點都要有對應的段落
  const missingAnchors = await page.$$eval('aside a[href^="#"]', (as) =>
    as.map((a) => a.getAttribute('href').slice(1)).filter((id) => !document.getElementById(id)),
  )
  if (missingAnchors.length) fail(`${href}：目錄連到不存在的段落 ${missingAnchors.join('、')}`)
}
console.log(`文章頁：檢查了 ${visited.size} 篇`)

// ── 3. 鍵盤操作 ──
const kb = await browser.newPage({ viewport: { width: 375, height: 800 } })
await kb.goto(base + '/')
await kb.waitForSelector('main h1')
await kb.keyboard.press('Tab')
if ((await kb.evaluate(() => document.activeElement.textContent.trim())) !== '跳到主要內容') fail('鍵盤：第一個 Tab 不是「跳到主要內容」')
// 抽屜：Enter 打開、Esc 關掉
await kb.focus('button[aria-label="打開選單"]')
await kb.keyboard.press('Enter')
await kb.waitForSelector('[role="dialog"]')
await kb.keyboard.press('Escape')
await kb.waitForTimeout(400)
if (await kb.$('[role="dialog"]')) fail('鍵盤：抽屜按 Esc 沒有關掉')
// 抽屜：名稱是「主要導覽」、aria-modal、Tab 不會跑到背後、關掉後焦點回到「打開選單」
await kb.focus('button[aria-label="打開選單"]')
await kb.keyboard.press('Enter')
await kb.waitForSelector('[role="dialog"]')
const dialog = await kb.$eval('[role="dialog"]', (d) => ({
  name: document.getElementById(d.getAttribute('aria-labelledby'))?.textContent.trim(),
  modal: d.getAttribute('aria-modal'),
}))
if (dialog.name !== '主要導覽' || dialog.modal !== 'true') fail(`抽屜：名稱「${dialog.name}」、aria-modal=${dialog.modal}`)
for (let i = 0; i < 30; i++) await kb.keyboard.press('Tab')
if (!(await kb.evaluate(() => !!document.activeElement.closest('[role="dialog"]')))) fail('抽屜：按 Tab 跑到背後的頁面')
await kb.keyboard.press('Escape')
await kb.waitForTimeout(400)
if ((await kb.evaluate(() => document.activeElement.getAttribute('aria-label'))) !== '打開選單') fail('抽屜：關掉後焦點沒有回到「打開選單」')

// 首頁：手機每個分類只顯示 3 篇
const visiblePerTopic = await kb.$$eval('#topics-title + ul > li', (cards) =>
  cards.map((card) => [...card.querySelectorAll('ul li')].filter((li) => li.offsetParent !== null).length),
)
if (visiblePerTopic.some((n) => n > 3)) fail(`首頁手機版：分類顯示超過 3 篇（${visiblePerTopic.join('、')}）`)

// 常見問題：Enter 展開
await kb.goto(base + '/faq')
await kb.waitForSelector('main h1')
const trigger = kb.locator('main button[aria-expanded]').first()
await trigger.focus()
await kb.keyboard.press('Enter')
if ((await trigger.getAttribute('aria-expanded')) !== 'true') fail('鍵盤：常見問題按 Enter 沒有展開')
await kb.keyboard.press('Enter')
if ((await trigger.getAttribute('aria-expanded')) !== 'false') fail('鍵盤：常見問題再按 Enter 沒有收合')

// ── 4. 搜尋、身分篩選、逐步教學 ──
await kb.goto(base + '/search?q=結案')
await kb.waitForSelector('main h1')
const all = await kb.locator('main li a[href^="/articles/"]').count()
await kb.getByRole('button', { name: '住戶', exact: true }).click()
await kb.waitForTimeout(100)
const residentOnly = await kb.locator('main li a[href^="/articles/"]').count()
if (!(all > 0 && residentOnly < all)) fail(`搜尋「結案」：全部 ${all} 篇，只看住戶 ${residentOnly} 篇，篩選沒有作用`)
if ((await kb.getByRole('button', { name: '住戶', exact: true }).getAttribute('aria-pressed')) !== 'true') fail('搜尋：選到的身分沒有 aria-pressed')
await kb.goto(base + '/search?q=通報')
await kb.waitForSelector('main h1')
if ((await kb.locator('main section h2').count()) < 2) fail('搜尋「通報」：沒有依身分分組')
if (!(await kb.locator('main mark').count())) fail('搜尋：結果裡沒有標示搜尋字')
await kb.goto(base + '/search?q=找不到的字xyz')
await kb.waitForSelector('main h1')
if (!(await kb.getByText('好彼管家找不到相關的教學').count())) fail('搜尋不到時沒有顯示好彼管家的提示')

await kb.goto(base + '/articles/new-report')
await kb.waitForSelector('main h1')
await kb.getByRole('button', { name: '下一步' }).click()
if (!(await kb.locator('section[aria-labelledby="steps"]').innerText()).includes('步驟 2')) fail('逐步教學：按「下一步」沒有到第 2 步')
await kb.getByRole('button', { name: '上一步' }).click()
if (!(await kb.locator('section[aria-labelledby="steps"]').innerText()).includes('步驟 1')) fail('逐步教學：按「上一步」沒有回到第 1 步')
// 原本整頁列出步驟的文章，也要改成一步一步看（2026-10-19）
await kb.goto(base + '/articles/my-comments')
await kb.waitForSelector('main h1')
if ((await kb.locator('section[aria-labelledby="steps"]').innerText()).includes('步驟 2')) fail('一般文章：步驟沒有改成一步一步看')

console.log(`寬度 ${WIDTHS.join('、')}px × ${PAGES.length} 頁、鍵盤、搜尋、逐步教學都檢查完了`)
await browser.close()
await server.close()

if (problems.length) {
  console.error(`\n❌ 有 ${problems.length} 個問題：`)
  for (const p of problems) console.error(`  - ${p}`)
  process.exit(1)
}
console.log('✅ 全部通過')
