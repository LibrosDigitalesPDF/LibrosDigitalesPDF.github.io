const API_URL = "https://script.google.com/macros/s/AKfycbxR9owUKbqXlUj3-hDYZKnFSxHqr1ZHl42z30kWREzJvFhHYwFShP1up5RPm8tuG_RC/exec";

let DATA = {};

document.addEventListener("DOMContentLoaded", async () => {
  const res = await fetch(API_URL);
  DATA = await res.json();

  renderAutores();
  renderSlider();
});

/* =========================
   AUTORES (columna izquierda)
========================= */
function renderAutores() {
  const cont = document.getElementById("autores-list");
  cont.innerHTML = "";

  DATA.autores.forEach(a => {
    const link = document.createElement("a");
    link.href = `autor.html?id=${a.autor_id}`;
    link.textContent = a.nombre;
    cont.appendChild(link);
  });
}

/* =========================
   SLIDER DINÁMICO
========================= */
function renderSlider() {
  const slider = document.getElementById("slider");
  slider.innerHTML = "";

  const slides = DATA.slider.map(item => {
    let ref;

    if (item.tipo === "autor") {
      ref = DATA.autores.find(a => a.autor_id === item.ref_id);
      return {
        titulo: ref.nombre,
        portada: ref.portada,
        link: `autor.html?id=${ref.autor_id}`
      };
    }

    if (item.tipo === "libro") {
      ref = DATA.libros.find(l => l.libro_id === item.ref_id);
      return {
        titulo: ref.titulo,
        portada: ref.portada,
        link: `libro.html?id=${ref.libro_id}`
      };
    }

    if (item.tipo === "pack") {
      ref = DATA.packs.find(p => p.pack_id === item.ref_id);
      return {
        titulo: ref.nombre,
        portada: ref.portada,
        link: `pack.html?id=${ref.pack_id}`
      };
    }
  }).filter(Boolean);

  slides.forEach((s, i) => {
    const card = document.createElement("div");
    card.className = "slide";
    card.style.backgroundImage = `url('${s.portada}')`;
    card.innerHTML = `<a href="${s.link}">${s.titulo}</a>`;
    if (i === 0) card.classList.add("active");
    slider.appendChild(card);
  });

  startSlider();
}

/* =========================
   ANIMACIÓN
========================= */
function startSlider() {
  const slides = document.querySelectorAll(".slide");
  let index = 0;

  setInterval(() => {
    slides[index].classList.remove("active");
    index = (index + 1) % slides.length;
    slides[index].classList.add("active");
  }, 4000);
}
