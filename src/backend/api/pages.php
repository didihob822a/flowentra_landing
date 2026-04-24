<?php
require_once __DIR__ . '/../config.php';

$db = new Database();
$conn = $db->getConnection();

// Make sure tables exist (idempotent — safe to call on every request).
function ensureSchema($conn) {
    $conn->exec("CREATE TABLE IF NOT EXISTS `flowentra_pages` (
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    $conn->exec("CREATE TABLE IF NOT EXISTS `flowentra_page_sections` (
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
}

try {
    ensureSchema($conn);

    $action = $_GET['action'] ?? '';

    switch ($action) {
        case 'list':           listPages($conn); break;
        case 'list_published': listPages($conn, true); break;
        case 'get':            getPage($conn); break;
        case 'create':         createPage($conn); break;
        case 'update':         updatePage($conn); break;
        case 'delete':         deletePage($conn); break;
        case 'duplicate':      duplicatePage($conn); break;
        case 'add_section':       addSection($conn); break;
        case 'remove_section':    removeSection($conn); break;
        case 'duplicate_section': duplicateSection($conn); break;
        case 'reorder':           reorderSections($conn); break;
        case 'toggle_visible':    toggleVisible($conn); break;
        case 'bulk_publish':      bulkPublish($conn); break;
        default:
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Action not found: ' . $action]);
    }
} catch (Throwable $e) {
    // Always return JSON, never a blank 500.
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage(),
    ]);
}

function jsonInput() {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?: [];
}

function fetchSections($conn, $pageId) {
    $stmt = $conn->prepare("SELECT id, page_id, section_type, instance_key, sort_order, is_visible
                            FROM flowentra_page_sections
                            WHERE page_id = :pid
                            ORDER BY sort_order ASC, id ASC");
    $stmt->execute([':pid' => $pageId]);
    return $stmt->fetchAll();
}

// ---- LIST ----
function listPages($conn, $publishedOnly = false) {
    $sql = "SELECT * FROM flowentra_pages";
    if ($publishedOnly) $sql .= " WHERE is_published = 1";
    $sql .= " ORDER BY updated_at DESC";
    $rows = $conn->query($sql)->fetchAll();
    foreach ($rows as &$r) {
        $r['sections'] = fetchSections($conn, $r['id']);
    }
    echo json_encode(['success' => true, 'data' => $rows]);
}

// ---- GET (by slug or id) ----
function getPage($conn) {
    $slug = $_GET['slug'] ?? '';
    $id   = $_GET['id']   ?? '';
    if (!$slug && !$id) {
        echo json_encode(['success' => false, 'message' => 'slug or id required']);
        return;
    }
    if ($slug) {
        $stmt = $conn->prepare("SELECT * FROM flowentra_pages WHERE slug = :s LIMIT 1");
        $stmt->execute([':s' => $slug]);
    } else {
        $stmt = $conn->prepare("SELECT * FROM flowentra_pages WHERE id = :i LIMIT 1");
        $stmt->execute([':i' => $id]);
    }
    $page = $stmt->fetch();
    if (!$page) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Page not found']);
        return;
    }
    $page['sections'] = fetchSections($conn, $page['id']);
    echo json_encode(['success' => true, 'data' => $page]);
}

// ---- CREATE ----
function createPage($conn) {
    $in = jsonInput();
    $slug = preg_replace('/[^a-z0-9\-]/', '', strtolower($in['slug'] ?? ''));
    if (!$slug) {
        echo json_encode(['success' => false, 'message' => 'Invalid or empty slug']);
        return;
    }
    // Friendly duplicate check
    $check = $conn->prepare("SELECT id FROM flowentra_pages WHERE slug = :s LIMIT 1");
    $check->execute([':s' => $slug]);
    if ($check->fetch()) {
        echo json_encode(['success' => false, 'message' => "A page with slug '$slug' already exists"]);
        return;
    }
    $stmt = $conn->prepare("INSERT INTO flowentra_pages
        (slug, title_en, title_fr, title_de, title_ar,
         meta_description_en, meta_description_fr, meta_description_de, meta_description_ar,
         is_published)
        VALUES (:slug, :te, :tf, :td, :ta, :me, :mf, :md, :ma, :pub)");
    $stmt->execute([
        ':slug' => $slug,
        ':te' => $in['title_en'] ?? '', ':tf' => $in['title_fr'] ?? '',
        ':td' => $in['title_de'] ?? '', ':ta' => $in['title_ar'] ?? '',
        ':me' => $in['meta_description_en'] ?? '', ':mf' => $in['meta_description_fr'] ?? '',
        ':md' => $in['meta_description_de'] ?? '', ':ma' => $in['meta_description_ar'] ?? '',
        ':pub' => !empty($in['is_published']) ? 1 : 0,
    ]);
    echo json_encode(['success' => true, 'data' => ['id' => (int)$conn->lastInsertId(), 'slug' => $slug]]);
}

// ---- UPDATE ----
function updatePage($conn) {
    $in = jsonInput();
    $id = (int)($in['id'] ?? 0);
    if (!$id) { echo json_encode(['success' => false, 'message' => 'id required']); return; }

    $fields = [];
    $params = [':id' => $id];
    $allowed = ['slug','title_en','title_fr','title_de','title_ar',
                'meta_description_en','meta_description_fr','meta_description_de','meta_description_ar',
                'is_published'];
    foreach ($allowed as $f) {
        if (array_key_exists($f, $in)) {
            $val = $in[$f];
            if ($f === 'slug') {
                $val = preg_replace('/[^a-z0-9\-]/', '', strtolower((string)$val));
                if (!$val) { echo json_encode(['success' => false, 'message' => 'Invalid slug']); return; }
                // Don't allow collision with another page
                $check = $conn->prepare("SELECT id FROM flowentra_pages WHERE slug = :s AND id <> :id LIMIT 1");
                $check->execute([':s' => $val, ':id' => $id]);
                if ($check->fetch()) { echo json_encode(['success' => false, 'message' => "Slug '$val' is already used"]); return; }
            }
            if ($f === 'is_published') $val = $val ? 1 : 0;
            $fields[] = "$f = :$f";
            $params[":$f"] = $val;
        }
    }
    if (!$fields) { echo json_encode(['success' => false, 'message' => 'no fields']); return; }

    $sql = "UPDATE flowentra_pages SET " . implode(', ', $fields) . " WHERE id = :id";
    $conn->prepare($sql)->execute($params);
    echo json_encode(['success' => true]);
}

// ---- DELETE ----
function deletePage($conn) {
    $in = jsonInput();
    $id = (int)($in['id'] ?? 0);
    if (!$id) { echo json_encode(['success' => false, 'message' => 'id required']); return; }

    // Also clean per-page section content from the shared content table.
    $instances = $conn->prepare("SELECT instance_key FROM flowentra_page_sections WHERE page_id = :pid");
    $instances->execute([':pid' => $id]);
    foreach ($instances->fetchAll() as $row) {
        $del = $conn->prepare("DELETE FROM flowentra_site_content WHERE section = :s");
        $del->execute([':s' => $row['instance_key']]);
    }

    $conn->prepare("DELETE FROM flowentra_pages WHERE id = :id")->execute([':id' => $id]);
    echo json_encode(['success' => true]);
}

// ---- DUPLICATE ----
function duplicatePage($conn) {
    $in = jsonInput();
    $id = (int)($in['id'] ?? 0);
    if (!$id) { echo json_encode(['success' => false, 'message' => 'id required']); return; }

    $stmt = $conn->prepare("SELECT * FROM flowentra_pages WHERE id = :id LIMIT 1");
    $stmt->execute([':id' => $id]);
    $src = $stmt->fetch();
    if (!$src) { echo json_encode(['success' => false, 'message' => 'Page not found']); return; }

    // Find unique slug "<slug>-copy", "-copy-2", etc.
    $base = $src['slug'] . '-copy';
    $slug = $base;
    $i = 2;
    while (true) {
        $c = $conn->prepare("SELECT id FROM flowentra_pages WHERE slug = :s LIMIT 1");
        $c->execute([':s' => $slug]);
        if (!$c->fetch()) break;
        $slug = $base . '-' . $i;
        $i++;
    }

    $conn->beginTransaction();
    try {
        $ins = $conn->prepare("INSERT INTO flowentra_pages
            (slug, title_en, title_fr, title_de, title_ar,
             meta_description_en, meta_description_fr, meta_description_de, meta_description_ar,
             is_published)
            VALUES (:slug, :te, :tf, :td, :ta, :me, :mf, :md, :ma, 0)");
        $ins->execute([
            ':slug' => $slug,
            ':te' => ($src['title_en'] ? $src['title_en'] . ' (copy)' : ''),
            ':tf' => $src['title_fr'], ':td' => $src['title_de'], ':ta' => $src['title_ar'],
            ':me' => $src['meta_description_en'], ':mf' => $src['meta_description_fr'],
            ':md' => $src['meta_description_de'], ':ma' => $src['meta_description_ar'],
        ]);
        $newId = (int)$conn->lastInsertId();

        // Copy section rows + their content
        $sections = fetchSections($conn, $id);
        $insSection = $conn->prepare("INSERT INTO flowentra_page_sections
            (page_id, section_type, instance_key, sort_order, is_visible)
            VALUES (:p, :t, :k, :o, :v)");
        $copyContent = $conn->prepare("INSERT INTO flowentra_site_content (section, content_key, lang, value, type)
            SELECT :newKey, content_key, lang, value, type FROM flowentra_site_content WHERE section = :oldKey");

        foreach ($sections as $s) {
            // Build matching new instance_key with new page_id
            $newKey = "page_{$newId}_{$s['section_type']}_" . preg_replace('/^.+_/', '', $s['instance_key']);
            // Ensure uniqueness
            $j = 1;
            $candidate = "page_{$newId}_{$s['section_type']}_$j";
            $check = $conn->prepare("SELECT id FROM flowentra_page_sections WHERE page_id = :p AND instance_key = :k");
            do {
                $candidate = "page_{$newId}_{$s['section_type']}_$j";
                $check->execute([':p' => $newId, ':k' => $candidate]);
                $exists = $check->fetch();
                $j++;
            } while ($exists);
            $newKey = $candidate;

            $insSection->execute([
                ':p' => $newId, ':t' => $s['section_type'], ':k' => $newKey,
                ':o' => $s['sort_order'], ':v' => $s['is_visible'],
            ]);
            $copyContent->execute([':newKey' => $newKey, ':oldKey' => $s['instance_key']]);
        }
        $conn->commit();
        echo json_encode(['success' => true, 'data' => ['id' => $newId, 'slug' => $slug]]);
    } catch (Throwable $e) {
        $conn->rollBack();
        echo json_encode(['success' => false, 'message' => 'Duplicate failed: ' . $e->getMessage()]);
    }
}

// ---- ADD SECTION ----
function addSection($conn) {
    $in = jsonInput();
    $pageId = (int)($in['page_id'] ?? 0);
    $type = preg_replace('/[^a-zA-Z0-9_]/', '', $in['section_type'] ?? '');
    if (!$pageId || !$type) { echo json_encode(['success' => false, 'message' => 'page_id and section_type required']); return; }

    // Verify page exists
    $check = $conn->prepare("SELECT id FROM flowentra_pages WHERE id = :id");
    $check->execute([':id' => $pageId]);
    if (!$check->fetch()) { echo json_encode(['success' => false, 'message' => 'Page not found']); return; }

    // Find next sort_order
    $stmt = $conn->prepare("SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM flowentra_page_sections WHERE page_id = :p");
    $stmt->execute([':p' => $pageId]);
    $sortOrder = (int)$stmt->fetch()['next'];

    // Build a unique instance_key
    $base = "page_{$pageId}_{$type}_";
    $i = 1;
    $candidate = $base . $i;
    while (true) {
        $candidate = $base . $i;
        $check = $conn->prepare("SELECT id FROM flowentra_page_sections WHERE page_id = :p AND instance_key = :k");
        $check->execute([':p' => $pageId, ':k' => $candidate]);
        if (!$check->fetch()) break;
        $i++;
    }
    $instanceKey = $candidate;

    $stmt = $conn->prepare("INSERT INTO flowentra_page_sections (page_id, section_type, instance_key, sort_order)
                            VALUES (:p, :t, :k, :o)");
    $stmt->execute([':p' => $pageId, ':t' => $type, ':k' => $instanceKey, ':o' => $sortOrder]);

    echo json_encode(['success' => true, 'data' => [
        'id' => (int)$conn->lastInsertId(),
        'page_id' => $pageId,
        'section_type' => $type,
        'instance_key' => $instanceKey,
        'sort_order' => $sortOrder,
        'is_visible' => 1,
    ]]);
}

// ---- REMOVE SECTION ----
function removeSection($conn) {
    $in = jsonInput();
    $id = (int)($in['id'] ?? 0);
    if (!$id) { echo json_encode(['success' => false, 'message' => 'id required']); return; }

    $stmt = $conn->prepare("SELECT instance_key FROM flowentra_page_sections WHERE id = :id");
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();
    if ($row) {
        $conn->prepare("DELETE FROM flowentra_site_content WHERE section = :s")->execute([':s' => $row['instance_key']]);
    }
    $conn->prepare("DELETE FROM flowentra_page_sections WHERE id = :id")->execute([':id' => $id]);
    echo json_encode(['success' => true]);
}

// ---- REORDER ----
function reorderSections($conn) {
    $in = jsonInput();
    $pageId = (int)($in['page_id'] ?? 0);
    $orderedIds = $in['ordered_ids'] ?? [];
    if (!$pageId || !is_array($orderedIds)) { echo json_encode(['success' => false, 'message' => 'page_id and ordered_ids required']); return; }

    $conn->beginTransaction();
    try {
        $stmt = $conn->prepare("UPDATE flowentra_page_sections SET sort_order = :o WHERE id = :id AND page_id = :p");
        foreach ($orderedIds as $i => $id) {
            $stmt->execute([':o' => $i, ':id' => (int)$id, ':p' => $pageId]);
        }
        $conn->commit();
        echo json_encode(['success' => true]);
    } catch (Throwable $e) {
        $conn->rollBack();
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

// ---- TOGGLE VISIBILITY ----
function toggleVisible($conn) {
    $in = jsonInput();
    $id = (int)($in['id'] ?? 0);
    $vis = !empty($in['is_visible']) ? 1 : 0;
    if (!$id) { echo json_encode(['success' => false, 'message' => 'id required']); return; }
    $conn->prepare("UPDATE flowentra_page_sections SET is_visible = :v WHERE id = :id")
         ->execute([':v' => $vis, ':id' => $id]);
    echo json_encode(['success' => true]);
}

// ---- DUPLICATE SECTION (within same page) ----
function duplicateSection($conn) {
    $in = jsonInput();
    $id = (int)($in['id'] ?? 0);
    if (!$id) { echo json_encode(['success' => false, 'message' => 'id required']); return; }

    $stmt = $conn->prepare("SELECT * FROM flowentra_page_sections WHERE id = :id");
    $stmt->execute([':id' => $id]);
    $src = $stmt->fetch();
    if (!$src) { echo json_encode(['success' => false, 'message' => 'Section not found']); return; }

    $pageId = (int)$src['page_id'];
    $type   = $src['section_type'];

    // Build a new unique instance_key
    $i = 1;
    $check = $conn->prepare("SELECT id FROM flowentra_page_sections WHERE page_id = :p AND instance_key = :k");
    do {
        $candidate = "page_{$pageId}_{$type}_$i";
        $check->execute([':p' => $pageId, ':k' => $candidate]);
        $exists = $check->fetch();
        $i++;
    } while ($exists);
    $newKey = $candidate;

    // Next sort order = right after the source
    $maxStmt = $conn->prepare("SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM flowentra_page_sections WHERE page_id = :p");
    $maxStmt->execute([':p' => $pageId]);
    $sortOrder = (int)$maxStmt->fetch()['next'];

    $conn->beginTransaction();
    try {
        $ins = $conn->prepare("INSERT INTO flowentra_page_sections
            (page_id, section_type, instance_key, sort_order, is_visible)
            VALUES (:p, :t, :k, :o, :v)");
        $ins->execute([
            ':p' => $pageId, ':t' => $type, ':k' => $newKey,
            ':o' => $sortOrder, ':v' => $src['is_visible'],
        ]);
        $newId = (int)$conn->lastInsertId();

        // Copy content rows for this section
        $copy = $conn->prepare("INSERT INTO flowentra_site_content (section, content_key, lang, value, type)
            SELECT :newKey, content_key, lang, value, type FROM flowentra_site_content WHERE section = :oldKey");
        $copy->execute([':newKey' => $newKey, ':oldKey' => $src['instance_key']]);

        $conn->commit();
        echo json_encode(['success' => true, 'data' => [
            'id' => $newId, 'page_id' => $pageId, 'section_type' => $type,
            'instance_key' => $newKey, 'sort_order' => $sortOrder, 'is_visible' => (int)$src['is_visible'],
        ]]);
    } catch (Throwable $e) {
        $conn->rollBack();
        echo json_encode(['success' => false, 'message' => 'Duplicate section failed: ' . $e->getMessage()]);
    }
}

// ---- BULK PUBLISH/UNPUBLISH ----
function bulkPublish($conn) {
    $in = jsonInput();
    $ids = $in['ids'] ?? [];
    $pub = !empty($in['is_published']) ? 1 : 0;
    if (!is_array($ids) || !count($ids)) { echo json_encode(['success' => false, 'message' => 'ids required']); return; }
    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    $params = array_map('intval', $ids);
    $params[] = $pub; // not used in IN(), but we'll bind separately
    $stmt = $conn->prepare("UPDATE flowentra_pages SET is_published = ? WHERE id IN ($placeholders)");
    $stmt->execute(array_merge([$pub], array_map('intval', $ids)));
    echo json_encode(['success' => true, 'data' => ['updated' => $stmt->rowCount()]]);
}
?>
