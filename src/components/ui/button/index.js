import { cva } from "class-variance-authority";

export { default as Button } from "./Button.vue";

// 好彼社區調整：
//   1. 為了長輩好按，尺寸比 shadcn 預設大（預設高度 44px）
//   2. 顏色對照好彼 Kit 的 Button。有底色的四種（default、outline、secondary、destructive）
//      底部有一條深色的線，看起來像微微浮起來；ghost 和 link 沒有
//        default     品牌藍底、白字：主要動作，一頁最多一顆，例如「送出」
//        outline     接近白色的灰底、深藍字：和主要按鈕並排的次要動作，例如「取消」
//                    （名稱沿用 shadcn 的 outline，但 Kit 已改成沒有外框）
//        secondary   淺藍底、深藍字：內容裡的動作，例如「下載 PDF」「＋ 新增一筆紀錄」
//        destructive 淺紅底、紅字：刪除、撤回這類做了就回不去的動作
//      怎麼選的完整規則在 docs/dev-guide.md 第 5 節「按鈕」（2026-10-19 定案）
//        ghost       沒有底色、深藍字、中等粗細（500）：不強調的動作（2026-10-19 從黑色粗體改，原本太粗太黑）
//      底部的線：Kit 是「往內長的底部線條」，程式用往內的陰影（inset-shadow）來做。
//      線條畫在按鈕裡面、會順著圓角彎，而且不佔空間，按鈕大小不變。
//      （不用 border-b：邊框在圓角的地方會變細、斷開，看起來像按鈕底下多墊了一條線）
export const buttonVariants = cva(
  "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 rounded-lg border border-transparent bg-clip-padding type-button focus-visible:ring-3 aria-invalid:ring-3 active:not-aria-[haspopup]:translate-y-px [&_svg:not([class*=size-])]:size-4 group/button inline-flex shrink-0 items-center justify-center whitespace-nowrap transition-all outline-none select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground inset-shadow-[0_-1px_0_var(--color-blue-600)] [a]:hover:bg-primary/80",
        outline:
          "bg-background text-secondary-foreground inset-shadow-[0_-1px_0_var(--color-gray-200)] hover:bg-muted aria-expanded:bg-muted",
        secondary:
          "bg-secondary text-secondary-foreground inset-shadow-[0_-1px_0_var(--secondary-foreground)] hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "font-medium text-secondary-foreground hover:bg-muted dark:hover:bg-muted/50 aria-expanded:bg-muted",
        destructive:
          "bg-warning-subtle text-warning-strong inset-shadow-[0_-1px_0_var(--warning-strong)] hover:bg-warning-subtle/80 focus-visible:border-destructive/40 focus-visible:ring-destructive/20",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-11 gap-1.5 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-8 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*=size-])]:size-3",
        sm: "h-9 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*=size-])]:size-3.5",
        lg: "h-12 gap-1.5 px-5 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        icon: "size-11",
        "icon-xs":
          "size-8 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*=size-])]:size-3",
        "icon-sm":
          "size-9 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);
