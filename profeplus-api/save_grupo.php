<?php
// C:/xampp/htdocs/profe_plus/profeplus-api/save_grupo.php
require_once 'conexion.php';
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");

$data = json_decode(file_get_contents("php://input"));

if(!$data) { exit(json_encode(["success"=>false])); }

// Insertamos el nuevo grupo y lo marcamos como activo (1)
// Nota: 'deleted' suele tener default 0 en la BD, así que no hace falta ponerlo
$sql = "INSERT INTO grupos (uuid, id_profesor, nombre, activo, deleted) VALUES (UUID(), ?, ?, 1, 0)";

$stmt = $conn->prepare($sql);
$stmt->bind_param("is", $data->id_profesor, $data->nombre);

if($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Grupo creado"]);
} else {
    echo json_encode(["success" => false, "message" => "Error SQL: " . $stmt->error]);
}
?>