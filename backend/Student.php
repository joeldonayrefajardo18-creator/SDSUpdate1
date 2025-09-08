<?php
// backend/Student.php

// Allow CORS (for React frontend)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ✅ Database connection
$host = "localhost";
$user = "root"; // change if needed
$pass = "";     // change if needed
$db   = "student_db"; // change to your DB name

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    die(json_encode(["error" => "Database connection failed: " . $conn->connect_error]));
}

// ✅ Helper function to parse JSON body
function getJsonInput() {
    return json_decode(file_get_contents("php://input"), true);
}

// ✅ GET (fetch students)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT * FROM students";
    $result = $conn->query($sql);

    $students = [];
    while ($row = $result->fetch_assoc()) {
        $students[] = $row;
    }
    echo json_encode($students);
}

// ✅ POST (add student OR bulk upload CSV)
elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // If file uploaded -> Bulk Upload
    if (!empty($_FILES['file']['tmp_name'])) {
        $file = $_FILES['file']['tmp_name'];
        $handle = fopen($file, "r");
        $rowCount = 0;
        $inserted = 0;

        // Skip header row
        fgetcsv($handle);

        while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
            $rowCount++;
            $name       = $data[0] ?? "";
            $student_id = $data[1] ?? "";
            $department = $data[2] ?? "";
            $section    = $data[3] ?? "";
            $grade      = $data[4] ?? "";
            $strand     = $data[5] ?? "";
            $year       = $data[6] ?? "";
            $email      = $student_id . "@school.edu"; // dummy email if missing

            if (!empty($student_id) && !empty($name)) {
                $stmt = $conn->prepare("INSERT INTO students (name, email, student_id, department, year, grade, section, strand, status) 
                                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Active')
                                        ON DUPLICATE KEY UPDATE name=VALUES(name), email=VALUES(email), department=VALUES(department), year=VALUES(year), grade=VALUES(grade), section=VALUES(section), strand=VALUES(strand)");
                $stmt->bind_param("ssssssss", $name, $email, $student_id, $department, $year, $grade, $section, $strand);

                if ($stmt->execute()) {
                    $inserted++;
                }
                $stmt->close();
            }
        }
        fclose($handle);

        echo json_encode(["success" => true, "message" => "Bulk upload complete", "rows_processed" => $rowCount, "inserted" => $inserted]);
        exit;
    }

    // Otherwise, normal Add Student
    $data = getJsonInput();

    $stmt = $conn->prepare("INSERT INTO students (name, email, student_id, department, year, grade, section, strand, status) 
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param(
        "sssssssss",
        $data['name'],
        $data['email'],
        $data['id'],
        $data['department'],
        $data['year'],
        $data['grade'],
        $data['section'],
        $data['strand'],
        $data['status']
    );

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Student added"]);
    } else {
        echo json_encode(["success" => false, "error" => $stmt->error]);
    }
    $stmt->close();
}

// ✅ PUT (update student)
elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = getJsonInput();

    $stmt = $conn->prepare("UPDATE students 
                            SET name=?, email=?, department=?, year=?, grade=?, section=?, strand=?, status=? 
                            WHERE student_id=?");
    $stmt->bind_param(
        "sssssssss",
        $data['name'],
        $data['email'],
        $data['department'],
        $data['year'],
        $data['grade'],
        $data['section'],
        $data['strand'],
        $data['status'],
        $data['id']
    );

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Student updated"]);
    } else {
        echo json_encode(["success" => false, "error" => $stmt->error]);
    }
    $stmt->close();
}

// ✅ DELETE (delete student)
elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    if (!isset($_GET['id'])) {
        echo json_encode(["success" => false, "error" => "Missing student ID"]);
        exit;
    }

    $id = $_GET['id'];
    $stmt = $conn->prepare("DELETE FROM students WHERE student_id=?");
    $stmt->bind_param("s", $id);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Student deleted"]);
    } else {
        echo json_encode(["success" => false, "error" => $stmt->error]);
    }
    $stmt->close();
}

$conn->close();
?>
