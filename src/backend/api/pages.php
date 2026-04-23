<?php
require_once __DIR__ . '/../config.php';

$db = new Database();
$conn = $db->getConnection();

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'list':           listPages($conn); break;
    case 'list_published': listPages($conn, true); break;
    case 'get':            getPage($conn); break;
    case 'create':         createPage($conn); break;
    case 'update':         updatePage($conn); break;
    case 'delete':         deletePage($conn); break;
    case 'add_section':    addSection($conn); break;
    case 'remove_section': removeSection($conn); break;
    case 'reorder':        reorderSections($conn); break;
    case 'toggle_visible': toggleVisible($conn); break;
    default:
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Action not found']);
}

function jsonInput() {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?: [];
}

function fetchSections($conn, $pageId) {
    $stmt = $conn->prepare("SELECT id, section_type, instance_key, sort_order, is_visible
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
        echo json_encode(['success' => false, 'message' => 'Invalid slug']);
        return;
    }
    try {
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
        echo json_encode(['success' => true, 'data' => ['id' => $conn->lastInsertId(), 'slug' => $slug]]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Slug already exists or DB error: ' . $e->getMessage()]);
    }
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
            if ($f === 'slug') $val = preg_replace('/[^a-z0-9\-]/', '', strtolower($val));
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

// ---- ADD SECTION ----
function addSection($conn) {
    $in = jsonInput();
    $pageId = (int)($in['page_id'] ?? 0);
    $type = preg_replace('/[^a-zA-Z0-9_]/', '', $in['section_type'] ?? '');
    if (!$pageId || !$type) { echo json_encode(['success' => false, 'message' => 'page_id and section_type required']); return; }

    // Find next sort_order
    $stmt = $conn->prepare("SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM flowentra_page_sections WHERE page_id = :p");
    $stmt->execute([':p' => $pageId]);
    $sortOrder = (int)$stmt->fetch()['next'];

    // Build a unique instance_key
    $base = "page_{$pageId}_{$type}_";
    $i = 1;
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
        'id' => $conn->lastInsertId(),
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
    } catch (Exception $e) {
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
?>
