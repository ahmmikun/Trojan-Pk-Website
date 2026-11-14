import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/common/container";
import { Reveal } from "@/components/common/reveal";
import { WordReveal } from "@/components/motion/motion";
import { SocialIconLinks } from "@/components/social/social-icon-links";
import { siteConfig } from "@/config/site";
import { getSocialLinks } from "@/content/social";
import { RotatingWords, Spotlight } from "./hero-effects";

/** Centered, text-only hero: tagline, headline, one line of copy, two calls to action. */
export async function Hero() {
  const social = await getSocialLinks();
  return (
    <section className="bg-wash relative -mt-[var(--nav-h)] overflow-hidden border-b border-border">
      <Spotlight />
      <Container size="wide" className="relative flex min-h-svh flex-col items-center justify-center pt-[calc(var(--nav-h)+5rem)] pb-24 text-center">
        <Reveal immediate>
          <p className="inline-flex items-center gap-2.5 rounded-full border border-border bg-foreground/[0.03] px-3.5 py-1.5 text-sm text-muted-foreground">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-success" />
            {siteConfig.tagline}
          </p>
        </Reveal>

        <h1 className="mx-auto mt-8 max-w-4xl text-balance text-[2.5rem] leading-[1.04] font-medium tracking-tighter sm:text-6xl lg:text-7xl">
          <span className="sr-only">Where developers come together to build what&apos;s next.</span>
          <WordReveal text="Where developers come together to build" delay={0.05} decorative />{" "}
          <RotatingWords words={["what's next.", "open source.", "real products.", "for Pakistan."]} />
        </h1>

        <Reveal immediate delay={0.45}>
          <p className="mx-auto mt-7 max-w-lg text-pretty text-base leading-snug text-muted-foreground sm:text-lg">
            A Pakistan-based community of builders, innovators and open-source enthusiasts who learn by shipping real work together.
          </p>
        </Reveal>

        <Reveal immediate delay={0.6}>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
            <Link
              href="/join"
              className="group inline-flex h-12 items-center gap-3 rounded-full bg-foreground py-1.5 pr-1.5 pl-6 text-[15px] font-medium text-background transition-colors duration-300 hover:bg-foreground/90"
            >
              Join the community
              <span aria-hidden="true" className="flex size-9 items-center justify-center overflow-hidden rounded-full bg-background text-foreground">
                <ArrowRight className="size-4 transition-transform duration-500 ease-[var(--ease-premium)] group-hover:translate-x-0.5" />
              </span>
            </Link>
            <Link
              href="/projects"
              className="inline-flex h-12 items-center rounded-full border border-border px-6 text-[15px] font-medium text-foreground transition-colors duration-300 hover:border-foreground/25 hover:bg-foreground/[0.05]"
            >
              Explore projects
            </Link>
          </div>
        </Reveal>

        <Reveal immediate delay={0.75}>
          <div className="mt-12 flex items-center justify-center gap-4">
            <span className="text-sm text-muted-foreground">Find us</span>
            <SocialIconLinks links={social} size="sm" aria-label="Trojans PK on social media" />
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
