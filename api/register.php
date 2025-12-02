<?php
require_once 'db.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed'], 405);
}

try {
    $db = getDB();
    
    // Validate required fields
    $required_fields = ['full_name', 'phone', 'email', 'dob', 'gender', 'state_id', 'lga_id', 'residential_address', 'occupation', 'password'];
    
    foreach ($required_fields as $field) {
        if (empty($_POST[$field])) {
            json_response(['error' => "Missing required field: $field"], 422);
        }
    }
    
    // Validate email
    $email = filter_var($_POST['email'], FILTER_VALIDATE_EMAIL);
    if (!$email) {
        json_response(['error' => 'Invalid email address'], 422);
    }
    
    // Check if email already exists
    $stmt = $db->prepare("SELECT id FROM members WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows > 0) {
        json_response(['error' => 'Email address already registered'], 422);
    }
    $stmt->close();
    
    // Validate phone format (Nigerian)
    $phone = $_POST['phone'];
    if (!preg_match('/^\+234[0-9]{10}$/', $phone) && !preg_match('/^0[0-9]{10}$/', $phone)) {
        json_response(['error' => 'Phone number must be in Nigerian format (+234...) or (0...)'], 422);
    }
    
    // Convert local number to international format
    if (preg_match('/^0[0-9]{10}$/', $phone)) {
        $phone = '+234' . substr($phone, 1);
    }
    
    // Validate age (must be at least 16 years old)
    $dob = $_POST['dob'];
    $min_age = 16;
    $birth_date = new DateTime($dob);
    $today = new DateTime();
    $age = $today->diff($birth_date)->y;
    
    if ($age < $min_age) {
        json_response(['error' => "You must be at least $min_age years old to register"], 422);
    }
    
    // Validate password strength
    $password = $_POST['password'];
    if (strlen($password) < 8) {
        json_response(['error' => 'Password must be at least 8 characters long'], 422);
    }
    
    // Handle file uploads
    $upload_errors = [];
    $upload_dir = __DIR__ . '/../uploads/members/';
    
    // Create member directory
    $member_dir = $upload_dir . 'temp_' . time();
    if (!is_dir($member_dir)) {
        mkdir($member_dir, 0755, true);
    }
    
    // File upload function
    function handle_file_upload($file_key, $allowed_types, $max_size, $upload_path) {
        if (!isset($_FILES[$file_key]) || $_FILES[$file_key]['error'] !== UPLOAD_ERR_OK) {
            return ['error' => "Please upload a valid $file_key"];
        }
        
        $file = $_FILES[$file_key];
        $file_ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $file_size = $file['size'];
        
        // Check file type
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime_type = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);
        
        if (!in_array($mime_type, $allowed_types) || !in_array($file_ext, ['jpg', 'jpeg', 'png'])) {
            return ['error' => "Invalid file type for $file_key. Only JPG and PNG files are allowed"];
        }
        
        // Check file size
        if ($file_size > $max_size) {
            return ['error' => "File too large for $file_key. Maximum size is " . ($max_size / 1024 / 1024) . "MB"];
        }
        
        // Generate unique filename
        $new_filename = $file_key . '_' . time() . '_' . bin2hex(random_bytes(8)) . '.' . $file_ext;
        $file_path = $upload_path . $new_filename;
        
        if (!move_uploaded_file($file['tmp_name'], $file_path)) {
            return ['error' => "Failed to upload $file_key"];
        }
        
        return ['success' => true, 'file_path' => $file_path];
    }
    
    // Upload passport photo
    $passport_result = handle_file_upload(
        'passport_photo', 
        ['image/jpeg', 'image/png', 'image/jpg'], 
        2.5 * 1024 * 1024, // 2.5MB
        $member_dir . '/'
    );
    
    if (isset($passport_result['error'])) {
        $upload_errors[] = $passport_result['error'];
    } else {
        $passport_photo = str_replace(__DIR__ . '/../', '', $passport_result['file_path']);
    }
    
    // Upload voter card front
    $voter_front_result = handle_file_upload(
        'voters_card_front', 
        ['image/jpeg', 'image/png', 'image/jpg'], 
        2.5 * 1024 * 1024,
        $member_dir . '/'
    );
    
    if (isset($voter_front_result['error'])) {
        $upload_errors[] = $voter_front_result['error'];
    } else {
        $voters_card_front = str_replace(__DIR__ . '/../', '', $voter_front_result['file_path']);
    }
    
    // Upload voter card back
    $voter_back_result = handle_file_upload(
        'voters_card_back', 
        ['image/jpeg', 'image/png', 'image/jpg'], 
        2.5 * 1024 * 1024,
        $member_dir . '/'
    );
    
    if (isset($voter_back_result['error'])) {
        $upload_errors[] = $voter_back_result['error'];
    } else {
        $voters_card_back = str_replace(__DIR__ . '/../', '', $voter_back_result['file_path']);
    }
    
    if (!empty($upload_errors)) {
        // Clean up uploaded files
        array_map('unlink', glob("$member_dir/*"));
        rmdir($member_dir);
        json_response(['error' => 'File upload errors', 'details' => $upload_errors], 422);
    }
    
    // Generate membership ID
    function generateMembershipId($db) {
        $year = date('Y');
        $stmt = $db->prepare("SELECT COUNT(*) as count FROM members WHERE membership_id LIKE ?");
        $like_pattern = "YCM-{$year}%";
        $stmt->bind_param("s", $like_pattern);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $count = $row['count'] + 1;
        $stmt->close();
        
        return sprintf("YCM-%s-%06d", $year, $count);
    }
    
    $membership_id = generateMembershipId($db);
    
    // Hash password
    $password_hash = password_hash($password, PASSWORD_DEFAULT);
    
    // Generate verification token
    $verification_token = bin2hex(random_bytes(32));
    
    // Insert member record
    $stmt = $db->prepare("INSERT INTO members 
        (membership_id, full_name, phone, email, dob, gender, state_id, lga_id, residential_address, occupation, 
         passport_photo, voters_card_front, voters_card_back, password_hash, verification_token) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    $state_id = intval($_POST['state_id']);
    $lga_id = intval($_POST['lga_id']);
    
    $stmt->bind_param("ssssssiiissssss", 
        $membership_id,
        $_POST['full_name'],
        $phone,
        $email,
        $_POST['dob'],
        $_POST['gender'],
        $state_id,
        $lga_id,
        $_POST['residential_address'],
        $_POST['occupation'],
        $passport_photo,
        $voters_card_front,
        $voters_card_back,
        $password_hash,
        $verification_token
    );
    
    if ($stmt->execute()) {
        $member_id = $db->insert_id;
        
        // Rename temp directory to member ID
        $new_member_dir = $upload_dir . $member_id;
        rename($member_dir, $new_member_dir);
        
        // Update file paths in database
        $update_paths = [
            'passport_photo' => str_replace('temp_' . basename($member_dir), $member_id, $passport_photo),
            'voters_card_front' => str_replace('temp_' . basename($member_dir), $member_id, $voters_card_front),
            'voters_card_back' => str_replace('temp_' . basename($member_dir), $member_id, $voters_card_back)
        ];
        
        $stmt_update = $db->prepare("UPDATE members SET passport_photo = ?, voters_card_front = ?, voters_card_back = ? WHERE id = ?");
        $stmt_update->bind_param("sssi", $update_paths['passport_photo'], $update_paths['voters_card_front'], $update_paths['voters_card_back'], $member_id);
        $stmt_update->execute();
        $stmt_update->close();
        
        // Log audit
        log_audit($email, 'member', 'registration', "New member registered: $membership_id");
        
        // Send verification email (stub)
        // send_verification_email($email, $verification_token);
        
        json_response([
            'success' => true,
            'message' => 'Registration successful! Your application is under review.',
            'membership_id' => $membership_id
        ]);
        
    } else {
        // Clean up files on database error
        array_map('unlink', glob("$member_dir/*"));
        rmdir($member_dir);
        json_response(['error' => 'Database error: ' . $stmt->error], 500);
    }
    
    $stmt->close();
    
} catch (Exception $e) {
    error_log("Registration error: " . $e->getMessage());
    json_response(['error' => 'Server error during registration'], 500);
}
?>