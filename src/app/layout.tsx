import type { Metadata, Viewport } from "next";
import { siteConfig } from "@/config/site";
import { EarlyScript } from "@/components/early-script";
import { MotionProvider } from "@/components/motion/motion";
import { INTRO_KEY } from "@/lib/intro";
import { THEME_KEY } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | Developer & Open-Source Community in Pakistan`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    "developer community",
    "open-source community",
    "software engineering community",
    "technology community Pakistan",
    "coding community",
    "AI hackathons",
    "tech mentorship",
    "Trojans PK",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    title: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: siteConfig.description,
    url: "/",
    images: [{ url: siteConfig.ogImage, width: 1024, height: 940, alt: `${siteConfig.name} logo` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  colorScheme: "dark light",
};

/**
 * Applies the theme before first paint so there is no flash. The public site is dark by default
 * (a saved "light" choice wins); /admin is always light.
 */
const themeScript = `try{var d=document.documentElement;if(location.pathname.indexOf("/admin")===0||localStorage.getItem("${THEME_KEY}")==="light"){d.classList.remove("dark");d.style.colorScheme="light";var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content","#fafaf8")}}catch(e){}`;

/** Hides the opening curtain before first paint when it already played this session or motion is reduced. */
const introScript = `try{if(sessionStorage.getItem("${INTRO_KEY}")||matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.classList.add("intro-skip")}catch(e){document.documentElement.classList.add("intro-skip")}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="dark h-full" suppressHydrationWarning>
      <head>
        {/* Runs before first paint (theme + curtain). See EarlyScript for why it is a client component. */}
        <EarlyScript code={themeScript + introScript} />
      </head>
      <body className="flex min-h-full flex-col">
        {/* Without JavaScript: show all animated content and never show the curtain. */}
        <noscript>
          <style>{`[data-fm]{opacity:1!important;transform:none!important}[data-intro]{display:none!important}`}</style>
        </noscript>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
