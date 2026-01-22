<?php
require_once 'conexion.php';
header("Content-Type: application/json");

$sql = "SELECT id_profesor, nombre, escuela_nombre FROM profesores WHERE deleted = 0";
$result = $conn->query($sql);

$profesores = [];
while ($row = $result->fetch_assoc()) {
    $profesores[] = $row;
}

echo json_encode($profesores);
?>