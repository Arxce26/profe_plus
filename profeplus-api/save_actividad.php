<?php
// C:/xampp/htdocs/profe_plus/profeplus-api/save_actividad.php
require_once 'conexion.php';
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");

$data = json_decode(file_get_contents("php://input"));

if(!$data) { exit(json_encode(["success"=>false, "message" => "Datos incompletos."])); }

// Asumimos que $data contiene: id_rubro, nombre, fecha_entrega, puntaje_maximo, y un opcional id_actividad para edición.

if (isset($data->id_actividad) && $data->id_actividad > 0) {
    // MODO EDICIÓN
    $sql = "UPDATE actividades SET id_rubro=?, nombre=?, fecha_entrega=?, puntaje_maximo=? WHERE id_actividad=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("issdi", $data->id_rubro, $data->nombre, $data->fecha_entrega, $data->puntaje_maximo, $data->id_actividad);
} else {
    // MODO CREACIÓN
    $sql = "INSERT INTO actividades (uuid, id_rubro, nombre, fecha_entrega, puntaje_maximo) VALUES (UUID(), ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("issd", $data->id_rubro, $data->nombre, $data->fecha_entrega, $data->puntaje_maximo);
}

if($stmt->execute()) {
    echo json_encode(["success" => true, "id" => $conn->insert_id]);
} else {
    echo json_encode(["success" => false, "message" => "Error SQL: " . $stmt->error]);
}
?>