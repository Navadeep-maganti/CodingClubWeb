import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import PremiumPageBackground from "@/components/premium-page-background"
import LoginClient from "./login-client"

export default function LoginPage() {
  return (
    <main className="min-h-screen relative">
      <PremiumPageBackground />
      <Navigation />
      <LoginClient />
      <Footer />
    </main>
  )
}
