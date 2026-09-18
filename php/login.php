<?php

header("Content-Type: application/json");

// ==============================
// CORS
// ==============================

include "config/cors.php";

// ==============================
// SESSION
// ==============================

session_start();

// ==============================
// DATABASE
// ==============================

include "config/db.php";

// ==============================
// GET REQUEST DATA
// ==============================

$data = json_decode(
    file_get_contents("php://input"),
    true
);

$email = trim($data["email"] ?? "");
$password = $data["password"] ?? "";

// ==============================
// VALIDATION
// ==============================

if ($email === "" || $password === "") {

    echo json_encode([
        "success" => false,
        "message" => "Email and password are required."
    ]);

    exit;
}

// ==============================
// FIND USER
// ==============================

$stmt = $conn->prepare(
    "SELECT id, name, email, password, role
     FROM users
     WHERE email = ?
     LIMIT 1"
);

if (!$stmt) {

    echo json_encode([
        "success" => false,
        "message" => "Database query failed."
    ]);

    exit;
}

$stmt->bind_param("s", $email);
$stmt->execute();

$result = $stmt->get_result();

// ==============================
// CHECK USER
// ==============================

if ($result->num_rows !== 1) {

    echo json_encode([
        "success" => false,
        "message" => "Invalid email or password."
    ]);

    $stmt->close();
    $conn->close();

    exit;
}

$user = $result->fetch_assoc();

// ==============================
// CHECK PASSWORD
// ==============================

if (!password_verify($password, $user["password"])) {

    echo json_encode([
        "success" => false,
        "message" => "Invalid email or password."
    ]);

    $stmt->close();
    $conn->close();

    exit;
}

// ==============================
// CHECK ROLE
// ==============================

if (!in_array($user["role"], ["student", "admin"], true)) {

    echo json_encode([
        "success" => false,
        "message" => "Invalid user role."
    ]);

    $stmt->close();
    $conn->close();

    exit;
}

// ==============================
// CREATE NEW SESSION ID
// ==============================

session_regenerate_id(true);

// ==============================
// STORE USER SESSION
// ==============================

$_SESSION["user_id"] = $user["id"];
$_SESSION["name"] = $user["name"];
$_SESSION["email"] = $user["email"];
$_SESSION["role"] = $user["role"];

// ==============================
// RETURN USER
// ==============================

echo json_encode([
    "success" => true,
    "message" => "Login successful.",
    "user" => [
        "id" => $user["id"],
        "name" => $user["name"],
        "email" => $user["email"],
        "role" => $user["role"]
    ]
]);

$stmt->close();
$conn->close();
?>