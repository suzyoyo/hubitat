// 自動收集這個資料夾底下的所有文章（about/、start/、resident/、management/ 裡的 .js 檔）
// 新增文章只要新增檔案，不用改這裡
const modules = import.meta.glob('./*/*.js', { eager: true, import: 'default' })

export const ARTICLES = Object.values(modules)
