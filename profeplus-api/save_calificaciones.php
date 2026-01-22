<?php
// C:/xampp/htdocs/profe_plus/profeplus-api/save_calificaciones.php
require_once 'conexion.php';
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");

$data = json_decode(file_get_contents("php://input"));

if(!$data || !isset($data->id_actividad) || !isset($data->calificaciones)) { 
    exit(json_encode(["success" => false, "message" => "Datos incompletos para calificar."])); 
}

$id_actividad = $data->id_actividad;
$calificaciones_lista = $data->calificaciones; // Array de { id_alumno: puntaje }

$conn->begin_transaction(); // Asegurar que todo se guarde o nada

try {
    // Definimos las sentencias que usaremos: UPDATE y INSERT
    // 1. UPDATE: Si la calificación ya existe
    $sql_update = "UPDATE calificaciones SET calificacion=? WHERE id_alumno=? AND id_actividad=?";
    $stmt_update = $conn->prepare($sql_update);
    
    // 2. INSERT: Si la calificación es nueva
    $sql_insert = "INSERT INTO calificaciones (uuid, id_alumno, id_actividad, calificacion) VALUES (UUID(), ?, ?, ?)";
    $stmt_insert = $conn->prepare($sql_insert);
    
    $calificaciones_guardadas = 0;

    foreach ($calificaciones_lista as $item) {
        $id_alumno = $item->id_alumno;
        $puntaje = $item->puntaje;

        // Primero, intentar actualizar (si ya calificamos a este alumno en esta actividad)
        $stmt_update->bind_param("dii", $puntaje, $id_alumno, $id_actividad);
        $stmt_update->execute();

        // Si no se actualizó ninguna fila, significa que es la primera vez que se califica
        if ($conn->affected_rows === 0) {
            $stmt_insert->bind_param("iid", $id_alumno, $id_actividad, $puntaje);
            $stmt_insert->execute();
        }
        $calificaciones_guardadas++;
    }

    $conn->commit();
    echo json_encode(["success" => true, "message" => "¡Calificaciones guardadas!", "total" => $calificaciones_guardadas]);
    
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(["success" => false, "message" => "Error al guardar calificaciones: " . $e->getMessage()]);
}

$stmt_update->close();
$stmt_insert->close();
?>