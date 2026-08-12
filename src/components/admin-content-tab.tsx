"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import * as LucideIcons from "lucide-react"
import {
  Edit, Trash2, Plus, Save, X, Eye, EyeOff, ArrowUp, ArrowDown,
  Home, Calendar, BookOpen, Phone, Info, Settings, Type, Image as ImageIcon, ExternalLink,
} from "lucide-react"

/**
 * Render a lucide icon by name.
 */
function IconByName({ name, className }: { name: string; className?: string }) {
  const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>
  const Cmp = icons[name] || icons.Code
  return <Cmp className={className} />
}

interface ContentItem {
  id: string
  [key: string]: any
}

interface ContentTabProps {
  siteSettings: Record<string, string>
  pillars: ContentItem[]
  domains: ContentItem[]
  heroStats: ContentItem[]
  events: ContentItem[]
  missions: ContentItem[]
  resourceRoadmaps: ContentItem[]
  resourceToolkits: ContentItem[]
  resourceProjects: ContentItem[]
  resourceLinkCategories: ContentItem[]
  footerSocial: ContentItem[]
  footerQuickLinks: ContentItem[]
  footerContacts: ContentItem[]
}

const API_BASE = "/api/admin/content"

// Common lucide icon names that admins can pick from
const COMMON_ICONS = [
  "Code", "Smartphone", "Brain", "Trophy", "Globe", "Database", "Github", "Twitter",
  "Linkedin", "Instagram", "Mail", "MapPin", "Phone", "ExternalLink", "Users",
  "User", "Calendar", "Clock", "Star", "Award", "Target", "Lightbulb", "Heart",
  "Zap", "BookOpen", "FileText", "PenSquare", "Eye", "Settings", "Home", "Server",
  "Cloud", "Cpu", "Layers", "GitBranch", "Rocket", "Sparkles", "Wrench",
]

export default function ContentTab(props: ContentTabProps) {
  const [subtab, setSubtab] = useState("general")

  const subtabs = [
    { id: "general", label: "General Settings", icon: Settings },
    { id: "home", label: "Home Page", icon: Home },
    { id: "events", label: "Events", icon: Calendar },
    { id: "about", label: "About Page", icon: Info },
    { id: "resources", label: "Resources", icon: BookOpen },
    { id: "footer", label: "Footer", icon: Phone },
  ]

  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="flex flex-wrap gap-2">
        {subtabs.map((s) => (
          <button
            key={s.id}
            onClick={() => setSubtab(s.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              subtab === s.id
                ? "bg-[#4A90E2] text-white"
                : "bg-[#1A1F2E] text-[#B0B0B0] hover:text-white"
            }`}
          >
            <s.icon className="h-4 w-4" />
            {s.label}
          </button>
        ))}
      </div>

      {subtab === "general" && <GeneralSettings settings={props.siteSettings} />}
      {subtab === "home" && (
        <HomeContent
          heroStats={props.heroStats}
          pillars={props.pillars}
          domains={props.domains}
          settings={props.siteSettings}
        />
      )}
      {subtab === "events" && <EventsContent events={props.events} settings={props.siteSettings} />}
      {subtab === "about" && <AboutContentTab missions={props.missions} settings={props.siteSettings} />}
      {subtab === "resources" && (
        <ResourcesContentTab
          roadmaps={props.resourceRoadmaps}
          toolkits={props.resourceToolkits}
          projects={props.resourceProjects}
          linkCategories={props.resourceLinkCategories}
          settings={props.siteSettings}
        />
      )}
      {subtab === "footer" && (
        <FooterContent
          social={props.footerSocial}
          quickLinks={props.footerQuickLinks}
          contacts={props.footerContacts}
          settings={props.siteSettings}
        />
      )}
    </div>
  )
}

// =========================================================
// GENERAL SETTINGS (key/value pairs)
// =========================================================
function GeneralSettings({ settings }: { settings: Record<string, string> }) {
  const { toast } = useToast()
  const [drafts, setDrafts] = useState<Record<string, string>>({ ...settings })
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")

  const filteredKeys = Object.keys(drafts).filter((k) =>
    k.toLowerCase().includes(search.toLowerCase()),
  )

  const save = async (keys: string[]) => {
    setSaving(true)
    const updates: Record<string, string> = {}
    for (const k of keys) updates[k] = drafts[k] || ""
    const res = await fetch(`${API_BASE}/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates }),
    })
    setSaving(false)
    if (!res.ok) {
      toast({ title: "Failed", variant: "destructive" })
      return
    }
    toast({ title: "Saved", description: `${keys.length} settings updated. Changes are live.` })
  }

  return (
    <Card className="glass border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Settings className="h-5 w-5 text-[#4A90E2]" />
          Site Settings (Key/Value)
        </CardTitle>
        <CardDescription className="text-[#B0B0B0]">
          Edit text content used across all pages. Changes take effect immediately.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Search settings..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-[#1A1F2E] border-white/10 text-[#E0E0E0]"
        />
        <div className="max-h-[600px] overflow-y-auto space-y-3 pr-2">
          {filteredKeys.length === 0 && (
            <p className="text-[#B0B0B0] text-sm text-center py-4">No settings match your search.</p>
          )}
          {filteredKeys.map((key) => (
            <div key={key} className="space-y-1">
              <Label className="text-[#E0E0E0] text-xs font-mono">{key}</Label>
              {drafts[key] && drafts[key].length > 80 ? (
                <Textarea
                  value={drafts[key] || ""}
                  onChange={(e) => setDrafts({ ...drafts, [key]: e.target.value })}
                  rows={3}
                  className="bg-[#1A1F2E] border-white/10 text-[#E0E0E0] text-sm"
                />
              ) : (
                <Input
                  value={drafts[key] || ""}
                  onChange={(e) => setDrafts({ ...drafts, [key]: e.target.value })}
                  className="bg-[#1A1F2E] border-white/10 text-[#E0E0E0] text-sm"
                />
              )}
              <div className="flex justify-end gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-[#50C878] hover:bg-[#50C878]/10"
                  disabled={saving}
                  onClick={() => save([key])}
                >
                  <Save className="h-3 w-3 mr-1" /> Save
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between pt-4 border-t border-white/10">
          <Button
            variant="outline"
            className="border-white/10 text-[#B0B0B0]"
            onClick={() => setDrafts({ ...settings })}
          >
            Reset All
          </Button>
          <Button onClick={() => save(filteredKeys)} disabled={saving} className="bg-[#50C878] hover:bg-[#5DD988]">
            <Save className="h-4 w-4 mr-2" />
            Save All ({filteredKeys.length})
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// =========================================================
// HOME PAGE CONTENT
// =========================================================
function HomeContent({ heroStats, pillars, domains, settings }: any) {
  return (
    <div className="space-y-6">
      <GenericEntityEditor
        title="Hero Stats"
        description="The stats cards shown in the hero section (e.g. 50+ Active Members)."
        entity="hero-stats"
        items={heroStats}
        fields={[
          { key: "iconName", label: "Icon", type: "icon-select" },
          { key: "value", label: "Value (e.g. 50+)", type: "text" },
          { key: "label", label: "Label", type: "text" },
          { key: "description", label: "Description", type: "text" },
          { key: "gradient", label: "Gradient (Tailwind)", type: "text" },
        ]}
        newItemTemplate={{ iconName: "Users", value: "0+", label: "New Stat", description: "", gradient: "from-blue-500 to-blue-600", displayOrder: 0, isActive: true }}
      />
      <GenericEntityEditor
        title="Pillars (Who We Are)"
        description="The three feature cards in the Who We Are section."
        entity="pillars"
        items={pillars}
        fields={[
          { key: "iconName", label: "Icon", type: "icon-select" },
          { key: "title", label: "Title", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
          { key: "colorFrom", label: "Gradient From", type: "text" },
          { key: "colorTo", label: "Gradient To", type: "text" },
          { key: "features", label: "Features (comma-separated)", type: "tags" },
        ]}
        newItemTemplate={{ iconName: "Code", title: "New Pillar", description: "", colorFrom: "from-primary", colorTo: "to-blue-600", features: [], displayOrder: 0, isActive: true }}
      />
      <GenericEntityEditor
        title="Domains"
        description="The technology domains shown in the Our Domains section."
        entity="domains"
        items={domains}
        fields={[
          { key: "iconName", label: "Icon", type: "icon-select" },
          { key: "title", label: "Title", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
          { key: "color", label: "Color (hex)", type: "color" },
        ]}
        newItemTemplate={{ iconName: "Code", title: "New Domain", description: "", color: "#4A90E2", displayOrder: 0, isActive: true }}
      />
    </div>
  )
}

// =========================================================
// EVENTS CONTENT
// =========================================================
function EventsContent({ events, settings }: any) {
  return (
    <div className="space-y-6">
      <GenericEntityEditor
        title="Events"
        description="Manage all events shown on the home page and /events page."
        entity="events"
        items={events}
        fields={[
          { key: "title", label: "Title", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
          { key: "date", label: "Date", type: "date" },
          { key: "time", label: "Time", type: "text" },
          { key: "location", label: "Location", type: "text" },
          { key: "type", label: "Type", type: "select", options: ["Workshop", "Contest", "Bootcamp", "Hackathon", "Webinar"] },
          { key: "status", label: "Status", type: "select", options: ["upcoming", "past"] },
          { key: "image", label: "Image URL", type: "image" },
          { key: "registrations", label: "Registrations", type: "number" },
          { key: "maxRegistrations", label: "Max Registrations", type: "number" },
          { key: "registrationUrl", label: "Registration URL", type: "text" },
        ]}
        newItemTemplate={{
          title: "New Event", description: "", date: new Date().toISOString().slice(0, 10),
          time: "10:00 AM", location: "TBD", type: "Workshop", status: "upcoming",
          image: "", registrations: 0, maxRegistrations: 100, registrationUrl: "",
          displayOrder: 0, isActive: true,
        }}
      />
    </div>
  )
}

// =========================================================
// ABOUT PAGE CONTENT
// =========================================================
function AboutContentTab({ missions, settings }: any) {
  return (
    <div className="space-y-6">
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Info className="h-5 w-5 text-[#4A90E2]" />
            About Page Hero / Vision / Faculty Advisor
          </CardTitle>
          <CardDescription className="text-[#B0B0B0]">
            Edit these via the &quot;General Settings&quot; tab. Search for: about_hero, about_vision, about_mission, faculty_advisor.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-[#B0B0B0] text-sm">
            All About-page text content (hero title, vision text, mission intro, faculty advisor name/position/department/bio/email/expertise) is stored as site settings and can be edited in the General Settings sub-tab above.
          </p>
        </CardContent>
      </Card>
      <GenericEntityEditor
        title="Mission Cards"
        description="The three mission principle cards on the About page."
        entity="missions"
        items={missions}
        fields={[
          { key: "iconName", label: "Icon", type: "icon-select" },
          { key: "title", label: "Title", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
        ]}
        newItemTemplate={{ iconName: "Target", title: "New Mission", description: "", displayOrder: 0, isActive: true }}
      />
    </div>
  )
}

// =========================================================
// RESOURCES CONTENT
// =========================================================
function ResourcesContentTab({ roadmaps, toolkits, projects, linkCategories, settings }: any) {
  return (
    <div className="space-y-6">
      <GenericEntityEditor
        title="Learning Roadmaps"
        description="Roadmaps shown in the Learning Roadmaps section of /resources."
        entity="resources"
        items={roadmaps}
        fields={[
          { key: "title", label: "Title", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
          { key: "difficulty", label: "Difficulty", type: "text" },
          { key: "duration", label: "Duration", type: "text" },
          { key: "topics", label: "Topics (comma-separated)", type: "tags" },
          { key: "url", label: "URL", type: "text" },
        ]}
        newItemTemplate={{
          category: "roadmap", title: "New Roadmap", description: "", difficulty: "Beginner",
          duration: "3 months", topics: [], url: "#", displayOrder: 0, isActive: true,
        }}
      />
      <GenericEntityEditor
        title="Development Toolkits"
        description="Toolkit cards shown in the Development Toolkits section."
        entity="resources"
        items={toolkits}
        fields={[
          { key: "title", label: "Title", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
          { key: "toolkitCategory", label: "Category", type: "select", options: ["Development", "Programming", "AI/ML", "Mobile", "Other"] },
          { key: "tools", label: "Tools (comma-separated)", type: "tags" },
          { key: "downloads", label: "Downloads", type: "number" },
        ]}
        newItemTemplate={{
          category: "toolkit", title: "New Toolkit", description: "", toolkitCategory: "Development",
          tools: [], downloads: 0, displayOrder: 0, isActive: true,
        }}
      />
      <GenericEntityEditor
        title="Club Projects"
        description="Projects shown in the Club Projects section."
        entity="resources"
        items={projects}
        fields={[
          { key: "title", label: "Title", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
          { key: "tech", label: "Tech Stack (comma-separated)", type: "tags" },
          { key: "author", label: "Author", type: "text" },
          { key: "stars", label: "Stars", type: "number" },
          { key: "github", label: "GitHub URL", type: "text" },
        ]}
        newItemTemplate={{
          category: "project", title: "New Project", description: "", tech: [], author: "",
          stars: 0, github: "https://github.com", displayOrder: 0, isActive: true,
        }}
      />
      <LinkCategoriesEditor items={linkCategories} />
    </div>
  )
}

function LinkCategoriesEditor({ items }: { items: any[] }) {
  const { toast } = useToast()
  const [expanded, setExpanded] = useState<string | null>(null)

  const createCategory = async () => {
    const res = await fetch(`${API_BASE}/resources`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: "link_category", title: "New Category", displayOrder: 0, isActive: true }),
    })
    if (!res.ok) {
      toast({ title: "Failed", variant: "destructive" })
      return
    }
    toast({ title: "Created", description: "Refresh the page to see the new category." })
  }

  const createLink = async (parentId: string) => {
    const res = await fetch(`${API_BASE}/resources`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: "link", parentId, title: "New Link", description: "", url: "#",
        displayOrder: 0, isActive: true,
      }),
    })
    if (!res.ok) {
      toast({ title: "Failed", variant: "destructive" })
      return
    }
    toast({ title: "Created", description: "Refresh the page to see the new link." })
  }

  return (
    <Card className="glass border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <ExternalLink className="h-5 w-5 text-[#FFD93D]" />
          Curated Link Categories
        </CardTitle>
        <CardDescription className="text-[#B0B0B0]">
          Categories with nested links shown in the Curated Links section.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 && (
          <p className="text-[#B0B0B0] text-sm text-center py-4">No categories yet.</p>
        )}
        {items.map((cat) => (
          <div key={cat.id} className="rounded-lg bg-[#1A1F2E]/50 border border-white/5 p-3">
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => setExpanded(expanded === cat.id ? null : cat.id)}
                className="text-[#E0E0E0] font-medium hover:text-[#4A90E2] flex items-center gap-2"
              >
                {cat.title}
                <Badge className="bg-[#1A1F2E] text-[#B0B0B0] border-white/10">{cat.links?.length || 0} links</Badge>
              </button>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" className="text-[#50C878] hover:bg-[#50C878]/10" onClick={() => createLink(cat.id)}>
                  <Plus className="h-3 w-3 mr-1" /> Add Link
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-400 hover:bg-red-500/10"
                  onClick={async () => {
                    if (!confirm(`Delete category "${cat.title}" and all its links?`)) return
                    // Delete all child links first
                    for (const link of cat.links || []) {
                      await fetch(`${API_BASE}/resources?id=${link.id}`, { method: "DELETE" })
                    }
                    await fetch(`${API_BASE}/resources?id=${cat.id}`, { method: "DELETE" })
                    toast({ title: "Deleted", description: "Refresh page to see changes." })
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
            {expanded === cat.id && (
              <div className="space-y-2 pl-4 border-l-2 border-[#4A90E2]/30 mt-2">
                {(cat.links || []).map((link: any) => (
                  <LinkEditor key={link.id} link={link} />
                ))}
                {(cat.links || []).length === 0 && (
                  <p className="text-[#B0B0B0] text-xs">No links yet. Click &quot;Add Link&quot;.</p>
                )}
              </div>
            )}
          </div>
        ))}
        <Button onClick={createCategory} variant="outline" className="border-[#4A90E2]/30 text-[#4A90E2]">
          <Plus className="h-4 w-4 mr-2" /> Add Category
        </Button>
      </CardContent>
    </Card>
  )
}

function LinkEditor({ link }: { link: any }) {
  const { toast } = useToast()
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(link.title)
  const [description, setDescription] = useState(link.description)
  const [url, setUrl] = useState(link.url)

  const save = async () => {
    const res = await fetch(`${API_BASE}/resources?id=${link.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, url }),
    })
    if (!res.ok) {
      toast({ title: "Failed", variant: "destructive" })
      return
    }
    setEditing(false)
    toast({ title: "Saved" })
  }

  const del = async () => {
    if (!confirm("Delete this link?")) return
    await fetch(`${API_BASE}/resources?id=${link.id}`, { method: "DELETE" })
    toast({ title: "Deleted", description: "Refresh page to see changes." })
  }

  if (!editing) {
    return (
      <div className="flex items-center justify-between py-2">
        <div className="flex-1 min-w-0">
          <p className="text-[#E0E0E0] text-sm truncate">{link.title}</p>
          <p className="text-[#B0B0B0] text-xs truncate">{link.url}</p>
        </div>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" className="text-[#4A90E2] hover:bg-[#4A90E2]/10 h-7" onClick={() => setEditing(true)}>
            <Edit className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" className="text-red-400 hover:bg-red-500/10 h-7" onClick={del}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2 py-2">
      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Link title" className="bg-[#1A1F2E] border-white/10 text-[#E0E0E0] text-sm h-8" />
      <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="bg-[#1A1F2E] border-white/10 text-[#E0E0E0] text-sm h-8" />
      <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="URL" className="bg-[#1A1F2E] border-white/10 text-[#E0E0E0] text-sm h-8" />
      <div className="flex gap-2">
        <Button size="sm" className="bg-[#50C878] hover:bg-[#5DD988] h-7" onClick={save}>
          <Save className="h-3 w-3 mr-1" /> Save
        </Button>
        <Button size="sm" variant="outline" className="border-white/10 text-[#B0B0B0] h-7" onClick={() => setEditing(false)}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

// =========================================================
// FOOTER CONTENT
// =========================================================
function FooterContent({ social, quickLinks, contacts, settings }: any) {
  return (
    <div className="space-y-6">
      <GenericEntityEditor
        title="Footer Social Links"
        description="Social media icons shown in the footer."
        entity="footer-social"
        items={social}
        fields={[
          { key: "platform", label: "Platform Key", type: "text" },
          { key: "label", label: "Label", type: "text" },
          { key: "url", label: "URL", type: "text" },
          { key: "iconName", label: "Icon", type: "icon-select" },
        ]}
        newItemTemplate={{
          platform: "website", label: "Website", url: "https://", iconName: "Globe",
          displayOrder: 0, isActive: true,
        }}
      />
      <GenericEntityEditor
        title="Footer Quick Links"
        description="Quick links shown in the footer (About, Events, Team, etc.)."
        entity="footer-quick-links"
        items={quickLinks}
        fields={[
          { key: "label", label: "Label", type: "text" },
          { key: "href", label: "Link (href)", type: "text" },
        ]}
        newItemTemplate={{ label: "New Link", href: "/", displayOrder: 0, isActive: true }}
      />
      <GenericEntityEditor
        title="Footer Contact Info"
        description="Address, email, phone shown in the footer."
        entity="footer-contacts"
        items={contacts}
        fields={[
          { key: "label", label: "Label", type: "text" },
          { key: "value", label: "Value (use \\n for line breaks)", type: "textarea" },
          { key: "iconName", label: "Icon", type: "icon-select" },
        ]}
        newItemTemplate={{ label: "Address", value: "", iconName: "MapPin", displayOrder: 0, isActive: true }}
      />
    </div>
  )
}

// =========================================================
// GENERIC ENTITY EDITOR
// =========================================================
interface FieldDef {
  key: string
  label: string
  type: "text" | "textarea" | "number" | "date" | "select" | "color" | "tags" | "icon-select" | "image"
  options?: string[]
}

function GenericEntityEditor({
  title,
  description,
  entity,
  items,
  fields,
  newItemTemplate,
}: {
  title: string
  description?: string
  entity: string
  items: any[]
  fields: FieldDef[]
  newItemTemplate: any
}) {
  const { toast } = useToast()
  const [editing, setEditing] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Record<string, any>>({})
  const [localItems, setLocalItems] = useState(items)

  const startEdit = (item: any) => {
    setEditing(item.id)
    setDrafts({ ...drafts, [item.id]: { ...item } })
  }
  const cancelEdit = () => {
    setEditing(null)
    setDrafts({ ...drafts })
  }
  const updateField = (id: string, key: string, value: any) => {
    setDrafts({ ...drafts, [id]: { ...drafts[id], [key]: value } })
  }
  const save = async (id: string) => {
    const draft = drafts[id]
    if (!draft) return
    const res = await fetch(`${API_BASE}/${entity}?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    })
    if (!res.ok) {
      toast({ title: "Failed", variant: "destructive" })
      return
    }
    setLocalItems(localItems.map((it) => (it.id === id ? { ...it, ...draft } : it)))
    setEditing(null)
    toast({ title: "Saved" })
  }
  const create = async () => {
    const res = await fetch(`${API_BASE}/${entity}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItemTemplate),
    })
    if (!res.ok) {
      toast({ title: "Failed", variant: "destructive" })
      return
    }
    const created = await res.json()
    setLocalItems([...localItems, created])
    toast({ title: "Created" })
  }
  const del = async (id: string) => {
    if (!confirm("Delete this item?")) return
    const res = await fetch(`${API_BASE}/${entity}?id=${id}`, { method: "DELETE" })
    if (!res.ok) {
      toast({ title: "Failed", variant: "destructive" })
      return
    }
    setLocalItems(localItems.filter((it) => it.id !== id))
    toast({ title: "Deleted" })
  }
  const toggleActive = async (item: any) => {
    const res = await fetch(`${API_BASE}/${entity}?id=${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !item.isActive }),
    })
    if (!res.ok) {
      toast({ title: "Failed", variant: "destructive" })
      return
    }
    setLocalItems(localItems.map((it) => (it.id === item.id ? { ...it, isActive: !it.isActive } : it)))
    toast({ title: item.isActive ? "Hidden" : "Shown" })
  }

  return (
    <Card className="glass border-white/10">
      <CardHeader>
        <CardTitle className="text-white">{title}</CardTitle>
        {description && <CardDescription className="text-[#B0B0B0]">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="max-h-[500px] overflow-y-auto space-y-2 pr-2">
          {localItems.length === 0 && (
            <p className="text-[#B0B0B0] text-sm text-center py-4">No items yet.</p>
          )}
          {localItems.map((item) => (
            <div key={item.id} className="rounded-lg bg-[#1A1F2E]/50 border border-white/5 p-3">
              {editing === item.id ? (
                <div className="space-y-3">
                  {fields.map((f) => (
                    <FieldInput
                      key={f.key}
                      field={f}
                      value={drafts[item.id]?.[f.key] ?? item[f.key]}
                      onChange={(v) => updateField(item.id, f.key, v)}
                    />
                  ))}
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-[#50C878] hover:bg-[#5DD988]" onClick={() => save(item.id)}>
                      <Save className="h-3 w-3 mr-1" /> Save
                    </Button>
                    <Button size="sm" variant="outline" className="border-white/10 text-[#B0B0B0]" onClick={cancelEdit}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  {item.iconName && <IconPreview name={item.iconName} />}
                  <div className="flex-1 min-w-0">
                    <p className="text-[#E0E0E0] font-medium truncate">
                      {item.title || item.label || item.value?.split("\n")[0] || item.platform || "Untitled"}
                    </p>
                    {(item.description || item.href || item.url) && (
                      <p className="text-[#B0B0B0] text-sm truncate">
                        {item.description || item.href || item.url}
                      </p>
                    )}
                  </div>
                  {item.isActive !== undefined && (
                    <Badge className={item.isActive ? "bg-[#50C878]/20 text-[#50C878] border-[#50C878]/30" : "bg-gray-500/20 text-gray-400 border-gray-500/30"}>
                      {item.isActive ? "Active" : "Hidden"}
                    </Badge>
                  )}
                  <Button size="sm" variant="ghost" className="text-[#B0B0B0] hover:bg-white/5 h-8" onClick={() => toggleActive(item)}>
                    {item.isActive ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  </Button>
                  <Button size="sm" variant="ghost" className="text-[#4A90E2] hover:bg-[#4A90E2]/10 h-8" onClick={() => startEdit(item)}>
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-red-400 hover:bg-red-500/10 h-8" onClick={() => del(item.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
        <Button onClick={create} variant="outline" className="border-[#50C878]/30 text-[#50C878]">
          <Plus className="h-4 w-4 mr-2" /> Add New
        </Button>
      </CardContent>
    </Card>
  )
}

function FieldInput({ field, value, onChange }: { field: FieldDef; value: any; onChange: (v: any) => void }) {
  const parseArr = (v: any): string[] => {
    if (Array.isArray(v)) return v
    if (typeof v === "string") {
      try {
        const p = JSON.parse(v)
        if (Array.isArray(p)) return p
      } catch {
        // assume comma-separated
      }
      return v.split(",").map((s) => s.trim()).filter(Boolean)
    }
    return []
  }
  const arrToString = (arr: string[]) => arr.join(", ")

  switch (field.type) {
    case "textarea":
      return (
        <div className="space-y-1">
          <Label className="text-[#E0E0E0] text-xs">{field.label}</Label>
          <Textarea
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
            className="bg-[#1A1F2E] border-white/10 text-[#E0E0E0] text-sm"
          />
        </div>
      )
    case "number":
      return (
        <div className="space-y-1">
          <Label className="text-[#E0E0E0] text-xs">{field.label}</Label>
          <Input
            type="number"
            value={value ?? 0}
            onChange={(e) => onChange(parseInt(e.target.value) || 0)}
            className="bg-[#1A1F2E] border-white/10 text-[#E0E0E0] text-sm"
          />
        </div>
      )
    case "date":
      return (
        <div className="space-y-1">
          <Label className="text-[#E0E0E0] text-xs">{field.label}</Label>
          <Input
            type="date"
            value={value ? new Date(value).toISOString().slice(0, 10) : ""}
            onChange={(e) => onChange(e.target.value ? new Date(e.target.value).toISOString() : null)}
            className="bg-[#1A1F2E] border-white/10 text-[#E0E0E0] text-sm"
          />
        </div>
      )
    case "select":
      return (
        <div className="space-y-1">
          <Label className="text-[#E0E0E0] text-xs">{field.label}</Label>
          <select
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 bg-[#1A1F2E] border border-white/10 rounded-lg text-[#E0E0E0] text-sm"
          >
            {field.options?.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      )
    case "color":
      return (
        <div className="space-y-1">
          <Label className="text-[#E0E0E0] text-xs">{field.label}</Label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={value || "#4A90E2"}
              onChange={(e) => onChange(e.target.value)}
              className="h-8 w-12 rounded cursor-pointer bg-transparent border border-white/10"
            />
            <Input
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              className="bg-[#1A1F2E] border-white/10 text-[#E0E0E0] text-sm"
            />
          </div>
        </div>
      )
    case "tags":
      return (
        <div className="space-y-1">
          <Label className="text-[#E0E0E0] text-xs">{field.label}</Label>
          <Input
            value={arrToString(parseArr(value))}
            onChange={(e) => onChange(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
            className="bg-[#1A1F2E] border-white/10 text-[#E0E0E0] text-sm"
            placeholder="item1, item2, item3"
          />
        </div>
      )
    case "icon-select":
      return (
        <div className="space-y-1">
          <Label className="text-[#E0E0E0] text-xs">{field.label}</Label>
          <div className="flex items-center gap-2">
            {value && <IconPreview name={value} />}
            <select
              value={value || "Code"}
              onChange={(e) => onChange(e.target.value)}
              className="flex-1 px-3 py-2 bg-[#1A1F2E] border border-white/10 rounded-lg text-[#E0E0E0] text-sm"
            >
              {COMMON_ICONS.map((icon) => (
                <option key={icon} value={icon}>{icon}</option>
              ))}
            </select>
          </div>
        </div>
      )
    case "image":
      return (
        <div className="space-y-1">
          <Label className="text-[#E0E0E0] text-xs">{field.label}</Label>
          {value && (
            <div className="mb-2">
              <img src={value} alt="" className="w-20 h-20 object-cover rounded" />
            </div>
          )}
          <Input
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="bg-[#1A1F2E] border-white/10 text-[#E0E0E0] text-sm"
            placeholder="/path/to/image or URL"
          />
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (!file) return
              const fd = new FormData()
              fd.append("file", file)
              fd.append("subdir", "general")
              const res = await fetch("/api/uploads", { method: "POST", body: fd })
              if (res.ok) {
                const { url } = await res.json()
                onChange(url)
              }
            }}
            className="block w-full text-xs text-[#B0B0B0] file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:bg-[#4A90E2] file:text-white file:cursor-pointer file:text-xs"
          />
        </div>
      )
    default: // text
      return (
        <div className="space-y-1">
          <Label className="text-[#E0E0E0] text-xs">{field.label}</Label>
          <Input
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="bg-[#1A1F2E] border-white/10 text-[#E0E0E0] text-sm"
          />
        </div>
      )
  }
}

function IconPreview({ name }: { name: string }) {
  return (
    <div className="w-8 h-8 rounded bg-[#1A1F2E] border border-white/10 flex items-center justify-center flex-shrink-0">
      <IconByName name={name} className="h-4 w-4 text-[#4A90E2]" />
    </div>
  )
}
