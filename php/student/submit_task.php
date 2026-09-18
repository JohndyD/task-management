<?php

header("Content-Type: application/json");

include "../config/cors.php";

session_start();

include "../config/db.php";


// =====================================================
// CHECK LOGIN
// =====================================================

if (!isset($_SESSION["user_id"])) {

    echo json_encode([
        "success" => false,
        "message" => "You must be logged in."
    ]);

    exit;
}


// =====================================================
// CHECK ROLE
// =====================================================

if (!isset($_SESSION["role"]) || $_SESSION["role"] !== "student") {

    echo json_encode([
        "success" => false,
        "message" => "Only students can submit tasks."
    ]);

    exit;
}


$userId = (int) $_SESSION["user_id"];


// =====================================================
// CHECK TASK ID
// =====================================================

if (!isset($_POST["task_id"]) || !is_numeric($_POST["task_id"])) {

    echo json_encode([
        "success" => false,
        "message" => "Invalid task."
    ]);

    exit;
}

$taskId = (int) $_POST["task_id"];


// =====================================================
// CHECK FILE
// =====================================================

if (!isset($_FILES["file"])) {

    echo json_encode([
        "success" => false,
        "message" => "Please select a file to submit."
    ]);

    exit;
}


$file = $_FILES["file"];


// =====================================================
// CHECK UPLOAD ERROR
// =====================================================

if ($file["error"] !== UPLOAD_ERR_OK) {

    echo json_encode([
        "success" => false,
        "message" => "There was a problem uploading the file."
    ]);

    exit;
}


// =====================================================
// FILE SIZE
// Maximum: 10 MB
// =====================================================

$maxFileSize = 10 * 1024 * 1024;

if ($file["size"] > $maxFileSize) {

    echo json_encode([
        "success" => false,
        "message" => "The file size must not exceed 10 MB."
    ]);

    exit;
}


// =====================================================
// FILE EXTENSION
// =====================================================

$originalName = $file["name"];

$extension = strtolower(
    pathinfo($originalName, PATHINFO_EXTENSION)
);


$allowedExtensions = [
    "zip",
    "pdf",
    "txt"
];


if (!in_array($extension, $allowedExtensions, true)) {

    echo json_encode([
        "success" => false,
        "message" => "Only ZIP, PDF, and TXT files are allowed."
    ]);

    exit;
}


// =====================================================
// MIME TYPE VALIDATION
// =====================================================

$finfo = finfo_open(FILEINFO_MIME_TYPE);

$mimeType = finfo_file(
    $finfo,
    $file["tmp_name"]
);

finfo_close($finfo);


$allowedMimeTypes = [
    "zip" => [
        "application/zip",
        "application/x-zip-compressed",
        "application/octet-stream"
    ],

    "pdf" => [
        "application/pdf"
    ],

    "txt" => [
        "text/plain"
    ]
];


if (
    !isset($allowedMimeTypes[$extension]) ||
    !in_array($mimeType, $allowedMimeTypes[$extension], true)
) {

    echo json_encode([
        "success" => false,
        "message" => "The uploaded file type is not valid."
    ]);

    exit;
}


// =====================================================
// GET TASK
// =====================================================

$stmt = $conn->prepare("
    SELECT
        id,
        title,
        deadline,
        max_score,
        allow_resubmission,
        max_attempts,
        allow_late_submission
    FROM tasks
    WHERE id = ?
    LIMIT 1
");

$stmt->bind_param("i", $taskId);

$stmt->execute();

$result = $stmt->get_result();

$task = $result->fetch_assoc();

$stmt->close();


if (!$task) {

    echo json_encode([
        "success" => false,
        "message" => "Task not found."
    ]);

    exit;
}


// =====================================================
// TASK SETTINGS
// =====================================================

$allowResubmission = (int) $task["allow_resubmission"];
$maxAttempts = $task["max_attempts"] !== null
    ? (int) $task["max_attempts"]
    : null;

$allowLateSubmission = (int) $task["allow_late_submission"];


// =====================================================
// CHECK DEADLINE
// =====================================================

$currentTime = new DateTime();

$deadline = new DateTime($task["deadline"]);


if (
    $currentTime > $deadline &&
    $allowLateSubmission !== 1
) {

    echo json_encode([
        "success" => false,
        "message" => "The submission deadline has already passed."
    ]);

    exit;
}


// =====================================================
// GET CURRENT / LATEST ATTEMPT
// =====================================================

$stmt = $conn->prepare("
    SELECT
        id,
        attempt_number,
        is_current
    FROM submissions
    WHERE task_id = ?
      AND user_id = ?
    ORDER BY attempt_number DESC
    LIMIT 1
");

$stmt->bind_param(
    "ii",
    $taskId,
    $userId
);

$stmt->execute();

$result = $stmt->get_result();

$latestSubmission = $result->fetch_assoc();

$stmt->close();


// =====================================================
// DETERMINE ATTEMPT NUMBER
// =====================================================

if ($latestSubmission) {

    $currentAttempt = (int) $latestSubmission["attempt_number"];

    $nextAttempt = $currentAttempt + 1;

} else {

    $currentAttempt = 0;

    $nextAttempt = 1;
}


// =====================================================
// CHECK RESUBMISSION PERMISSION
// =====================================================

if ($nextAttempt > 1 && $allowResubmission !== 1) {

    echo json_encode([
        "success" => false,
        "message" => "Resubmission is not allowed for this task."
    ]);

    exit;
}


// =====================================================
// CHECK MAX ATTEMPTS
// =====================================================

if (
    $maxAttempts !== null &&
    $maxAttempts > 0 &&
    $nextAttempt > $maxAttempts
) {

    echo json_encode([
        "success" => false,
        "message" => "You have reached the maximum number of attempts for this task."
    ]);

    exit;
}


// =====================================================
// DETERMINE SUBMISSION TYPE
// =====================================================

$submissionType = $nextAttempt === 1
    ? "initial"
    : "resubmission";


// =====================================================
// UPLOAD DIRECTORY
// =====================================================

$uploadDirectory = __DIR__ . "/../../uploads/submissions/";


if (!is_dir($uploadDirectory)) {

    if (!mkdir($uploadDirectory, 0777, true)) {

        echo json_encode([
            "success" => false,
            "message" => "Unable to create upload directory."
        ]);

        exit;
    }
}


// =====================================================
// GENERATE SAFE FILE NAME
// =====================================================

$randomString = bin2hex(random_bytes(8));

$fileName =
    "task_" .
    $taskId .
    "_student_" .
    $userId .
    "_attempt_" .
    $nextAttempt .
    "_" .
    date("YmdHis") .
    "_" .
    $randomString .
    "." .
    $extension;


$destination = $uploadDirectory . $fileName;


// =====================================================
// MOVE FILE
// =====================================================

if (!move_uploaded_file($file["tmp_name"], $destination)) {

    echo json_encode([
        "success" => false,
        "message" => "Failed to save the uploaded file."
    ]);

    exit;
}


$filePath = "uploads/submissions/" . $fileName;


// =====================================================
// START TRANSACTION
// =====================================================

$conn->begin_transaction();


try {

    // -------------------------------------------------
    // Make previous current submission non-current
    // -------------------------------------------------

    if ($latestSubmission) {

        $updateStmt = $conn->prepare("
            UPDATE submissions
            SET
                is_current = 0,
                replaced_at = NOW()
            WHERE task_id = ?
              AND user_id = ?
              AND is_current = 1
        ");

        $updateStmt->bind_param(
            "ii",
            $taskId,
            $userId
        );

        $updateStmt->execute();

        $updateStmt->close();
    }


    // -------------------------------------------------
    // Insert new submission
    // -------------------------------------------------

    $insertStmt = $conn->prepare("
        INSERT INTO submissions (
            task_id,
            user_id,
            attempt_number,
            submission_type,
            is_current,
            file_path,
            score,
            feedback,
            status,
            submitted_at,
            replaced_at
        )
        VALUES (
            ?,
            ?,
            ?,
            ?,
            1,
            ?,
            NULL,
            NULL,
            'submitted',
            NOW(),
            NULL
        )
    ");

    $insertStmt->bind_param(
        "iiiss",
        $taskId,
        $userId,
        $nextAttempt,
        $submissionType,
        $filePath
    );

    if (!$insertStmt->execute()) {
        throw new Exception("Failed to save submission.");
    }

    $submissionId = $insertStmt->insert_id;

    $insertStmt->close();


    // -------------------------------------------------
    // Commit
    // -------------------------------------------------

    $conn->commit();


    echo json_encode([
        "success" => true,
        "message" => $nextAttempt === 1
            ? "Task submitted successfully."
            : "Resubmission successful.",

        "submission" => [
            "id" => $submissionId,
            "taskId" => $taskId,
            "attemptNumber" => $nextAttempt,
            "submissionType" => $submissionType,
            "isCurrent" => 1,
            "filePath" => $filePath,
            "score" => null,
            "feedback" => null,
            "status" => "submitted",
            "submittedAt" => date("Y-m-d H:i:s"),
            "replacedAt" => null
        ]
    ]);

} catch (Exception $e) {

    $conn->rollback();

    // Remove uploaded file if database operation failed.
    if (file_exists($destination)) {
        unlink($destination);
    }

    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}

?>