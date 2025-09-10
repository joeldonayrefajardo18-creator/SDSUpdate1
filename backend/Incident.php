<?php
// backend/Incident.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

// handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// DB connection
$host = "localhost";
$user = "root";
$pass = "";
$db   = "incident";

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "DB Connection failed: " . $conn->connect_error]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

function readJsonInput() {
    $raw = file_get_contents("php://input");
    $data = json_decode($raw, true);
    if (!is_array($data)) return [];
    return $data;
}

if ($method === "POST") {
    $data = readJsonInput();
    $studentId  = $data["id"] ?? ($data["student_id"] ?? "");
    $name       = $data["name"] ?? "";
    $department = $data["department"] ?? "";
    $year       = $data["year"] ?? "";
    $section    = $data["section"] ?? "";
    $type       = $data["type"] ?? "";
    $offense    = $data["offense"] ?? "";
    $violation  = $data["violation"] ?? "";
    $sanction   = $data["sanction"] ?? "";

    $stmt = $conn->prepare("INSERT INTO incidents (student_id, name, department, year, section, type, offense, violation, sanction) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssssssss", $studentId, $name, $department, $year, $section, $type, $offense, $violation, $sanction);
    if ($stmt->execute()) {
        $insertedId = $stmt->insert_id;
        $stmt->close();
        echo json_encode(["success" => true, "message" => "Incident saved", "id" => $insertedId]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => $stmt->error]);
        $stmt->close();
    }
}
elseif ($method === "GET") {
    // Check if requesting violation/sanction options
    if (isset($_GET['type'])) {
        $type = $_GET['type'];
        $data = [];

        // Use fully qualified DB.table names so Incident DB connection can query the other DBs
        if ($type === 'Minor') {
            // violations are stored in database `violation_db` table `violations`
            $sql = "SELECT id, violation AS name FROM violation_db.violations WHERE type='Minor'";
        } elseif ($type === 'Major') {
            // sanctions are stored in database `sanction_db` table `sanctions`
            $sql = "SELECT id, sanction AS name FROM sanction_db.sanctions WHERE type='Major'";
        } else {
            echo json_encode([]);
            exit;
        }

        $result = $conn->query($sql);
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $data[] = $row;
            }
        } else {
            // On query error, return empty array (optionally log)
            // error_log($conn->error);
        }
        echo json_encode($data);
    } else {
        // Default: return incidents list
        $result = $conn->query("SELECT * FROM incidents ORDER BY created_at DESC");
        $incidents = [];
        while ($row = $result->fetch_assoc()) {
            $incidents[] = $row;
        }
        echo json_encode($incidents);
    }
}
elseif ($method === "PUT") {
    $data = readJsonInput();
    if (empty($data['id'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Missing incident id"]);
        exit;
    }
    $id = (int)$data['id'];
    $studentId  = $data["student_id"] ?? ($data["id"] ?? "");
    $name       = $data["name"] ?? "";
    $department = $data["department"] ?? "";
    $year       = $data["year"] ?? "";
    $section    = $data["section"] ?? "";
    $type       = $data["type"] ?? "";
    $offense    = $data["offense"] ?? "";
    $violation  = $data["violation"] ?? "";
    $sanction   = $data["sanction"] ?? "";

    $stmt = $conn->prepare("UPDATE incidents SET student_id=?, name=?, department=?, year=?, section=?, type=?, offense=?, violation=?, sanction=?, updated_at=CURRENT_TIMESTAMP WHERE id=?");
    $stmt->bind_param("sssssssssi", $studentId, $name, $department, $year, $section, $type, $offense, $violation, $sanction, $id);
    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Incident updated"]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => $stmt->error]);
    }
    $stmt->close();
}
elseif ($method === "DELETE") {
    $data = readJsonInput();
    if (empty($data['id'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Missing incident id"]);
        exit;
    }
    $id = (int)$data['id'];
    $stmt = $conn->prepare("DELETE FROM incidents WHERE id=?");
    $stmt->bind_param("i", $id);
    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Incident deleted"]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => $stmt->error]);
    }
    $stmt->close();
}
else {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
}

$conn->close();
?>
