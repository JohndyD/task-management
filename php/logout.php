<?php

header("Content-Type: application/json");

include "config/cors.php";

session_start();

$_SESSION = [];

session_destroy();

echo json_encode([
    "success" => true,
    "message" => "Logout successful."
]);

?>