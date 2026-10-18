// 瀏覽器分頁上的標題，例如「如何新增通報｜好彼社區使用指南」
export const SITE_NAME = '好彼社區使用指南'

export function setPageTitle(title) {
  document.title = !title || title === SITE_NAME ? SITE_NAME : `${title}｜${SITE_NAME}`
}
