<?php

header("Content-Type: application/json");

include "config/cors.php";

session_start();

if (!isset($_SESSION["user_id"])) {

    echo json_encode([
        "success" => false,
        "loggedIn" => false,
        "message" => "Not logged in."
    ]);

    exit;
}

echo json_encode([
    "success" => true,
    "loggedIn" => true,
    "user" => [
        "id" => $_SESSION["user_id"],
        "name" => $_SESSION["name"],
        "email" => $_SESSION["email"],
        "role" => $_SESSION["role"]
    ]
]);
?>