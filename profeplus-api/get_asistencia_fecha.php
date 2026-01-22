<?php
// get_asistencia_fecha.php
require_once 'conexion.php';
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

$id_grupo = $_GET['id_grupo'];
$fecha = $_GET['fecha'];

// Obtenemos qué se guardó ese día específico
$sql = "SELECT id_alumno, estado FROM asistencia WHERE id_grupo = ? AND fecha = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("is", $id_grupo, $fecha);
$stmt->execute();
$result = $stmt->get_result();

$asistencias = [];
while($row = $result->fetch_assoc()) {
    $asistencias[$row['id_alumno']] = $row['estado'];
}

// Devolvemos un objeto simple: { "101": "Presente", "102": "Falta" }
echo json_encode($asistencias);
?>