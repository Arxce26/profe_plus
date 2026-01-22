import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function Planeacion({ usuario, temaOscuro, volverAlDashboard, estilos }) {
  
  // ESTADOS
  const [grupos, setGrupos] = useState([]);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState('');
  const [listaPlanes, setListaPlanes] = useState([]);
  
  const [modo, setModo] = useState('lista'); // 'lista', 'editar', 'clase_live'
  
  // Estado para Vista Previa PDF
  const [mostrarVistaPrevia, setMostrarVistaPrevia] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

  // Formulario
  const [planActual, setPlanActual] = useState({
      id: 0, semana: '', tema: '', objetivo: '',
      inicio: '', desarrollo: '', cierre: '',
      materiales: '', evaluacion: ''
  });

  // Estado para MODO CLASE (LIVE)
  const [faseClase, setFaseClase] = useState(0); // 0=Inicio, 1=Desarrollo, 2=Cierre
  const [cronometro, setCronometro] = useState(0);
  const [timerActivo, setTimerActivo] = useState(false);

  // 1. Cargar Grupos
  useEffect(() => {
    fetch(`http://localhost/profe_plus/profeplus-api/get_grupos.php?id_profesor=${usuario.id}`)
      .then(res => res.json())
      .then(data => {
        setGrupos(data);
        if(data.length > 0) cargarPlanes(data[0].id_grupo);
      });
  }, []);

  const cargarPlanes = (idGrupo) => {
      setGrupoSeleccionado(idGrupo);
      fetch(`http://localhost/profe_plus/profeplus-api/get_planeaciones.php?id_grupo=${idGrupo}`)
        .then(res => res.json())
        .then(data => setListaPlanes(data));
  };

  // --- GENERAR VISTA PREVIA PDF (CORREGIDO) ---
  const generarVistaPrevia = (plan) => {
      const doc = new jsPDF();
      const grupoNombre = grupos.find(g => g.id_grupo == grupoSeleccionado)?.nombre || '';

      // Encabezado
      doc.setFontSize(16); 
      doc.setTextColor(40);
      doc.text("Planeación Didáctica", 105, 15, null, null, 'center');
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Profesor: ${usuario.nombre}`, 14, 25);
      doc.text(`Grupo: ${grupoNombre}`, 14, 30);
      doc.text(`Fecha/Semana: ${plan.semana_o_fecha}`, 14, 35);
      
      // Tabla de Contenido
      autoTable(doc, {
          startY: 40,
          head: [['Concepto', 'Descripción']],
          body: [
              ['Tema', plan.tema],
              ['Objetivo (Aprendizaje)', plan.objetivo],
              ['Inicio', plan.inicio],
              ['Desarrollo', plan.desarrollo],
              ['Cierre', plan.cierre],
              ['Materiales', plan.materiales],
              ['Evaluación', plan.evaluacion],
          ],
          styles: { cellPadding: 4, fontSize: 10, valign: 'middle' },
          headStyles: { fillColor: [100, 108, 255] }, // Color morado ProfePlus
          columnStyles: {
              0: { cellWidth: 40, fontStyle: 'bold' }, // Columna Concepto
              1: { cellWidth: 'auto' } // Columna Descripción
          }
      });

      // Pie de página
      const totalPaginas = doc.internal.getNumberOfPages();
      doc.setFontSize(8);
      for (let i = 1; i <= totalPaginas; i++) {
          doc.setPage(i);
          doc.text(`Generado por ProfePlus - Pág ${i}/${totalPaginas}`, 14, doc.internal.pageSize.height - 10);
      }

      // Generar Blob URL y mostrar Modal
      const blob = doc.output('bloburl');
      setPdfUrl(blob);
      setMostrarVistaPrevia(true);
  };

  // --- GUARDAR PLAN ---
  const guardarPlan = async (e) => {
      e.preventDefault();
      const payload = {
          id_planeacion: planActual.id,
          id_profesor: usuario.id,
          id_grupo: grupoSeleccionado,
          semana: planActual.semana, tema: planActual.tema, objetivo: planActual.objetivo,
          inicio: planActual.inicio, desarrollo: planActual.desarrollo, cierre: planActual.cierre,
          materiales: planActual.materiales, evaluacion: planActual.evaluacion
      };
      
      await fetch('http://localhost/profe_plus/profeplus-api/save_planeacion.php', {
          method: 'POST', body: JSON.stringify(payload)
      });
      setModo('lista');
      cargarPlanes(grupoSeleccionado);
  };

  const nuevoPlan = () => {
      setPlanActual({ id: 0, semana: '', tema: '', objetivo: '', inicio: '', desarrollo: '', cierre: '', materiales: '', evaluacion: '' });
      setModo('editar');
  };

  const editarPlan = (p) => {
      setPlanActual({ 
          id: p.id_planeacion, semana: p.semana_o_fecha, tema: p.tema, objetivo: p.objetivo,
          inicio: p.inicio, desarrollo: p.desarrollo, cierre: p.cierre,
          materiales: p.materiales, evaluacion: p.evaluacion
      });
      setModo('editar');
  };

  // --- MODO CLASE LIVE ---
  const iniciarClase = (plan) => {
      setPlanActual({ 
        semana: plan.semana_o_fecha, tema: plan.tema, objetivo: plan.objetivo,
        inicio: plan.inicio, desarrollo: plan.desarrollo, cierre: plan.cierre
      });
      setFaseClase(0); // 0=Inicio
      setCronometro(0);
      setTimerActivo(true);
      setModo('clase_live');
  };

  // Cronómetro
  useEffect(() => {
      let interval = null;
      if (timerActivo && modo === 'clase_live') {
          interval = setInterval(() => setCronometro(c => c + 1), 1000);
      } else {
          clearInterval(interval);
      }
      return () => clearInterval(interval);
  }, [timerActivo, modo]);

  const formatoTiempo = (segundos) => {
      const min = Math.floor(segundos / 60);
      const seg = segundos % 60;
      return `${min}:${seg < 10 ? '0' : ''}${seg}`;
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* ENCABEZADO COMÚN (Solo si no está en modo LIVE) */}
        {modo !== 'clase_live' && (
            <>
            <button onClick={volverAlDashboard} style={{ marginBottom: '20px', background: 'transparent', border: '1px solid #ccc', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', color: temaOscuro ? 'white' : 'black' }}>⬅ Volver</button>
            <div style={{...estilos.tarjeta, padding: '20px', borderRadius: '15px', marginBottom:'20px'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <h2 style={{margin:0, color:'#646cff'}}>📋 Planeaciones Didácticas</h2>
                    <select value={grupoSeleccionado} onChange={(e) => cargarPlanes(e.target.value)} style={{padding:'8px', borderRadius:'5px'}}>
                        {grupos.map(g => <option key={g.id_grupo} value={g.id_grupo}>{g.nombre}</option>)}
                    </select>
                </div>
            </div>
            </>
        )}

        {/* --- VISTA 1: LISTA DE PLANES --- */}
        {modo === 'lista' && (
            <div>
                <button onClick={nuevoPlan} style={{width:'100%', padding:'15px', background:'#28a745', color:'white', border:'none', borderRadius:'10px', fontSize:'1.1rem', cursor:'pointer', marginBottom:'20px', fontWeight:'bold'}}>+ Nueva Planeación</button>
                <div style={{display:'grid', gap:'15px'}}>
                    {listaPlanes.map(p => (
                        <div key={p.id_planeacion} style={{...estilos.tarjeta, padding:'20px', borderRadius:'10px', borderLeft:'5px solid #646cff', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                            <div>
                                <h3 style={{margin:0}}>{p.tema}</h3>
                                <small style={{opacity:0.7}}>{p.semana_o_fecha}</small>
                            </div>
                            <div style={{display:'flex', gap:'10px'}}>
                                <button onClick={() => iniciarClase(p)} style={{background:'#646cff', color:'white', border:'none', padding:'8px 15px', borderRadius:'5px', cursor:'pointer', fontWeight:'bold'}}>▶️ Clase</button>
                                
                                {/* BOTÓN DE VISTA PREVIA (MODIFICADO) */}
                                <button onClick={() => generarVistaPrevia(p)} style={{background:'#ff4d4f', color:'white', border:'none', padding:'8px 15px', borderRadius:'5px', cursor:'pointer'}}>📄 PDF</button>
                                
                                <button onClick={() => editarPlan(p)} style={{background:'#fa8c16', color:'white', border:'none', padding:'8px 15px', borderRadius:'5px', cursor:'pointer'}}>✏️</button>
                            </div>
                        </div>
                    ))}
                    {listaPlanes.length === 0 && <p style={{textAlign:'center', opacity:0.6}}>No hay planes creados para este grupo.</p>}
                </div>
            </div>
        )}

        {/* --- VISTA 2: EDITOR (FORMULARIO) --- */}
        {modo === 'editar' && (
            <div style={{...estilos.tarjeta, padding:'30px', borderRadius:'15px'}}>
                <h3 style={{marginTop:0}}>✏️ {planActual.id ? 'Editar Plan' : 'Nuevo Plan'}</h3>
                <form onSubmit={guardarPlan} style={{display:'grid', gap:'15px'}}>
                    <div style={{display:'grid', gridTemplateColumns:'1fr 2fr', gap:'15px'}}>
                        <input type="text" placeholder="Semana / Fecha" value={planActual.semana} onChange={e => setPlanActual({...planActual, semana:e.target.value})} style={{padding:'10px', border:'1px solid #ccc', borderRadius:'5px'}} required />
                        <input type="text" placeholder="Tema Principal" value={planActual.tema} onChange={e => setPlanActual({...planActual, tema:e.target.value})} style={{padding:'10px', border:'1px solid #ccc', borderRadius:'5px'}} required />
                    </div>
                    <textarea placeholder="Objetivo / Aprendizaje Esperado" value={planActual.objetivo} onChange={e => setPlanActual({...planActual, objetivo:e.target.value})} style={{padding:'10px', border:'1px solid #ccc', borderRadius:'5px', height:'60px'}} />
                    
                    <h4 style={{margin:'10px 0 5px', color:'#646cff'}}>Secuencia Didáctica</h4>
                    <textarea placeholder="🔴 INICIO (¿Cómo introducirás el tema?)" value={planActual.inicio} onChange={e => setPlanActual({...planActual, inicio:e.target.value})} style={{padding:'10px', border:'1px solid #ccc', borderRadius:'5px', height:'80px'}} />
                    <textarea placeholder="🟡 DESARROLLO (Explicación y Actividades)" value={planActual.desarrollo} onChange={e => setPlanActual({...planActual, desarrollo:e.target.value})} style={{padding:'10px', border:'1px solid #ccc', borderRadius:'5px', height:'100px'}} />
                    <textarea placeholder="🟢 CIERRE (Conclusión y Tarea)" value={planActual.cierre} onChange={e => setPlanActual({...planActual, cierre:e.target.value})} style={{padding:'10px', border:'1px solid #ccc', borderRadius:'5px', height:'80px'}} />
                    
                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px'}}>
                        <textarea placeholder="📦 Materiales y Recursos" value={planActual.materiales} onChange={e => setPlanActual({...planActual, materiales:e.target.value})} style={{padding:'10px', border:'1px solid #ccc', borderRadius:'5px', height:'60px'}} />
                        <textarea placeholder="📝 Evaluación" value={planActual.evaluacion} onChange={e => setPlanActual({...planActual, evaluacion:e.target.value})} style={{padding:'10px', border:'1px solid #ccc', borderRadius:'5px', height:'60px'}} />
                    </div>

                    <div style={{display:'flex', justifyContent:'flex-end', gap:'10px', marginTop:'10px'}}>
                        <button type="button" onClick={() => setModo('lista')} style={{padding:'10px 20px', background:'#ccc', border:'none', borderRadius:'5px', cursor:'pointer'}}>Cancelar</button>
                        <button type="submit" style={{padding:'10px 20px', background:'#646cff', color:'white', border:'none', borderRadius:'5px', cursor:'pointer', fontWeight:'bold'}}>Guardar Plan</button>
                    </div>
                </form>
            </div>
        )}

        {/* --- VISTA 3: MODO CLASE LIVE --- */}
        {modo === 'clase_live' && (
            <div style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background: temaOscuro ? '#1a1a1a' : '#fff', zIndex:2000, display:'flex', flexDirection:'column'}}>
                
                {/* Header Live */}
                <div style={{padding:'15px 30px', background:'#646cff', color:'white', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <div>
                        <h2 style={{margin:0}}>{planActual.tema}</h2>
                        <span style={{opacity:0.9}}>Objetivo: {planActual.objetivo}</span>
                    </div>
                    <div style={{textAlign:'right'}}>
                        <div style={{fontSize:'2rem', fontWeight:'bold', fontFamily:'monospace'}}>⏱ {formatoTiempo(cronometro)}</div>
                        <button onClick={() => setModo('lista')} style={{background:'rgba(0,0,0,0.3)', border:'none', color:'white', padding:'5px 10px', borderRadius:'5px', cursor:'pointer'}}>❌ Salir</button>
                    </div>
                </div>

                {/* Cuerpo Live */}
                <div style={{flex:1, padding:'40px', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', textAlign:'center', overflowY:'auto'}}>
                    
                    <h3 style={{color: faseClase === 0 ? '#ff4d4f' : (faseClase === 1 ? '#fa8c16' : '#52c41a'), textTransform:'uppercase', letterSpacing:'2px'}}>
                        {faseClase === 0 ? '🔴 Fase 1: Inicio' : (faseClase === 1 ? '🟡 Fase 2: Desarrollo' : '🟢 Fase 3: Cierre')}
                    </h3>
                    
                    <p style={{fontSize:'2rem', lineHeight:'1.5', whiteSpace:'pre-wrap', maxWidth:'800px'}}>
                        {faseClase === 0 ? planActual.inicio : (faseClase === 1 ? planActual.desarrollo : planActual.cierre)}
                    </p>

                </div>

                {/* Controles de Navegación */}
                <div style={{padding:'20px', borderTop:'1px solid #ccc', display:'flex', justifyContent:'center', gap:'20px', background: temaOscuro ? '#2a2a2a' : '#f0f0f0'}}>
                    <button disabled={faseClase === 0} onClick={() => setFaseClase(f => f - 1)} style={{padding:'15px 30px', fontSize:'1.2rem', borderRadius:'10px', border:'none', cursor:'pointer', background: faseClase === 0 ? '#ccc' : '#fff'}}>⬅ Anterior</button>
                    <button disabled={faseClase === 2} onClick={() => setFaseClase(f => f + 1)} style={{padding:'15px 30px', fontSize:'1.2rem', borderRadius:'10px', border:'none', cursor:'pointer', background:'#646cff', color:'white', fontWeight:'bold'}}>Siguiente Fase ➡</button>
                </div>

            </div>
        )}

        {/* --- MODAL VISTA PREVIA PDF (NUEVO) --- */}
        {mostrarVistaPrevia && (
            <div style={estiloOverlay}>
                 <div style={{ backgroundColor: 'white', width: '90%', height: '90%', borderRadius: '10px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ padding: '15px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
                        <h3 style={{ margin: 0, color: '#333' }}>Vista Previa Planeación</h3>
                        <button onClick={() => setMostrarVistaPrevia(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'red' }}>✖</button>
                    </div>
                    <iframe src={pdfUrl} style={{ flex: 1, border: 'none' }} title="Vista Previa PDF"></iframe>
                </div>
            </div>
        )}

    </div>
  );
}

const estiloOverlay = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' };

export default Planeacion;