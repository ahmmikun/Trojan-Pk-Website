import { cn } from "@/lib/utils";

type Props = React.ComponentProps<"div"> & { size?: "default" | "narrow" | "wide" };

const sizes = {
  narrow: "max-w-3xl",
  default: "max-w-6xl",
  wide: "max-w-7xl",
} as const;

export function Container({ className, size = "default", ...props }: Props) {
  return <div className={cn("mx-auto w-full px-5 sm:px-8", sizes[size], className)} {...props} />;
}
