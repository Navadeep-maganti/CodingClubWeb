import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import PremiumPageBackground from "@/components/premium-page-background"
import BlogClient from "./blog-client"

export default function BlogPage() {
  return (
    <main className="min-h-screen relative">
      <PremiumPageBackground />
      <Navigation />
      <BlogClient />
      <Footer />
    </main>
  )
}
