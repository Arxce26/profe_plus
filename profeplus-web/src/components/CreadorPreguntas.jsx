import { useState, useEffect, useRef } from 'react';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

function CreadorPreguntas({ temaOscuro, volverAlDashboard, estilos }) {
  
  // Estados del Formulario
  const [enunciado, setEnunciado] = useState('');
  const [formula, setFormula] = useState('');
  const [dificultad, setDificultad] = useState('Facil');
  const [temaId, setTemaId] = useState('');
  
  // Datos y UI
  const [temasDisponibles, setTemasDisponibles] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState('Basico');
  
  // CRÍTICO: Estado para controlar errores de LaTeX
  const [latexError, setLatexError] = useState(false);

  // REFERENCIA PARA EL EDITOR (CURSOR INTELIGENTE)
  const editorRef = useRef(null);

  // --- DICCIONARIO DE SÍMBOLOS Y PLANTILLAS ---
  const CATEGORIAS_SIMBOLOS = {
    'Basico': [
      { label: 'x^n', codigo: 'x^{2}', desc: 'Potencia' },
      { label: '\\sqrt{x}', codigo: '\\sqrt{x}', desc: 'Raíz' },
      { label: '\\frac{a}{b}', codigo: '\\frac{a}{b}', desc: 'Fracción' },
      { label: '()', codigo: '\\left( x \\right)', desc: 'Paréntesis Ajustables' },
      { label: '\\boxed{x}', codigo: '\\boxed{x}', desc: 'Caja Resaltada' },
      { label: '\\text{txt}', codigo: '\\text{hola}', desc: 'Texto Normal' },
    ],
    'Calculo': [
      { label: '\\int', codigo: '\\int_{0}^{x}', desc: 'Integral' },
      { label: '\\iint', codigo: '\\iint_{R}', desc: 'Integral Doble' },
      { label: '\\sum', codigo: '\\sum_{n=1}^{\\infty}', desc: 'Sumatoria' },
      { label: '\\lim', codigo: '\\lim_{x \\to \\infty}', desc: 'Límite' },
      { label: '\\partial', codigo: '\\frac{\\partial f}{\\partial x}', desc: 'Derivada Parcial' },
      { label: 'dx', codigo: '\\, dx', desc: 'Diferencial' },
    ],
    'Operadores': [ // <--- NUEVA CATEGORÍA MATEMÁTICA CORRECTA
      { label: 'Var', codigo: '\\operatorname{Var}(X)', desc: 'Varianza' },
      { label: 'Cov', codigo: '\\operatorname{Cov}(X,Y)', desc: 'Covarianza' },
      { label: 'rank', codigo: '\\operatorname{rank}(A)', desc: 'Rango' },
      { label: 'diag', codigo: '\\operatorname{diag}(A)', desc: 'Diagonal' },
    ],
    'Avanzado': [
      { label: '\\nabla', codigo: '\\nabla', desc: 'Gradiente' },
      { label: '\\Delta', codigo: '\\Delta', desc: 'Laplaciano' },
      { label: '\\mathbb{E}', codigo: '\\mathbb{E}[X]', desc: 'Esperanza Matemática' },
      { label: '\\mathbb{P}', codigo: '\\mathbb{P}(A)', desc: 'Probabilidad' },
      { label: '\\mathcal{N}', codigo: '\\mathcal{N}(\\mu, \\sigma^2)', desc: 'Dist. Normal' },
      { label: '\\sim', codigo: '\\sim', desc: 'Sigue distribución' },
      { label: '\\limsup', codigo: '\\limsup_{n \\to \\infty}', desc: 'Límite Superior' },
      { label: '\\Tr', codigo: '\\operatorname{Tr}(A)', desc: 'Traza' },
    ],
    'Matrices': [
      { label: 'Matriz 2x2', codigo: '\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}', desc: 'Matriz 2x2' },
      { label: '\\det', codigo: '\\det(A)', desc: 'Determinante' },
      { label: '\\|x\\|', codigo: '\\left\\| x \\right\\|', desc: 'Norma Vectorial' },
      { label: '\\in', codigo: '\\in', desc: 'Pertenece' },
      { label: '\\mathbb{R}', codigo: '\\mathbb{R}', desc: 'Reales' },
      { label: '\\mathbb{C}', codigo: '\\mathbb{C}', desc: 'Complejos' },
    ],
    'Logica': [
      { label: '\\forall', codigo: '\\forall', desc: 'Para todo' },
      { label: '\\exists', codigo: '\\exists', desc: 'Existe' },
      { label: '\\implies', codigo: '\\implies', desc: 'Implica' },
      { label: '\\iff', codigo: '\\iff', desc: 'Si y solo si' },
      { label: '\\neq', codigo: '\\neq', desc: 'Diferente' },
      { label: '\\leq', codigo: '\\leq', desc: 'Menor igual' },
    ],
    'Plantillas': [
      { label: 'Sistema Ecuaciones', desc: 'Sistema de ecuaciones alineado', codigo: `\\begin{aligned}
  2x + y &= 10 \\\\
  x - y &= 2
\\end{aligned}` },
      { label: 'Definición Función', desc: 'Función por partes (Cases)', codigo: `f(x) = \\begin{cases} 
  x^2 & \\text{si } x < 0 \\\\
  x   & \\text{si } x \\geq 0
\\end{cases}` },
      { label: 'Teorema Complejo', desc: 'Ecuación larga multilínea', codigo: `\\begin{aligned}
  \\mathbb{E}\\left[ \\sup_{t \\in [0,T]} |X_t|^2 \\right] 
  &\\leq C \\sum_{n=1}^{\\infty} \\frac{1}{n^2} \\\\
  &= \\frac{C \\pi^2}{6}
\\end{aligned}` }
    ]
  };

  // --- RESETEAR ERROR AL ESCRIBIR ---
  useEffect(() => {
    setLatexError(false);
  }, [formula]);

  // --- FUNCIÓN DE INSERCIÓN INTELIGENTE ---
  const insertarTexto = (textoAInsertar) => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const nuevoTexto = 
      formula.substring(0, start) + 
      textoAInsertar + 
      formula.substring(end);

    setFormula(nuevoTexto);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + textoAInsertar.length, start + textoAInsertar.length);
    }, 0);
  };

  // --- MANEJO DE CLICS EN BOTONES ---
  const handleSimboloClick = (sim) => {
    // LÓGICA DE REEMPLAZO VS INSERCIÓN
    if (categoriaActiva === 'Plantillas') {
        // Si es plantilla, reemplaza todo para evitar caos
        setFormula(sim.codigo);
    } else {
        // Si es símbolo, inserta donde está el cursor
        insertarTexto(sim.codigo);
    }
  };

  // Cargar temas al inicio
  useEffect(() => {
    fetch('http://localhost/profe_plus/profeplus-api/get_preguntas.php')
      .then(res => res.json())
      .then(data => {
        const unicos = [];
        const map = new Map();
        for (const item of data) {
            if(!map.has(item.tema)){
                map.set(item.tema, true);   
                unicos.push({id: item.id_tema, nombre: item.tema});
            }
        }
        setTemasDisponibles(unicos);
        if(unicos.length > 0) setTemaId(unicos[0].id);
      });
  }, []);

  const guardarPregunta = async (e) => {
    e.preventDefault();
    setMensaje('');

    // --- VALIDACIONES DE SEGURIDAD ---
    if (!formula.trim()) {
        setMensaje('❌ La fórmula no puede estar vacía');
        return;
    }
    
    if (latexError) {
        setMensaje('❌ Corrige la sintaxis LaTeX antes de guardar (Revisa si hay llaves sin cerrar o comandos mal escritos)');
        return;
    }
    // --------------------------------

    setMensaje('Guardando...');

    const datos = {
      id_tema: temaId,
      enunciado: enunciado,
      latex_formula: formula,
      dificultad: dificultad
    };

    try {
      const response = await fetch('http://localhost/profe_plus/profeplus-api/save_pregunta.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });
      const resultado = await response.json();
      
      if(resultado.success) {
        setMensaje('✅ ¡Guardado correctamente!');
        setEnunciado('');
        setFormula('');
      } else {
        setMensaje('❌ Error: ' + resultado.message);
      }
    } catch (error) {
      setMensaje('❌ Error de conexión');
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <button onClick={volverAlDashboard} style={{ marginBottom: '20px', background: 'transparent', border: '1px solid #ccc', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', color: temaOscuro ? 'white' : 'black' }}>
        ⬅ Cancelar y Volver
      </button>

      <div style={{ ...estilos.tarjeta, padding: '30px', borderRadius: '15px' }}>
        <h2 style={{ color: '#646cff', marginTop: 0 }}>✨ Editor Científico de Reactivos</h2>
        <p style={{ opacity: 0.7 }}>Crea preguntas con notación matemática avanzada.</p>

        <form onSubmit={guardarPregunta} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* SELECCIÓN DE TEMA */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', background: temaOscuro ? '#333' : '#f5f5f5', padding: '15px', borderRadius: '10px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>📂 Tema:</label>
              <select 
                value={temaId} onChange={(e) => setTemaId(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
              >
                {temasDisponibles.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>📊 Dificultad:</label>
              <select 
                value={dificultad} onChange={(e) => setDificultad(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
              >
                <option value="Facil">🟢 Fácil</option>
                <option value="Medio">🟡 Medio</option>
                <option value="Dificil">🔴 Difícil</option>
              </select>
            </div>
          </div>

          {/* ENUNCIADO TEXTO */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Enunciado:</label>
            <textarea 
              value={enunciado} onChange={(e) => setEnunciado(e.target.value)}
              placeholder="Ej: Calcule la siguiente integral impropia..."
              required
              style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #ccc', minHeight: '60px', fontFamily: 'sans-serif' }}
            />
          </div>

          {/* --- EDITOR PODEROSO --- */}
          <div style={{ background: temaOscuro ? '#333' : '#f9f9f9', padding: '20px', borderRadius: '10px', border: '1px solid #eee' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#646cff' }}>🧮 Consola Matemática (LaTeX):</label>
            
            {/* PESTAÑAS */}
            <div style={{ display: 'flex', gap: '5px', marginBottom: '10px', overflowX: 'auto', paddingBottom: '5px' }}>
              {Object.keys(CATEGORIAS_SIMBOLOS).map(cat => (
                <button
                  key={cat} type="button" onClick={() => setCategoriaActiva(cat)}
                  style={{
                    padding: '6px 15px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                    background: categoriaActiva === cat ? '#646cff' : '#ddd',
                    color: categoriaActiva === cat ? 'white' : '#333',
                    fontWeight: 'bold', fontSize: '0.9rem'
                  }}
                >
                  {cat === 'Plantillas' ? '⭐ Plantillas' : cat}
                </button>
              ))}
            </div>

            {/* BOTONERA */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '15px', minHeight: '40px', maxHeight: '150px', overflowY: 'auto' }}>
              {CATEGORIAS_SIMBOLOS[categoriaActiva].map((sim, index) => (
                <button
                  key={index} type="button" 
                  onClick={() => handleSimboloClick(sim)} // Usamos la nueva lógica mejorada
                  title={sim.desc}
                  style={{
                    background: 'white', border: '1px solid #ccc', borderRadius: '5px',
                    padding: '8px 12px', cursor: 'pointer', color: '#333',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    minWidth: '40px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}
                >
                  {/* Si es plantilla o texto largo, ponemos descripción, si no, la fórmula */}
                  {categoriaActiva === 'Plantillas' || sim.label.length > 15 
                    ? <span style={{fontSize:'0.8rem', fontWeight: 'bold'}}>{sim.label}</span>
                    : <InlineMath math={sim.label} />}
                </button>
              ))}
            </div>

            {/* ADVERTENCIA VISIBLE SOBRE QUÉ SOPORTA KATEX */}
            <small style={{ color: '#999', display: 'block', marginBottom: '10px' }}>
              ⚠️ KaTeX soporta: <b>aligned, cases, matrix</b>. No usar <b>align</b> ni paquetes externos.
            </small>

            {/* AREA DE TEXTO CON REF (CURSOR INTELIGENTE) */}
            <textarea 
              ref={editorRef}
              value={formula} 
              onChange={(e) => setFormula(e.target.value)}
              placeholder="Escribe código LaTeX o usa los botones..."
              style={{ 
                width: '100%', padding: '15px', borderRadius: '8px', border: latexError ? '2px solid red' : '2px solid #646cff', 
                fontFamily: 'monospace', fontSize: '1.1rem', minHeight: '120px', backgroundColor: temaOscuro ? '#222' : '#fff', color: temaOscuro ? '#fff' : '#000'
              }}
            />
            
            {/* BOTÓN LIMPIAR FÓRMULA (BONUS) */}
            <button
                type="button"
                onClick={() => setFormula('')}
                style={{ marginTop: '10px', background: '#ddd', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem', color: '#333' }}
            >
                🧹 Limpiar fórmula
            </button>

            {/* VISTA PREVIA EN VIVO CON MANEJO DE ERROR ROBUSTO */}
            <div style={{ marginTop: '20px', minHeight: '100px', background: 'white', padding: '20px', borderRadius: '8px', border: '1px dashed #ccc', color: 'black', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', overflowX: 'auto', maxWidth: '100%' }}>
              <small style={{color: '#999', marginBottom: '10px', alignSelf: 'flex-start'}}>Vista Previa:</small>
              <div style={{ overflowX: 'auto', width: '100%', textAlign: 'center' }}>
                {formula ? (
                  <BlockMath 
                    math={formula} 
                    renderError={(error) => {
                      // Solo seteamos el error si no estaba activo para evitar loops infinitos
                      if (!latexError) setLatexError(true);
                      return <span style={{color: '#cc0000', fontWeight: 'bold'}}>⚠️ Error de sintaxis LaTeX: {error.name}</span>
                    }}
                  />
                ) : (
                  <span style={{color: '#ccc', fontStyle: 'italic'}}>La ecuación aparecerá aquí...</span>
                )}
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            style={{ 
              background: latexError ? '#ccc' : '#28a745', // Deshabilitado visualmente si hay error
              color: 'white', border: 'none', padding: '15px', 
              borderRadius: '8px', fontSize: '1.2rem', fontWeight: 'bold', cursor: latexError ? 'not-allowed' : 'pointer',
              marginTop: '10px', boxShadow: '0 4px 10px rgba(40, 167, 69, 0.3)'
            }}
            disabled={latexError} // Deshabilitado funcionalmente
          >
            💾 Guardar Reactivo
          </button>

          {mensaje && (
            <div style={{ textAlign: 'center', padding: '10px', borderRadius: '5px', background: mensaje.includes('Error') || mensaje.includes('❌') ? '#ffebee' : '#e6fffa', color: mensaje.includes('Error') || mensaje.includes('❌') ? 'red' : 'green' }}>
              {mensaje}
            </div>
          )}

        </form>
      </div>
    </div>
  );
}

export default CreadorPreguntas;