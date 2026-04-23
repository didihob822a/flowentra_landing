<?php
/**
 * Flowentra Email API
 * Supports OVH SMTP for professional email sending
 * Features: single send, mass send (one-by-one for spam reduction), templates, campaign tracking
 */

require_once __DIR__ . '/../config.php';

$db = new Database();
$conn = $db->getConnection();

$user = ['id' => 1, 'email' => 'admin@flowentra.io', 'name' => 'Admin', 'role' => 'super_admin'];

$action = $_GET['action'] ?? '';

switch ($action) {
    // ==================== SMTP SETTINGS ====================
    case 'get_smtp':
        $stmt = $conn->query("SELECT * FROM flowentra_email_smtp_settings WHERE id = 1");
        $settings = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($settings) {
            $settings['password'] = '••••••••'; // mask password
        }
        echo json_encode(['success' => true, 'data' => $settings]);
        break;

    case 'save_smtp':
        $data = json_decode(file_get_contents('php://input'), true);
        $host = trim($data['host'] ?? '');
        $port = intval($data['port'] ?? 587);
        $username = trim($data['username'] ?? '');
        $password = $data['password'] ?? null;
        $encryption = $data['encryption'] ?? 'tls';
        $from_name = trim($data['from_name'] ?? '');
        $from_email = trim($data['from_email'] ?? '');
        $reply_to = trim($data['reply_to'] ?? '');

        // Validate
        if (empty($host) || empty($username) || empty($from_email)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Host, username, and from email are required']);
            exit;
        }

        // Check if settings exist
        $stmt = $conn->query("SELECT id FROM flowentra_email_smtp_settings WHERE id = 1");
        $exists = $stmt->fetch();

        if ($exists) {
            $sql = "UPDATE flowentra_email_smtp_settings SET host=?, port=?, username=?, encryption=?, from_name=?, from_email=?, reply_to=?, updated_at=NOW()";
            $params = [$host, $port, $username, $encryption, $from_name, $from_email, $reply_to];
            if ($password && $password !== '••••••••') {
                $sql .= ", password=?";
                $params[] = $password;
            }
            $sql .= " WHERE id = 1";
            $stmt = $conn->prepare($sql);
            $stmt->execute($params);
        } else {
            $stmt = $conn->prepare("INSERT INTO flowentra_email_smtp_settings (id, host, port, username, password, encryption, from_name, from_email, reply_to) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$host, $port, $username, $password ?? '', $encryption, $from_name, $from_email, $reply_to]);
        }

        echo json_encode(['success' => true, 'message' => 'SMTP settings saved']);
        break;

    case 'test_smtp':
        $data = json_decode(file_get_contents('php://input'), true);
        $testEmail = trim($data['test_email'] ?? '');
        if (empty($testEmail) || !filter_var($testEmail, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Valid test email required']);
            exit;
        }

        $result = sendEmail($conn, $testEmail, 'Flowentra SMTP Test', '<h2>SMTP Test Successful</h2><p>Your OVH SMTP configuration is working correctly.</p><p>Sent at: ' . date('Y-m-d H:i:s') . '</p>');
        echo json_encode($result);
        break;

    // ==================== TEMPLATES ====================
    case 'get_templates':
        $stmt = $conn->query("SELECT * FROM flowentra_email_templates ORDER BY updated_at DESC");
        echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        break;

    case 'save_template':
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? null;
        $name = trim($data['name'] ?? '');
        $subject = trim($data['subject'] ?? '');
        $html_body = $data['html_body'] ?? '';
        $category = $data['category'] ?? 'general';

        if (empty($name) || empty($subject)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Name and subject are required']);
            exit;
        }

        if ($id) {
            $stmt = $conn->prepare("UPDATE flowentra_email_templates SET name=?, subject=?, html_body=?, category=?, updated_at=NOW() WHERE id=?");
            $stmt->execute([$name, $subject, $html_body, $category, $id]);
        } else {
            $stmt = $conn->prepare("INSERT INTO flowentra_email_templates (name, subject, html_body, category, created_by) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$name, $subject, $html_body, $category, $user['id']]);
            $id = $conn->lastInsertId();
        }

        echo json_encode(['success' => true, 'message' => 'Template saved', 'data' => ['id' => $id]]);
        break;

    case 'delete_template':
        $data = json_decode(file_get_contents('php://input'), true);
        $id = intval($data['id'] ?? 0);
        $stmt = $conn->prepare("DELETE FROM flowentra_email_templates WHERE id=?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'Template deleted']);
        break;

    // ==================== CONTACTS / RECIPIENTS ====================
    case 'get_contacts':
        $page = max(1, intval($_GET['page'] ?? 1));
        $limit = min(100, max(10, intval($_GET['limit'] ?? 50)));
        $group = $_GET['group'] ?? '';
        $offset = ($page - 1) * $limit;

        $where = "1=1";
        $params = [];
        if ($group) {
            $where .= " AND group_name = ?";
            $params[] = $group;
        }

        $countStmt = $conn->prepare("SELECT COUNT(*) FROM flowentra_email_contacts WHERE $where");
        $countStmt->execute($params);
        $total = $countStmt->fetchColumn();

        $params[] = $limit;
        $params[] = $offset;
        $stmt = $conn->prepare("SELECT * FROM flowentra_email_contacts WHERE $where ORDER BY created_at DESC LIMIT ? OFFSET ?");
        $stmt->execute($params);

        echo json_encode([
            'success' => true,
            'data' => $stmt->fetchAll(PDO::FETCH_ASSOC),
            'pagination' => ['page' => $page, 'limit' => $limit, 'total' => $total, 'pages' => ceil($total / $limit)]
        ]);
        break;

    case 'save_contact':
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? null;
        $email = trim($data['email'] ?? '');
        $name = trim($data['name'] ?? '');
        $group_name = trim($data['group_name'] ?? 'default');

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Valid email required']);
            exit;
        }

        if ($id) {
            $stmt = $conn->prepare("UPDATE flowentra_email_contacts SET email=?, name=?, group_name=? WHERE id=?");
            $stmt->execute([$email, $name, $group_name, $id]);
        } else {
            $stmt = $conn->prepare("INSERT INTO flowentra_email_contacts (email, name, group_name) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name), group_name=VALUES(group_name)");
            $stmt->execute([$email, $name, $group_name]);
            $id = $conn->lastInsertId();
        }

        echo json_encode(['success' => true, 'data' => ['id' => $id]]);
        break;

    case 'import_contacts':
        $data = json_decode(file_get_contents('php://input'), true);
        $contacts = $data['contacts'] ?? [];
        $group = trim($data['group_name'] ?? 'imported');
        $imported = 0;

        $stmt = $conn->prepare("INSERT INTO flowentra_email_contacts (email, name, group_name) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name)");
        foreach ($contacts as $c) {
            $email = trim($c['email'] ?? '');
            if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $stmt->execute([$email, trim($c['name'] ?? ''), $group]);
                $imported++;
            }
        }

        echo json_encode(['success' => true, 'message' => "$imported contacts imported"]);
        break;

    case 'delete_contact':
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $conn->prepare("DELETE FROM flowentra_email_contacts WHERE id=?");
        $stmt->execute([intval($data['id'] ?? 0)]);
        echo json_encode(['success' => true]);
        break;

    case 'get_groups':
        $stmt = $conn->query("SELECT group_name, COUNT(*) as count FROM flowentra_email_contacts GROUP BY group_name ORDER BY group_name");
        echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        break;

    // ==================== SEND / CAMPAIGNS ====================
    case 'send_single':
        $data = json_decode(file_get_contents('php://input'), true);
        $to = trim($data['to'] ?? '');
        $subject = trim($data['subject'] ?? '');
        $html_body = $data['html_body'] ?? '';

        if (!filter_var($to, FILTER_VALIDATE_EMAIL) || empty($subject)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Valid email and subject required']);
            exit;
        }

        $result = sendEmail($conn, $to, $subject, $html_body);

        // Log it
        $stmt = $conn->prepare("INSERT INTO flowentra_email_send_log (recipient_email, subject, status, sent_by) VALUES (?, ?, ?, ?)");
        $stmt->execute([$to, $subject, $result['success'] ? 'sent' : 'failed', $user['id']]);

        echo json_encode($result);
        break;

    case 'send_mass':
        $data = json_decode(file_get_contents('php://input'), true);
        $subject = trim($data['subject'] ?? '');
        $html_body = $data['html_body'] ?? '';
        $group = $data['group'] ?? null;
        $contactIds = $data['contact_ids'] ?? [];
        $delay = max(1, min(30, intval($data['delay_seconds'] ?? 3))); // 1-30 seconds between emails

        if (empty($subject) || empty($html_body)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Subject and body required']);
            exit;
        }

        // Get recipients
        if (!empty($contactIds)) {
            $placeholders = implode(',', array_fill(0, count($contactIds), '?'));
            $stmt = $conn->prepare("SELECT * FROM flowentra_email_contacts WHERE id IN ($placeholders) AND is_subscribed = 1");
            $stmt->execute($contactIds);
        } elseif ($group) {
            $stmt = $conn->prepare("SELECT * FROM flowentra_email_contacts WHERE group_name = ? AND is_subscribed = 1");
            $stmt->execute([$group]);
        } else {
            $stmt = $conn->query("SELECT * FROM flowentra_email_contacts WHERE is_subscribed = 1");
        }

        $recipients = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Create campaign
        $stmt = $conn->prepare("INSERT INTO flowentra_email_campaigns (subject, html_body, total_recipients, status, created_by) VALUES (?, ?, ?, 'sending', ?)");
        $stmt->execute([$subject, $html_body, count($recipients), $user['id']]);
        $campaignId = $conn->lastInsertId();

        $sent = 0;
        $failed = 0;

        foreach ($recipients as $idx => $contact) {
            // Personalize: replace {{name}} and {{email}}
            $personalizedBody = str_replace(
                ['{{name}}', '{{email}}'],
                [$contact['name'] ?: 'there', $contact['email']],
                $html_body
            );
            $personalizedSubject = str_replace('{{name}}', $contact['name'] ?: 'there', $subject);

            $result = sendEmail($conn, $contact['email'], $personalizedSubject, $personalizedBody);

            $status = $result['success'] ? 'sent' : 'failed';
            $stmt = $conn->prepare("INSERT INTO flowentra_email_send_log (campaign_id, recipient_email, subject, status, sent_by) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$campaignId, $contact['email'], $personalizedSubject, $status, $user['id']]);

            if ($result['success']) $sent++;
            else $failed++;

            // Delay between sends to reduce spam flagging
            if ($idx < count($recipients) - 1) {
                sleep($delay);
            }
        }

        // Update campaign status
        $stmt = $conn->prepare("UPDATE flowentra_email_campaigns SET status='completed', sent_count=?, failed_count=?, completed_at=NOW() WHERE id=?");
        $stmt->execute([$sent, $failed, $campaignId]);

        echo json_encode([
            'success' => true,
            'message' => "Campaign completed: $sent sent, $failed failed",
            'data' => ['campaign_id' => $campaignId, 'sent' => $sent, 'failed' => $failed]
        ]);
        break;

    case 'get_campaigns':
        $stmt = $conn->query("SELECT * FROM flowentra_email_campaigns ORDER BY created_at DESC LIMIT 50");
        echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        break;

    case 'get_send_log':
        $campaignId = $_GET['campaign_id'] ?? null;
        $limit = min(200, max(10, intval($_GET['limit'] ?? 50)));

        if ($campaignId) {
            $stmt = $conn->prepare("SELECT * FROM flowentra_email_send_log WHERE campaign_id=? ORDER BY sent_at DESC LIMIT ?");
            $stmt->execute([intval($campaignId), $limit]);
        } else {
            $stmt = $conn->prepare("SELECT * FROM flowentra_email_send_log ORDER BY sent_at DESC LIMIT ?");
            $stmt->execute([$limit]);
        }

        echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        break;

    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}

// ==================== SMTP SEND FUNCTION ====================
function sendEmail($conn, $to, $subject, $htmlBody) {
    $stmt = $conn->query("SELECT * FROM flowentra_email_smtp_settings WHERE id = 1");
    $smtp = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$smtp) {
        return ['success' => false, 'message' => 'SMTP not configured'];
    }

    $host = $smtp['host'];
    $port = intval($smtp['port']);
    $username = $smtp['username'];
    $password = $smtp['password'];
    $encryption = $smtp['encryption'];
    $fromName = $smtp['from_name'];
    $fromEmail = $smtp['from_email'];

    // Build email headers
    $boundary = md5(uniqid(time()));
    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "From: $fromName <$fromEmail>\r\n";
    if ($smtp['reply_to']) {
        $headers .= "Reply-To: {$smtp['reply_to']}\r\n";
    }
    $headers .= "Content-Type: multipart/alternative; boundary=\"$boundary\"\r\n";
    $headers .= "X-Mailer: Flowentra-CMS/1.0\r\n";

    // Plain text version
    $plainText = strip_tags(str_replace(['<br>', '<br/>', '<br />', '</p>'], "\n", $htmlBody));

    $body = "--$boundary\r\n";
    $body .= "Content-Type: text/plain; charset=UTF-8\r\n\r\n";
    $body .= $plainText . "\r\n";
    $body .= "--$boundary\r\n";
    $body .= "Content-Type: text/html; charset=UTF-8\r\n\r\n";
    $body .= $htmlBody . "\r\n";
    $body .= "--$boundary--\r\n";

    // Use SMTP socket for OVH
    try {
        $socket = @fsockopen(
            ($encryption === 'ssl' ? 'ssl://' : '') . $host,
            $port,
            $errno,
            $errstr,
            10
        );

        if (!$socket) {
            return ['success' => false, 'message' => "Connection failed: $errstr ($errno)"];
        }

        $response = fgets($socket, 512);

        // EHLO
        fwrite($socket, "EHLO " . gethostname() . "\r\n");
        $response = '';
        while ($line = fgets($socket, 512)) {
            $response .= $line;
            if (substr($line, 3, 1) == ' ') break;
        }

        // STARTTLS for TLS
        if ($encryption === 'tls') {
            fwrite($socket, "STARTTLS\r\n");
            fgets($socket, 512);
            stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT);

            fwrite($socket, "EHLO " . gethostname() . "\r\n");
            $response = '';
            while ($line = fgets($socket, 512)) {
                $response .= $line;
                if (substr($line, 3, 1) == ' ') break;
            }
        }

        // AUTH LOGIN
        fwrite($socket, "AUTH LOGIN\r\n");
        fgets($socket, 512);
        fwrite($socket, base64_encode($username) . "\r\n");
        fgets($socket, 512);
        fwrite($socket, base64_encode($password) . "\r\n");
        $authResponse = fgets($socket, 512);

        if (substr($authResponse, 0, 3) !== '235') {
            fwrite($socket, "QUIT\r\n");
            fclose($socket);
            return ['success' => false, 'message' => 'SMTP authentication failed'];
        }

        // MAIL FROM
        fwrite($socket, "MAIL FROM:<$fromEmail>\r\n");
        fgets($socket, 512);

        // RCPT TO
        fwrite($socket, "RCPT TO:<$to>\r\n");
        $rcptResponse = fgets($socket, 512);
        if (substr($rcptResponse, 0, 3) !== '250') {
            fwrite($socket, "QUIT\r\n");
            fclose($socket);
            return ['success' => false, 'message' => 'Recipient rejected'];
        }

        // DATA
        fwrite($socket, "DATA\r\n");
        fgets($socket, 512);

        $message = "Subject: $subject\r\n";
        $message .= $headers;
        $message .= "\r\n$body\r\n.\r\n";
        fwrite($socket, $message);
        $dataResponse = fgets($socket, 512);

        fwrite($socket, "QUIT\r\n");
        fclose($socket);

        if (substr($dataResponse, 0, 3) === '250') {
            return ['success' => true, 'message' => 'Email sent successfully'];
        } else {
            return ['success' => false, 'message' => 'Send failed: ' . trim($dataResponse)];
        }

    } catch (Exception $e) {
        return ['success' => false, 'message' => 'SMTP error: ' . $e->getMessage()];
    }
}
?>
