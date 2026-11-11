import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/common/button-link";
import { Container } from "@/components/common/container";
import { Reveal } from "@/components/common/reveal";
import { SocialIconLinks } from "@/components/social/social-icon-links";
import { siteConfig } from "@/config/site";
import { getSocialLinks } from "@/content/social";
import { HeroArtwork } from "./hero-artwork";

export async function Hero() {
  const social = await getSocialLinks();
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div aria-hidden="true" className="bg-grid animate-grid-drift absolute inset-0" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
      <Container size="wide" className="relative grid items-center gap-14 py-20 sm:py-28 lg:grid-cols-12 lg:py-32">
        <div className="lg:col-span-7">
          <Reveal immediate>
            <p className="inline-flex items-center gap-2 rounded-md border border-border bg-surface/70 px-3 py-1.5 font-mono text-xs tracking-wide text-muted-foreground">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-brand-blue" />
              {siteConfig.tagline}
            </p>
          </Reveal>
          <Reveal immediate delay={0.08}>
            <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
              Where Developers Come Together to <span className="text-gradient">Build What&apos;s Next.</span>
            </h1>
          </Reveal>
          <Reveal immediate delay={0.16}>
            <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
              A community of builders, innovators, and open-source enthusiasts collaborating to shape the future of technology in Pakistan.
            </p>
          </Reveal>
          <Reveal immediate delay={0.24}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <ButtonLink href="/join" emphasis>
                Join the Community <ArrowRight />
              </ButtonLink>
              <ButtonLink href="/projects" variant="outline">Explore Projects</ButtonLink>
            </div>
          </Reveal>
          <Reveal immediate delay={0.32}>
            <div className="mt-10 flex items-center gap-4">
              <span className="font-mono text-xs tracking-[0.16em] text-muted-foreground uppercase">Find us</span>
              <SocialIconLinks links={social} size="sm" aria-label="Trojans PK on social media" />
            </div>
          </Reveal>
        </div>
        <Reveal immediate delay={0.2} className="lg:col-span-5">
          <HeroArtwork />
        </Reveal>
      </Container>
    </section>
  );
}
