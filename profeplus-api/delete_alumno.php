<?php
require_once 'conexion.php';
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");

$data = json_decode(file_get_contents("php://input"));

// OJO: Si borramos al alumno, también se borran sus asistencias (si la BD tiene DELETE CASCADE)
// Si no, podríamos dejar huérfanos los registros. Por ahora haremos un borrado simple.
$sql = "DELETE FROM alumnos WHERE id_alumno = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $data->id_alumno);

if($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "message" => $stmt->error]);
}
?>