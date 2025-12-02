<?php
require_once 'db.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

try {
    $db = getDB();
    
    $state_id = isset($_GET['state_id']) ? intval($_GET['state_id']) : 0;
    
    if ($state_id <= 0) {
        echo json_encode([
            'success' => false,
            'error' => 'Invalid state ID'
        ]);
        exit;
    }
    
    $stmt = $db->prepare("SELECT id, name FROM lgas WHERE state_id = ? ORDER BY name ASC");
    $stmt->bind_param("i", $state_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $lgas = [];
    while ($row = $result->fetch_assoc()) {
        $lgas[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'data' => $lgas
    ]);
    
    $stmt->close();
    
} catch (Exception $e) {
    error_log("Error fetching LGAs: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => 'Unable to fetch LGAs'
    ]);
}
?>