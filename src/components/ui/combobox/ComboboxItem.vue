<script setup>
import { ComboboxItem } from "reka-ui";
import { cn } from "@/lib/utils";

const props = defineProps({
  class: {
    type: [Boolean, null, String, Object, Array],
    required: false,
    skipCheck: true,
  },
});
</script>

<template>
  <!-- 照 Kit 的 Combobox Item：文字＋右邊打勾（打勾用 ComboboxItemIndicator 放在 slot 裡）；每列至少 44px 高 -->
  <ComboboxItem
    data-slot="combobox-item"
    :class="
      cn(
        'data-[highlighted]:bg-muted relative flex min-h-11 w-full cursor-default items-center gap-2 rounded-lg px-3 py-1.5 outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        props.class,
      )
    "
  >
    <slot />
  </ComboboxItem>
</template>
