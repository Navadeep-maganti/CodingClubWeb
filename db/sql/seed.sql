-- =============================================================
-- Coding Club NIT Andhra Pradesh - Seed Data (PostgreSQL)
-- =============================================================
-- This script seeds the production database with:
--   - The three RBAC roles (SUPER_ADMIN, MEMBER, BLOG_AUTHOR)
--   - The initial super admin's roll number in the whitelist
--   - Default blog categories
--   - Default blog tags
--   - The current team members (36 members)
--   - The seed blog posts (6 posts) with authors, tags, categories
--
-- Usage:
--   psql -U <user> -d <db> -f seed.sql
--
-- NOTE: After running this script, the super admin must sign in
-- via Google OAuth with email <roll>@student.nitandhra.ac.in
-- (where <roll> = INITIAL_SUPER_ADMIN_ROLL_NUMBER, default 000001).
-- The system will then grant them SUPER_ADMIN role automatically.
-- =============================================================

-- Parameter: change this to set the bootstrap super admin roll number
-- (must be 6 digits and match INITIAL_SUPER_ADMIN_ROLL_NUMBER in .env)
\set super_admin_roll '000001'

BEGIN;

-- =============================================================
-- 1. Roles
-- =============================================================
INSERT INTO roles (id, name, description) VALUES
  (gen_random_uuid()::text, 'SUPER_ADMIN', 'Full system access'),
  (gen_random_uuid()::text, 'MEMBER', 'Standard club member'),
  (gen_random_uuid()::text, 'BLOG_AUTHOR', 'Member + blog authoring rights')
ON CONFLICT (name) DO NOTHING;

-- =============================================================
-- 2. Initial super admin roll number (whitelist)
-- =============================================================
INSERT INTO approved_roll_numbers (id, roll_number, email, notes, is_used)
VALUES (
  gen_random_uuid()::text,
  :'super_admin_roll',
  :'super_admin_roll' || '@student.nitandhra.ac.in',
  'Bootstrapped super admin (initial).',
  FALSE
)
ON CONFLICT (roll_number) DO NOTHING;

-- =============================================================
-- 3. Blog categories
-- =============================================================
INSERT INTO blog_categories (id, name, slug) VALUES
  (gen_random_uuid()::text, 'Web Development', 'web-development'),
  (gen_random_uuid()::text, 'Interview Experience', 'interview-experience'),
  (gen_random_uuid()::text, 'Machine Learning', 'machine-learning'),
  (gen_random_uuid()::text, 'DSA Concepts', 'dsa-concepts'),
  (gen_random_uuid()::text, 'Project Walkthrough', 'project-walkthrough'),
  (gen_random_uuid()::text, 'Latest Tech', 'latest-tech')
ON CONFLICT (name) DO NOTHING;

-- =============================================================
-- 4. Blog tags
-- =============================================================
INSERT INTO blog_tags (id, name, slug) VALUES
  ('tag-react',          'React',        'react'),
  ('tag-javascript',     'JavaScript',   'javascript'),
  ('tag-frontend',       'Frontend',     'frontend'),
  ('tag-tutorial',       'Tutorial',     'tutorial'),
  ('tag-interview',      'Interview',    'interview'),
  ('tag-google',         'Google',       'google'),
  ('tag-career',         'Career',       'career'),
  ('tag-dsa',            'DSA',          'dsa'),
  ('tag-python',         'Python',       'python'),
  ('tag-tensorflow',     'TensorFlow',   'tensorflow'),
  ('tag-nlp',            'NLP',          'nlp'),
  ('tag-ai',             'AI',           'ai'),
  ('tag-algorithms',     'Algorithms',   'algorithms'),
  ('tag-programming',    'Programming',  'programming'),
  ('tag-nextjs',         'Next.js',      'next-js'),
  ('tag-ecommerce',      'E-commerce',   'e-commerce'),
  ('tag-fullstack',      'Full-stack',   'full-stack'),
  ('tag-typescript',     'TypeScript',   'typescript'),
  ('tag-mobile',         'Mobile',       'mobile'),
  ('tag-reactnative',    'React Native', 'react-native'),
  ('tag-flutter',        'Flutter',      'flutter'),
  ('tag-trends',         'Trends',       'trends')
ON CONFLICT (name) DO NOTHING;

-- =============================================================
-- 5. Blog authors (placeholder, no linked user yet)
-- =============================================================
INSERT INTO blog_authors (id, user_id, display_name, bio, avatar, is_approved) VALUES
  ('author-arjun',   NULL, 'Arjun Sharma',  'Full-stack developer and React enthusiast',              '/professional-male-student-president.png',              TRUE),
  ('author-aditya',  NULL, 'Aditya Verma',  'Software Engineer at Google, NITAP Alumni',             '/alumni-google-engineer.png',                            TRUE),
  ('author-ananya',  NULL, 'Ananya Gupta',  'AI/ML Lead, passionate about deep learning',             '/professional-female-student-ai-ml.png',                 TRUE),
  ('author-karthik', NULL, 'Karthik Rao',   'Competitive Programming Lead, Algorithm Expert',        '/professional-male-student-competitive-programming.png', TRUE),
  ('author-vikash',  NULL, 'Vikash Singh',  'Web Development Lead, Next.js enthusiast',              '/professional-male-student-web-development.png',         TRUE),
  ('author-meera',   NULL, 'Meera Joshi',   'Mobile Development Lead, Cross-platform expert',        '/professional-female-student-mobile-development.png',   TRUE)
ON CONFLICT DO NOTHING;

-- =============================================================
-- 6. Blog posts
-- =============================================================
INSERT INTO blogs (id, title, slug, excerpt, content, cover_image, published, featured, read_time, view_count, published_at, author_id, category_id)
VALUES
  ('blog-react-2024',
   'Getting Started with React in 2024: A Complete Guide',
   'getting-started-with-react-2024',
   'Learn the fundamentals of React and build your first modern web application with hooks, components, and best practices.',
   '# Getting Started with React in 2024: A Complete Guide

React continues to be one of the most popular frontend frameworks, and 2024 brings exciting new features and best practices. In this comprehensive guide, we will walk through everything you need to know to start building modern React applications.

## What is React?

React is a JavaScript library for building user interfaces, particularly web applications. Created by Facebook (now Meta), React has revolutionized how we think about building interactive UIs with its component-based architecture and virtual DOM.

## Setting Up Your Development Environment

### Prerequisites
- Node.js (version 18 or higher)
- A code editor (VS Code recommended)
- Basic knowledge of HTML, CSS, and JavaScript

### Creating Your First React App

```bash
npm create vite@latest my-react-app -- --template react
cd my-react-app
npm install
npm run dev
```

## React Hooks

Hooks are functions that let you use state and other React features in functional components:

- `useState` manages local component state
- `useEffect` handles side effects like API calls
- `useContext` shares data across components without prop drilling

## Conclusion

React remains an excellent choice for building modern web applications. With its strong ecosystem, active community, and continuous improvements, learning React in 2024 is a great investment in your development career.',
   '/react-tutorial-blog-post.png',
   TRUE, TRUE, '8 min read', 0,
   '2024-01-15',
   'author-arjun',
   (SELECT id FROM blog_categories WHERE slug = 'web-development')
  ),
  ('blog-google-sde',
   'My Journey from Beginner to Google SDE: Interview Experience',
   'google-sde-interview-experience',
   'A detailed account of my preparation strategy, interview rounds, and tips for cracking big tech interviews.',
   '# My Journey from Beginner to Google SDE: Interview Experience

This is a placeholder article body. The Coding Club blog system is fully CMS-driven — once you sign in as a Blog Author or Super Admin, you can create rich markdown articles from the dashboard.',
   '/google-interview-experience-blog.png',
   TRUE, TRUE, '12 min read', 0,
   '2024-01-10',
   'author-aditya',
   (SELECT id FROM blog_categories WHERE slug = 'interview-experience')
  ),
  ('blog-ml-sentiment',
   'Building a Machine Learning Model for Sentiment Analysis',
   'ml-sentiment-analysis-tutorial',
   'Step-by-step guide to building and deploying a sentiment analysis model using Python and TensorFlow.',
   '# Building a Machine Learning Model for Sentiment Analysis

This is a placeholder article body. The Coding Club blog system is fully CMS-driven — once you sign in as a Blog Author or Super Admin, you can create rich markdown articles from the dashboard.',
   '/machine-learning-sentiment-analysis.png',
   TRUE, FALSE, '15 min read', 0,
   '2024-01-08',
   'author-ananya',
   (SELECT id FROM blog_categories WHERE slug = 'machine-learning')
  ),
  ('blog-top-10-ds',
   'Top 10 Data Structures Every Programmer Should Know',
   'top-10-data-structures-programmers',
   'Master these essential data structures to improve your problem-solving skills and ace coding interviews.',
   '# Top 10 Data Structures Every Programmer Should Know

This is a placeholder article body. The Coding Club blog system is fully CMS-driven — once you sign in as a Blog Author or Super Admin, you can create rich markdown articles from the dashboard.',
   '/data-structures-programming-guide.png',
   TRUE, FALSE, '10 min read', 0,
   '2024-01-05',
   'author-karthik',
   (SELECT id FROM blog_categories WHERE slug = 'dsa-concepts')
  ),
  ('blog-nextjs-ecommerce',
   'Building a Full-Stack E-commerce App with Next.js',
   'nextjs-ecommerce-app-tutorial',
   'Create a complete e-commerce application with authentication, payments, and admin dashboard using modern web technologies.',
   '# Building a Full-Stack E-commerce App with Next.js

This is a placeholder article body. The Coding Club blog system is fully CMS-driven — once you sign in as a Blog Author or Super Admin, you can create rich markdown articles from the dashboard.',
   '/nextjs-ecommerce-tutorial-blog.png',
   TRUE, FALSE, '20 min read', 0,
   '2024-01-03',
   'author-vikash',
   (SELECT id FROM blog_categories WHERE slug = 'project-walkthrough')
  ),
  ('blog-mobile-trends',
   'Latest Trends in Mobile App Development 2024',
   'mobile-app-development-trends-2024',
   'Explore the cutting-edge technologies and frameworks shaping the future of mobile application development.',
   '# Latest Trends in Mobile App Development 2024

This is a placeholder article body. The Coding Club blog system is fully CMS-driven — once you sign in as a Blog Author or Super Admin, you can create rich markdown articles from the dashboard.',
   '/mobile-development-trends-2024.png',
   TRUE, FALSE, '7 min read', 0,
   '2024-01-01',
   'author-meera',
   (SELECT id FROM blog_categories WHERE slug = 'latest-tech')
  )
ON CONFLICT (slug) DO NOTHING;

-- =============================================================
-- 7. Blog -> tag mappings
-- =============================================================
INSERT INTO blog_tag_map (id, blog_id, tag_id) VALUES
  ('btm-1', 'blog-react-2024',   'tag-react'),
  ('btm-2', 'blog-react-2024',   'tag-javascript'),
  ('btm-3', 'blog-react-2024',   'tag-frontend'),
  ('btm-4', 'blog-react-2024',   'tag-tutorial'),
  ('btm-5', 'blog-google-sde',   'tag-interview'),
  ('btm-6', 'blog-google-sde',   'tag-google'),
  ('btm-7', 'blog-google-sde',   'tag-career'),
  ('btm-8', 'blog-google-sde',   'tag-dsa'),
  ('btm-9', 'blog-ml-sentiment', 'tag-python'),
  ('btm-10','blog-ml-sentiment', 'tag-tensorflow'),
  ('btm-11','blog-ml-sentiment', 'tag-nlp'),
  ('btm-12','blog-ml-sentiment', 'tag-ai'),
  ('btm-13','blog-top-10-ds',    'tag-dsa'),
  ('btm-14','blog-top-10-ds',    'tag-algorithms'),
  ('btm-15','blog-top-10-ds',    'tag-programming'),
  ('btm-16','blog-top-10-ds',    'tag-interview'),
  ('btm-17','blog-nextjs-ecommerce','tag-nextjs'),
  ('btm-18','blog-nextjs-ecommerce','tag-ecommerce'),
  ('btm-19','blog-nextjs-ecommerce','tag-fullstack'),
  ('btm-20','blog-nextjs-ecommerce','tag-typescript'),
  ('btm-21','blog-mobile-trends','tag-mobile'),
  ('btm-22','blog-mobile-trends','tag-reactnative'),
  ('btm-23','blog-mobile-trends','tag-flutter'),
  ('btm-24','blog-mobile-trends','tag-trends')
ON CONFLICT (blog_id, tag_id) DO NOTHING;

COMMIT;

-- =============================================================
-- 8. Team members (placeholders - replace with real NITAP students)
-- =============================================================
-- NOTE: Each team member needs a placeholder user record because
-- team_members.user_id has a foreign key to users.id. When a real
-- student logs in with that roll number, the admin can re-link the
-- team member to the real user record.
-- =============================================================

DO $$
DECLARE
  tm_user_id VARCHAR(30);
  tm_id VARCHAR(30);
BEGIN
  -- Example: Secretary
  tm_user_id := gen_random_uuid()::text;
  INSERT INTO users (id, email, name, is_active) VALUES (tm_user_id, 'placeholder+tharun@local', 'B Tharun Reddy', FALSE);
  tm_id := gen_random_uuid()::text;
  INSERT INTO team_members (id, user_id, name, position, bio, profile_image, strengths, display_order, is_active, is_featured, category)
  VALUES (tm_id, tm_user_id, 'B Tharun Reddy', 'Secretary', 'Final year CSE student passionate about leading tech initiatives and building innovative solutions. Experienced in project management and team coordination.', '/Tharun.png', '["JavaScript","Python","React","DSA"]', 1, TRUE, TRUE, 'Core Committee');
  INSERT INTO social_links (id, team_member_id, platform, url) VALUES
    (gen_random_uuid()::text, tm_id, 'github', '/'),
    (gen_random_uuid()::text, tm_id, 'linkedin', '/'),
    (gen_random_uuid()::text, tm_id, 'twitter', '/');
END $$;

-- (For brevity, only the Secretary is included as a sample in this file.
--  The other 35 team members are seeded via `bun run scripts/seed.ts`
--  which is the canonical seeding path for both SQLite (sandbox) and
--  PostgreSQL (production, with the appropriate DATABASE_URL).

-- =============================================================
-- End of seed
-- =============================================================
