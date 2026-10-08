import { cva } from "class-variance-authority";

export { default as Badge } from "./Badge.vue";

// 好彼社區調整：顏色與高度對照好彼 Kit 的 Badge（高 22px）
//   default   淺藍底、深藍字：分類標籤，例如「定期保養」「住戶」
//   secondary 淺橘底、深橘字：進行中的狀態，例如「處理中」「施工中」
//   outline   灰底、黑字：不需要強調的分類，例如「常態例會」「1F 大廳」
//             （名稱沿用 shadcn 的 outline，但 Kit 已改成灰底、沒有外框）
export const badgeVariants = cva(
  "h-[22px] gap-1 rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium transition-all has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&>svg]:size-3! group/badge inline-flex w-fit shrink-0 items-center justify-center overflow-hidden whitespace-nowrap focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-brand-subtle text-blue-800 [a]:hover:bg-brand-subtle/80",
        secondary:
          "bg-orange-200 text-orange-900 [a]:hover:bg-orange-200/80",
        destructive:
          "bg-destructive/10 [a]:hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 text-destructive dark:bg-destructive/20",
        outline:
          "bg-border text-foreground [a]:hover:bg-border/80",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);
