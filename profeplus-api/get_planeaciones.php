<?php
require_once 'conexion.php';
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

$id_grupo = $_GET['id_grupo'];
$sql = "SELECT * FROM planeaciones WHERE id_grupo = ? ORDER BY id_planeacion DESC";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id_grupo);
$stmt->execute();
$result = $stmt->get_result();

$data = [];
while($row = $result->fetch_assoc()) $data[] = $row;
echo json_encode($data);
?>