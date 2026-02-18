import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Calio Jewelry",
  description: "Exquisita colección de joyería artesanal",
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

