<?php
require_once __DIR__ . '/../config.php';

$db = new Database();
$conn = $db->getConnection();

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'get':
        getContent($conn);
        break;
    case 'get_section':
        getSectionContent($conn);
        break;
    case 'get_all':
        getAllContent($conn);
        break;
    case 'save':
        saveContent($conn);
        break;
    case 'save_bulk':
        saveBulkContent($conn);
        break;
    case 'sections':
        getSections($conn);
        break;
    case 'sections_status':
        getSectionsStatus($conn);
        break;
    case 'fields':
        getFields($conn);
        break;
    case 'history':
        getHistory($conn);
        break;
    case 'export':
        exportContent($conn);
        break;
    case 'import':
        importContent($conn);
        break;
    default:
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Action not found']);
}

function getContent($conn) {
    $section = $_GET['section'] ?? '';
    $key = $_GET['key'] ?? '';
    $lang = $_GET['lang'] ?? 'en';

    $stmt = $conn->prepare("SELECT content_value, content_type FROM flowentra_site_content WHERE section = :section AND content_key = :key AND lang = :lang");
    $stmt->execute([':section' => $section, ':key' => $key, ':lang' => $lang]);
    $row = $stmt->fetch();

    echo json_encode([
        'success' => true,
        'data' => $row ? $row['content_value'] : null,
        'type' => $row ? $row['content_type'] : 'text',
    ]);
}

function getSectionContent($conn) {
    $section = $_GET['section'] ?? '';
    $lang = $_GET['lang'] ?? 'en';

    $stmt = $conn->prepare("SELECT content_key, content_value, content_type FROM flowentra_site_content WHERE section = :section AND lang = :lang ORDER BY content_key");
    $stmt->execute([':section' => $section, ':lang' => $lang]);
    $rows = $stmt->fetchAll();

    $data = [];
    foreach ($rows as $row) {
        $data[$row['content_key']] = [
            'value' => $row['content_value'],
            'type' => $row['content_type'],
        ];
    }

    echo json_encode(['success' => true, 'data' => $data]);
}

function getAllContent($conn) {
    $stmt = $conn->query("SELECT section, content_key, content_value, content_type, lang FROM flowentra_site_content ORDER BY section, lang, content_key");
    $rows = $stmt->fetchAll();

    // Primary payload: { lang: { section: { key: value } } } — kept for backward compat
    $data = [];
    // Type map: { section: { key: type } } — lets the client know which fields are JSON
    $types = [];
    foreach ($rows as $row) {
        $lang = $row['lang'];
        $section = $row['section'];
        $key = $row['content_key'];
        if (!isset($data[$lang])) $data[$lang] = [];
        if (!isset($data[$lang][$section])) $data[$lang][$section] = [];
        $data[$lang][$section][$key] = $row['content_value'];

        if (!isset($types[$section])) $types[$section] = [];
        // type is the same per (section,key) regardless of lang — last write wins, harmless
        $types[$section][$key] = $row['content_type'] ?: 'text';
    }

    echo json_encode(['success' => true, 'data' => $data, 'types' => $types]);
}

function saveContent($conn) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
        return;
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $section = $data['section'] ?? '';
    $key = $data['key'] ?? '';
    $lang = $data['lang'] ?? 'en';
    $value = $data['value'] ?? '';
    $type = $data['type'] ?? 'text';

    if (empty($section) || empty($key)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Section and key are required']);
        return;
    }

    // Get old value for changelog
    $stmt = $conn->prepare("SELECT id, content_value FROM flowentra_site_content WHERE section = :section AND content_key = :key AND lang = :lang");
    $stmt->execute([':section' => $section, ':key' => $key, ':lang' => $lang]);
    $existing = $stmt->fetch();

    // Upsert content
    $stmt = $conn->prepare("
        INSERT INTO flowentra_site_content (section, content_key, lang, content_value, content_type, updated_by) 
        VALUES (:section, :key, :lang, :value, :type, :user_id)
        ON DUPLICATE KEY UPDATE content_value = :value2, content_type = :type2, updated_by = :user_id2
    ");
    $stmt->execute([
        ':section' => $section,
        ':key' => $key,
        ':lang' => $lang,
        ':value' => $value,
        ':type' => $type,
        ':user_id' => 1,
        ':value2' => $value,
        ':type2' => $type,
        ':user_id2' => 1,
    ]);

    // Get the content ID for changelog
    $stmt = $conn->prepare("SELECT id FROM flowentra_site_content WHERE section = :section AND content_key = :key AND lang = :lang");
    $stmt->execute([':section' => $section, ':key' => $key, ':lang' => $lang]);
    $contentRow = $stmt->fetch();

    // Log change
    if ($contentRow) {
        $stmt = $conn->prepare("INSERT INTO flowentra_content_changelog (content_id, section, content_key, lang, old_value, new_value, changed_by) VALUES (:cid, :section, :key, :lang, :old, :new, :by)");
        $stmt->execute([
            ':cid' => $contentRow['id'],
            ':section' => $section,
            ':key' => $key,
            ':lang' => $lang,
            ':old' => $existing ? $existing['content_value'] : null,
            ':new' => $value,
            ':by' => 1,
        ]);
    }

    echo json_encode(['success' => true, 'message' => 'Content saved']);
}

function saveBulkContent($conn) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
        return;
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $items = $data['items'] ?? [];

    if (empty($items)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'No items provided']);
        return;
    }

    $conn->beginTransaction();
    try {
        $upsertStmt = $conn->prepare("
            INSERT INTO flowentra_site_content (section, content_key, lang, content_value, content_type, updated_by) 
            VALUES (:section, :key, :lang, :value, :type, :uid)
            ON DUPLICATE KEY UPDATE content_value = :value2, content_type = :type2, updated_by = :uid2
        ");

        $saved = 0;
        foreach ($items as $item) {
            $upsertStmt->execute([
                ':section' => $item['section'],
                ':key' => $item['key'],
                ':lang' => $item['lang'],
                ':value' => $item['value'],
                ':type' => $item['type'] ?? 'text',
                ':uid' => 1,
                ':value2' => $item['value'],
                ':type2' => $item['type'] ?? 'text',
                ':uid2' => 1,
            ]);
            $saved++;
        }

        $conn->commit();
        echo json_encode(['success' => true, 'message' => "$saved items saved", 'count' => $saved]);
    } catch (Exception $e) {
        $conn->rollBack();
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to save: ' . $e->getMessage()]);
    }
}

function getSections($conn) {
    $stmt = $conn->query("SELECT section_key, label, icon, sort_order, is_active FROM flowentra_cms_sections WHERE is_active = 1 ORDER BY sort_order");
    echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
}

function getSectionsStatus($conn) {
    // Returns ALL sections (active + inactive) so the public site can hide what admins disabled.
    $stmt = $conn->query("SELECT section_key, is_active FROM flowentra_cms_sections");
    echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
}

function getFields($conn) {
    $section = $_GET['section'] ?? '';
    $stmt = $conn->prepare("SELECT field_key, field_label, field_type, is_array, array_max_items, sort_order, placeholder, is_required FROM flowentra_cms_fields WHERE section_key = :section ORDER BY sort_order");
    $stmt->execute([':section' => $section]);
    echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
}

function getHistory($conn) {
    $section = $_GET['section'] ?? '';
    $limit = min((int)($_GET['limit'] ?? 50), 200);

    $where = '';
    $params = [];
    if (!empty($section)) {
        $where = 'WHERE cl.section = :section';
        $params[':section'] = $section;
    }

    $stmt = $conn->prepare("
        SELECT cl.section, cl.content_key, cl.lang, cl.old_value, cl.new_value, cl.changed_at, u.name as changed_by_name
        FROM flowentra_content_changelog cl
        JOIN flowentra_admin_users u ON cl.changed_by = u.id
        $where
        ORDER BY cl.changed_at DESC
        LIMIT $limit
    ");
    $stmt->execute($params);

    echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
}

function exportContent($conn) {
    $stmt = $conn->query("SELECT section, content_key, lang, content_value, content_type FROM flowentra_site_content ORDER BY section, lang, content_key");
    echo json_encode([
        'success' => true,
        'data' => $stmt->fetchAll(),
        'exported_at' => date('Y-m-d H:i:s'),
        'exported_by' => 'Admin',
    ]);
}

function importContent($conn) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
        return;
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $items = $data['data'] ?? [];

    $conn->beginTransaction();
    try {
        $stmt = $conn->prepare("
            INSERT INTO flowentra_site_content (section, content_key, lang, content_value, content_type, updated_by) 
            VALUES (:section, :key, :lang, :value, :type, :uid)
            ON DUPLICATE KEY UPDATE content_value = :value2, content_type = :type2, updated_by = :uid2
        ");

        foreach ($items as $item) {
            $stmt->execute([
                ':section' => $item['section'],
                ':key' => $item['content_key'],
                ':lang' => $item['lang'],
                ':value' => $item['content_value'],
                ':type' => $item['content_type'] ?? 'text',
                ':uid' => 1,
                ':value2' => $item['content_value'],
                ':type2' => $item['content_type'] ?? 'text',
                ':uid2' => 1,
            ]);
        }

        $conn->commit();
        echo json_encode(['success' => true, 'message' => count($items) . ' items imported']);
    } catch (Exception $e) {
        $conn->rollBack();
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Import failed: ' . $e->getMessage()]);
    }
}
?>
