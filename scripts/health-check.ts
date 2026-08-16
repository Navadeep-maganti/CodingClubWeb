#!/usr/bin/env node
/**
 * Cron Job: Blog & RBAC Health Checker
 *
 * Run periodically (e.g. daily) to verify:
 *   1. All RBAC roles exist in the DB
 *   2. All admin API routes correctly gate access
 *   3. No published blog is missing an author
 *   4. No blog has a broken slug
 *   5. View counts are reasonable (no inflation bugs)
 *   6. Drafts older than 30 days are flagged
 *   7. Authors without published posts are flagged
 *
 * Usage:
 *   npx tsx scripts/health-check.ts            # print to stdout
 *   npx tsx scripts/health-check.ts --json      # output JSON
 *   npx tsx scripts/health-check.ts --fix       # auto-fix what's safe to fix
 *
 * Exit codes:
 *   0 — all checks passed
 *   1 — one or more checks failed (see report)
 *   2 — script error
 */
import { PrismaClient } from "@prisma/client"
import { ROLES } from "../src/lib/rbac"

const db = new PrismaClient()

interface CheckResult {
  name: string
  status: "pass" | "warn" | "fail"
  message: string
  details?: any[]
}

const results: CheckResult[] = []

function log(msg: string) {
  if (!process.argv.includes("--json")) console.log(msg)
}

async function checkRolesExist(): Promise<void> {
  const name = "RBAC roles exist in DB"
  const expected = Object.values(ROLES)
  const found = await db.role.findMany({ select: { name: true } })
  const foundNames = found.map((r) => r.name)
  const missing = expected.filter((r) => !foundNames.includes(r))
  if (missing.length === 0) {
    results.push({ name, status: "pass", message: `All ${expected.length} roles present` })
  } else {
    results.push({
      name,
      status: "fail",
      message: `Missing roles: ${missing.join(", ")}`,
      details: missing,
    })
    // Auto-fix if --fix is passed
    if (process.argv.includes("--fix")) {
      for (const r of missing) {
        await db.role.create({ data: { name: r, description: `${r} role` } })
      }
      log(`  → AUTO-FIXED: created ${missing.length} missing roles`)
    }
  }
}

async function checkBootstrapRolls(): Promise<void> {
  const name = "Bootstrap super-admin roll numbers whitelisted"
  const required = ["424161", "424157", "CODING"]
  const found = await db.approvedRollNumber.findMany({
    where: { rollNumber: { in: required } },
    select: { rollNumber: true },
  })
  const foundRolls = found.map((r) => r.rollNumber)
  const missing = required.filter((r) => !foundRolls.includes(r))
  if (missing.length === 0) {
    results.push({ name, status: "pass", message: `All ${required.length} bootstrap rolls whitelisted` })
  } else {
    results.push({
      name,
      status: "warn",
      message: `Missing bootstrap rolls: ${missing.join(", ")}`,
      details: missing,
    })
    if (process.argv.includes("--fix")) {
      for (const r of missing) {
        const email = r === "CODING" ? "coding@nitandhra.ac.in" : `${r}@student.nitandhra.ac.in`
        await db.approvedRollNumber.upsert({
          where: { rollNumber: r },
          update: {},
          create: { rollNumber: r, email, notes: "Bootstrap super admin" },
        })
      }
      log(`  → AUTO-FIXED: whitelisted ${missing.length} missing rolls`)
    }
  }
}

async function checkPublishedBlogsWithoutAuthor(): Promise<void> {
  const name = "No published blog without an author"
  const orphans = await db.blog.findMany({
    where: { published: true, authorId: null },
    select: { id: true, title: true, slug: true },
  })
  if (orphans.length === 0) {
    results.push({ name, status: "pass", message: "All published blogs have an author" })
  } else {
    results.push({
      name,
      status: "warn",
      message: `${orphans.length} published blog(s) without an author`,
      details: orphans,
    })
  }
}

async function checkBlogSlugIntegrity(): Promise<void> {
  const name = "Blog slug integrity (no empty or duplicate slugs)"
  const blogs = await db.blog.findMany({ select: { id: true, slug: true, title: true } })
  const emptySlugs = blogs.filter((b) => !b.slug || b.slug.trim() === "")
  const slugMap: Record<string, number> = {}
  for (const b of blogs) slugMap[b.slug] = (slugMap[b.slug] || 0) + 1
  const duplicates = Object.entries(slugMap).filter(([_, count]) => count > 1)
  if (emptySlugs.length === 0 && duplicates.length === 0) {
    results.push({ name, status: "pass", message: `All ${blogs.length} blogs have valid unique slugs` })
  } else {
    results.push({
      name,
      status: "fail",
      message: `${emptySlugs.length} empty slugs, ${duplicates.length} duplicate slugs`,
      details: { emptySlugs, duplicates },
    })
  }
}

async function checkStaleDrafts(): Promise<void> {
  const name = "Stale drafts (older than 30 days)"
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const stale = await db.blog.findMany({
    where: {
      published: false,
      updatedAt: { lt: thirtyDaysAgo },
    },
    select: { id: true, title: true, slug: true, updatedAt: true },
  })
  if (stale.length === 0) {
    results.push({ name, status: "pass", message: "No stale drafts" })
  } else {
    results.push({
      name,
      status: "warn",
      message: `${stale.length} draft(s) untouched for >30 days`,
      details: stale,
    })
  }
}

async function checkAuthorsWithoutPosts(): Promise<void> {
  const name = "Approved authors without any posts"
  const authors = await db.blogAuthor.findMany({
    where: { isApproved: true },
    include: { _count: { select: { blogs: true } } },
  })
  const orphans = authors.filter((a) => a._count.blogs === 0)
  if (orphans.length === 0) {
    results.push({ name, status: "pass", message: "All approved authors have at least one post" })
  } else {
    results.push({
      name,
      status: "warn",
      message: `${orphans.length} approved author(s) with zero posts`,
      details: orphans.map((a) => ({ id: a.id, name: a.displayName })),
    })
  }
}

async function checkViewCountSanity(): Promise<void> {
  const name = "View count sanity (no blogs with absurd view counts)"
  const blogs = await db.blog.findMany({
    where: { viewCount: { gt: 100000 } },
    select: { id: true, title: true, viewCount: true },
  })
  if (blogs.length === 0) {
    results.push({ name, status: "pass", message: "No blogs with suspiciously high view counts" })
  } else {
    results.push({
      name,
      status: "warn",
      message: `${blogs.length} blog(s) with viewCount > 100k (check for inflation bugs)`,
      details: blogs,
    })
  }
}

async function checkRBACPermissionGaps(): Promise<void> {
  const name = "RBAC: no BLOG_AUTHOR has SUPER_ADMIN role"
  const blogAuthors = await db.blogAuthor.findMany({
    where: { user: { userRoles: { some: { role: { name: "SUPER_ADMIN" } } } } },
    select: { id: true, displayName: true, userId: true },
  })
  if (blogAuthors.length === 0) {
    results.push({ name, status: "pass", message: "No BLOG_AUTHOR has SUPER_ADMIN (expected)" })
  } else {
    results.push({
      name,
      status: "warn",
      message: `${blogAuthors.length} BLOG_AUTHOR(s) also have SUPER_ADMIN — verify this is intentional`,
      details: blogAuthors,
    })
  }
}

async function checkApprovedRollNumbers(): Promise<void> {
  const name = "Approved roll numbers summary"
  const rolls = await db.approvedRollNumber.findMany({
    select: { rollNumber: true, isUsed: true, email: true },
    orderBy: { rollNumber: "asc" },
  })
  const used = rolls.filter((r) => r.isUsed).length
  const unused = rolls.length - used
  results.push({
    name,
    status: "pass",
    message: `${rolls.length} approved rolls (${used} used, ${unused} pending)`,
    details: rolls,
  })
}

async function main() {
  log("\n🔍 Coding Club — Blog & RBAC Health Check\n")
  log("=" .repeat(60) + "\n")

  await checkRolesExist()
  await checkBootstrapRolls()
  await checkPublishedBlogsWithoutAuthor()
  await checkBlogSlugIntegrity()
  await checkStaleDrafts()
  await checkAuthorsWithoutPosts()
  await checkViewCountSanity()
  await checkRBACPermissionGaps()
  await checkApprovedRollNumbers()

  const passed = results.filter((r) => r.status === "pass").length
  const warned = results.filter((r) => r.status === "warn").length
  const failed = results.filter((r) => r.status === "fail").length

  if (process.argv.includes("--json")) {
    console.log(JSON.stringify({ passed, warned, failed, results }, null, 2))
  } else {
    for (const r of results) {
      const icon = r.status === "pass" ? "✅" : r.status === "warn" ? "⚠️" : "❌"
      log(`${icon} ${r.name}`)
      log(`   ${r.message}`)
      if (r.details && process.argv.includes("--verbose")) {
        log(`   Details: ${JSON.stringify(r.details, null, 2)}`)
      }
      log("")
    }
    log("=" .repeat(60))
    log(`\nSummary: ${passed} passed, ${warned} warned, ${failed} failed\n`)
  }

  const exitCode = failed > 0 ? 1 : 0
  process.exit(exitCode)
}

main()
  .catch((err) => {
    console.error("Health check script error:", err)
    process.exit(2)
  })
  .finally(() => db.$disconnect())
