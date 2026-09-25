import type { Metadata } from "next";
import { Noto_Sans_Ethiopic } from "next/font/google";
import "./globals.css";

const notoSansEthiopic = Noto_Sans_Ethiopic({
  variable: "--font-ethiopic",
  subsets: ["ethiopic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ጽርሐ ጽዮን ሰንበት ት/ቤት",
  description: "የጽርሐ ጽዮን ሰንበት ት/ቤት የተማሪ ምዝገባ ስርዓት",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="am" dir="ltr">
      <body className={`${notoSansEthiopic.variable}`}>
        {children}
      </body>
    </html>
  );
}