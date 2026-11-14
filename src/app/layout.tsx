import type { Metadata, Viewport } from "next";
import { siteConfig } from "@/config/site";
import { MotionProvider } from "@/components/motion/motion";
import { IntroCurtain } from "@/components/motion/intro-curtain";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
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
  icons: { icon: "/brand/mark.png", apple: "/brand/mark.png" },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  colorScheme: "dark light",
};

/** Applies a saved light-theme choice before first paint so there is no flash. Dark is the default. */
const themeScript = `try{if(localStorage.getItem("${THEME_KEY}")==="light"){var d=document.documentElement;d.classList.remove("dark");d.style.colorScheme="light";var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content","#fafaf8")}}catch(e){}`;

/** Hides the opening curtain before first paint when it already played this session or motion is reduced. */
const introScript = `try{if(sessionStorage.getItem("${INTRO_KEY}")||matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.classList.add("intro-skip")}catch(e){document.documentElement.classList.add("intro-skip")}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="dark h-full" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript + introScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        {/* Without JavaScript: show all animated content and never show the curtain. */}
        <noscript>
          <style>{`[data-fm]{opacity:1!important;transform:none!important}[data-intro]{display:none!important}`}</style>
        </noscript>
        <IntroCurtain />
        <SmoothScroll />
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
