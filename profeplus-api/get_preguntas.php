<?php
// C:/xampp/htdocs/profe_plus/profeplus-api/get_preguntas.php
require_once 'conexion.php';
header("Content-Type: application/json");

// Traemos las preguntas junto con el nombre del tema
$sql = "SELECT p.id_pregunta, p.enunciado, p.latex_formula, p.tipo, p.dificultad, t.nombre as tema 
        FROM preguntas p
        JOIN temas t ON p.id_tema = t.id_tema
        WHERE p.deleted = 0";

$result = $conn->query($sql);

$preguntas = [];
while ($row = $result->fetch_assoc()) {
    $preguntas[] = $row;
}

echo json_encode($preguntas);
?>