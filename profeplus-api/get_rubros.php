<?php
// C:/xampp/htdocs/profe_plus/profeplus-api/get_rubros.php
require_once 'conexion.php';
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

$id_grupo = $_GET['id_grupo'] ?? 0;

if ($id_grupo == 0) {
    echo json_encode([]);
    exit;
}

// Traemos los rubros por grupo, ordenados por porcentaje
$sql = "SELECT id_rubro, nombre, porcentaje 
        FROM rubros 
        WHERE id_grupo = ? AND deleted = 0 
        ORDER BY porcentaje DESC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id_grupo);
$stmt->execute();
$result = $stmt->get_result();

$rubros = [];
while ($row = $result->fetch_assoc()) {
    $rubros[] = $row;
}

echo json_encode($rubros);
?>