import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import Navigation from "@/components/Navigation";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });

export const metadata: Metadata = {
  title: "Shadow Bet | Meet Your Evil Twin",
  description: "Bet against yourself. The internet decides who wins.",
  icons: {
    icon: "/icon.jpg",
    apple: "/logo.jpg",
  },
  openGraph: {
    images: ["/logo.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${spaceGrotesk.variable} antialiased`}>
        {children}
        <script src="https://checkout.razorpay.com/v1/checkout.js" async />
        <Navigation />
      </body>
    </html>
  );
}
