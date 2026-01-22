<?php
// C:/xampp/htdocs/profe_plus/profeplus-api/login.php
require_once 'conexion.php';
header("Content-Type: application/json");

// Leer los datos que envía React (JSON)
$input = json_decode(file_get_contents("php://input"), true);
$email = $input['email'] ?? '';
$password = $input['password'] ?? '';

if (empty($email) || empty($password)) {
    echo json_encode(["success" => false, "message" => "Faltan datos"]);
    exit;
}

// Buscar al profesor por email
$stmt = $conn->prepare("SELECT id_profesor, nombre, password_hash FROM profesores WHERE email = ? AND deleted = 0");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $profesor = $result->fetch_assoc();
    
    // --- TRUCO DE DESARROLLO ---
    // Si la contraseña en la BD está vacía (o es el texto dummy), la actualizamos con la que enviaste encriptada
    // Esto es para que definas tu contraseña "12345" en el primer login.
    if (strlen($profesor['password_hash']) < 20) {
        $nuevo_hash = password_hash($password, PASSWORD_DEFAULT);
        $update = $conn->prepare("UPDATE profesores SET password_hash = ? WHERE id_profesor = ?");
        $update->bind_param("si", $nuevo_hash, $profesor['id_profesor']);
        $update->execute();
        
        // Login exitoso automático
        echo json_encode([
            "success" => true,
            "message" => "Contraseña configurada exitosamente. ¡Bienvenida!",
            "user" => ["id" => $profesor['id_profesor'], "nombre" => $profesor['nombre']]
        ]);
        exit;
    }
    // ---------------------------

    // Verificación REAL de seguridad
    if (password_verify($password, $profesor['password_hash'])) {
        echo json_encode([
            "success" => true,
            "message" => "Login correcto",
            "user" => ["id" => $profesor['id_profesor'], "nombre" => $profesor['nombre']]
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "Contraseña incorrecta"]);
    }

} else {
    echo json_encode(["success" => false, "message" => "Usuario no encontrado"]);
}
?>