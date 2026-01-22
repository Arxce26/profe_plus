<?php
// get_estadisticas.php
require_once 'conexion.php';
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

$id_grupo = $_GET['id_grupo'];

// Esta consulta mágica cuenta cuántas "Presente" tiene cada alumno
// Y los ordena de MAYOR a MENOR asistencia (DESC)
$sql = "SELECT 
            a.nombre, 
            a.apellidos, 
            COUNT(asis.id_asistencia) as total_asistencias
        FROM alumnos a
        LEFT JOIN asistencia asis 
            ON a.id_alumno = asis.id_alumno 
            AND asis.estado = 'Presente' -- Solo contamos las asistencias reales
            AND asis.id_grupo = ?
        WHERE a.id_grupo = ?
        GROUP BY a.id_alumno
        ORDER BY total_asistencias DESC"; // <--- AQUÍ ESTÁ EL ORDENAMIENTO

$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $id_grupo, $id_grupo);
$stmt->execute();
$result = $stmt->get_result();

$datos = [];
while($row = $result->fetch_assoc()) {
    $datos[] = $row;
}

echo json_encode($datos);
?>