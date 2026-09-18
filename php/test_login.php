<?php

header("Content-Type: application/json");

include "config/db.php";

$email = "mrepo@gmail.com";
$password = "stu123";

$stmt = $conn->prepare(
    "SELECT id, name, email, password, role
     FROM users
     WHERE email = ?
     LIMIT 1"
);

$stmt->bind_param("s", $email);
$stmt->execute();

$result = $stmt->get_result();

if ($result->num_rows === 0) {

    echo json_encode([
        "success" => false,
        "step" => "USER_LOOKUP",
        "message" => "User was not found."
    ], JSON_PRETTY_PRINT);

    exit;
}

$user = $result->fetch_assoc();

echo json_encode([
    "success" => true,
    "step" => "USER_FOUND",

    "database_user" => [
        "id" => $user["id"],
        "name" => $user["name"],
        "email" => $user["email"],
        "role" => $user["role"]
    ],

    "password_test" => [
        "entered_password" => $password,
        "stored_hash" => $user["password"],
        "hash_length" => strlen($user["password"]),
        "hash_algorithm" => password_get_info($user["password"]),
        "password_matches" => password_verify(
            $password,
            $user["password"]
        )
    ]
], JSON_PRETTY_PRINT);

$stmt->close();
$conn->close();
?>