<?php
require_once 'db.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

try {
    $db = getDB();
    
    $query = "SELECT id, name, code FROM states ORDER BY name ASC";
    $result = $db->query($query);
    
    $states = [];
    while ($row = $result->fetch_assoc()) {
        $states[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'data' => $states
    ]);
    
} catch (Exception $e) {
    error_log("Error fetching states: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => 'Unable to fetch states'
    ]);
}
?>