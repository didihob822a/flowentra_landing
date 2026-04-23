<?php

error_reporting(E_ALL);
ini_set('display_errors', 0);

// ---- CORS: permissive, works for all origins and any client headers ----
// Reflect the request origin when present (required if a client ever uses credentials).
$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
header("Access-Control-Allow-Origin: $origin");
header("Vary: Origin");
header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");

// Echo back whatever headers the browser advertises in the preflight,
// so we never reject a request because of an unexpected client header
// (Cache-Control, Pragma, Stripe-Signature, X-CSRF-Token, etc.).
$reqHeaders = $_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']
    ?? 'Content-Type, Authorization, X-Requested-With, X-Request-ID, X-Client-Version, Cache-Control, Pragma, Stripe-Signature';
header("Access-Control-Allow-Headers: $reqHeaders");
header("Access-Control-Max-Age: 86400");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

class Database {
    private $host = "luccybcdb.mysql.db";
    private $username = "luccybcdb";
    private $password = "Dadouhibou2025";
    private $database = "luccybcdb";
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->database,
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch(PDOException $e) {
            echo json_encode([
                'success' => false,
                'message' => 'Connection error: ' . $e->getMessage()
            ]);
            exit;
        }
        return $this->conn;
    }
}
?>
