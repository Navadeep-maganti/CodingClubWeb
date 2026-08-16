-- =============================================================
-- Coding Club NIT Andhra Pradesh - Migration Script (PostgreSQL)
-- =============================================================
-- This script migrates an EXISTING database to the latest schema.
-- If you are starting fresh, use schema.sql instead.
--
-- It uses CREATE TABLE IF NOT EXISTS so existing tables are
-- left untouched, and ALTER TABLE ... ADD COLUMN IF NOT EXISTS
-- to add any missing columns.
--
-- Usage:
--   psql -U <user> -d <db> -f migration.sql
-- =============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Roles
CREATE TABLE IF NOT EXISTS roles (
  id          VARCHAR(30) PRIMARY KEY,
  name        VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Users
CREATE TABLE IF NOT EXISTS users (
  id            VARCHAR(30) PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  name          VARCHAR(200),
  roll_number   VARCHAR(20) UNIQUE,
  image         VARCHAR(500),
  email_verified TIMESTAMP,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_roll_number ON users(roll_number);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

ALTER TABLE users ADD COLUMN IF NOT EXISTS roll_number VARCHAR(20) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- Accounts
CREATE TABLE IF NOT EXISTS accounts (
  id                  VARCHAR(30) PRIMARY KEY,
  user_id             VARCHAR(30) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type                VARCHAR(50) NOT NULL,
  provider            VARCHAR(50) NOT NULL,
  provider_account_id VARCHAR(200) NOT NULL,
  refresh_token       TEXT,
  access_token        TEXT,
  expires_at          INTEGER,
  token_type          VARCHAR(50),
  scope               TEXT,
  id_token            TEXT,
  session_state       TEXT,
  UNIQUE(provider, provider_account_id)
);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);

-- Sessions
CREATE TABLE IF NOT EXISTS sessions (
  id            VARCHAR(30) PRIMARY KEY,
  session_token VARCHAR(255) NOT NULL UNIQUE,
  user_id       VARCHAR(30) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires       TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

-- Verification tokens
CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier VARCHAR(255) NOT NULL,
  token      VARCHAR(255) NOT NULL UNIQUE,
  expires    TIMESTAMP NOT NULL,
  UNIQUE(identifier, token)
);

-- Approved roll numbers
CREATE TABLE IF NOT EXISTS approved_roll_numbers (
  id           VARCHAR(30) PRIMARY KEY,
  roll_number  VARCHAR(20) NOT NULL UNIQUE,
  email        VARCHAR(255),
  added_by_id  VARCHAR(30) REFERENCES users(id) ON DELETE SET NULL,
  notes        TEXT,
  is_used      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_approved_roll_number ON approved_roll_numbers(roll_number);
CREATE INDEX IF NOT EXISTS idx_approved_is_used ON approved_roll_numbers(is_used);

-- User roles
CREATE TABLE IF NOT EXISTS user_roles (
  id            VARCHAR(30) PRIMARY KEY,
  user_id       VARCHAR(30) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id       VARCHAR(30) NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  assigned_by_id VARCHAR(30) REFERENCES users(id) ON DELETE SET NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role_id)
);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);

-- Team members
CREATE TABLE IF NOT EXISTS team_members (
  id            VARCHAR(30) PRIMARY KEY,
  user_id       VARCHAR(30) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  name          VARCHAR(200) NOT NULL,
  position      VARCHAR(100) NOT NULL,
  bio           TEXT,
  profile_image VARCHAR(500),
  strengths     TEXT NOT NULL DEFAULT '[]',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured   BOOLEAN NOT NULL DEFAULT FALSE,
  category      VARCHAR(50) NOT NULL DEFAULT 'Member',
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_team_members_display_order ON team_members(display_order);
CREATE INDEX IF NOT EXISTS idx_team_members_is_active ON team_members(is_active);
CREATE INDEX IF NOT EXISTS idx_team_members_category ON team_members(category);

ALTER TABLE team_members ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS category VARCHAR(50) NOT NULL DEFAULT 'Member';

-- Social links
CREATE TABLE IF NOT EXISTS social_links (
  id             VARCHAR(30) PRIMARY KEY,
  team_member_id VARCHAR(30) NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  platform       VARCHAR(50) NOT NULL,
  url            VARCHAR(500) NOT NULL,
  created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(team_member_id, platform)
);
CREATE INDEX IF NOT EXISTS idx_social_links_team_member_id ON social_links(team_member_id);

-- Blog authors
CREATE TABLE IF NOT EXISTS blog_authors (
  id           VARCHAR(30) PRIMARY KEY,
  user_id      VARCHAR(30) UNIQUE REFERENCES users(id) ON DELETE SET NULL,
  display_name VARCHAR(200) NOT NULL,
  bio          TEXT,
  avatar       VARCHAR(500),
  is_approved  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_blog_authors_user_id ON blog_authors(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_authors_is_approved ON blog_authors(is_approved);

-- Blog categories
CREATE TABLE IF NOT EXISTS blog_categories (
  id        VARCHAR(30) PRIMARY KEY,
  name      VARCHAR(100) NOT NULL UNIQUE,
  slug      VARCHAR(120) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Blog tags
CREATE TABLE IF NOT EXISTS blog_tags (
  id        VARCHAR(30) PRIMARY KEY,
  name      VARCHAR(100) NOT NULL UNIQUE,
  slug      VARCHAR(120) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Blogs
CREATE TABLE IF NOT EXISTS blogs (
  id            VARCHAR(30) PRIMARY KEY,
  title         VARCHAR(300) NOT NULL,
  slug          VARCHAR(300) NOT NULL UNIQUE,
  excerpt       VARCHAR(500) NOT NULL,
  content       TEXT NOT NULL,
  cover_image   VARCHAR(500),
  published     BOOLEAN NOT NULL DEFAULT FALSE,
  featured      BOOLEAN NOT NULL DEFAULT FALSE,
  read_time     VARCHAR(50),
  view_count    INTEGER NOT NULL DEFAULT 0,
  published_at  TIMESTAMP,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  author_id     VARCHAR(30) REFERENCES blog_authors(id) ON DELETE SET NULL,
  category_id   VARCHAR(30) REFERENCES blog_categories(id) ON DELETE SET NULL,
  created_by_id VARCHAR(30) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_published ON blogs(published);
CREATE INDEX IF NOT EXISTS idx_blogs_featured ON blogs(featured);
CREATE INDEX IF NOT EXISTS idx_blogs_author_id ON blogs(author_id);
CREATE INDEX IF NOT EXISTS idx_blogs_category_id ON blogs(category_id);
CREATE INDEX IF NOT EXISTS idx_blogs_published_at ON blogs(published_at);

ALTER TABLE blogs ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS created_by_id VARCHAR(30) REFERENCES users(id) ON DELETE SET NULL;

-- Blog tag map
CREATE TABLE IF NOT EXISTS blog_tag_map (
  id         VARCHAR(30) PRIMARY KEY,
  blog_id    VARCHAR(30) NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
  tag_id     VARCHAR(30) NOT NULL REFERENCES blog_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(blog_id, tag_id)
);
CREATE INDEX IF NOT EXISTS idx_blog_tag_map_blog_id ON blog_tag_map(blog_id);
CREATE INDEX IF NOT EXISTS idx_blog_tag_map_tag_id ON blog_tag_map(tag_id);

-- Blog comments
CREATE TABLE IF NOT EXISTS blog_comments (
  id           VARCHAR(30) PRIMARY KEY,
  blog_id      VARCHAR(30) NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
  user_id      VARCHAR(30) REFERENCES users(id) ON DELETE SET NULL,
  author_name  VARCHAR(200) NOT NULL,
  author_email VARCHAR(255),
  content      TEXT NOT NULL,
  is_approved  BOOLEAN NOT NULL DEFAULT FALSE,
  parent_id    VARCHAR(30),
  created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_blog_comments_blog_id ON blog_comments(blog_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_user_id ON blog_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_is_approved ON blog_comments(is_approved);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id          VARCHAR(30) PRIMARY KEY,
  actor_id    VARCHAR(30) REFERENCES users(id) ON DELETE SET NULL,
  action      VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id   VARCHAR(30),
  metadata    TEXT,
  ip_address  VARCHAR(45),
  user_agent  TEXT,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Trigger to keep updated_at current
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_approved_roll_numbers_updated_at ON approved_roll_numbers;
CREATE TRIGGER update_approved_roll_numbers_updated_at BEFORE UPDATE ON approved_roll_numbers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_team_members_updated_at ON team_members;
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_social_links_updated_at ON social_links;
CREATE TRIGGER update_social_links_updated_at BEFORE UPDATE ON social_links FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_blog_authors_updated_at ON blog_authors;
CREATE TRIGGER update_blog_authors_updated_at BEFORE UPDATE ON blog_authors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_blogs_updated_at ON blogs;
CREATE TRIGGER update_blogs_updated_at BEFORE UPDATE ON blogs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_blog_comments_updated_at ON blog_comments;
CREATE TRIGGER update_blog_comments_updated_at BEFORE UPDATE ON blog_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================
-- DYNAMIC SITE CONTENT (CMS) - Added in v2
-- =============================================================

-- Site-wide key/value settings
CREATE TABLE IF NOT EXISTS site_settings (
  key        VARCHAR(100) PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Pillars (Who We Are section)
CREATE TABLE IF NOT EXISTS pillars (
  id            VARCHAR(30) PRIMARY KEY,
  title         VARCHAR(200) NOT NULL,
  description   TEXT,
  icon_name     VARCHAR(50) NOT NULL DEFAULT 'Code',
  color_from    VARCHAR(100) NOT NULL DEFAULT 'from-primary',
  color_to     VARCHAR(100) NOT NULL DEFAULT 'to-blue-600',
  features      TEXT NOT NULL DEFAULT '[]',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pillars_display_order ON pillars(display_order);
CREATE INDEX IF NOT EXISTS idx_pillars_is_active ON pillars(is_active);

-- Domains
CREATE TABLE IF NOT EXISTS domains (
  id            VARCHAR(30) PRIMARY KEY,
  title         VARCHAR(200) NOT NULL,
  description   TEXT,
  icon_name     VARCHAR(50) NOT NULL DEFAULT 'Code',
  color         VARCHAR(20) NOT NULL DEFAULT '#4A90E2',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_domains_display_order ON domains(display_order);
CREATE INDEX IF NOT EXISTS idx_domains_is_active ON domains(is_active);

-- Hero stats
CREATE TABLE IF NOT EXISTS hero_stats (
  id            VARCHAR(30) PRIMARY KEY,
  icon_name     VARCHAR(50) NOT NULL DEFAULT 'Users',
  value         VARCHAR(50) NOT NULL DEFAULT '0+',
  label         VARCHAR(200) NOT NULL,
  description   TEXT,
  gradient      VARCHAR(100) NOT NULL DEFAULT 'from-blue-500 to-blue-600',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_hero_stats_display_order ON hero_stats(display_order);
CREATE INDEX IF NOT EXISTS idx_hero_stats_is_active ON hero_stats(is_active);

-- Events
CREATE TABLE IF NOT EXISTS events (
  id                VARCHAR(30) PRIMARY KEY,
  title             VARCHAR(300) NOT NULL,
  description       TEXT,
  date              TIMESTAMP NOT NULL,
  time              VARCHAR(50) NOT NULL DEFAULT '10:00 AM',
  location          VARCHAR(200) NOT NULL DEFAULT 'TBD',
  type              VARCHAR(50) NOT NULL DEFAULT 'Workshop',
  status            VARCHAR(20) NOT NULL DEFAULT 'upcoming',
  image             VARCHAR(500),
  registrations     INTEGER NOT NULL DEFAULT 0,
  max_registrations INTEGER NOT NULL DEFAULT 100,
  registration_url  VARCHAR(500),
  display_order     INTEGER NOT NULL DEFAULT 0,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_is_active ON events(is_active);
CREATE INDEX IF NOT EXISTS idx_events_display_order ON events(display_order);

-- Mission cards (About page)
CREATE TABLE IF NOT EXISTS mission_cards (
  id            VARCHAR(30) PRIMARY KEY,
  title         VARCHAR(200) NOT NULL,
  description   TEXT,
  icon_name     VARCHAR(50) NOT NULL DEFAULT 'Target',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_mission_cards_display_order ON mission_cards(display_order);
CREATE INDEX IF NOT EXISTS idx_mission_cards_is_active ON mission_cards(is_active);

-- Resource items (polymorphic: roadmaps, toolkits, projects, link categories, links)
CREATE TABLE IF NOT EXISTS resource_items (
  id               VARCHAR(30) PRIMARY KEY,
  category         VARCHAR(30) NOT NULL DEFAULT 'link',
  parent_id        VARCHAR(30),
  title            VARCHAR(300) NOT NULL,
  description      TEXT,
  difficulty       VARCHAR(100),
  duration         VARCHAR(100),
  topics           TEXT DEFAULT '[]',
  tools            TEXT DEFAULT '[]',
  toolkit_category VARCHAR(50),
  downloads        INTEGER NOT NULL DEFAULT 0,
  tech             TEXT DEFAULT '[]',
  author           VARCHAR(200),
  stars            INTEGER NOT NULL DEFAULT 0,
  github           VARCHAR(500),
  url              VARCHAR(500),
  display_order    INTEGER NOT NULL DEFAULT 0,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_resource_items_category ON resource_items(category);
CREATE INDEX IF NOT EXISTS idx_resource_items_parent_id ON resource_items(parent_id);
CREATE INDEX IF NOT EXISTS idx_resource_items_display_order ON resource_items(display_order);
CREATE INDEX IF NOT EXISTS idx_resource_items_is_active ON resource_items(is_active);

-- Footer social links
CREATE TABLE IF NOT EXISTS footer_links (
  id            VARCHAR(30) PRIMARY KEY,
  platform      VARCHAR(50) NOT NULL UNIQUE,
  label         VARCHAR(100) NOT NULL,
  url           VARCHAR(500) NOT NULL,
  icon_name     VARCHAR(50) NOT NULL DEFAULT 'ExternalLink',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_footer_links_display_order ON footer_links(display_order);
CREATE INDEX IF NOT EXISTS idx_footer_links_is_active ON footer_links(is_active);

-- Footer quick links
CREATE TABLE IF NOT EXISTS footer_quick_links (
  id            VARCHAR(30) PRIMARY KEY,
  label         VARCHAR(100) NOT NULL,
  href          VARCHAR(200) NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_footer_quick_links_display_order ON footer_quick_links(display_order);
CREATE INDEX IF NOT EXISTS idx_footer_quick_links_is_active ON footer_quick_links(is_active);

-- Footer contacts
CREATE TABLE IF NOT EXISTS footer_contacts (
  id            VARCHAR(30) PRIMARY KEY,
  label         VARCHAR(100) NOT NULL,
  value         TEXT NOT NULL,
  icon_name     VARCHAR(50) NOT NULL DEFAULT 'MapPin',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_footer_contacts_display_order ON footer_contacts(display_order);
CREATE INDEX IF NOT EXISTS idx_footer_contacts_is_active ON footer_contacts(is_active);

-- Triggers for new content tables
DROP TRIGGER IF EXISTS update_pillars_updated_at ON pillars;
CREATE TRIGGER update_pillars_updated_at BEFORE UPDATE ON pillars FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_domains_updated_at ON domains;
CREATE TRIGGER update_domains_updated_at BEFORE UPDATE ON domains FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_hero_stats_updated_at ON hero_stats;
CREATE TRIGGER update_hero_stats_updated_at BEFORE UPDATE ON hero_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_mission_cards_updated_at ON mission_cards;
CREATE TRIGGER update_mission_cards_updated_at BEFORE UPDATE ON mission_cards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_resource_items_updated_at ON resource_items;
CREATE TRIGGER update_resource_items_updated_at BEFORE UPDATE ON resource_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_footer_links_updated_at ON footer_links;
CREATE TRIGGER update_footer_links_updated_at BEFORE UPDATE ON footer_links FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_footer_quick_links_updated_at ON footer_quick_links;
CREATE TRIGGER update_footer_quick_links_updated_at BEFORE UPDATE ON footer_quick_links FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_footer_contacts_updated_at ON footer_contacts;
CREATE TRIGGER update_footer_contacts_updated_at BEFORE UPDATE ON footer_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================
-- End of migration
-- =============================================================
