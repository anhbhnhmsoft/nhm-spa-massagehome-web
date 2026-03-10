import { ModalToast } from "@/components/toast-manger-modal";
import "./globals.css";
import Providers from "@/lib/provider/providers";

import { Inter } from "next/font/google";
const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans bg-[#f4f4f4]`}>
        <Providers>
          <div className="mx-auto min-h-screen max-w-[750px] bg-[#f4f4f4] relative">
            <ModalToast>{children}</ModalToast>
          </div>
        </Providers>
      </body>
    </html>
  );
}
