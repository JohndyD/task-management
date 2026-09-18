<?php

session_start();

require_once "../config/cors.php";
require_once "../config/db.php";

header("Content-Type: application/json");


/*
|--------------------------------------------------------------------------
| Check Login
|--------------------------------------------------------------------------
*/

if (!isset($_SESSION["user_id"])) {

    http_response_code(401);

    echo json_encode([
        "success" => false,
        "message" => "Unauthorized. Please log in."
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Check Admin Role
|--------------------------------------------------------------------------
*/

if (
    !isset($_SESSION["role"]) ||
    $_SESSION["role"] !== "admin"
) {

    http_response_code(403);

    echo json_encode([
        "success" => false,
        "message" => "Access denied. Admin only."
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Get Task ID
|--------------------------------------------------------------------------
*/

if (
    !isset($_GET["id"]) ||
    !is_numeric($_GET["id"])
) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Invalid task ID."
    ]);

    exit;
}

$taskId = (int) $_GET["id"];


/*
|--------------------------------------------------------------------------
| Get Task
|--------------------------------------------------------------------------
*/

$sql = "
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

    WHERE tasks.id = ?

    LIMIT 1
";


$stmt = $conn->prepare($sql);

if (!$stmt) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Failed to prepare database query."
    ]);

    exit;
}


$stmt->bind_param(
    "i",
    $taskId
);

$stmt->execute();

$result = $stmt->get_result();


/*
|--------------------------------------------------------------------------
| Task Not Found
|--------------------------------------------------------------------------
*/

if ($result->num_rows === 0) {

    http_response_code(404);

    echo json_encode([
        "success" => false,
        "message" => "Task not found."
    ]);

    $stmt->close();
    $conn->close();

    exit;
}


/*
|--------------------------------------------------------------------------
| Get Task Data
|--------------------------------------------------------------------------
*/

$row = $result->fetch_assoc();


/*
|--------------------------------------------------------------------------
| Format Task
|--------------------------------------------------------------------------
*/

$task = [

    "id" => (int) $row["id"],

    "title" => $row["title"],

    "description" =>
        $row["description"],

    "deadline" =>
        $row["deadline"],

    "max_score" =>
        (int) $row["max_score"],

    "allow_resubmission" =>
        (int) $row["allow_resubmission"],

    "max_attempts" =>
        $row["max_attempts"] !== null
            ? (int) $row["max_attempts"]
            : null,

    "allow_late_submission" =>
        (int) $row["allow_late_submission"],

    "created_by" =>
        (int) $row["created_by"],

    "created_by_name" =>
        $row["created_by_name"] ?? "Unknown",

    "created_at" =>
        $row["created_at"]
];


/*
|--------------------------------------------------------------------------
| Response
|--------------------------------------------------------------------------
*/

echo json_encode([

    "success" => true,

    "task" => $task

]);


$stmt->close();
$conn->close();

?>