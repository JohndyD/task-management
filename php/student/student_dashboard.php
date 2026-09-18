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
// CHECK ROLE
// ========================================

if (
    !isset($_SESSION["role"]) ||
    $_SESSION["role"] !== "student"
) {

    echo json_encode([
        "success" => false,
        "message" => "Access denied."
    ]);

    exit;
}


$user_id = (int) $_SESSION["user_id"];


// ========================================
// TOTAL TASKS
// ========================================

$total_tasks = 0;

$result = $conn->query("
    SELECT COUNT(*) AS total
    FROM tasks
");

if ($result) {

    $row = $result->fetch_assoc();

    $total_tasks = (int) $row["total"];
}


// ========================================
// SUBMITTED TASKS
// ========================================

$submitted_tasks = 0;

$stmt = $conn->prepare("
    SELECT COUNT(DISTINCT task_id) AS total
    FROM submissions
    WHERE user_id = ?
");

if ($stmt) {

    $stmt->bind_param("i", $user_id);

    $stmt->execute();

    $result = $stmt->get_result();

    if ($result) {

        $row = $result->fetch_assoc();

        $submitted_tasks = (int) $row["total"];
    }

    $stmt->close();
}


// ========================================
// MISSED TASKS
// ========================================

$missed_tasks = 0;

$stmt = $conn->prepare("
    SELECT COUNT(*) AS total
    FROM tasks t
    WHERE t.deadline < NOW()
    AND NOT EXISTS (
        SELECT 1
        FROM submissions s
        WHERE s.task_id = t.id
        AND s.user_id = ?
    )
");

if ($stmt) {

    $stmt->bind_param("i", $user_id);

    $stmt->execute();

    $result = $stmt->get_result();

    if ($result) {

        $row = $result->fetch_assoc();

        $missed_tasks = (int) $row["total"];
    }

    $stmt->close();
}


// ========================================
// RESPONSE
// ========================================

echo json_encode([
    "success" => true,
    "stats" => [
        "totalTasks" => $total_tasks,
        "submittedTasks" => $submitted_tasks,
        "missedTasks" => $missed_tasks
    ]
]);


$conn->close();

?>