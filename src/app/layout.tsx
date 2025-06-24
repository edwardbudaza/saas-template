import "~/styles/globals.css";

import { Inter } from "next/font/google";
import { auth } from "~/server/auth";
import { authConfig } from "~/server/auth/config";
import { AuthProvider } from "~/components/auth/session-provider";
import { UserNav } from "~/components/auth/user-nav";
import { Toaster } from "~/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Your SaaS App",
  description: "A comprehensive SaaS application built with T3 Stack",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable} antialiased`}>
        <AuthProvider session={session}>
          <div className="bg-background min-h-screen">
            {/* Navigation Header */}
            <header className="border-b">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                  <div className="flex items-center">
                    <h1 className="text-xl font-bold">Your SaaS</h1>
                  </div>
                  <UserNav />
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main>{children}</main>

            {/* Toast Notifications */}
            <Toaster />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
