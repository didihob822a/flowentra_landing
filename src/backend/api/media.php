<?php
/**
 * Flowentra CMS - Media Upload API
 * Handles image uploads for CMS content (hero backgrounds, logos, icons)
 */

require_once __DIR__ . '/../config.php';

// Increase limits for uploads
@ini_set('upload_max_filesize', '20M');
@ini_set('post_max_size', '25M');
@ini_set('memory_limit', '128M');
@ini_set('max_execution_time', '120');
@set_time_limit(120);

$db = new Database();
$conn = $db->getConnection();

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'upload':
        handleUpload($conn);
        break;
    case 'list':
        handleList($conn);
        break;
    case 'get':
        handleGet($conn);
        break;
    case 'delete':
        handleDelete($conn);
        break;
    case 'replace':
        handleReplace($conn);
        break;
    default:
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Action not found']);
}

function handleUpload($conn) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
        return;
    }

    if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        $errorMessages = [
            UPLOAD_ERR_INI_SIZE => 'File exceeds server upload limit',
            UPLOAD_ERR_FORM_SIZE => 'File exceeds form upload limit',
            UPLOAD_ERR_PARTIAL => 'File was only partially uploaded',
            UPLOAD_ERR_NO_FILE => 'No file was uploaded',
            UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder',
            UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
            UPLOAD_ERR_EXTENSION => 'A PHP extension stopped the upload',
        ];
        $code = isset($_FILES['image']) ? $_FILES['image']['error'] : UPLOAD_ERR_NO_FILE;
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => $errorMessages[$code] ?? 'Unknown upload error']);
        return;
    }

    $file = $_FILES['image'];

    $allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
        'image/webp', 'image/svg+xml', 'image/x-icon',
    ];
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if (!in_array($mimeType, $allowedTypes)) {
        http_response_code(415);
        echo json_encode(['success' => false, 'message' => 'Invalid file type. Allowed: JPG, PNG, GIF, WebP, SVG, ICO']);
        return;
    }

    $maxSize = 20 * 1024 * 1024;
    if ($file['size'] > $maxSize) {
        http_response_code(413);
        echo json_encode(['success' => false, 'message' => 'File size exceeds 20MB limit']);
        return;
    }

    $category = isset($_POST['category']) ? trim($_POST['category']) : 'general';
    $altText = isset($_POST['alt_text']) ? trim($_POST['alt_text']) : '';
    $section = isset($_POST['section']) ? trim($_POST['section']) : '';

    $validCategories = ['hero', 'logo', 'icon', 'integration', 'screenshot', 'general'];
    if (!in_array($category, $validCategories)) {
        $category = 'general';
    }

    $baseUploadDir = __DIR__ . '/../uploads';
    $categoryDir = $baseUploadDir . '/' . $category;
    
    if (!is_dir($baseUploadDir)) mkdir($baseUploadDir, 0755, true);
    if (!is_dir($categoryDir)) mkdir($categoryDir, 0755, true);

    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if ($extension === 'jpeg') $extension = 'jpg';
    if (empty($extension)) {
        $extMap = [
            'image/jpeg' => 'jpg', 'image/png' => 'png', 'image/gif' => 'gif',
            'image/webp' => 'webp', 'image/svg+xml' => 'svg', 'image/x-icon' => 'ico',
        ];
        $extension = $extMap[$mimeType] ?? 'png';
    }

    $timestamp = time();
    $randomStr = bin2hex(random_bytes(4));
    $safeOrigName = preg_replace('/[^a-zA-Z0-9_-]/', '', pathinfo($file['name'], PATHINFO_FILENAME));
    $safeOrigName = substr($safeOrigName, 0, 30);
    $filename = $safeOrigName . '_' . $timestamp . '_' . $randomStr . '.' . $extension;
    
    $filePath = $categoryDir . '/' . $filename;
    $relativePath = 'uploads/' . $category . '/' . $filename;

    if (!move_uploaded_file($file['tmp_name'], $filePath)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to save uploaded file']);
        return;
    }

    $thumbPath = null;
    if (!in_array($mimeType, ['image/svg+xml', 'image/x-icon']) && $file['size'] > 100 * 1024) {
        $thumbDir = $categoryDir . '/thumbs';
        if (!is_dir($thumbDir)) mkdir($thumbDir, 0755, true);
        $thumbFile = $thumbDir . '/' . $filename;
        
        if (createThumbnail($filePath, $thumbFile, 400, $mimeType)) {
            $thumbPath = 'uploads/' . $category . '/thumbs/' . $filename;
        }
    }

    $dimensions = null;
    if (!in_array($mimeType, ['image/svg+xml', 'image/x-icon'])) {
        $imgInfo = @getimagesize($filePath);
        if ($imgInfo) {
            $dimensions = $imgInfo[0] . 'x' . $imgInfo[1];
        }
    }

    try {
        $stmt = $conn->prepare("
            INSERT INTO flowentra_cms_media (
                filename, original_name, file_path, thumb_path, mime_type, 
                file_size, dimensions, category, section_key, alt_text, uploaded_by
            ) VALUES (
                :filename, :original, :path, :thumb, :mime, 
                :size, :dims, :category, :section, :alt, :user_id
            )
        ");
        $stmt->execute([
            ':filename' => $filename,
            ':original' => $file['name'],
            ':path' => $relativePath,
            ':thumb' => $thumbPath,
            ':mime' => $mimeType,
            ':size' => $file['size'],
            ':dims' => $dimensions,
            ':category' => $category,
            ':section' => $section ?: null,
            ':alt' => $altText,
            ':user_id' => 1,
        ]);

        $mediaId = $conn->lastInsertId();
        $baseUrl = getBaseUrl();
        $imageUrl = $baseUrl . '/' . $relativePath;
        $thumbUrl = $thumbPath ? $baseUrl . '/' . $thumbPath : null;

        echo json_encode([
            'success' => true,
            'message' => 'Image uploaded successfully',
            'data' => [
                'id' => (int)$mediaId,
                'filename' => $filename,
                'original_name' => $file['name'],
                'file_path' => $relativePath,
                'image_url' => $imageUrl,
                'thumb_url' => $thumbUrl,
                'mime_type' => $mimeType,
                'file_size' => $file['size'],
                'dimensions' => $dimensions,
                'category' => $category,
                'alt_text' => $altText,
            ],
        ]);

    } catch (PDOException $e) {
        if (file_exists($filePath)) unlink($filePath);
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
}

function handleList($conn) {
    $category = $_GET['category'] ?? '';
    $section = $_GET['section'] ?? '';
    $page = max(1, (int)($_GET['page'] ?? 1));
    $limit = min(100, max(1, (int)($_GET['limit'] ?? 50)));
    $offset = ($page - 1) * $limit;

    $where = '1=1';
    $params = [];

    if ($category) {
        $where .= ' AND category = :category';
        $params[':category'] = $category;
    }
    if ($section) {
        $where .= ' AND section_key = :section';
        $params[':section'] = $section;
    }

    try {
        $countStmt = $conn->prepare("SELECT COUNT(*) as total FROM flowentra_cms_media WHERE $where");
        $countStmt->execute($params);
        $total = $countStmt->fetch()['total'];

        $stmt = $conn->prepare("
            SELECT m.*, u.name as uploaded_by_name 
            FROM flowentra_cms_media m 
            LEFT JOIN flowentra_admin_users u ON m.uploaded_by = u.id 
            WHERE $where 
            ORDER BY m.created_at DESC 
            LIMIT $limit OFFSET $offset
        ");
        $stmt->execute($params);
        $files = $stmt->fetchAll();

        $baseUrl = getBaseUrl();
        foreach ($files as &$f) {
            $f['image_url'] = $baseUrl . '/' . $f['file_path'];
            $f['thumb_url'] = $f['thumb_path'] ? $baseUrl . '/' . $f['thumb_path'] : null;
        }

        echo json_encode([
            'success' => true,
            'data' => $files,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => (int)$total,
                'pages' => (int)ceil($total / $limit),
            ],
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
}

function handleGet($conn) {
    $id = $_GET['id'] ?? '';
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID required']);
        return;
    }

    try {
        $stmt = $conn->prepare("SELECT * FROM flowentra_cms_media WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $file = $stmt->fetch();

        if (!$file) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Media not found']);
            return;
        }

        $baseUrl = getBaseUrl();
        $file['image_url'] = $baseUrl . '/' . $file['file_path'];
        $file['thumb_url'] = $file['thumb_path'] ? $baseUrl . '/' . $file['thumb_path'] : null;

        echo json_encode(['success' => true, 'data' => $file]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
}

function handleDelete($conn) {
    if ($_SERVER['REQUEST_METHOD'] !== 'DELETE' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
        return;
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'] ?? $_GET['id'] ?? '';
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID required']);
        return;
    }

    try {
        $stmt = $conn->prepare("SELECT * FROM flowentra_cms_media WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $file = $stmt->fetch();

        if (!$file) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Media not found']);
            return;
        }

        $basePath = __DIR__ . '/../';
        $filePath = $basePath . $file['file_path'];
        if (file_exists($filePath)) unlink($filePath);
        
        if ($file['thumb_path']) {
            $thumbFilePath = $basePath . $file['thumb_path'];
            if (file_exists($thumbFilePath)) unlink($thumbFilePath);
        }

        $delStmt = $conn->prepare("DELETE FROM flowentra_cms_media WHERE id = :id");
        $delStmt->execute([':id' => $id]);

        echo json_encode(['success' => true, 'message' => 'Media deleted']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
}

function handleReplace($conn) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
        return;
    }

    $id = $_POST['id'] ?? $_GET['id'] ?? '';
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Media ID required']);
        return;
    }

    try {
        $stmt = $conn->prepare("SELECT * FROM flowentra_cms_media WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $existing = $stmt->fetch();

        if (!$existing) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Media not found']);
            return;
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error']);
        return;
    }

    if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'No image file uploaded']);
        return;
    }

    $file = $_FILES['image'];
    $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/x-icon'];
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if (!in_array($mimeType, $allowedTypes)) {
        http_response_code(415);
        echo json_encode(['success' => false, 'message' => 'Invalid file type']);
        return;
    }

    $basePath = __DIR__ . '/../';
    $oldFile = $basePath . $existing['file_path'];
    if (file_exists($oldFile)) unlink($oldFile);

    $category = $existing['category'];
    $categoryDir = $basePath . 'uploads/' . $category;
    if (!is_dir($categoryDir)) mkdir($categoryDir, 0755, true);

    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if ($extension === 'jpeg') $extension = 'jpg';

    $timestamp = time();
    $randomStr = bin2hex(random_bytes(4));
    $safeOrigName = preg_replace('/[^a-zA-Z0-9_-]/', '', pathinfo($file['name'], PATHINFO_FILENAME));
    $safeOrigName = substr($safeOrigName, 0, 30);
    $filename = $safeOrigName . '_' . $timestamp . '_' . $randomStr . '.' . $extension;

    $filePath = $categoryDir . '/' . $filename;
    $relativePath = 'uploads/' . $category . '/' . $filename;

    if (!move_uploaded_file($file['tmp_name'], $filePath)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to save file']);
        return;
    }

    try {
        $updateStmt = $conn->prepare("
            UPDATE flowentra_cms_media SET 
                filename = :filename, original_name = :original, file_path = :path, 
                mime_type = :mime, file_size = :size, updated_at = NOW()
            WHERE id = :id
        ");
        $updateStmt->execute([
            ':filename' => $filename,
            ':original' => $file['name'],
            ':path' => $relativePath,
            ':mime' => $mimeType,
            ':size' => $file['size'],
            ':id' => $id,
        ]);

        $baseUrl = getBaseUrl();
        echo json_encode([
            'success' => true,
            'message' => 'Image replaced successfully',
            'data' => [
                'id' => (int)$id,
                'filename' => $filename,
                'file_path' => $relativePath,
                'image_url' => $baseUrl . '/' . $relativePath,
            ],
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
}

// ==================== HELPERS ====================

function createThumbnail($source, $dest, $maxWidth, $mimeType) {
    try {
        switch ($mimeType) {
            case 'image/jpeg':
            case 'image/jpg':
                $srcImg = imagecreatefromjpeg($source);
                break;
            case 'image/png':
                $srcImg = imagecreatefrompng($source);
                break;
            case 'image/gif':
                $srcImg = imagecreatefromgif($source);
                break;
            case 'image/webp':
                $srcImg = imagecreatefromwebp($source);
                break;
            default:
                return false;
        }

        if (!$srcImg) return false;

        $origW = imagesx($srcImg);
        $origH = imagesy($srcImg);

        if ($origW <= $maxWidth) {
            imagedestroy($srcImg);
            return copy($source, $dest);
        }

        $ratio = $maxWidth / $origW;
        $newW = (int)($origW * $ratio);
        $newH = (int)($origH * $ratio);

        $destImg = imagecreatetruecolor($newW, $newH);

        if ($mimeType === 'image/png') {
            imagealphablending($destImg, false);
            imagesavealpha($destImg, true);
        }

        imagecopyresampled($destImg, $srcImg, 0, 0, 0, 0, $newW, $newH, $origW, $origH);

        switch ($mimeType) {
            case 'image/jpeg':
            case 'image/jpg':
                imagejpeg($destImg, $dest, 85);
                break;
            case 'image/png':
                imagepng($destImg, $dest, 8);
                break;
            case 'image/gif':
                imagegif($destImg, $dest);
                break;
            case 'image/webp':
                imagewebp($destImg, $dest, 85);
                break;
        }

        imagedestroy($srcImg);
        imagedestroy($destImg);
        return true;
    } catch (Exception $e) {
        return false;
    }
}

// getBaseUrl() is defined in auth_helpers.php — do not redeclare here.
?>
