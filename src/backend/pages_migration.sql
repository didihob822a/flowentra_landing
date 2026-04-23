-- =====================================================================
-- Page Builder migration — run this once on the production MySQL DB.
-- Creates two tables. Per-page section content reuses the existing
-- `flowentra_site_content` table (the section column stores the
-- per-page instance_key, e.g. "page_3_hero_1").
-- =====================================================================

CREATE TABLE IF NOT EXISTS `flowentra_pages` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `slug` VARCHAR(120) UNIQUE NOT NULL,
  `title_en` VARCHAR(255) DEFAULT NULL,
  `title_fr` VARCHAR(255) DEFAULT NULL,
  `title_de` VARCHAR(255) DEFAULT NULL,
  `title_ar` VARCHAR(255) DEFAULT NULL,
  `meta_description_en` TEXT DEFAULT NULL,
  `meta_description_fr` TEXT DEFAULT NULL,
  `meta_description_de` TEXT DEFAULT NULL,
  `meta_description_ar` TEXT DEFAULT NULL,
  `is_published` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_slug` (`slug`),
  INDEX `idx_published` (`is_published`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `flowentra_page_sections` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `page_id` INT NOT NULL,
  `section_type` VARCHAR(60) NOT NULL,
  `instance_key` VARCHAR(120) NOT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_visible` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`page_id`) REFERENCES `flowentra_pages`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `uniq_page_instance` (`page_id`, `instance_key`),
  INDEX `idx_page_order` (`page_id`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Register the new "Custom Links" field on the nav section so it appears
-- in the existing Section Editor. Each item: { "label": "Our Story", "href": "/p/our-story" }.
INSERT IGNORE INTO `flowentra_cms_fields`
  (`section_key`, `field_key`, `field_label`, `field_type`, `sort_order`, `is_required`)
VALUES
  ('nav', 'customLinks', 'Custom Nav Links (JSON: [{"label":"…","href":"/p/…"}])', 'json', 99, 0);
