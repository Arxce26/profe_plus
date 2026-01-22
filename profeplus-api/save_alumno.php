<?php
require_once 'conexion.php';
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");

$data = json_decode(file_get_contents("php://input"));

if(isset($data->id_alumno) && $data->id_alumno > 0) {
    // --- MODO EDICIÓN ---
    $sql = "UPDATE alumnos SET nombre=?, apellidos=?, codigo_escolar=? WHERE id_alumno=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssi", $data->nombre, $data->apellidos, $data->codigo_escolar, $data->id_alumno);
} else {
    // --- MODO CREACIÓN (NUEVO) ---
    $sql = "INSERT INTO alumnos (uuid, id_grupo, nombre, apellidos, codigo_escolar) VALUES (UUID(), ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("isss", $data->id_grupo, $data->nombre, $data->apellidos, $data->codigo_escolar);
}

if($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "message" => $stmt->error]);
}
?>