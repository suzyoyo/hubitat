// 截圖檔案在 help/src/assets/screenshots/，文章裡只寫檔名（例如 'resident-home.jpg'）
// 這裡把檔名換成打包後的網址；找不到檔案時回傳 null，畫面就不顯示那張圖
// 還缺哪些截圖，用 npm run check:help 看「待補截圖清單」
const files = import.meta.glob('../assets/screenshots/*.{jpg,png}', { eager: true, import: 'default' })

const urlByName = Object.fromEntries(
  Object.entries(files).map(([path, url]) => [path.split('/').pop(), url]),
)

export function screenshotUrl(name) {
  return urlByName[name] ?? null
}
