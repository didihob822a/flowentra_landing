<?php
require_once __DIR__ . '/../config.php';

$action = $_GET['action'] ?? '';

// Hardcoded admin user — no DB auth needed
$adminUser = [
    'id' => 1,
    'email' => 'admin@flowentra.io',
    'name' => 'Admin',
    'role' => 'super_admin',
];

switch ($action) {
    case 'login':
        // Accept any credentials, return hardcoded user
        echo json_encode([
            'success' => true,
            'token' => 'static-admin-token',
            'user' => $adminUser,
        ]);
        break;
    case 'logout':
        echo json_encode(['success' => true]);
        break;
    case 'verify':
        echo json_encode(['success' => true, 'data' => $adminUser, 'user' => $adminUser]);
        break;
    case 'profile':
        echo json_encode(['success' => true, 'user' => $adminUser]);
        break;
    default:
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Action not found']);
}
?>
