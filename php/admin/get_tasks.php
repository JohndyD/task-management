<?php

header("Content-Type: application/json");

include "../config/cors.php";

session_start();

include "../config/db.php";


// ========================================
// CHECK LOGIN
// ========================================

if (!isset($_SESSION["user_id"])) {

    echo json_encode([
        "success" => false,
        "message" => "Not logged in."
    ]);

    exit;
}


// ========================================
// CHECK ADMIN ROLE
// ========================================

if (
    !isset($_SESSION["role"]) ||
    $_SESSION["role"] !== "admin"
) {

    echo json_encode([
        "success" => false,
        "message" => "Access denied."
    ]);

    exit;
}


// ========================================
// GET TASKS
// ========================================

$query = "
    SELECT
        tasks.id,
        tasks.title,
        tasks.description,
        tasks.deadline,
        tasks.max_score,

        tasks.allow_resubmission,
        tasks.max_attempts,
        tasks.allow_late_submission,

        tasks.created_by,
        tasks.created_at,

        users.name AS created_by_name

    FROM tasks

    LEFT JOIN users
        ON tasks.created_by = users.id

    ORDER BY
        tasks.deadline ASC,
        tasks.id ASC
";


$result = $conn->query($query);


// ========================================
// CHECK QUERY
// ========================================

if (!$result) {

    echo json_encode([
        "success" => false,
        "message" =>
            "Failed to retrieve tasks: " .
            $conn->error
    ]);

    $conn->close();

    exit;
}


// ========================================
// BUILD TASK ARRAY
// ========================================

$tasks = [];


while ($row = $result->fetch_assoc()) {

    $tasks[] = [

        // ========================================
        // BASIC TASK INFORMATION
        // ========================================

        "id" => (int) $row["id"],

        "title" =>
            $row["title"],

        "description" =>
            $row["description"],

        "deadline" =>
            $row["deadline"],

        "max_score" =>
            (int) $row["max_score"],


        // ========================================
        // SUBMISSION SETTINGS
        // ========================================

        "allow_resubmission" =>
            (int) $row["allow_resubmission"],

        "max_attempts" =>
            $row["max_attempts"] !== null
                ? (int) $row["max_attempts"]
                : null,

        "allow_late_submission" =>
            (int) $row["allow_late_submission"],


        // ========================================
        // CREATOR INFORMATION
        // ========================================

        "created_by" =>
            (int) $row["created_by"],

        "created_by_name" =>
            $row["created_by_name"] ?? "Unknown",

        "created_at" =>
            $row["created_at"]
    ];

}


// ========================================
// RESPONSE
// ========================================

echo json_encode([

    "success" => true,

    "count" =>
        count($tasks),

    "tasks" =>
        $tasks

]);


$conn->close();

?>