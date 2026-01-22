# 🍎 Profe Plus - Sistema de Gestión Escolar

Sistema integral para profesores desarrollado con **React (Vite)** y **PHP**. Gestiona grupos, asistencia, calificaciones y planeaciones desde un solo lugar.

## 🛠️ Requisitos del Sistema
* **XAMPP** (con PHP 8.0 o superior)
* **Node.js** (v20 LTS o superior)
* **MySQL / MariaDB**

---

## 🚀 Guía de Instalación para Colaboradores

### 1. Clonar el Proyecto
Navega a tu carpeta de servidor local (`htdocs`) y ejecuta:
```cmd
git clone [https://github.com/Arxce26/profe_plus.git](https://github.com/Arxce26/profe_plus.git)
```

### 2. Importar Base de Datos
1. Abre phpMyAdmin (http://localhost/phpmyadmin).
2. Crea una base de datos nueva llamada profe_plus.
3. Selecciona la base de datos, ve a la pestaña Importar.
4. Busca y selecciona el archivo SQL ubicado en: /database/profeplus.sql.
5. Haz clic en Importar.

### 3. Configurar el Backend (API)
Abre el archivo profeplus-api/conexion.php y ajusta las credenciales de tu MySQL según tu sistema:
```cmd
Host: localhost

Usuario: root

Contraseña: (Vacío en XAMPP por defecto o la que hayas asignado).

DB: profe_plus
```
### 4. Levantar el Frontend (React)
Abre una terminal dentro de la carpeta del proyecto y corre:
```cmd
cd profeplus-web
npm install
npm run dev
```
Accede a la aplicación en: http://localhost:5173


## 🛑 Finalizar Sesión (Cierre Seguro)
Cuando termines de trabajar, sigue estos pasos para liberar los recursos del sistema:

1. En la terminal donde corre Vite, presiona: Ctrl + C.

2. Si el puerto se queda bloqueado, puedes forzar el cierre con:

```cmd
npx kill-port 5173
```
3. Apaga los módulos de Apache y MySQL desde el panel de control de XAMPP.

### 📁 Estructura del Repositorio
/profeplus-web: Aplicación Frontend (React + Vite).

/profeplus-api: Endpoints y lógica de servidor (PHP).

/database: Respaldo oficial de la base de datos SQL.




