<script setup>
// 表單元件：field, input, textarea, radio-group, slider, toggle-group, select
import { ref } from 'vue'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

// ref()：建立會自動更新畫面的資料；v-model 會把輸入框和這些資料綁在一起
const title = ref('')
const detail = ref('')
const urgency = ref('normal')
const rating = ref([4]) // Slider 的值是陣列（因為可以有多個拉桿）
const filter = ref('all')
const sort = ref('due')
</script>

<template>
  <section id="form" class="scroll-mt-40 space-y-6">
    <h2 class="text-lg font-bold">表單</h2>

    <!-- Field：把「標籤 + 輸入框 + 說明 / 錯誤訊息」組成一組 -->
    <FieldGroup>
      <Field>
        <!-- for 要對應 Input 的 id，點標籤時游標才會跳進輸入框 -->
        <FieldLabel for="ticket-title">報修標題</FieldLabel>
        <Input id="ticket-title" v-model="title" placeholder="例如：B 棟電梯異音" />
        <FieldDescription>簡短描述問題，方便管委會快速了解</FieldDescription>
      </Field>

      <Field>
        <FieldLabel for="ticket-detail">詳細說明</FieldLabel>
        <Textarea
          id="ticket-detail"
          v-model="detail"
          placeholder="發生位置、時間、狀況…"
        />
      </Field>

      <!-- data-invalid / aria-invalid：顯示錯誤狀態的樣式 -->
      <Field data-invalid="true">
        <FieldLabel for="ticket-phone">聯絡電話</FieldLabel>
        <!-- 不用 v-model 時，初始值要用 default-value（value 會被元件忽略） -->
        <Input id="ticket-phone" aria-invalid="true" default-value="0912" />
        <FieldError>電話號碼格式不正確</FieldError>
      </Field>

      <!-- RadioGroup：多選一 -->
      <Field>
        <FieldLabel>緊急程度</FieldLabel>
        <RadioGroup v-model="urgency">
          <div class="flex items-center gap-2">
            <RadioGroupItem id="urgency-normal" value="normal" />
            <FieldLabel for="urgency-normal" class="font-normal">一般</FieldLabel>
          </div>
          <div class="flex items-center gap-2">
            <RadioGroupItem id="urgency-urgent" value="urgent" />
            <FieldLabel for="urgency-urgent" class="font-normal">緊急（影響安全）</FieldLabel>
          </div>
        </RadioGroup>
      </Field>

      <!-- Slider：拖曳選數值，這裡用來示範「評分」 -->
      <Field>
        <FieldLabel>廠商服務評分：{{ rating[0] }} 分</FieldLabel>
        <Slider v-model="rating" :min="1" :max="5" :step="1" />
      </Field>

      <!-- ToggleGroup：一排按鈕選一個，用來做篩選標籤（還沒照 Kit 調整樣式） -->
      <Field>
        <FieldLabel>篩選</FieldLabel>
        <ToggleGroup v-model="filter" type="single" variant="outline">
          <ToggleGroupItem value="all">全部</ToggleGroupItem>
          <ToggleGroupItem value="case">案件</ToggleGroupItem>
          <ToggleGroupItem value="sign">待簽核</ToggleGroupItem>
        </ToggleGroup>
      </Field>

      <!-- Select：下拉選單，用來做排序（還沒照 Kit 調整樣式） -->
      <Field>
        <FieldLabel>排序</FieldLabel>
        <Select v-model="sort">
          <SelectTrigger class="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="due">到期日</SelectItem>
            <SelectItem value="urgent">緊急優先</SelectItem>
            <SelectItem value="created">建立日期（新→舊）</SelectItem>
          </SelectContent>
        </Select>
      </Field>
    </FieldGroup>

    <!-- 即時顯示表單資料，看 v-model 的效果 -->
    <pre class="overflow-x-auto rounded-lg bg-muted p-3 text-xs">{{ { title, detail, urgency, rating, filter, sort } }}</pre>
  </section>
</template>
