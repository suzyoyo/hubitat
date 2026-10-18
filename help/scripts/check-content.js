// 檢查使用手冊的文章資料有沒有寫錯，並列出還缺的截圖
//   執行：npm run check:help
// 會檢查：
//   1. 每篇文章的必填欄位都有，id 沒有重複
//   2. category、applicableRoles 都是存在的分類和身分
//   3. relatedArticles、常見問題的 article 都連到「已發布」的文章（不會連到不存在的教學）
//   4. 文章用到的截圖檔在不在 help/src/assets/screenshots/（不在的列成「待補截圖清單」，不算錯誤）
import { existsSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const helpDir = join(dirname(fileURLToPath(import.meta.url)), '..')
const articlesDir = join(helpDir, 'src/content/articles')
const screenshotsDir = join(helpDir, 'src/assets/screenshots')

const load = async (path) => (await import(pathToFileURL(path).href))

// 讀所有文章
const articles = []
for (const folder of readdirSync(articlesDir, { withFileTypes: true }).filter((d) => d.isDirectory())) {
  for (const file of readdirSync(join(articlesDir, folder.name)).filter((f) => f.endsWith('.js'))) {
    const article = (await load(join(articlesDir, folder.name, file))).default
    articles.push({ ...article, _file: `${folder.name}/${file}` })
  }
}

const { CATEGORIES } = await load(join(helpDir, 'src/content/categories.js'))
const { ROLE_IDS } = await load(join(helpDir, 'src/content/roles.js'))
const { FAQS } = await load(join(helpDir, 'src/content/faqs.js'))

const errors = []
const published = new Set(articles.filter((a) => a.published).map((a) => a.id))
const seen = new Set()

for (const a of articles) {
  const where = `${a._file}（${a.id}）`
  for (const field of ['id', 'title', 'description', 'category', 'applicableRoles', 'order', 'keywords']) {
    if (a[field] === undefined) errors.push(`${where} 少了欄位 ${field}`)
  }
  if (seen.has(a.id)) errors.push(`${where} id 重複`)
  seen.add(a.id)
  if (!CATEGORIES.some((c) => c.id === a.category)) errors.push(`${where} 分類 ${a.category} 不存在`)
  for (const role of a.applicableRoles ?? []) {
    if (!ROLE_IDS.includes(role)) errors.push(`${where} 身分 ${role} 不存在`)
  }
  if (!a.steps?.length && !a.sections?.length) errors.push(`${where} 沒有內容（steps 和 sections 都是空的）`)
  if (a.published) {
    for (const id of a.relatedArticles ?? []) {
      if (!published.has(id)) errors.push(`${where} 相關教學 ${id} 不存在或還沒發布`)
    }
  }
}

for (const faq of FAQS) {
  if (faq.article && !published.has(faq.article)) errors.push(`常見問題 ${faq.id} 連到的教學 ${faq.article} 不存在或還沒發布`)
  for (const role of faq.roles) {
    if (!ROLE_IDS.includes(role)) errors.push(`常見問題 ${faq.id} 身分 ${role} 不存在`)
  }
}

// 待補截圖：同一個檔名可能好幾篇文章都用到
const shots = new Map()
for (const a of articles.filter((x) => x.published)) {
  const list = [
    ...(a.steps ?? []).filter((s) => s.screenshot).map((s) => s.screenshot),
    ...(a.sections ?? []).flatMap((s) => s.blocks).filter((b) => b.type === 'image').map((b) => b.screenshot),
  ]
  for (const shot of list) {
    if (!shots.has(shot.file)) shots.set(shot.file, { alt: shot.alt, articles: [] })
    shots.get(shot.file).articles.push(a.id)
  }
}
const missing = [...shots].filter(([file]) => !existsSync(join(screenshotsDir, file)))

console.log(`文章：${articles.length} 篇（已發布 ${published.size} 篇）、常見問題：${FAQS.length} 題`)
if (missing.length) {
  console.log(`\n待補截圖 ${missing.length} 張（還沒放進 help/src/assets/screenshots/ 的，網站上先不顯示）：`)
  for (const [file, info] of missing) console.log(`  - ${file}：${info.alt}（${info.articles.join('、')}）`)
}
if (errors.length) {
  console.error(`\n❌ 有 ${errors.length} 個問題：`)
  for (const e of errors) console.error(`  - ${e}`)
  process.exit(1)
}
console.log('\n✅ 文章資料檢查通過')
