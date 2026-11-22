// NeumoSpace — visor 3D (Three.js) e interfaz
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// ------------------------------------------------------------------ Datos anatómicos
const PARTES = {
  pulmon_derecho: {
    nombre: 'Pulmón derecho', corto: 'Pulmón der.', color: '#C9584A', dato: '3 lóbulos · 10 segmentos',
    desc: 'Es el más ancho y corto de los dos pulmones. Las fisuras horizontal y oblicua lo dividen en tres lóbulos: superior, medio e inferior. Aquí ocurre el intercambio de oxígeno y dióxido de carbono.',
    ubic: 'Ocupa el hemitórax derecho. Su base descansa sobre la cúpula derecha del diafragma, por encima del hígado, y recibe el bronquio principal derecho por el hilio pulmonar.'
  },
  pulmon_izquierdo: {
    nombre: 'Pulmón izquierdo', corto: 'Pulmón izq.', color: '#B8473C', dato: '2 lóbulos · 8–10 segmentos',
    desc: 'Es más estrecho y largo que el derecho porque deja espacio al corazón. La fisura oblicua lo divide en dos lóbulos, superior e inferior; el superior incluye la língula.',
    ubic: 'Ocupa el hemitórax izquierdo. Su borde anterior presenta la escotadura cardíaca y su base se apoya sobre la cúpula izquierda del diafragma, en relación con el bazo y el estómago.'
  },
  traquea: {
    nombre: 'Tráquea y bronquios', corto: 'Tráquea', color: '#E8B4A2', dato: '16–20 anillos cartilaginosos',
    desc: 'Conducto de anillos cartilaginosos en forma de C que lleva el aire desde la laringe hasta los pulmones. En la carina se divide en los bronquios principales, que se ramifican formando el árbol bronquial.',
    ubic: 'Va desde la vértebra C6 hasta T4–T5, por delante del esófago. El bronquio principal derecho es más corto, ancho y vertical que el izquierdo.'
  },
  laringe: {
    nombre: 'Laringe e hioides', corto: 'Laringe', color: '#D4A08F', dato: '9 cartílagos',
    desc: 'Órgano que conecta la faringe con la tráquea. Protege la vía aérea durante la deglución y contiene las cuerdas vocales, responsables de la voz. Está suspendida del hueso hioides.',
    ubic: 'En la parte anterior del cuello, entre las vértebras C3 y C6. La membrana tirohioidea la une al hueso hioides, que sirve de anclaje a músculos del cuello y la lengua.'
  },
  glandula_tiroides: {
    nombre: 'Glándula tiroides', corto: 'Tiroides', color: '#9E3A33', dato: 'Istmo sobre los anillos 2–4',
    desc: 'Glándula endocrina con forma de mariposa que produce las hormonas tiroideas (T3 y T4), reguladoras del metabolismo. No forma parte de la vía aérea, pero es una relación anatómica clave de la tráquea.',
    ubic: 'Sus lóbulos rodean las caras anterior y lateral de la tráquea y la laringe; el istmo cruza por delante de los anillos traqueales 2.º a 4.º.'
  }
};
const ORDEN = ['pulmon_derecho', 'pulmon_izquierdo', 'traquea', 'laringe', 'glandula_tiroides'];
// Colores anatómicos para las piezas que vienen sin textura en el modelo
const COLORES_MATERIAL = {
  'Thyroid_gland.001':          { color: 0x8E2E2A, roughness: 0.5 },
  'Tussen_hyoid_en_thyroid.001':{ color: 0xC98A7B, roughness: 0.6 },
  'Hyoid_bone.001':             { color: 0xE6D9C4, roughness: 0.55 },
  'bronchi1.001':               { color: 0xD0604F, roughness: 0.45 },
  'Trachea_kraakbeen.001':      { color: 0xEBB8A6, roughness: 0.5 },
};
// Etiquetas flotantes: dónde apuntan (posición relativa dentro de la pieza)
const HOTSPOTS = [
  { parte: 'traquea',         rel: [0.5, 0.72, 0.5], sub: 'Ver ficha →' },
  { parte: 'laringe',         rel: [0.5, 0.5, 0.5],  sub: 'Ver ficha →' },
  { parte: 'pulmon_derecho',  rel: [0.35, 0.35, 0.5], sub: 'Ver ficha →' },
  { parte: 'pulmon_izquierdo',rel: [0.65, 0.4, 0.5], sub: 'Ver ficha →' },
];

// ------------------------------------------------------------------ Escena
const lienzo = document.getElementById('escena');
const hero = document.getElementById('inicio');

// «Explorar ahora» convierte la misma landing en un visor a pantalla completa con fondo negro.
// También se puede entrar directo con index.html?explorar=1[&parte=id]
const PARAMS = new URLSearchParams(location.search);
const MODO_VISOR = PARAMS.has('explorar');
if (MODO_VISOR) { document.body.classList.add('visor'); hero.classList.remove('presentacion'); hero.classList.add('explorando'); }
function abrirVisor(parte) {
  window.scrollTo({ top: 0, behavior: 'instant' });
  entrarExploracion(parte);
}
const renderer = new THREE.WebGLRenderer({ canvas: lienzo, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const escena = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
escena.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
escena.environmentIntensity = 0.55;

const camara = new THREE.PerspectiveCamera(26, 1, 0.01, 200);
const luzClave = new THREE.DirectionalLight(0xfff0e6, 2.4); luzClave.position.set(2.5, 3.5, 4);
const luzContra = new THREE.DirectionalLight(0xff2a4d, 3.2); luzContra.position.set(-3, 2, -4);
const luzContra2 = new THREE.DirectionalLight(0xff6f86, 1.4); luzContra2.position.set(3.5, -1, -3);
const hemi = new THREE.HemisphereLight(0xffffff, 0x2a0006, 0.45);
escena.add(luzClave, luzContra, luzContra2, hemi);

const modelo = new THREE.Group();
escena.add(modelo);

// Anillo 360° bajo el modelo
const anillo = new THREE.Mesh(
  new THREE.TorusGeometry(1.05, 0.004, 8, 160),
  new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 })
);
anillo.rotation.x = Math.PI / 2;
const brillo = new THREE.Mesh(
  new THREE.CircleGeometry(1.05, 96),
  new THREE.MeshBasicMaterial({ color: 0xE81A40, transparent: true, opacity: 0.08, depthWrite: false })
);
brillo.rotation.x = -Math.PI / 2;
const base = new THREE.Group(); base.add(anillo, brillo); escena.add(base);

const controles = new OrbitControls(camara, lienzo);
controles.enableDamping = true; controles.dampingFactor = 0.07;
controles.enablePan = false; controles.enableZoom = false;
controles.autoRotate = true; controles.autoRotateSpeed = 0.45;
controles.minPolarAngle = 0.45; controles.maxPolarAngle = 2.5;
controles.rotateSpeed = 0.7;
controles.enabled = false; // en la presentación el modelo solo gira; se activa al pulsar «Explorar ahora»
lienzo.style.touchAction = 'pan-y'; // en celular el deslizamiento vertical sigue haciendo scroll

// ------------------------------------------------------------------ Estado
const partes = {};          // id -> { nodo, mallas[], mats[] }
let seleccion = null, hover = null, aislada = null, etiquetas = true;
let explorando = false;                 // false = presentación, true = funciones activas
const transparentes = new Set();       // piezas que el usuario volvió transparentes en Capas
let nivelTransparencia = 0.75;          // 0 = sólido, 1 = invisible
const visibles = Object.fromEntries(ORDEN.map(id => [id, true]));
let distanciaBase = 6, distancia = 6, objetivoDeseado = new THREE.Vector3();
const miniaturas = {};
const hotspotsDOM = [];

// ------------------------------------------------------------------ Carga del modelo
const barra = document.getElementById('carga-progreso');
const textoCarga = document.getElementById('carga-txt');
const TAM_ESTIMADO = 4576612;
// Primero el archivo junto a la página (tu PC / hosting); si no existe, la copia publicada.
const RUTAS_MODELO = ['assets/modelos/pulmon.glb'];
function cargarModelo(i = 0) {
new GLTFLoader().load(RUTAS_MODELO[i], (gltf) => {
  prepararModelo(gltf.scene);
  generarMiniaturas();
  construirInterfaz();
  prepararRespiracion();
  if (MODO_VISOR) entrarExploracion(PARTES[PARAMS.get('parte')] ? PARAMS.get('parte') : null);
  barra.style.width = '100%';
  textoCarga.textContent = 'Listo';
  setTimeout(() => document.getElementById('carga').classList.add('oculto'), 350);
}, (xhr) => {
  const total = xhr.total || TAM_ESTIMADO;
  const p = Math.min(99, Math.round(xhr.loaded / total * 100));
  barra.style.width = p + '%';
  textoCarga.textContent = 'Cargando modelo 3D · ' + p + '%';
}, (err) => {
  if (i + 1 < RUTAS_MODELO.length) return cargarModelo(i + 1);
  console.error(err);
  textoCarga.textContent = 'No se pudo cargar el modelo';
});
}
cargarModelo();

function prepararModelo(raiz) {
  // Centrar y escalar a 2.2 unidades de alto
  const caja = new THREE.Box3().setFromObject(raiz);
  const tam = caja.getSize(new THREE.Vector3());
  const centro = caja.getCenter(new THREE.Vector3());
  const s = 2.2 / tam.y;
  raiz.scale.multiplyScalar(s);
  raiz.position.sub(centro.multiplyScalar(s));
  modelo.add(raiz);
  modelo.updateMatrixWorld(true);

  for (const id of ORDEN) {
    const nodo = raiz.getObjectByName(id);
    if (!nodo) continue;
    const mallas = [], mats = [];
    nodo.traverse((o) => {
      if (!o.isMesh) return;
      const original = o.material;
      const conf = COLORES_MATERIAL[original.name];
      let m;
      if (conf) m = new THREE.MeshStandardMaterial({ color: conf.color, roughness: conf.roughness, metalness: 0, side: THREE.DoubleSide });
      else { m = original.clone(); m.envMapIntensity = 0.9; }
      m.emissive = new THREE.Color(0xE81A40); m.emissiveIntensity = 0;
      o.material = m; o.userData.parte = id;
      mallas.push(o); mats.push(m);
    });
    partes[id] = { nodo, mallas, mats };
  }
  // Base del anillo a los pies del modelo
  const cajaFinal = new THREE.Box3().setFromObject(modelo);
  base.position.y = cajaFinal.min.y - 0.02;
  encuadrar(true);
  calcularAnclas();
}

// ------------------------------------------------------------------ Respiración
// Los pulmones se inflan y vuelven a su tamaño, escalando cada uno desde su propio centro.
const RESPIRACION = { periodo: 4.6, amplitud: 0.09 };    // segundos por ciclo · cuánto crecen (9 %)
const PULMONES = ['pulmon_derecho', 'pulmon_izquierdo'];
const respiran = [];     // { id, nodo, pos0, escala0, centro (en el padre), centroModelo }
let factorRespiracion = 1;

function prepararRespiracion() {
  for (const id of PULMONES) {
    const p = partes[id]; if (!p) continue;
    const nodo = p.nodo;
    const cMundo = new THREE.Box3().setFromObject(nodo).getCenter(new THREE.Vector3());
    respiran.push({
      id, nodo,
      pos0: nodo.position.clone(),
      escala0: nodo.scale.clone(),
      centro: nodo.parent.worldToLocal(cMundo.clone()),
      centroModelo: modelo.worldToLocal(cMundo.clone()),
    });
  }
}

function respirar(t) {
  // Inhalación algo más corta que la exhalación, con una pausa suave al final
  const fase = (t % RESPIRACION.periodo) / RESPIRACION.periodo;
  const curva = fase < 0.42 ? Math.sin((fase / 0.42) * Math.PI / 2)
                            : Math.cos(((fase - 0.42) / 0.58) * Math.PI / 2);
  factorRespiracion = 1 + RESPIRACION.amplitud * curva * curva;
  for (const r of respiran) {
    const k = factorRespiracion;
    r.nodo.scale.copy(r.escala0).multiplyScalar(k);
    r.nodo.position.copy(r.pos0).sub(r.centro).multiplyScalar(k).add(r.centro);
  }
}

function encuadrar(inmediato) {
  const aspecto = camara.aspect || 1;
  const fov = THREE.MathUtils.degToRad(camara.fov);
  distanciaBase = (1.62 / Math.tan(fov / 2)) * (aspecto < 1 ? Math.min(1.9, 1 / aspecto * 0.95) : 1);
  distancia = distanciaBase;
  objetivoDeseado.set(0, aspecto < 1 ? -0.32 : -0.18, 0);
  if (inmediato) {
    controles.target.copy(objetivoDeseado);
    camara.position.set(0, 0.25, distancia).add(controles.target);
    camara.lookAt(controles.target);
  }
}

// Punto de cada etiqueta sobre la superficie del modelo (lanzando un rayo desde el frente)
function calcularAnclas() {
  const ray = new THREE.Raycaster();
  for (const h of HOTSPOTS) {
    const p = partes[h.parte]; if (!p) continue;
    const caja = new THREE.Box3().setFromObject(p.nodo);
    const objetivo = new THREE.Vector3(
      THREE.MathUtils.lerp(caja.min.x, caja.max.x, h.rel[0]),
      THREE.MathUtils.lerp(caja.min.y, caja.max.y, h.rel[1]),
      THREE.MathUtils.lerp(caja.min.z, caja.max.z, h.rel[2]));
    const origen = new THREE.Vector3(objetivo.x, objetivo.y, caja.max.z + 5);
    ray.set(origen, new THREE.Vector3(0, 0, -1));
    const hit = ray.intersectObjects(p.mallas, false)[0];
    const punto = hit ? hit.point : objetivo;
    const normal = hit && hit.face ? hit.face.normal.clone().transformDirection(hit.object.matrixWorld) : new THREE.Vector3(0, 0, 1);
    h.local = modelo.worldToLocal(punto.clone());
    h.normal = normal;
  }
}

// ------------------------------------------------------------------ Miniaturas de cada pieza (renderizadas del propio modelo)
function generarMiniaturas() {
  const r2 = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  r2.setSize(320, 320); r2.setPixelRatio(1);
  r2.outputColorSpace = THREE.SRGBColorSpace; r2.toneMapping = THREE.ACESFilmicToneMapping; r2.toneMappingExposure = 1.1;
  const pm2 = new THREE.PMREMGenerator(r2);
  const env2 = pm2.fromScene(new RoomEnvironment(), 0.04).texture;
  const envAnterior = escena.environment; escena.environment = env2; base.visible = false;
  const cam = new THREE.PerspectiveCamera(28, 1, 0.01, 100);
  const foto = (ids) => {
    for (const id of ORDEN) if (partes[id]) partes[id].nodo.visible = ids.includes(id);
    const caja = new THREE.Box3();
    ids.forEach(id => partes[id] && caja.expandByObject(partes[id].nodo));
    const c = caja.getCenter(new THREE.Vector3()), t = caja.getSize(new THREE.Vector3());
    const d = Math.max(t.x, t.y) / 2 / Math.tan(THREE.MathUtils.degToRad(14)) * 1.18;
    cam.position.set(c.x + d * 0.18, c.y + d * 0.08, c.z + d); cam.lookAt(c);
    r2.render(escena, cam);
    return r2.domElement.toDataURL('image/png');
  };
  for (const id of ORDEN) if (partes[id]) miniaturas[id] = foto([id]);
  miniaturas.todo = foto(ORDEN.filter(id => partes[id]));
  for (const id of ORDEN) if (partes[id]) partes[id].nodo.visible = true;
  escena.environment = envAnterior; base.visible = true;
  env2.dispose(); pm2.dispose(); r2.dispose(); r2.forceContextLoss();
}

// ------------------------------------------------------------------ Interfaz
const $ = (s) => document.querySelector(s);
const ICONO_OJO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0"/><circle cx="12" cy="12" r="3"/></svg>';
const ICONO_OJO_NO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.53 13.53 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/><path d="m2 2 20 20"/></svg>';
const ICONO_CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
const FLECHA = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>';

function construirInterfaz() {
  // Selector "¿Qué quieres explorar?"
  const exp = $('#explorar');
  exp.innerHTML = ORDEN.filter(id => partes[id]).map(id =>
    `<button data-parte="${id}" aria-label="${PARTES[id].nombre}"><img src="${miniaturas[id]}" alt=""><span class="tip">${PARTES[id].corto}</span></button>`).join('');
  exp.addEventListener('click', (e) => { const b = e.target.closest('[data-parte]'); if (b) seleccionar(b.dataset.parte); });

  // Etiquetas flotantes
  const cont = $('#hotspots');
  for (const h of HOTSPOTS) {
    if (!partes[h.parte]) continue;
    const el = document.createElement('div');
    el.className = 'hs der';
    el.innerHTML = `<div class="punto"></div><div class="tarjeta"><img src="${miniaturas[h.parte]}" alt=""><div><b>${PARTES[h.parte].corto}</b><small>${h.sub}</small></div></div>`;
    el.addEventListener('click', () => seleccionar(h.parte));
    cont.appendChild(el);
    hotspotsDOM.push({ h, el });
  }

  // Capas
  // Cada fila: clic = alterna sólido/transparente (una por una); ojo = mostrar/ocultar
  $('#lista-capas').innerHTML = ORDEN.filter(id => partes[id]).map(id =>
    `<div class="capa" data-capa="${id}" role="button" tabindex="0"><span class="muestra" style="background:${PARTES[id].color}"></span><span class="n">${PARTES[id].nombre}</span><span class="estado">Sólido</span><button class="ojo" data-ojo="${id}" title="Mostrar u ocultar">${ICONO_OJO}</button></div>`).join('');
  $('#lista-capas').addEventListener('click', (e) => {
    const ojo = e.target.closest('[data-ojo]');
    if (ojo) { const id = ojo.dataset.ojo; visibles[id] = !visibles[id]; aislada = null; aplicarVisibilidad(); actualizarCapas(); return; }
    const fila = e.target.closest('[data-capa]'); if (!fila) return;
    alternarTransparencia(fila.dataset.capa);
  });

  // Tarjetas de la sección Estructuras
  $('#grid-est').innerHTML = ORDEN.filter(id => partes[id]).map((id, i) =>
    `<article class="est rev"><span class="ix">0${i + 1}</span><img src="${miniaturas[id]}" alt="${PARTES[id].nombre}"><h3>${PARTES[id].nombre}</h3><span class="d">${PARTES[id].dato}</span><p>${PARTES[id].desc}</p><button data-ver="${id}">Ver en 3D ${FLECHA}</button></article>`).join('');
  $('#grid-est').addEventListener('click', (e) => {
    const b = e.target.closest('[data-ver]'); if (!b) return;
    abrirVisor(b.dataset.ver);
  });
  document.querySelectorAll('[data-thumb]').forEach(img => img.src = miniaturas[img.dataset.thumb] || '');
  observarRevelado();
}

function seleccionar(id) {
  if (!partes[id]) return;
  seleccion = id;
  controles.autoRotate = false;
  if (!visibles[id]) { visibles[id] = true; actualizarCapas(); }
  if (aislada && aislada !== id) aislada = id;
  aplicarVisibilidad();
  const P = PARTES[id];
  $('#info-img').src = miniaturas[id];
  $('#info-nombre').textContent = P.nombre;
  $('#info-dato').textContent = P.dato;
  $('#info-desc').textContent = P.desc;
  $('#info-ubic').textContent = P.ubic;
  $('#btn-aislar').textContent = aislada ? 'Mostrar todo' : 'Aislar';
  abrirPanel('panel-info');
  $('#hero-der').classList.add('escondido');
  document.querySelectorAll('#explorar [data-parte]').forEach(b => b.classList.toggle('activo', b.dataset.parte === id));
  // Llevar el centro de giro hacia la pieza
  const c = new THREE.Box3().setFromObject(partes[id].nodo).getCenter(new THREE.Vector3());
  objetivoDeseado.set(c.x * 0.5, c.y * 0.6, c.z * 0.5);
  aplicarResaltado();
}

function deseleccionar() {
  seleccion = null;
  cerrarPanel('panel-info');
  $('#hero-der').classList.remove('escondido');
  document.querySelectorAll('#explorar [data-parte]').forEach(b => b.classList.remove('activo'));
  objetivoDeseado.set(0, camara.aspect < 1 ? -0.32 : -0.18, 0);
  aplicarResaltado();
}

function aplicarResaltado() {
  for (const id of ORDEN) {
    const p = partes[id]; if (!p) continue;
    const k = id === seleccion ? 0.32 : id === hover ? 0.14 : 0;
    p.mats.forEach(m => { m.emissiveIntensity = k; });
  }
}

function aplicarVisibilidad() {
  for (const id of ORDEN) {
    const p = partes[id]; if (!p) continue;
    p.nodo.visible = aislada ? id === aislada : visibles[id];
  }
}

// Opacidad por pieza: solo las marcadas en Capas se vuelven transparentes
function aplicarOpacidad() {
  for (const id of ORDEN) {
    const p = partes[id]; if (!p) continue;
    const v = transparentes.has(id) ? 1 - nivelTransparencia : 1;
    const t = v < 0.999;
    p.mats.forEach(m => {
      if (m.transparent !== t) m.needsUpdate = true;
      m.transparent = t; m.opacity = v; m.depthWrite = !t;
    });
    p.mallas.forEach(mm => { mm.renderOrder = t ? 2 : 0; }); // las transparentes se dibujan al final
  }
}

function alternarTransparencia(id) {
  if (!partes[id]) return;
  if (transparentes.has(id)) transparentes.delete(id); else transparentes.add(id);
  if (!visibles[id]) visibles[id] = true;
  aislada = null; aplicarVisibilidad(); aplicarOpacidad(); actualizarCapas();
  aviso(`${PARTES[id].corto}: ${transparentes.has(id) ? 'transparente' : 'sólido'}`);
}

function actualizarCapas() {
  document.querySelectorAll('#lista-capas [data-capa]').forEach(f => {
    const id = f.dataset.capa, tr = transparentes.has(id), vis = aislada ? id === aislada : visibles[id];
    f.classList.toggle('transp', tr); f.classList.toggle('oculta', !vis);
    f.querySelector('.estado').textContent = !vis ? 'Oculto' : tr ? 'Transparente' : 'Sólido';
    f.querySelector('.ojo').innerHTML = vis ? ICONO_OJO : ICONO_OJO_NO;
  });
}

// ------------------------------------------------------------------ Presentación ↔ Exploración
function entrarExploracion(parte) {
  if (!explorando) {
    explorando = true;
    document.body.classList.add('visor');
    hero.classList.remove('presentacion'); hero.classList.add('explorando');
    controles.enabled = true;
    controles.autoRotate = false; rotarA = 0; // gira suavemente al frente
    aviso('Modo exploración: gira, acerca y toca cualquier estructura');
  }
  if (parte) seleccionar(parte);
}

function salirExploracion() {
  explorando = false;
  deseleccionar(); cerrarPanel('panel-capas');
  aislada = null; ORDEN.forEach(id => visibles[id] = true); transparentes.clear();
  aplicarVisibilidad(); aplicarOpacidad(); actualizarCapas();
  hover = null; aplicarResaltado();
  distancia = distanciaBase;
  hero.classList.add('presentacion'); hero.classList.remove('explorando');
  document.body.classList.remove('visor');
  controles.enabled = false; controles.autoRotate = true;
}

function abrirPanel(id) { $('#' + id).classList.remove('cerrado'); if (id === 'panel-capas') $('#btn-capas').classList.add('on'); }
function cerrarPanel(id) { $('#' + id).classList.add('cerrado'); if (id === 'panel-capas') $('#btn-capas').classList.remove('on'); }

let tAviso;
function aviso(txt) { const a = $('#aviso'); a.textContent = txt; a.classList.add('ver'); clearTimeout(tAviso); tAviso = setTimeout(() => a.classList.remove('ver'), 2600); }

// Botones
$('#btn-capas').onclick = () => $('#panel-capas').classList.contains('cerrado') ? abrirPanel('panel-capas') : cerrarPanel('panel-capas');
$('#btn-etiquetas').onclick = (e) => { etiquetas = !etiquetas; e.currentTarget.classList.toggle('on', etiquetas); };
$('#btn-acercar').onclick = () => { distancia = Math.max(distanciaBase * 0.45, distancia * 0.82); };
$('#btn-alejar').onclick = () => { distancia = Math.min(distanciaBase * 1.6, distancia / 0.82); };
$('#btn-reset').onclick = () => { distancia = distanciaBase; aislada = null; deseleccionar(); aplicarVisibilidad(); controles.autoRotate = false; rotarA = 0; aviso('Vista restablecida'); };
$('#btn-cerrar-info').onclick = deseleccionar;
$('#btn-aislar').onclick = () => {
  if (!seleccion) return;
  aislada = aislada ? null : seleccion;
  $('#btn-aislar').textContent = aislada ? 'Mostrar todo' : 'Aislar';
  aplicarVisibilidad(); actualizarCapas();
};
$('#mostrar-todo').onclick = () => {
  aislada = null; ORDEN.forEach(id => visibles[id] = true); transparentes.clear();
  aplicarOpacidad(); aplicarVisibilidad(); actualizarCapas();
  aviso('Capas restablecidas');
};
$('#transparencia').oninput = (e) => {
  const v = +e.target.value;
  e.target.style.setProperty('--v', ((v - 10) / 85 * 100) + '%'); $('#valor-transp').textContent = v + '%';
  nivelTransparencia = v / 100; aplicarOpacidad();
};
$('#btn-salir').onclick = salirExploracion; // vuelve a la presentación en la misma página
document.querySelectorAll('[data-cerrar]').forEach(b => b.onclick = () => b.dataset.cerrar === 'panel-info' ? deseleccionar() : cerrarPanel(b.dataset.cerrar));
document.querySelector('[data-accion="explorar"]').addEventListener('click', (e) => { e.preventDefault(); abrirVisor(); });
window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && explorando) { deseleccionar(); cerrarPanel('panel-capas'); } });

// Zoom con Ctrl + rueda (la rueda sola hace scroll de la página)
lienzo.addEventListener('wheel', (e) => {
  if (!e.ctrlKey || !explorando) return;
  e.preventDefault();
  distancia = THREE.MathUtils.clamp(distancia * (e.deltaY > 0 ? 1.08 : 0.92), distanciaBase * 0.45, distanciaBase * 1.6);
}, { passive: false });
// Pellizco en pantallas táctiles
const toques = new Map(); let distPellizco = 0;
lienzo.addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch') toques.set(e.pointerId, e); });
lienzo.addEventListener('pointerup', (e) => toques.delete(e.pointerId));
lienzo.addEventListener('pointercancel', (e) => toques.delete(e.pointerId));
lienzo.addEventListener('pointermove', (e) => {
  if (!explorando || e.pointerType !== 'touch' || !toques.has(e.pointerId)) return;
  toques.set(e.pointerId, e);
  if (toques.size === 2) {
    const [a, b] = [...toques.values()];
    const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    if (distPellizco) distancia = THREE.MathUtils.clamp(distancia * distPellizco / d, distanciaBase * 0.45, distanciaBase * 1.6);
    distPellizco = d;
  } else distPellizco = 0;
});

// Selección y hover con el puntero
const raycaster = new THREE.Raycaster(); const puntero = new THREE.Vector2();
let inicioClic = null, rotarA = null;
function parteBajo(x, y) {
  const r = lienzo.getBoundingClientRect();
  puntero.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
  raycaster.setFromCamera(puntero, camara);
  const mallas = ORDEN.flatMap(id => partes[id] && partes[id].nodo.visible ? partes[id].mallas : []);
  const hit = raycaster.intersectObjects(mallas, false)[0];
  return hit ? hit.object.userData.parte : null;
}
lienzo.addEventListener('pointerdown', (e) => { if (!explorando) return; inicioClic = { x: e.clientX, y: e.clientY, t: performance.now() }; controles.autoRotate = false; });
lienzo.addEventListener('pointerup', (e) => {
  if (!inicioClic) return;
  const mov = Math.hypot(e.clientX - inicioClic.x, e.clientY - inicioClic.y);
  if (mov < 6 && performance.now() - inicioClic.t < 400) {
    const id = parteBajo(e.clientX, e.clientY);
    if (id) seleccionar(id); else if (seleccion) deseleccionar();
  }
  inicioClic = null;
});
let ultimoHover = 0;
lienzo.addEventListener('pointermove', (e) => {
  if (!explorando || e.pointerType === 'touch' || inicioClic) return;
  const ahora = performance.now(); if (ahora - ultimoHover < 50) return; ultimoHover = ahora;
  const id = parteBajo(e.clientX, e.clientY);
  if (id !== hover) { hover = id; lienzo.style.cursor = id ? 'pointer' : 'grab'; aplicarResaltado(); }
});

// ------------------------------------------------------------------ Bucle de render
let enVista = true;
new IntersectionObserver(([e]) => { enVista = e.isIntersecting; }, { threshold: 0 }).observe(hero);
function redimensionar() {
  const w = hero.clientWidth, h = hero.clientHeight;
  renderer.setSize(w, h, false);
  camara.aspect = w / h; camara.updateProjectionMatrix();
  const proporcion = distancia / distanciaBase;
  encuadrar(false); distancia = distanciaBase * proporcion;
}
new ResizeObserver(redimensionar).observe(hero);
redimensionar(); encuadrar(true);

const v = new THREE.Vector3(), vn = new THREE.Vector3(), dirCam = new THREE.Vector3();
function actualizarHotspots() {
  const w = hero.clientWidth, h = hero.clientHeight;
  for (const { h: hs, el } of hotspotsDOM) {
    const p = partes[hs.parte];
    const mostrar = etiquetas && p && p.nodo.visible && (!seleccion || seleccion === hs.parte);
    if (!mostrar || !hs.local) { el.classList.add('oculto'); el.style.pointerEvents = 'none'; continue; }
    v.copy(hs.local);
    const r = respiran.find(x => x.id === hs.parte); // la etiqueta acompaña al pulmón al respirar
    if (r) v.sub(r.centroModelo).multiplyScalar(factorRespiracion).add(r.centroModelo);
    modelo.localToWorld(v);
    vn.copy(hs.normal).transformDirection(modelo.matrixWorld);
    dirCam.copy(camara.position).sub(v).normalize();
    const frente = vn.dot(dirCam) > -0.05;
    v.project(camara);
    const x = (v.x * 0.5 + 0.5) * w, y = (-v.y * 0.5 + 0.5) * h;
    el.style.transform = `translate(${x}px, ${y}px)`;
    el.classList.toggle('oculto', !frente);
    el.style.pointerEvents = frente ? '' : 'none';
    el.classList.toggle('izq', x < w * 0.5); el.classList.toggle('der', x >= w * 0.5);
    el.classList.toggle('sel', seleccion === hs.parte);
  }
}

const reloj = new THREE.Clock();
function animar() {
  requestAnimationFrame(animar);
  const dt = Math.min(reloj.getDelta(), 0.05);
  if (!enVista) return;
  controles.target.lerp(objetivoDeseado, 1 - Math.pow(0.002, dt));
  // Mantener la distancia deseada (zoom suave)
  const off = camara.position.clone().sub(controles.target);
  const dAct = off.length();
  off.setLength(THREE.MathUtils.lerp(dAct, distancia, 1 - Math.pow(0.001, dt)));
  camara.position.copy(controles.target).add(off);
  if (rotarA !== null) { // volver suavemente al frente al restablecer
    const az = controles.getAzimuthalAngle();
    const paso = THREE.MathUtils.lerp(0, -az, 1 - Math.pow(0.01, dt));
    off.applyAxisAngle(new THREE.Vector3(0, 1, 0), paso);
    camara.position.copy(controles.target).add(off);
    if (Math.abs(az) < 0.01) { rotarA = null; controles.autoRotate = !explorando; }
  }
  controles.update();
  respirar(reloj.elapsedTime);
  anillo.rotation.z += dt * 0.15;
  // En exploración el resplandor rojo del piso se apaga para dejar el fondo negro
  brillo.material.opacity = THREE.MathUtils.lerp(brillo.material.opacity, explorando ? 0 : 0.08, 1 - Math.pow(0.02, dt));
  renderer.render(escena, camara);
  actualizarHotspots();
}
animar();

// ------------------------------------------------------------------ Detalles de página
const nav = document.getElementById('nav');
addEventListener('scroll', () => nav.classList.toggle('solida', scrollY > 40), { passive: true });
const enlaces = [...document.querySelectorAll('.nav ul a')];
const secciones = enlaces.map(a => document.querySelector(a.getAttribute('href')));
const obsNav = new IntersectionObserver((ents) => ents.forEach(e => {
  if (e.isIntersecting) enlaces.forEach(a => a.classList.toggle('activo', a.getAttribute('href') === '#' + e.target.id));
}), { rootMargin: '-45% 0px -50% 0px' });
secciones.forEach(s => s && obsNav.observe(s));
function observarRevelado() {
  const io = new IntersectionObserver((ents) => ents.forEach(e => { if (e.isIntersecting) { e.target.classList.add('ver'); io.unobserve(e.target); } }), { threshold: 0.12 });
  document.querySelectorAll('.rev:not(.ver)').forEach(el => io.observe(el));
}
observarRevelado();
