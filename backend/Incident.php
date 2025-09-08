<?php
// Incident.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// DB connection
$host = "localhost";
$user = "root";
$pass = "";
$db   = "Incident"; // make sure this database exists

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "DB Connection failed: " . $conn->connect_error]));
}

// Handle request method
$method = $_SERVER['REQUEST_METHOD'];

if ($method === "POST") {
    // Get JSON input
    $data = json_decode(file_get_contents("php://input"), true);

    $studentId  = $conn->real_escape_string($data["id"]);
    $name       = $conn->real_escape_string($data["name"]);
    $department = $conn->real_escape_string($data["department"]);
    $year       = $conn->real_escape_string($data["year"]);
    $section    = $conn->real_escape_string($data["section"]);
    $type       = $conn->real_escape_string($data["type"]);
    $offense    = $conn->real_escape_string($data["offense"]);
    $violation  = $conn->real_escape_string($data["violation"]);
    $sanction   = $conn->real_escape_string($data["sanction"]);

    $sql = "INSERT INTO incidents (student_id, name, department, year, section, type, offense, violation, sanction) 
            VALUES ('$studentId', '$name', '$department', '$year', '$section', '$type', '$offense', '$violation', '$sanction')";

    if ($conn->query($sql) === TRUE) {
        echo json_encode(["success" => true, "message" => "Incident saved"]);
    } else {
        echo json_encode(["success" => false, "message" => $conn->error]);
    }
}
elseif ($method === "GET") {
    $result = $conn->query("SELECT * FROM incidents ORDER BY created_at DESC");
    $incidents = [];
    while ($row = $result->fetch_assoc()) {
        $incidents[] = $row;
    }
    echo json_encode($incidents);
}
else {
    echo json_encode(["success" => false, "message" => "Invalid request"]);
}

$conn->close();
?>
