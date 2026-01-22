<?php
// C:/xampp/htdocs/profe_plus/profeplus-api/chatbot_webhook.php
require_once 'conexion.php';
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

// --- SIMULACIÓN DE DATOS RECIBIDOS POR WEBHOOK ---
// ASUME que el webhook de WhatsApp envía un JSON con 'sender_phone', 'message_type', 'text_message', y 'file_url'/'file_name'.
$data = json_decode(file_get_contents("php://input"), true);

$profesor_whatsapp_number = $data['sender_phone'] ?? '1234567890'; // Número del profesor
$texto_recibido = trim($data['text_message'] ?? ''); 
$es_archivo = ($data['message_type'] ?? 'text') === 'file';
$nombre_archivo_profesor = $data['file_name'] ?? ''; 
$archivo_url_temporal = $data['file_url'] ?? ''; 
$mensaje_bot = "";
$log_status = "";

// ------------------------------------------
// 1. VERIFICACIÓN DE SESIÓN DEL PROFESOR
// ------------------------------------------
$sql_session = "SELECT s.id_profesor, s.is_authenticated, p.email, p.password_hash 
                FROM profesor_sessions s 
                JOIN profesores p ON s.id_profesor = p.id_profesor
                WHERE s.whatsapp_number = ?";
$stmt_session = $conn->prepare($sql_session);
$stmt_session->bind_param("s", $profesor_whatsapp_number);
$stmt_session->execute();
$result_session = $stmt_session->get_result();
$session_info = $result_session->fetch_assoc();

$isAuthenticated = $session_info['is_authenticated'] ?? 0;
$id_profesor = $session_info['id_profesor'] ?? 0;

// ------------------------------------------
// 2. LÓGICA DE AUTENTICACIÓN (SI NO ESTÁ LOGUEADO)
// ------------------------------------------
if (!$isAuthenticated) {
    // Si la sesión existe, pero no está autenticada, pedimos credenciales
    if ($session_info) {
        // Asumimos que el profesor responde: "email contraseña"
        $parts = explode(' ', $texto_recibido);
        if (count($parts) === 2) {
            $email_login = $parts[0];
            $password_login = $parts[1];

            // Buscar en tabla profesores
            $sql_login = "SELECT id_profesor, password_hash FROM profesores WHERE email = ?";
            $stmt_login = $conn->prepare($sql_login);
            $stmt_login->bind_param("s", $email_login);
            $stmt_login->execute();
            $user_result = $stmt_login->get_result();
            $user_info = $user_result->fetch_assoc();

            if ($user_info && password_verify($password_login, $user_info['password_hash'])) {
                // Éxito: Actualizar sesión a autenticado
                $sql_update = "UPDATE profesor_sessions SET is_authenticated = 1, id_profesor = ? WHERE whatsapp_number = ?";
                $stmt_update = $conn->prepare($sql_update);
                $stmt_update->bind_param("is", $user_info['id_profesor'], $profesor_whatsapp_number);
                $stmt_update->execute();
                
                $mensaje_bot = "✅ Autenticación exitosa. ¡Bienvenido a ProfePlus! Ahora puedes reenviar archivos PDF con el formato: NombreAlumno_Tarea_Grupo.pdf";
                $isAuthenticated = 1; // Actualizar estado para la ejecución actual
            } else {
                $mensaje_bot = "❌ Credenciales incorrectas. Intenta de nuevo: [email] [contraseña].";
            }
        } else {
            $mensaje_bot = "✋ ¡Hola! Necesitas iniciar sesión. Responde con tu correo y contraseña institucional, separados por un espacio (ej: samai@escuela.edu.mx ArcS4m).";
        }
    } else {
        // Primera interacción: Crear sesión temporal y pedir datos
        $sql_insert_session = "INSERT INTO profesor_sessions (whatsapp_number) VALUES (?)";
        $stmt_insert = $conn->prepare($sql_insert_session);
        $stmt_insert->bind_param("s", $profesor_whatsapp_number);
        $stmt_insert->execute();
        $mensaje_bot = "✋ ¡Hola! Necesitas iniciar sesión. Responde con tu correo y contraseña institucional, separados por un espacio (ej: samai@escuela.edu.mx ArcS4m).";
    }

    if (!$isAuthenticated) {
        // Salir si el login falló o está pendiente
        exit(json_encode(["status" => "pending_auth", "response_message" => $mensaje_bot]));
    }
}

// ------------------------------------------
// 3. PROCESAR TAREA (SOLO SI ESTÁ AUTENTICADO Y ES UN ARCHIVO)
// ------------------------------------------
if ($isAuthenticated && $es_archivo && !empty($nombre_archivo_profesor)) {

    $base_name = pathinfo($nombre_archivo_profesor, PATHINFO_FILENAME);
    $parts = explode('_', $base_name);

    if (count($parts) < 3) {
        $mensaje_bot = "❌ Formato de archivo incorrecto. Debe ser: NombreAlumno_Tarea_Grupo.pdf. Tarea no registrada.";
        goto final_response;
    }

    $alumno_buscado = $parts[0]; 
    $actividad_buscada = $parts[1]; 
    $grupo_buscado_corto = $parts[2]; 

    // Búsqueda de IDs (Misma lógica de búsqueda compleja)
    $sql_find = "
        SELECT a.id_alumno, act.id_actividad
        FROM alumnos a
        JOIN grupos g ON a.id_grupo = g.id_grupo
        JOIN rubros r ON g.id_grupo = r.id_rubro
        JOIN actividades act ON r.id_rubro = act.id_rubro
        WHERE g.id_profesor = ? 
          AND g.nombre LIKE CONCAT('%', ?, '%')
          AND REPLACE(CONCAT(a.nombre, a.apellidos), ' ', '') LIKE CONCAT('%', ?, '%')
          AND act.nombre LIKE CONCAT('%', ?, '%')
        LIMIT 1
    ";
    
    $stmt_find = $conn->prepare($sql_find);
    $alumno_like = "%" . str_replace(' ', '%', $alumno_buscado) . "%";
    $actividad_like = "%" . str_replace(' ', '%', $actividad_buscada) . "%";

    $stmt_find->bind_param("isss", $id_profesor, $grupo_buscado_corto, $alumno_like, $actividad_like);
    $stmt_find->execute();
    $result_find = $stmt_find->get_result();
    $info_entrega = $result_find->fetch_assoc();

    if (!$info_entrega) {
        $mensaje_bot = "❌ No pude identificar al alumno, la actividad o el grupo. Revisa el formato (NombreAlumno_Tarea_Grupo.pdf).";
    } else {
        $id_alumno = $info_entrega['id_alumno'];
        $id_actividad = $info_entrega['id_actividad'];

        // Verificación de Entrega Única
        $sql_check = "SELECT url_archivo FROM calificaciones WHERE id_alumno = ? AND id_actividad = ?";
        $stmt_check = $conn->prepare($sql_check);
        $stmt_check->bind_param("ii", $id_alumno, $id_actividad);
        $stmt_check->execute();
        $result_check = $stmt_check->get_result();

        if ($result_check->num_rows > 0 && !empty($result_check->fetch_assoc()['url_archivo'])) {
            $mensaje_bot = "❌ Tarea ya entregada. Solo se permite una entrega única. Tarea no registrada.";
        } else {
            // **IMPORTANTE:** Aquí iría la lógica de descarga/guardado del archivo
            $url_archivo = "submissions/" . $nombre_archivo_profesor; 
            
            // Guardar/Actualizar en la tabla calificaciones (usando ON DUPLICATE KEY UPDATE)
            $sql_save = "
                INSERT INTO calificaciones (uuid, id_alumno, id_actividad, url_archivo, fecha_entrega) 
                VALUES (UUID(), ?, ?, ?, NOW())
                ON DUPLICATE KEY UPDATE url_archivo = VALUES(url_archivo), fecha_entrega = NOW()
            ";
            $stmt_save = $conn->prepare($sql_save);
            $stmt_save->bind_param("iis", $id_alumno, $id_actividad, $url_archivo);
            
            if ($stmt_save->execute()) {
                $mensaje_bot = "✅ Tarea registrada en ProfePlus para el alumno {$alumno_buscado}. ¡Guardado!";
            } else {
                $mensaje_bot = "❌ Error en la base de datos al guardar la calificación.";
            }
        }
    }
}
// ------------------------------------------
// 4. RESPUESTA FINAL
// ------------------------------------------
final_response:
if (empty($mensaje_bot)) {
    // Si no fue un archivo y ya estaba autenticado
    $mensaje_bot = "Comando no reconocido. Prueba reenviando un archivo con el formato correcto o pide ayuda.";
}

echo json_encode(["status" => "success", "response_message" => $mensaje_bot]);

?>