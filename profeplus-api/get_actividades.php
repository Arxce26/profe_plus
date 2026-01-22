<?php
// C:/xampp/htdocs/profe_plus/profeplus-api/get_actividades.php
require_once 'conexion.php';
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

$id_grupo = $_GET['id_grupo'] ?? 0;

if ($id_grupo == 0) {
    echo json_encode([]);
    exit;
}

// Las actividades se asocian al Rubro (id_rubro) que a su vez se asocia al Grupo.
// Hacemos un JOIN para asegurar que las actividades pertenecen a los rubros de ese grupo.
$sql = "SELECT 
            a.id_actividad, 
            a.id_rubro, 
            a.nombre, 
            a.fecha_entrega, 
            a.puntaje_maximo 
        FROM actividades a
        JOIN rubros r ON a.id_rubro = r.id_rubro
        WHERE r.id_grupo = ? AND a.deleted = 0
        ORDER BY a.fecha_entrega DESC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id_grupo);
$stmt->execute();
$result = $stmt->get_result();

$actividades = [];
while ($row = $result->fetch_assoc()) {
    $actividades[] = $row;
}

echo json_encode($actividades);
?>