/********************************
 CONFIG GOOGLE SHEETS
********************************/

const SHEET_ID = "1WPEc9hzG7iaNQMaIQBc4Qth08Zc1R_vvKl9CUnd_jJE";

const URL_AUTORES = `https://opensheet.elk.sh/${SHEET_ID}/Autores`;
const URL_LIBROS = `https://opensheet.elk.sh/${SHEET_ID}/Libros`;
const URL_PACKS = `https://opensheet.elk.sh/${SHEET_ID}/Packs`;
const URL_LIBRO_PACK = `https://opensheet.elk.sh/${SHEET_ID}/Libro_Pack`;

/********************************
 VARIABLES GLOBALES
********************************/

let autores = [];
let libros = [];
let packs = [];
let libroPack = [];

/********************************
 CARGA GENERAL
********************************/

async function cargarDatos() {
  try {
    [autores, libros, packs, libroPack] = await Promise.all([
      fetch(URL_AUTORES).then(r => r.json()),
      fetch(URL_LIBROS).then(r => r.json()),
      fetch(URL_PACKS).then(r => r.json()),
      fetch(URL_LIBRO_PACK).then(r => r.json())
    ]);

    detectarPagina();
  } catch (e) {
    console.error("Error cargando Google Sheets", e);
  }
}

/********************************
 DETECTAR PÁGINA
********************************/

function detectarPagina() {
  const page = window.location.pathname;

  if (page.includes("autor.html")) cargarAutor();
  else if (page.includes("pack.html")) cargarPack();
  else if (page.includes("genero.html")) cargarGenero();
  else cargarIndex();
}

/********************************
 UTILIDADES
********************************/

function getParam(nombre) {
  return new URLSearchParams(window.location.search).get(nombre);
}

function librosDeAutor(autorId) {
  return libros.filter(l => l.autor_id === autorId);
}

function librosDePack(packId) {
  const ids = libroPack
    .filter(lp => lp.pack_id === packId)
    .map(lp => lp.libro_id);

  return libros.filter(l => ids.includes(l.libro_id));
}

function packsDeLibro(libroId) {
  const ids = libroPack
    .filter(lp => lp.libro_id === libroId)
    .map(lp => lp.pack_id);

  return packs.filter(p => ids.includes(p.pack_id));
}

/********************************
 INDEX
********************************/

function cargarIndex() {
  renderAutoresAZ();
  renderSlider();
  renderLibros(libros);
  activarBuscador();
}

/********************************
 AUTORES A–Z
********************************/

function renderAutoresAZ() {
  const ul = document.getElementById("lista-autores");
  if (!ul) return;

  ul.innerHTML = "";

  autores
    .sort((a, b) => a.nombre.localeCompare(b.nombre))
    .forEach(a => {
      const li = document.createElement("li");
      li.innerHTML = `<a href="autor.html?id=${a.autor_id}">${a.nombre}</a>`;
      ul.appendChild(li);
    });
}

/********************************
 SLIDER (LIBROS + PACKS)
********************************/

function renderSlider() {
  const slider = document.getElementById("slider");
  if (!slider) return;

  slider.innerHTML = "";

  const destacados = [
    ...libros.slice(0, 3),
    ...packs.slice(0, 2)
  ];

  let index = 0;

  destacados.forEach((item, i) => {
    const div = document.createElement("div");
    div.className = "slide";
    div.style.display = i === 0 ? "block" : "none";
    div.innerHTML = `
      <img src="${item.portada}">
      <h3>${item.titulo || item.nombre}</h3>
    `;
    slider.appendChild(div);
  });

  setInterval(() => {
    const slides = document.querySelectorAll(".slide");
    slides.forEach(s => s.style.display = "none");
    slides[index].style.display = "block";
    index = (index + 1) % slides.length;
  }, 5000);
}

/********************************
 LIBROS
********************************/

function renderLibros(lista) {
  const cont = document.getElementById("contenedor-libros");
  if (!cont) return;

  cont.innerHTML = "";

  lista.forEach(l => {
    const autor = autores.find(a => a.autor_id === l.autor_id);
    const div = document.createElement("div");
    div.className = "libro-card";

    div.innerHTML = `
      <img src="${l.portada}">
      <h4>${l.titulo}</h4>
      <p><a href="autor.html?id=${autor.autor_id}">${autor.nombre}</a></p>
      <p><a href="genero.html?nombre=${l.genero}">${l.genero}</a></p>
    `;

    cont.appendChild(div);
  });
}

/********************************
 PÁGINA AUTOR
********************************/

function cargarAutor() {
  const id = getParam("id");
  const autor = autores.find(a => a.autor_id === id);
  if (!autor) return;

  document.getElementById("autor-nombre").textContent = autor.nombre;
  document.getElementById("autor-portada").src = autor.portada;

  renderLibros(librosDeAutor(id));
}

/********************************
 PÁGINA PACK
********************************/

function cargarPack() {
  const id = getParam("id");
  const pack = packs.find(p => p.pack_id === id);
  if (!pack) return;

  document.getElementById("pack-nombre").textContent = pack.nombre;
  document.getElementById("pack-portada").src = pack.portada;

  renderLibros(librosDePack(id));
}

/********************************
 PÁGINA GÉNERO
********************************/

function cargarGenero() {
  const genero = getParam("nombre");
  if (!genero) return;

  document.getElementById("genero-nombre").textContent = genero;

  const filtrados = libros.filter(l => l.genero === genero);
  renderLibros(filtrados);
}

/********************************
 BUSCADOR
********************************/

function activarBuscador() {
  const input = document.getElementById("buscador");
  if (!input) return;

  input.addEventListener("input", () => {
    const q = input.value.toLowerCase();

    const resultados = libros.filter(l => {
      const autor = autores.find(a => a.autor_id === l.autor_id);
      return (
        l.titulo.toLowerCase().includes(q) ||
        l.genero.toLowerCase().includes(q) ||
        autor?.nombre.toLowerCase().includes(q)
      );
    });

    renderLibros(resultados);
  });
}

/********************************
 INIT
********************************/

document.addEventListener("DOMContentLoaded", cargarDatos);
