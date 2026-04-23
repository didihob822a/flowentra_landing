<?php
/**
 * Authentication helper functions (shared by content.php, media.php, auth.php)
 * This file contains ONLY functions — no top-level execution.
 */

/**
 * Extract Bearer token from Authorization header
 * Handles Apache mod_php, CGI/FastCGI, and proxy setups
 */
function getBearerToken() {
    $auth = '';

    // 1. Try getallheaders() (works in Apache mod_php and newer PHP-FPM)
    if (function_exists('getallheaders')) {
        $headers = getallheaders();
        foreach ($headers as $name => $value) {
            if (strtolower($name) === 'authorization') {
                $auth = $value;
                break;
            }
        }
    }

    // 2. Fallback: $_SERVER superglobal variants (CGI/FastCGI, proxies)
    if (empty($auth)) {
        if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
            $auth = $_SERVER['HTTP_AUTHORIZATION'];
        } elseif (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            $auth = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        } elseif (!empty($_SERVER['Authorization'])) {
            $auth = $_SERVER['Authorization'];
        }
    }

    // 3. Fallback: Apache-specific function
    if (empty($auth) && function_exists('apache_request_headers')) {
        $apacheHeaders = apache_request_headers();
        foreach ($apacheHeaders as $name => $value) {
            if (strtolower($name) === 'authorization') {
                $auth = $value;
                break;
            }
        }
    }

    if (preg_match('/Bearer\s+(.+)/i', $auth, $matches)) {
        return $matches[1];
    }

    // 4. Fallback: token sent as query parameter or POST field (_token)
    // Many shared hosts (OVH, etc.) strip the Authorization header entirely.
    if (!empty($_GET['_token'])) {
        return $_GET['_token'];
    }
    if (!empty($_POST['_token'])) {
        return $_POST['_token'];
    }
    // Also check raw JSON body for _token
    static $jsonBody = null;
    if ($jsonBody === null) {
        $raw = file_get_contents('php://input');
        $jsonBody = $raw ? json_decode($raw, true) : [];
    }
    if (!empty($jsonBody['_token'])) {
        return $jsonBody['_token'];
    }

    return null;
}

/**
 * Authenticate request and return user data, or null if invalid
 */
function authenticateRequest($conn) {
    $token = getBearerToken();
    if (!$token) return null;

    $stmt = $conn->prepare("
        SELECT u.id, u.email, u.name, u.role 
        FROM flowentra_admin_sessions s 
        JOIN flowentra_admin_users u ON s.user_id = u.id 
        WHERE s.token = :token AND s.expires_at > NOW() AND u.is_active = 1
    ");
    $stmt->execute([':token' => $token]);
    return $stmt->fetch() ?: null;
}

/**
 * Get the base URL of the backend (for building image URLs etc.)
 */
function getBaseUrl() {
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $scriptDir = dirname(dirname($_SERVER['SCRIPT_NAME']));
    return rtrim($protocol . '://' . $host . $scriptDir, '/');
}
?>
