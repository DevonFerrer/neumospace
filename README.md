<div align="center">

# 🫁 NeumoSpace

**Visor 3D interactivo del sistema respiratorio**

Explora el árbol bronquial y los pulmones en 3D: gíralos, mira cómo respiran, aísla cada estructura y vuélvela transparente para ver lo que hay dentro.

[![Ver en vivo](https://img.shields.io/badge/Ver%20en%20vivo-neumospace.vercel.app-E81A40?style=for-the-badge&logo=vercel&logoColor=white)](https://neumospace.vercel.app)

![Three.js](https://img.shields.io/badge/Three.js-0.170-000000?style=flat-square&logo=three.js)
![WebGL](https://img.shields.io/badge/WebGL-2.0-990000?style=flat-square&logo=webgl)
![glTF](https://img.shields.io/badge/glTF-GLB-87C540?style=flat-square)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES%20Modules-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Vercel](https://img.shields.io/badge/Vercel-deploy-000000?style=flat-square&logo=vercel)

</div>

---

## ✨ Funciones

| | |
|---|---|
| 🫁 **Respiración** | Los pulmones se inflan y vuelven a su tamaño en un ciclo continuo, como al respirar. |
| 🎬 **Modo presentación** | Al entrar solo se ve el modelo girando junto al título. |
| 🖤 **Modo exploración** | *Explorar ahora* convierte la página en un visor negro a pantalla completa con todas las herramientas. |
| 🧩 **Capas** | Toca una estructura para volverla transparente, una por una; el ojo la oculta. Nivel de transparencia ajustable. |
| 🏷️ **Etiquetas y fichas** | Tarjetas flotantes sobre cada estructura y ficha con descripción, ubicación y relaciones anatómicas. |
| 🔍 **Navegación** | Giro 360°, zoom con botones, `Ctrl` + rueda o pellizco, aislar pieza y restablecer vista. |
| 📱 **Responsive** | Funciona en computadora, tablet y celular. |

**Estructuras del modelo:** pulmón derecho · pulmón izquierdo · tráquea y bronquios · laringe e hioides · glándula tiroides.

## 📁 Estructura

```
neumospace/
├── index.html              # Estructura de la página
├── css/estilos.css         # Diseño oscuro, tarjetas de vidrio, modos presentación/exploración, responsive
├── js/app.js               # Visor 3D: Three.js, carga del modelo, respiración, capas, etiquetas, selección
├── assets/
│   ├── modelos/pulmon.glb  # Modelo 3D optimizado (4.6 MB)
│   └── img/logo_uns.png
├── vercel.json             # Configuración de despliegue
└── neumospace.code-workspace
```

## 🚀 Ejecutar en local

El modelo se carga con `fetch`, así que necesita un servidor local (no funciona con doble clic en `index.html`).

- **VS Code:** abre `neumospace.code-workspace` → clic derecho en `index.html` → **Open with Live Server**.
- **Node.js:** `npm start` y abre http://localhost:5500
- **Python:** `python -m http.server 5500`

## 🛠️ Personalizar

| Qué | Dónde |
|---|---|
| Textos de cada estructura | `PARTES` en `js/app.js` |
| Velocidad e intensidad de la respiración | `RESPIRACION = { periodo, amplitud }` en `js/app.js` |
| Colores de las piezas sin textura | `COLORES_MATERIAL` en `js/app.js` |
| Etiquetas flotantes | `HOTSPOTS` en `js/app.js` |
| Colores del tema | Variables `--bg`, `--red`… al inicio de `css/estilos.css` |
| Modelo 3D | Reemplaza `assets/modelos/pulmon.glb` (nodos: `laringe`, `traquea`, `pulmon_derecho`, `pulmon_izquierdo`, `glandula_tiroides`) |

## 🔗 Proyecto relacionado

La app de realidad aumentada para Android (Unity 6 + AR Foundation + ARCore) está en **[DevonFerrer/AnatomiaRA](https://github.com/DevonFerrer/AnatomiaRA)**.

---

<div align="center">

**PY001 · Ingeniería de Software II · Universidad Nacional del Santa**
Equipo InnoMed · Chimbote, Perú · 2026

</div>
