import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { uploadImage } from "@/lib/storage"
import { logAudit } from "@/lib/audit"
import { ROLES } from "@/lib/rbac"

/**
 * POST /api/uploads
 * Uploads an image file to the configured storage provider
 * (Supabase Storage in production, local FS in sandbox/dev).
 *
 * Authenticated users with MEMBER, BLOG_AUTHOR, ADMIN, or SUPER_ADMIN roles
 * can upload images.
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Anyone authenticated with at least MEMBER role can upload images
    const roles = session.user.roles || []
    const allowed = [ROLES.MEMBER, ROLES.BLOG_AUTHOR, ROLES.ADMIN, ROLES.SUPER_ADMIN]
    if (!roles.some((r) => allowed.includes(r as never))) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const subdir = (formData.get("subdir") as string) || "general"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Allow only safe subdirs
    const safeSubdir = ["general", "profile", "blog", "team"].includes(subdir) ? subdir : "general"

    const result = await uploadImage(file, safeSubdir)

    await logAudit({
      actorId: session.user.id,
      action: "IMAGE_UPLOADED",
      entityType: "Image",
      entityId: result.url,
      metadata: { filename: result.filename, size: result.size, mimetype: result.mimetype },
    })

    return NextResponse.json(result)
  } catch (err) {
    console.error("[api/uploads] error:", err)
    const message = err instanceof Error ? err.message : "Upload failed"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
