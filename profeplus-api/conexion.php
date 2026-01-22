<?php
// Permisos vitales para que React (puerto 5173) hable con XAMPP (puerto 80)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Allow: GET, POST, OPTIONS, PUT, DELETE");

// Si es una petición de verificación (OPTIONS), terminamos aquí para no procesar más
if($_SERVER["REQUEST_METHOD"] == "OPTIONS") { die(); }

$host = "localhost";
$user = "root";
$pass = ""; // ¿Tu XAMPP tiene contraseña? Si no, déjalo vacío "".
$db   = "profe_plus";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    // IMPORTANTE: Devolvemos error JSON, no texto plano, para que React no explote
    die(json_encode(["error" => "Conexión fallida: " . $conn->connect_error]));
}
$conn->set_charset("utf8mb4");
?>