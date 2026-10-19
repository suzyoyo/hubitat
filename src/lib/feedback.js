// 操作失敗時的 toast，文字統一寫在這裡
import { toast } from 'vue-sonner'

// 送出失敗：表單的內容不要清掉，讓使用者直接再按一次
export function toastSubmitError() {
  toast.error('送出失敗，請再試一次', {
    description: '可能是網路不穩。你填的內容都還在。',
  })
}
