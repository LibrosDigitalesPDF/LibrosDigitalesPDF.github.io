const DATA_URL = "data.json";

/* =====================
   CARGA DE DATOS
   (ignora la primera fila guía)
===================== */
async function loadData() {
  const res = await fetch(DATA_URL);
  const data = await res.json();

  data.autors = data.autors.filter(a => a.autor_id && a.autor_id !== "autor_id");
  data.libros = data.libros.filter(l => l.libro_id && l.libro_id !== "libro_id");
  data.packs = data.packs.filter(p => p.pack_id && p.pack_id !== "pack_id");
  data.libro_pack = data.libro_pack.filter(
    lp => lp.libro_id && lp.libro_id !== "libro_id"
  );

  return data;
}

/* =====================
   UTILIDADES
===================== */
function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

/* =====================
   INDEX
===================== */
async function renderIndex() {
  const data = await loadData();
  const container = document.getElementById("content");
  if (!container) return;

  container.innerHTML = "";

  data.autors.forEach(autor => {
    const librosAutor = data.libros.filter(
      l => l.autor_id === autor.autor_id
    );

    if (librosAutor.length === 0) return;

    const section = document.createElement("section");
    section.className = "block";

    section.innerHTML = `
      <img src="${autor.portada}" class="block-img">
      <div class="block-content">
        <h2>
          <a href="autor.html?id=${autor.autor_id}">
            ${autor.nombre}
          </a>
        </h2>
        <ul>
          ${librosAutor.map((libro, i) => `
            <li>
              ${i + 1}. ${libro.titulo}
              <span class="pages">(${libro.paginas} págs)</span>
            </li>
          `).join("")}
        </ul>
      </div>
    `;

    container.appendChild(section);
  });
}

/* =====================
   AUTOR
===================== */
async function renderAutor() {
  const autorId = getParam("id");
  if (!autorId) return;

  const data = await loadData();
  const autor = data.autors.find(a => a.autor_id === autorId);
  if (!autor) return;

  const libros = data.libros.filter(l => l.autor_id === autorId);

  document.getElementById("content").innerHTML = `
    <section class="block">
      <img src="${autor.portada}" class="block-img">
      <div class="block-content">
        <h1>${autor.nombre}</h1>
        <ul>
          ${libros.map((libro, i) => `
            <li>
              ${i + 1}. ${libro.titulo}
              <span class="pages">(${libro.paginas} págs)</span>
            </li>
          `).join("")}
        </ul>
      </div>
    </section>
  `;
}

/* =====================
   PACK
===================== */
async function renderPack() {
  const packId = getParam("id");
  if (!packId) return;

  const data = await loadData();
  const pack = data.packs.find(p => p.pack_id === packId);
  if (!pack) return;

  const relaciones = data.libro_pack.filter(lp => lp.pack_id === packId);
  const libros = relaciones
    .map(r => data.libros.find(l => l.libro_id === r.libro_id))
    .filter(Boolean);

  document.getElementById("content").innerHTML = `
    <section class="block">
      <img src="${pack.portada}" class="block-img">
      <div class="block-content">
        <h1>${pack.nombre}</h1>
        <ul>
          ${libros.map((libro, i) => `
            <li>
              ${i + 1}. ${libro.titulo}
              <span class="pages">(${libro.paginas} págs)</span>
            </li>
          `).join("")}
        </ul>
      </div>
    </section>
  `;
}

/* =====================
   GÉNERO
===================== */
async function renderGenero() {
  const genero = getParam("nombre");
  if (!genero) return;

  const data = await loadData();
  const libros = data.libros.filter(l => l.genero === genero);

  if (libros.length === 0) return;

  document.getElementById("content").innerHTML = `
    <section class="block">
      <img src="img/genero.png" class="block-img">
      <div class="block-content">
        <h1>${genero}</h1>
        <ul>
          ${libros.map((libro, i) => `
            <li>
              ${i + 1}. ${libro.titulo}
              <span class="pages">(${libro.paginas} págs)</span>
            </li>
          `).join("")}
        </ul>
      </div>
    </section>
  `;
}

/* =====================
   INIT
===================== */
document.addEventListener("DOMContentLoaded", () => {
  if (document.body.classList.contains("index")) renderIndex();
  if (document.body.classList.contains("autor")) renderAutor();
  if (document.body.classList.contains("pack")) renderPack();
  if (document.body.classList.contains("genero")) renderGenero();
});

