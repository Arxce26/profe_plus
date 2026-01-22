<?php
// C:/xampp/htdocs/profe_plus/profeplus-api/unarchive_grupo.php
require_once 'conexion.php';
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");

$data = json_decode(file_get_contents("php://input"));

// Volvemos a poner activo = 1
$sql = "UPDATE grupos SET activo = 1 WHERE id_grupo = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $data->id_grupo);

if($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "message" => $stmt->error]);
}
?>