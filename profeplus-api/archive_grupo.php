<?php
// C:/xampp/htdocs/profe_plus/profeplus-api/archive_grupo.php
require_once 'conexion.php';
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");

$data = json_decode(file_get_contents("php://input"));

if(!$data) { exit(json_encode(["success"=>false])); }

// Actualizamos 'activo' a 0 (Archivado)
$sql = "UPDATE grupos SET activo = 0 WHERE id_grupo = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $data->id_grupo);

if($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Grupo archivado"]);
} else {
    echo json_encode(["success" => false, "message" => "Error SQL: " . $stmt->error]);
}
?>