<script setup>
// 圖示方塊：圓角方塊裡放一個圖示（對應 Figma 的 Common/Icon Tile）
// 用法：把圖示放在標籤中間，例如 <IconTile><UsersIcon /></IconTile>

defineProps({
  // Kit 的 Style 變體：'soft' 淺藍底、圓角 14px；'square' 淺灰底、圓角 8px
  // （不叫 style，因為會和 HTML 本來就有的 style 屬性撞名）
  variant: { type: String, default: 'soft' },
})
</script>

<template>
  <!-- [&_svg]:size-5：裡面的圖示固定 20px -->
  <div
    class="flex size-10 shrink-0 items-center justify-center [&_svg]:size-5"
    :class="variant === 'square' ? 'rounded-md bg-muted' : 'rounded-xl bg-secondary'"
  >
    <slot />
  </div>
</template>
