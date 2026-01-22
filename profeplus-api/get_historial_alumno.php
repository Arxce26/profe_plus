<?php
// get_historial_alumno.php
require_once 'conexion.php';
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

$id_alumno = $_GET['id_alumno'];
$id_grupo = $_GET['id_grupo'];

// Traemos todas las fechas registradas de ese alumno
$sql = "SELECT fecha, estado FROM asistencia 
        WHERE id_alumno = ? AND id_grupo = ? 
        ORDER BY fecha DESC"; // De lo más reciente a lo antiguo

$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $id_alumno, $id_grupo);
$stmt->execute();
$result = $stmt->get_result();

$historial = [];
while($row = $result->fetch_assoc()) {
    $historial[] = $row;
}

echo json_encode($historial);
?>