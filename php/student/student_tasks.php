<?php

header("Content-Type: application/json");

include "../config/cors.php";

session_start();

include "../config/db.php";


/*
|--------------------------------------------------------------------------
| CHECK LOGIN
|--------------------------------------------------------------------------
*/

if (!isset($_SESSION["user_id"])) {

    echo json_encode([
        "success" => false,
        "message" => "Not logged in."
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| CHECK STUDENT ROLE
|--------------------------------------------------------------------------
*/

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


/*
|--------------------------------------------------------------------------
| GET ALL TASKS
|--------------------------------------------------------------------------
*/

$sql = "
    SELECT
        t.id,
        t.title,
        t.description,
        t.deadline,
        t.max_score,
        t.allow_resubmission,
        t.max_attempts,
        t.allow_late_submission,
        t.created_by,
        t.created_at,

        u.name AS creator_name

    FROM tasks t

    LEFT JOIN users u
        ON t.created_by = u.id

    ORDER BY t.deadline ASC
";


$stmt = $conn->prepare($sql);


/*
|--------------------------------------------------------------------------
| CHECK QUERY
|--------------------------------------------------------------------------
*/

if (!$stmt) {

    echo json_encode([
        "success" => false,
        "message" => "Failed to prepare task query.",
        "error" => $conn->error
    ]);

    $conn->close();

    exit;
}


/*
|--------------------------------------------------------------------------
| EXECUTE QUERY
|--------------------------------------------------------------------------
*/

if (!$stmt->execute()) {

    echo json_encode([
        "success" => false,
        "message" => "Failed to load tasks.",
        "error" => $stmt->error
    ]);

    $stmt->close();

    $conn->close();

    exit;
}


$result = $stmt->get_result();

$tasks = [];


/*
|--------------------------------------------------------------------------
| GET EACH TASK
|--------------------------------------------------------------------------
*/

while ($row = $result->fetch_assoc()) {

    $task_id =
        (int) $row["id"];


    $submission = null;


    /*
    |--------------------------------------------------------------------------
    | GET LATEST SUBMISSION
    |--------------------------------------------------------------------------
    */

    $submissionStmt = $conn->prepare("
        SELECT
            id,
            file_path,
            score,
            feedback,
            status,
            submitted_at

        FROM submissions

        WHERE task_id = ?
        AND user_id = ?

        ORDER BY submitted_at DESC, id DESC

        LIMIT 1
    ");


    if ($submissionStmt) {

        $submissionStmt->bind_param(
            "ii",
            $task_id,
            $user_id
        );


        if ($submissionStmt->execute()) {

            $submissionResult =
                $submissionStmt->get_result();


            if (
                $submissionResult &&
                $submissionResult->num_rows > 0
            ) {

                $submissionRow =
                    $submissionResult->fetch_assoc();


                $submission = [

                    "id" =>
                        (int) $submissionRow["id"],

                    "filePath" =>
                        $submissionRow["file_path"],

                    "score" =>
                        $submissionRow["score"] !== null
                            ? (int) $submissionRow["score"]
                            : null,

                    "feedback" =>
                        $submissionRow["feedback"],

                    "status" =>
                        $submissionRow["status"],

                    "submittedAt" =>
                        $submissionRow["submitted_at"]

                ];

            }

        }


        $submissionStmt->close();

    }


    /*
    |--------------------------------------------------------------------------
    | COUNT TOTAL ATTEMPTS
    |--------------------------------------------------------------------------
    */

    $attemptCount = 0;


    $attemptStmt = $conn->prepare("
        SELECT COUNT(*) AS attempt_count

        FROM submissions

        WHERE task_id = ?
        AND user_id = ?
    ");


    if ($attemptStmt) {

        $attemptStmt->bind_param(
            "ii",
            $task_id,
            $user_id
        );


        if ($attemptStmt->execute()) {

            $attemptResult =
                $attemptStmt->get_result();


            if (
                $attemptResult &&
                $attemptResult->num_rows > 0
            ) {

                $attemptRow =
                    $attemptResult->fetch_assoc();


                $attemptCount =
                    (int) $attemptRow["attempt_count"];

            }

        }


        $attemptStmt->close();

    }


    /*
    |--------------------------------------------------------------------------
    | ADD TASK
    |--------------------------------------------------------------------------
    */

    $tasks[] = [

        "id" =>
            $task_id,

        "title" =>
            $row["title"],

        "description" =>
            $row["description"],

        "deadline" =>
            $row["deadline"],

        "maxScore" =>
            (int) $row["max_score"],

        "allowResubmission" =>
            (int) $row["allow_resubmission"] === 1,

        "maxAttempts" =>
            $row["max_attempts"] !== null
                ? (int) $row["max_attempts"]
                : null,

        "allowLateSubmission" =>
            (int) $row["allow_late_submission"] === 1,

        "attemptCount" =>
            $attemptCount,

        "createdBy" =>
            (int) $row["created_by"],

        "creatorName" =>
            $row["creator_name"]
                ? $row["creator_name"]
                : "Unknown",

        "createdAt" =>
            $row["created_at"],

        "submission" =>
            $submission

    ];

}


$stmt->close();


/*
|--------------------------------------------------------------------------
| RETURN TASKS
|--------------------------------------------------------------------------
*/

echo json_encode([

    "success" => true,

    "tasks" => $tasks

]);


$conn->close();

?>