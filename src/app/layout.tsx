import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import { Providers } from "@/components/Providers";
import { getSessionUser } from "@/lib/session";
import { pageMeta } from "@/lib/seo";
import { orgJsonLd } from "@/lib/seo";
import { site } from "@/lib/site";
import "./globals.css";

export const dynamic = "force-dynamic";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  ...pageMeta({
    title: `${site.name} · ${site.tagline}`,
    description: site.description,
    path: "/",
  }),
  applicationName: site.name,
  icons: { icon: "/favicon.svg" },
  manifest: "/manifest.webmanifest",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  return (
    <html lang="en" className={`${outfit.variable} ${fraunces.variable} h-full`} suppressHydrationWarning>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd()) }} />
      </head>
      <body className="flex min-h-full flex-col pb-16 md:pb-0">
        <Providers>
          <Header user={user} />
          <main className="flex-1">{children}</main>
          <Footer />
          <MobileNav user={user} />
        </Providers>
      </body>
    </html>
  );
}
