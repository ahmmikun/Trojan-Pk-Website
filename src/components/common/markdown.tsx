import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

/**
 * Renders user-authored markdown. react-markdown does not render raw HTML by
 * default, so content cannot inject script or markup. Only http(s)/mailto
 * links and relative links are allowed.
 */
export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div
      className={cn(
        "space-y-5 text-base leading-8 text-muted-foreground",
        "[&_h2]:mt-14 [&_h2]:text-3xl [&_h2]:font-medium [&_h2]:tracking-tight [&_h2]:text-foreground",
        "[&_h3]:mt-10 [&_h3]:text-2xl [&_h3]:font-medium [&_h3]:tracking-tight [&_h3]:text-foreground",
        "[&_strong]:font-medium [&_strong]:text-foreground",
        "[&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6",
        "[&_blockquote]:border-l [&_blockquote]:border-foreground/40 [&_blockquote]:pl-6 [&_blockquote]:text-xl [&_blockquote]:leading-snug [&_blockquote]:text-foreground",
        "[&_code]:rounded [&_code]:bg-secondary [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.875em] [&_code]:text-foreground",
        "[&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-border [&_pre]:bg-surface [&_pre]:p-4 [&_pre_code]:bg-transparent [&_pre_code]:p-0",
        "[&_hr]:border-border",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a({ href, children: c }) {
            if (!href) return <>{c}</>;
            const safe = /^(https?:|mailto:|\/|#)/i.test(href);
            if (!safe) return <>{c}</>;
            const className = "text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground";
            if (href.startsWith("/")) return <Link href={href} className={className}>{c}</Link>;
            return (
              <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className={className}>
                {c}
              </a>
            );
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
