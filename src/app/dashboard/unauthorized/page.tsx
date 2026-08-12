import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import PremiumPageBackground from "@/components/premium-page-background"
import { Button } from "@/components/ui/button"
import { ShieldX } from "lucide-react"
import Link from "next/link"

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen relative">
      <PremiumPageBackground />
      <Navigation />
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-md mx-auto text-center">
          <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl blur-2xl opacity-30" />
            <div className="relative w-20 h-20 rounded-2xl glass-strong border border-red-500/20 flex items-center justify-center">
              <ShieldX className="h-8 w-8 text-red-400" />
            </div>
          </div>
          <h1 className="font-heading font-bold text-4xl mb-4 text-white">Access Denied</h1>
          <p className="text-gray-400 mb-8">
            You don&apos;t have permission to view this page. If you believe this is an error,
            please contact the club administrator.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/dashboard/member">
              <Button className="bg-blue-500 hover:bg-blue-600 btn-premium">
                Go to Member Dashboard
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="glass border-white/10 text-gray-200 hover:bg-white/5">
                Back Home
              </Button>
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
