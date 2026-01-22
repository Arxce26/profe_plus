import { useState, useEffect, useRef } from 'react';
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas'; // <--- IMPORTANTE: LA CÁMARA

// --- DICCIONARIO DE AYUDAS DIDÁCTICAS ---
// Nota: Ahora las fórmulas están en LaTeX para que se rendericen bonitas
const GUIA_DIDACTICA = {
  'Trigonometria': {
    titulo: 'Identidades Trigonométricas',
    formula: '\\sin^2(x) + \\cos^2(x) = 1', 
    ejemplo: 'Ejemplo: Si sin(x) = 0.6, halla cos(x).\nSolución:\n1. (0.6)^2 + cos^2(x) = 1\n2. 0.36 + cos^2(x) = 1\n3. cos^2(x) = 1 - 0.36 = 0.64\n4. cos(x) = sqrt(0.64) = 0.8'
  },
  'Derivadas': {
    titulo: 'Regla de la Potencia',
    formula: '\\frac{d}{dx}(x^n) = n \\cdot x^{n-1}',
    ejemplo: 'Ejemplo: Deriva f(x) = x^3\nSolución:\n1. Identificamos n = 3\n2. Bajamos el 3 y restamos 1 al exponente\n3. f\'(x) = 3x^2'
  },
  'Geometria Analitica': {
    titulo: 'Teorema de Pitágoras',
    formula: 'c = \\sqrt{a^2 + b^2}',
    ejemplo: 'Ejemplo: Catetos 3 y 4. Hallar hipotenusa.\nSolución:\n1. c = sqrt(3^2 + 4^2)\n2. c = sqrt(9 + 16)\n3. c = sqrt(25) -> c = 5'
  },
  'Todos': {
    titulo: 'Repaso General',
    formula: '\\text{Selecciona un tema para ver fórmulas.}',
    ejemplo: 'Selecciona un tema específico.'
  }
};

function BancoPreguntas({ temaOscuro, volverAlDashboard, estilos }) {
  const [listaPreguntas, setListaPreguntas] = useState([]);
  const [examen, setExamen] = useState([]); 
  const [temaSeleccionado, setTemaSeleccionado] = useState('Todos');
  const [tipoDocumento, setTipoDocumento] = useState('Guia');
  
  const [pdfUrl, setPdfUrl] = useState(null); 
  const [mostrarModal, setMostrarModal] = useState(false);
  const [generandoPDF, setGenerandoPDF] = useState(false); // Nuevo estado para mostrar "Cargando..."

  // Referencia para capturar el cuadro de la guía didáctica
  const guiaRef = useRef(null);

  useEffect(() => {
    fetch('http://localhost/profe_plus/profeplus-api/get_preguntas.php')
      .then(res => res.json())
      .then(data => setListaPreguntas(data))
      .catch(err => console.error(err));
  }, []);

  const temasDisponibles = ['Todos', ...new Set(listaPreguntas.map(p => p.tema))];

  const preguntasFiltradas = temaSeleccionado === 'Todos' 
    ? listaPreguntas 
    : listaPreguntas.filter(p => p.tema === temaSeleccionado);

  const togglePregunta = (pregunta) => {
    const existe = examen.find(p => p.id_pregunta === pregunta.id_pregunta);
    if (existe) { setExamen(examen.filter(p => p.id_pregunta !== pregunta.id_pregunta)); } 
    else { setExamen([...examen, pregunta]); }
  };

  // --- GENERADOR DE PDF AVANZADO (ASÍNCRONO) ---
  // Ahora es 'async' porque tomar fotos toma tiempo
  const crearDocumentoPDFAsync = async () => {
    const doc = new jsPDF();
    const margenIzq = 20;
    let y = 20;

    // 1. ENCABEZADO
    doc.setFontSize(22); doc.setTextColor(40);
    const tituloDoc = tipoDocumento === 'Guia' ? 'Ficha de Estudio' : 'Examen Parcial';
    doc.text(tituloDoc, 105, y, null, null, "center"); y+=8;
    doc.setFontSize(10);
    doc.text(`Tema: ${temaSeleccionado} | Fecha: ________________`, 105, y, null, null, "center"); y+=4;
    doc.setLineWidth(0.5); doc.line(20, y, 190, y); y+=15;

    // 2. CAPTURAR GUÍA DIDÁCTICA (FOTO)
    if (tipoDocumento === 'Guia' && guiaRef.current) {
        try {
            // Tomamos la foto del cuadro gris que está en pantalla
            const canvas = await html2canvas(guiaRef.current, { scale: 2 }); // Escala 2 para mejor calidad
            const imgData = canvas.toDataURL('image/png');
            // Calculamos dimensiones para que quepa en el PDF
            const imgProps = doc.getImageProperties(imgData);
            const pdfWidth = 170; // Ancho disponible
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            doc.addImage(imgData, 'PNG', margenIzq, y, pdfWidth, pdfHeight);
            y += pdfHeight + 15; // Bajamos el cursor lo que mida la imagen
        } catch (error) {
            console.error("Error capturando guía:", error);
            doc.text("(Error al renderizar la guía visual)", margenIzq, y); y+=10;
        }
    }

    // 3. EJERCICIOS (TEXTO + FOTOS)
    doc.setFontSize(14); doc.setFont("helvetica", "bold"); doc.setTextColor(0);
    doc.text("EJERCICIOS PRÁCTICOS:", margenIzq, y); y += 10;

    // Usamos un bucle for...of para poder usar 'await' adentro
    for (const [index, preg] of examen.entries()) {
      if (y > 260) { doc.addPage(); y = 20; }

      // Número y Enunciado (Texto)
      doc.setFontSize(12); doc.setFont("helvetica", "bold");
      doc.text(`${index + 1}.`, margenIzq, y);
      doc.setFont("helvetica", "normal");
      const splitEnunciado = doc.splitTextToSize(preg.enunciado, 160);
      doc.text(splitEnunciado, margenIzq + 10, y);
      y += (splitEnunciado.length * 5) + 5;

      // Capturar Fórmula de la pregunta (FOTO)
      if (preg.latex_formula) {
          // Buscamos el elemento en el DOM por su ID único
          const formulaElement = document.getElementById(`formula-${preg.id_pregunta}`);
          if (formulaElement) {
              try {
                  const canvas = await html2canvas(formulaElement, { scale: 2, backgroundColor: null });
                  const imgData = canvas.toDataURL('image/png');
                  const imgProps = doc.getImageProperties(imgData);
                  // Ajustamos el ancho si es muy grande, si no, usamos su tamaño natural (escalado)
                  let pdfWidth = imgProps.width * 0.264583 / 2; // Conversión px a mm aproximada y ajuste de escala
                  let pdfHeight = imgProps.height * 0.264583 / 2;
                  
                  // Si es muy ancho, lo limitamos
                  if(pdfWidth > 150) {
                      pdfWidth = 150;
                      pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                  }

                  doc.addImage(imgData, 'PNG', margenIzq + 10, y, pdfWidth, pdfHeight);
                  y += pdfHeight + 5;
              } catch (e) {
                 doc.text(`(Fórmula: ${preg.latex_formula})`, margenIzq+10, y); y+=10;
              }
          }
      }

      // Línea separadora
      y += 20; doc.setDrawColor(200); doc.line(margenIzq, y, 190, y); y += 10; 
    }

    return doc;
  }

  // --- MANEJADORES DE BOTONES ---
  const handleAbrirVistaPrevia = async () => {
    setGenerandoPDF(true); // Mostrar "Cargando..."
   
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const doc = await crearDocumentoPDFAsync();
    const pdfBlob = doc.output('bloburl');
    setPdfUrl(pdfBlob);
    setGenerandoPDF(false);
    setMostrarModal(true);
  }

  const handleDescargarPDF = async () => {
    setGenerandoPDF(true);
    
    await new Promise(resolve => setTimeout(resolve, 500));

    const doc = await crearDocumentoPDFAsync();
    doc.save(`${tipoDocumento}_${temaSeleccionado}.pdf`);
    setGenerandoPDF(false);
    setMostrarModal(false);
  }

  const infoGuia = GUIA_DIDACTICA[temaSeleccionado] || GUIA_DIDACTICA['Todos'];

  return (
    <div style={{ position: 'relative' }}> {/* Necesario para el loader */}
      <button onClick={volverAlDashboard} style={{ marginBottom: '20px', background: 'transparent', border: '1px solid #ccc', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', color: temaOscuro ? 'white' : 'black' }}>⬅ Volver</button>
      
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
        <h2 style={{ color: '#646cff', margin: 0 }}>🧮 Material Didáctico</h2>
        <div style={{ display: 'flex', gap: '10px', background: temaOscuro ? '#333' : '#eee', padding: '10px', borderRadius: '8px' }}>
          <select value={tipoDocumento} onChange={(e) => setTipoDocumento(e.target.value)} style={{ padding: '8px', borderRadius: '5px' }}><option value="Guia">📚 Crear Guía</option><option value="Examen">📝 Crear Examen</option></select>
          <select value={temaSeleccionado} onChange={(e) => setTemaSeleccionado(e.target.value)} style={{ padding: '8px', borderRadius: '5px' }}>{temasDisponibles.map(tema => ( <option key={tema} value={tema}>{tema}</option> ))}</select>
        </div>
      </div>

      {/* --- CUADRO DE GUÍA DIDÁCTICA (SE MUESTRA EN PANTALLA PARA PODER TOMARLE FOTO) --- */}
      {tipoDocumento === 'Guia' && (
          <div ref={guiaRef} style={{ backgroundColor: temaOscuro ? '#2a2a2a' : '#f0f2f5', padding: '20px', borderRadius: '10px', marginBottom: '30px', borderLeft: '5px solid #646cff' }}>
              <h3 style={{ color: '#646cff', marginTop: 0 }}>📘 RECORDATORIO: {infoGuia.titulo}</h3>
              <div style={{ fontSize: '1.3rem', margin: '15px 0', textAlign: 'center' }}>
                  {/* Renderizamos la fórmula con BlockMath para que se vea bonita */}
                  <BlockMath math={infoGuia.formula} />
              </div>
              <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.9rem', background: temaOscuro ? '#333' : '#fff', padding: '15px', borderRadius: '5px' }}>
                {infoGuia.ejemplo}
              </div>
          </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', marginBottom: '80px' }}>
        {preguntasFiltradas.map(preg => {
            const estaSeleccionada = examen.find(e => e.id_pregunta === preg.id_pregunta);
            return (
              <div key={preg.id_pregunta} style={{ ...estilos.tarjeta, padding: '25px', borderRadius: '10px', borderLeft: estaSeleccionada ? '5px solid #52c41a' : '5px solid #eb2f96', backgroundColor: estaSeleccionada ? (temaOscuro ? '#1f2e1f' : '#f6ffed') : estilos.tarjeta.backgroundColor }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}><small style={{background: '#eee', padding: '2px 5px', borderRadius: '3px', color: '#333'}}>{preg.tema}</small><strong style={{color: preg.dificultad === 'Facil' ? 'green' : 'orange'}}>{preg.dificultad}</strong></div>
                <p style={{ fontSize: '1.1rem', marginBottom: '10px' }}>{preg.enunciado}</p>
                {preg.latex_formula && (
                  // --- AQUÍ ESTÁ EL ID IMPORTANTE PARA LA FOTO ---
                  <div id={`formula-${preg.id_pregunta}`} style={{ padding: '5px', textAlign: 'center', overflowX: 'auto' }}>
                    <BlockMath math={preg.latex_formula} />
                  </div>
                )}
                <div style={{ marginTop: '10px', textAlign: 'right' }}>
                   <button onClick={() => togglePregunta(preg)} style={{ background: estaSeleccionada ? '#52c41a' : '#eb2f96', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>{estaSeleccionada ? '✅ Agregada' : '+ Incluir'}</button>
                </div>
              </div>
            )
        })}
      </div>

      {examen.length > 0 && !mostrarModal && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', backgroundColor: temaOscuro ? '#333' : 'white', borderTop: '1px solid #ccc', padding: '15px 20px', boxShadow: '0 -4px 10px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 100 }}>
          <h3 style={{ margin: 0, color: '#646cff' }}>{examen.length} seleccionados</h3>
          {/* Usamos la nueva función async */}
          <button onClick={handleAbrirVistaPrevia} disabled={generandoPDF} style={{ backgroundColor: '#646cff', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', opacity: generandoPDF ? 0.7 : 1 }}>
            {generandoPDF ? '⏳ Generando...' : '👁️ Vista Previa'}
          </button>
        </div>
      )}

      {/* MODAL Y LOADER */}
      {(mostrarModal || generandoPDF) && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {generandoPDF ? (
              <div style={{color: 'white', fontSize: '2rem'}}>📸 Tomando fotos de las fórmulas...</div>
          ) : (
            <div style={{ backgroundColor: 'white', width: '90%', height: '90%', borderRadius: '10px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '15px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
                <h3 style={{ margin: 0, color: '#333' }}>Vista Previa</h3>
                <button onClick={() => setMostrarModal(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'red' }}>✖</button>
                </div>
                <iframe src={pdfUrl} style={{ flex: 1, border: 'none' }} title="Vista Previa"></iframe>
                <div style={{ padding: '15px', display: 'flex', justifyContent: 'flex-end', gap: '15px', borderTop: '1px solid #ddd' }}>
                {/* Usamos la nueva función async */}
                <button onClick={handleDescargarPDF} style={{ padding: '10px 20px', border: 'none', background: '#28a745', color: 'white', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                    💾 Descargar PDF
                </button>
                </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BancoPreguntas;