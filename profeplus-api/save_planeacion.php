<?php
require_once 'conexion.php';
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");

$data = json_decode(file_get_contents("php://input"));

if(isset($data->id_planeacion) && $data->id_planeacion > 0) {
    // Editar
    $sql = "UPDATE planeaciones SET semana_o_fecha=?, tema=?, objetivo=?, inicio=?, desarrollo=?, cierre=?, materiales=?, evaluacion=? WHERE id_planeacion=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssssssssi", $data->semana, $data->tema, $data->objetivo, $data->inicio, $data->desarrollo, $data->cierre, $data->materiales, $data->evaluacion, $data->id_planeacion);
} else {
    // Crear
    $sql = "INSERT INTO planeaciones (id_profesor, id_grupo, semana_o_fecha, tema, objetivo, inicio, desarrollo, cierre, materiales, evaluacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("iissssssss", $data->id_profesor, $data->id_grupo, $data->semana, $data->tema, $data->objetivo, $data->inicio, $data->desarrollo, $data->cierre, $data->materiales, $data->evaluacion);
}

if($stmt->execute()) echo json_encode(["success" => true]);
else echo json_encode(["success" => false, "message" => $stmt->error]);
?>