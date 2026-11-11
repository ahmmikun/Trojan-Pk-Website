import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { Logo } from "@/components/common/logo";
import { ButtonLink } from "@/components/common/button-link";

export default function NotFound() {
  return (
    <>
      <header className="mx-auto flex h-16 w-full max-w-7xl items-center px-5 sm:px-8">
        <Logo />
      </header>
      <main id="main" className="relative flex flex-1 items-center justify-center overflow-hidden px-5 py-24">
        <div aria-hidden="true" className="bg-grid absolute inset-0" />
        <div className="relative text-center">
          <p className="font-mono text-sm tracking-[0.2em] text-brand-blue">404</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Page not found</h1>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            The page you are looking for does not exist or has moved. Head back and keep building.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/" emphasis>Back to home</ButtonLink>
            <ButtonLink href="/projects" variant="outline">Explore projects</ButtonLink>
          </div>
          <p className="mt-8 text-sm text-muted-foreground">
            Or <Link href="/join" className="text-foreground underline underline-offset-4">join the community</Link>.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
