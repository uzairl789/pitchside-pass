import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Pitchside Pass",
  description:
    "Instant football ticket availability alerts. Get notified when tickets become available and buy at face value through official ticketing platforms.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>

        <SpeedInsights />
      </body>
    </html>
  );
}