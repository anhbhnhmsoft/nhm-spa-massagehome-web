import { ModalToast } from "@/components/toast-manger-modal";
import "./globals.css";
import Providers from "@/lib/provider/providers";

import { Inter } from "next/font/google";
const inter = Inter({
  subsets: ["latin", "vietnamese"], // hỗ trợ tiếng Việt
  variable: "--font-inter", // gắn vào CSS variable
  display: "swap",
});
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans`}>
        <Providers>
          <ModalToast>{children}</ModalToast>
        </Providers>
      </body>
    </html>
  );
}
