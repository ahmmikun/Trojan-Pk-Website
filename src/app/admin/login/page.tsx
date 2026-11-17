import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdmin } from "@/features/admin/auth";
import { LoginForm } from "@/features/admin/login-form";
import { supabaseEnv } from "@/lib/supabase/env";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  const configured = supabaseEnv() !== null;
  if (configured && (await getAdmin())) redirect("/admin");

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-[22rem]">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="grid size-10 place-items-center rounded-lg bg-foreground shadow-sm">
            <Image src="/brand/mark.png" alt="" width={19} height={23} className="h-[23px] w-[19px]" priority />
          </span>
          <h1 className="mt-5 text-lg font-medium tracking-[-0.015em]">Sign in to Trojans PK</h1>
          <p className="mt-1 text-[0.8125rem] text-muted-foreground">Content workspace for the community website.</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
          {configured ? (
            <LoginForm />
          ) : (
            <p className="text-[0.8125rem] text-muted-foreground">
              Supabase is not configured. Set <code className="font-mono text-foreground">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="font-mono text-foreground">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>.
            </p>
          )}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Admin accounts only. <Link href="/" className="text-foreground underline-offset-2 hover:underline">Back to the website</Link>
        </p>
      </div>
    </main>
  );
}
