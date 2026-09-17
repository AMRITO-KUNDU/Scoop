import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "chunky inline-flex items-center justify-center gap-2 font-display font-bold tracking-tight select-none disabled:pointer-events-none disabled:opacity-45",
  {
    variants: {
      variant: {
        yolk: "bg-yolk text-ink",
        hot: "bg-hot text-paper",
        cyan: "bg-cyan text-ink",
        grape: "bg-grape text-paper",
        volt: "bg-cyan text-ink",
        ink: "bg-ink text-paper",
        paper: "bg-paper text-ink",
      },
      size: {
        sm: "h-10 px-3 text-sm",
        md: "h-12 px-5 text-base",
        lg: "h-14 px-7 text-lg",
        xl: "h-16 px-8 text-xl",
        icon: "size-12",
      },
    },
    defaultVariants: {
      variant: "yolk",
      size: "md",
    },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  asChild = false,
  type = "button",
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      type={asChild ? undefined : type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
