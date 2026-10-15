<script setup>
import { ComboboxEmpty } from "reka-ui";
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
  <!-- 搜尋不到時顯示 -->
  <ComboboxEmpty data-slot="combobox-empty" :class="cn('px-3 py-2 type-date text-muted-foreground', props.class)">
    <slot />
  </ComboboxEmpty>
</template>
