import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** Admin buttons. One definition; every admin screen uses these variants. */
export const buttonVariants = cva(
  "inline-flex shrink-0 select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-md font-medium transition-[background-color,border-color,color,box-shadow] outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-foreground text-background shadow-xs hover:bg-foreground/88",
        secondary: "border border-border bg-background text-foreground shadow-xs hover:border-foreground/20 hover:bg-muted/60",
        ghost: "text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground",
        danger: "bg-[#d92d20] text-white shadow-xs hover:bg-[#b42318]",
        "danger-ghost": "text-[#b42318] hover:bg-[#d92d20]/[0.07]",
      },
      size: {
        sm: "h-7 px-2.5 text-[0.8125rem] [&_svg]:size-3.5",
        md: "h-8 px-3 text-[0.8125rem] [&_svg]:size-4",
        lg: "h-9 px-3.5 text-sm [&_svg]:size-4",
        icon: "size-8 [&_svg]:size-4",
        "icon-sm": "size-7 [&_svg]:size-3.5",
      },
    },
    defaultVariants: { variant: "secondary", size: "md" },
  },
);

type Variants = VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, type = "button", ...props }: React.ComponentProps<"button"> & Variants) {
  return <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export function ButtonLink({ className, variant, size, ...props }: React.ComponentProps<typeof Link> & Variants) {
  return <Link className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
