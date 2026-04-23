-- =============================================
-- FLOWENTRA — Complete Database Schema
-- All tables prefixed with flowentra_
-- Run this single file to create ALL tables
-- =============================================
-- Generated: 2026-03-08
-- =============================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =============================================
-- 1. CORE: Admin Users & Sessions
-- =============================================

CREATE TABLE IF NOT EXISTS `flowentra_admin_users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `role` ENUM('super_admin', 'editor') NOT NULL DEFAULT 'editor',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `last_login` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `flowentra_admin_sessions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `token` VARCHAR(255) NOT NULL UNIQUE,
  `ip_address` VARCHAR(45),
  `user_agent` TEXT,
  `expires_at` TIMESTAMP NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `flowentra_admin_users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 2. CMS: Site Content (Key/Value Store)
-- =============================================

CREATE TABLE IF NOT EXISTS `flowentra_site_content` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `section` VARCHAR(50) NOT NULL,
  `content_key` VARCHAR(150) NOT NULL,
  `lang` VARCHAR(5) NOT NULL DEFAULT 'en',
  `content_value` TEXT,
  `content_type` ENUM('text', 'html', 'number', 'json', 'image') NOT NULL DEFAULT 'text',
  `updated_by` INT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_content` (`section`, `content_key`, `lang`),
  FOREIGN KEY (`updated_by`) REFERENCES `flowentra_admin_users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 3. CMS: Content Change Log (Audit Trail)
-- =============================================

CREATE TABLE IF NOT EXISTS `flowentra_content_changelog` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `content_id` INT NOT NULL,
  `section` VARCHAR(50) NOT NULL,
  `content_key` VARCHAR(150) NOT NULL,
  `lang` VARCHAR(5) NOT NULL,
  `old_value` TEXT,
  `new_value` TEXT,
  `changed_by` INT NOT NULL,
  `changed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`changed_by`) REFERENCES `flowentra_admin_users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 4. CMS: Media Library
-- =============================================

CREATE TABLE IF NOT EXISTS `flowentra_cms_media` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `filename` VARCHAR(255) NOT NULL,
  `original_name` VARCHAR(255) NOT NULL,
  `file_path` VARCHAR(500) NOT NULL,
  `thumb_path` VARCHAR(500) DEFAULT NULL,
  `mime_type` VARCHAR(100) NOT NULL,
  `file_size` INT NOT NULL,
  `dimensions` VARCHAR(20) DEFAULT NULL,
  `category` ENUM('hero', 'logo', 'icon', 'integration', 'screenshot', 'general') NOT NULL DEFAULT 'general',
  `section_key` VARCHAR(50) DEFAULT NULL,
  `alt_text` VARCHAR(255) DEFAULT '',
  `uploaded_by` INT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`uploaded_by`) REFERENCES `flowentra_admin_users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 5. CMS: Sections & Fields Metadata
-- =============================================

CREATE TABLE IF NOT EXISTS `flowentra_cms_sections` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `section_key` VARCHAR(50) NOT NULL UNIQUE,
  `label` VARCHAR(100) NOT NULL,
  `icon` VARCHAR(50) DEFAULT 'FileText',
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `flowentra_cms_fields` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `section_key` VARCHAR(50) NOT NULL,
  `field_key` VARCHAR(150) NOT NULL,
  `field_label` VARCHAR(100) NOT NULL,
  `field_type` ENUM('text', 'textarea', 'number', 'rich_text', 'image', 'json') NOT NULL DEFAULT 'text',
  `is_array` TINYINT(1) NOT NULL DEFAULT 0,
  `array_max_items` INT DEFAULT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `placeholder` VARCHAR(255) DEFAULT NULL,
  `is_required` TINYINT(1) NOT NULL DEFAULT 0,
  UNIQUE KEY `unique_field` (`section_key`, `field_key`),
  FOREIGN KEY (`section_key`) REFERENCES `flowentra_cms_sections`(`section_key`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 6. EMAIL: SMTP Settings
-- =============================================

CREATE TABLE IF NOT EXISTS `flowentra_email_smtp_settings` (
  `id` INT PRIMARY KEY DEFAULT 1,
  `host` VARCHAR(255) NOT NULL DEFAULT 'ssl0.ovh.net',
  `port` INT NOT NULL DEFAULT 587,
  `username` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `encryption` ENUM('tls', 'ssl', 'none') DEFAULT 'tls',
  `from_name` VARCHAR(255) DEFAULT 'Flowentra',
  `from_email` VARCHAR(255) NOT NULL,
  `reply_to` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 7. EMAIL: Templates
-- =============================================

CREATE TABLE IF NOT EXISTS `flowentra_email_templates` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `subject` VARCHAR(500) NOT NULL,
  `html_body` LONGTEXT NOT NULL,
  `category` ENUM('general', 'newsletter', 'promotional', 'transactional', 'welcome', 'notification') DEFAULT 'general',
  `created_by` INT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 8. EMAIL: Contacts / Recipients
-- =============================================

CREATE TABLE IF NOT EXISTS `flowentra_email_contacts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `name` VARCHAR(255) DEFAULT '',
  `group_name` VARCHAR(100) DEFAULT 'default',
  `is_subscribed` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_group` (`group_name`),
  INDEX `idx_subscribed` (`is_subscribed`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 9. EMAIL: Campaigns
-- =============================================

CREATE TABLE IF NOT EXISTS `flowentra_email_campaigns` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `subject` VARCHAR(500) NOT NULL,
  `html_body` LONGTEXT NOT NULL,
  `total_recipients` INT DEFAULT 0,
  `sent_count` INT DEFAULT 0,
  `failed_count` INT DEFAULT 0,
  `status` ENUM('draft', 'sending', 'completed', 'failed') DEFAULT 'draft',
  `created_by` INT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `completed_at` TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 10. EMAIL: Send Log
-- =============================================

CREATE TABLE IF NOT EXISTS `flowentra_email_send_log` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `campaign_id` INT DEFAULT NULL,
  `recipient_email` VARCHAR(255) NOT NULL,
  `subject` VARCHAR(500) NOT NULL,
  `status` ENUM('sent', 'failed', 'bounced') DEFAULT 'sent',
  `error_message` TEXT DEFAULT NULL,
  `sent_by` INT DEFAULT NULL,
  `sent_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_campaign` (`campaign_id`),
  INDEX `idx_status` (`status`),
  FOREIGN KEY (`campaign_id`) REFERENCES `flowentra_email_campaigns`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 11. RELEASES: Version Notes
-- =============================================

CREATE TABLE IF NOT EXISTS `flowentra_releases` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `version` VARCHAR(20) NOT NULL,
  `is_published` TINYINT(1) NOT NULL DEFAULT 0,
  `release_date` DATE NOT NULL,
  `created_by` INT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_version` (`version`),
  FOREIGN KEY (`created_by`) REFERENCES `flowentra_admin_users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `flowentra_release_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `release_id` INT NOT NULL,
  `item_type` ENUM('feature', 'bugfix', 'improvement') NOT NULL DEFAULT 'feature',
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`release_id`) REFERENCES `flowentra_releases`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `flowentra_release_item_translations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `item_id` INT NOT NULL,
  `lang` VARCHAR(5) NOT NULL DEFAULT 'en',
  `text` TEXT NOT NULL,
  UNIQUE KEY `unique_translation` (`item_id`, `lang`),
  FOREIGN KEY (`item_id`) REFERENCES `flowentra_release_items`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `flowentra_release_date_translations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `release_id` INT NOT NULL,
  `lang` VARCHAR(5) NOT NULL DEFAULT 'en',
  `date_text` VARCHAR(100) NOT NULL,
  UNIQUE KEY `unique_date_trans` (`release_id`, `lang`),
  FOREIGN KEY (`release_id`) REFERENCES `flowentra_releases`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 12. ANALYTICS: Page Views Tracking
-- =============================================

CREATE TABLE IF NOT EXISTS `flowentra_analytics_pageviews` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `session_id` VARCHAR(64) NOT NULL,
  `path` VARCHAR(500) NOT NULL,
  `referrer` VARCHAR(500) DEFAULT NULL,
  `user_agent` TEXT,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `device_type` ENUM('desktop', 'mobile', 'tablet') DEFAULT 'desktop',
  `country` VARCHAR(5) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_session` (`session_id`),
  INDEX `idx_path` (`path`(100)),
  INDEX `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 13. SITE SETTINGS (Key/Value)
-- =============================================

CREATE TABLE IF NOT EXISTS `flowentra_site_settings` (
  `setting_key` VARCHAR(100) PRIMARY KEY,
  `setting_value` TEXT NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX `idx_content_section_lang` ON `flowentra_site_content` (`section`, `lang`);
CREATE INDEX `idx_content_section` ON `flowentra_site_content` (`section`);
CREATE INDEX `idx_changelog_content` ON `flowentra_content_changelog` (`content_id`);
CREATE INDEX `idx_sessions_token` ON `flowentra_admin_sessions` (`token`);
CREATE INDEX `idx_sessions_expires` ON `flowentra_admin_sessions` (`expires_at`);
CREATE INDEX `idx_releases_published` ON `flowentra_releases` (`is_published`, `release_date` DESC);
CREATE INDEX `idx_release_items_release` ON `flowentra_release_items` (`release_id`, `sort_order`);

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================
-- DEFAULT DATA
-- =============================================

-- Default Admin User
-- Password: "password" (bcrypt hash) — CHANGE THIS IMMEDIATELY!
-- Generate new hash: php -r "echo password_hash('YourNewPassword', PASSWORD_DEFAULT);"
INSERT INTO `flowentra_admin_users` (`email`, `password_hash`, `name`, `role`) VALUES
('admin@flowentra.io', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'super_admin');

-- Default Site Settings
INSERT INTO `flowentra_site_settings` (`setting_key`, `setting_value`) VALUES
('password_protection_enabled', 'true'),
('access_password', 'flowentra2026'),
('maintenance_mode', 'false');

-- CMS Sections
INSERT INTO `flowentra_cms_sections` (`section_key`, `label`, `icon`, `sort_order`) VALUES
('nav', 'Navigation', 'Navigation', 1),
('hero', 'Hero Section', 'Sparkles', 2),
('trustedBy', 'Trusted By', 'Building2', 3),
('features', 'Features', 'Grid3X3', 4),
('productShowcase', 'Product Showcase', 'Monitor', 5),
('howItWorks', 'How It Works', 'ListOrdered', 6),
('demo', 'Demo Preview', 'Play', 7),
('metrics', 'Metrics', 'BarChart3', 8),
('industryVerticals', 'Industry Verticals', 'Factory', 9),
('integrations', 'Integrations', 'Plug', 10),
('pricing', 'Pricing', 'CreditCard', 11),
('comparisonTable', 'Comparison Table', 'Table', 12),
('testimonials', 'Testimonials', 'MessageSquareQuote', 13),
('faq', 'FAQ', 'HelpCircle', 14),
('contact', 'Contact Section', 'Mail', 15),
('ctaBanner', 'CTA Banner', 'Megaphone', 16),
('footer', 'Footer', 'PanelBottom', 17);

-- CMS Fields: Nav
INSERT INTO `flowentra_cms_fields` (`section_key`, `field_key`, `field_label`, `field_type`, `sort_order`, `is_required`) VALUES
('nav', 'features', 'Features Link', 'text', 1, 1),
('nav', 'pricing', 'Pricing Link', 'text', 2, 1),
('nav', 'demo', 'Demo Link', 'text', 3, 1),
('nav', 'testimonials', 'Testimonials Link', 'text', 4, 1),
('nav', 'faq', 'FAQ Link', 'text', 5, 1),
('nav', 'cta', 'CTA Button', 'text', 6, 1),
('nav', 'signup', 'Sign Up Button', 'text', 7, 1);

-- CMS Fields: Hero
INSERT INTO `flowentra_cms_fields` (`section_key`, `field_key`, `field_label`, `field_type`, `sort_order`, `is_required`) VALUES
('hero', 'headline', 'Headline', 'text', 1, 1),
('hero', 'headlineSub', 'Headline Subtitle', 'text', 2, 1),
('hero', 'subtext', 'Subtext', 'textarea', 3, 1),
('hero', 'cta', 'Primary CTA', 'text', 4, 1),
('hero', 'ctaSecondary', 'Secondary CTA', 'text', 5, 1),
('hero', 'trustLine', 'Trust Line', 'text', 6, 0),
('hero', 'screenshotPlaceholder', 'Screenshot Placeholder Text', 'text', 7, 0),
('hero', 'browserBarUrl', 'Browser Bar URL Text', 'text', 8, 0);

-- CMS Fields: Features
INSERT INTO `flowentra_cms_fields` (`section_key`, `field_key`, `field_label`, `field_type`, `sort_order`, `is_required`) VALUES
('features', 'sectionLabel', 'Section Label', 'text', 1, 0),
('features', 'title', 'Title', 'text', 2, 1),
('features', 'subtitle', 'Subtitle', 'textarea', 3, 1),
('features', 'items', 'Feature Items (JSON)', 'json', 4, 1);

-- CMS Fields: Pricing
INSERT INTO `flowentra_cms_fields` (`section_key`, `field_key`, `field_label`, `field_type`, `sort_order`, `is_required`) VALUES
('pricing', 'title', 'Title', 'text', 1, 1),
('pricing', 'subtitle', 'Subtitle', 'textarea', 2, 1),
('pricing', 'currency', 'Currency', 'text', 3, 1),
('pricing', 'monthly', 'Monthly Label', 'text', 4, 1),
('pricing', 'cta', 'CTA Button Text', 'text', 5, 1),
('pricing', 'popular', 'Popular Label', 'text', 6, 0),
('pricing', 'plans', 'Plans (JSON)', 'json', 7, 1);

-- CMS Fields: FAQ
INSERT INTO `flowentra_cms_fields` (`section_key`, `field_key`, `field_label`, `field_type`, `sort_order`, `is_required`) VALUES
('faq', 'title', 'Title', 'text', 1, 1),
('faq', 'subtitle', 'Subtitle', 'textarea', 2, 1),
('faq', 'items', 'FAQ Items (JSON)', 'json', 3, 1);

-- CMS Fields: Testimonials
INSERT INTO `flowentra_cms_fields` (`section_key`, `field_key`, `field_label`, `field_type`, `sort_order`, `is_required`) VALUES
('testimonials', 'sectionLabel', 'Section Label', 'text', 1, 0),
('testimonials', 'title', 'Title', 'text', 2, 1),
('testimonials', 'subtitle', 'Subtitle', 'textarea', 3, 1),
('testimonials', 'items', 'Testimonials (JSON)', 'json', 4, 1);

-- CMS Fields: How It Works
INSERT INTO `flowentra_cms_fields` (`section_key`, `field_key`, `field_label`, `field_type`, `sort_order`, `is_required`) VALUES
('howItWorks', 'title', 'Title', 'text', 1, 1),
('howItWorks', 'items', 'Steps (JSON)', 'json', 2, 1);

-- CMS Fields: Metrics
INSERT INTO `flowentra_cms_fields` (`section_key`, `field_key`, `field_label`, `field_type`, `sort_order`, `is_required`) VALUES
('metrics', 'sectionLabel', 'Section Label', 'text', 1, 0),
('metrics', 'title', 'Section Title', 'text', 2, 0),
('metrics', 'items', 'Metrics (JSON)', 'json', 3, 1);

-- CMS Fields: Product Showcase
INSERT INTO `flowentra_cms_fields` (`section_key`, `field_key`, `field_label`, `field_type`, `sort_order`, `is_required`) VALUES
('productShowcase', 'label', 'Section Label', 'text', 1, 0),
('productShowcase', 'title', 'Title', 'text', 2, 1),
('productShowcase', 'items', 'Showcase Items (JSON)', 'json', 3, 1);

-- CMS Fields: Industry Verticals
INSERT INTO `flowentra_cms_fields` (`section_key`, `field_key`, `field_label`, `field_type`, `sort_order`, `is_required`) VALUES
('industryVerticals', 'title', 'Title', 'text', 1, 1),
('industryVerticals', 'subtitle', 'Subtitle', 'text', 2, 1),
('industryVerticals', 'items', 'Industries (JSON)', 'json', 3, 1);

-- CMS Fields: Integrations
INSERT INTO `flowentra_cms_fields` (`section_key`, `field_key`, `field_label`, `field_type`, `sort_order`, `is_required`) VALUES
('integrations', 'label', 'Section Label', 'text', 1, 0),
('integrations', 'title', 'Title', 'text', 2, 1),
('integrations', 'subtitle', 'Subtitle', 'textarea', 3, 1),
('integrations', 'comingSoon', 'More Coming Soon Text', 'text', 4, 0),
('integrations', 'items', 'Integration Names (JSON)', 'json', 5, 0);

-- CMS Fields: Comparison Table
INSERT INTO `flowentra_cms_fields` (`section_key`, `field_key`, `field_label`, `field_type`, `sort_order`, `is_required`) VALUES
('comparisonTable', 'label', 'Section Label', 'text', 1, 0),
('comparisonTable', 'title', 'Title', 'text', 2, 1),
('comparisonTable', 'featureColumnLabel', 'Feature Column Header', 'text', 3, 0),
('comparisonTable', 'features', 'Features List (JSON)', 'json', 4, 1),
('comparisonTable', 'competitors', 'Competitor Names (JSON)', 'json', 5, 0),
('comparisonTable', 'competitorSupport', 'Competitor Support Matrix (JSON)', 'json', 6, 0);

-- CMS Fields: Contact
INSERT INTO `flowentra_cms_fields` (`section_key`, `field_key`, `field_label`, `field_type`, `sort_order`, `is_required`) VALUES
('contact', 'title', 'Title', 'text', 1, 1),
('contact', 'subtitle', 'Subtitle', 'textarea', 2, 1),
('contact', 'firstName', 'First Name Label', 'text', 3, 1),
('contact', 'lastName', 'Last Name Label', 'text', 4, 1),
('contact', 'email', 'Email Label', 'text', 5, 1),
('contact', 'company', 'Company Label', 'text', 6, 1),
('contact', 'message', 'Message Label', 'text', 7, 1),
('contact', 'send', 'Send Button Text', 'text', 8, 1),
('contact', 'info', 'Contact Info (JSON)', 'json', 9, 1);

-- CMS Fields: CTA Banner
INSERT INTO `flowentra_cms_fields` (`section_key`, `field_key`, `field_label`, `field_type`, `sort_order`, `is_required`) VALUES
('ctaBanner', 'title', 'Title', 'text', 1, 1),
('ctaBanner', 'subtitle', 'Subtitle', 'textarea', 2, 1),
('ctaBanner', 'cta', 'Primary CTA', 'text', 3, 1),
('ctaBanner', 'ctaSecondary', 'Secondary CTA', 'text', 4, 1),
('ctaBanner', 'note', 'Note Text', 'text', 5, 0),
('ctaBanner', 'bulletPoints', 'Bullet Points (JSON)', 'json', 6, 0);

-- CMS Fields: Footer
INSERT INTO `flowentra_cms_fields` (`section_key`, `field_key`, `field_label`, `field_type`, `sort_order`, `is_required`) VALUES
('footer', 'desc', 'Description', 'textarea', 1, 1),
('footer', 'copyright', 'Copyright', 'text', 2, 1),
('footer', 'tagline', 'Tagline', 'text', 3, 0),
('footer', 'about', 'About Label', 'text', 4, 1),
('footer', 'support', 'Support Label', 'text', 5, 1),
('footer', 'integrations', 'Integrations Label', 'text', 6, 1),
('footer', 'legal', 'Legal Label', 'text', 7, 1),
('footer', 'contact', 'Contact Label', 'text', 8, 1),
('footer', 'product', 'Product Label', 'text', 9, 1),
('footer', 'company', 'Company Label', 'text', 10, 1),
('footer', 'resources', 'Resources Label', 'text', 11, 1),
('footer', 'privacy', 'Privacy Label', 'text', 12, 1),
('footer', 'terms', 'Terms Label', 'text', 13, 1),
('footer', 'security', 'Security Label', 'text', 14, 1),
('footer', 'status', 'Status Label', 'text', 15, 1),
('footer', 'docs', 'Docs Label', 'text', 16, 1),
('footer', 'blog', 'Blog Label', 'text', 17, 1),
('footer', 'careers', 'Careers Label', 'text', 18, 1),
('footer', 'partners', 'Partners Label', 'text', 19, 1),
('footer', 'releases', 'Releases Label', 'text', 20, 1);

-- CMS Fields: Trusted By
INSERT INTO `flowentra_cms_fields` (`section_key`, `field_key`, `field_label`, `field_type`, `sort_order`, `is_required`) VALUES
('trustedBy', 'title', 'Section Title', 'text', 1, 1),
('trustedBy', 'logos', 'Company Names (JSON)', 'json', 2, 1);

-- CMS Fields: Demo Preview
INSERT INTO `flowentra_cms_fields` (`section_key`, `field_key`, `field_label`, `field_type`, `sort_order`, `is_required`) VALUES
('demo', 'sectionLabel', 'Section Label', 'text', 1, 0),
('demo', 'title', 'Title', 'text', 2, 1),
('demo', 'subtitle', 'Subtitle', 'textarea', 3, 1),
('demo', 'workflow', 'Workflow Tab Label', 'text', 4, 1),
('demo', 'workflowDesc', 'Workflow Description', 'textarea', 5, 1),
('demo', 'analytics', 'Analytics Tab Label', 'text', 6, 1),
('demo', 'analyticsDesc', 'Analytics Description', 'textarea', 7, 1),
('demo', 'nodes', 'Workflow Nodes (JSON)', 'json', 8, 1),
('demo', 'stats', 'Stats Labels (JSON)', 'json', 9, 1);

-- =============================================
-- DEFAULT CONTENT DATA (All 4 Languages)
-- Matches i18n.ts exactly
-- =============================================

-- ==================== ENGLISH (en) ====================

-- Nav
INSERT INTO `flowentra_site_content` (`section`, `content_key`, `lang`, `content_value`, `content_type`) VALUES
('nav', 'features', 'en', 'Features', 'text'),
('nav', 'pricing', 'en', 'Pricing', 'text'),
('nav', 'demo', 'en', 'Demo', 'text'),
('nav', 'testimonials', 'en', 'Testimonials', 'text'),
('nav', 'faq', 'en', 'FAQ', 'text'),
('nav', 'cta', 'en', 'Start Free Trial', 'text'),
('nav', 'signup', 'en', 'Sign Up', 'text');

-- Hero
INSERT INTO `flowentra_site_content` (`section`, `content_key`, `lang`, `content_value`, `content_type`) VALUES
('hero', 'headline', 'en', 'Run Your Entire Business From One Place', 'text'),
('hero', 'headlineSub', 'en', 'CRM · Automation · Analytics · AI', 'text'),
('hero', 'subtext', 'en', 'Stop juggling tools. Flowentra brings CRM, workflows, analytics, and AI into one platform — so you can focus on growth.', 'text'),
('hero', 'cta', 'en', 'Start Free Trial', 'text'),
('hero', 'ctaSecondary', 'en', 'Watch Demo', 'text');

-- Trusted By
INSERT INTO `flowentra_site_content` (`section`, `content_key`, `lang`, `content_value`, `content_type`) VALUES
('trustedBy', 'title', 'en', 'They trust us', 'text'),
('trustedBy', 'logos', 'en', '["Telnet Holding","Poulina Group","BIAT","Sofrecom","Vermeg","Instadeep","Tunisie Telecom","STEG"]', 'json');

-- Features
INSERT INTO `flowentra_site_content` (`section`, `content_key`, `lang`, `content_value`, `content_type`) VALUES
('features', 'title', 'en', 'Everything You Need to Run Your Business', 'text'),
('features', 'subtitle', 'en', 'Powerful modules designed for modern enterprises', 'text'),
('features', 'items', 'en', '[{"title":"CRM & Contacts","desc":"Manage leads, clients, and relationships with a 360° customer view."},{"title":"Workflow Engine","desc":"Visual drag-and-drop builder for automating complex business processes."},{"title":"Dispatcher & Field Ops","desc":"Schedule, dispatch, and track field operations with maps integration."},{"title":"Smart Assistant","desc":"Intelligent automation and insights powered by advanced capabilities."},{"title":"Website Builder","desc":"Build professional websites with a no-code visual editor."},{"title":"Analytics & Reporting","desc":"Real-time dashboards and comprehensive reports for data-driven decisions."},{"title":"Documents & Forms","desc":"Dynamic forms and document management for streamlined operations."},{"title":"Email & Notifications","desc":"Multi-channel communication with email, SMS, and push notifications."},{"title":"Stock & Inventory","desc":"Track inventory levels, orders, and supply chain in real time."},{"title":"Gmail & Outlook","desc":"Seamless integration with Gmail and Outlook for unified email management."},{"title":"Invoices & Quotes","desc":"Create, send, and track professional invoices and quotes in seconds."},{"title":"Admin & Settings","desc":"Full control over users, roles, permissions, and system configuration."}]', 'json');

-- Pricing
INSERT INTO `flowentra_site_content` (`section`, `content_key`, `lang`, `content_value`, `content_type`) VALUES
('pricing', 'title', 'en', 'Simple, Transparent Pricing', 'text'),
('pricing', 'subtitle', 'en', 'Choose the plan that fits your business', 'text'),
('pricing', 'currency', 'en', 'TND', 'text'),
('pricing', 'monthly', 'en', '/month', 'text'),
('pricing', 'cta', 'en', 'Get Started', 'text'),
('pricing', 'popular', 'en', 'Most Popular', 'text'),
('pricing', 'plans', 'en', '[{"name":"Starter","price":"49","features":["CRM & Contacts","Email & Notifications","5 Users","Basic Support"]},{"name":"Professional","price":"149","features":["All Starter features","Workflow Engine","Analytics","Website Builder","25 Users","Priority Support"],"popular":true},{"name":"Enterprise","price":"349","features":["All Professional features","Smart Assistant","Dispatcher & Field Ops","Stock & Inventory","Unlimited Users","Dedicated Account Manager"]}]', 'json');

-- Demo
INSERT INTO `flowentra_site_content` (`section`, `content_key`, `lang`, `content_value`, `content_type`) VALUES
('demo', 'title', 'en', 'See Flowentra in Action', 'text'),
('demo', 'subtitle', 'en', 'Explore our powerful modules through interactive previews', 'text'),
('demo', 'workflow', 'en', 'Workflow Automation', 'text'),
('demo', 'workflowDesc', 'en', 'Build complex automation flows with our visual drag-and-drop builder. Connect triggers, conditions, and actions seamlessly.', 'text'),
('demo', 'analytics', 'en', 'Analytics Dashboard', 'text'),
('demo', 'analyticsDesc', 'en', 'Monitor your business metrics in real time with customizable dashboards and insightful reports.', 'text'),
('demo', 'nodes', 'en', '{"trigger":"Trigger","condition":"Condition","action":"Action","email":"Email Notify","log":"Log Result"}', 'json'),
('demo', 'stats', 'en', '{"revenue":"Revenue","users":"Users","completion":"Completion"}', 'json');

-- Testimonials
INSERT INTO `flowentra_site_content` (`section`, `content_key`, `lang`, `content_value`, `content_type`) VALUES
('testimonials', 'title', 'en', 'What Our Clients Say', 'text'),
('testimonials', 'subtitle', 'en', 'Businesses across Tunisia and beyond trust Flowentra daily', 'text'),
('testimonials', 'items', 'en', '[{"name":"Nabil Gharbi","role":"CTO, Vermeg","quote":"Flowentra replaced 4 separate tools for us. Our team is faster and we finally have a single source of truth."},{"name":"Sarra Ben Amor","role":"Operations Lead, Telnet Holding","quote":"The workflow engine alone saved us thousands of hours. It''s intuitive — even non-technical staff use it daily."},{"name":"Youssef Meddeb","role":"CEO, DataBridge Tunisia","quote":"We deployed in under 2 weeks. The multilingual support and local payment integration are game-changers."}]', 'json');

-- FAQ
INSERT INTO `flowentra_site_content` (`section`, `content_key`, `lang`, `content_value`, `content_type`) VALUES
('faq', 'title', 'en', 'Frequently Asked Questions', 'text'),
('faq', 'subtitle', 'en', 'Everything you need to know about Flowentra', 'text'),
('faq', 'items', 'en', '[{"q":"How long does implementation take?","a":"Most teams are fully operational within 2 weeks. Our onboarding team guides you through every step of the process."},{"q":"Can I migrate data from other platforms?","a":"Yes, we support data import from all major CRM and ERP platforms with dedicated migration tools and white-glove support."},{"q":"Is there a free trial?","a":"Absolutely. Start with a 14-day free trial with full access to all features. No credit card required."},{"q":"Do you offer API access?","a":"Yes, Flowentra provides a comprehensive RESTful API and webhook integrations for custom workflows and third-party apps."}]', 'json');

-- Metrics
INSERT INTO `flowentra_site_content` (`section`, `content_key`, `lang`, `content_value`, `content_type`) VALUES
('metrics', 'items', 'en', '{"companies":"Companies","uptime":"Uptime","countries":"Countries","transactions":"Transactions"}', 'json');

-- CTA Banner
INSERT INTO `flowentra_site_content` (`section`, `content_key`, `lang`, `content_value`, `content_type`) VALUES
('ctaBanner', 'title', 'en', 'Ready to Transform Your Business?', 'text'),
('ctaBanner', 'subtitle', 'en', 'Join thousands of companies already using Flowentra to streamline operations and accelerate growth.', 'text'),
('ctaBanner', 'cta', 'en', 'Start Free Trial', 'text'),
('ctaBanner', 'ctaSecondary', 'en', 'Talk to Sales', 'text'),
('ctaBanner', 'note', 'en', 'No credit card required · 14-day free trial · Cancel anytime', 'text');

-- Footer
INSERT INTO `flowentra_site_content` (`section`, `content_key`, `lang`, `content_value`, `content_type`) VALUES
('footer', 'desc', 'en', 'Enterprise-grade business management platform trusted by organizations worldwide.', 'text'),
('footer', 'copyright', 'en', '© 2026 Flowentra. All rights reserved.', 'text'),
('footer', 'tagline', 'en', 'Built for enterprises. Designed for people.', 'text'),
('footer', 'about', 'en', 'About', 'text'),
('footer', 'support', 'en', 'Support', 'text'),
('footer', 'integrations', 'en', 'Integrations', 'text'),
('footer', 'legal', 'en', 'Legal', 'text'),
('footer', 'contact', 'en', 'Contact Us', 'text'),
('footer', 'product', 'en', 'Product', 'text'),
('footer', 'company', 'en', 'Company', 'text'),
('footer', 'resources', 'en', 'Resources', 'text'),
('footer', 'privacy', 'en', 'Privacy Policy', 'text'),
('footer', 'terms', 'en', 'Terms of Service', 'text'),
('footer', 'security', 'en', 'Security', 'text'),
('footer', 'status', 'en', 'System Status', 'text'),
('footer', 'docs', 'en', 'Documentation', 'text'),
('footer', 'blog', 'en', 'Blog', 'text'),
('footer', 'careers', 'en', 'Careers', 'text'),
('footer', 'partners', 'en', 'Partners', 'text'),
('footer', 'releases', 'en', 'Releases', 'text');

-- ==================== FRENCH (fr) ====================

INSERT INTO `flowentra_site_content` (`section`, `content_key`, `lang`, `content_value`, `content_type`) VALUES
('nav', 'features', 'fr', 'Fonctionnalités', 'text'),
('nav', 'pricing', 'fr', 'Tarifs', 'text'),
('nav', 'demo', 'fr', 'Démo', 'text'),
('nav', 'testimonials', 'fr', 'Témoignages', 'text'),
('nav', 'faq', 'fr', 'FAQ', 'text'),
('nav', 'cta', 'fr', 'Essai Gratuit', 'text'),
('nav', 'signup', 'fr', 'S''inscrire', 'text'),
('hero', 'headline', 'fr', 'Gérez tout votre business depuis un seul endroit', 'text'),
('hero', 'headlineSub', 'fr', 'CRM · Automatisation · Analytique · IA', 'text'),
('hero', 'subtext', 'fr', 'Arrêtez de jongler entre les outils. Flowentra réunit CRM, workflows, analytique et IA dans une seule plateforme — pour que vous puissiez vous concentrer sur la croissance.', 'text'),
('hero', 'cta', 'fr', 'Essai Gratuit', 'text'),
('hero', 'ctaSecondary', 'fr', 'Voir la Démo', 'text'),
('trustedBy', 'title', 'fr', 'Ils nous font confiance', 'text'),
('trustedBy', 'logos', 'fr', '["Telnet Holding","Poulina Group","BIAT","Sofrecom","Vermeg","Instadeep","Tunisie Telecom","STEG"]', 'json'),
('features', 'title', 'fr', 'Tout ce dont vous avez besoin pour gérer votre entreprise', 'text'),
('features', 'subtitle', 'fr', 'Des modules puissants conçus pour les entreprises modernes', 'text'),
('features', 'items', 'fr', '[{"title":"CRM & Contacts","desc":"Gérez vos prospects, clients et relations avec une vue client à 360°."},{"title":"Moteur de Workflows","desc":"Constructeur visuel par glisser-déposer pour automatiser vos processus métier."},{"title":"Dispatch & Terrain","desc":"Planifiez, dispatchez et suivez les opérations terrain avec intégration cartographique."},{"title":"Assistant Intelligent","desc":"Automatisation intelligente et analyses propulsées par des capacités avancées."},{"title":"Créateur de Sites","desc":"Créez des sites professionnels avec un éditeur visuel sans code."},{"title":"Analytique & Rapports","desc":"Tableaux de bord en temps réel et rapports complets pour des décisions éclairées."},{"title":"Documents & Formulaires","desc":"Formulaires dynamiques et gestion documentaire pour des opérations simplifiées."},{"title":"Email & Notifications","desc":"Communication multicanal avec email, SMS et notifications push."},{"title":"Stock & Inventaire","desc":"Suivez les niveaux de stock, commandes et chaîne d''approvisionnement en temps réel."},{"title":"Gmail & Outlook","desc":"Intégration transparente avec Gmail et Outlook pour une gestion email unifiée."},{"title":"Factures & Devis","desc":"Créez, envoyez et suivez vos factures et devis professionnels en quelques clics."},{"title":"Admin & Paramètres","desc":"Contrôle total sur les utilisateurs, rôles, permissions et configuration système."}]', 'json'),
('pricing', 'title', 'fr', 'Tarification simple et transparente', 'text'),
('pricing', 'subtitle', 'fr', 'Choisissez le plan adapté à votre entreprise', 'text'),
('pricing', 'currency', 'fr', 'TND', 'text'),
('pricing', 'monthly', 'fr', '/mois', 'text'),
('pricing', 'cta', 'fr', 'Commencer', 'text'),
('pricing', 'popular', 'fr', 'Le plus populaire', 'text'),
('pricing', 'plans', 'fr', '[{"name":"Starter","price":"49","features":["CRM & Contacts","Email & Notifications","5 Utilisateurs","Support basique"]},{"name":"Professionnel","price":"149","features":["Tout le plan Starter","Moteur de Workflows","Analytique","Créateur de Sites","25 Utilisateurs","Support prioritaire"],"popular":true},{"name":"Entreprise","price":"349","features":["Tout le plan Professionnel","Assistant Intelligent","Dispatch & Terrain","Stock & Inventaire","Utilisateurs illimités","Gestionnaire de compte dédié"]}]', 'json'),
('demo', 'title', 'fr', 'Découvrez Flowentra en action', 'text'),
('demo', 'subtitle', 'fr', 'Explorez nos modules puissants à travers des aperçus interactifs', 'text'),
('demo', 'workflow', 'fr', 'Automatisation des Workflows', 'text'),
('demo', 'workflowDesc', 'fr', 'Créez des flux d''automatisation complexes avec notre constructeur visuel par glisser-déposer.', 'text'),
('demo', 'analytics', 'fr', 'Tableau de bord Analytique', 'text'),
('demo', 'analyticsDesc', 'fr', 'Surveillez vos indicateurs métier en temps réel avec des tableaux de bord personnalisables.', 'text'),
('demo', 'nodes', 'fr', '{"trigger":"Déclencheur","condition":"Condition","action":"Action","email":"Notification Email","log":"Journal"}', 'json'),
('demo', 'stats', 'fr', '{"revenue":"Revenus","users":"Utilisateurs","completion":"Complétion"}', 'json'),
('testimonials', 'title', 'fr', 'Ce que nos clients disent', 'text'),
('testimonials', 'subtitle', 'fr', 'Des entreprises en Tunisie et au-delà font confiance à Flowentra au quotidien', 'text'),
('testimonials', 'items', 'fr', '[{"name":"Nabil Gharbi","role":"CTO, Vermeg","quote":"Flowentra a remplacé 4 outils différents chez nous. Notre équipe est plus rapide et on a enfin une source de vérité unique."},{"name":"Sarra Ben Amor","role":"Responsable Ops, Telnet Holding","quote":"Le moteur de workflows à lui seul nous a fait gagner des milliers d''heures. Même les non-techniques l''utilisent."},{"name":"Youssef Meddeb","role":"PDG, DataBridge Tunisia","quote":"Déployé en moins de 2 semaines. Le support multilingue et l''intégration paiement local sont un vrai game-changer."}]', 'json'),
('faq', 'title', 'fr', 'Questions Fréquentes', 'text'),
('faq', 'subtitle', 'fr', 'Tout ce que vous devez savoir sur Flowentra', 'text'),
('faq', 'items', 'fr', '[{"q":"Combien de temps prend la mise en place ?","a":"La plupart des équipes sont opérationnelles en 2 semaines. Notre équipe vous accompagne à chaque étape du processus."},{"q":"Puis-je migrer mes données depuis d''autres plateformes ?","a":"Oui, nous supportons l''import depuis toutes les principales plateformes CRM et ERP avec des outils de migration dédiés."},{"q":"Y a-t-il un essai gratuit ?","a":"Bien sûr. Commencez avec un essai gratuit de 14 jours avec accès complet à toutes les fonctionnalités. Aucune carte bancaire requise."},{"q":"Proposez-vous un accès API ?","a":"Oui, Flowentra fournit une API RESTful complète et des intégrations webhook pour les workflows personnalisés."}]', 'json'),
('metrics', 'items', 'fr', '{"companies":"Entreprises","uptime":"Disponibilité","countries":"Pays","transactions":"Transactions"}', 'json'),
('ctaBanner', 'title', 'fr', 'Prêt à transformer votre entreprise ?', 'text'),
('ctaBanner', 'subtitle', 'fr', 'Rejoignez des milliers d''entreprises qui utilisent déjà Flowentra pour optimiser leurs opérations.', 'text'),
('ctaBanner', 'cta', 'fr', 'Essai Gratuit', 'text'),
('ctaBanner', 'ctaSecondary', 'fr', 'Parler aux ventes', 'text'),
('ctaBanner', 'note', 'fr', 'Sans carte bancaire · Essai gratuit 14 jours · Annulable à tout moment', 'text'),
('footer', 'desc', 'fr', 'Plateforme de gestion d''entreprise professionnelle, adoptée par des organisations du monde entier.', 'text'),
('footer', 'copyright', 'fr', '© 2026 Flowentra. Tous droits réservés.', 'text'),
('footer', 'tagline', 'fr', 'Conçu pour les entreprises. Pensé pour les gens.', 'text'),
('footer', 'about', 'fr', 'À propos', 'text'),
('footer', 'support', 'fr', 'Support', 'text'),
('footer', 'integrations', 'fr', 'Intégrations', 'text'),
('footer', 'legal', 'fr', 'Mentions légales', 'text'),
('footer', 'contact', 'fr', 'Nous contacter', 'text'),
('footer', 'product', 'fr', 'Produit', 'text'),
('footer', 'company', 'fr', 'Entreprise', 'text'),
('footer', 'resources', 'fr', 'Ressources', 'text'),
('footer', 'privacy', 'fr', 'Politique de confidentialité', 'text'),
('footer', 'terms', 'fr', 'Conditions d''utilisation', 'text'),
('footer', 'security', 'fr', 'Sécurité', 'text'),
('footer', 'status', 'fr', 'État du système', 'text'),
('footer', 'docs', 'fr', 'Documentation', 'text'),
('footer', 'blog', 'fr', 'Blog', 'text'),
('footer', 'careers', 'fr', 'Carrières', 'text'),
('footer', 'partners', 'fr', 'Partenaires', 'text'),
('footer', 'releases', 'fr', 'Notes de version', 'text');

-- ==================== GERMAN (de) ====================

INSERT INTO `flowentra_site_content` (`section`, `content_key`, `lang`, `content_value`, `content_type`) VALUES
('nav', 'features', 'de', 'Funktionen', 'text'),
('nav', 'pricing', 'de', 'Preise', 'text'),
('nav', 'demo', 'de', 'Demo', 'text'),
('nav', 'testimonials', 'de', 'Referenzen', 'text'),
('nav', 'faq', 'de', 'FAQ', 'text'),
('nav', 'cta', 'de', 'Kostenlos testen', 'text'),
('nav', 'signup', 'de', 'Registrieren', 'text'),
('hero', 'headline', 'de', 'Ihr gesamtes Business an einem Ort', 'text'),
('hero', 'headlineSub', 'de', 'CRM · Automatisierung · Analytik · KI', 'text'),
('hero', 'subtext', 'de', 'Schluss mit Tool-Chaos. Flowentra vereint CRM, Workflows, Analytik und KI in einer Plattform — damit Sie sich auf Wachstum konzentrieren können.', 'text'),
('hero', 'cta', 'de', 'Kostenlos testen', 'text'),
('hero', 'ctaSecondary', 'de', 'Demo ansehen', 'text'),
('trustedBy', 'title', 'de', 'Vertraut von führenden Organisationen weltweit', 'text'),
('trustedBy', 'logos', 'de', '["Telnet Holding","Poulina Group","BIAT","Sofrecom","Vermeg","Instadeep","Tunisie Telecom","STEG"]', 'json'),
('features', 'title', 'de', 'Alles, was Sie für Ihr Unternehmen brauchen', 'text'),
('features', 'subtitle', 'de', 'Leistungsstarke Module für moderne Unternehmen', 'text'),
('features', 'items', 'de', '[{"title":"CRM & Kontakte","desc":"Verwalten Sie Leads, Kunden und Beziehungen mit einer 360°-Kundenansicht."},{"title":"Workflow-Engine","desc":"Visueller Drag-and-Drop-Builder zur Automatisierung komplexer Geschäftsprozesse."},{"title":"Dispatcher & Außendienst","desc":"Planen, disponieren und verfolgen Sie Außendienstoperationen mit Kartenintegration."},{"title":"Intelligenter Assistent","desc":"Intelligente Automatisierung und Einblicke durch fortschrittliche Technologie."},{"title":"Website-Builder","desc":"Erstellen Sie professionelle Websites mit einem visuellen No-Code-Editor."},{"title":"Analytik & Berichte","desc":"Echtzeit-Dashboards und umfassende Berichte für datengestützte Entscheidungen."},{"title":"Dokumente & Formulare","desc":"Dynamische Formulare und Dokumentenmanagement für optimierte Abläufe."},{"title":"E-Mail & Benachrichtigungen","desc":"Mehrkanalige Kommunikation mit E-Mail, SMS und Push-Benachrichtigungen."},{"title":"Lager & Bestand","desc":"Verfolgen Sie Lagerbestände, Bestellungen und Lieferketten in Echtzeit."},{"title":"Gmail & Outlook","desc":"Nahtlose Integration mit Gmail und Outlook für einheitliches E-Mail-Management."},{"title":"Rechnungen & Angebote","desc":"Erstellen, senden und verfolgen Sie professionelle Rechnungen und Angebote."},{"title":"Admin & Einstellungen","desc":"Volle Kontrolle über Benutzer, Rollen, Berechtigungen und Systemkonfiguration."}]', 'json'),
('pricing', 'title', 'de', 'Einfache, transparente Preise', 'text'),
('pricing', 'subtitle', 'de', 'Wählen Sie den Plan, der zu Ihrem Unternehmen passt', 'text'),
('pricing', 'currency', 'de', 'TND', 'text'),
('pricing', 'monthly', 'de', '/Monat', 'text'),
('pricing', 'cta', 'de', 'Jetzt starten', 'text'),
('pricing', 'popular', 'de', 'Am beliebtesten', 'text'),
('pricing', 'plans', 'de', '[{"name":"Starter","price":"49","features":["CRM & Kontakte","E-Mail & Benachrichtigungen","5 Benutzer","Basis-Support"]},{"name":"Professional","price":"149","features":["Alle Starter-Funktionen","Workflow-Engine","Analytik","Website-Builder","25 Benutzer","Prioritäts-Support"],"popular":true},{"name":"Enterprise","price":"349","features":["Alle Professional-Funktionen","Intelligenter Assistent","Dispatcher & Außendienst","Lager & Bestand","Unbegrenzte Benutzer","Dedizierter Account-Manager"]}]', 'json'),
('demo', 'title', 'de', 'Erleben Sie Flowentra in Aktion', 'text'),
('demo', 'subtitle', 'de', 'Entdecken Sie unsere leistungsstarken Module in interaktiven Vorschauen', 'text'),
('demo', 'workflow', 'de', 'Workflow-Automatisierung', 'text'),
('demo', 'workflowDesc', 'de', 'Erstellen Sie komplexe Automatisierungsflows mit unserem visuellen Drag-and-Drop-Builder.', 'text'),
('demo', 'analytics', 'de', 'Analytik-Dashboard', 'text'),
('demo', 'analyticsDesc', 'de', 'Überwachen Sie Ihre Geschäftskennzahlen in Echtzeit mit anpassbaren Dashboards.', 'text'),
('demo', 'nodes', 'de', '{"trigger":"Auslöser","condition":"Bedingung","action":"Aktion","email":"E-Mail-Benachrichtigung","log":"Protokoll"}', 'json'),
('demo', 'stats', 'de', '{"revenue":"Umsatz","users":"Benutzer","completion":"Abschluss"}', 'json'),
('testimonials', 'title', 'de', 'Vertraut von Branchenführern', 'text'),
('testimonials', 'subtitle', 'de', 'Erfahren Sie, wie Unternehmen ihre Abläufe mit Flowentra transformieren', 'text'),
('testimonials', 'items', 'de', '[{"name":"Sarah Mitchell","role":"COO, TechVentures Inc.","quote":"Flowentra hat unseren gesamten Betrieb vereinheitlicht. Wir haben manuelle Prozesse im ersten Quartal um 60% reduziert."},{"name":"Marc Dubois","role":"Direktor, EuroLogistics SA","quote":"Die Workflow-Engine allein hat uns tausende Stunden gespart. Die Plattform ist unglaublich intuitiv."},{"name":"Amira Ben Salem","role":"CEO, MediterraneanTrade","quote":"Endlich eine Plattform, die unsere Sprache spricht — buchstäblich. Die mehrsprachige Unterstützung ist makellos."}]', 'json'),
('faq', 'title', 'de', 'Häufig gestellte Fragen', 'text'),
('faq', 'subtitle', 'de', 'Alles, was Sie über Flowentra wissen müssen', 'text'),
('faq', 'items', 'de', '[{"q":"Wie lange dauert die Implementierung?","a":"Die meisten Teams sind innerhalb von 2 Wochen voll einsatzbereit. Unser Onboarding-Team begleitet Sie durch jeden Schritt."},{"q":"Kann ich Daten von anderen Plattformen migrieren?","a":"Ja, wir unterstützen den Datenimport von allen gängigen CRM- und ERP-Plattformen mit dedizierten Migrationswerkzeugen."},{"q":"Gibt es eine kostenlose Testversion?","a":"Ja, starten Sie mit einer 14-tägigen kostenlosen Testversion mit vollem Zugang. Keine Kreditkarte erforderlich."},{"q":"Bieten Sie API-Zugang an?","a":"Ja, Flowentra bietet eine umfassende RESTful API und Webhook-Integrationen für individuelle Workflows."}]', 'json'),
('metrics', 'items', 'de', '{"companies":"Unternehmen","uptime":"Verfügbarkeit","countries":"Länder","transactions":"Transaktionen"}', 'json'),
('ctaBanner', 'title', 'de', 'Bereit, Ihr Unternehmen zu transformieren?', 'text'),
('ctaBanner', 'subtitle', 'de', 'Schließen Sie sich Tausenden von Unternehmen an, die Flowentra bereits nutzen.', 'text'),
('ctaBanner', 'cta', 'de', 'Kostenlos testen', 'text'),
('ctaBanner', 'ctaSecondary', 'de', 'Vertrieb kontaktieren', 'text'),
('ctaBanner', 'note', 'de', 'Keine Kreditkarte · 14 Tage kostenlos · Jederzeit kündbar', 'text'),
('footer', 'desc', 'de', 'Professionelle Geschäftsmanagement-Plattform, der Organisationen weltweit vertrauen.', 'text'),
('footer', 'copyright', 'de', '© 2026 Flowentra. Alle Rechte vorbehalten.', 'text'),
('footer', 'tagline', 'de', 'Für Unternehmen gebaut. Für Menschen gestaltet.', 'text'),
('footer', 'about', 'de', 'Über uns', 'text'),
('footer', 'support', 'de', 'Support', 'text'),
('footer', 'integrations', 'de', 'Integrationen', 'text'),
('footer', 'legal', 'de', 'Rechtliches', 'text'),
('footer', 'contact', 'de', 'Kontakt', 'text'),
('footer', 'product', 'de', 'Produkt', 'text'),
('footer', 'company', 'de', 'Unternehmen', 'text'),
('footer', 'resources', 'de', 'Ressourcen', 'text'),
('footer', 'privacy', 'de', 'Datenschutzrichtlinie', 'text'),
('footer', 'terms', 'de', 'Nutzungsbedingungen', 'text'),
('footer', 'security', 'de', 'Sicherheit', 'text'),
('footer', 'status', 'de', 'Systemstatus', 'text'),
('footer', 'docs', 'de', 'Dokumentation', 'text'),
('footer', 'blog', 'de', 'Blog', 'text'),
('footer', 'careers', 'de', 'Karriere', 'text'),
('footer', 'partners', 'de', 'Partner', 'text'),
('footer', 'releases', 'de', 'Versionshinweise', 'text');

-- ==================== ARABIC (ar) ====================

INSERT INTO `flowentra_site_content` (`section`, `content_key`, `lang`, `content_value`, `content_type`) VALUES
('nav', 'features', 'ar', 'المميزات', 'text'),
('nav', 'pricing', 'ar', 'الأسعار', 'text'),
('nav', 'demo', 'ar', 'العرض', 'text'),
('nav', 'testimonials', 'ar', 'آراء العملاء', 'text'),
('nav', 'faq', 'ar', 'الأسئلة الشائعة', 'text'),
('nav', 'cta', 'ar', 'ابدأ مجاناً', 'text'),
('nav', 'signup', 'ar', 'اشترك الآن', 'text'),
('hero', 'headline', 'ar', 'أدر أعمالك بالكامل من مكان واحد', 'text'),
('hero', 'headlineSub', 'ar', 'CRM · أتمتة · تحليلات · ذكاء اصطناعي', 'text'),
('hero', 'subtext', 'ar', 'توقف عن التنقل بين الأدوات. Flowentra تجمع CRM والأتمتة والتحليلات والذكاء الاصطناعي في منصة واحدة — لتركز على النمو.', 'text'),
('hero', 'cta', 'ar', 'ابدأ مجاناً', 'text'),
('hero', 'ctaSecondary', 'ar', 'شاهد العرض', 'text'),
('trustedBy', 'title', 'ar', 'موثوقة من المؤسسات الرائدة حول العالم', 'text'),
('trustedBy', 'logos', 'ar', '["Telnet Holding","Poulina Group","BIAT","Sofrecom","Vermeg","Instadeep","Tunisie Telecom","STEG"]', 'json'),
('features', 'title', 'ar', 'كل ما تحتاجه لإدارة أعمالك', 'text'),
('features', 'subtitle', 'ar', 'وحدات قوية مصممة للمؤسسات الحديثة', 'text'),
('features', 'items', 'ar', '[{"title":"إدارة العملاء والعلاقات","desc":"إدارة العملاء المحتملين والعلاقات مع رؤية شاملة 360°."},{"title":"محرك سير العمل","desc":"منشئ مرئي بالسحب والإفلات لأتمتة العمليات المعقدة."},{"title":"التوزيع والعمليات الميدانية","desc":"جدولة وتوزيع وتتبع العمليات الميدانية مع تكامل الخرائط."},{"title":"المساعد الذكي","desc":"أتمتة ذكية ورؤى مدعومة بقدرات متقدمة."},{"title":"منشئ المواقع","desc":"إنشاء مواقع احترافية بمحرر مرئي بدون برمجة."},{"title":"التحليلات والتقارير","desc":"لوحات معلومات فورية وتقارير شاملة لقرارات مبنية على البيانات."},{"title":"المستندات والنماذج","desc":"نماذج ديناميكية وإدارة المستندات لعمليات مبسطة."},{"title":"البريد والإشعارات","desc":"تواصل متعدد القنوات بالبريد الإلكتروني والرسائل والإشعارات."},{"title":"المخزون والمستودع","desc":"تتبع مستويات المخزون والطلبات وسلسلة التوريد في الوقت الفعلي."},{"title":"Gmail و Outlook","desc":"تكامل سلس مع Gmail و Outlook لإدارة بريد إلكتروني موحدة."},{"title":"الفواتير والعروض","desc":"أنشئ وأرسل وتتبع الفواتير والعروض الاحترافية في ثوانٍ."},{"title":"الإدارة والإعدادات","desc":"تحكم كامل في المستخدمين والأدوار والصلاحيات وتكوين النظام."}]', 'json'),
('pricing', 'title', 'ar', 'أسعار بسيطة وشفافة', 'text'),
('pricing', 'subtitle', 'ar', 'اختر الخطة المناسبة لعملك', 'text'),
('pricing', 'currency', 'ar', 'د.ت', 'text'),
('pricing', 'monthly', 'ar', '/شهرياً', 'text'),
('pricing', 'cta', 'ar', 'ابدأ الآن', 'text'),
('pricing', 'popular', 'ar', 'الأكثر شعبية', 'text'),
('pricing', 'plans', 'ar', '[{"name":"المبتدئ","price":"49","features":["إدارة العملاء","البريد والإشعارات","5 مستخدمين","دعم أساسي"]},{"name":"المحترف","price":"149","features":["جميع مميزات المبتدئ","محرك سير العمل","التحليلات","منشئ المواقع","25 مستخدم","دعم ذو أولوية"],"popular":true},{"name":"المؤسسات","price":"349","features":["جميع مميزات المحترف","المساعد الذكي","التوزيع والعمليات","المخزون","مستخدمون غير محدودين","مدير حساب مخصص"]}]', 'json'),
('demo', 'title', 'ar', 'شاهد Flowentra على أرض الواقع', 'text'),
('demo', 'subtitle', 'ar', 'استكشف وحداتنا القوية من خلال معاينات تفاعلية', 'text'),
('demo', 'workflow', 'ar', 'أتمتة سير العمل', 'text'),
('demo', 'workflowDesc', 'ar', 'أنشئ تدفقات أتمتة معقدة باستخدام المنشئ المرئي بالسحب والإفلات.', 'text'),
('demo', 'analytics', 'ar', 'لوحة التحليلات', 'text'),
('demo', 'analyticsDesc', 'ar', 'راقب مؤشرات أعمالك في الوقت الفعلي مع لوحات معلومات قابلة للتخصيص.', 'text'),
('demo', 'nodes', 'ar', '{"trigger":"مُشغّل","condition":"شرط","action":"إجراء","email":"إشعار بريدي","log":"سجل"}', 'json'),
('demo', 'stats', 'ar', '{"revenue":"الإيرادات","users":"المستخدمون","completion":"الإنجاز"}', 'json'),
('testimonials', 'title', 'ar', 'ماذا يقول عملاؤنا', 'text'),
('testimonials', 'subtitle', 'ar', 'شركات في تونس وخارجها تثق بـ Flowentra يومياً', 'text'),
('testimonials', 'items', 'ar', '[{"name":"نبيل الغربي","role":"المدير التقني، Vermeg","quote":"Flowentra عوّضت 4 أدوات مختلفة عندنا. فريقنا أسرع وأخيراً عندنا مصدر واحد للحقيقة."},{"name":"سارة بن عمر","role":"مسؤولة العمليات، Telnet Holding","quote":"محرك سير العمل وحده وفّر لنا آلاف الساعات. حتى غير التقنيين يستعملوه يومياً."},{"name":"يوسف المدّب","role":"المدير العام، DataBridge Tunisia","quote":"نشرناها في أقل من أسبوعين. الدعم متعدد اللغات وتكامل الدفع المحلي غيّروا اللعبة."}]', 'json'),
('faq', 'title', 'ar', 'الأسئلة الشائعة', 'text'),
('faq', 'subtitle', 'ar', 'كل ما تحتاج معرفته عن Flowentra', 'text'),
('faq', 'items', 'ar', '[{"q":"كم يستغرق التطبيق؟","a":"معظم الفرق تكون جاهزة للعمل خلال أسبوعين. فريقنا يرافقكم في كل خطوة من العملية."},{"q":"هل يمكنني ترحيل بياناتي؟","a":"نعم، ندعم استيراد البيانات من جميع منصات CRM و ERP الرئيسية مع أدوات ترحيل مخصصة."},{"q":"هل هناك نسخة تجريبية مجانية؟","a":"بالتأكيد. ابدأ بتجربة مجانية لمدة 14 يوماً مع وصول كامل لجميع المميزات. لا حاجة لبطاقة ائتمان."},{"q":"هل توفرون واجهة برمجة تطبيقات؟","a":"نعم، توفر Flowentra واجهة RESTful API شاملة وتكاملات webhook للعمليات المخصصة."}]', 'json'),
('metrics', 'items', 'ar', '{"companies":"شركة","uptime":"وقت التشغيل","countries":"دولة","transactions":"معاملة"}', 'json'),
('ctaBanner', 'title', 'ar', 'مستعد لتحويل أعمالك؟', 'text'),
('ctaBanner', 'subtitle', 'ar', 'انضم إلى آلاف الشركات التي تستخدم Flowentra بالفعل لتحسين عملياتها.', 'text'),
('ctaBanner', 'cta', 'ar', 'ابدأ مجاناً', 'text'),
('ctaBanner', 'ctaSecondary', 'ar', 'تحدث مع المبيعات', 'text'),
('ctaBanner', 'note', 'ar', 'بدون بطاقة ائتمان · تجربة 14 يوم · إلغاء في أي وقت', 'text'),
('footer', 'desc', 'ar', 'منصة إدارة أعمال احترافية موثوقة من مؤسسات حول العالم.', 'text'),
('footer', 'copyright', 'ar', '© 2026 Flowentra. جميع الحقوق محفوظة.', 'text'),
('footer', 'tagline', 'ar', 'مبنية للمؤسسات. مصممة للناس.', 'text'),
('footer', 'about', 'ar', 'حولنا', 'text'),
('footer', 'support', 'ar', 'الدعم', 'text'),
('footer', 'integrations', 'ar', 'التكاملات', 'text'),
('footer', 'legal', 'ar', 'قانوني', 'text'),
('footer', 'contact', 'ar', 'اتصل بنا', 'text'),
('footer', 'product', 'ar', 'المنتج', 'text'),
('footer', 'company', 'ar', 'الشركة', 'text'),
('footer', 'resources', 'ar', 'الموارد', 'text'),
('footer', 'privacy', 'ar', 'سياسة الخصوصية', 'text'),
('footer', 'terms', 'ar', 'شروط الخدمة', 'text'),
('footer', 'security', 'ar', 'الأمان', 'text'),
('footer', 'status', 'ar', 'حالة النظام', 'text'),
('footer', 'docs', 'ar', 'التوثيق', 'text'),
('footer', 'blog', 'ar', 'المدونة', 'text'),
('footer', 'careers', 'ar', 'الوظائف', 'text'),
('footer', 'partners', 'ar', 'الشركاء', 'text'),
('footer', 'releases', 'ar', 'سجل الإصدارات', 'text');

-- =============================================
-- DONE! All tables, fields, and default content created.
-- Login: admin@flowentra.io / password
-- Content: 4 languages (en, fr, de, ar) × 17 sections
-- =============================================
