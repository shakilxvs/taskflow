import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { DarkModeProvider } from "@/context/DarkModeContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "TaskFlow",
  description: "Business task management, beautifully simple.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <DarkModeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </DarkModeProvider>
      </body>
    </html>
  );
}
