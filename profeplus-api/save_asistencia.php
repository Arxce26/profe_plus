<?php
// save_asistencia.php
require_once 'conexion.php';
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");

$data = json_decode(file_get_contents("php://input"));

if(!$data) { exit(json_encode(["success"=>false])); }

$fecha = $data->fecha;
$grupo_id = $data->grupo_id;
$lista = $data->lista; // Array de objetos {id_alumno, estado}

foreach($lista as $item) {
    // Verificamos si ya existe registro de ese alumno en esa fecha (para no duplicar)
    // Si existe, lo actualizamos. Si no, insertamos.
    // NOTA: Para simplificar este ejemplo, hacemos un INSERT directo. 
    // En producción idealmente harías un "INSERT ... ON DUPLICATE KEY UPDATE".
    
    // Primero borramos si ya había algo ese día para ese alumno (re-pase de lista)
    $sqlDelete = "DELETE FROM asistencia WHERE id_alumno = ? AND fecha = ?";
    $stmtDel = $conn->prepare($sqlDelete);
    $stmtDel->bind_param("is", $item->id_alumno, $fecha);
    $stmtDel->execute();

    // Insertamos el nuevo estado
    $sql = "INSERT INTO asistencia (uuid, id_alumno, id_grupo, fecha, estado) VALUES (UUID(), ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("iiss", $item->id_alumno, $grupo_id, $fecha, $item->estado);
    $stmt->execute();
}

echo json_encode(["success" => true, "message" => "Asistencia guardada correctamente"]);
?>