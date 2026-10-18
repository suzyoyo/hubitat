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

// 每一種的文字；iphone、android 是到手機的「設定」打開權限的步驟
const KINDS = {
  camera: {
    title: '沒辦法使用相機',
    description: '請開啟相機權限，或改從相簿選取照片。',
    iphone: '「設定」→「Safari」→「相機」→「允許」',
    android: '「設定」→「應用程式」→ 瀏覽器（例如 Chrome）→「權限」→「相機」→「允許」',
  },
  photos: {
    title: '沒辦法打開相簿',
    description: '請開啟照片權限。',
    iphone: '「設定」→「隱私權與安全性」→「照片」→ 瀏覽器（例如 Safari）→「完整取用」',
    android: '「設定」→「應用程式」→ 瀏覽器（例如 Chrome）→「權限」→「相片和影片」→「允許」',
  },
  // iPhone 用瀏覽器開的話根本沒有通知，要先加入主畫面，所以標題不寫「關掉了」
  notifications: {
    title: '還沒開啟通知',
    description: '請開啟通知，才收得到受理、結案和緊急公告。',
    iphone: '先「加入主畫面」，再到「設定」→「通知」→「好彼社區」→ 打開「允許通知」',
    android: '「設定」→「應用程式」→「好彼社區」（或瀏覽器）→「通知」→ 打開',
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
