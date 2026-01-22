-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 09-01-2026 a las 03:03:18
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `profeplus`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `actividades`
--

CREATE TABLE `actividades` (
  `id_actividad` int(11) NOT NULL,
  `uuid` char(36) NOT NULL,
  `id_rubro` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `fecha_entrega` date DEFAULT NULL,
  `puntaje_maximo` decimal(5,2) DEFAULT 10.00,
  `last_modified` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `actividades`
--

INSERT INTO `actividades` (`id_actividad`, `uuid`, `id_rubro`, `nombre`, `fecha_entrega`, `puntaje_maximo`, `last_modified`, `deleted`) VALUES
(1, '490d8bec-d8ad-11f0-a445-f89e94d9fd77', 4, 'Examen Unidad 1 - Límites y Continuidad', '2026-03-15', 10.00, '2025-12-14 05:25:18', 0),
(2, '490e7a6b-d8ad-11f0-a445-f89e94d9fd77', 5, 'Proyecto Aplicado de Optimización', '2026-05-20', 10.00, '2025-12-14 05:25:18', 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `agenda`
--

CREATE TABLE `agenda` (
  `id_agenda` int(11) NOT NULL,
  `uuid` char(36) NOT NULL,
  `id_grupo` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `tema_clase` varchar(200) DEFAULT NULL,
  `actividades_clase` text DEFAULT NULL,
  `recursos_url` text DEFAULT NULL,
  `completada` tinyint(1) DEFAULT 0,
  `last_modified` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `agenda`
--

INSERT INTO `agenda` (`id_agenda`, `uuid`, `id_grupo`, `fecha`, `tema_clase`, `actividades_clase`, `recursos_url`, `completada`, `last_modified`, `deleted`) VALUES
(1, '5c3e5179-d8ad-11f0-a445-f89e94d9fd77', 2, '2026-02-01', 'Introducción a la Derivada', 'Exposición del concepto, Ejercicios 1-5 del libro.', NULL, 0, '2025-12-14 05:25:51', 0),
(2, '5c3ec373-d8ad-11f0-a445-f89e94d9fd77', 2, '2026-02-03', 'Regla de la Cadena', 'Práctica guiada en pizarrón, Pequeño cuestionario al final.', NULL, 0, '2025-12-14 05:25:51', 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `alumnos`
--

CREATE TABLE `alumnos` (
  `id_alumno` int(11) NOT NULL,
  `uuid` char(36) NOT NULL,
  `id_grupo` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `codigo_escolar` varchar(50) DEFAULT NULL,
  `correo_contacto` varchar(100) DEFAULT NULL,
  `telefono_contacto` varchar(20) DEFAULT NULL,
  `last_modified` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `alumnos`
--

INSERT INTO `alumnos` (`id_alumno`, `uuid`, `id_grupo`, `nombre`, `apellidos`, `codigo_escolar`, `correo_contacto`, `telefono_contacto`, `last_modified`, `deleted`) VALUES
(1, '6c4e4d67-d6fc-11f0-a445-f89e94d9fd77', 1, 'Juan', 'Pérez López', '2025001', NULL, NULL, '2025-12-12 01:46:48', 0),
(2, '6c4e6cf5-d6fc-11f0-a445-f89e94d9fd77', 1, 'María', 'González Ruiz', '2025002', NULL, NULL, '2025-12-12 01:46:48', 0),
(3, '6c4e6ecd-d6fc-11f0-a445-f89e94d9fd77', 1, 'Pedro', 'Ramírez Díaz', '2025003', NULL, NULL, '2025-12-12 01:46:48', 0),
(4, '84b307f0-d940-11f0-a445-f89e94d9fd77', 2, 'Marcos', 'Pérez', '2026101', NULL, NULL, '2025-12-14 22:59:12', 0),
(5, '84bb0f9c-d940-11f0-a445-f89e94d9fd77', 2, 'Sofía', 'García', '2026102', NULL, NULL, '2025-12-14 22:59:12', 0),
(6, '84bb2115-d940-11f0-a445-f89e94d9fd77', 2, 'Luis', 'Hernández', '2026103', NULL, NULL, '2025-12-14 22:59:12', 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asistencia`
--

CREATE TABLE `asistencia` (
  `id_asistencia` int(11) NOT NULL,
  `uuid` char(36) NOT NULL,
  `id_alumno` int(11) NOT NULL,
  `id_grupo` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `estado` enum('Presente','Falta','Retardo','Justificado') NOT NULL,
  `nota` text DEFAULT NULL,
  `last_modified` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `asistencia`
--

INSERT INTO `asistencia` (`id_asistencia`, `uuid`, `id_alumno`, `id_grupo`, `fecha`, `estado`, `nota`, `last_modified`, `deleted`) VALUES
(1, '6d5f66c0-d6fc-11f0-a445-f89e94d9fd77', 1, 1, '2025-12-11', 'Presente', NULL, '2025-12-12 01:46:50', 0),
(2, '6d5fbe1c-d6fc-11f0-a445-f89e94d9fd77', 2, 1, '2025-12-11', 'Presente', NULL, '2025-12-12 01:46:50', 0),
(3, '6d5fbf9e-d6fc-11f0-a445-f89e94d9fd77', 3, 1, '2025-12-11', 'Presente', NULL, '2025-12-12 01:46:50', 0),
(19, 'f1c5860e-d89b-11f0-a445-f89e94d9fd77', 1, 1, '2025-12-14', 'Presente', NULL, '2025-12-14 03:21:11', 0),
(20, 'f1c6ac43-d89b-11f0-a445-f89e94d9fd77', 2, 1, '2025-12-14', 'Presente', NULL, '2025-12-14 03:21:11', 0),
(21, 'f1c78831-d89b-11f0-a445-f89e94d9fd77', 3, 1, '2025-12-14', 'Falta', NULL, '2025-12-14 03:21:11', 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `calificaciones`
--

CREATE TABLE `calificaciones` (
  `id_calificacion` int(11) NOT NULL,
  `uuid` char(36) NOT NULL,
  `id_alumno` int(11) NOT NULL,
  `id_actividad` int(11) NOT NULL,
  `calificacion` decimal(5,2) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `last_modified` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `calificaciones`
--

INSERT INTO `calificaciones` (`id_calificacion`, `uuid`, `id_alumno`, `id_actividad`, `calificacion`, `observaciones`, `last_modified`, `deleted`) VALUES
(6, '4f3e17e1-d8ad-11f0-a445-f89e94d9fd77', 1, 1, 8.50, 'Buen enfoque, faltó detalle en la conclusión.', '2025-12-14 05:25:29', 0),
(7, '4f3e34d5-d8ad-11f0-a445-f89e94d9fd77', 2, 1, 9.20, 'Creativo y bien presentado.', '2025-12-14 05:25:29', 0),
(8, '4f3e369e-d8ad-11f0-a445-f89e94d9fd77', 3, 1, 7.00, 'Entregó tarde.', '2025-12-14 05:25:29', 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `grupos`
--

CREATE TABLE `grupos` (
  `id_grupo` int(11) NOT NULL,
  `uuid` char(36) NOT NULL,
  `id_profesor` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `nivel_educativo` enum('Secundaria','Bachillerato','Universidad') NOT NULL,
  `ciclo_escolar` varchar(50) DEFAULT NULL,
  `last_modified` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted` tinyint(1) DEFAULT 0,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `grupos`
--

INSERT INTO `grupos` (`id_grupo`, `uuid`, `id_profesor`, `nombre`, `nivel_educativo`, `ciclo_escolar`, `last_modified`, `deleted`, `activo`) VALUES
(1, '6c4bdb23-d6fc-11f0-a445-f89e94d9fd77', 2, '1º A - Álgebra Básica', 'Secundaria', '2025-2026', '2025-12-14 03:53:16', 0, 0),
(2, '6c4bf7d8-d6fc-11f0-a445-f89e94d9fd77', 2, '3º C - Cálculo Diferencial', 'Bachillerato', '2025-2026', '2025-12-13 04:46:01', 0, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `opciones_pregunta`
--

CREATE TABLE `opciones_pregunta` (
  `id_opcion` int(11) NOT NULL,
  `uuid` char(36) NOT NULL,
  `id_pregunta` int(11) NOT NULL,
  `texto_opcion` text NOT NULL,
  `es_correcta` tinyint(1) DEFAULT 0,
  `last_modified` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `opciones_pregunta`
--

INSERT INTO `opciones_pregunta` (`id_opcion`, `uuid`, `id_pregunta`, `texto_opcion`, `es_correcta`, `last_modified`, `deleted`) VALUES
(1, '6c5299d3-d6fc-11f0-a445-f89e94d9fd77', 1, '6x + 5', 1, '2025-12-12 01:46:48', 0),
(2, '6c52aaff-d6fc-11f0-a445-f89e94d9fd77', 1, '3x + 5', 0, '2025-12-12 01:46:48', 0),
(3, '6c52ac0d-d6fc-11f0-a445-f89e94d9fd77', 1, '6x - 2', 0, '2025-12-12 01:46:48', 0),
(4, '6c52ac7d-d6fc-11f0-a445-f89e94d9fd77', 1, 'x^2 + 5', 0, '2025-12-12 01:46:48', 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `periodos`
--

CREATE TABLE `periodos` (
  `id_periodo` int(11) NOT NULL,
  `uuid` char(36) NOT NULL,
  `id_profesor` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `last_modified` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `periodos`
--

INSERT INTO `periodos` (`id_periodo`, `uuid`, `id_profesor`, `nombre`, `fecha_inicio`, `fecha_fin`, `activo`, `last_modified`, `deleted`) VALUES
(1, '6c4a1308-d6fc-11f0-a445-f89e94d9fd77', 1, 'Semestre A 2025', '2025-08-01', '2025-12-15', 1, '2025-12-12 01:46:48', 0),
(2, '3aa72100-d8ad-11f0-a445-f89e94d9fd77', 2, 'Primer Semestre 2026', '2026-01-15', '2026-06-30', 1, '2025-12-14 05:24:54', 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `planeaciones`
--

CREATE TABLE `planeaciones` (
  `id_planeacion` int(11) NOT NULL,
  `id_profesor` int(11) NOT NULL,
  `id_grupo` int(11) NOT NULL,
  `semana_o_fecha` varchar(100) DEFAULT NULL,
  `tema` varchar(255) DEFAULT NULL,
  `objetivo` text DEFAULT NULL,
  `inicio` text DEFAULT NULL,
  `desarrollo` text DEFAULT NULL,
  `cierre` text DEFAULT NULL,
  `materiales` text DEFAULT NULL,
  `evaluacion` text DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `planeaciones`
--

INSERT INTO `planeaciones` (`id_planeacion`, `id_profesor`, `id_grupo`, `semana_o_fecha`, `tema`, `objetivo`, `inicio`, `desarrollo`, `cierre`, `materiales`, `evaluacion`, `fecha_creacion`) VALUES
(1, 2, 2, 'Semana 12 - Octubre', 'Ecuaciones de Primer Grado', 'Que los alumnos aprendan a despejar la variable X en problemas de la vida cotidiana.', 'Lluvia de ideas: ¿Qué harían si supieran cuánto pagan en total pero no el precio unitario? Escribir ejemplos en el pizarrón.', 'Explicar la regla de la balanza: lo que hago de un lado, lo hago del otro. Resolver ejercicios del libro pág. 45 a la 50', 'Reto rápido: El primero que resuelva \"2x + 4 = 20\" gana un punto extra. Dejar tarea ejercicios 3 y 4.', 'Libro de texto, pizarrón, balanza didáctica.', 'Participación en clase y revisión de ejercicios del libro.', '2025-12-13 22:25:18');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `preguntas`
--

CREATE TABLE `preguntas` (
  `id_pregunta` int(11) NOT NULL,
  `uuid` char(36) NOT NULL,
  `id_tema` int(11) NOT NULL,
  `enunciado` text NOT NULL,
  `latex_formula` text DEFAULT NULL,
  `tipo` enum('Abierta','OpcionMultiple','VerdaderoFalso') NOT NULL,
  `dificultad` enum('Facil','Medio','Dificil') NOT NULL,
  `imagen_url` varchar(255) DEFAULT NULL,
  `solucion_texto` text DEFAULT NULL,
  `solucion_latex` text DEFAULT NULL,
  `last_modified` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `preguntas`
--

INSERT INTO `preguntas` (`id_pregunta`, `uuid`, `id_tema`, `enunciado`, `latex_formula`, `tipo`, `dificultad`, `imagen_url`, `solucion_texto`, `solucion_latex`, `last_modified`, `deleted`) VALUES
(1, '6c51ffae-d6fc-11f0-a445-f89e94d9fd77', 1, 'Calcula la derivada CÚBICA de la función:', 'f(x) = 3x^3 + 5x - 2', 'OpcionMultiple', 'Facil', NULL, 'Se aplica la regla de la potencia: d/dx(ax^n) = anx^(n-1).', NULL, '2025-12-13 07:10:17', 0),
(2, '6c530d95-d6fc-11f0-a445-f89e94d9fd77', 1, 'Encuentre la derivada de la función trigonométrica:', 'y = \\sin(x^2)', 'Abierta', 'Medio', NULL, NULL, 'y\' = \\cos(x^2) \\cdot 2x', '2025-12-12 01:46:48', 0),
(7, '654a31d1-d7f3-11f0-a445-f89e94d9fd77', 5, 'Calcula el valor de x en la siguiente identidad trigonométrica:', '\\sin^2(x) + \\cos^2(x) = 1', 'Abierta', 'Facil', NULL, NULL, NULL, '2025-12-13 07:14:42', 0),
(9, '655a3070-d7f3-11f0-a445-f89e94d9fd77', 5, 'Encuentra la hipotenusa si los catetos miden 3 y 4:', 'c = \\sqrt{a^2 + b^2}', 'Abierta', 'Medio', NULL, NULL, NULL, '2025-12-13 07:14:42', 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `profesores`
--

CREATE TABLE `profesores` (
  `id_profesor` int(11) NOT NULL,
  `uuid` char(36) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `escuela_nombre` varchar(150) DEFAULT NULL,
  `last_modified` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted` tinyint(1) DEFAULT 0,
  `telefono` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `profesores`
--

INSERT INTO `profesores` (`id_profesor`, `uuid`, `nombre`, `email`, `password_hash`, `escuela_nombre`, `last_modified`, `deleted`, `telefono`) VALUES
(1, '6c487f78-d6fc-11f0-a445-f89e94d9fd77', 'Maestra Ana Matemáticas', 'ana@profeplus.com', 'hash_de_prueba_123', 'Bachillerato General No. 5', '2025-12-12 01:46:48', 0, NULL),
(2, '74a77e7a-d6fc-11f0-a445-f89e94d9fd77', 'Samai Perez Villegas', 'samai.perez@escuela.edu.mx', '$2y$10$5yIKD8d4Y3Rg.T1zbgQSOOhkfmMcIP.OVxAoK3ScQFK6UjI.ZPa2C', 'Bachillerato General Oficial', '2025-12-15 06:17:43', 0, '2213396656'),
(3, '31c2ab61-d982-11f0-a445-f89e94d9fd77', 'Esteban Arce Garcia', 'tu_email@institucional.com', '$2y$10$JyTfIhcWzwu65zoPJutHUOxyOqyFtwwZY7uflJhPyo.WsCCrClLi6', 'Prepa Nacional Tecnológica', '2025-12-15 06:52:18', 0, '5212204987816');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `profesor_sessions`
--

CREATE TABLE `profesor_sessions` (
  `session_id` int(11) NOT NULL,
  `id_profesor` int(11) NOT NULL,
  `whatsapp_number` varchar(20) NOT NULL,
  `is_authenticated` tinyint(1) DEFAULT 0,
  `last_activity` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `profesor_sessions`
--

INSERT INTO `profesor_sessions` (`session_id`, `id_profesor`, `whatsapp_number`, `is_authenticated`, `last_activity`) VALUES
(1, 3, '5212204987816', 0, '2025-12-15 06:50:53');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rubros`
--

CREATE TABLE `rubros` (
  `id_rubro` int(11) NOT NULL,
  `uuid` char(36) NOT NULL,
  `id_grupo` int(11) NOT NULL,
  `id_periodo` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `porcentaje` decimal(5,2) NOT NULL,
  `last_modified` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `rubros`
--

INSERT INTO `rubros` (`id_rubro`, `uuid`, `id_grupo`, `id_periodo`, `nombre`, `porcentaje`, `last_modified`, `deleted`) VALUES
(1, '6c4f1212-d6fc-11f0-a445-f89e94d9fd77', 1, 1, 'Exámenes', 50.00, '2025-12-12 01:46:48', 0),
(2, '6c4f29f0-d6fc-11f0-a445-f89e94d9fd77', 1, 1, 'Tareas y Ejercicios', 30.00, '2025-12-12 01:46:48', 0),
(3, '6c4f2bf1-d6fc-11f0-a445-f89e94d9fd77', 1, 1, 'Participación', 20.00, '2025-12-12 01:46:48', 0),
(4, '41744ff0-d8ad-11f0-a445-f89e94d9fd77', 2, 2, 'Exámenes y Cuestionarios', 50.00, '2025-12-14 05:25:06', 0),
(5, '4174f216-d8ad-11f0-a445-f89e94d9fd77', 2, 2, 'Proyectos y Entregables', 30.00, '2025-12-14 05:25:06', 0),
(6, '4174f417-d8ad-11f0-a445-f89e94d9fd77', 2, 2, 'Participación en Clase', 20.00, '2025-12-14 05:25:06', 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `temas`
--

CREATE TABLE `temas` (
  `id_tema` int(11) NOT NULL,
  `uuid` char(36) NOT NULL,
  `id_profesor` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `padre_id` int(11) DEFAULT NULL,
  `last_modified` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `temas`
--

INSERT INTO `temas` (`id_tema`, `uuid`, `id_profesor`, `nombre`, `padre_id`, `last_modified`, `deleted`) VALUES
(1, '6c50ef96-d6fc-11f0-a445-f89e94d9fd77', 1, 'Límites', NULL, '2025-12-12 01:46:48', 0),
(2, '6c5102af-d6fc-11f0-a445-f89e94d9fd77', 1, 'Derivadas', NULL, '2025-12-12 01:46:48', 0),
(5, '', 2, 'Trigonometria', NULL, '2025-12-13 07:12:14', 0),
(7, '394fec30-d7f3-11f0-a445-f89e94d9fd77', 2, 'Geometria Analitica', NULL, '2025-12-13 07:13:28', 0);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `actividades`
--
ALTER TABLE `actividades`
  ADD PRIMARY KEY (`id_actividad`),
  ADD UNIQUE KEY `uuid` (`uuid`),
  ADD KEY `id_rubro` (`id_rubro`);

--
-- Indices de la tabla `agenda`
--
ALTER TABLE `agenda`
  ADD PRIMARY KEY (`id_agenda`),
  ADD UNIQUE KEY `uuid` (`uuid`),
  ADD KEY `id_grupo` (`id_grupo`);

--
-- Indices de la tabla `alumnos`
--
ALTER TABLE `alumnos`
  ADD PRIMARY KEY (`id_alumno`),
  ADD UNIQUE KEY `uuid` (`uuid`),
  ADD KEY `id_grupo` (`id_grupo`);

--
-- Indices de la tabla `asistencia`
--
ALTER TABLE `asistencia`
  ADD PRIMARY KEY (`id_asistencia`),
  ADD UNIQUE KEY `uuid` (`uuid`),
  ADD KEY `id_alumno` (`id_alumno`),
  ADD KEY `id_grupo` (`id_grupo`);

--
-- Indices de la tabla `calificaciones`
--
ALTER TABLE `calificaciones`
  ADD PRIMARY KEY (`id_calificacion`),
  ADD UNIQUE KEY `uuid` (`uuid`),
  ADD KEY `id_alumno` (`id_alumno`),
  ADD KEY `id_actividad` (`id_actividad`);

--
-- Indices de la tabla `grupos`
--
ALTER TABLE `grupos`
  ADD PRIMARY KEY (`id_grupo`),
  ADD UNIQUE KEY `uuid` (`uuid`),
  ADD KEY `id_profesor` (`id_profesor`);

--
-- Indices de la tabla `opciones_pregunta`
--
ALTER TABLE `opciones_pregunta`
  ADD PRIMARY KEY (`id_opcion`),
  ADD UNIQUE KEY `uuid` (`uuid`),
  ADD KEY `id_pregunta` (`id_pregunta`);

--
-- Indices de la tabla `periodos`
--
ALTER TABLE `periodos`
  ADD PRIMARY KEY (`id_periodo`),
  ADD UNIQUE KEY `uuid` (`uuid`),
  ADD KEY `id_profesor` (`id_profesor`);

--
-- Indices de la tabla `planeaciones`
--
ALTER TABLE `planeaciones`
  ADD PRIMARY KEY (`id_planeacion`);

--
-- Indices de la tabla `preguntas`
--
ALTER TABLE `preguntas`
  ADD PRIMARY KEY (`id_pregunta`),
  ADD UNIQUE KEY `uuid` (`uuid`),
  ADD KEY `id_tema` (`id_tema`);

--
-- Indices de la tabla `profesores`
--
ALTER TABLE `profesores`
  ADD PRIMARY KEY (`id_profesor`),
  ADD UNIQUE KEY `uuid` (`uuid`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indices de la tabla `profesor_sessions`
--
ALTER TABLE `profesor_sessions`
  ADD PRIMARY KEY (`session_id`),
  ADD UNIQUE KEY `whatsapp_number` (`whatsapp_number`),
  ADD KEY `id_profesor` (`id_profesor`);

--
-- Indices de la tabla `rubros`
--
ALTER TABLE `rubros`
  ADD PRIMARY KEY (`id_rubro`),
  ADD UNIQUE KEY `uuid` (`uuid`),
  ADD KEY `id_grupo` (`id_grupo`),
  ADD KEY `id_periodo` (`id_periodo`);

--
-- Indices de la tabla `temas`
--
ALTER TABLE `temas`
  ADD PRIMARY KEY (`id_tema`),
  ADD UNIQUE KEY `uuid` (`uuid`),
  ADD KEY `id_profesor` (`id_profesor`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `actividades`
--
ALTER TABLE `actividades`
  MODIFY `id_actividad` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `agenda`
--
ALTER TABLE `agenda`
  MODIFY `id_agenda` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `alumnos`
--
ALTER TABLE `alumnos`
  MODIFY `id_alumno` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `asistencia`
--
ALTER TABLE `asistencia`
  MODIFY `id_asistencia` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT de la tabla `calificaciones`
--
ALTER TABLE `calificaciones`
  MODIFY `id_calificacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `grupos`
--
ALTER TABLE `grupos`
  MODIFY `id_grupo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `opciones_pregunta`
--
ALTER TABLE `opciones_pregunta`
  MODIFY `id_opcion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `periodos`
--
ALTER TABLE `periodos`
  MODIFY `id_periodo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `planeaciones`
--
ALTER TABLE `planeaciones`
  MODIFY `id_planeacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `preguntas`
--
ALTER TABLE `preguntas`
  MODIFY `id_pregunta` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `profesores`
--
ALTER TABLE `profesores`
  MODIFY `id_profesor` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `profesor_sessions`
--
ALTER TABLE `profesor_sessions`
  MODIFY `session_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `rubros`
--
ALTER TABLE `rubros`
  MODIFY `id_rubro` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `temas`
--
ALTER TABLE `temas`
  MODIFY `id_tema` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `actividades`
--
ALTER TABLE `actividades`
  ADD CONSTRAINT `actividades_ibfk_1` FOREIGN KEY (`id_rubro`) REFERENCES `rubros` (`id_rubro`);

--
-- Filtros para la tabla `agenda`
--
ALTER TABLE `agenda`
  ADD CONSTRAINT `agenda_ibfk_1` FOREIGN KEY (`id_grupo`) REFERENCES `grupos` (`id_grupo`);

--
-- Filtros para la tabla `alumnos`
--
ALTER TABLE `alumnos`
  ADD CONSTRAINT `alumnos_ibfk_1` FOREIGN KEY (`id_grupo`) REFERENCES `grupos` (`id_grupo`);

--
-- Filtros para la tabla `asistencia`
--
ALTER TABLE `asistencia`
  ADD CONSTRAINT `asistencia_ibfk_1` FOREIGN KEY (`id_alumno`) REFERENCES `alumnos` (`id_alumno`),
  ADD CONSTRAINT `asistencia_ibfk_2` FOREIGN KEY (`id_grupo`) REFERENCES `grupos` (`id_grupo`);

--
-- Filtros para la tabla `calificaciones`
--
ALTER TABLE `calificaciones`
  ADD CONSTRAINT `calificaciones_ibfk_1` FOREIGN KEY (`id_alumno`) REFERENCES `alumnos` (`id_alumno`),
  ADD CONSTRAINT `calificaciones_ibfk_2` FOREIGN KEY (`id_actividad`) REFERENCES `actividades` (`id_actividad`);

--
-- Filtros para la tabla `grupos`
--
ALTER TABLE `grupos`
  ADD CONSTRAINT `grupos_ibfk_1` FOREIGN KEY (`id_profesor`) REFERENCES `profesores` (`id_profesor`);

--
-- Filtros para la tabla `opciones_pregunta`
--
ALTER TABLE `opciones_pregunta`
  ADD CONSTRAINT `opciones_pregunta_ibfk_1` FOREIGN KEY (`id_pregunta`) REFERENCES `preguntas` (`id_pregunta`);

--
-- Filtros para la tabla `periodos`
--
ALTER TABLE `periodos`
  ADD CONSTRAINT `periodos_ibfk_1` FOREIGN KEY (`id_profesor`) REFERENCES `profesores` (`id_profesor`);

--
-- Filtros para la tabla `preguntas`
--
ALTER TABLE `preguntas`
  ADD CONSTRAINT `preguntas_ibfk_1` FOREIGN KEY (`id_tema`) REFERENCES `temas` (`id_tema`);

--
-- Filtros para la tabla `profesor_sessions`
--
ALTER TABLE `profesor_sessions`
  ADD CONSTRAINT `profesor_sessions_ibfk_1` FOREIGN KEY (`id_profesor`) REFERENCES `profesores` (`id_profesor`);

--
-- Filtros para la tabla `rubros`
--
ALTER TABLE `rubros`
  ADD CONSTRAINT `rubros_ibfk_1` FOREIGN KEY (`id_grupo`) REFERENCES `grupos` (`id_grupo`),
  ADD CONSTRAINT `rubros_ibfk_2` FOREIGN KEY (`id_periodo`) REFERENCES `periodos` (`id_periodo`);

--
-- Filtros para la tabla `temas`
--
ALTER TABLE `temas`
  ADD CONSTRAINT `temas_ibfk_1` FOREIGN KEY (`id_profesor`) REFERENCES `profesores` (`id_profesor`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
