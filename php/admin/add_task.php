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
// CHECK ADMIN
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
// GET JSON DATA
// ========================================

$input =
    json_decode(
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
// GET VALUES
// ========================================

$title =
    trim(
        $input["title"] ?? ""
    );

$description =
    trim(
        $input["description"] ?? ""
    );

$deadline =
    trim(
        $input["deadline"] ?? ""
    );

$max_score =
    isset($input["max_score"])
        ? (int) $input["max_score"]
        : 0;

$allow_resubmission =
    !empty(
        $input["allow_resubmission"]
    )
        ? 1
        : 0;

$allow_late_submission =
    !empty(
        $input["allow_late_submission"]
    )
        ? 1
        : 0;


// ========================================
// MAX ATTEMPTS
// ========================================

if (
    $allow_resubmission
) {

    if (
        isset($input["max_attempts"]) &&
        $input["max_attempts"] !== null &&
        $input["max_attempts"] !== ""
    ) {

        $max_attempts =
            (int) $input["max_attempts"];

    } else {

        $max_attempts = null;

    }

} else {

    $max_attempts = 1;

}


// ========================================
// VALIDATE TITLE
// ========================================

if ($title === "") {

    echo json_encode([
        "success" => false,
        "message" => "Task title is required."
    ]);

    exit;
}


if (strlen($title) > 255) {

    echo json_encode([
        "success" => false,
        "message" => "Task title must not exceed 255 characters."
    ]);

    exit;
}


// ========================================
// VALIDATE DEADLINE
// ========================================

if ($deadline === "") {

    echo json_encode([
        "success" => false,
        "message" => "Deadline is required."
    ]);

    exit;
}


$deadlineTimestamp =
    strtotime(
        $deadline
    );


if ($deadlineTimestamp === false) {

    echo json_encode([
        "success" => false,
        "message" => "Invalid deadline."
    ]);

    exit;
}


// ========================================
// DEADLINE MUST BE FUTURE
// ========================================

if (
    $deadlineTimestamp <= time()
) {

    echo json_encode([
        "success" => false,
        "message" => "The deadline must be in the future."
    ]);

    exit;
}


// ========================================
// VALIDATE SCORE
// ========================================

if ($max_score <= 0) {

    echo json_encode([
        "success" => false,
        "message" => "Maximum score must be greater than 0."
    ]);

    exit;
}


// ========================================
// VALIDATE ATTEMPTS
// ========================================

if (
    $allow_resubmission &&
    $max_attempts !== null &&
    $max_attempts < 2
) {

    echo json_encode([
        "success" => false,
        "message" => "Maximum attempts must be at least 2, or unlimited."
    ]);

    exit;
}


// ========================================
// CONVERT DEADLINE
// ========================================

$deadline =
    date(
        "Y-m-d H:i:s",
        $deadlineTimestamp
    );


// ========================================
// CREATED BY
// ========================================

$created_by =
    (int) $_SESSION["user_id"];


// ========================================
// INSERT TASK
// ========================================

$stmt =
    $conn->prepare("
        INSERT INTO tasks (
            title,
            description,
            deadline,
            max_score,
            allow_resubmission,
            max_attempts,
            allow_late_submission,
            created_by
        )
        VALUES (
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?
        )
    ");


if (!$stmt) {

    echo json_encode([
        "success" => false,
        "message" => "Failed to prepare task query.",
        "error" => $conn->error
    ]);

    $conn->close();

    exit;
}


$stmt->bind_param(
    "sssiiiii",
    $title,
    $description,
    $deadline,
    $max_score,
    $allow_resubmission,
    $max_attempts,
    $allow_late_submission,
    $created_by
);


// ========================================
// EXECUTE
// ========================================

if (!$stmt->execute()) {

    echo json_encode([
        "success" => false,
        "message" => "Failed to create task.",
        "error" => $stmt->error
    ]);

    $stmt->close();

    $conn->close();

    exit;
}


$task_id =
    $stmt->insert_id;


$stmt->close();


// ========================================
// RESPONSE
// ========================================

echo json_encode([
    "success" => true,
    "message" => "Task created successfully.",
    "task_id" => (int) $task_id
]);


$conn->close();

?>