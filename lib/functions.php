<?php
// Utility functions for YCM

// Generate QR code data URL (stub - in production, use a QR code library)
function generate_qr_code($data) {
    // This is a stub - in production, use a library like phpqrcode
    // For now, return a placeholder
    return "data:image/svg+xml;base64," . base64_encode('
        <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
            <rect width="100" height="100" fill="#ffffff"/>
            <text x="50" y="50" text-anchor="middle" dy=".3em" font-family="Arial" font-size="10">QR Code: ' . htmlspecialchars($data) . '</text>
        </svg>
    ');
}

// Format phone number for display
function format_phone_display($phone) {
    if (preg_match('/^\+234(\d{10})$/', $phone, $matches)) {
        return '0' . $matches[1];
    }
    return $phone;
}

// Validate Nigerian phone number
function validate_nigerian_phone($phone) {
    return preg_match('/^(\+234[0-9]{10}|0[0-9]{10})$/', $phone);
}

// Get member status badge
function get_status_badge($status) {
    $badges = [
        'pending' => '<span class="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Pending</span>',
        'approved' => '<span class="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Approved</span>',
        'rejected' => '<span class="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Rejected</span>'
    ];
    return $badges[$status] ?? '<span class="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Unknown</span>';
}

// Sanitize output
function sanitize_output($data) {
    return htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
}

// Redirect function
function redirect($url) {
    header("Location: $url");
    exit;
}

// Check if user is logged in as member
function is_member_logged_in() {
    return isset($_SESSION['member_id']) && !empty($_SESSION['member_id']);
}

// Check if user is logged in as admin
function is_admin_logged_in() {
    return isset($_SESSION['admin_id']) && !empty($_SESSION['admin_id']);
}

// Get admin role
function get_admin_role() {
    return $_SESSION['admin_role'] ?? null;
}

// Check admin permission
function has_admin_permission($required_role) {
    $roles = ['viewer' => 1, 'editor' => 2, 'super' => 3];
    $user_role = get_admin_role();
    return isset($roles[$user_role]) && $roles[$user_role] >= $roles[$required_role];
}

// Generate random token
function generate_token($length = 32) {
    return bin2hex(random_bytes($length));
}

// Format date for display
function format_date($date, $format = 'j F Y') {
    if (empty($date)) return '';
    $datetime = new DateTime($date);
    return $datetime->format($format);
}

// Format datetime for display
function format_datetime($datetime, $format = 'j F Y g:i A') {
    if (empty($datetime)) return '';
    $dt = new DateTime($datetime);
    return $dt->format($format);
}

// Get site setting
function get_setting($key, $default = '') {
    static $settings = null;
    
    if ($settings === null) {
        $db = getDB();
        $result = $db->query("SELECT setting_key, setting_value FROM site_settings");
        $settings = [];
        while ($row = $result->fetch_assoc()) {
            $settings[$row['setting_key']] = $row['setting_value'];
        }
    }
    
    return $settings[$key] ?? $default;
}
?>