<script setup>
import { ComboboxContent, ComboboxPortal, ComboboxViewport } from "reka-ui";
import { cn } from "@/lib/utils";

defineOptions({
  inheritAttrs: false,
});

const props = defineProps({
  // popper：清單從選單框下方長出來（和 ui/select 的設定一樣）
  position: { type: String, required: false, default: "popper" },
  sideOffset: { type: Number, required: false, default: 4 },
  align: { type: null, required: false, default: "start" },
  class: {
    type: [Boolean, null, String, Object, Array],
    required: false,
    skipCheck: true,
  },
});
</script>

<template>
  <ComboboxPortal>
    <!-- 和選單框一樣寬（--reka-combobox-trigger-width）；太長時在清單裡上下滑 -->
    <ComboboxContent
      data-slot="combobox-list"
      :position="props.position"
      :side-offset="props.sideOffset"
      :align="props.align"
      v-bind="$attrs"
      :class="
        cn(
          'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 z-50 flex w-(--reka-combobox-trigger-width) flex-col gap-2 overflow-hidden rounded-xl p-2 shadow-card ring-1 ring-border',
          props.class,
        )
      "
    >
      <slot />
    </ComboboxContent>
  </ComboboxPortal>
</template>
