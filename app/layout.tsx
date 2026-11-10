import type { Metadata } from "next";
import { Poppins, League_Spartan, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const body = Poppins({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "600"],
});

const display = League_Spartan({
  variable: "--font-display",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Javier Betancourt",
  description:
    "Javier Betancourt, Software Engineer and Computer Science graduate of Texas A&M University, pursuing a Master's in Computer Science at UT Austin. Focused on game development and cybersecurity.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${body.variable} ${display.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
