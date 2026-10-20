// 選的照片、影片在畫面上看得到（示範版，2026-10-18；2026-10-19 加影片、加入檔案的共用寫法）
// 假資料只記檔名，沒有存檔案本身；示範時把剛選的檔案暫存在瀏覽器的記憶體裡，照片格、案件詳情才看得到真的內容
// 重新整理網頁就不見了（假資料會暫存在 sessionStorage，但照片、影片太大存不下，只剩檔名）
// 真的上線時，上傳後由後端回傳檔案的網址，就不需要這個檔案
import { toast } from 'vue-sonner'
import { REPORT_VIDEO_MAX_MB } from '@/lib/report'

const previews = new Map() // 檔名 → 暫存的網址

// 看副檔名判斷種類（假資料只有檔名，所以用副檔名判斷）
export function isVideoName(name) {
  return /\.(mp4|mov|m4v|webm|avi)$/i.test(name)
}
export function isPdfName(name) {
  return /\.pdf$/i.test(name)
}

// 選好檔案時呼叫：照片、影片才暫存（PDF 沒辦法當縮圖）
export function rememberPreview(name, file) {
  if (file.type.startsWith('image/') || file.type.startsWith('video/')) previews.set(name, URL.createObjectURL(file))
}

// 這個檔名有沒有暫存的照片或影片；沒有回傳空字串（假資料的檔案、PDF）
export function previewUrl(name) {
  return previews.get(name) ?? ''
}

// 把使用者剛選的檔案加進清單（照片格「新增」用，可以一次選好幾個）
//   names：目前的檔名清單；files：剛選的檔案；max：最多幾個
//   影片太大的不收、超過上限的不收，都會跳提示；回傳新的檔名清單（不改原本的陣列，頁面才會收到通知）
export function addPickedFiles(names, files, max) {
  const isTooLarge = (file) => file.type.startsWith('video/') && file.size > REPORT_VIDEO_MAX_MB * 1024 * 1024
  if (files.some(isTooLarge)) {
    toast.error('影片太大了', { description: `每段影片請在 ${REPORT_VIDEO_MAX_MB}MB 以內，太大的沒有加進來。` })
  }
  const ok = files.filter((file) => !isTooLarge(file))
  const accepted = ok.slice(0, max - names.length) // 還放得下幾個
  if (ok.length > accepted.length) {
    toast.error(`最多 ${max} 個`, { description: `只加了前 ${accepted.length} 個。` })
  }
  const next = [...names]
  for (const file of accepted) {
    const name = uniqueName(file.name, next) // 一個一個加，下一個才知道這個名字用過了
    rememberPreview(name, file)
    next.push(name)
  }
  return next
}

// 同名的改名（iPhone 直接拍的照片常常都叫 image.jpg）：暫存的檔案用檔名找，同名會互相蓋掉
// 名字已經在清單裡、或之前別的地方暫存過，就加上「 (2)」「 (3)」：image.jpg → image (2).jpg
function uniqueName(name, taken) {
  const isTaken = (candidate) => taken.includes(candidate) || previewUrl(candidate)
  if (!isTaken(name)) return name
  const dot = name.lastIndexOf('.')
  const base = dot > 0 ? name.slice(0, dot) : name
  const ext = dot > 0 ? name.slice(dot) : ''
  let n = 2
  while (isTaken(`${base} (${n})${ext}`)) n += 1
  return `${base} (${n})${ext}`
}
