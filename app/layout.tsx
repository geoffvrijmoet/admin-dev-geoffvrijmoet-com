import { Inter } from "next/font/google";
import { ClerkProvider, UserButton } from "@clerk/nextjs";
import { MainNav } from "@/components/main-nav";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Admin Dashboard - Geoff Vrijmoet",
  description: "Freelance business management dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          {/* Only show nav and header on non-auth pages */}
          {!children?.toString().includes("SignIn") && !children?.toString().includes("SignUp") ? (
            <div className="flex h-screen">
              <div className="hidden md:flex w-72 flex-col fixed inset-y-0 z-50">
                <div className="flex flex-col flex-grow gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
                  <div className="flex h-16 shrink-0 items-center">
                    <h1 className="text-xl font-bold">Admin Dashboard</h1>
                  </div>
                  <MainNav />
                </div>
              </div>
              <div className="md:pl-72 flex-1">
                <div className="flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm">
                  <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                    <div className="ml-auto flex items-center">
                      <UserButton afterSignOutUrl="/" />
                    </div>
                  </div>
                </div>
                <main className="p-8">{children}</main>
              </div>
            </div>
          ) : (
            children
          )}
        </body>
      </html>
    </ClerkProvider>
  );
}
