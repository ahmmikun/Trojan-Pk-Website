import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  /** Hide the wordmark and show only the helmet mark. */
  markOnly?: boolean;
  href?: string | null;
};

/**
 * Trojans PK brand lockup: the official helmet mark (public/brand/mark.png)
 * plus a typographic wordmark. Swap the asset to rebrand.
 */
export function Logo({ className, markOnly = false, href = "/" }: Props) {
  const content = (
    <>
      <Image
        src="/brand/mark.png"
        alt=""
        width={633}
        height={782}
        priority
        className="h-7 w-auto"
      />
      {markOnly ? (
        <span className="sr-only">{siteConfig.name}</span>
      ) : (
        <span className="text-[15px] font-semibold tracking-[0.14em] uppercase">
          Trojans<span className="text-muted-foreground"> PK</span>
        </span>
      )}
    </>
  );

  const classes = cn("inline-flex items-center gap-2.5", className);
  if (href === null) return <span className={classes}>{content}</span>;
  return (
    <Link href={href} className={classes} aria-label={`${siteConfig.name} home`}>
      {content}
    </Link>
  );
}
