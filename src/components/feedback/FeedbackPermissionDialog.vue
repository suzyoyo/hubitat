<script setup>
// 權限被拒的彈窗：相機、相簿、通知
// 使用者之前按了「不允許」，網頁沒辦法再跳出詢問，只能教他自己去設定打開
// 例：<FeedbackPermissionDialog v-model:open="cameraDenied" kind="camera" @use-photos="pickFromPhotos" />
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'

const props = defineProps({
  // camera：相機 / photos：相簿 / notifications：通知
  kind: { type: String, required: true },
})

const open = defineModel('open', { type: Boolean, default: false })
// 相機不能用時，可以改從相簿選照片
const emit = defineEmits(['use-photos'])

// 每一種的文字；steps 是 iPhone 和 Android 打開權限的步驟
const KINDS = {
  camera: {
    title: '沒辦法使用相機',
    description: '之前選了「不允許」，所以沒辦法拍照。可以改從相簿選照片，或照下面的步驟打開相機權限。',
    iphone: '「設定」→「Safari」→「相機」→ 選「允許」',
    android: '點網址列左邊的圖示 →「權限」→ 打開「相機」',
  },
  photos: {
    title: '沒辦法打開相簿',
    description: '之前選了「不允許」，所以看不到相簿裡的照片。照下面的步驟打開照片權限。',
    iphone: '「設定」→「隱私權與安全性」→「照片」→ 找到瀏覽器，選「完整取用」',
    android: '「設定」→「應用程式」→ 找到瀏覽器 →「權限」→ 打開「相片和影片」',
  },
  notifications: {
    title: '通知已經關掉了',
    description: '受理、結案、緊急公告的通知都會收不到。照下面的步驟打開通知。',
    iphone: '先「加入主畫面」，再到「設定」→「通知」→「好彼社區」→ 打開「允許通知」',
    android: '點網址列左邊的圖示 →「權限」→ 打開「通知」',
  },
}

const text = computed(() => KINDS[props.kind])

function usePhotos() {
  open.value = false
  emit('use-photos')
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent :show-close-button="false" class="gap-3.5 p-5">
      <DialogTitle class="type-card-title!">{{ text.title }}</DialogTitle>
      <DialogDescription class="type-body!">{{ text.description }}</DialogDescription>

      <!-- 打開權限的步驟：iPhone、Android 各一行 -->
      <dl class="space-y-2 rounded-lg bg-muted p-3">
        <div>
          <dt class="type-body-strong">iPhone</dt>
          <dd class="type-date text-muted-foreground">{{ text.iphone }}</dd>
        </div>
        <div>
          <dt class="type-body-strong">Android</dt>
          <dd class="type-date text-muted-foreground">{{ text.android }}</dd>
        </div>
      </dl>

      <div class="space-y-2">
        <Button v-if="kind === 'camera'" class="w-full" @click="usePhotos">改從相簿選照片</Button>
        <Button class="w-full" :variant="kind === 'camera' ? 'outline' : 'default'" @click="open = false">知道了</Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
