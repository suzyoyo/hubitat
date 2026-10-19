// 從文章資料算出畫面要用的東西：某個身分有哪些文章、分類、相關教學、頁內目錄、搜尋
// 畫面只透過這裡拿文章，不直接讀 content/articles/
import { ARTICLES } from '@/content/articles'
import { CATEGORIES, findCategory } from '@/content/categories'
import { ROLE_IDS } from '@/content/roles'
import { screenshotUrl } from '@/lib/screenshots'

// 只有 published: true 的文章會出現在網站上（還沒寫完的文章設成 false 就不會被點到）
const published = ARTICLES.filter((article) => article.published)
  .slice()
  .sort((a, b) => categoryOrder(a) - categoryOrder(b) || a.order - b.order)

function categoryOrder(article) {
  return findCategory(article.category)?.order ?? 999
}

export function getArticles() {
  return published
}

export function getArticle(id) {
  return published.find((article) => article.id === id)
}

// 這篇文章適不適用某個身分
export function appliesTo(article, roleId) {
  return article.applicableRoles.includes(roleId)
}

// 某個身分的分類（含每個分類底下的文章）。沒有文章的分類不顯示
export function getCategoriesForRole(roleId) {
  return CATEGORIES.slice()
    .sort((a, b) => a.order - b.order)
    .map((category) => ({
      ...category,
      articles: published.filter((a) => a.category === category.id && appliesTo(a, roleId)),
    }))
    .filter((category) => category.articles.length > 0)
}

// 首頁的新手教學
export function getPopularArticles() {
  return published.filter((article) => article.popular)
}

// 相關教學：只列出已發布的，不會連到不存在的文章
export function getRelatedArticles(article) {
  return (article.relatedArticles ?? []).map((id) => getArticle(id)).filter(Boolean)
}

// 這篇文章用到的所有截圖（步驟裡的＋段落裡的）
export function getScreenshots(article) {
  const fromSteps = (article.steps ?? []).filter((step) => step.screenshot).map((step) => step.screenshot)
  const fromSections = (article.sections ?? [])
    .flatMap((section) => section.blocks)
    .filter((block) => block.type === 'image')
    .map((block) => block.screenshot)
  return [...fromSteps, ...(article.resultScreenshot ? [article.resultScreenshot] : []), ...fromSections]
}

// 文章的段落：截圖檔還沒有的圖片區塊先拿掉；拿掉後沒有內容的段落也不顯示（不會出現空白的標題）
export function getSections(article) {
  return (article.sections ?? [])
    .map((section) => ({
      ...section,
      blocks: section.blocks.filter((block) => block.type !== 'image' || screenshotUrl(block.screenshot.file)),
    }))
    .filter((section) => section.blocks.length > 0)
}

// 頁內目錄：依文章有哪些段落自動產生
export function getToc(article) {
  const toc = []
  if (article.before?.length) toc.push({ id: 'before', title: '開始前要知道' })
  if (article.steps?.length) toc.push({ id: 'steps', title: '操作步驟' })
  getSections(article).forEach((section, index) => {
    if (section.heading) toc.push({ id: sectionId(index), title: section.heading }) // 沒有標題的段落不列
  })
  if (article.notes?.length) toc.push({ id: 'notes', title: '注意事項' })
  if (getRelatedArticles(article).length) toc.push({ id: 'related', title: '相關教學' })
  return toc
}

export function sectionId(index) {
  return `section-${index + 1}`
}

// 文章適用的身分裡，第一個是哪一個（打開文章時，側邊導覽要顯示哪個身分）
export function defaultRoleOf(article) {
  return ROLE_IDS.find((roleId) => appliesTo(article, roleId))
}

// ── 搜尋 ──
// 把文章裡所有文字串成一段，用來找關鍵字
function fullText(article) {
  const parts = [
    ...(article.before ?? []),
    ...(article.steps ?? []).flatMap((step) => [step.title, step.body, ...(step.tips ?? [])]),
    ...(article.sections ?? []).flatMap((section) => [
      section.heading,
      ...section.blocks.flatMap((block) => [
        block.text,
        ...(block.items ?? []),
        ...(block.rows ?? []).flat(),
        ...(block.slides ?? []).flatMap((slide) => slide.marks.map((mark) => mark.text)), // 導覽輪播的說明
      ]),
    ]),
    article.result,
    ...(article.notes ?? []),
  ]
  return parts.filter(Boolean).join(' ')
}

const searchIndex = published.map((article) => ({
  article,
  title: article.title,
  keywords: article.keywords.join(' '),
  description: article.description,
  body: fullText(article),
}))

// 把搜尋字切成一個一個關鍵字（空白隔開）
export function searchWords(query) {
  return query.trim().toLowerCase().split(/\s+/).filter(Boolean)
}

// 搜尋文章：可以用空白隔開多個關鍵字，每個都要找得到
// 標題符合的排最前面，再來是關鍵字、介紹、內文
// 有選身分（roleId）時，只給這個身分看的文章再往前排（比三種身分共用的文章更貼近）
export function searchArticles(query, roleId = null) {
  const words = searchWords(query)
  if (words.length === 0) return []

  return searchIndex
    .filter((item) => !roleId || appliesTo(item.article, roleId))
    .map((item) => {
      let score = 0
      for (const word of words) {
        let wordScore = 0
        if (item.title.toLowerCase().includes(word)) wordScore += 10
        if (item.keywords.toLowerCase().includes(word)) wordScore += 6
        if (item.description.toLowerCase().includes(word)) wordScore += 3
        if (item.body.toLowerCase().includes(word)) wordScore += 1
        if (wordScore === 0) return { item, score: 0 } // 有一個字找不到就不算
        score += wordScore
      }
      if (roleId && item.article.applicableRoles.length === 1) score += 4
      return { item, score }
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((result) => result.item.article)
}
