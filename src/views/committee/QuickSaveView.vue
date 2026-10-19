<script setup>
// 管委會端、管理人員端共用・快速留存（「＋」選單的「快速留存」，設計稿 1134:19280）
// 先拍下收據、單據或現場照片，之後再補齊資料：照片、名稱、備註都是選填，但至少要有一樣
// 留存後會出現在自己的待辦「需補資料」裡
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import LeaveConfirmDialog from '@/components/feedback/LeaveConfirmDialog.vue'
import BottomCta from '@/components/app/BottomCta.vue'
import CaseAttachmentList from '@/components/case/CaseAttachmentList.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { addQuickSave, getCurrentUser, takeDraft } from '@/mocks/api'

const PHOTO_MAX = 5 // 照片最多幾張（和回報完成的附件一樣）
const NAME_MAX = 40 // 名稱最多幾個字
const NOTE_MAX = 300 // 備註最多幾個字（設計稿寫 0 / 300）

// 網址是 /committee/quick-saves/new 或 /staff/quick-saves/new；route.meta.roleId 是目前在哪一端
const route = useRoute()
const router = useRouter()

const photos = ref([]) // 照片的檔名
const name = ref('')
const note = ref('')
const pending = ref(false) // 送出還在路上

// 之前存成草稿的話，打開時帶回來
onMounted(async () => {
  const user = await getCurrentUser(route.meta.roleId)
  await restoreDraft(user.id, route.fullPath, (data) => {
    photos.value = data.photos
    name.value = data.name
    note.value = data.note
  })
})

// 三樣都沒填就不能留存（留一筆空的沒有意義）
const isEmpty = computed(() => !photos.value.length && !name.value.trim() && !note.value.trim())

async function submit() {
  pending.value = true
  const user = await getCurrentUser(route.meta.roleId)
  await addQuickSave(user.id, { name: name.value.trim(), note: note.value.trim(), photos: photos.value })
  pending.value = false
  saved.value = true // 送出成功，換頁時不用再問
  toast.success('已留存', { description: '已加到你的待辦，之後再補齊資料' })
  // 回到上一頁；直接打網址進來的沒有上一頁，就回首頁
  if (window.history.state?.back) router.back()
  else router.replace(`/${route.meta.roleId}/home`)
}

// 有沒有填東西（離開前確認用）；留存成功後 saved 變 true，換頁不用再問
const saved = ref(false)
const isDirty = computed(() => !saved.value && Boolean(photos.value.length || name.value.trim() || note.value.trim()))

// 之前「存成草稿」的話，把內容帶回來（拿回來就刪掉；沒送出又要離開時可以再存一次）
async function restoreDraft(userIdValue, path, apply) {
  const data = await takeDraft(userIdValue, path)
  if (!data) return
  apply(data)
  toast.info('已帶回上次存的草稿')
}
</script>

<template>
  <!-- 底部按鈕下面還有一行說明，pb-32 留空間給它 -->
  <form class="space-y-6 px-5 pt-4 pb-32" novalidate @submit.prevent="submit">
    <div class="space-y-2">
      <div class="flex items-center justify-between gap-2">
        <p class="text-base font-medium text-foreground">
          收據或單據照片<span class="ml-1.5 type-date text-muted-foreground">選填</span>
        </p>
        <Badge variant="outline">{{ photos.length }}/{{ PHOTO_MAX }}</Badge>
      </div>
      <CaseAttachmentList v-model="photos" :max="PHOTO_MAX" />
    </div>

    <div class="space-y-2">
      <Label for="quick-save-name" class="text-base">
        名稱<span class="type-date text-muted-foreground">選填</span>
      </Label>
      <Input id="quick-save-name" v-model="name" placeholder="例：電梯保養單 10/01" :maxlength="NAME_MAX" />
    </div>

    <div class="space-y-2">
      <Label for="quick-save-note" class="text-base">
        備註<span class="type-date text-muted-foreground">選填</span>
      </Label>
      <Textarea
        id="quick-save-note"
        v-model="note"
        placeholder="之後補齊時會用到的說明"
        :maxlength="NOTE_MAX"
        class="min-h-[88px]"
      />
      <p class="type-date text-muted-foreground">{{ note.length }} / {{ NOTE_MAX }} 字</p>
    </div>

    <BottomCta note="留存後會放進你的待辦，之後再補齊資料">
      <Button type="submit" :disabled="isEmpty || pending">留存</Button>
    </BottomCta>
    <!-- 填到一半想離開時先問一次 -->
    <LeaveConfirmDialog :dirty="isDirty" draft-title="快速留存" :draft-data="{ photos, name, note }" />
  </form>
</template>
