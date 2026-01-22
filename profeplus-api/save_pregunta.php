<?php
// C:/xampp/htdocs/profe_plus/profeplus-api/save_pregunta.php
require_once 'conexion.php';
header("Content-Type: application/json");
// Permisos para que React pueda enviar datos
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");

// Recibimos los datos en formato JSON
$data = json_decode(file_get_contents("php://input"));

if(!$data) {
    echo json_encode(["success" => false, "message" => "No llegaron datos"]);
    exit;
}

// Extraemos las variables
$id_tema = $data->id_tema;
$enunciado = $data->enunciado;
$formula = $data->latex_formula; // Puede venir vacío
$dificultad = $data->dificultad;

// Insertamos en la base de datos (usando UUID() automático)
$sql = "INSERT INTO preguntas (uuid, id_tema, enunciado, latex_formula, tipo, dificultad, deleted) 
        VALUES (UUID(), ?, ?, ?, 'Abierta', ?, 0)";

$stmt = $conn->prepare($sql);
// "isss" significa: entero, string, string, string
$stmt->bind_param("isss", $id_tema, $enunciado, $formula, $dificultad);

if($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "¡Pregunta creada con éxito!"]);
} else {
    echo json_encode(["success" => false, "message" => "Error SQL: " . $stmt->error]);
}
?>