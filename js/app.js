const API_URL = "https://script.google.com/macros/s/AKfycbxR9owUKbqXlUj3-hDYZKnFSxHqr1ZHl42z30kWREzJvFhHYwFShP1up5RPm8tuG_RC/exec";

let DATA = {
  autores: [],
  libros: [],
  packs: [],
  libro_pack: []
};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  await loadData();
  renderAutoresSidebar();
  renderHomeSlider();
  setupBuscador();
}

/* ======================
   CARGA DE DATOS
====================== */
async function loadData() {
  const res = await fetch(API_URL);
  DATA = await res.json();
}

/* ======================
   AUTORES (SIDEBAR)
====================== */
function renderAutoresSidebar() {
  const container = document.getElementById("autores-list");
  if (!container) return;

  container.innerHTML = "";

  DATA.autores
    .sort((a, b) => a.nombre.localeCompare(b.nombre))
    .forEach(autor => {
      const a = document.createElement("a");
      a.href = `autor.html?id=${autor.autor_id}`;
      a.textContent = autor.nombre;
      container.appendChild(a);
    });
}

/* ======================
   SLIDER PRINCIPAL
====================== */
function renderHomeSlider() {
  const slider = document.getElementById("slider");
  if (!slider) return;

  slider.innerHTML = "";

  const items = [
    ...DATA.packs.map(p => ({
      titulo: p.nombre,
      portada: p.portada,
      link: `pack.html?id=${p.pack_id}`
    })),
    ...DATA.libros.map(l => ({
      titulo: l.titulo,
      portada: l.portada,
      link: `libro.html?id=${l.libro_id}`
    }))
  ].slice(0, 5);

  items.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "slide" + (index === 0 ? " active" : "");
    div.innerHTML = `
      <a href="${item.link}">
        <img src="${item.portada}" alt="${item.titulo}">
        <span>${item.titulo}</span>
      </a>
    `;
    slider.appendChild(div);
  });

  startSlider();
}

function startSlider() {
  let index = 0;
  const slides = document.querySelectorAll(".slide");
  if (!slides.length) return;

  setInterval(() => {
    slides[index].classList.remove("active");
    index = (index + 1) % slides.length;
    slides[index].classList.add("active");
  }, 4000);
}

/* ======================
   BUSCADOR CON SUGERENCIAS
====================== */
function setupBuscador() {
  const input = document.getElementById("buscador");
  const results = document.getElementById("buscador-resultados");
  if (!input || !results) return;

  input.addEventListener("input", () => {
    const q = input.value.toLowerCase().trim();
    results.innerHTML = "";
    if (!q) return;

    const encontrados = [];

    DATA.libros.forEach(libro => {
      if (libro.titulo.toLowerCase().includes(q)) {
        encontrados.push({
          texto: libro.titulo,
          link: `libro.html?id=${libro.libro_id}`
        });
      }
    });

    DATA.autores.forEach(autor => {
      if (autor.nombre.toLowerCase().includes(q)) {
        encontrados.push({
          texto: autor.nombre,
          link: `autor.html?id=${autor.autor_id}`
        });
      }
    });

    DATA.packs.forEach(pack => {
      if (pack.nombre.toLowerCase().includes(q)) {
        encontrados.push({
          texto: pack.nombre,
          link: `pack.html?id=${pack.pack_id}`
        });
      }
    });

    encontrados.slice(0, 8).forEach(r => {
      const a = document.createElement("a");
      a.href = r.link;
      a.textContent = r.texto;
      results.appendChild(a);
    });
  });
}

/* ======================
   PÁGINA AUTOR
====================== */
function renderAutorPage(autorId) {
  const autor = DATA.autores.find(a => a.autor_id == autorId);
  if (!autor) return;

  document.getElementById("titulo").textContent = autor.nombre;
  document.getElementById("imagen").src = autor.portada;

  const libros = DATA.libros.filter(l => l.autor_id == autorId);
  const lista = document.getElementById("lista");

  lista.innerHTML = "";
  libros.forEach((l, i) => {
    const li = document.createElement("li");
    li.textContent = `${i + 1}. ${l.titulo} (${l.paginas} páginas)`;
    lista.appendChild(li);
  });
}

/* ======================
   PÁGINA PACK
====================== */
function renderPackPage(packId) {
  const pack = DATA.packs.find(p => p.pack_id == packId);
  if (!pack) return;

  document.getElementById("titulo").textContent = pack.nombre;
  document.getElementById("imagen").src = pack.portada;

  const relaciones = DATA.libro_pack.filter(lp => lp.pack_id == packId);
  const libros = relaciones
    .map(r => DATA.libros.find(l => l.libro_id == r.libro_id))
    .filter(Boolean);

  const lista = document.getElementById("lista");
  lista.innerHTML = "";

  libros.forEach((l, i) => {
    const li = document.createElement("li");
    li.textContent = `${i + 1}. ${l.titulo} (${l.paginas} páginas)`;
    lista.appendChild(li);
  });
}

/* ======================
   PÁGINA GÉNERO
====================== */
function renderGeneroPage(genero) {
  document.getElementById("titulo").textContent = genero;

  const libros = DATA.libros.filter(
    l => l.genero.toLowerCase() === genero.toLowerCase()
  );

  const lista = document.getElementById("lista");
  lista.innerHTML = "";

  libros.forEach((l, i) => {
    const li = document.createElement("li");
    li.textContent = `${i + 1}. ${l.titulo} (${l.paginas} páginas)`;
    lista.appendChild(li);
  });
}

/* ======================
   UTILIDAD URL
====================== */
function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}
