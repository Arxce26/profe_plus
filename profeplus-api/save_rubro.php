<?php
// C:/xampp/htdocs/profe_plus/profeplus-api/save_rubro.php
require_once 'conexion.php';
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");

$data = json_decode(file_get_contents("php://input"));

if(!$data) { exit(json_encode(["success"=>false, "message" => "Datos incompletos."])); }

$id_grupo = $data->id_grupo;
$nombre = $data->nombre;
$porcentaje = floatval($data->porcentaje);
// Asumimos que id_periodo está disponible o se puede inferir del grupo/profesor, 
// pero para simplificar por ahora, lo dejaremos fuera del INSERT y lo haremos Nullable.

// Validar que la suma no exceda 100% (Consulta de seguridad, opcional pero recomendable)
$sql_check = "SELECT SUM(porcentaje) as total FROM rubros WHERE id_grupo = ?";
$stmt_check = $conn->prepare($sql_check);
$stmt_check->bind_param("i", $id_grupo);
$stmt_check->execute();
$result_check = $stmt_check->get_result();
$row_check = $result_check->fetch_assoc();
$total_actual = $row_check['total'] ?? 0;

$id_rubro = $data->id_rubro ?? 0;
$porcentaje_actual_rubro = 0;

if ($id_rubro > 0) {
    // Si estamos editando, restar el porcentaje actual del rubro para la validación
    $sql_current = "SELECT porcentaje FROM rubros WHERE id_rubro = ?";
    $stmt_current = $conn->prepare($sql_current);
    $stmt_current->bind_param("i", $id_rubro);
    $stmt_current->execute();
    $result_current = $stmt_current->get_result();
    if ($row_current = $result_current->fetch_assoc()) {
        $porcentaje_actual_rubro = floatval($row_current['porcentaje']);
        $total_actual -= $porcentaje_actual_rubro;
    }
}

if (($total_actual + $porcentaje) > 100) {
    echo json_encode(["success" => false, "message" => "Error: La suma de porcentajes excedería el 100%."]);
    exit;
}


if ($id_rubro > 0) {
    // MODO EDICIÓN
    $sql = "UPDATE rubros SET nombre=?, porcentaje=? WHERE id_rubro=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sdi", $nombre, $porcentaje, $id_rubro);
} else {
    // MODO CREACIÓN (Asumimos id_periodo existe o es NULL)
    $sql = "INSERT INTO rubros (uuid, id_grupo, id_periodo, nombre, porcentaje) VALUES (UUID(), ?, (SELECT id_periodo FROM periodos WHERE id_profesor = (SELECT id_profesor FROM grupos WHERE id_grupo = ?) AND activo = 1 LIMIT 1), ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("isd", $id_grupo, $id_grupo, $nombre, $porcentaje);
}

if($stmt->execute()) {
    echo json_encode(["success" => true, "id" => $conn->insert_id]);
} else {
    echo json_encode(["success" => false, "message" => "Error SQL: " . $stmt->error]);
}
?>