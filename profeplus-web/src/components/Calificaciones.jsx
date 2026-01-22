import { useState, useEffect, useCallback } from 'react';
import { Bar } from 'react-chartjs-2'; // Necesario para la gráfica de promedios
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Registrar componentes de Chart.js si no lo están ya
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);


// Este módulo manejará Rubros, Actividades y Asignación de Calificaciones
function Calificaciones({ usuario, temaOscuro, estilos, volverAlDashboard }) {
    
    // 1. ESTADOS DE CONTROL
    const [grupos, setGrupos] = useState([]);
    const [grupoSeleccionado, setGrupoSeleccionado] = useState(null); // Objeto de grupo
    const [rubros, setRubros] = useState([]);
    const [actividades, setActividades] = useState([]);
    const [alumnos, setAlumnos] = useState([]);

    const [vistaActual, setVistaActual] = useState('actividades'); // 'actividades', 'rubros', 'dashboard_calificaciones', 'calificar'
    const [actividadSeleccionada, setActividadSeleccionada] = useState(null);
    const [calificacionesTemp, setCalificacionesTemp] = useState({}); // { id_alumno: calificacion }
    
    // NUEVO: Estado para el Dashboard de Calificaciones
    const [promediosPonderados, setPromediosPonderados] = useState([]); 

    // 2. MODALES y FORMS
    const [mostrarModalActividad, setMostrarModalActividad] = useState(false);
    const [formActividad, setFormActividad] = useState({ id_rubro: '', nombre: '', fecha_entrega: '', puntaje_maximo: 10.00 });
    
    // Rubros
    const [mostrarModalRubro, setMostrarModalRubro] = useState(false);
    const [rubroEdicion, setRubroEdicion] = useState(null); 
    const [formRubro, setFormRubro] = useState({ id_rubro: 0, nombre: '', porcentaje: '' });
    
    // Reportes
    const [mostrarVistaPrevia, setMostrarVistaPrevia] = useState(false);
    const [pdfUrl, setPdfUrl] = useState(null);

    // 3. FUNCIONES DE LECTURA DE DATOS
    const fetchRubros = (id_grupo) => {
         fetch(`http://localhost/profe_plus/profeplus-api/get_rubros.php?id_grupo=${id_grupo}`)
            .then(res => res.json())
            .then(setRubros);
    };

    const fetchActividades = (id_grupo) => {
        fetch(`http://localhost/profe_plus/profeplus-api/get_actividades.php?id_grupo=${id_grupo}`)
            .then(res => res.json())
            .then(setActividades);
    };
    
    const fetchCalificaciones = useCallback((id_actividad) => {
        fetch(`http://localhost/profe_plus/profeplus-api/get_calificaciones.php?id_actividad=${id_actividad}`)
            .then(res => res.json())
            .then(setCalificacionesTemp)
            .catch(err => setCalificacionesTemp({}));
    }, []);
    
    // NUEVO: Fetch de promedios ponderados
    const fetchPromediosPonderados = useCallback((id_grupo) => {
        fetch(`http://localhost/profe_plus/profeplus-api/get_promedio_ponderado.php?id_grupo=${id_grupo}`)
            .then(res => res.json())
            .then(setPromediosPonderados)
            .catch(err => console.error("Error cargando promedios:", err));
    }, []);

    // 4. Carga inicial y cambio de grupo
    useEffect(() => {
        fetch(`http://localhost/profe_plus/profeplus-api/get_grupos.php?id_profesor=${usuario.id}&archivados=0`)
            .then(res => res.json())
            .then(data => {
                setGrupos(data);
                if (data.length > 0) handleSeleccionarGrupo(data[0]);
            });
    }, [usuario.id]);

    const handleSeleccionarGrupo = (grupo) => {
        setGrupoSeleccionado(grupo);
        if (!grupo) return;
        
        fetch(`http://localhost/profe_plus/profeplus-api/get_alumnos.php?id_grupo=${grupo.id_grupo}`)
            .then(res => res.json())
            .then(setAlumnos);

        fetchRubros(grupo.id_grupo);
        fetchActividades(grupo.id_grupo);
        fetchPromediosPonderados(grupo.id_grupo); // Cargar promedios para el dashboard
    };

    // 5. GESTIÓN DE RUBROS (CRUD)
    
    const handleAbrirModalRubro = (rubro = null) => {
        setRubroEdicion(rubro);
        setFormRubro({
            id_rubro: rubro ? rubro.id_rubro : 0,
            nombre: rubro ? rubro.nombre : '',
            porcentaje: rubro ? rubro.porcentaje : ''
        });
        setMostrarModalRubro(true);
    };

    const handleGuardarRubro = async (e) => {
        e.preventDefault();
        
        const payload = {
            id_rubro: formRubro.id_rubro,
            id_grupo: grupoSeleccionado.id_grupo,
            nombre: formRubro.nombre,
            porcentaje: parseFloat(formRubro.porcentaje)
        };
        
        const response = await fetch('http://localhost/profe_plus/profeplus-api/save_rubro.php', {
            method: 'POST', body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        if (data.success) {
            alert(`✅ Rubro ${formRubro.id_rubro ? 'actualizado' : 'creado'} con éxito.`);
            setMostrarModalRubro(false);
            fetchRubros(grupoSeleccionado.id_grupo);
            fetchPromediosPonderados(grupoSeleccionado.id_grupo); // Recalcular promedios
        } else {
            alert(`❌ Error: ${data.message}`);
        }
    };

    const handleEliminarRubro = async (id_rubro) => {
        if(!window.confirm("⚠️ ¿Estás seguro de eliminar este rubro? Esto puede afectar a las actividades asociadas.")) return;
        
        const response = await fetch('http://localhost/profe_plus/profeplus-api/delete_rubro.php', {
            method: 'POST', body: JSON.stringify({ id_rubro })
        });
        
        const data = await response.json();
        if (data.success) {
            alert("✅ Rubro eliminado (soft delete).");
            fetchRubros(grupoSeleccionado.id_grupo);
            fetchActividades(grupoSeleccionado.id_grupo); 
            fetchPromediosPonderados(grupoSeleccionado.id_grupo); // Recalcular promedios
        } else {
            alert(`❌ Error al eliminar: ${data.message}`);
        }
    };

    // 6. GESTIÓN DE ACTIVIDADES Y CALIFICACIONES (Funciones existentes)
    
    const handleGuardarActividad = async (e) => { 
        e.preventDefault();
        
        const payload = {
            ...formActividad,
            id_rubro: parseInt(formActividad.id_rubro),
            puntaje_maximo: parseFloat(formActividad.puntaje_maximo)
        };
        
        const response = await fetch('http://localhost/profe_plus/profeplus-api/save_actividad.php', {
            method: 'POST', body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        if (data.success) {
            alert("✅ Actividad guardada.");
            setMostrarModalActividad(false);
            fetchActividades(grupoSeleccionado.id_grupo);
        } else {
            alert(`❌ Error al guardar: ${data.message}`);
        }
    };
    
    const iniciarCalificacion = (actividad) => {
        setActividadSeleccionada(actividad);
        setVistaActual('calificar');
        fetchCalificaciones(actividad.id_actividad);
    };

    const handleGuardarCalificaciones = async () => {
        if (!actividadSeleccionada) return;

        const listaParaEnviar = Object.keys(calificacionesTemp)
            .filter(id => calificacionesTemp[id] !== '' && calificacionesTemp[id] !== null) 
            .map(id_alumno => ({
                id_alumno: parseInt(id_alumno),
                puntaje: parseFloat(calificacionesTemp[id_alumno])
            }));
            
        if (listaParaEnviar.length === 0) {
            alert("⚠️ No hay calificaciones válidas para guardar.");
            return;
        }

        const payload = {
            id_actividad: actividadSeleccionada.id_actividad,
            calificaciones: listaParaEnviar
        };

        alert("Guardando calificaciones...");
        
        try {
            const response = await fetch('http://localhost/profe_plus/profeplus-api/save_calificaciones.php', {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();

            if (data.success) {
                alert(`✅ ${data.message}`);
                setVistaActual('actividades');
                fetchPromediosPonderados(grupoSeleccionado.id_grupo); // Recalcular promedios al guardar notas
            } else {
                alert(`❌ Error al guardar: ${data.message}`);
            }
        } catch (error) {
            alert("❌ Error de conexión al servidor.");
        }
    };


    // 7. GENERAR REPORTE DE ACTIVIDADES (PDF)
    const generarReportePDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text(`Reporte de Actividades: ${grupoSeleccionado.nombre}`, 14, 20);
        
        const headers = [
            ['Actividad', 'Rubro', 'Fecha', 'Máximo']
        ];
        const body = actividades.map(a => [
            a.nombre,
            rubros.find(r => r.id_rubro === a.id_rubro)?.nombre || 'N/A',
            a.fecha_entrega,
            a.puntaje_maximo
        ]);

        autoTable(doc, {
            head: headers,
            body: body,
            startY: 30,
            headStyles: { fillColor: [114, 46, 209] } // Morado
        });
        
        const blob = doc.output('bloburl');
        setPdfUrl(blob);
        setMostrarVistaPrevia(true);
    };


    // 8. RENDERIZADO PRINCIPAL
    const totalPorcentaje = rubros.reduce((acc, r) => acc + parseFloat(r.porcentaje), 0);
    
    // Datos para la gráfica de promedios
    const chartDataPromedios = {
        labels: promediosPonderados.map(p => p.nombre_completo.split(' ')[0]),
        datasets: [{
            label: 'Promedio Ponderado',
            data: promediosPonderados.map(p => p.promedio),
            backgroundColor: promediosPonderados.map(p => p.promedio < 60 ? 'rgba(255, 99, 132, 0.7)' : 'rgba(75, 192, 192, 0.7)'),
            borderWidth: 1,
        }]
    };
    
    const optionsPromedios = {
        responsive: true,
        scales: { 
            y: { beginAtZero: true, min: 0, max: 100, title: { display: true, text: 'Promedio (%)' } } 
        },
        plugins: { 
            legend: { display: false },
            title: { display: true, text: 'Promedios Finales Ponderados', color: temaOscuro ? 'white' : 'black' }
        }
    };


    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <button onClick={volverAlDashboard} style={{ ...estilosBotonVolver(temaOscuro), marginBottom: '20px' }}>⬅ Volver</button>

            <div style={{...estilos.tarjeta, padding: '20px', borderRadius: '15px', marginBottom: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                    <h2 style={{ color: '#722ed1', margin: 0 }}>{grupoSeleccionado ? grupoSeleccionado.nombre : 'Cargando...'}</h2>
                    
                    <select 
                        value={grupoSeleccionado ? grupoSeleccionado.id_grupo : ''} 
                        onChange={(e) => handleSeleccionarGrupo(grupos.find(g => g.id_grupo == e.target.value))} 
                        style={{ padding: '8px', borderRadius: '5px', fontSize: '1rem', border: '1px solid #ccc', minWidth: '200px' }}
                    >
                        {grupos.map(g => <option key={g.id_grupo} value={g.id_grupo}>{g.nombre}</option>)}
                    </select>
                </div>
                
                {/* Selector de Vistas */}
                <div style={estilosTabSelector}>
                    <button onClick={() => setVistaActual('actividades')} style={estilosBotonTab(vistaActual === 'actividades')}>📋 Actividades</button>
                    <button onClick={() => setVistaActual('rubros')} style={estilosBotonTab(vistaActual === 'rubros')}>⚖️ Rubros</button>
                    <button onClick={() => setVistaActual('dashboard_calificaciones')} style={estilosBotonTab(vistaActual === 'dashboard_calificaciones')}>📈 Dashboard</button>
                    {vistaActual === 'calificar' && <button style={estilosBotonTab(true)}>✏️ Calificar</button>}
                </div>
            </div>

            {/* --- VISTA DE ACTIVIDADES (DEFAULT) --- */}
            {vistaActual === 'actividades' && (
                <div style={{ ...estilos.tarjeta, padding: '30px', borderRadius: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3>Actividades Evaluables ({actividades.length})</h3>
                        <div style={{display:'flex', gap:'10px'}}>
                             <button onClick={generarReportePDF} style={estilosBotonAccion('#eb2f96')}>📄 Reporte PDF</button>
                             <button onClick={() => setMostrarModalActividad(true)} style={estilosBotonAccion('#28a745')}>+ Nueva Actividad</button>
                        </div>
                    </div>
                    
                    {actividades.length === 0 ? (
                        <p style={{opacity: 0.7}}>No hay actividades registradas. Crea una para empezar a calificar.</p>
                    ) : (
                        <div style={{ display: 'grid', gap: '15px' }}>
                            {actividades.map(act => (
                                <div key={act.id_actividad} style={estilosTarjetaActividad(temaOscuro)}>
                                    <div>
                                        <small style={{ color: '#722ed1', fontWeight: 'bold' }}>{rubros.find(r => r.id_rubro === act.id_rubro)?.nombre || 'Rubro Eliminado'}</small>
                                        <h4 style={{ margin: '5px 0' }}>{act.nombre}</h4>
                                        <small>Entrega: {act.fecha_entrega} | Max: {act.puntaje_maximo} pts</small>
                                    </div>
                                    <button onClick={() => iniciarCalificacion(act)} style={estilosBotonAccion('#646cff')}>
                                        ✏️ Calificar ({alumnos.length} alumnos)
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* --- VISTA DE RUBROS --- */}
            {vistaActual === 'rubros' && (
                <div style={{ ...estilos.tarjeta, padding: '30px', borderRadius: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3>Estructura de Rubros</h3>
                        <button onClick={() => handleAbrirModalRubro()} style={estilosBotonAccion('#fa8c16')}>+ Nuevo Rubro</button>
                    </div>
                    
                    {/* INDICADOR DE PORCENTAJE */}
                    <div style={{padding: '10px', background: totalPorcentaje === 100 ? '#e6f7ff' : '#fff1f0', border: totalPorcentaje === 100 ? '1px solid #91d5ff' : '1px solid #ffccc7', borderRadius: '8px', textAlign: 'center', marginBottom: '20px'}}>
                        <strong style={{color: totalPorcentaje === 100 ? '#1890ff' : '#ff4d4f'}}>Total Porcentaje Asignado: {totalPorcentaje}%</strong>
                        {totalPorcentaje !== 100 && <small style={{display:'block'}}> (Debe sumar 100% para un cálculo completo)</small>}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                        {rubros.map(r => (
                            <div key={r.id_rubro} style={estilosTarjetaRubro(temaOscuro)}>
                                <h4 style={{ margin: 0 }}>{r.nombre}</h4>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#722ed1' }}>{r.porcentaje}%</div>
                                <div style={{marginTop: '10px', display:'flex', justifyContent:'center', gap:'10px'}}>
                                    <button onClick={() => handleAbrirModalRubro(r)} style={{...estilosBotonAccion('#1890ff', 'auto', '0'), padding: '5px 10px'}}>Editar</button>
                                    <button onClick={() => handleEliminarRubro(r.id_rubro)} style={{...estilosBotonAccion('#ff4d4f', 'auto', '0'), padding: '5px 10px'}}>🗑️</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {/* --- VISTA DASHBOARD DE CALIFICACIONES (NUEVO) --- */}
            {vistaActual === 'dashboard_calificaciones' && (
                <div style={{ ...estilos.tarjeta, padding: '30px', borderRadius: '15px' }}>
                    <h3 style={{ color: '#722ed1', marginBottom: '20px' }}>📈 Promedios Ponderados (Finales)</h3>
                    
                    {promediosPonderados.length === 0 ? (
                        <p style={{textAlign:'center', opacity:0.7}}>No hay suficientes calificaciones para calcular promedios finales.</p>
                    ) : (
                        <>
                            <div style={{ height: '400px', display: 'flex', justifyContent: 'center', marginBottom:'30px' }}>
                                 <Bar 
                                    data={chartDataPromedios}
                                    options={optionsPromedios}
                                />
                            </div>
                            
                            <h4 style={{color:'#ff4d4f'}}>Alumnos en Riesgo (Promedio &lt; 60%)</h4>
                            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
                                {promediosPonderados
                                    .filter(p => p.promedio < 60)
                                    .map((p, index) => (
                                    <div key={index} style={{padding:'10px', background: temaOscuro ? '#444' : '#f0f0f0', borderRadius:'5px', borderLeft: '4px solid #ff4d4f'}}>
                                        <strong style={{color: '#ff4d4f'}}>{p.nombre_completo}</strong>
                                        <small style={{display:'block', opacity:0.8}}> ({p.promedio}%)</small>
                                    </div>
                                ))}
                            </div>

                        </>
                    )}
                </div>
            )}

            {/* --- VISTA ASIGNAR CALIFICACIONES --- */}
            {vistaActual === 'calificar' && actividadSeleccionada && (
                <div style={{ ...estilos.tarjeta, padding: '30px', borderRadius: '15px' }}>
                    <h3 style={{marginTop:0}}>Calificar: {actividadSeleccionada.nombre}</h3>
                    <p style={{opacity: 0.7}}>Máximo: {actividadSeleccionada.puntaje_maximo} puntos</p>
                    
                    <div style={{ display: 'grid', gap: '10px', marginTop: '20px' }}>
                        {alumnos.map(alum => (
                             <div key={alum.id_alumno} style={estilosFilaCalificacion(temaOscuro)}>
                                <div style={{ fontWeight: 'bold' }}>{alum.apellidos} {alum.nombre}</div>
                                <div>
                                    <input 
                                        type="number" 
                                        step="0.1" 
                                        min="0" 
                                        max={actividadSeleccionada.puntaje_maximo}
                                        value={calificacionesTemp[alum.id_alumno] || ''} 
                                        onChange={(e) => setCalificacionesTemp({...calificacionesTemp, [alum.id_alumno]: e.target.value})}
                                        placeholder="Puntaje"
                                        style={{ padding: '8px', width: '100px', borderRadius: '5px', border: '1px solid #ccc' }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <button onClick={handleGuardarCalificaciones} style={estilosBotonAccion('#52c41a', '100%', '20px')}>
                        💾 Guardar Calificaciones
                    </button>
                </div>
            )}

            {/* --- MODALES ACTIVIDAD / RUBRO / PDF --- */}
            {mostrarModalActividad && ( /* Modal Nueva Actividad */
                <div style={estiloOverlay}>
                    <div style={{ ...estilos.tarjeta, padding: '30px', borderRadius: '15px', width: '400px' }}>
                        <h3 style={{ color: '#333', marginTop: 0 }}>+ Nueva Actividad</h3>
                        <form onSubmit={handleGuardarActividad} style={{ display: 'grid', gap: '15px' }}>
                            <select 
                                value={formActividad.id_rubro} 
                                onChange={e => setFormActividad({...formActividad, id_rubro: e.target.value})}
                                style={estilosInput} required
                            >
                                <option value="">-- Selecciona Rubro --</option>
                                {rubros.map(r => <option key={r.id_rubro} value={r.id_rubro}>{r.nombre} ({r.porcentaje}%)</option>)}
                            </select>
                            <input type="text" placeholder="Nombre de la Actividad (Ej: Examen Unidad 1)" value={formActividad.nombre} onChange={e => setFormActividad({...formActividad, nombre: e.target.value})} style={estilosInput} required />
                            <input type="date" placeholder="Fecha de Entrega" value={formActividad.fecha_entrega} onChange={e => setFormActividad({...formActividad, fecha_entrega: e.target.value})} style={estilosInput} required />
                            <input type="number" step="0.1" placeholder="Puntaje Máximo (Ej: 10.0)" value={formActividad.puntaje_maximo} onChange={e => setFormActividad({...formActividad, puntaje_maximo: e.target.value})} style={estilosInput} required />
                            
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                                <button type="button" onClick={() => setMostrarModalActividad(false)} style={estilosBotonAccion('#ccc')}>Cancelar</button>
                                <button type="submit" style={estilosBotonAccion('#722ed1')}>Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {mostrarModalRubro && ( /* Modal Crear/Editar Rubro */
                <div style={estiloOverlay}>
                    <div style={{ ...estilos.tarjeta, padding: '30px', borderRadius: '15px', width: '400px' }}>
                        <h3 style={{ color: '#333', marginTop: 0 }}>{rubroEdicion ? '✏️ Editar Rubro' : '+ Nuevo Rubro'}</h3>
                        <p style={{opacity:0.7, color:'#666'}}>El total actual es del **{totalPorcentaje}%**.</p>
                        <form onSubmit={handleGuardarRubro} style={{ display: 'grid', gap: '15px' }}>
                            <input type="text" placeholder="Nombre (Ej: Exámenes Parciales)" value={formRubro.nombre} onChange={e => setFormRubro({...formRubro, nombre: e.target.value})} style={estilosInput} required />
                            <input type="number" step="0.1" min="0" max="100" placeholder="Porcentaje del Total (Ej: 50)" value={formRubro.porcentaje} onChange={e => setFormRubro({...formRubro, porcentaje: e.target.value})} style={estilosInput} required />
                            
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                                <button type="button" onClick={() => setMostrarModalRubro(false)} style={estilosBotonAccion('#ccc')}>Cancelar</button>
                                <button type="submit" style={estilosBotonAccion('#fa8c16')}>Guardar Rubro</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {mostrarVistaPrevia && ( /* Modal Vista Previa PDF */
                <div style={estiloOverlay}>
                     <div style={{ backgroundColor: 'white', width: '90%', height: '90%', borderRadius: '10px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ padding: '15px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
                            <h3 style={{ margin: 0, color: '#333' }}>Vista Previa de Reporte de Actividades</h3>
                            <button onClick={() => setMostrarVistaPrevia(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'red' }}>✖</button>
                        </div>
                        <iframe src={pdfUrl} style={{ flex: 1, border: 'none' }} title="Vista Previa PDF"></iframe>
                    </div>
                </div>
            )}

        </div>
    );
}

// --- ESTILOS COMPARTIDOS (Mantenemos los de Calificaciones) ---
const estilosTabSelector = { display: 'flex', marginTop: '20px', borderBottom: '2px solid #eee', paddingBottom: '5px' };
const estilosBotonTab = (activo) => ({ padding: '10px 15px', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 'bold', color: activo ? '#722ed1' : '#999', borderBottom: activo ? '2px solid #722ed1' : 'none' });
const estilosBotonAccion = (bg, width = 'auto', marginTop = '0px') => ({ background: bg, color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', width: width, marginTop: marginTop });
const estilosBotonVolver = (temaOscuro) => ({ background: 'transparent', border: '1px solid #ccc', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', color: temaOscuro ? 'white' : 'black' });
const estilosTarjetaRubro = (temaOscuro) => ({ padding: '15px', borderRadius: '8px', border: '1px solid #722ed1', background: temaOscuro ? '#3c324e' : '#f9f0ff', color: temaOscuro ? 'white' : '#333', textAlign: 'center' });
const estilosTarjetaActividad = (temaOscuro) => ({ padding: '15px', borderRadius: '8px', borderLeft: '5px solid #646cff', background: temaOscuro ? '#2a2a2a' : '#fcfcfc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' });
const estilosFilaCalificacion = (temaOscuro) => ({ padding: '15px', borderRadius: '8px', border: '1px solid #eee', background: temaOscuro ? '#333' : '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' });
const estiloOverlay = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' };
const estilosInput = { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' };

export default Calificaciones;