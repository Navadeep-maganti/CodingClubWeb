-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "rollNumber" TEXT,
    "image" TEXT,
    "emailVerified" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "ApprovedRollNumber" (
    "id" TEXT NOT NULL,
    "rollNumber" TEXT NOT NULL,
    "email" TEXT,
    "addedById" TEXT,
    "notes" TEXT,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApprovedRollNumber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "assignedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "bio" TEXT,
    "profileImage" TEXT,
    "strengths" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "category" TEXT NOT NULL DEFAULT 'Member',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialLink" (
    "id" TEXT NOT NULL,
    "teamMemberId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogAuthor" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "displayName" TEXT NOT NULL,
    "bio" TEXT,
    "avatar" TEXT,
    "isApproved" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogAuthor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Blog" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "coverImage" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "readTime" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" TEXT,
    "categoryId" TEXT,
    "createdById" TEXT,

    CONSTRAINT "Blog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogTagMap" (
    "id" TEXT NOT NULL,
    "blogId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogTagMap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogComment" (
    "id" TEXT NOT NULL,
    "blogId" TEXT NOT NULL,
    "userId" TEXT,
    "authorName" TEXT NOT NULL,
    "authorEmail" TEXT,
    "content" TEXT NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSetting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "Pillar" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconName" TEXT NOT NULL DEFAULT 'Code',
    "colorFrom" TEXT NOT NULL DEFAULT 'from-primary',
    "colorTo" TEXT NOT NULL DEFAULT 'to-blue-600',
    "features" TEXT NOT NULL DEFAULT '[]',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pillar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Domain" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconName" TEXT NOT NULL DEFAULT 'Code',
    "color" TEXT NOT NULL DEFAULT '#4A90E2',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Domain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeroStat" (
    "id" TEXT NOT NULL,
    "iconName" TEXT NOT NULL DEFAULT 'Users',
    "value" TEXT NOT NULL DEFAULT '0+',
    "label" TEXT NOT NULL,
    "description" TEXT,
    "gradient" TEXT NOT NULL DEFAULT 'from-blue-500 to-blue-600',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeroStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT NOT NULL DEFAULT '10:00 AM',
    "location" TEXT NOT NULL DEFAULT 'TBD',
    "type" TEXT NOT NULL DEFAULT 'Workshop',
    "status" TEXT NOT NULL DEFAULT 'upcoming',
    "image" TEXT,
    "registrations" INTEGER NOT NULL DEFAULT 0,
    "maxRegistrations" INTEGER NOT NULL DEFAULT 100,
    "registrationUrl" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MissionCard" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconName" TEXT NOT NULL DEFAULT 'Target',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MissionCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResourceItem" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'link',
    "parentId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "difficulty" TEXT,
    "duration" TEXT,
    "topics" TEXT DEFAULT '[]',
    "tools" TEXT DEFAULT '[]',
    "toolkitCategory" TEXT,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "tech" TEXT DEFAULT '[]',
    "author" TEXT,
    "stars" INTEGER NOT NULL DEFAULT 0,
    "github" TEXT,
    "url" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResourceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FooterLink" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "iconName" TEXT NOT NULL DEFAULT 'ExternalLink',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FooterLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FooterQuickLink" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FooterQuickLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FooterContact" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "iconName" TEXT NOT NULL DEFAULT 'MapPin',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FooterContact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_rollNumber_key" ON "User"("rollNumber");

-- CreateIndex
CREATE INDEX "User_rollNumber_idx" ON "User"("rollNumber");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "ApprovedRollNumber_rollNumber_key" ON "ApprovedRollNumber"("rollNumber");

-- CreateIndex
CREATE INDEX "ApprovedRollNumber_rollNumber_idx" ON "ApprovedRollNumber"("rollNumber");

-- CreateIndex
CREATE INDEX "ApprovedRollNumber_isUsed_idx" ON "ApprovedRollNumber"("isUsed");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE INDEX "UserRole_userId_idx" ON "UserRole"("userId");

-- CreateIndex
CREATE INDEX "UserRole_roleId_idx" ON "UserRole"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_userId_roleId_key" ON "UserRole"("userId", "roleId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_userId_key" ON "TeamMember"("userId");

-- CreateIndex
CREATE INDEX "TeamMember_displayOrder_idx" ON "TeamMember"("displayOrder");

-- CreateIndex
CREATE INDEX "TeamMember_isActive_idx" ON "TeamMember"("isActive");

-- CreateIndex
CREATE INDEX "TeamMember_category_idx" ON "TeamMember"("category");

-- CreateIndex
CREATE INDEX "SocialLink_teamMemberId_idx" ON "SocialLink"("teamMemberId");

-- CreateIndex
CREATE UNIQUE INDEX "SocialLink_teamMemberId_platform_key" ON "SocialLink"("teamMemberId", "platform");

-- CreateIndex
CREATE UNIQUE INDEX "BlogAuthor_userId_key" ON "BlogAuthor"("userId");

-- CreateIndex
CREATE INDEX "BlogAuthor_userId_idx" ON "BlogAuthor"("userId");

-- CreateIndex
CREATE INDEX "BlogAuthor_isApproved_idx" ON "BlogAuthor"("isApproved");

-- CreateIndex
CREATE UNIQUE INDEX "Blog_slug_key" ON "Blog"("slug");

-- CreateIndex
CREATE INDEX "Blog_slug_idx" ON "Blog"("slug");

-- CreateIndex
CREATE INDEX "Blog_published_idx" ON "Blog"("published");

-- CreateIndex
CREATE INDEX "Blog_featured_idx" ON "Blog"("featured");

-- CreateIndex
CREATE INDEX "Blog_authorId_idx" ON "Blog"("authorId");

-- CreateIndex
CREATE INDEX "Blog_categoryId_idx" ON "Blog"("categoryId");

-- CreateIndex
CREATE INDEX "Blog_publishedAt_idx" ON "Blog"("publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "BlogCategory_name_key" ON "BlogCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "BlogCategory_slug_key" ON "BlogCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "BlogTag_name_key" ON "BlogTag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "BlogTag_slug_key" ON "BlogTag"("slug");

-- CreateIndex
CREATE INDEX "BlogTagMap_blogId_idx" ON "BlogTagMap"("blogId");

-- CreateIndex
CREATE INDEX "BlogTagMap_tagId_idx" ON "BlogTagMap"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "BlogTagMap_blogId_tagId_key" ON "BlogTagMap"("blogId", "tagId");

-- CreateIndex
CREATE INDEX "BlogComment_blogId_idx" ON "BlogComment"("blogId");

-- CreateIndex
CREATE INDEX "BlogComment_userId_idx" ON "BlogComment"("userId");

-- CreateIndex
CREATE INDEX "BlogComment_isApproved_idx" ON "BlogComment"("isApproved");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "Pillar_displayOrder_idx" ON "Pillar"("displayOrder");

-- CreateIndex
CREATE INDEX "Pillar_isActive_idx" ON "Pillar"("isActive");

-- CreateIndex
CREATE INDEX "Domain_displayOrder_idx" ON "Domain"("displayOrder");

-- CreateIndex
CREATE INDEX "Domain_isActive_idx" ON "Domain"("isActive");

-- CreateIndex
CREATE INDEX "HeroStat_displayOrder_idx" ON "HeroStat"("displayOrder");

-- CreateIndex
CREATE INDEX "HeroStat_isActive_idx" ON "HeroStat"("isActive");

-- CreateIndex
CREATE INDEX "Event_status_idx" ON "Event"("status");

-- CreateIndex
CREATE INDEX "Event_type_idx" ON "Event"("type");

-- CreateIndex
CREATE INDEX "Event_date_idx" ON "Event"("date");

-- CreateIndex
CREATE INDEX "Event_isActive_idx" ON "Event"("isActive");

-- CreateIndex
CREATE INDEX "Event_displayOrder_idx" ON "Event"("displayOrder");

-- CreateIndex
CREATE INDEX "MissionCard_displayOrder_idx" ON "MissionCard"("displayOrder");

-- CreateIndex
CREATE INDEX "MissionCard_isActive_idx" ON "MissionCard"("isActive");

-- CreateIndex
CREATE INDEX "ResourceItem_category_idx" ON "ResourceItem"("category");

-- CreateIndex
CREATE INDEX "ResourceItem_parentId_idx" ON "ResourceItem"("parentId");

-- CreateIndex
CREATE INDEX "ResourceItem_displayOrder_idx" ON "ResourceItem"("displayOrder");

-- CreateIndex
CREATE INDEX "ResourceItem_isActive_idx" ON "ResourceItem"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "FooterLink_platform_key" ON "FooterLink"("platform");

-- CreateIndex
CREATE INDEX "FooterLink_displayOrder_idx" ON "FooterLink"("displayOrder");

-- CreateIndex
CREATE INDEX "FooterLink_isActive_idx" ON "FooterLink"("isActive");

-- CreateIndex
CREATE INDEX "FooterQuickLink_displayOrder_idx" ON "FooterQuickLink"("displayOrder");

-- CreateIndex
CREATE INDEX "FooterQuickLink_isActive_idx" ON "FooterQuickLink"("isActive");

-- CreateIndex
CREATE INDEX "FooterContact_displayOrder_idx" ON "FooterContact"("displayOrder");

-- CreateIndex
CREATE INDEX "FooterContact_isActive_idx" ON "FooterContact"("isActive");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialLink" ADD CONSTRAINT "SocialLink_teamMemberId_fkey" FOREIGN KEY ("teamMemberId") REFERENCES "TeamMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogAuthor" ADD CONSTRAINT "BlogAuthor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blog" ADD CONSTRAINT "Blog_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "BlogAuthor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blog" ADD CONSTRAINT "Blog_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "BlogCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blog" ADD CONSTRAINT "Blog_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogTagMap" ADD CONSTRAINT "BlogTagMap_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "Blog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogTagMap" ADD CONSTRAINT "BlogTagMap_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "BlogTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogComment" ADD CONSTRAINT "BlogComment_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "Blog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogComment" ADD CONSTRAINT "BlogComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

