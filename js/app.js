// --- Configuración de Google Sheet ---
const sheetID = "1WPEc9hzG7iaNQMaIQBc4Qth08Zc1R_vvKl9CUnd_jJE";
const sheetName = "Sheet1";

let libros = [];
let autores = [];

// --- Función para obtener datos de Google Sheets ---
async function obtenerDatos() {
  const url = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?sheet=${sheetName}`;
  const res = await axios.get(url);
  const data = JSON.parse(res.data.substring(47).slice(0, -2)).table.rows;
  
  libros = data.map(r => ({
    id: r.c[0]?.v || "",
    autor: r.c[1]?.v || "",
    genero: r.c[2]?.v || "",
    nombre: r.c[3]?.v || "",
    portada: r.c[4]?.v || ""
  }));

  // Lista única de autores
  const autorSet = new Set(libros.map(l => l.autor));
  autores = Array.from(autorSet).sort();

  cargarListaAutores();
  cargarSlider();
}

// --- Lista de autores en index.html ---
function cargarListaAutores() {
  const lista = document.getElementById("lista-autores");
  if (!lista) return;

  lista.innerHTML = "";
  autores.forEach(a => {
    const link = document.createElement("a");
    link.href = `autor.html?id=${a}`;
    link.textContent = a;
    lista.appendChild(link);
  });
}

// --- Slider de libros/packs en index.html ---
function cargarSlider() {
  const slider = document.getElementById("slider-principal");
  if (!slider) return;

  slider.innerHTML = "";
  libros.slice(0, 5).forEach(l => {
    const img = document.createElement("img");
    img.src = l.portada;
    img.alt = l.nombre;
    slider.appendChild(img);
  });
}

// --- Función para cargar autor individual ---
function cargarAutor(id) {
  const container = document.getElementById("autor-nombre");
  const imagen = document.getElementById("autor-imagen");
  const lista = document.getElementById("autor-libros");

  const autor = libros.find(l => l.autor === id);
  if (!autor) return;

  imagen.src = autor.portada;
  container.textContent = id;

  lista.innerHTML = "";
  libros
    .filter(l => l.autor === id)
    .forEach((l, index) => {
      const li = document.createElement("li");
      li.textContent = `${index + 1}. ${l.nombre} — Género: ${l.genero}`;
      lista.appendChild(li);
    });
}

// --- Función para cargar pack individual ---
function cargarPack(id) {
  const container = document.getElementById("pack-nombre");
  const imagen = document.getElementById("pack-imagen");
  const lista = document.getElementById("pack-libros");

  // Imagen y nombre del pack
  const pack = libros.find(l => l.pack === id);
  if (!pack) return;

  imagen.src = pack.portada || "";
  container.textContent = id;

  lista.innerHTML = "";
  libros
    .filter(l => l.pack && l.pack.includes(id))
    .forEach((l, index) => {
      const li = document.createElement("li");
      li.textContent = `${index + 1}. ${l.nombre} — Autor: ${l.autor} — Género: ${l.genero}`;
      lista.appendChild(li);
    });
}

// --- Función para cargar género individual ---
function cargarGenero(id) {
  const container = document.getElementById("genero-nombre");
  const imagen = document.getElementById("genero-imagen");
  const lista = document.getElementById("genero-libros");

  const ejemplo = libros.find(l => l.genero === id);
  if (!ejemplo) return;

  imagen.src = ejemplo.portada || "";
  container.textContent = id;

  lista.innerHTML = "";
  libros
    .filter(l => l.genero === id)
    .forEach((l, index) => {
      const li = document.createElement("li");
      li.textContent = `${index + 1}. ${l.nombre} — Autor: ${l.autor} — Pack: ${l.pack || ""}`;
      lista.appendChild(li);
    });
}

// --- Buscador simple ---
const input = document.getElementById("buscador");
if (input) {
  input.addEventListener("input", function() {
    const term = this.value.toLowerCase();
    const resultados = document.getElementById("resultados");
    resultados.innerHTML = "";
    libros
      .filter(l => l.nombre.toLowerCase().includes(term) || l.autor.toLowerCase().includes(term) || l.genero.toLowerCase().includes(term))
      .slice(0, 5)
      .forEach(l => {
        const div = document.createElement("div");
        div.textContent = `${l.nombre} — ${l.autor} — ${l.genero}`;
        resultados.appendChild(div);
      });
  });
}

window.addEventListener("DOMContentLoaded", obtenerDatos);
