"use client"

import { useState, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import PremiumPageBackground from "@/components/premium-page-background"
import { Button } from "@/components/ui/button"
import { Loader2, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"

function LoginContent() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const error = searchParams.get("error")
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard/member"

  const errorMessages: Record<string, string> = {
    AccessDenied:
      "Access denied. Your roll number is not in the approved list. Please contact the club admin to get your roll number whitelisted.",
    Configuration: "Authentication configuration error. Please contact the administrator.",
    Verification: "The sign-in token has expired or is invalid. Please try again.",
    OAuthCallback: "Google authentication failed. Please ensure you are using your @student.nitandhra.ac.in email.",
    default: "An unexpected error occurred during sign-in. Please try again.",
  }

  const errorMessage = error ? errorMessages[error] || errorMessages.default : null

  const handleSignIn = async () => {
    setLoading(true)
    await signIn("google", { callbackUrl })
  }

  return (
    <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-8"
        >
          <h1 className="font-heading font-bold text-4xl mb-4">
            <span className="text-white">Sign In</span>
          </h1>
          <p className="text-gray-300 text-lg">
            Access the Coding Club portal.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="glass-strong rounded-3xl p-8 border border-white/10 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />

          <div className="relative z-10">
            {errorMessage && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-300 text-sm">{errorMessage}</p>
              </div>
            )}

            <div className="space-y-4 mb-6 text-center text-sm text-gray-300">
              <p>Please use your @student.nitandhra.ac.in account.</p>
            </div>

            <Button
              onClick={handleSignIn}
              disabled={loading}
              className="w-full bg-white hover:bg-gray-100 text-gray-900 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-white/20 group cursor-pointer btn-premium"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </>
              )}
            </Button>

            <p className="text-center text-gray-400 text-xs mt-6">
              By signing in, you agree to follow the Coding Club&apos;s code of conduct.
            </p>
          </div>
        </motion.div>

        <div className="mt-6 text-center text-gray-400 text-xs">
          <p>
            Email format:{" "}
            <code className="glass px-2 py-1 rounded-md text-blue-400 font-mono">
              123456@student.nitandhra.ac.in
            </code>
          </p>
        </div>
      </div>
    </section>
  )
}

export default function LoginClient() {
  return (
    <Suspense fallback={
      <div className="pt-32 text-center relative z-10">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-400 mb-4" />
        <p className="text-gray-400">Loading...</p>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
