<?php
// StudentIncident.php

// === DB CONFIG ===
$DB_HOST = '127.0.0.1';
$DB_NAME = 'student_discipline';
$DB_USER = 'root';
$DB_PASS = '';

// === HEADERS ===
$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

// === CONNECT ===
try {
  $pdo = new PDO("mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4",
    $DB_USER, $DB_PASS,
    [PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC]
  );
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["ok"=>false,"error"=>"DB connection failed"]);
  exit;
}

// === HELPERS ===
function json_input() {
  $raw = file_get_contents("php://input");
  return $raw ? json_decode($raw,true) : [];
}
function respond($code,$data){
  http_response_code($code);
  echo json_encode($data);
  exit;
}

// === ROUTES ===
$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? intval($_GET['id']) : null;

try {
  if ($method === 'GET') {
    if ($id) {
      $stmt = $pdo->prepare("SELECT * FROM student_incidents WHERE id=?");
      $stmt->execute([$id]);
      $row = $stmt->fetch();
      if (!$row) respond(404,["ok"=>false,"error"=>"Not found"]);
      respond(200,["ok"=>true,"data"=>$row]);
    } else {
      $student_id = $_GET['student_id'] ?? null;
      if ($student_id) {
        $stmt = $pdo->prepare("SELECT * FROM student_incidents WHERE student_id=? ORDER BY date_reported DESC");
        $stmt->execute([$student_id]);
      } else {
        $stmt = $pdo->query("SELECT * FROM student_incidents ORDER BY date_reported DESC");
      }
      $rows = $stmt->fetchAll();
      respond(200,["ok"=>true,"data"=>$rows]);
    }
  }

  elseif ($method === 'POST') {
    $data = json_input();
    if (!isset($data['student_id'],$data['description'],$data['date_reported'])) {
      respond(422,["ok"=>false,"error"=>"Missing fields"]);
    }
    $stmt = $pdo->prepare("INSERT INTO student_incidents (student_id, description, date_reported, status) VALUES (?,?,?,?)");
    $stmt->execute([
      $data['student_id'],
      $data['description'],
      $data['date_reported'],
      $data['status'] ?? 'Open'
    ]);
    $newId = $pdo->lastInsertId();
    $row = $pdo->query("SELECT * FROM student_incidents WHERE id=$newId")->fetch();
    respond(201,["ok"=>true,"data"=>$row]);
  }

  elseif ($method === 'PUT') {
    if (!$id) respond(400,["ok"=>false,"error"=>"Missing id"]);
    $data = json_input();
    $fields = [];
    $params = [];
    foreach (["student_id","description","date_reported","status"] as $f) {
      if (isset($data[$f])) {
        $fields[] = "$f=?";
        $params[] = $data[$f];
      }
    }
    if (!$fields) respond(422,["ok"=>false,"error"=>"No fields to update"]);
    $params[] = $id;
    $sql = "UPDATE student_incidents SET ".implode(",",$fields)." WHERE id=?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $row = $pdo->query("SELECT * FROM student_incidents WHERE id=$id")->fetch();
    respond(200,["ok"=>true,"data"=>$row]);
  }

  elseif ($method === 'DELETE') {
    if (!$id) respond(400,["ok"=>false,"error"=>"Missing id"]);
    $stmt = $pdo->prepare("DELETE FROM student_incidents WHERE id=?");
    $stmt->execute([$id]);
    respond(200,["ok"=>true,"data"=>["id"=>$id]]);
  }

  else {
    respond(405,["ok"=>false,"error"=>"Method not allowed"]);
  }
} catch (Exception $e) {
  respond(500,["ok"=>false,"error"=>"Server error","detail"=>$e->getMessage()]);
}
