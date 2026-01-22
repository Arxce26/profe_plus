<?php
// C:/xampp/htdocs/profe_plus/profeplus-api/get_alumnos.php
require_once 'conexion.php';
header("Content-Type: application/json");

$id_grupo = $_GET['id_grupo'] ?? 0;

if ($id_grupo == 0) {
    echo json_encode([]);
    exit;
}

// Traemos a los alumnos ordenados por apellidos
$sql = "SELECT id_alumno, nombre, apellidos, codigo_escolar 
        FROM alumnos 
        WHERE id_grupo = ? AND deleted = 0 
        ORDER BY apellidos ASC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id_grupo);
$stmt->execute();
$result = $stmt->get_result();

$alumnos = [];
while ($row = $result->fetch_assoc()) {
    $alumnos[] = $row;
}

echo json_encode($alumnos);
?>