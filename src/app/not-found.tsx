import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/layout/footer";
import { Logo } from "@/components/common/logo";
import { ButtonLink } from "@/components/common/button-link";
import { Container } from "@/components/common/container";

export default function NotFound() {
  return (
    <>
      <header className="mx-auto flex h-[var(--nav-h)] w-full max-w-7xl items-center px-5 sm:px-8">
        <Logo />
      </header>
      <main id="main" className="bg-wash relative flex flex-1 items-center border-y border-border">
        <Container className="py-24 sm:py-32">
          <p className="tabular font-mono text-sm text-muted-foreground">(404)</p>
          <h1 className="mt-6 max-w-4xl text-5xl leading-[0.98] font-medium tracking-tighter sm:text-7xl lg:text-8xl">Page not found</h1>
          <div className="mt-12 grid gap-8 border-t border-border pt-8 lg:grid-cols-12">
            <p className="text-lg leading-snug text-muted-foreground sm:text-xl lg:col-span-5 lg:col-start-8">
              The page you are looking for does not exist or has moved. Head back and keep building, or{" "}
              <Link href="/join" className="text-foreground underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground">join the community</Link>.
            </p>
            <div className="flex flex-wrap gap-3 lg:col-span-6 lg:row-start-1">
              <ButtonLink href="/" emphasis><ArrowLeft /> Back to home</ButtonLink>
              <ButtonLink href="/projects" variant="outline">Explore projects</ButtonLink>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
