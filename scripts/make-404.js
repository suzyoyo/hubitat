// 產生 GitHub Pages 用的 dist/404.html（部署時 .github/workflows/deploy.yml 會執行）
//   執行：node scripts/make-404.js（要先打包好 App 到 dist/）
//
// 為什麼需要：GitHub Pages 不認得 Vue Router 的網址，直接打開內頁（例如 /hubitat/resident/reports）
//   找不到檔案，就會回傳 404.html。所以 404.html 要能接手顯示正確的頁面。
//
// 404.html 做兩件事：
//   1. 網址開頭是 /hubitat/help/（使用手冊）：轉到手冊首頁，把原本的網址放在 ?redirect= 帶過去，
//      手冊的 help/index.html 會把網址還原，手冊再顯示那一頁
//   2. 其他網址：照舊交給 App（404.html 就是 App 首頁的複製，Vue 會依網址顯示正確的頁面）
import { readFileSync, writeFileSync } from 'node:fs'

// 手冊放在哪一層，要和部署時的 HELP_BASE 一樣
const HELP_BASE = process.env.HELP_BASE || '/hubitat/help/'

// 放在 <head> 裡、<meta charset> 後面的一小段程式：比 App 的程式先執行，是手冊的網址就馬上轉走
const redirectScript = `<script>
      // 使用手冊的網址：轉到手冊首頁，原本的網址放在 ?redirect= 帶過去（說明在 scripts/make-404.js）
      ;(function () {
        var helpBase = '${HELP_BASE}'
        var path = location.pathname
        if (path.indexOf(helpBase) === 0) {
          location.replace(helpBase + '?redirect=' + encodeURIComponent(path + location.search + location.hash))
        }
      })()
    </script>`

const html = readFileSync('dist/index.html', 'utf8')
const charset = '<meta charset="UTF-8" />'
if (!html.includes(charset)) throw new Error(`dist/index.html 裡找不到 ${charset}`)
writeFileSync('dist/404.html', html.replace(charset, `${charset}\n    ${redirectScript}`))
console.log(`已產生 dist/404.html（${HELP_BASE} 開頭的網址轉給使用手冊）`)
