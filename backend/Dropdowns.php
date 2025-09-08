<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Database connection
$host = "localhost"; 
$user = "root";       
$pass = "";           
$db   = "sds_db";     // Change to your DB name

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed"]);
    exit;
}

$response = [];

// Fetch Grades
$grades = [];
$result = $conn->query("SELECT id, name, level FROM grades ORDER BY id ASC");
while ($row = $result->fetch_assoc()) {
    $grades[] = $row;
}
$response["grades"] = $grades;

// Fetch Sections
$sections = [];
$result = $conn->query("SELECT id, name FROM sections ORDER BY id ASC");
while ($row = $result->fetch_assoc()) {
    $sections[] = $row;
}
$response["sections"] = $sections;

// Fetch Strands
$strands = [];
$result = $conn->query("SELECT id, name FROM strands ORDER BY id ASC");
while ($row = $result->fetch_assoc()) {
    $strands[] = $row;
}
$response["strands"] = $strands;

// Fetch Departments
$departments = [];
$result = $conn->query("SELECT id, name FROM departments ORDER BY id ASC");
while ($row = $result->fetch_assoc()) {
    $departments[] = $row;
}
$response["departments"] = $departments;

$conn->close();

echo json_encode($response);
?>
