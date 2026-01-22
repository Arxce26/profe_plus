<?php
// C:/xampp/htdocs/profe_plus/profeplus-api/get_grupos.php
require_once 'conexion.php';
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

$id_profesor = $_GET['id_profesor'] ?? 0;
// Verificamos si piden los archivados (1) o los activos (0, por defecto)
$ver_archivados = isset($_GET['archivados']) && $_GET['archivados'] == '1' ? 1 : 0;

// La lógica es inversa en la BD: activo=1 (visible), activo=0 (archivado)
$estado_buscado = $ver_archivados ? 0 : 1;

if ($id_profesor == 0) { echo json_encode([]); exit; }

$sql = "SELECT id_grupo, nombre, nivel_educativo, ciclo_escolar 
        FROM grupos 
        WHERE id_profesor = ? AND deleted = 0 AND activo = ? 
        ORDER BY nombre ASC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $id_profesor, $estado_buscado);
$stmt->execute();
$result = $stmt->get_result();

$grupos = [];
while ($row = $result->fetch_assoc()) {
    $grupos[] = $row;
}

echo json_encode($grupos);
?>