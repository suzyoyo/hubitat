// 選的照片在畫面上看得到（示範版，2026-10-18）
// 假資料只記檔名，沒有存檔案本身；示範時把剛選的照片暫存在瀏覽器的記憶體裡，案件詳情才看得到真的照片
// 和假資料一樣，重新整理網頁就不見了
// 真的上線時，上傳後由後端回傳照片的網址，就不需要這個檔案

const previews = new Map() // 檔名 → 暫存的網址

// 選好檔案時呼叫：是照片才暫存
export function rememberPreview(name, file) {
  if (file.type.startsWith('image/')) previews.set(name, URL.createObjectURL(file))
}

// 這個檔名有沒有暫存的照片；沒有回傳空字串（假資料的檔案、影片、PDF）
export function previewUrl(name) {
  return previews.get(name) ?? ''
}
