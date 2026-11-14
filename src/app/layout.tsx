import type { Metadata, Viewport } from "next";
import { siteConfig } from "@/config/site";
import { MotionProvider } from "@/components/motion/motion";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="dark h-full" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        {/* Without JavaScript the entrance animations never run, so show everything. */}
        <noscript>
          <style>{`[data-fm]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <SmoothScroll />
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
