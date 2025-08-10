<?php
header('Content-Type: application/json');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['error' => 'Only POST method is allowed']);
    exit;
}

// Get the raw POST data
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Validate input
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400); // Bad Request
    echo json_encode(['error' => 'Invalid JSON data']);
    exit;
}

// TODO: Add authentication/authorization check here
// TODO: Validate the form structure

// TODO: Connect to database and save the form
// For now, we'll just return the received data

http_response_code(200);
echo json_encode([
    'success' => true,
    'message' => 'Form saved successfully (simulated)',
    'received_data' => $data
]);
?>