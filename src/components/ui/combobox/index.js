// Combobox：可以打字搜尋的下拉選單（2026-10-15 加，案件詳情的「關聯設備」在用）
// 寫法照 shadcn-vue 的 combobox，底層是 reka-ui 的 Combobox
//   用 `npx shadcn-vue@latest add combobox` 加會失敗（它要的 input-group 轉成 JavaScript 時出錯），所以手動照著寫
// 不需要樣式的部分直接用 reka-ui 的，需要樣式的（輸入框、清單、選項、找不到）包一層
export {
  ComboboxRoot as Combobox,
  ComboboxAnchor,
  ComboboxCancel,
  ComboboxGroup,
  ComboboxItemIndicator,
  ComboboxTrigger,
} from "reka-ui";
export { default as ComboboxEmpty } from "./ComboboxEmpty.vue";
export { default as ComboboxInput } from "./ComboboxInput.vue";
export { default as ComboboxItem } from "./ComboboxItem.vue";
export { default as ComboboxList } from "./ComboboxList.vue";
