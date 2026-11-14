import Link from "next/link";
import type { VariantProps } from "class-variance-authority";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = Omit<React.ComponentProps<typeof Link>, "href"> &
  VariantProps<typeof buttonVariants> & {
    href: string;
    /** Opens in a new tab with hardened rel attributes. */
    external?: boolean;
    /** Brand-forward solid style used for primary CTAs. */
    emphasis?: boolean;
  };

/** A link that looks like a Button. Internal links use next/link; external use a secure anchor. */
export function ButtonLink({ href, external, emphasis, variant, size = "lg", className, children, ...props }: Props) {
  const classes = cn(
    buttonVariants({ variant: emphasis ? "default" : variant, size }),
    "h-11 rounded-full px-5 text-sm",
    emphasis && "bg-foreground text-background hover:bg-foreground/90",
    className,
  );
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={classes} {...props}>
      {children}
    </Link>
  );
}
