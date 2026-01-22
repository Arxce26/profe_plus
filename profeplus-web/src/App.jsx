import { useState } from 'react'
import './App.css'

// --- IMPORTAMOS LOS COMPONENTES ---
import BancoPreguntas from './components/BancoPreguntas';
import CreadorPreguntas from './components/CreadorPreguntas';
import Asistencia from './components/Asistencia';
import Planeacion from './components/Planeacion'; 
import Calificaciones from './components/Calificaciones';// <--- NUEVO IMPORT

function App() {
  // --- ESTADOS DE SESIÓN ---
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [usuario, setUsuario] = useState(null)
  const [error, setError] = useState('')
  
  // --- NAVEGACIÓN Y DATOS ---
  const [vista, setVista] = useState('dashboard') 
  const [listaGrupos, setListaGrupos] = useState([])
  const [listaAlumnos, setListaAlumnos] = useState([])
  
  // Contexto de selección
  const [grupoSeleccionado, setGrupoSeleccionado] = useState(null) // Nombre del grupo
  const [grupoIdSeleccionado, setGrupoIdSeleccionado] = useState(null) // ID del grupo
  
  // --- TEMA (Oscuro/Claro) ---
  const [temaOscuro, setTemaOscuro] = useState(false)

  // --- ESTADOS GESTIÓN ALUMNOS ---
  const [mostrarModalAlumno, setMostrarModalAlumno] = useState(false);
  const [alumnoEdicion, setAlumnoEdicion] = useState(null); // null = Nuevo, Objeto = Editar
  const [formAlumno, setFormAlumno] = useState({ nombre: '', apellidos: '', codigo: '' });

  // --- ESTADOS GESTIÓN GRUPOS (ARCHIVADO) ---
  const [mostrarModalGrupo, setMostrarModalGrupo] = useState(false);
  const [nombreNuevoGrupo, setNombreNuevoGrupo] = useState('');
  const [viendoArchivados, setViendoArchivados] = useState(false); // Toggle: Activos vs Archivados

  // --- ESTILOS GLOBALES ---
  const estilos = {
    app: { minHeight: '100vh', backgroundColor: temaOscuro ? '#1a1a1a' : '#f0f2f5', color: temaOscuro ? '#ffffff' : '#333333', fontFamily: 'Segoe UI, Roboto, Helvetica, Arial, sans-serif', transition: 'all 0.3s ease', paddingBottom: '80px' },
    tarjeta: { backgroundColor: temaOscuro ? '#2a2a2a' : '#ffffff', color: temaOscuro ? '#ffffff' : '#333333', border: temaOscuro ? '1px solid #444' : '1px solid #ddd', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
    input: { backgroundColor: temaOscuro ? '#333' : '#fff', color: temaOscuro ? '#fff' : '#000', border: '1px solid #ccc', padding: '12px', borderRadius: '8px', width: '100%', boxSizing: 'border-box' }
  }

  // ==========================================
  // LÓGICA DE LOGIN
  // ==========================================
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost/profe_plus/profeplus-api/login.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const data = await response.json();
      if (data.success) { setUsuario(data.user); setVista('dashboard'); } else { setError(data.message); }
    } catch (err) { setError("Error de conexión con el servidor"); }
  }

  // ==========================================
  // LÓGICA DE GRUPOS (ACTIVOS Y ARCHIVADOS)
  // ==========================================
  
  const cargarGrupos = (verArchivados = false) => {
    setViendoArchivados(verArchivados); // Actualizamos el estado visual
    
    fetch(`http://localhost/profe_plus/profeplus-api/get_grupos.php?id_profesor=${usuario.id}&archivados=${verArchivados ? 1 : 0}`)
      .then(res => res.json())
      .then(data => { setListaGrupos(data); setVista('grupos'); })
      .catch(err => console.error(err));
  }

  const guardarGrupo = async (e) => {
    e.preventDefault();
    if(!nombreNuevoGrupo.trim()) return;
    
    await fetch('http://localhost/profe_plus/profeplus-api/save_grupo.php', {
        method: 'POST', body: JSON.stringify({ id_profesor: usuario.id, nombre: nombreNuevoGrupo })
    });
    setNombreNuevoGrupo('');
    setMostrarModalGrupo(false);
    cargarGrupos(false); // Recargamos lista de activos
  };

  const archivarGrupo = async (id_grupo) => {
    if(!window.confirm("¿Archivar este grupo? \n\nDesaparecerá de tu lista activa, pero podrás verlo en el 'Archivo'.")) return;
    await fetch('http://localhost/profe_plus/profeplus-api/archive_grupo.php', {
        method: 'POST', body: JSON.stringify({ id_grupo })
    });
    cargarGrupos(false); // Recargamos activos
  };

  const restaurarGrupo = async (id_grupo) => {
    if(!window.confirm("¿Restaurar este grupo a la lista activa?")) return;
    await fetch('http://localhost/profe_plus/profeplus-api/unarchive_grupo.php', {
        method: 'POST', body: JSON.stringify({ id_grupo })
    });
    cargarGrupos(true); // Recargamos archivados para ver que se fue
  };

  // ==========================================
  // LÓGICA DE ALUMNOS (ALTAS, BAJAS, CAMBIOS)
  // ==========================================
  const cargarAlumnos = (id_grupo, nombre_grupo) => {
    setGrupoSeleccionado(nombre_grupo);
    setGrupoIdSeleccionado(id_grupo);
    fetch(`http://localhost/profe_plus/profeplus-api/get_alumnos.php?id_grupo=${id_grupo}`)
      .then(res => res.json())
      .then(data => { setListaAlumnos(data); setVista('alumnos'); });
  }

  const abrirModalNuevo = () => { setAlumnoEdicion(null); setFormAlumno({ nombre: '', apellidos: '', codigo: '' }); setMostrarModalAlumno(true); };
  
  const abrirModalEditar = (alumno) => { setAlumnoEdicion(alumno); setFormAlumno({ nombre: alumno.nombre, apellidos: alumno.apellidos, codigo: alumno.codigo_escolar }); setMostrarModalAlumno(true); };
  
  const guardarAlumno = async (e) => {
    e.preventDefault();
    const payload = { 
        id_grupo: grupoIdSeleccionado, 
        id_alumno: alumnoEdicion ? alumnoEdicion.id_alumno : 0, 
        nombre: formAlumno.nombre, 
        apellidos: formAlumno.apellidos, 
        codigo_escolar: formAlumno.codigo 
    };
    await fetch('http://localhost/profe_plus/profeplus-api/save_alumno.php', { method: 'POST', body: JSON.stringify(payload) });
    setMostrarModalAlumno(false); 
    cargarAlumnos(grupoIdSeleccionado, grupoSeleccionado);
  };

  const eliminarAlumno = async (id_alumno) => {
    if(!window.confirm("¿Dar de baja a este alumno? Se borrarán sus asistencias.")) return;
    await fetch('http://localhost/profe_plus/profeplus-api/delete_alumno.php', { method: 'POST', body: JSON.stringify({ id_alumno }) });
    cargarAlumnos(grupoIdSeleccionado, grupoSeleccionado);
  };


  // ==========================================
  // VISTA: LOGIN (SI NO HAY USUARIO)
  // ==========================================
  if (!usuario) {
    return (
      <div style={{ ...estilos.app, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ ...estilos.tarjeta, padding: '40px', borderRadius: '15px', width: '350px', textAlign: 'center', position: 'relative' }}>
           <div style={{ position: 'absolute', top: 20, right: 20 }}><button onClick={() => setTemaOscuro(!temaOscuro)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>{temaOscuro ? '☀️' : '🌙'}</button></div>
          <h1 style={{ color: '#646cff', marginBottom: '10px' }}>ProfePlus</h1>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input type="email" placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} style={estilos.input} required />
            <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} style={estilos.input} required />
            <button type="submit" style={{ padding: '12px', borderRadius: '8px', border: 'none', background: '#646cff', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Entrar</button>
          </form>
          {error && <p style={{ color: '#ff4d4f', marginTop: '15px' }}>⚠️ {error}</p>}
        </div>
      </div>
    )
  }

  // ==========================================
  // VISTA: APLICACIÓN PRINCIPAL (SI HAY USUARIO)
  // ==========================================
  return (
    <div style={estilos.app}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #ccc' }}>
          <div><h2 style={{ margin: 0 }}>Hola, {usuario.nombre} 👋</h2><small style={{ opacity: 0.7 }}>Panel Principal</small></div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setTemaOscuro(!temaOscuro)} style={{ background: 'transparent', border: '1px solid #ccc', borderRadius: '5px', padding: '5px 10px', fontSize: '1.2rem', cursor: 'pointer' }}>{temaOscuro ? '☀️' : '🌙'}</button>
            <button onClick={() => setUsuario(null)} style={{ background: '#ff4d4f', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}>Salir</button>
          </div>
        </div>

        {/* --- PANTALLA 1: DASHBOARD --- */}
        {vista === 'dashboard' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            
            <div onClick={() => cargarGrupos(false)} style={estiloTarjetaMenu('#e6f7ff', '#1890ff', temaOscuro)}>
                <span style={{ fontSize: '2rem' }}>📚</span><h3 style={{color: '#333'}}>Mis Grupos</h3>
            </div>
            
            <div onClick={() => setVista('asistencia')} style={estiloTarjetaMenu('#fff7e6', '#fa8c16', temaOscuro)}>
                <span style={{ fontSize: '2rem' }}>📅</span><h3 style={{color: '#333'}}>Asistencia</h3>
            </div>
            
            {/* NUEVO BOTÓN PLANEACIÓN */}
            <div onClick={() => setVista('planeacion')} style={estiloTarjetaMenu('#e6fffb', '#13c2c2', temaOscuro)}>
                <span style={{ fontSize: '2rem' }}>📋</span><h3 style={{color: '#333'}}>Planeación</h3>
                <p style={{color: '#555'}}>Didáctica & Live</p>
            </div>

            <div onClick={() => setVista('banco_preguntas')} style={estiloTarjetaMenu('#f6ffed', '#52c41a', temaOscuro)}>
                <span style={{ fontSize: '2rem' }}>📝</span><h3 style={{color: '#333'}}>Banco Preguntas</h3>
            </div>
            
            <div onClick={() => setVista('creador')} style={estiloTarjetaMenu('#fff0f6', '#eb2f96', temaOscuro)}>
                <span style={{ fontSize: '2rem' }}>✨</span><h3 style={{color: '#333'}}>Crear</h3><p style={{color: '#555'}}>Nueva Pregunta</p>
            </div>
            
            <div style={estiloTarjetaMenu('#f0f0f0', '#999', temaOscuro)}>
                <span style={{ fontSize: '2rem' }}>⚙️</span><h3 style={{color: '#333'}}>Ajustes</h3>
            </div>

            {/* NUEVO BOTÓN CALIFICACIONES */}
            <div onClick={() => setVista('calificaciones')} style={estiloTarjetaMenu('#f9f0ff', '#722ed1', temaOscuro)}>
                <span style={{ fontSize: '2rem' }}>💯</span><h3 style={{color: '#333'}}>Calificaciones</h3>
                <p style={{color: '#555'}}>Rubros y Actividades</p>
            </div>



          </div>

        )}
            

        

        {/* --- PANTALLA 2: LISTA DE GRUPOS (CON ARCHIVADOS) --- */}
        {vista === 'grupos' && (
          <div>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                <div style={{display:'flex', gap:'10px'}}>
                    <button onClick={() => setVista('dashboard')} style={{ background: 'transparent', border: '1px solid #ccc', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', color: temaOscuro ? 'white' : 'black' }}>⬅ Volver</button>
                    <button 
                        onClick={() => cargarGrupos(!viendoArchivados)} 
                        style={{ background: viendoArchivados ? '#666' : '#eee', color: viendoArchivados ? 'white' : '#333', border: 'none', padding: '5px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight:'bold' }}
                    >
                        {viendoArchivados ? '📂 Ver Activos' : '🗄️ Ver Archivo'}
                    </button>
                </div>
                {!viendoArchivados && (
                    <button onClick={() => setMostrarModalGrupo(true)} style={{ background: '#646cff', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>+ Crear Grupo</button>
                )}
            </div>
            
            <h2 style={{ color: viendoArchivados ? '#999' : '#646cff' }}>{viendoArchivados ? '🗄️ Grupos Archivados' : '📚 Mis Clases Activas'}</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
              {listaGrupos.map(grupo => (
                <div key={grupo.id_grupo} style={{ 
                    ...estilos.tarjeta, padding: '20px', borderRadius: '10px', 
                    borderLeft: viendoArchivados ? '5px solid #999' : '5px solid #646cff', 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: viendoArchivados ? 0.8 : 1
                }}>
                  <div>
                      <h3 style={{margin:0, color: viendoArchivados ? '#666' : 'inherit'}}>{grupo.nombre}</h3>
                      {viendoArchivados && <small>Ciclo Cerrado</small>}
                  </div>
                  <div style={{display:'flex', gap:'10px'}}>
                      <button onClick={() => cargarAlumnos(grupo.id_grupo, grupo.nombre)} style={{ background: viendoArchivados ? '#999' : '#646cff', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}>{viendoArchivados ? 'Ver Datos' : 'Administrar'}</button>
                      
                      {viendoArchivados ? (
                          <button onClick={() => restaurarGrupo(grupo.id_grupo)} title="Restaurar" style={{ background: '#e6f7ff', border: '1px solid #1890ff', color: '#1890ff', padding: '8px', borderRadius: '5px', cursor: 'pointer' }}>⬆️</button>
                      ) : (
                          <button onClick={() => archivarGrupo(grupo.id_grupo)} title="Archivar" style={{ background: 'transparent', border: '1px solid #ccc', color: '#666', padding: '8px', borderRadius: '5px', cursor: 'pointer' }}>📁</button>
                      )}
                  </div>
                </div>
              ))}
              {listaGrupos.length === 0 && <p style={{opacity:0.6, fontStyle:'italic', textAlign:'center', padding:'20px', border:'1px dashed #ccc'}}>Lista vacía.</p>}
            </div>
          </div>
        )}

        {/* --- PANTALLA 3: ALUMNOS --- */}
        {vista === 'alumnos' && (
          <div>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                <button onClick={() => cargarGrupos(viendoArchivados)} style={{ background: 'transparent', border: '1px solid #ccc', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', color: temaOscuro ? 'white' : 'black' }}>⬅ Volver a Grupos</button>
                {!viendoArchivados && (
                    <button onClick={abrirModalNuevo} style={{ background: '#28a745', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>+ Nuevo Alumno</button>
                )}
            </div>
            <div style={{ ...estilos.tarjeta, padding: '20px', borderRadius: '10px' }}>
              <h2>🎓 Alumnos: <span style={{ color: '#646cff' }}>{grupoSeleccionado}</span></h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                  <thead><tr style={{ background: temaOscuro ? '#444' : '#f8f9fa', textAlign: 'left' }}><th style={{ padding: '12px' }}>Matrícula</th><th style={{ padding: '12px' }}>Apellidos</th><th style={{ padding: '12px' }}>Nombres</th><th style={{ padding: '12px', textAlign: 'center' }}>Acciones</th></tr></thead>
                  <tbody>
                    {listaAlumnos.map((alumno) => (
                      <tr key={alumno.id_alumno} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px', fontWeight: 'bold', color: '#888' }}>{alumno.codigo_escolar}</td><td style={{ padding: '12px' }}>{alumno.apellidos}</td><td style={{ padding: '12px' }}>{alumno.nombre}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                            {viendoArchivados ? (
                                <span style={{color:'#999'}}>Solo lectura</span>
                            ) : (
                                <>
                                <button onClick={() => abrirModalEditar(alumno)} title="Editar" style={{marginRight:'10px', background:'transparent', border:'none', cursor:'pointer', fontSize:'1.2rem'}}>✏️</button>
                                <button onClick={() => eliminarAlumno(alumno.id_alumno)} title="Dar de Baja" style={{background:'transparent', border:'none', cursor:'pointer', fontSize:'1.2rem'}}>🗑️</button>
                                </>
                            )}
                        </td>
                      </tr>
                    ))}
                    {listaAlumnos.length === 0 && <tr><td colSpan="4" style={{padding:'20px', textAlign:'center', opacity:0.6}}>No hay alumnos registrados.</td></tr>}
                  </tbody>
                </table>
            </div>
          </div>
        )}

        {/* --- PANTALLAS MODULARES --- */}
        {vista === 'banco_preguntas' && <BancoPreguntas temaOscuro={temaOscuro} estilos={estilos} volverAlDashboard={() => setVista('dashboard')} />}
        {vista === 'creador' && <CreadorPreguntas temaOscuro={temaOscuro} estilos={estilos} volverAlDashboard={() => setVista('dashboard')} />}
        {vista === 'asistencia' && <Asistencia usuario={usuario} temaOscuro={temaOscuro} estilos={estilos} volverAlDashboard={() => setVista('dashboard')} />}
        {vista === 'calificaciones' && <Calificaciones usuario={usuario} temaOscuro={temaOscuro} estilos={estilos} volverAlDashboard={() => setVista('dashboard')} />}


        
        {/* MODULO DE PLANEACIÓN (NUEVO) */}
        {vista === 'planeacion' && <Planeacion usuario={usuario} temaOscuro={temaOscuro} estilos={estilos} volverAlDashboard={() => setVista('dashboard')} />}

        {/* --- MODAL ALUMNO --- */}
        {mostrarModalAlumno && (
             <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ background: 'white', padding: '30px', borderRadius: '15px', width: '350px' }}>
                    <h2 style={{color: '#333', marginTop:0}}>{alumnoEdicion ? '✏️ Editar Alumno' : '🎓 Nuevo Alumno'}</h2>
                    <form onSubmit={guardarAlumno} style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                        <div><label style={{display:'block', marginBottom:'5px', color:'#555', fontWeight:'bold'}}>Matrícula:</label><input type="text" value={formAlumno.codigo} onChange={(e)=>setFormAlumno({...formAlumno, codigo:e.target.value})} required style={estilos.input} /></div>
                        <div><label style={{display:'block', marginBottom:'5px', color:'#555', fontWeight:'bold'}}>Nombre(s):</label><input type="text" value={formAlumno.nombre} onChange={(e)=>setFormAlumno({...formAlumno, nombre:e.target.value})} required style={estilos.input} /></div>
                        <div><label style={{display:'block', marginBottom:'5px', color:'#555', fontWeight:'bold'}}>Apellidos:</label><input type="text" value={formAlumno.apellidos} onChange={(e)=>setFormAlumno({...formAlumno, apellidos:e.target.value})} required style={estilos.input} /></div>
                        <div style={{display:'flex', justifyContent:'flex-end', gap:'10px', marginTop:'10px'}}><button type="button" onClick={()=>setMostrarModalAlumno(false)} style={{background:'#ccc', border:'none', padding:'10px', borderRadius:'5px', cursor:'pointer'}}>Cancelar</button><button type="submit" style={{background:'#646cff', color:'white', border:'none', padding:'10px 20px', borderRadius:'5px', cursor:'pointer', fontWeight:'bold'}}>Guardar</button></div>
                    </form>
                </div>
             </div>
        )}

        {/* --- MODAL CREAR GRUPO --- */}
        {mostrarModalGrupo && (
             <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ background: 'white', padding: '30px', borderRadius: '15px', width: '350px' }}>
                    <h2 style={{color: '#333', marginTop:0}}>📚 Nuevo Grupo</h2>
                    <p style={{color:'#666', fontSize:'0.9rem'}}>Ejemplo: "3° B - Matemáticas 2025"</p>
                    <form onSubmit={guardarGrupo} style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                        <input type="text" value={nombreNuevoGrupo} onChange={(e)=>setNombreNuevoGrupo(e.target.value)} placeholder="Nombre del Grupo" required style={estilos.input} autoFocus />
                        <div style={{display:'flex', justifyContent:'flex-end', gap:'10px', marginTop:'10px'}}>
                            <button type="button" onClick={()=>setMostrarModalGrupo(false)} style={{background:'#ccc', border:'none', padding:'10px', borderRadius:'5px', cursor:'pointer'}}>Cancelar</button>
                            <button type="submit" style={{background:'#646cff', color:'white', border:'none', padding:'10px 20px', borderRadius:'5px', cursor:'pointer', fontWeight:'bold'}}>Crear</button>
                        </div>
                    </form>
                </div>
             </div>
        )}

      </div>
    </div>
  )
}

const estiloTarjetaMenu = (bg, border, esOscuro) => ({ background: bg, border: `1px solid ${border}`, borderRadius: '15px', padding: '25px', textAlign: 'center', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', opacity: esOscuro ? 0.9 : 1 })

export default App