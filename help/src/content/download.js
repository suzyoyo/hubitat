// 下載 App 區塊的資料（首頁、認識我們兩個地方共用）
// ⚠️ App 還沒上架，iOS、Android 的網址都是「測試連結」（example.com 是保留給範例用的網域，點了不會連到別人的網站）
//   上架之後：把 url 改成 App Store／Google Play 的正式網址、isTestData 改成 false，區塊下面的「測試連結」小字就會消失
export const DOWNLOAD = {
  isTestData: true,
  title: '下載好彼社區 App',
  stores: [
    { id: 'ios', label: 'iOS', caption: 'App Store', url: 'https://example.com/ios' },
    { id: 'android', label: 'Android', caption: 'Google Play', url: 'https://example.com/android' },
  ],
}
