"use client"

import { useState } from "react"
import Link from "next/link"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import PremiumPageBackground from "@/components/premium-page-background"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import {
  User,
  Mail,
  IdCard,
  Image as ImageIcon,
  Plus,
  X,
  Github,
  Linkedin,
  Twitter,
  Globe,
  Save,
  Shield,
  PenSquare,
  ExternalLink,
} from "lucide-react"

export interface MemberUserData {
  id: string
  email: string
  name: string
  rollNumber: string
  image: string
  roles: string[]
  teamMember: {
    id: string
    name: string
    bio: string
    profileImage: string
    strengths: string[]
    displayOrder: number
    isActive: boolean
    category: string
    socialLinks: { platform: string; url: string }[]
  } | null
  blogAuthor: {
    id: string
    displayName: string
    bio: string
    avatar: string
    isApproved: boolean
  } | null
}

export default function MemberDashboardClient({ user }: { user: MemberUserData }) {
  const { toast } = useToast()
  const [name, setName] = useState(user.teamMember?.name || user.name || "")
  const [bio, setBio] = useState(user.teamMember?.bio || "")
  const [profileImage, setProfileImage] = useState(user.teamMember?.profileImage || user.image || "")
  const [strengths, setStrengths] = useState<string[]>(user.teamMember?.strengths || [])
  const [newStrength, setNewStrength] = useState("")
  const [github, setGithub] = useState(user.teamMember?.socialLinks.find((s) => s.platform === "github")?.url || "")
  const [linkedin, setLinkedin] = useState(
    user.teamMember?.socialLinks.find((s) => s.platform === "linkedin")?.url || "",
  )
  const [twitter, setTwitter] = useState(user.teamMember?.socialLinks.find((s) => s.platform === "twitter")?.url || "")
  const [website, setWebsite] = useState(
    user.teamMember?.socialLinks.find((s) => s.platform === "website")?.url || "",
  )
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [blogAuthorState, setBlogAuthorState] = useState(user.blogAuthor)
  const [requestingAuthor, setRequestingAuthor] = useState(false)

  const isSuperAdminOrAdmin = user.roles.includes("SUPER_ADMIN") || user.roles.includes("ADMIN")
  const isApprovedAuthor = user.roles.includes("BLOG_AUTHOR") && blogAuthorState?.isApproved === true
  const canWriteBlogs = isSuperAdminOrAdmin || isApprovedAuthor

  const handleRequestAuthor = async () => {
    setRequestingAuthor(true)
    try {
      const res = await fetch("/api/member/request-author", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: name || user.name }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to submit request")
      }
      const data = await res.json()
      setBlogAuthorState(data.author)
      toast({
        title: "Author Request Submitted",
        description: "Your application to become a Blog Author has been submitted to Administrators for approval.",
      })
    } catch (err) {
      toast({
        title: "Request Failed",
        description: err instanceof Error ? err.message : "Unable to submit request",
        variant: "destructive",
      })
    } finally {
      setRequestingAuthor(false)
    }
  }

  const addStrength = () => {
    const s = newStrength.trim()
    if (s && !strengths.includes(s)) {
      setStrengths([...strengths, s])
      setNewStrength("")
    }
  }
  const removeStrength = (s: string) => setStrengths(strengths.filter((x) => x !== s))

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("subdir", "profile")
      const res = await fetch("/api/uploads", { method: "POST", body: fd })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Upload failed")
      }
      const { url } = await res.json()
      setProfileImage(url)
      toast({ title: "Image uploaded", description: "Your new profile image is ready. Don't forget to save." })
    } catch (err) {
      toast({
        title: "Upload failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/member/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          bio,
          profileImage,
          strengths,
          socialLinks: [
            { platform: "github", url: github },
            { platform: "linkedin", url: linkedin },
            { platform: "twitter", url: twitter },
            { platform: "website", url: website },
          ],
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Save failed")
      }
      toast({ title: "Profile saved", description: "Your changes are now live on the team page." })
    } catch (err) {
      toast({
        title: "Save failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="min-h-screen relative">
      <PremiumPageBackground />
      <Navigation />

      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="font-heading font-bold text-4xl sm:text-5xl">
                <span className="gradient-text-premium">Member Dashboard</span>
              </h1>
              <div className="flex items-center gap-3">
                {canWriteBlogs ? (
                  <Link href="/blog/create">
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white">
                      <PenSquare className="mr-2 h-4 w-4" />
                      Write a Blog
                    </Button>
                  </Link>
                ) : (
                  <Button
                    onClick={handleRequestAuthor}
                    disabled={requestingAuthor || !!blogAuthorState}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white"
                  >
                    <PenSquare className="mr-2 h-4 w-4" />
                    {blogAuthorState ? "Author Request Pending" : "Request Author Access"}
                  </Button>
                )}
                {(user.roles.includes("SUPER_ADMIN") || user.roles.includes("ADMIN")) && (
                  <Link href="/dashboard/admin">
                    <Button className="bg-[#4A90E2] hover:bg-[#5BA0F2]">
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Dashboard
                    </Button>
                  </Link>
                )}
              </div>
            </div>
            <p className="text-[#B0B0B0]">Manage your profile, strengths, and blog author permissions.</p>
          </div>

          {/* Identity Card */}
          <Card className="glass border-white/10 mb-6">
            <CardHeader>
              <CardTitle className="text-white">Identity</CardTitle>
              <CardDescription className="text-[#B0B0B0]">Your account information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-[#4A90E2]" />
                <span className="text-[#E0E0E0]">{user.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <IdCard className="h-5 w-5 text-[#4A90E2]" />
                <span className="text-[#E0E0E0]">{user.rollNumber || "—"}</span>
              </div>
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-[#4A90E2]" />
                <div className="flex gap-2 flex-wrap">
                  {user.roles.map((r) => (
                    <Badge key={r} variant="secondary" className="bg-[#4A90E2]/20 text-[#4A90E2] border-[#4A90E2]/30">
                      {r}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Blog Author Card */}
          <Card className="glass border-white/10 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PenSquare className="h-5 w-5 text-[#4A90E2]" />
                  <span>Blog Author Status</span>
                </div>
                {blogAuthorState ? (
                  <Badge
                    className={
                      blogAuthorState.isApproved
                        ? "bg-[#50C878]/20 text-[#50C878] border-[#50C878]/30"
                        : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                    }
                  >
                    {blogAuthorState.isApproved ? "Approved Author" : "Pending Approval"}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-gray-400 border-gray-600">
                    Not Registered
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-[#B0B0B0]">
                {canWriteBlogs
                  ? "You are authorized to write and publish articles on the Coding Club Blog."
                  : blogAuthorState
                  ? "Your application to become a Blog Author is pending review by an Administrator."
                  : "Blog publishing requires approval from a Super Admin or Admin."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {canWriteBlogs ? (
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <span className="text-gray-300 text-sm">
                    Display Name: <strong className="text-white">{blogAuthorState?.displayName || user.name}</strong>
                  </span>
                  <Link href="/blog/create">
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white">
                      <PenSquare className="mr-2 h-4 w-4" />
                      Create New Article
                    </Button>
                  </Link>
                </div>
              ) : blogAuthorState ? (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-sm text-yellow-200">
                  <p className="font-semibold mb-1">Application Pending Review</p>
                  <p className="text-yellow-200/80 text-xs">
                    Your request was submitted. Once an Administrator approves your request, you will receive full access to write and publish blog posts.
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <p className="text-gray-400 text-sm">
                    Want to share tutorials, project showcases, or tech articles? Apply for author access.
                  </p>
                  <Button
                    onClick={handleRequestAuthor}
                    disabled={requestingAuthor}
                    className="bg-blue-600 hover:bg-blue-500 text-white"
                  >
                    <PenSquare className="mr-2 h-4 w-4" />
                    {requestingAuthor ? "Submitting..." : "Apply for Author Access"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Profile Editor */}
          <Card className="glass border-white/10 mb-6">
            <CardHeader>
              <CardTitle className="text-white">Profile</CardTitle>
              <CardDescription className="text-[#B0B0B0]">
                Update your public profile that appears on the team page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Image */}
              <div className="space-y-2">
                <Label className="text-[#E0E0E0]">Profile Image</Label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-[#1A1F2E] border border-white/10 flex items-center justify-center">
                    {profileImage ? (
                       
                      <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-[#B0B0B0]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUpload}
                      disabled={uploading}
                      className="block w-full text-sm text-[#B0B0B0] file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#4A90E2] file:text-white file:font-medium hover:file:bg-[#5BA0F2] file:cursor-pointer cursor-pointer"
                    />
                    <p className="text-xs text-[#B0B0B0] mt-2">Max 5MB. JPG, PNG, WebP, GIF.</p>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[#E0E0E0]">Display Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-[#1A1F2E] border-white/10 text-[#E0E0E0]"
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-[#E0E0E0]">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="bg-[#1A1F2E] border-white/10 text-[#E0E0E0]"
                  placeholder="Tell visitors about yourself..."
                />
              </div>

              {/* Strengths */}
              <div className="space-y-2">
                <Label className="text-[#E0E0E0]">Strengths / Skills</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newStrength}
                    onChange={(e) => setNewStrength(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addStrength()
                      }
                    }}
                    placeholder="e.g. React, NodeJS, Java, CP, AI/ML"
                    className="bg-[#1A1F2E] border-white/10 text-[#E0E0E0]"
                  />
                  <Button onClick={addStrength} variant="outline" className="border-[#4A90E2]/30 text-[#4A90E2]">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {strengths.map((s) => (
                    <Badge
                      key={s}
                      className="bg-[#4A90E2]/20 text-[#4A90E2] border-[#4A90E2]/30 cursor-pointer"
                      onClick={() => removeStrength(s)}
                    >
                      {s} <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Social Links */}
              <div className="space-y-4">
                <Label className="text-[#E0E0E0]">Social Links</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Github className="h-5 w-5 text-[#B0B0B0] flex-shrink-0" />
                    <Input
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      placeholder="https://github.com/username"
                      className="bg-[#1A1F2E] border-white/10 text-[#E0E0E0]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Linkedin className="h-5 w-5 text-[#B0B0B0] flex-shrink-0" />
                    <Input
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      className="bg-[#1A1F2E] border-white/10 text-[#E0E0E0]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Twitter className="h-5 w-5 text-[#B0B0B0] flex-shrink-0" />
                    <Input
                      value={twitter}
                      onChange={(e) => setTwitter(e.target.value)}
                      placeholder="https://twitter.com/username"
                      className="bg-[#1A1F2E] border-white/10 text-[#E0E0E0]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-[#B0B0B0] flex-shrink-0" />
                    <Input
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://yourwebsite.com"
                      className="bg-[#1A1F2E] border-white/10 text-[#E0E0E0]"
                    />
                  </div>
                </div>
              </div>

              {/* Save */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                {user.teamMember && (
                  <Link href="/team" target="_blank">
                    <Button variant="outline" className="border-white/10 text-[#B0B0B0]">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View on Team Page
                    </Button>
                  </Link>
                )}
                <Button onClick={handleSave} disabled={saving} className="bg-[#50C878] hover:bg-[#5DD988]">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Blog Author Quick Actions */}
          {user.blogAuthor?.isApproved && (
            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <PenSquare className="h-5 w-5 text-[#4A90E2]" />
                  Blog Author Tools
                </CardTitle>
                <CardDescription className="text-[#B0B0B0]">
                  Create and manage your blog posts.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/dashboard/admin?tab=blogs">
                  <Button className="bg-[#4A90E2] hover:bg-[#5BA0F2]">
                    <PenSquare className="h-4 w-4 mr-2" />
                    Create / Manage Blogs
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
