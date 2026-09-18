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
// CHECK REQUEST METHOD
// ========================================

if ($_SERVER["REQUEST_METHOD"] !== "POST") {

    echo json_encode([
        "success" => false,
        "message" => "Invalid request method."
    ]);

    exit;
}


// ========================================
// GET JSON DATA
// ========================================

$input = json_decode(
    file_get_contents("php://input"),
    true
);


if (!is_array($input)) {

    echo json_encode([
        "success" => false,
        "message" => "Invalid request data."
    ]);

    exit;
}


// ========================================
// GET TASK ID
// ========================================

$id = isset($input["id"])
    ? (int) $input["id"]
    : 0;


// ========================================
// VALIDATE TASK ID
// ========================================

if ($id <= 0) {

    echo json_encode([
        "success" => false,
        "message" => "Invalid task ID."
    ]);

    exit;
}


// ========================================
// CHECK IF TASK EXISTS
// ========================================

$check_query = "
    SELECT id, title
    FROM tasks
    WHERE id = ?
    LIMIT 1
";


$check_statement = $conn->prepare(
    $check_query
);


if (!$check_statement) {

    echo json_encode([
        "success" => false,
        "message" => "Failed to prepare task check."
    ]);

    $conn->close();

    exit;
}


$check_statement->bind_param(
    "i",
    $id
);


$check_statement->execute();


$check_result =
    $check_statement->get_result();


if ($check_result->num_rows === 0) {

    $check_statement->close();

    echo json_encode([
        "success" => false,
        "message" => "Task not found."
    ]);

    $conn->close();

    exit;
}


$task = $check_result->fetch_assoc();

$check_statement->close();


// ========================================
// DELETE TASK
// ========================================

$delete_query = "
    DELETE FROM tasks
    WHERE id = ?
";


$delete_statement = $conn->prepare(
    $delete_query
);


if (!$delete_statement) {

    echo json_encode([
        "success" => false,
        "message" => "Failed to prepare delete request."
    ]);

    $conn->close();

    exit;
}


$delete_statement->bind_param(
    "i",
    $id
);


if (!$delete_statement->execute()) {

    echo json_encode([
        "success" => false,
        "message" => "Failed to delete task: " .
            $delete_statement->error
    ]);

    $delete_statement->close();

    $conn->close();

    exit;
}


// ========================================
// CHECK DELETE RESULT
// ========================================

if ($delete_statement->affected_rows === 0) {

    echo json_encode([
        "success" => false,
        "message" => "Task could not be deleted."
    ]);

    $delete_statement->close();

    $conn->close();

    exit;
}


$delete_statement->close();


// ========================================
// SUCCESS
// ========================================

echo json_encode([
    "success" => true,
    "message" => "Task deleted successfully.",
    "deleted_task" => [
        "id" => (int) $task["id"],
        "title" => $task["title"]
    ]
]);


$conn->close();

?>