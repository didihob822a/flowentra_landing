<?php
require_once __DIR__ . '/../config.php';

$db = new Database();
$conn = $db->getConnection();

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'list':
        handleList($conn);
        break;
    case 'public':
        handlePublic($conn);
        break;
    case 'get':
        handleGet($conn);
        break;
    case 'create':
        handleCreate($conn);
        break;
    case 'update':
        handleUpdate($conn);
        break;
    case 'delete':
        handleDelete($conn);
        break;
    case 'add_item':
        handleAddItem($conn);
        break;
    case 'update_item':
        handleUpdateItem($conn);
        break;
    case 'delete_item':
        handleDeleteItem($conn);
        break;
    case 'toggle_publish':
        handleTogglePublish($conn);
        break;
    default:
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Action not found']);
}

// ==================== PUBLIC (no auth) ====================

function handlePublic($conn) {
    $lang = $_GET['lang'] ?? 'en';

    $stmt = $conn->prepare("
        SELECT r.id, r.version, r.release_date,
               COALESCE(dt.date_text, DATE_FORMAT(r.release_date, '%M %d, %Y')) AS date_display
        FROM flowentra_releases r
        LEFT JOIN flowentra_release_date_translations dt ON dt.release_id = r.id AND dt.lang = :lang
        WHERE r.is_published = 1
        ORDER BY r.release_date DESC
        LIMIT 50
    ");
    $stmt->execute([':lang' => $lang]);
    $releases = $stmt->fetchAll();

    foreach ($releases as &$release) {
        $stmtItems = $conn->prepare("
            SELECT ri.id, ri.item_type,
                   COALESCE(t.text, te.text, '') AS text
            FROM flowentra_release_items ri
            LEFT JOIN flowentra_release_item_translations t ON t.item_id = ri.id AND t.lang = :lang
            LEFT JOIN flowentra_release_item_translations te ON te.item_id = ri.id AND te.lang = 'en'
            WHERE ri.release_id = :rid
            ORDER BY ri.sort_order ASC
        ");
        $stmtItems->execute([':lang' => $lang, ':rid' => $release['id']]);
        $release['items'] = $stmtItems->fetchAll();
    }

    echo json_encode(['success' => true, 'data' => $releases]);
}

// ==================== ADMIN (auth required) ====================

function handleList($conn) {
    $stmt = $conn->query("SELECT * FROM flowentra_releases ORDER BY release_date DESC");
    $releases = $stmt->fetchAll();

    foreach ($releases as &$release) {
        $stmtItems = $conn->prepare("SELECT ri.*, GROUP_CONCAT(CONCAT(t.lang, ':', t.text) SEPARATOR '||') AS translations FROM flowentra_release_items ri LEFT JOIN flowentra_release_item_translations t ON t.item_id = ri.id WHERE ri.release_id = :rid GROUP BY ri.id ORDER BY ri.sort_order ASC");
        $stmtItems->execute([':rid' => $release['id']]);
        $items = $stmtItems->fetchAll();

        foreach ($items as &$item) {
            $item['texts'] = [];
            if (!empty($item['translations'])) {
                foreach (explode('||', $item['translations']) as $pair) {
                    $parts = explode(':', $pair, 2);
                    if (count($parts) === 2) {
                        $item['texts'][$parts[0]] = $parts[1];
                    }
                }
            }
            unset($item['translations']);
        }
        $release['items'] = $items;

        // Date translations
        $stmtDates = $conn->prepare("SELECT lang, date_text FROM flowentra_release_date_translations WHERE release_id = :rid");
        $stmtDates->execute([':rid' => $release['id']]);
        $release['date_translations'] = [];
        foreach ($stmtDates->fetchAll() as $dt) {
            $release['date_translations'][$dt['lang']] = $dt['date_text'];
        }
    }

    echo json_encode(['success' => true, 'data' => $releases]);
}

function handleGet($conn) {
    $id = (int)($_GET['id'] ?? 0);
    $stmt = $conn->prepare("SELECT * FROM flowentra_releases WHERE id = :id");
    $stmt->execute([':id' => $id]);
    $release = $stmt->fetch();

    if (!$release) { http_response_code(404); echo json_encode(['success' => false, 'message' => 'Not found']); return; }

    echo json_encode(['success' => true, 'data' => $release]);
}

function handleCreate($conn) {
    $data = json_decode(file_get_contents('php://input'), true);
    $version = trim($data['version'] ?? '');
    $releaseDate = $data['release_date'] ?? date('Y-m-d');
    $isPublished = (int)($data['is_published'] ?? 0);

    if (empty($version)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Version is required']);
        return;
    }

    $stmt = $conn->prepare("INSERT INTO flowentra_releases (version, release_date, is_published, created_by) VALUES (:v, :d, :p, :u)");
    $stmt->execute([':v' => $version, ':d' => $releaseDate, ':p' => $isPublished, ':u' => 1]);

    $releaseId = $conn->lastInsertId();

    // Insert items if provided
    if (!empty($data['items'])) {
        insertItems($conn, $releaseId, $data['items']);
    }

    // Insert date translations if provided
    if (!empty($data['date_translations'])) {
        insertDateTranslations($conn, $releaseId, $data['date_translations']);
    }

    echo json_encode(['success' => true, 'data' => ['id' => $releaseId]]);
}

function handleUpdate($conn) {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = (int)($data['id'] ?? 0);

    $fields = [];
    $params = [':id' => $id];

    if (isset($data['version'])) { $fields[] = "version = :v"; $params[':v'] = $data['version']; }
    if (isset($data['release_date'])) { $fields[] = "release_date = :d"; $params[':d'] = $data['release_date']; }
    if (isset($data['is_published'])) { $fields[] = "is_published = :p"; $params[':p'] = (int)$data['is_published']; }

    if (!empty($fields)) {
        $stmt = $conn->prepare("UPDATE flowentra_releases SET " . implode(', ', $fields) . " WHERE id = :id");
        $stmt->execute($params);
    }

    // Replace items if provided
    if (isset($data['items'])) {
        $conn->prepare("DELETE FROM flowentra_release_items WHERE release_id = :rid")->execute([':rid' => $id]);
        insertItems($conn, $id, $data['items']);
    }

    // Replace date translations
    if (isset($data['date_translations'])) {
        $conn->prepare("DELETE FROM flowentra_release_date_translations WHERE release_id = :rid")->execute([':rid' => $id]);
        insertDateTranslations($conn, $id, $data['date_translations']);
    }

    echo json_encode(['success' => true]);
}

function handleDelete($conn) {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = (int)($data['id'] ?? 0);

    $stmt = $conn->prepare("DELETE FROM flowentra_releases WHERE id = :id");
    $stmt->execute([':id' => $id]);

    echo json_encode(['success' => true]);
}

function handleAddItem($conn) {
    $data = json_decode(file_get_contents('php://input'), true);
    $releaseId = (int)($data['release_id'] ?? 0);
    $type = $data['item_type'] ?? 'feature';
    $sortOrder = (int)($data['sort_order'] ?? 0);

    $stmt = $conn->prepare("INSERT INTO flowentra_release_items (release_id, item_type, sort_order) VALUES (:rid, :t, :s)");
    $stmt->execute([':rid' => $releaseId, ':t' => $type, ':s' => $sortOrder]);

    $itemId = $conn->lastInsertId();

    if (!empty($data['texts'])) {
        foreach ($data['texts'] as $lang => $text) {
            $conn->prepare("INSERT INTO flowentra_release_item_translations (item_id, lang, text) VALUES (:iid, :l, :t)")
                ->execute([':iid' => $itemId, ':l' => $lang, ':t' => $text]);
        }
    }

    echo json_encode(['success' => true, 'data' => ['id' => $itemId]]);
}

function handleUpdateItem($conn) {
    $data = json_decode(file_get_contents('php://input'), true);
    $itemId = (int)($data['id'] ?? 0);

    if (isset($data['item_type'])) {
        $conn->prepare("UPDATE flowentra_release_items SET item_type = :t WHERE id = :id")->execute([':t' => $data['item_type'], ':id' => $itemId]);
    }

    if (isset($data['texts'])) {
        foreach ($data['texts'] as $lang => $text) {
            $conn->prepare("INSERT INTO flowentra_release_item_translations (item_id, lang, text) VALUES (:iid, :l, :t) ON DUPLICATE KEY UPDATE text = :t2")
                ->execute([':iid' => $itemId, ':l' => $lang, ':t' => $text, ':t2' => $text]);
        }
    }

    echo json_encode(['success' => true]);
}

function handleDeleteItem($conn) {
    $data = json_decode(file_get_contents('php://input'), true);
    $itemId = (int)($data['id'] ?? 0);

    $conn->prepare("DELETE FROM flowentra_release_items WHERE id = :id")->execute([':id' => $itemId]);
    echo json_encode(['success' => true]);
}

function handleTogglePublish($conn) {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = (int)($data['id'] ?? 0);

    $conn->prepare("UPDATE flowentra_releases SET is_published = NOT is_published WHERE id = :id")->execute([':id' => $id]);
    echo json_encode(['success' => true]);
}

// ==================== HELPERS ====================

function insertItems($conn, $releaseId, $items) {
    foreach ($items as $idx => $item) {
        $stmt = $conn->prepare("INSERT INTO flowentra_release_items (release_id, item_type, sort_order) VALUES (:rid, :t, :s)");
        $stmt->execute([':rid' => $releaseId, ':t' => $item['item_type'] ?? 'feature', ':s' => $idx]);
        $itemId = $conn->lastInsertId();

        if (!empty($item['texts'])) {
            foreach ($item['texts'] as $lang => $text) {
                $conn->prepare("INSERT INTO flowentra_release_item_translations (item_id, lang, text) VALUES (:iid, :l, :t)")
                    ->execute([':iid' => $itemId, ':l' => $lang, ':t' => $text]);
            }
        }
    }
}

function insertDateTranslations($conn, $releaseId, $translations) {
    foreach ($translations as $lang => $text) {
        $conn->prepare("INSERT INTO flowentra_release_date_translations (release_id, lang, date_text) VALUES (:rid, :l, :t)")
            ->execute([':rid' => $releaseId, ':l' => $lang, ':t' => $text]);
    }
}
?>
