<?php
// C:/xampp/htdocs/profe_plus/profeplus-api/get_promedio_ponderado.php
require_once 'conexion.php';
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

$id_grupo = $_GET['id_grupo'] ?? 0;

if ($id_grupo == 0) {
    echo json_encode([]);
    exit;
}

// Consulta para calcular el promedio final ponderado por alumno y por grupo.
// Lógica: Suma ( (PuntajeObtenido / PuntajeMaximo) * PorcentajeRubro )
$sql = "
    SELECT 
        a.id_alumno,
        a.nombre,
        a.apellidos,
        SUM(
            -- Calificación Normalizada (0 a 1) * Porcentaje del Rubro (0 a 100)
            (c.calificacion / act.puntaje_maximo) * r.porcentaje 
        ) AS promedio_ponderado
    FROM alumnos a
    LEFT JOIN calificaciones c ON a.id_alumno = c.id_alumno
    LEFT JOIN actividades act ON c.id_actividad = act.id_actividad
    LEFT JOIN rubros r ON act.id_rubro = r.id_rubro
    WHERE a.id_grupo = ? 
    GROUP BY a.id_alumno
    ORDER BY promedio_ponderado DESC
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id_grupo);
$stmt->execute();
$result = $stmt->get_result();

$datos = [];
while($row = $result->fetch_assoc()) {
    $datos[] = [
        'id_alumno' => $row['id_alumno'],
        'nombre_completo' => $row['apellidos'] . ' ' . $row['nombre'],
        // Redondeamos el promedio a dos decimales
        'promedio' => round(floatval($row['promedio_ponderado']), 2) 
    ];
}

echo json_encode($datos);
?>