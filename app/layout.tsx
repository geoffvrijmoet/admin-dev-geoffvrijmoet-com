import { ClerkProvider } from '@clerk/nextjs'
import { Inconsolata } from 'next/font/google'
import { UserButton } from "@clerk/nextjs";
import { MainNav } from "@/components/main-nav";
import { MobileNav } from "@/components/mobile-nav";
import './globals.css'

const inconsolata = Inconsolata({ subsets: ['latin'], weight: '400' })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inconsolata.className} style={{ backgroundColor: '#add8e6', color: '#4a00e0' }}>
          <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-50 w-full border-b bg-[#2c003e]/95 backdrop-blur supports-[backdrop-filter]:bg-[#2c003e]/60">
              <div className="container flex h-14 items-center text-white">
                <MainNav />
                <MobileNav className="md:hidden" />
                <div className="flex flex-1 items-center justify-end space-x-4">
                  <UserButton afterSignOutUrl="/" />
                </div>
              </div>
            </header>
            <main className="flex-1 container py-6 text-[#6a5acd] flex justify-center items-center">
              <div className="bg-white p-6 rounded-lg shadow-md text-center flex flex-col items-center w-full max-w-3xl">
                <div className="grid grid-cols-1 gap-4 w-full">
                  {children}
                </div>
              </div>
            </main>
          </div>
        </body>
      </html>
    </ClerkProvider>
  )
}