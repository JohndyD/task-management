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
        "message" => "Not logged in."
    ]);

    exit;
}


// =====================================================
// CHECK ADMIN
// =====================================================

if (
    !isset($_SESSION["role"]) ||
    $_SESSION["role"] !== "admin"
) {

    echo json_encode([
        "success" => false,
        "message" => "Administrator access required."
    ]);

    exit;
}


// =====================================================
// GET JSON DATA
// =====================================================

$input = json_decode(
    file_get_contents("php://input"),
    true
);


// =====================================================
// CHECK SUBMISSION ID
// =====================================================

if (
    !isset($input["submission_id"]) ||
    !is_numeric($input["submission_id"])
) {

    echo json_encode([
        "success" => false,
        "message" => "Invalid submission ID."
    ]);

    exit;
}


$submissionId =
    (int) $input["submission_id"];


// =====================================================
// CHECK SCORE
// =====================================================

if (
    !isset($input["score"]) ||
    !is_numeric($input["score"])
) {

    echo json_encode([
        "success" => false,
        "message" => "Please enter a valid score."
    ]);

    exit;
}


$score =
    (int) $input["score"];


// =====================================================
// FEEDBACK
// =====================================================

$feedback =
    isset($input["feedback"])
        ? trim($input["feedback"])
        : "";


// =====================================================
// GET SUBMISSION
// =====================================================
//
// IMPORTANT:
// Only CURRENT submissions can be graded.
//
// Older/replaced submissions have:
// is_current = 0
//
// =====================================================

$stmt = $conn->prepare("
    SELECT
        s.id,
        s.task_id,
        s.user_id,
        s.attempt_number,
        s.is_current,
        s.status,
        t.max_score

    FROM submissions s

    INNER JOIN tasks t
        ON s.task_id = t.id

    WHERE s.id = ?
    LIMIT 1
");


$stmt->bind_param(
    "i",
    $submissionId
);


$stmt->execute();


$result =
    $stmt->get_result();


$submission =
    $result->fetch_assoc();


$stmt->close();


// =====================================================
// SUBMISSION NOT FOUND
// =====================================================

if (!$submission) {

    echo json_encode([
        "success" => false,
        "message" => "Submission not found."
    ]);

    exit;
}


// =====================================================
// CHECK CURRENT SUBMISSION
// =====================================================

if ((int) $submission["is_current"] !== 1) {

    echo json_encode([
        "success" => false,
        "message" =>
            "This submission is no longer the student's current submission and cannot be graded."
    ]);

    exit;
}


// =====================================================
// MAX SCORE
// =====================================================

$maxScore =
    (int) $submission["max_score"];


// =====================================================
// VALIDATE SCORE
// =====================================================

if ($score < 0) {

    echo json_encode([
        "success" => false,
        "message" => "Score cannot be negative."
    ]);

    exit;
}


if ($score > $maxScore) {

    echo json_encode([
        "success" => false,
        "message" =>
            "Score cannot be greater than " .
            $maxScore . "."
    ]);

    exit;
}


// =====================================================
// UPDATE GRADE
// =====================================================

$stmt = $conn->prepare("
    UPDATE submissions

    SET
        score = ?,
        feedback = ?,
        status = 'graded'

    WHERE id = ?
      AND is_current = 1
");


$stmt->bind_param(
    "isi",
    $score,
    $feedback,
    $submissionId
);


if (!$stmt->execute()) {

    $stmt->close();

    echo json_encode([
        "success" => false,
        "message" => "Failed to save grade."
    ]);

    exit;
}


$stmt->close();


// =====================================================
// SUCCESS
// =====================================================

echo json_encode([

    "success" => true,

    "message" =>
        "Grade saved successfully.",

    "submission" => [

        "id" =>
            $submissionId,

        "score" =>
            $score,

        "feedback" =>
            $feedback,

        "status" =>
            "graded"

    ]

]);


$conn->close();

?>