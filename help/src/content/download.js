// 下載 App 區塊的資料（首頁、認識我們兩個地方共用）
// ⚠️ App 還沒上架，iOS、Android 的網址都是「測試連結」（example.com 是保留給範例用的網域，點了不會連到別人的網站）
//   上架之後：把 url 改成 App Store／Google Play 的正式網址
//   （區塊下面原本有「測試連結，App 上架後更新」小字，2026-10-19 拿掉了）
export const DOWNLOAD = {
  title: '下載好彼社區 App',
  stores: [
    // caption：按鈕上面的小字；label：下面的大字（商店名稱，和官方徽章一樣）
    { id: 'ios', label: 'App Store', caption: '立即下載', url: 'https://example.com/ios' },
    { id: 'android', label: 'Google Play', caption: '立即下載', url: 'https://example.com/android' },
  ],
}
