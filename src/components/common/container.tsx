import { cn } from "@/lib/utils";

type Props = React.ComponentProps<"div"> & { size?: "default" | "narrow" | "wide" };

/* default and wide share the navbar's width so every left edge lines up. */
const sizes = {
  narrow: "max-w-3xl",
  default: "max-w-[100rem]",
  wide: "max-w-[100rem]",
} as const;

export function Container({ className, size = "default", ...props }: Props) {
  return <div className={cn("mx-auto w-full px-5 sm:px-8 lg:px-12", sizes[size], className)} {...props} />;
}
