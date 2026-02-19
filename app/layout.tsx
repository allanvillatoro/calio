import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CALIO Joyería",
  description: "Joyas para sentirte bien",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

