import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/common/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms for using the Trojans PK website and taking part in the community.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage eyebrow="Legal" title="Terms of Service" updated="November 2026">
      <p>By using this website or joining the Trojans PK community you agree to these terms.</p>

      <h2>Using the website</h2>
      <p>Use the site lawfully and in good faith. Do not attempt to disrupt it, access restricted areas, or submit false or automated applications.</p>

      <h2>Membership</h2>
      <p>
        Submitting an application does not guarantee membership. All applications are reviewed manually and the team may accept or decline them at its discretion.
      </p>

      <h2>Community conduct</h2>
      <p>
        Members are expected to follow the <Link href="/community#guidelines">community guidelines</Link>. Harassment, spam or abuse may result in removal from community spaces.
      </p>

      <h2>Content and licences</h2>
      <p>
        Projects and articles remain the property of their authors and are subject to the licences stated in their repositories. The Trojans PK name and logo may not be used to imply endorsement without permission.
      </p>

      <h2>No warranty</h2>
      <p>The website and its content are provided as is, without warranties of any kind. Event details and project information may change.</p>

      <h2>Changes</h2>
      <p>We may update these terms from time to time. Continued use of the site means you accept the updated terms.</p>
    </LegalPage>
  );
}
