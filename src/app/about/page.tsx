import { getSiteSettings, getMissionCards } from "@/lib/site-config"
import AboutContent from "@/components/about-content"

export const dynamic = "force-dynamic"

export default async function AboutPage() {
  const [settings, missions] = await Promise.all([getSiteSettings(), getMissionCards()])
  return <AboutContent settings={settings} missions={missions} />
}
