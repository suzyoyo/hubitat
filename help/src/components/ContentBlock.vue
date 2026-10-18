<script setup>
// 文章段落裡的一個區塊。文章資料的 sections[].blocks 每一項的 type：
//   p        一段文字            { type: 'p', text }
//   list     項目清單            { type: 'list', items: [] }
//   table    表格                { type: 'table', caption, head: [], rows: [[]] }
//   badges   徽章顏色對照        { type: 'badges', items: [{ tone: 'red'|'orange'|'blue'|'gray', label, meaning }] }
//   tip      小提示框            { type: 'tip', title, text }
//   warning  注意框              { type: 'warning', title, text }
//   image    截圖                { type: 'image', screenshot: { file, alt, caption } }
import NoteBox from './NoteBox.vue'
import RichText from './RichText.vue'
import ScreenshotImage from './ScreenshotImage.vue'

defineProps({
  block: { type: Object, required: true },
})

// 徽章樣本的顏色，和 App 的徽章（src/components/ui/badge）一樣
const badgeColors = {
  red: 'bg-[#f5c6c8] text-[#85282a]',
  orange: 'bg-orange-200 text-orange-900',
  blue: 'bg-brand-50 text-[#306077]',
  gray: 'bg-line text-ink',
}
const toneNames = { red: '紅色', orange: '橘色', blue: '藍色', gray: '灰色' }
</script>

<template>
  <p v-if="block.type === 'p'"><RichText :text="block.text" /></p>

  <ul v-else-if="block.type === 'list'" class="space-y-2">
    <li v-for="item in block.items" :key="item" class="flex gap-3">
      <span class="mt-[0.72em] size-1.5 shrink-0 rounded-full bg-brand-800" aria-hidden="true" />
      <span><RichText :text="item" /></span>
    </li>
  </ul>

  <!-- 表格：手機上欄位太多時只有表格自己左右捲，整頁不會出現水平捲軸 -->
  <div v-else-if="block.type === 'table'" class="overflow-x-auto rounded-xl border border-line bg-white">
    <table class="w-full min-w-[480px] border-collapse text-left text-base">
      <caption v-if="block.caption" class="sr-only">{{ block.caption }}</caption>
      <thead class="bg-brand-50 text-brand-900">
        <tr>
          <th v-for="cell in block.head" :key="cell" scope="col" class="px-4 py-3 font-bold">{{ cell }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rowIndex) in block.rows" :key="rowIndex" class="border-t border-line align-top">
          <td v-for="(cell, cellIndex) in row" :key="cellIndex" class="px-4 py-3" :class="cellIndex === 0 && 'font-medium'">
            <RichText :text="cell" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- 徽章對照：每一列有徽章樣本＋顏色名稱＋意思，不只靠顏色 -->
  <ul v-else-if="block.type === 'badges'" class="divide-y divide-line overflow-hidden rounded-xl border border-line bg-white">
    <li v-for="item in block.items" :key="item.tone" class="grid gap-2 px-4 py-3 sm:grid-cols-[150px_minmax(0,1fr)] sm:items-center">
      <span class="flex items-center gap-2">
        <span class="inline-flex h-7 items-center rounded-full px-3 text-sm font-medium" :class="badgeColors[item.tone]">
          {{ item.label }}
        </span>
        <span class="text-sm text-muted">{{ toneNames[item.tone] }}</span>
      </span>
      <span><RichText :text="item.meaning" /></span>
    </li>
  </ul>

  <NoteBox v-else-if="block.type === 'tip'" tone="tip" :title="block.title ?? '小提示'">
    <p><RichText :text="block.text" /></p>
  </NoteBox>

  <NoteBox v-else-if="block.type === 'warning'" tone="warning" :title="block.title ?? '請注意'">
    <p><RichText :text="block.text" /></p>
  </NoteBox>

  <ScreenshotImage v-else-if="block.type === 'image'" :shot="block.screenshot" />
</template>
