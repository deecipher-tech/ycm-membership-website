<?php
// Database connection configuration
class Database {
    private $host;
    private $username;
    private $password;
    private $database;
    public $conn;
    
    public function __construct() {
        // Load environment variables (in production, use proper .env loading)
        $this->host = getenv('DB_HOST') ?: 'localhost';
        $this->username = getenv('DB_USER') ?: 'root';
        $this->password = getenv('DB_PASS') ?: '';
        $this->database = getenv('DB_NAME') ?: 'ycm_db';
        
        $this->connect();
    }
    
    private function connect() {
        $this->conn = new mysqli($this->host, $this->username, $this->password, $this->database);
        
        if ($this->conn->connect_error) {
            error_log("Database connection failed: " . $this->conn->connect_error);
            throw new Exception("Database connection failed");
        }
        
        $this->conn->set_charset("utf8mb4");
    }
    
    public function prepare($query) {
        return $this->conn->prepare($query);
    }
    
    public function query($query) {
        return $this->conn->query($query);
    }
    
    public function escape_string($string) {
        return $this->conn->real_escape_string($string);
    }
    
    public function insert_id() {
        return $this->conn->insert_id;
    }
    
    public function close() {
        if ($this->conn) {
            $this->conn->close();
        }
    }
}

// Global database instance
function getDB() {
    static $db = null;
    if ($db === null) {
        $db = new Database();
    }
    return $db->conn;
}

// Helper function for JSON responses
function json_response($data, $status_code = 200) {
    http_response_code($status_code);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

// Audit logging
function log_audit($actor, $actor_type, $action, $details = '', $ip_address = null, $user_agent = null) {
    $db = getDB();
    $ip_address = $ip_address ?: $_SERVER['REMOTE_ADDR'];
    $user_agent = $user_agent ?: $_SERVER['HTTP_USER_AGENT'];
    
    $stmt = $db->prepare("INSERT INTO audit_logs (actor, actor_type, action, details, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssss", $actor, $actor_type, $action, $details, $ip_address, $user_agent);
    $stmt->execute();
    $stmt->close();
}
?>