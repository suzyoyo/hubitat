import { cva } from "class-variance-authority";

export { default as Alert } from "./Alert.vue";
export { default as AlertAction } from "./AlertAction.vue";
export { default as AlertDescription } from "./AlertDescription.vue";
export { default as AlertTitle } from "./AlertTitle.vue";

// 好彼社區調整：對照好彼 Kit 的 Alert
//   字級照專案規則放大成 16px（Kit、shadcn 都是 14px）：標題 type-body-strong、說明 type-body
//   說明的字用深色（text-foreground），和 Kit 一樣；shadcn 原本是灰色
//   圖示往下移 4px（translate-y-1），對齊 16px 字的第一行
//   說明拿掉 shadcn 的 text-balance（2026-10-13）：它會把每行平均分短，375px 寬時右邊空一塊；改成一般換行，每行填滿

export const alertVariants = cva(
  "grid gap-0.5 rounded-lg border px-2.5 py-2 text-left type-body has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2 *:[svg]:row-span-2 *:[svg]:translate-y-1 *:[svg]:text-current *:[svg:not([class*=size-])]:size-4 group/alert relative w-full",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive:
          "text-destructive bg-card *:data-[slot=alert-description]:text-destructive/90 *:[svg]:text-current",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);
