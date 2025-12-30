import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kite Games Studio - FIFA Tournament",
  description: "Tournament scorecard platform with live bracket updates",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.Node;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
