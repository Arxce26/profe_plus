<?php
// C:/xampp/htdocs/profe_plus/profeplus-api/get_calificaciones.php
require_once 'conexion.php';
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

$id_actividad = $_GET['id_actividad'] ?? 0;

if ($id_actividad == 0) {
    echo json_encode([]);
    exit;
}

// Traemos las calificaciones (puntaje) asociadas a una actividad y el alumno que la recibió
$sql = "SELECT id_alumno, calificacion FROM calificaciones WHERE id_actividad = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id_actividad);
$stmt->execute();
$result = $stmt->get_result();

$calificaciones = [];
while ($row = $result->fetch_assoc()) {
    // Formato clave-valor: { "1": 9.5, "2": 7.8, ... }
    $calificaciones[$row['id_alumno']] = floatval($row['calificacion']);
}

// Devolvemos el objeto mapeado
echo json_encode($calificaciones);
?>