import { useState, useEffect, useCallback } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Asistencia({ usuario, temaOscuro, volverAlDashboard, estilos }) {
    
    // --- ESTADOS ---
    const [grupos, setGrupos] = useState([]);
    const [grupoSeleccionado, setGrupoSeleccionado] = useState('');
    const [nombreGrupo, setNombreGrupo] = useState('');
    const [alumnos, setAlumnos] = useState([]);
    
    // Cambiamos el modo inicial a 'estadisticas' para mostrar el Dashboard al entrar
    const [modo, setModo] = useState('estadisticas'); 
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
    
    const [asistenciaTemp, setAsistenciaTemp] = useState({});
    const [datosGrafica, setDatosGrafica] = useState([]); // Ahora incluye faltas, retardos, presentes
    const [mensaje, setMensaje] = useState('');

    // Estados para Reportes y Modales
    const [mostrarModalReporte, setMostrarModalReporte] = useState(false);
    const [mostrarVistaPrevia, setMostrarVistaPrevia] = useState(false);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [fechaInicioRep, setFechaInicioRep] = useState(new Date().toISOString().split('T')[0]);
    const [fechaFinRep, setFechaFinRep] = useState(new Date().toISOString().split('T')[0]);
    const [tituloReporte, setTituloReporte] = useState('Reporte de Asistencia');

    // --- NUEVO: ESTADOS PARA HISTORIAL INDIVIDUAL ---
    const [mostrarModalHistorial, setMostrarModalHistorial] = useState(false);
    const [historialAlumno, setHistorialAlumno] = useState([]);
    const [alumnoSeleccionadoNombre, setAlumnoSeleccionadoNombre] = useState('');

    // 1. CARGA INICIAL
    useEffect(() => {
        fetch(`http://localhost/profe_plus/profeplus-api/get_grupos.php?id_profesor=${usuario.id}`)
            .then(res => res.json())
            .then(data => {
                setGrupos(data);
                if(data.length > 0) handleCambioGrupo(data[0].id_grupo, data[0].nombre);
            });
    }, [usuario.id]);

    // 2. DETECTOR DE CAMBIO DE FECHA (MÁQUINA DEL TIEMPO)
    useEffect(() => {
        if(grupoSeleccionado && fecha && alumnos.length > 0) {
            cargarAsistenciaDelDia(grupoSeleccionado, fecha);
        }
    }, [fecha, grupoSeleccionado, alumnos]); // Añadimos alumnos a la dependencia

    const handleCambioGrupo = (idGrupo, nombre = '') => {
        setGrupoSeleccionado(idGrupo);
        if(!nombre) {
            const g = grupos.find(x => x.id_grupo == idGrupo);
            if(g) setNombreGrupo(g.nombre);
        } else { setNombreGrupo(nombre); }

        fetch(`http://localhost/profe_plus/profeplus-api/get_alumnos.php?id_grupo=${idGrupo}`)
            .then(res => res.json())
            .then(data => {
                setAlumnos(data);
                // Trigger useEffect para cargar asistencia del día con los nuevos alumnos
            });
        
        cargarEstadisticas(idGrupo);
    };

    // --- LÓGICA INTELIGENTE DE CARGA ---
    const cargarAsistenciaDelDia = async (idGrupo, fechaSelected) => {
        try {
            const response = await fetch(`http://localhost/profe_plus/profeplus-api/get_asistencia_fecha.php?id_grupo=${idGrupo}&fecha=${fechaSelected}`);
            const datosGuardados = await response.json();
            
            const nuevaAsistencia = {};
            
            // Si hay datos guardados, los usamos
            if (Object.keys(datosGuardados).length > 0) {
                // Reconstruir la lista temporal usando los datos guardados
                alumnos.forEach(alum => {
                    nuevaAsistencia[alum.id_alumno] = datosGuardados[alum.id_alumno] || 'Presente'; 
                });
                setAsistenciaTemp(nuevaAsistencia);
                setMensaje('📅 Cargando datos guardados de esta fecha...');
                setTimeout(() => setMensaje(''), 2000);
            } else {
                // Si NO hay datos, todos Presentes por defecto
                alumnos.forEach(alum => nuevaAsistencia[alum.id_alumno] = 'Presente');
                setAsistenciaTemp(nuevaAsistencia);
            }
        } catch (e) { console.error(e); }
    };
    
    // Función para obtener Estadísticas completas (no solo Presentes)
    const cargarEstadisticas = (idGrupo) => {
        // NOTA: Asumo que actualizaste get_estadisticas.php para traer Faltas, Retardos, etc.
        fetch(`http://localhost/profe_plus/profeplus-api/get_estadisticas.php?id_grupo=${idGrupo}`)
            .then(res => res.json())
            .then(data => setDatosGrafica(data));
    };

    const toggleEstado = (id_alumno, estado) => {
        setAsistenciaTemp({ ...asistenciaTemp, [id_alumno]: estado });
    };

    const guardarAsistencia = async () => {
        setMensaje('Guardando...');
        const listaParaEnviar = Object.keys(asistenciaTemp).map(id => ({
            id_alumno: id, estado: asistenciaTemp[id]
        }));

        try {
            const response = await fetch('http://localhost/profe_plus/profeplus-api/save_asistencia.php', {
                method: 'POST',
                body: JSON.stringify({ fecha, grupo_id: grupoSeleccionado, lista: listaParaEnviar })
            });
            const data = await response.json();
            
            if(data.success) {
                setMensaje('✅ Asistencia guardada/actualizada');
                setTimeout(() => setMensaje(''), 3000);
                cargarEstadisticas(grupoSeleccionado);
            } else {
                 setMensaje(`❌ Error al guardar: ${data.message}`);
            }
        } catch (e) { setMensaje('❌ Error de conexión'); }
    };

    // --- NUEVO: VER HISTORIAL DE ALUMNO ---
    const verHistorial = async (alumno) => {
        setAlumnoSeleccionadoNombre(`${alumno.nombre} ${alumno.apellidos}`);
        setMostrarModalHistorial(true);
        setHistorialAlumno([]); // Limpiar previo

        try {
            const res = await fetch(`http://localhost/profe_plus/profeplus-api/get_historial_alumno.php?id_alumno=${alumno.id_alumno}&id_grupo=${grupoSeleccionado}`);
            const data = await res.json();
            setHistorialAlumno(data);
        } catch(e) { console.error(e); }
    };

    // --- REPORTES ---
    const setRangoRapido = (tipo) => { 
        const hoy = new Date(); const fin = hoy.toISOString().split('T')[0]; let inicio = new Date();
        if (tipo === 'hoy') { inicio = hoy; setTituloReporte('Reporte Diario'); }
        else if (tipo === 'semana') { inicio.setDate(hoy.getDate() - 7); setTituloReporte('Reporte Semanal'); }
        else if (tipo === 'mes') { inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1); setTituloReporte('Reporte Mensual'); }
        setFechaInicioRep(inicio.toISOString().split('T')[0]); setFechaFinRep(fin);
    };
    
    const generarVistaPrevia = async () => { 
        try {
            if (!grupoSeleccionado) { alert("⚠️ Selecciona un grupo."); return; }
            const url = `http://localhost/profe_plus/profeplus-api/get_reporte_asistencia.php?id_grupo=${grupoSeleccionado}&fecha_inicio=${fechaInicioRep}&fecha_fin=${fechaFinRep}`;
            const response = await fetch(url);
            const dataReporte = await response.json();
            if (!dataReporte || dataReporte.length === 0) { alert("⚠️ No hay datos."); return; }

            const doc = new jsPDF();
            doc.setFontSize(18); doc.setTextColor(40); doc.text(tituloReporte, 14, 22);
            doc.setFontSize(10); doc.setTextColor(100); doc.text(`Grupo: ${nombreGrupo}`, 14, 30); doc.text(`Periodo: ${fechaInicioRep} al ${fechaFinRep}`, 14, 35);

            const columnas = ["Alumno", "Matrícula", "Presentes", "Retardos", "Faltas", "% Asis."];
            const filas = dataReporte.map(alum => [
                `${alum.apellidos} ${alum.nombre}`, alum.codigo_escolar, alum.presentes, alum.retardos, alum.faltas, `${alum.porcentaje}%`
            ]);

            autoTable(doc, {
                startY: 45, head: [columnas], body: filas, theme: 'grid', headStyles: { fillColor: [100, 108, 255] },
                didParseCell: function(data) {
                    if (data.section === 'body' && data.column.index === 5) {
                        if (parseInt(data.cell.raw) < 80) { data.cell.styles.textColor = [255, 0, 0]; data.cell.styles.fontStyle = 'bold'; }
                        else { data.cell.styles.textColor = [0, 128, 0]; }
                    }
                }
            });
            setPdfUrl(doc.output('bloburl')); setMostrarVistaPrevia(true);
        } catch (e) { alert(e.message); }
    };

    // GRÁFICA (Datos para el modo pasar_lista, ahora se usa en el dashboard)
    const chartData = {
        labels: datosGrafica.map(d => d.nombre.split(' ')[0] + ' ' + d.apellidos.split(' ')[0]), 
        datasets: [
            { 
                label: 'Presentes', 
                data: datosGrafica.map(d => d.total_asistencias), 
                backgroundColor: 'rgba(75, 192, 192, 0.6)', 
                borderRadius: 4 
            },
            // Asumo que el backend también trae Faltas y Retardos si existe
        ],
    };

    // Preparar datos para el Dashboard de bajo rendimiento
    const alumnosBajoRendimiento = datosGrafica
        .sort((a, b) => a.total_asistencias - b.total_asistencias)
        .slice(0, 3);


    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <button onClick={volverAlDashboard} style={{ marginBottom: '20px', background: 'transparent', border: '1px solid #ccc', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', color: temaOscuro ? 'white' : 'black' }}>⬅ Volver</button>

            <div style={{ ...estilos.tarjeta, padding: '20px', borderRadius: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '20px', borderBottom: '1px solid #ddd', paddingBottom: '20px' }}>
                    <div>
                        <h2 style={{ color: '#646cff', margin: 0 }}>📅 Control de Asistencia</h2>
                        <select value={grupoSeleccionado} onChange={(e) => handleCambioGrupo(e.target.value)} style={{ padding: '8px', marginTop: '10px', borderRadius: '5px', fontSize: '1rem', border: '1px solid #ccc', minWidth: '200px' }}>
                            {grupos.map(g => <option key={g.id_grupo} value={g.id_grupo}>{g.nombre}</option>)}
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', background: '#eee', padding: '5px', borderRadius: '8px' }}>
                        <button onClick={() => setModo('pasar_lista')} style={estiloBotonModo(modo === 'pasar_lista')}>📝 Lista</button>
                        <button onClick={() => setModo('estadisticas')} style={estiloBotonModo(modo === 'estadisticas')}>📊 Dashboard</button>
                        <button onClick={() => setMostrarModalReporte(true)} style={{...estiloBotonModo(false), background: '#eb2f96', color: 'white'}}>📄 Reportes</button>
                    </div>
                </div>

                {/* --- MODO DASHBOARD (MEJORA) --- */}
                {modo === 'estadisticas' && (
                    <div style={{...estilos.tarjeta, padding: '30px', borderRadius: '15px' }}>
                        <h3 style={{color:'#fa8c16', marginBottom:'20px'}}>📊 Resumen de Asistencia Acumulada</h3>
                        
                        {datosGrafica && datosGrafica.length > 0 ? (
                            <>
                                <div style={{ height: '400px', display: 'flex', justifyContent: 'center', marginBottom:'30px' }}>
                                    <Bar options={{ responsive: true, plugins: { title: { display: true, text: 'Total de Asistencias Registradas', color: temaOscuro ? 'white' : 'black' } } }} data={chartData} />
                                </div>
                                
                                <h4 style={{color:'#646cff'}}>Alumnos con Menos Asistencias (Requieren Atención)</h4>
                                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
                                    {alumnosBajoRendimiento
                                        .map((d, index) => (
                                        <div key={index} style={{padding:'10px', background: temaOscuro ? '#444' : '#f0f0f0', borderRadius:'5px', borderLeft: index===0 ? '4px solid #ff4d4f' : '4px solid #fa8c16'}}>
                                            <strong style={{color: index===0 ? '#ff4d4f' : 'inherit'}}>{d.nombre.split(' ')[0] + ' ' + d.apellidos.split(' ')[0]}</strong>
                                            <small style={{display:'block', opacity:0.8}}> ({d.total_asistencias} Asistencias)</small>
                                        </div>
                                    ))}
                                </div>
                                
                                <button 
                                    onClick={() => setMostrarModalReporte(true)} 
                                    style={{...estilosBotonAccion('#eb2f96', 'auto', '20px')}}
                                >
                                    📄 Generar Reporte Detallado PDF
                                </button>

                            </>
                        ) : (
                            <p style={{textAlign:'center', opacity:0.7}}>No hay suficientes datos de asistencia para generar estadísticas.</p>
                        )}
                    </div>
                )}
                
                {/* --- MODO PASE DE LISTA (EXISTENTE) --- */}
                {modo === 'pasar_lista' && (
                    <div>
                        <div style={{ marginBottom: '20px', textAlign: 'center', background: '#e6f7ff', padding: '10px', borderRadius: '8px', border: '1px solid #91d5ff' }}>
                            <label style={{ marginRight: '10px', fontWeight: 'bold', color: '#0050b3' }}>📅 Fecha a registrar/editar:</label>
                            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc', fontWeight: 'bold' }} />
                        </div>

                        <div style={{ display: 'grid', gap: '10px' }}>
                            {alumnos.map(alum => (
                                <div key={alum.id_alumno} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 15px', borderRadius: '8px', background: temaOscuro ? '#333' : '#f9f9f9', border: '1px solid #eee' }}>
                                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                        {/* BOTÓN DE OJO HISTORIAL */}
                                        <button onClick={() => verHistorial(alum)} title="Ver Historial" style={{background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem'}}>👁️</button>
                                        <div>
                                            <strong style={{ fontSize: '1.1rem' }}>{alum.apellidos} {alum.nombre}</strong>
                                            <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{alum.codigo_escolar}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        <BotonEstado etiqueta="✅" activo={asistenciaTemp[alum.id_alumno] === 'Presente'} onClick={() => toggleEstado(alum.id_alumno, 'Presente')} color="#52c41a" />
                                        <BotonEstado etiqueta="📄" title="Justificado" activo={asistenciaTemp[alum.id_alumno] === 'Justificado'} onClick={() => toggleEstado(alum.id_alumno, 'Justificado')} color="#1890ff" />
                                        <BotonEstado etiqueta="⚠️" activo={asistenciaTemp[alum.id_alumno] === 'Retardo'} onClick={() => toggleEstado(alum.id_alumno, 'Retardo')} color="#fa8c16" />
                                        <BotonEstado etiqueta="❌" activo={asistenciaTemp[alum.id_alumno] === 'Falta'} onClick={() => toggleEstado(alum.id_alumno, 'Falta')} color="#ff4d4f" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={guardarAsistencia} style={{ width: '100%', marginTop: '20px', padding: '15px', background: '#646cff', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer' }}>💾 Guardar Cambios</button>
                        {mensaje && <p style={{ textAlign: 'center', marginTop: '10px', fontWeight: 'bold', color: mensaje.includes('Error') ? 'red' : 'green' }}>{mensaje}</p>}
                    </div>
                )}
                
            </div>

            {/* MODAL REPORTES (El mismo de antes) */}
            {mostrarModalReporte && (
                <div style={estiloOverlay}>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '15px', width: '400px' }}>
                        <h2 style={{color: '#333', marginTop:0}}>📄 Reporte PDF</h2>
                        <div style={{display: 'flex', gap: '5px', marginBottom: '10px'}}>
                            <button onClick={() => setRangoRapido('semana')} style={estiloBotonRapido}>Semana</button>
                            <button onClick={() => setRangoRapido('mes')} style={estiloBotonRapido}>Mes</button>
                        </div>
                        <label style={labelStyle}>Desde:</label><input type="date" value={fechaInicioRep} onChange={(e)=>setFechaInicioRep(e.target.value)} style={inputStyle} />
                        <label style={labelStyle}>Hasta:</label><input type="date" value={fechaFinRep} onChange={(e)=>setFechaFinRep(e.target.value)} style={inputStyle} />
                        <div style={{marginTop: '20px', textAlign: 'right'}}>
                            <button onClick={()=>setMostrarModalReporte(false)} style={{marginRight:'10px', padding: '10px', border: 'none', background: '#eee', cursor:'pointer', borderRadius:'5px'}}>Cancelar</button>
                            <button onClick={generarVistaPrevia} style={{padding: '10px', border: 'none', background: '#646cff', color: 'white', cursor:'pointer', borderRadius:'5px'}}>Generar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL VISTA PREVIA PDF (El mismo de antes) */}
            {mostrarVistaPrevia && (
                <div style={estiloOverlay}>
                    <div style={{ backgroundColor: 'white', width: '90%', height: '90%', borderRadius: '10px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ padding: '15px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
                            <h3 style={{ margin: 0, color: '#333' }}>Vista Previa</h3>
                            <button onClick={() => setMostrarVistaPrevia(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'red' }}>✖</button>
                        </div>
                        <iframe src={pdfUrl} style={{ flex: 1, border: 'none' }} title="Vista Previa PDF"></iframe>
                    </div>
                </div>
            )}

            {/* --- NUEVO: MODAL HISTORIAL ALUMNO --- */}
            {mostrarModalHistorial && (
                <div style={estiloOverlay}>
                    <div style={{ background: 'white', padding: '20px', borderRadius: '10px', width: '350px', maxHeight: '80vh', overflowY: 'auto' }}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px'}}>
                            <h3 style={{color: '#333', margin:0}}>{alumnoSeleccionadoNombre}</h3>
                            <button onClick={()=>setMostrarModalHistorial(false)} style={{border:'none', background:'transparent', fontSize:'1.5rem', cursor:'pointer'}}>✖</button>
                        </div>
                        <h4 style={{color: '#666', marginTop:0}}>Historial de Asistencias</h4>
                        
                        {historialAlumno.length === 0 ? <p>No hay registros.</p> : (
                            <table style={{width: '100%', borderCollapse: 'collapse'}}>
                                <thead>
                                    <tr style={{background: '#f0f0f0', textAlign: 'left'}}>
                                        <th style={{padding: '8px'}}>Fecha</th>
                                        <th style={{padding: '8px'}}>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historialAlumno.map((reg, idx) => (
                                        <tr key={idx} style={{borderBottom: '1px solid #eee'}}>
                                            <td style={{padding: '8px', color: '#555'}}>{reg.fecha}</td>
                                            <td style={{padding: '8px', fontWeight: 'bold', color: reg.estado === 'Presente' ? 'green' : (reg.estado === 'Falta' ? 'red' : (reg.estado === 'Justificado' ? '#1890ff' : 'orange')) }}>
                                                {reg.estado}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
}

// ESTILOS COMPARTIDOS
const estiloBotonModo = (activo) => ({ padding: '10px 20px', borderRadius: '6px', border: 'none', background: activo ? 'white' : 'transparent', fontWeight: 'bold', cursor: 'pointer', boxShadow: activo ? '0 2px 5px rgba(0,0,0,0.1)' : 'none', color: '#333' });
const BotonEstado = ({ etiqueta, activo, onClick, color, title }) => ( <button onClick={onClick} title={title} style={{ fontSize: '1.2rem', padding: '8px 12px', border: `2px solid ${activo ? color : '#ccc'}`, background: activo ? color : 'transparent', color: activo ? 'white' : '#ccc', borderRadius: '5px', cursor: 'pointer', transition: 'all 0.2s', opacity: activo ? 1 : 0.6 }}>{etiqueta}</button> );
const estiloOverlay = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' };
const estiloBotonRapido = { flex: 1, padding: '8px', background: '#f0f0f0', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem', color: '#333' };
const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555', fontSize: '0.9rem' };
const inputStyle = { width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' };

// Función auxiliar para estilos que se usará en Calificaciones
const estilosBotonAccion = (bg, width = 'auto', marginTop = '0px') => ({ background: bg, color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', width: width, marginTop: marginTop });


export default Asistencia;