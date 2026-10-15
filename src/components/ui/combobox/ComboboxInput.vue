<script setup>
import { ComboboxInput } from "reka-ui";
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
  <!-- 樣式和 ui/input 一樣（高 44px、16px 字） -->
  <ComboboxInput
    data-slot="combobox-input"
    :class="
      cn(
        'border-input focus-visible:border-ring focus-visible:ring-ring/50 h-11 w-full min-w-0 rounded-lg border bg-card px-3 py-1 text-base outline-none placeholder:text-muted-foreground focus-visible:ring-3',
        props.class,
      )
    "
  />
</template>
