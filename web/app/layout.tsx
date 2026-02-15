import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "SkillLoot — Free Udemy Courses, Every Day",
  description: "Discover free Udemy courses curated from around the web. Save, vote, and earn XP while learning for free.",
  keywords: ["free udemy courses", "online learning", "free courses", "udemy deals", "skillloot"],
  openGraph: {
    title: "SkillLoot — Free Udemy Courses, Every Day",
    description: "Discover free Udemy courses curated from around the web.",
    url: "https://skillloot.tech",
    siteName: "SkillLoot",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SkillLoot — Free Udemy Courses, Every Day",
    description: "Discover free Udemy courses curated from around the web.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main style={{ minHeight: 'calc(100vh - 64px)' }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
