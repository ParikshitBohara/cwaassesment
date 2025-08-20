import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

// === Fonts ===
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// === Metadata ===
export const metadata: Metadata = {
  title: "Assignment 1",
  description: "Next.js app for LMS code generation",
};

// === Your details (edit) ===
const STUDENT_NO = "21885934";
const STUDENT_NAME = "Parikshit Bohara";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen w-full bg-neutral-100 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100`}
      >
        <div className="flex min-h-screen flex-col">
          <Header studentNo={STUDENT_NO} title="Title" />
          <main className="flex-1 px-6 py-6 md:px-8 lg:px-12">{children}</main>
          <Footer name={STUDENT_NAME} studentNo={STUDENT_NO} />
        </div>
      </body>
    </html>
  );
}
