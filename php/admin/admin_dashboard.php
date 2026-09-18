<?php

header("Content-Type: application/json");

// ========================================
// CORS
// ========================================

include "../config/cors.php";

// ========================================
// SESSION
// ========================================

session_start();

// ========================================
// DATABASE
// ========================================

include "../config/db.php";

// ========================================
// CHECK LOGIN
// ========================================

if (!isset($_SESSION["user_id"])) {

    http_response_code(401);

    echo json_encode([
        "success" => false,
        "message" => "Not logged in."
    ]);

    exit;
}


// ========================================
// CHECK ADMIN ROLE
// ========================================

if (!isset($_SESSION["role"]) || $_SESSION["role"] !== "admin") {

    http_response_code(403);

    echo json_encode([
        "success" => false,
        "message" => "Access denied."
    ]);

    exit;
}


// ========================================
// TOTAL TASKS
// ========================================

$taskQuery = $conn->query(
    "SELECT COUNT(*) AS total_tasks
     FROM tasks"
);

if (!$taskQuery) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Failed to get total tasks."
    ]);

    exit;
}

$taskData = $taskQuery->fetch_assoc();

$totalTasks = (int) $taskData["total_tasks"];


// ========================================
// ACTIVE TASKS
//
// Tasks whose deadline has not passed.
// ========================================

$activeTaskQuery = $conn->query(
    "SELECT COUNT(*) AS active_tasks
     FROM tasks
     WHERE deadline >= NOW()"
);

if (!$activeTaskQuery) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Failed to get active tasks."
    ]);

    exit;
}

$activeTaskData = $activeTaskQuery->fetch_assoc();

$activeTasks = (int) $activeTaskData["active_tasks"];


// ========================================
// TASKS DUE WITHIN 7 DAYS
// ========================================

$dueSoonQuery = $conn->query(
    "SELECT COUNT(*) AS due_soon
     FROM tasks
     WHERE deadline >= NOW()
       AND deadline <= DATE_ADD(NOW(), INTERVAL 7 DAY)"
);

if (!$dueSoonQuery) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Failed to get tasks due soon."
    ]);

    exit;
}

$dueSoonData = $dueSoonQuery->fetch_assoc();

$dueSoon = (int) $dueSoonData["due_soon"];


// ========================================
// TOTAL STUDENTS
// ========================================

$studentQuery = $conn->query(
    "SELECT COUNT(*) AS total_students
     FROM users
     WHERE role = 'student'"
);

if (!$studentQuery) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Failed to get total students."
    ]);

    exit;
}

$studentData = $studentQuery->fetch_assoc();

$totalStudents = (int) $studentData["total_students"];


// ========================================
// TOTAL SUBMISSIONS
//
// Count only ONE submission for each
// student + task combination.
//
// Example:
//
// Student A
// Task 1 -> 3 submissions
//
// This counts as:
// 1 submission
//
// Resubmissions are excluded.
// ========================================

$submissionQuery = $conn->query(
    "SELECT COUNT(*) AS total_submissions
     FROM (
         SELECT task_id, user_id
         FROM submissions
         WHERE status IN ('submitted', 'graded')
         GROUP BY task_id, user_id
     ) AS unique_submissions"
);

if (!$submissionQuery) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Failed to get total submissions."
    ]);

    exit;
}

$submissionData = $submissionQuery->fetch_assoc();

$totalSubmissions = (int) $submissionData["total_submissions"];


// ========================================
// PENDING SUBMISSIONS
// ========================================

$pendingQuery = $conn->query(
    "SELECT COUNT(*) AS pending_submissions
     FROM submissions
     WHERE status = 'pending'"
);

if (!$pendingQuery) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Failed to get pending submissions."
    ]);

    exit;
}

$pendingData = $pendingQuery->fetch_assoc();

$pendingSubmissions = (int) $pendingData["pending_submissions"];


// ========================================
// RECENT SUBMISSIONS
//
// IMPORTANT:
//
// Only the MOST RECENT submission from
// each student is displayed.
//
// Therefore:
//
// Student A -> appears once
// Student B -> appears once
// Student C -> appears once
//
// Older submissions from the same student
// are not displayed.
//
// Only the latest 5 students are shown.
// ========================================

$recentQuery = $conn->query(
    "SELECT
        submissions.id,
        submissions.task_id,
        submissions.user_id,
        submissions.status,
        submissions.score,
        submissions.submitted_at,

        tasks.title AS task_title,

        users.name AS student_name

     FROM submissions

     INNER JOIN tasks
        ON submissions.task_id = tasks.id

     INNER JOIN users
        ON submissions.user_id = users.id

     WHERE submissions.status IN ('submitted', 'graded')

       AND NOT EXISTS (

           SELECT 1

           FROM submissions AS newer_submission

           WHERE newer_submission.user_id = submissions.user_id

             AND newer_submission.status IN ('submitted', 'graded')

             AND (
                 newer_submission.submitted_at > submissions.submitted_at

                 OR (

                     newer_submission.submitted_at = submissions.submitted_at

                     AND newer_submission.id > submissions.id

                 )
             )
       )

     ORDER BY submissions.submitted_at DESC,
              submissions.id DESC

     LIMIT 5"
);

if (!$recentQuery) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Failed to get recent submissions."
    ]);

    exit;
}


$recentSubmissions = [];


while ($row = $recentQuery->fetch_assoc()) {

    $recentSubmissions[] = [

        "id" => (int) $row["id"],

        "taskId" => (int) $row["task_id"],

        "userId" => (int) $row["user_id"],

        "taskTitle" => $row["task_title"],

        "studentName" => $row["student_name"],

        "status" => $row["status"],

        "score" =>
            $row["score"] !== null
                ? (int) $row["score"]
                : null,

        "submittedAt" => $row["submitted_at"]
    ];
}


// ========================================
// RETURN DASHBOARD DATA
// ========================================

echo json_encode([

    "success" => true,

    "data" => [

        "totalTasks" => $totalTasks,

        "activeTasks" => $activeTasks,

        "dueSoon" => $dueSoon,

        "totalStudents" => $totalStudents,

        "totalSubmissions" => $totalSubmissions,

        "pendingSubmissions" => $pendingSubmissions,

        "recentSubmissions" => $recentSubmissions
    ]
]);


// ========================================
// CLOSE DATABASE
// ========================================

$conn->close();

?>