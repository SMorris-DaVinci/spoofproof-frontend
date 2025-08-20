<?php
// /api/signup.php
// Minimal backend for SpoofProof signup: CORS for GitHub Pages, basic validation, JSON response.
// No database, no email, no writes — just proves end-to-end POST works.

/////////////////////////
// CORS (adjust if needed)
/////////////////////////
$allowed_origin = 'https://smorris-davinci.github.io'; // your GitHub Pages origin

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin === $allowed_origin) {
    header("Access-Control-Allow-Origin: $allowed_origin");
}
header('Vary: Origin');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Preflight for browsers
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

/////////////////////////
// Only POST does work
/////////////////////////
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

/////////////////////////
// Read & validate JSON
/////////////////////////
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid JSON']);
    exit;
}

$first    = isset($data['first_name']) ? trim($data['first_name']) : '';
$last     = isset($data['last_name'])  ? trim($data['last_name'])  : '';
$email    = isset($data['email'])      ? trim($data['email'])      : '';
$password = isset($data['password'])   ? (string)$data['password'] : '';
$consent  = !empty($data['consent']);

if ($first === '' || $last === '') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Missing name']);
    exit;
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid email']);
    exit;
}
if ($password === '') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Missing password']);
    exit;
}
if (!$consent) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Consent required']);
    exit;
}

/////////////////////////
// Success (no persistence in this step)
/////////////////////////
echo json_encode(['ok' => true, 'message' => 'Signup received']);
