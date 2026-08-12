-- =============================================================
-- Coding Club NIT Andhra Pradesh - PostgreSQL Schema (Production)
-- =============================================================
-- This file defines the complete database schema for production
-- deployment on PostgreSQL. Use this when setting up the database
-- for the first time.
--
-- Usage:
--   psql -U <user> -d <db> -f schema.sql
--
-- Tables:
--   1. users
--   2. accounts              (NextAuth OAuth accounts)
--   3. sessions              (NextAuth DB sessions)
--   4. verification_tokens   (NextAuth email verification)
--   5. approved_roll_numbers (Whitelist)
--   6. roles                 (RBAC role definitions)
--   7. user_roles            (User <-> Role mapping)
--   8. team_members          (Public team page data)
--   9. social_links          (Team member social profiles)
--  10. blog_authors          (Blog author profiles)
--  11. blogs                 (Blog posts)
--  12. blog_categories       (Blog categories)
--  13. blog_tags             (Blog tags)
--  14. blog_tag_map          (Blog <-> Tag mapping)
--  15. blog_comments         (Blog comments)
--  16. audit_logs            (Audit trail)
-- =============================================================

-- Required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop tables in reverse dependency order (clean slate)
DROP TABLE IF EXISTS footer_contacts CASCADE;
DROP TABLE IF EXISTS footer_quick_links CASCADE;
DROP TABLE IF EXISTS footer_links CASCADE;
DROP TABLE IF EXISTS resource_items CASCADE;
DROP TABLE IF EXISTS mission_cards CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS hero_stats CASCADE;
DROP TABLE IF EXISTS domains CASCADE;
DROP TABLE IF EXISTS pillars CASCADE;
DROP TABLE IF EXISTS site_settings CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS blog_comments CASCADE;
DROP TABLE IF EXISTS blog_tag_map CASCADE;
DROP TABLE IF EXISTS blog_tags CASCADE;
DROP TABLE IF EXISTS blog_categories CASCADE;
DROP TABLE IF EXISTS blogs CASCADE;
DROP TABLE IF EXISTS blog_authors CASCADE;
DROP TABLE IF EXISTS social_links CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS approved_roll_numbers CASCADE;
DROP TABLE IF EXISTS verification_tokens CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =============================================================
-- USERS
-- =============================================================
CREATE TABLE users (
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
CREATE INDEX idx_users_roll_number ON users(roll_number);
CREATE INDEX idx_users_email ON users(email);

-- =============================================================
-- ACCOUNTS (NextAuth OAuth)
-- =============================================================
CREATE TABLE accounts (
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
CREATE INDEX idx_accounts_user_id ON accounts(user_id);

-- =============================================================
-- SESSIONS (NextAuth DB sessions)
-- =============================================================
CREATE TABLE sessions (
  id            VARCHAR(30) PRIMARY KEY,
  session_token VARCHAR(255) NOT NULL UNIQUE,
  user_id       VARCHAR(30) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires       TIMESTAMP NOT NULL
);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);

-- =============================================================
-- VERIFICATION TOKENS (NextAuth email verification)
-- =============================================================
CREATE TABLE verification_tokens (
  identifier VARCHAR(255) NOT NULL,
  token      VARCHAR(255) NOT NULL UNIQUE,
  expires    TIMESTAMP NOT NULL,
  UNIQUE(identifier, token)
);

-- =============================================================
-- APPROVED ROLL NUMBERS (Whitelist)
-- =============================================================
CREATE TABLE approved_roll_numbers (
  id           VARCHAR(30) PRIMARY KEY,
  roll_number  VARCHAR(20) NOT NULL UNIQUE,
  email        VARCHAR(255),
  added_by_id  VARCHAR(30) REFERENCES users(id) ON DELETE SET NULL,
  notes        TEXT,
  is_used      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_approved_roll_number ON approved_roll_numbers(roll_number);
CREATE INDEX idx_approved_is_used ON approved_roll_numbers(is_used);

-- =============================================================
-- ROLES (RBAC role definitions)
-- =============================================================
CREATE TABLE roles (
  id          VARCHAR(30) PRIMARY KEY,
  name        VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =============================================================
-- USER_ROLES (User <-> Role mapping)
-- =============================================================
CREATE TABLE user_roles (
  id            VARCHAR(30) PRIMARY KEY,
  user_id       VARCHAR(30) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id       VARCHAR(30) NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  assigned_by_id VARCHAR(30) REFERENCES users(id) ON DELETE SET NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role_id)
);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);

-- =============================================================
-- TEAM MEMBERS
-- =============================================================
CREATE TABLE team_members (
  id            VARCHAR(30) PRIMARY KEY,
  user_id       VARCHAR(30) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  name          VARCHAR(200) NOT NULL,
  position      VARCHAR(100) NOT NULL,
  bio           TEXT,
  profile_image VARCHAR(500),
  strengths     TEXT NOT NULL DEFAULT '[]',  -- JSON array
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured   BOOLEAN NOT NULL DEFAULT FALSE,
  category      VARCHAR(50) NOT NULL DEFAULT 'Member',
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_team_members_display_order ON team_members(display_order);
CREATE INDEX idx_team_members_is_active ON team_members(is_active);
CREATE INDEX idx_team_members_category ON team_members(category);

-- =============================================================
-- SOCIAL LINKS
-- =============================================================
CREATE TABLE social_links (
  id             VARCHAR(30) PRIMARY KEY,
  team_member_id VARCHAR(30) NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  platform       VARCHAR(50) NOT NULL,
  url            VARCHAR(500) NOT NULL,
  created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(team_member_id, platform)
);
CREATE INDEX idx_social_links_team_member_id ON social_links(team_member_id);

-- =============================================================
-- BLOG AUTHORS
-- =============================================================
CREATE TABLE blog_authors (
  id           VARCHAR(30) PRIMARY KEY,
  user_id      VARCHAR(30) UNIQUE REFERENCES users(id) ON DELETE SET NULL,
  display_name VARCHAR(200) NOT NULL,
  bio          TEXT,
  avatar       VARCHAR(500),
  is_approved  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_blog_authors_user_id ON blog_authors(user_id);
CREATE INDEX idx_blog_authors_is_approved ON blog_authors(is_approved);

-- =============================================================
-- BLOG CATEGORIES
-- =============================================================
CREATE TABLE blog_categories (
  id        VARCHAR(30) PRIMARY KEY,
  name      VARCHAR(100) NOT NULL UNIQUE,
  slug      VARCHAR(120) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =============================================================
-- BLOG TAGS
-- =============================================================
CREATE TABLE blog_tags (
  id        VARCHAR(30) PRIMARY KEY,
  name      VARCHAR(100) NOT NULL UNIQUE,
  slug      VARCHAR(120) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =============================================================
-- BLOGS
-- =============================================================
CREATE TABLE blogs (
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
CREATE INDEX idx_blogs_slug ON blogs(slug);
CREATE INDEX idx_blogs_published ON blogs(published);
CREATE INDEX idx_blogs_featured ON blogs(featured);
CREATE INDEX idx_blogs_author_id ON blogs(author_id);
CREATE INDEX idx_blogs_category_id ON blogs(category_id);
CREATE INDEX idx_blogs_published_at ON blogs(published_at);

-- =============================================================
-- BLOG TAG MAP (Many-to-many blog <-> tag)
-- =============================================================
CREATE TABLE blog_tag_map (
  id         VARCHAR(30) PRIMARY KEY,
  blog_id    VARCHAR(30) NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
  tag_id     VARCHAR(30) NOT NULL REFERENCES blog_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(blog_id, tag_id)
);
CREATE INDEX idx_blog_tag_map_blog_id ON blog_tag_map(blog_id);
CREATE INDEX idx_blog_tag_map_tag_id ON blog_tag_map(tag_id);

-- =============================================================
-- BLOG COMMENTS
-- =============================================================
CREATE TABLE blog_comments (
  id           VARCHAR(30) PRIMARY KEY,
  blog_id      VARCHAR(30) NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
  user_id      VARCHAR(30) REFERENCES users(id) ON DELETE SET NULL,
  author_name  VARCHAR(200) NOT NULL,
  author_email VARCHAR(255),
  content      TEXT NOT NULL,
  is_approved  BOOLEAN NOT NULL DEFAULT FALSE,
  parent_id    VARCHAR(30),  -- self-reference for nested replies
  created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_blog_comments_blog_id ON blog_comments(blog_id);
CREATE INDEX idx_blog_comments_user_id ON blog_comments(user_id);
CREATE INDEX idx_blog_comments_is_approved ON blog_comments(is_approved);

-- =============================================================
-- AUDIT LOGS
-- =============================================================
CREATE TABLE audit_logs (
  id          VARCHAR(30) PRIMARY KEY,
  actor_id    VARCHAR(30) REFERENCES users(id) ON DELETE SET NULL,
  action      VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id   VARCHAR(30),
  metadata    TEXT,  -- JSON
  ip_address  VARCHAR(45),
  user_agent  TEXT,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- =============================================================
-- DYNAMIC SITE CONTENT (CMS)
-- =============================================================
-- These tables allow the Super Admin to configure EVERY visible
-- piece of content on the website from the dashboard.
-- =============================================================

-- Site-wide key/value settings (hero text, page descriptions, etc.)
CREATE TABLE site_settings (
  key        VARCHAR(100) PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Pillars shown in the "Who We Are" section on the home page
CREATE TABLE pillars (
  id            VARCHAR(30) PRIMARY KEY,
  title         VARCHAR(200) NOT NULL,
  description   TEXT,
  icon_name     VARCHAR(50) NOT NULL DEFAULT 'Code',
  color_from    VARCHAR(100) NOT NULL DEFAULT 'from-primary',
  color_to      VARCHAR(100) NOT NULL DEFAULT 'to-blue-600',
  features      TEXT NOT NULL DEFAULT '[]',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_pillars_display_order ON pillars(display_order);
CREATE INDEX idx_pillars_is_active ON pillars(is_active);

-- Domains shown in the "Our Domains" section
CREATE TABLE domains (
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
CREATE INDEX idx_domains_display_order ON domains(display_order);
CREATE INDEX idx_domains_is_active ON domains(is_active);

-- Hero stats (e.g. "50+ Active Members")
CREATE TABLE hero_stats (
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
CREATE INDEX idx_hero_stats_display_order ON hero_stats(display_order);
CREATE INDEX idx_hero_stats_is_active ON hero_stats(is_active);

-- Events (workshops, contests, hackathons, etc.)
CREATE TABLE events (
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
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_type ON events(type);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_is_active ON events(is_active);
CREATE INDEX idx_events_display_order ON events(display_order);

-- About page mission cards
CREATE TABLE mission_cards (
  id            VARCHAR(30) PRIMARY KEY,
  title         VARCHAR(200) NOT NULL,
  description   TEXT,
  icon_name     VARCHAR(50) NOT NULL DEFAULT 'Target',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_mission_cards_display_order ON mission_cards(display_order);
CREATE INDEX idx_mission_cards_is_active ON mission_cards(is_active);

-- Resource items (roadmaps, toolkits, projects, link categories, links)
CREATE TABLE resource_items (
  id               VARCHAR(30) PRIMARY KEY,
  category         VARCHAR(30) NOT NULL DEFAULT 'link',
  parent_id        VARCHAR(30),  -- self-reference for nested links
  title            VARCHAR(300) NOT NULL,
  description      TEXT,
  difficulty      VARCHAR(100),
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
CREATE INDEX idx_resource_items_category ON resource_items(category);
CREATE INDEX idx_resource_items_parent_id ON resource_items(parent_id);
CREATE INDEX idx_resource_items_display_order ON resource_items(display_order);
CREATE INDEX idx_resource_items_is_active ON resource_items(is_active);

-- Footer social links (LinkedIn, Email, Instagram, etc.)
CREATE TABLE footer_links (
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
CREATE INDEX idx_footer_links_display_order ON footer_links(display_order);
CREATE INDEX idx_footer_links_is_active ON footer_links(is_active);

-- Footer quick links (About, Events, Team, Resources, Blog)
CREATE TABLE footer_quick_links (
  id            VARCHAR(30) PRIMARY KEY,
  label         VARCHAR(100) NOT NULL,
  href          VARCHAR(200) NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_footer_quick_links_display_order ON footer_quick_links(display_order);
CREATE INDEX idx_footer_quick_links_is_active ON footer_quick_links(is_active);

-- Footer contact info (address, email, phone)
CREATE TABLE footer_contacts (
  id            VARCHAR(30) PRIMARY KEY,
  label         VARCHAR(100) NOT NULL,
  value         TEXT NOT NULL,
  icon_name     VARCHAR(50) NOT NULL DEFAULT 'MapPin',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_footer_contacts_display_order ON footer_contacts(display_order);
CREATE INDEX idx_footer_contacts_is_active ON footer_contacts(is_active);

-- =============================================================
-- Trigger: keep updated_at current
-- =============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_approved_roll_numbers_updated_at BEFORE UPDATE ON approved_roll_numbers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_links_updated_at BEFORE UPDATE ON social_links FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_authors_updated_at BEFORE UPDATE ON blog_authors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blogs_updated_at BEFORE UPDATE ON blogs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_comments_updated_at BEFORE UPDATE ON blog_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Triggers for content tables
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
-- ER Diagram (textual description)
-- =============================================================
-- users 1---* accounts
-- users 1---* sessions
-- users 1---* user_roles *---1 roles
-- users 1---1 team_members 1---* social_links
-- users 1---? blog_authors 1---* blogs
-- blog_categories 1---* blogs
-- users 1---* blogs (created_by_id)
-- blogs *---* blog_tags (via blog_tag_map)
-- blogs 1---* blog_comments
-- users 1---* blog_comments
-- users 1---* audit_logs (as actor)
-- users 1---* approved_roll_numbers (as added_by)
-- =============================================================
