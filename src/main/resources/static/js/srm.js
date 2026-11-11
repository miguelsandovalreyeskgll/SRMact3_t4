"use strict";

// Este frontend utiliza los mismos endpoints REST que las pruebas de Bruno.
// Se sirve desde Spring Boot, por lo que no necesita CORS ni otro servidor.
const $ = (id) => document.getElementById(id);
const estado = { alumnos: [], escuelas: [], pestaña: "alumnos", alumnoDetalleId: null };

async function peticion(ruta, opciones = {}) {
  let respuesta;
  try {
    respuesta = await fetch(ruta, {
      ...opciones,
      headers: { Accept: "application/json", ...(opciones.body ? { "Content-Type": "application/json" } : {}), ...opciones.headers },
    });
  } catch (error) {
    throw new Error("No fue posible conectar con el servidor. Comprueba que Spring Boot esté ejecutándose y que MySQL esté disponible.");
  }

  if (!respuesta.ok) {
    let detalle = "";
    try {
      const datos = await respuesta.json();
      detalle = datos.detail || datos.message || datos.error || "";
    } catch (_) { /* El servidor puede devolver una respuesta vacía o HTML. */ }
    const mensajes = {
      400: "Revisa los datos enviados y que la escuela exista.",
      404: "El registro solicitado ya no existe.",
      409: "No se puede completar la operación por un conflicto de datos.",
      500: "Error interno del servidor; revisa los logs de Spring Boot.",
      503: "El servicio no está disponible por el momento.",
    };
    throw new Error(detalle && !/^(Bad Request|Not Found|Internal Server Error)$/.test(detalle)
      ? detalle : (mensajes[respuesta.status] || `La solicitud falló (HTTP ${respuesta.status}).`));
  }
  if (respuesta.status === 204) return null;
  return respuesta.json();
}

function avisar(texto, esError = false) {
  const cuadro = $("notificacion");
  cuadro.textContent = texto;
  cuadro.classList.toggle("error", esError);
  cuadro.hidden = false;
}

function nodo(etiqueta, clase, texto) {
  const el = document.createElement(etiqueta);
  if (clase) el.className = clase;
  if (texto !== undefined) el.textContent = String(texto);
  return el;
}

function celda(texto, clase) {
  return nodo("td", clase || "", texto);
}

function ponerEstadoApi(conectada) {
  $("statusDot").className = "status-dot " + (conectada ? "online" : "offline");
  $("apiStatus").textContent = conectada ? "API conectada" : "Conexión no disponible";
}

async function actualizarDatos() {
  try {
    const [alumnos, escuelas] = await Promise.all([peticion("/api/alumnos"), peticion("/api/escuelas")]);
    estado.alumnos = alumnos;
    estado.escuelas = escuelas;
    ponerEstadoApi(true);
    $("totalAlumnos").textContent = alumnos.length;
    $("totalEscuelas").textContent = escuelas.length;
    renderizarAlumnos();
    renderizarEscuelas();
    renderizarSelectorEscuelas();
  } catch (error) {
    ponerEstadoApi(false);
    avisar(error.message, true);
    $("tablaAlumnos").replaceChildren(nodo("tr", ""));
    $("tablaAlumnos").firstChild.append(celda("No se pudo cargar la información. Usa Actualizar para reintentar.", "empty-state"));
    $("tablaAlumnos").firstChild.firstChild.colSpan = 4;
    $("tablaEscuelas").replaceChildren(nodo("tr", ""));
    $("tablaEscuelas").firstChild.append(celda("No se pudo cargar la información. Usa Actualizar para reintentar.", "empty-state"));
    $("tablaEscuelas").firstChild.firstChild.colSpan = 3;
  }
}

function renderizarAlumnos() {
  const texto = $("buscarAlumno").value.trim().toLocaleLowerCase("es");
  const filtrados = estado.alumnos.filter((a) =>
    String(a.nombre ?? "").toLocaleLowerCase("es").includes(texto)
    || String(a.escuelaNombre ?? "").toLocaleLowerCase("es").includes(texto));
  $("contadorAlumnos").textContent = `${filtrados.length} resultado${filtrados.length === 1 ? "" : "s"}`;
  const cuerpo = $("tablaAlumnos");
  cuerpo.replaceChildren();
  if (filtrados.length === 0) {
    const fila = nodo("tr");
    const campo = celda(estado.alumnos.length ? "No hay coincidencias con la búsqueda." : "Aún no hay alumnos registrados.", "empty-state");
    campo.colSpan = 4;
    fila.append(campo);
    cuerpo.append(fila);
    return;
  }
  for (const alumno of filtrados) {
    const fila = nodo("tr");
    fila.append(celda(alumno.id), celda(alumno.nombre, "name-text"));
    const columnaEscuela = nodo("td");
    columnaEscuela.append(nodo("span", "school-pill", alumno.escuelaNombre || "Sin escuela"));
    fila.append(columnaEscuela);
    const columnaAcciones = nodo("td", "action-col");
    const acciones = nodo("div", "actions");
    for (const [accion, textoAccion, clase] of [["ver", "Ver", ""], ["editar", "Editar", ""], ["eliminar", "Eliminar", "danger"]]) {
      const boton = nodo("button", `action-link ${clase}`, textoAccion);
      boton.type = "button";
      boton.dataset.accion = accion;
      boton.dataset.id = alumno.id;
      boton.setAttribute("aria-label", `${textoAccion} alumno ${alumno.nombre}`);
      acciones.append(boton);
    }
    columnaAcciones.append(acciones);
    fila.append(columnaAcciones);
    cuerpo.append(fila);
  }
}

function renderizarEscuelas() {
  const texto = $("buscarEscuela").value.trim().toLocaleLowerCase("es");
  const filtradas = estado.escuelas.filter((e) => String(e.nombre ?? "").toLocaleLowerCase("es").includes(texto));
  $("contadorEscuelas").textContent = `${filtradas.length} resultado${filtradas.length === 1 ? "" : "s"}`;
  const cuerpo = $("tablaEscuelas");
  cuerpo.replaceChildren();
  if (filtradas.length === 0) {
    const fila = nodo("tr");
    const campo = celda(estado.escuelas.length ? "No hay coincidencias con la búsqueda." : "Aún no hay escuelas registradas.", "empty-state");
    campo.colSpan = 3;
    fila.append(campo);
    cuerpo.append(fila);
    return;
  }
  for (const escuela of filtradas) {
    const cantidad = estado.alumnos.filter((a) => String(a.escuelaId) === String(escuela.id)).length;
    const fila = nodo("tr");
    fila.append(celda(escuela.id), celda(escuela.nombre, "name-text"), celda(cantidad));
    cuerpo.append(fila);
  }
}

function renderizarSelectorEscuelas() {
  const selector = $("alumnoEscuela");
  const elegido = selector.value;
  selector.replaceChildren(new Option("Selecciona una escuela", ""));
  for (const escuela of estado.escuelas) selector.add(new Option(escuela.nombre, String(escuela.id)));
  if (estado.escuelas.some((e) => String(e.id) === elegido)) selector.value = elegido;
  $("avisoSinEscuelas").hidden = estado.escuelas.length !== 0;
  selector.disabled = estado.escuelas.length === 0;
  $("guardarAlumno").disabled = estado.escuelas.length === 0;
}

function cambiarPestana(pestana) {
  estado.pestaña = pestana;
  const alumnos = pestana === "alumnos";
  $("vistaAlumnos").hidden = !alumnos;
  $("vistaEscuelas").hidden = alumnos;
  $("rutaActual").textContent = alumnos ? "Alumnos" : "Escuelas";
  $("tituloPagina").textContent = alumnos ? "Gestión de alumnos" : "Gestión de escuelas";
  $("subtituloPagina").textContent = alumnos
    ? "Administra registros de estudiantes y su escuela asignada desde un solo lugar."
    : "Consulta las instituciones y registra escuelas para asociarlas a tus alumnos.";
  $("btnPrincipal").textContent = alumnos ? "+ Nuevo alumno" : "+ Nueva escuela";
  for (const nombre of ["alumnos", "escuelas"]) {
    const boton = $(nombre === "alumnos" ? "navAlumnos" : "navEscuelas");
    const activo = nombre === pestana;
    boton.classList.toggle("active", activo);
    if (activo) boton.setAttribute("aria-current", "page"); else boton.removeAttribute("aria-current");
  }
}

function limpiarAlumno() {
  $("formAlumno").reset();
  $("alumnoId").value = "";
  $("tituloFormularioAlumno").textContent = "Registrar alumno";
  $("subtituloFormularioAlumno").textContent = "Completa los campos para crear un nuevo registro.";
  $("guardarAlumno").textContent = "Guardar alumno";
  renderizarSelectorEscuelas();
}

function editarAlumno(id) {
  const alumno = estado.alumnos.find((a) => String(a.id) === String(id));
  if (!alumno) { avisar("El alumno ya no está en la lista. Actualiza los datos.", true); return; }
  cambiarPestana("alumnos");
  $("alumnoId").value = alumno.id;
  $("alumnoNombre").value = alumno.nombre;
  $("alumnoEscuela").value = String(alumno.escuelaId);
  $("tituloFormularioAlumno").textContent = "Editar alumno";
  $("subtituloFormularioAlumno").textContent = `Modificando el registro #${alumno.id}.`;
  $("guardarAlumno").textContent = "Guardar cambios";
  $("panelAlumno").scrollIntoView({ behavior: "smooth", block: "nearest" });
  $("alumnoNombre").focus({ preventScroll: true });
}

function verAlumno(id) {
  const alumno = estado.alumnos.find((a) => String(a.id) === String(id));
  if (!alumno) { avisar("No se encontró el alumno.", true); return; }
  estado.alumnoDetalleId = alumno.id;
  $("detalleId").textContent = alumno.id;
  $("detalleNombre").textContent = alumno.nombre;
  $("detalleEscuela").textContent = alumno.escuelaNombre;
  $("detalleEscuelaId").textContent = alumno.escuelaId;
  $("modalDetalle").showModal();
}

async function eliminarAlumno(id) {
  const alumno = estado.alumnos.find((a) => String(a.id) === String(id));
  if (!alumno) return;
  if (!window.confirm(`¿Eliminar a "${alumno.nombre}"? Esta operación no se puede deshacer.`)) return;
  try {
    await peticion(`/api/alumnos/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (String($("alumnoId").value) === String(id)) limpiarAlumno();
    await actualizarDatos();
    avisar(`Alumno "${alumno.nombre}" eliminado correctamente.`);
  } catch (error) { avisar(error.message, true); }
}

$("formAlumno").addEventListener("submit", async (evento) => {
  evento.preventDefault();
  const nombre = $("alumnoNombre").value.trim();
  const escuelaId = Number($("alumnoEscuela").value);
  if (!nombre || !Number.isSafeInteger(escuelaId) || escuelaId <= 0) {
    avisar("Escribe el nombre del alumno y selecciona una escuela válida.", true);
    return;
  }
  const id = $("alumnoId").value;
  const boton = $("guardarAlumno");
  boton.disabled = true;
  try {
    await peticion(id ? `/api/alumnos/${encodeURIComponent(id)}` : "/api/alumnos", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify({ nombre, escuelaId }),
    });
    limpiarAlumno();
    await actualizarDatos();
    avisar(id ? "Alumno actualizado correctamente." : "Alumno registrado correctamente.");
  } catch (error) { avisar(error.message, true); }
  finally { boton.disabled = estado.escuelas.length === 0; }
});

$("formEscuela").addEventListener("submit", async (evento) => {
  evento.preventDefault();
  const nombre = $("escuelaNombre").value.trim();
  if (!nombre) { avisar("Escribe el nombre de la escuela.", true); return; }
  const boton = $("guardarEscuela");
  boton.disabled = true;
  try {
    await peticion("/api/escuelas", { method: "POST", body: JSON.stringify({ nombre }) });
    $("formEscuela").reset();
    await actualizarDatos();
    avisar("Escuela registrada correctamente. Ya puedes asignarle alumnos.");
  } catch (error) { avisar(error.message, true); }
  finally { boton.disabled = false; }
});

$("tablaAlumnos").addEventListener("click", (evento) => {
  const boton = evento.target.closest("button[data-accion]");
  if (!boton) return;
  const { id, accion } = boton.dataset;
  if (accion === "ver") verAlumno(id);
  if (accion === "editar") editarAlumno(id);
  if (accion === "eliminar") eliminarAlumno(id);
});

for (const boton of document.querySelectorAll("[data-tab]")) {
  boton.addEventListener("click", () => cambiarPestana(boton.dataset.tab));
}
$("buscarAlumno").addEventListener("input", renderizarAlumnos);
$("buscarEscuela").addEventListener("input", renderizarEscuelas);
$("btnActualizarAlumnos").addEventListener("click", actualizarDatos);
$("btnActualizarEscuelas").addEventListener("click", actualizarDatos);
$("cancelarAlumno").addEventListener("click", limpiarAlumno);
$("btnPrincipal").addEventListener("click", () => {
  const alumnos = estado.pestaña === "alumnos";
  if (alumnos) limpiarAlumno();
  (alumnos ? $("panelAlumno") : $("panelEscuela")).scrollIntoView({ behavior: "smooth", block: "nearest" });
  (alumnos ? $("alumnoNombre") : $("escuelaNombre")).focus({ preventScroll: true });
});
$("cerrarDetalle").addEventListener("click", () => $("modalDetalle").close());
$("volverDetalle").addEventListener("click", () => $("modalDetalle").close());
$("editarDesdeDetalle").addEventListener("click", () => {
  const id = estado.alumnoDetalleId;
  $("modalDetalle").close();
  editarAlumno(id);
});

cambiarPestana("alumnos");
actualizarDatos();
