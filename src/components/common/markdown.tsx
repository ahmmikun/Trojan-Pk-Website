import { IMAGE_QUALITY } from "@/config/images";
import { AlertTriangle, Info, Lightbulb, MessageSquareWarning, OctagonAlert } from "lucide-react";
import Link from "next/link";
import ReactMarkdown, { type Components } from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { remarkCallouts, remarkHeadingIds, type CalloutType } from "@/lib/markdown";
import { cn } from "@/lib/utils";
import { CodeCopy } from "./code-copy";

/**
 * Renders user-authored Markdown (GitHub flavoured: tables, task lists, footnotes,
 * strikethrough, autolinks) plus callouts (`> [!NOTE]`), highlighted code with a copy
 * button, anchored headings and captioned images.
 *
 * Safe by construction: raw HTML is never rendered (no rehype-raw), and only http(s),
 * mailto, relative and in-page links are kept. Used by the public pages and the admin preview.
 */

type HastNode = { type: string; value?: string; tagName?: string; properties?: Record<string, unknown>; children?: HastNode[] };
const hastText = (n: HastNode | undefined): string => (!n ? "" : n.type === "text" ? (n.value ?? "") : (n.children ?? []).map(hastText).join(""));

const CALLOUT: Record<CalloutType, { label: string; icon: React.ReactNode }> = {
  note: { label: "Note", icon: <Info /> },
  tip: { label: "Tip", icon: <Lightbulb /> },
  important: { label: "Important", icon: <MessageSquareWarning /> },
  warning: { label: "Warning", icon: <AlertTriangle /> },
  caution: { label: "Caution", icon: <OctagonAlert /> },
};

const LANG_LABEL: Record<string, string> = { typescript: "TypeScript", javascript: "JavaScript", python: "Python", shell: "Shell", console: "Terminal", ts: "TypeScript", tsx: "TSX", js: "JavaScript", jsx: "JSX", py: "Python", sh: "Shell", bash: "Bash", zsh: "Shell", json: "JSON", yml: "YAML", yaml: "YAML", md: "Markdown", sql: "SQL", css: "CSS", html: "HTML", xml: "XML", go: "Go", rs: "Rust", java: "Java", kt: "Kotlin", cs: "C#", cpp: "C++", c: "C", php: "PHP", rb: "Ruby", swift: "Swift", diff: "Diff", dockerfile: "Dockerfile" };

/** Image URLs the Next.js optimizer accepts (see next.config.ts): files in /public and Supabase media uploads. */
function optimizable(src: string) {
  if (/\.(svg|gif)(\?|$)/i.test(src)) return false;
  if (src.startsWith("/") && !src.startsWith("//")) return true;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return Boolean(base && src.startsWith(`${base}/storage/v1/object/public/media/`));
}
const optimized = (src: string, w: number) => `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=${IMAGE_QUALITY}`;

function safeHref(href: string | undefined) {
  return href && /^(https?:|mailto:|\/(?!\/)|#)/i.test(href) ? href : null;
}

const components: Components = {
  a({ href, children }) {
    const safe = safeHref(href);
    if (!safe) return <>{children}</>;
    if (safe.startsWith("/") || safe.startsWith("#")) return safe.startsWith("#") ? <a href={safe}>{children}</a> : <Link href={safe}>{children}</Link>;
    return (
      <a href={safe} target={safe.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
        {children}
      </a>
    );
  },
  h2: ({ id, children }) => <Heading as="h2" id={id}>{children}</Heading>,
  h3: ({ id, children }) => <Heading as="h3" id={id}>{children}</Heading>,
  h4: ({ id, children }) => <Heading as="h4" id={id}>{children}</Heading>,
  blockquote({ node, children }) {
    const props = (node as HastNode | undefined)?.properties ?? {};
    const type = (props.dataCallout ?? props["data-callout"]) as CalloutType | undefined;
    if (!type || !(type in CALLOUT)) return <blockquote>{children}</blockquote>;
    const c = CALLOUT[type];
    return (
      <aside className="md-callout" data-callout={type} aria-label={c.label}>
        <p className="md-callout-title">
          <span aria-hidden="true">{c.icon}</span>
          {c.label}
        </p>
        {children}
      </aside>
    );
  },
  pre({ node, children }) {
    const code = (node as HastNode | undefined)?.children?.find((c) => c.tagName === "code");
    const classes = (code?.properties?.className as string[] | undefined) ?? [];
    const lang = classes.find((c) => c.startsWith("language-"))?.slice(9) ?? "";
    const text = hastText(code).replace(/\n$/, "");
    return (
      <div className="md-code" data-lang={lang || undefined}>
        <div className="md-code-bar">
          <span>{LANG_LABEL[lang] ?? (lang ? lang.toUpperCase() : "Code")}</span>
          <CodeCopy code={text} />
        </div>
        <pre tabIndex={0}>{children}</pre>
      </div>
    );
  },
  img({ src, alt, title }) {
    if (typeof src !== "string" || !src) return null;
    const ok = optimizable(src);
    if (!ok && !/^https:\/\//.test(src)) return null;
    return (
      <span className="md-figure">
        {/* eslint-disable-next-line @next/next/no-img-element -- intrinsic size unknown for authored images; srcSet comes from the Next optimizer */}
        <img
          src={ok ? optimized(src, 1920) : src}
          srcSet={ok ? `${optimized(src, 640)} 640w, ${optimized(src, 1080)} 1080w, ${optimized(src, 1920)} 1920w` : undefined}
          sizes="(min-width: 1024px) 46rem, 100vw"
          alt={alt ?? ""}
          loading="lazy"
          decoding="async"
        />
        {title ? <span className="md-caption">{title}</span> : null}
      </span>
    );
  },
  table: ({ children }) => (
    <div className="md-table" tabIndex={0} role="region" aria-label="Table">
      <table>{children}</table>
    </div>
  ),
};

function Heading({ as: Tag, id, children }: { as: "h2" | "h3" | "h4"; id?: string; children: React.ReactNode }) {
  return (
    <Tag id={id} className="group">
      {children}
      {id ? (
        <a href={`#${id}`} className="md-anchor" aria-label="Link to this section">
          #
        </a>
      ) : null}
    </Tag>
  );
}

export function Markdown({ children, className, variant = "default" }: { children: string; className?: string; variant?: "default" | "article" }) {
  return (
    <div className={cn("md-prose", variant === "article" && "md-article", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkHeadingIds, remarkCallouts]} rehypePlugins={[[rehypeHighlight, { detect: false }]]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
