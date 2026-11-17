import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ButtonLink } from "@/components/common/button-link";
import { StatusPage } from "@/components/common/status-page";

/** Shared 404 content: rendered inside the site layout (and inside SiteShell for the global fallback). */
export function NotFoundContent() {
  return (
    <StatusPage
      code="404"
      title="Page not found"
      message={
        <>
          The page you are looking for does not exist or has moved. Head back and keep building, or{" "}
          <Link href="/join" className="text-foreground underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground">
            join the community
          </Link>
          .
        </>
      }
      actions={
        <>
          <ButtonLink href="/" emphasis>
            <ArrowLeft /> Back to home
          </ButtonLink>
          <ButtonLink href="/projects" variant="outline">
            Explore projects
          </ButtonLink>
        </>
      }
    />
  );
}
