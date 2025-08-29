// ============================
// Variables globales
// ============================
let insumos = JSON.parse(localStorage.getItem("insumos")) || [];
let historial = JSON.parse(localStorage.getItem("historial")) || [];
let editIndex = -1;
let indexSeleccionado = null;
let filaSeleccionada = null;
const form = document.getElementById("formInsumo");
const lista = document.getElementById("listaInsumos");
const buscador = document.getElementById("buscador");
const inputSeleccionado = document.getElementById("insumoSeleccionado");
const inputTipo = document.getElementById("tipo");
const contenedorSugerencias = document.getElementById("sugerenciasTipo");
const formSalida = document.getElementById("formSalida");

// ============================
// Funciones principales
// ============================

function seleccionarInsumo(index) {
    indexSeleccionado = index;
    inputSeleccionado.value = insumos[index].nombre;
}

function mostrarInsumos(filtro = "") {
    lista.innerHTML = "";
    insumos
        .filter(insumo => insumo.nombre.toLowerCase().includes(filtro.toLowerCase()))
        .forEach((insumo, index) => {
            const claseStock = insumo.cantidad < 5 ? "stock-bajo" : "";
            const tr = document.createElement("tr");
            tr.className = claseStock;
            tr.innerHTML = `
                <td>${insumo.nombre}</td>
                <td>${insumo.cantidad}</td>
                <td>${insumo.tipo}</td>
                <td>
                    <button class="btn-select">Seleccionar</button>
                    <button class="btn-edit">Editar</button>
                    <button class="btn-delete">Eliminar</button>
                </td>
            `;
            lista.appendChild(tr);

            // Botón Seleccionar
            tr.querySelector(".btn-select").addEventListener("click", () => {
                seleccionarFila(index, tr, insumo);
            });

            // Botón Editar
            tr.querySelector(".btn-edit").addEventListener("click", () => editarInsumo(index));

            // Botón Eliminar
            tr.querySelector(".btn-delete").addEventListener("click", () => {
                if (confirm(`¿Está seguro que desea eliminar el insumo "${insumo.nombre}"?`)) {
                    eliminarInsumo(index);
                }
            });
        });
    localStorage.setItem("insumos", JSON.stringify(insumos));
}

function seleccionarFila(index, tr, insumo) {
    indexSeleccionado = index;
    inputSeleccionado.value = `${insumo.nombre} (${insumo.tipo})`;
    if (filaSeleccionada) {
        filaSeleccionada.classList.remove("insumo-seleccionado");
    }
    tr.classList.add("insumo-seleccionado");
    filaSeleccionada = tr;
}

function editarInsumo(index) {
    document.getElementById("nombre").value = insumos[index].nombre;
    document.getElementById("cantidad").value = insumos[index].cantidad;
    document.getElementById("tipo").value = insumos[index].tipo;
    editIndex = index;
}

function eliminarInsumo(index) {
    insumos.splice(index, 1);
    mostrarInsumos(buscador.value);
}

function mostrarHistorial() {
    const tabla = document.getElementById("tablaHistorial");
    if (!tabla) return;
    tabla.innerHTML = "";
    historial.forEach(item => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${item.nombre}</td>
            <td>${item.cantidad}</td>
            <td>${item.fecha}</td>
        `;
        tabla.appendChild(tr);
    });
}

// ============================
// Funciones de utilidad
// ============================

function limpiarSeleccion() {
    if (filaSeleccionada) {
        filaSeleccionada.classList.remove("insumo-seleccionado");
        filaSeleccionada = null;
    }
    inputSeleccionado.value = "";
    indexSeleccionado = null;
}

// ============================
// Eventos
// ============================

function agregarEventos() {
    // Limpiar selección al clicar fuera
document.addEventListener("click", (e) => {
    if (
        !e.target.closest("#listaInsumos") &&
        e.target !== inputSeleccionado &&
        e.target !== document.getElementById("cantidadRetiro") &&
        !e.target.closest("#formSalida") // <-- Agrega esta excepción
    ) {
        limpiarSeleccion();
    }
    if (e.target !== inputTipo) {
        contenedorSugerencias.style.display = "none";
    }
});

    // Agregar/editar insumo
    form.addEventListener("submit", e => {
        e.preventDefault();
        const nombre = document.getElementById("nombre").value;
        const cantidad = parseInt(document.getElementById("cantidad").value);
        const tipo = document.getElementById("tipo").value;
        if (editIndex === -1) {
            insumos.push({ nombre, cantidad, tipo });
        } else {
            insumos[editIndex] = { nombre, cantidad, tipo };
            editIndex = -1;
        }
        form.reset();
        mostrarInsumos(buscador.value);
    });

    // Filtrar por nombre
    buscador.addEventListener("input", e => {
        mostrarInsumos(e.target.value);
    });

    // Autocompletado de tipos
    inputTipo.addEventListener("input", () => {
        const valor = inputTipo.value.toLowerCase();
        const tiposExistentes = [...new Set(insumos.map(i => i.tipo))];
        const coincidencias = tiposExistentes.filter(tipo => tipo.toLowerCase().startsWith(valor));
        contenedorSugerencias.innerHTML = "";
        if (coincidencias.length > 0 && valor !== "") {
            coincidencias.forEach(tipo => {
                const div = document.createElement("div");
                div.textContent = tipo;
                div.addEventListener("click", () => {
                    inputTipo.value = tipo;
                    contenedorSugerencias.innerHTML = "";
                    contenedorSugerencias.style.display = "none";
                });
                contenedorSugerencias.appendChild(div);
            });
            contenedorSugerencias.style.display = "block";
        } else {
            contenedorSugerencias.style.display = "none";
        }
    });

    // Procesar salida de stock
    formSalida.addEventListener("submit", e => {
        e.preventDefault();
        if (indexSeleccionado === null) {
            alert("Seleccione un insumo primero.");
            return;
        }
        const cantidad = parseInt(document.getElementById("cantidadRetiro").value);
        if (isNaN(cantidad) || cantidad <= 0) {
            alert("Ingrese una cantidad válida.");
            return;
        }
        if (cantidad > insumos[indexSeleccionado].cantidad) {
            alert("La cantidad a retirar excede el stock disponible.");
            return;
        }
        insumos[indexSeleccionado].cantidad -= cantidad;
        const fechaActual = new Date().toLocaleString();
        historial.push({
            nombre: insumos[indexSeleccionado].nombre,
            cantidad: cantidad,
            fecha: fechaActual
        });
        localStorage.setItem("historial", JSON.stringify(historial));
        mostrarInsumos(buscador.value);
        mostrarHistorial();
        limpiarSeleccion();
        formSalida.reset();
    });
}

// ============================
// Inicialización
// ============================

function inicializarApp() {
    mostrarInsumos();
    mostrarHistorial();
    agregarEventos();
}

inicializarApp();