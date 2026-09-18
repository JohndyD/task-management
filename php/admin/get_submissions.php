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
// CHECK ADMIN ROLE
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
// GET ALL SUBMISSIONS
// =====================================================

$sql = "
    SELECT
        s.id,
        s.task_id,
        s.user_id,

        s.attempt_number,
        s.submission_type,
        s.is_current,

        s.file_path,
        s.score,
        s.feedback,
        s.status,

        s.submitted_at,
        s.replaced_at,

        t.title AS task_title,
        t.max_score,
        t.max_attempts,

        u.name AS student_name,
        u.email AS student_email

    FROM submissions s

    INNER JOIN tasks t
        ON s.task_id = t.id

    INNER JOIN users u
        ON s.user_id = u.id

    ORDER BY
        s.submitted_at DESC,
        s.id DESC
";


$result = $conn->query($sql);


// =====================================================
// CHECK QUERY
// =====================================================

if (!$result) {

    echo json_encode([
        "success" => false,
        "message" =>
            "Failed to load submissions: " .
            $conn->error
    ]);

    exit;
}


// =====================================================
// BUILD SUBMISSIONS
// =====================================================

$submissions = [];


while ($row = $result->fetch_assoc()) {

    $submissions[] = [

        "id" =>
            (int) $row["id"],

        "taskId" =>
            (int) $row["task_id"],

        "userId" =>
            (int) $row["user_id"],


        "attemptNumber" =>
            (int) $row["attempt_number"],

        "submissionType" =>
            $row["submission_type"],

        "isCurrent" =>
            (int) $row["is_current"],


        "filePath" =>
            $row["file_path"],

        "score" =>
            $row["score"] !== null
                ? (int) $row["score"]
                : null,

        "feedback" =>
            $row["feedback"],

        "status" =>
            $row["status"],


        "submittedAt" =>
            $row["submitted_at"],

        "replacedAt" =>
            $row["replaced_at"],


        "taskTitle" =>
            $row["task_title"],

        "maxScore" =>
            (int) $row["max_score"],

        "maxAttempts" =>
            $row["max_attempts"] !== null
                ? (int) $row["max_attempts"]
                : null,


        "studentName" =>
            $row["student_name"],

        "studentEmail" =>
            $row["student_email"]
    ];
}


// =====================================================
// RESPONSE
// =====================================================

echo json_encode([

    "success" => true,

    "submissions" =>
        $submissions

]);


$conn->close();

?>