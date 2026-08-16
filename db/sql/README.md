# Coding Club Database

This folder contains PostgreSQL SQL files for production deployment.

> **Note**: The sandbox runtime uses SQLite at `file:/home/z/my-project/db/custom.db`.
> These SQL files are for **production PostgreSQL** deployments only.

## Files

| File | Purpose |
|------|---------|
| `schema.sql` | Complete schema definition (clean slate). Drops existing tables and recreates them. |
| `migration.sql` | Incremental migration. Uses `CREATE TABLE IF NOT EXISTS` and `ADD COLUMN IF NOT EXISTS` so it is safe to run on existing databases. |
| `seed.sql` | Initial seed data: roles, blog categories, tags, blog authors, blog posts, tag mappings, and a sample team member. |

## Usage

### Fresh install
```bash
# 1. Create the database
createdb coding_club

# 2. Apply schema
psql -U <user> -d coding_club -f db/sql/schema.sql

# 3. Seed initial data
psql -U <user> -d coding_club -f db/sql/seed.sql

# 4. (Optional) Run the TypeScript seed script for full team data
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/coding_club bun run scripts/seed.ts
```

### Updating an existing database
```bash
psql -U <user> -d coding_club -f db/sql/migration.sql
```

## ER Diagram (textual)

```
users 1---* accounts
users 1---* sessions
users 1---* user_roles *---1 roles
users 1---1 team_members 1---* social_links
users 1---? blog_authors 1---* blogs
blog_categories 1---* blogs
users 1---* blogs (created_by_id)
blogs *---* blog_tags (via blog_tag_map)
blogs 1---* blog_comments
users 1---* blog_comments
users 1---* audit_logs (as actor)
users 1---* approved_roll_numbers (as added_by)
```

## Tables Overview

| Table | Purpose |
|-------|---------|
| `users` | Authenticated users (created on first OAuth login) |
| `accounts` | NextAuth OAuth provider linkage |
| `sessions` | NextAuth database sessions |
| `verification_tokens` | NextAuth email verification tokens |
| `approved_roll_numbers` | Whitelist of NITAP roll numbers allowed to sign in |
| `roles` | RBAC role definitions (SUPER_ADMIN, MEMBER, BLOG_AUTHOR) |
| `user_roles` | Many-to-many user ↔ role |
| `team_members` | Public team page data (name, position, bio, image, strengths, etc.) |
| `social_links` | GitHub/LinkedIn/Twitter/etc. links for team members |
| `blog_authors` | Author profiles (linked or external) |
| `blogs` | Blog posts (drafts + published) |
| `blog_categories` | Blog categories (Web Dev, ML, DSA, etc.) |
| `blog_tags` | Tag definitions |
| `blog_tag_map` | Many-to-many blog ↔ tag |
| `blog_comments` | Comments on blog posts (with nested replies support) |
| `audit_logs` | Audit trail of all admin actions |
