<?php
// C:/xampp/htdocs/profe_plus/profeplus-api/delete_rubro.php
require_once 'conexion.php';
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");

$data = json_decode(file_get_contents("php://input"));

if(!$data) { exit(json_encode(["success"=>false])); }

// Soft delete: actualizar 'deleted' a 1
$sql = "UPDATE rubros SET deleted = 1 WHERE id_rubro = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $data->id_rubro);

if($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "message" => $stmt->error]);
}
?>