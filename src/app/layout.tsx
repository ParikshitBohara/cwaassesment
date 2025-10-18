import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/contexts/ThemeContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Assignment 2",
  description: "Next.js app for LMS code generation",
};

const STUDENT_NO = "21880927";
const STUDENT_NAME = "Parikshit Bohara";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen w-full bg-theme-primary text-theme-primary`}
      >
        <ThemeProvider>
          <div className="flex min-h-screen flex-col bg-theme-primary">
            <Header studentNo={STUDENT_NO} title="Title" />
            <main className="flex-1 px-6 py-6 md:px-8 lg:px-12 bg-theme-primary">
              {children}
            </main>
            <Footer name={STUDENT_NAME} studentNo={STUDENT_NO} />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
