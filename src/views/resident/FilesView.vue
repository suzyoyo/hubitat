<script setup>
// 住戶端・社區（底部分頁）：社區檔案的入口（設計稿「住戶端-社區檔案」758:8467）
// 搜尋框＋三組清單：會議與決議、文件庫、設備。點進去的頁面都還是佔位頁
import {
  FileTextIcon,
  HistoryIcon,
  ScrollTextIcon,
  SearchIcon,
  UsersIcon,
  WrenchIcon,
} from '@lucide/vue'
import MenuItem from '@/components/app/MenuItem.vue'
import SectionHeader from '@/components/app/SectionHeader.vue'
import { Separator } from '@/components/ui/separator'

// 三組清單；每一列點了連到 to
const groups = [
  {
    title: '會議與決議',
    rows: [
      { label: '管委會報告', icon: UsersIcon, to: '/resident/meetings' },
      { label: '社區時間軸', icon: HistoryIcon, to: '/resident/timeline' },
    ],
  },
  {
    title: '文件庫',
    rows: [
      { label: '社區規約', icon: ScrollTextIcon, to: '/resident/bylaws' },
      { label: '公開文件', icon: FileTextIcon, to: '/resident/documents' },
    ],
  },
  {
    title: '設備',
    rows: [{ label: '設備與維修史', icon: WrenchIcon, to: '/resident/equipment' }],
  },
]
</script>

<template>
  <div class="space-y-8 px-5 pt-4 pb-5">
    <!-- 搜尋框：點了到搜尋頁（長得像輸入框，其實是連結，寫法和管委會端一樣） -->
    <RouterLink
      to="/resident/search"
      class="flex h-11 items-center gap-2 rounded-lg border border-input bg-card px-3 type-body text-muted-foreground"
    >
      <SearchIcon class="size-5 shrink-0" />
      搜尋電梯、會議、規約
    </RouterLink>

    <section v-for="group in groups" :key="group.title" class="space-y-3">
      <SectionHeader :title="group.title" />
      <!-- 卡片和「我的」頁的選單一樣：白底、圓角、每一列之間一條分隔線 -->
      <div class="rounded-xl bg-card px-4 py-1 shadow-card">
        <template v-for="(row, index) in group.rows" :key="row.label">
          <Separator v-if="index > 0" />
          <MenuItem :title="row.label" :to="row.to"><component :is="row.icon" /></MenuItem>
        </template>
      </div>
    </section>
  </div>
</template>
