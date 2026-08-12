/**
 * Role constants and RBAC helpers.
 *
 * Roles (in order of privilege):
 *   SUPER_ADMIN  — full system access, including user role management & audit log
 *   ADMIN        — content/team/blog management, but NO user role changes, NO audit log
 *   BLOG_AUTHOR  — blog authoring rights (own blogs only)
 *   MEMBER       — base authenticated user with profile access
 *
 * Permission matrix is enforced at the data-access layer
 * (server actions, API routes) — never trust the client alone.
 */

export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  MEMBER: "MEMBER",
  BLOG_AUTHOR: "BLOG_AUTHOR",
} as const

export type RoleName = (typeof ROLES)[keyof typeof ROLES]

export const ALL_ROLES: RoleName[] = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.BLOG_AUTHOR,
  ROLES.MEMBER,
]

/**
 * Permission matrix - role -> set of permissions.
 * ADMIN inherits everything from BLOG_AUTHOR + content management.
 * SUPER_ADMIN inherits everything from ADMIN + user management + audit.
 */
export const PERMISSIONS = {
  // Member management
  ADD_APPROVED_ROLL: "ADD_APPROVED_ROLL",
  REMOVE_APPROVED_ROLL: "REMOVE_APPROVED_ROLL",
  PROMOTE_MEMBER: "PROMOTE_MEMBER",
  DEMOTE_MEMBER: "DEMOTE_MEMBER",
  EDIT_ANY_PROFILE: "EDIT_ANY_PROFILE",
  DELETE_ANY_PROFILE: "DELETE_ANY_PROFILE",

  // Team management
  MANAGE_TEAM: "MANAGE_TEAM",
  UPLOAD_PHOTOS: "UPLOAD_PHOTOS",

  // Blog management
  MANAGE_BLOGS: "MANAGE_BLOGS",       // any blog (admin)
  PUBLISH_BLOG: "PUBLISH_BLOG",
  DELETE_ANY_BLOG: "DELETE_ANY_BLOG",
  APPROVE_BLOG_AUTHORS: "APPROVE_BLOG_AUTHORS",

  // Self-service
  EDIT_OWN_PROFILE: "EDIT_OWN_PROFILE",
  UPLOAD_PROFILE_IMAGE: "UPLOAD_PROFILE_IMAGE",
  UPDATE_STRENGTHS: "UPDATE_STRENGTHS",
  UPDATE_SOCIAL_LINKS: "UPDATE_SOCIAL_LINKS",
  UPDATE_BIO: "UPDATE_BIO",

  // Author
  CREATE_BLOG: "CREATE_BLOG",
  EDIT_OWN_BLOG: "EDIT_OWN_BLOG",
  DELETE_OWN_BLOG: "DELETE_OWN_BLOG",

  // Analytics & audit
  VIEW_ANALYTICS: "VIEW_ANALYTICS",
  VIEW_AUDIT_LOG: "VIEW_AUDIT_LOG",

  // Dashboard access
  ACCESS_MEMBER_DASHBOARD: "ACCESS_MEMBER_DASHBOARD",
  ACCESS_ADMIN_DASHBOARD: "ACCESS_ADMIN_DASHBOARD",
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

/**
 * Map role -> permissions granted by that role.
 * Inheritance chain: SUPER_ADMIN > ADMIN > BLOG_AUTHOR > MEMBER
 */
const MEMBER_PERMS: Permission[] = [
  PERMISSIONS.EDIT_OWN_PROFILE,
  PERMISSIONS.UPLOAD_PROFILE_IMAGE,
  PERMISSIONS.UPDATE_STRENGTHS,
  PERMISSIONS.UPDATE_SOCIAL_LINKS,
  PERMISSIONS.UPDATE_BIO,
  PERMISSIONS.ACCESS_MEMBER_DASHBOARD,
]

const BLOG_AUTHOR_PERMS: Permission[] = [
  ...MEMBER_PERMS,
  PERMISSIONS.CREATE_BLOG,
  PERMISSIONS.EDIT_OWN_BLOG,
  PERMISSIONS.DELETE_OWN_BLOG,
]

const ADMIN_PERMS: Permission[] = [
  ...BLOG_AUTHOR_PERMS,
  // Team & content management
  PERMISSIONS.MANAGE_TEAM,
  PERMISSIONS.UPLOAD_PHOTOS,
  PERMISSIONS.MANAGE_BLOGS,
  PERMISSIONS.PUBLISH_BLOG,
  PERMISSIONS.DELETE_ANY_BLOG,
  PERMISSIONS.APPROVE_BLOG_AUTHORS,
  PERMISSIONS.EDIT_ANY_PROFILE,
  PERMISSIONS.VIEW_ANALYTICS,
  PERMISSIONS.ACCESS_ADMIN_DASHBOARD,
  // NOTE: ADMIN does NOT get ADD_APPROVED_ROLL, REMOVE_APPROVED_ROLL,
  //       PROMOTE_MEMBER, DEMOTE_MEMBER, DELETE_ANY_PROFILE, VIEW_AUDIT_LOG
]

const SUPER_ADMIN_PERMS: Permission[] = [
  ...ADMIN_PERMS,
  // User & role management — SUPER_ADMIN only
  PERMISSIONS.ADD_APPROVED_ROLL,
  PERMISSIONS.REMOVE_APPROVED_ROLL,
  PERMISSIONS.PROMOTE_MEMBER,
  PERMISSIONS.DEMOTE_MEMBER,
  PERMISSIONS.DELETE_ANY_PROFILE,
  PERMISSIONS.VIEW_AUDIT_LOG,
]

export const ROLE_PERMISSIONS: Record<RoleName, Permission[]> = {
  [ROLES.MEMBER]: MEMBER_PERMS,
  [ROLES.BLOG_AUTHOR]: BLOG_AUTHOR_PERMS,
  [ROLES.ADMIN]: ADMIN_PERMS,
  [ROLES.SUPER_ADMIN]: SUPER_ADMIN_PERMS,
}

/**
 * Get effective permissions for a user with multiple roles.
 * Returns union of all role permissions.
 */
export function getPermissions(roles: RoleName[]): Set<Permission> {
  const perms = new Set<Permission>()
  for (const role of roles) {
    const rolePerms = ROLE_PERMISSIONS[role]
    if (rolePerms) {
      for (const p of rolePerms) perms.add(p)
    }
  }
  return perms
}

export function hasPermission(roles: RoleName[], permission: Permission): boolean {
  return getPermissions(roles).has(permission)
}

export function hasAnyRole(roles: RoleName[], required: RoleName[]): boolean {
  return required.some((r) => roles.includes(r))
}

/**
 * Roles that grant admin dashboard access.
 * Used by /dashboard/admin page guard.
 */
export const ADMIN_DASHBOARD_ROLES: RoleName[] = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.BLOG_AUTHOR]

/**
 * Returns the highest-privilege role a user has.
 * Useful for default-tab logic in the admin dashboard.
 */
export function getHighestRole(roles: RoleName[]): RoleName | null {
  if (roles.includes(ROLES.SUPER_ADMIN)) return ROLES.SUPER_ADMIN
  if (roles.includes(ROLES.ADMIN)) return ROLES.ADMIN
  if (roles.includes(ROLES.BLOG_AUTHOR)) return ROLES.BLOG_AUTHOR
  if (roles.includes(ROLES.MEMBER)) return ROLES.MEMBER
  return null
}
