<?php
require_once 'conexion.php';
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

$id_grupo = $_GET['id_grupo'];
$fecha_inicio = $_GET['fecha_inicio'];
$fecha_fin = $_GET['fecha_fin'];

// Esta consulta es "inteligente":
// Cuenta cuántos Presentes, Faltas y Retardos tiene cada alumno
// SOLO dentro del rango de fechas que pedimos.
$sql = "SELECT 
            a.nombre, 
            a.apellidos, 
            a.codigo_escolar,
            SUM(CASE WHEN asis.estado = 'Presente' THEN 1 ELSE 0 END) as presentes,
            SUM(CASE WHEN asis.estado = 'Falta' THEN 1 ELSE 0 END) as faltas,
            SUM(CASE WHEN asis.estado = 'Retardo' THEN 1 ELSE 0 END) as retardos,
            COUNT(asis.id_asistencia) as total_registrados
        FROM alumnos a
        LEFT JOIN asistencia asis 
            ON a.id_alumno = asis.id_alumno 
            AND asis.fecha BETWEEN ? AND ?
            AND asis.id_grupo = ?
        WHERE a.id_grupo = ?
        GROUP BY a.id_alumno
        ORDER BY a.apellidos ASC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ssii", $fecha_inicio, $fecha_fin, $id_grupo, $id_grupo);
$stmt->execute();
$result = $stmt->get_result();

$datos = [];
while($row = $result->fetch_assoc()) {
    // Calculamos el porcentaje aquí mismo para facilitar las cosas
    $total_clases = $row['presentes'] + $row['faltas'] + $row['retardos'];
    // Si no hubo clases, evitamos dividir por cero
    $porcentaje = $total_clases > 0 ? round(($row['presentes'] / $total_clases) * 100) : 0;
    
    $row['porcentaje'] = $porcentaje;
    $datos[] = $row;
}

echo json_encode($datos);
?>