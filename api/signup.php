<?php
// Baby step: accept JSON, do minimal validation, and return OK.
// No DB, no email, no sessions yet.

header('Content-Type: application/json');

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
  exit;
}

// Read JSON
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

// Minimal sanitize/validate
$first = isset($data['first_name']) ? trim($data['first_name']) : '';
$last  = isset($data['last_name'])  ? trim($data['last_name'])  : '';
$email = isset($data['email'])      ? trim($data['email'])      : '';
$pass  = isset($data['password'])   ? (string)$data['password'] : '';
$consent = isset($data['consent'])  ? (bool)$data['consent']    : false;

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
if ($pass === '') {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'Missing password']);
  exit;
}
if (!$consent) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'Consent required']);
  exit;
}

// For visibility during the demo, write a simple log file (you can delete later)
$logLine = date('c') . " | {$first} {$last} | {$email} | UA=" . ($_SERVER['HTTP_USER_AGENT'] ?? '') . PHP_EOL;
@file_put_contents(__DIR__ . '/signup.log', $logLine, FILE_APPEND);

// Return a simple success (we’ll add email verification next)
echo json_encode(['ok' => true, 'message' => 'Signup received']);
