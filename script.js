let gastoEnEdicion = null;
let gastoEnPago = null;

// Funciones para Material Design
function abrirModalAgregarGasto() {
    try {
        const modal = document.getElementById('modalAgregarGasto');
        if (modal) {
            modal.style.display = 'flex';
            
            // Limpiar el formulario si no está en modo edición
            if (!gastoEnEdicion) {
                document.getElementById("nic").value = "";
                document.getElementById("nombre").value = "";
                document.getElementById("deuda").value = "";
                document.getElementById("dia_pago").value = "";
                document.getElementById("enlace_pago").value = "";
                
                // Resetear el botón
                const btnGuardar = document.getElementById("btnGuardar");
                if (btnGuardar) {
                    btnGuardar.innerHTML = '<i class="material-icons">save</i> Guardar';
                }
            }
            
            // Enfocar el campo nombre después de que la modal aparezca
            setTimeout(() => {
                const nombreInput = document.getElementById("nombre");
                if (nombreInput) {
                    nombreInput.focus();
                }
            }, 300);
            
            mostrarSnackbar("Modal abierta para agregar nuevo gasto");
        } else {
            console.error("No se encontró la modal");
            mostrarSnackbar("Error: No se pudo abrir la modal", 3000);
        }
    } catch (error) {
        console.error("Error en abrirModalAgregarGasto:", error);
        mostrarSnackbar("Error al abrir la modal", 3000);
    }
}

function cerrarModalAgregarGasto() {
    const modal = document.getElementById('modalAgregarGasto');
    if (modal) {
        modal.style.display = 'none';
        
        // Limpiar formulario
        document.getElementById("nic").value = "";
        document.getElementById("nombre").value = "";
        document.getElementById("deuda").value = "";
        document.getElementById("dia_pago").value = "";
        document.getElementById("enlace_pago").value = "";
        
        // Resetear el botón
        const btnGuardar = document.getElementById("btnGuardar");
        if (btnGuardar) {
            btnGuardar.innerHTML = '<i class="material-icons">save</i> Guardar';
        }
        
        gastoEnEdicion = null;
        mostrarSnackbar("Modal cerrada");
    }
}

function scrollToForm() {
    // Función mantenida por compatibilidad, ahora redirige a la modal
    abrirModalAgregarGasto();
}

function mostrarSnackbar(mensaje, duracion = 3000) {
    const snackbar = document.getElementById("snackbar");
    const snackbarText = document.getElementById("snackbar-text");
    
    snackbarText.textContent = mensaje;
    snackbar.classList.add("md-snackbar--show");
    
    setTimeout(() => {
        snackbar.classList.remove("md-snackbar--show");
    }, duracion);
}

function obtenerGastos() {
    return JSON.parse(localStorage.getItem("gastos") || "[]");
}

function editarGasto(id) {
    const gastos = obtenerGastos();
    const gasto = gastos.find(g => g.id === id);
    if (gasto) {
        // Cargar datos en el formulario
        document.getElementById("nic").value = gasto.nic;
        document.getElementById("nombre").value = gasto.nombre;
        document.getElementById("deuda").value = gasto.deuda;
        document.getElementById("dia_pago").value = gasto.dia_pago || "";
        document.getElementById("enlace_pago").value = gasto.enlace_pago || "";
        
        // Cambiar el texto del botón
        const btnGuardar = document.getElementById("btnGuardar");
        btnGuardar.innerHTML = '<i class="material-icons">update</i> Actualizar';
        
        // Guardar referencia del gasto en edición
        gastoEnEdicion = id;
        
        // Abrir la modal
        abrirModalAgregarGasto();
    }
}

function guardarGastos(gastos) {
    localStorage.setItem("gastos", JSON.stringify(gastos));
}

function crearGasto() {
    const nic = document.getElementById("nic").value.trim();
    const nombre = document.getElementById("nombre").value.trim();
    const deuda = parseFloat(document.getElementById("deuda").value) || 0;
    const dia_pago = document.getElementById("dia_pago").value ? parseInt(document.getElementById("dia_pago").value) : null;
    const enlace_pago = document.getElementById("enlace_pago").value.trim() || null;

    if (!nic) {
        mostrarSnackbar("El NIC es obligatorio", 4000);
        return;
    }

    if (!nombre) {
        mostrarSnackbar("El nombre es obligatorio", 4000);
        return;
    }

    // Validar día de pago
    if (dia_pago && (dia_pago < 1 || dia_pago > 31)) {
        mostrarSnackbar("El día de pago debe estar entre 1 y 31", 4000);
        return;
    }

    // Estructura base del gasto
    const datosGasto = {
        nic,
        nombre,
        deuda,
        dia_pago,
        enlace_pago,
        pagos: []
    };
    const gastos = obtenerGastos();

    if (gastoEnEdicion) {
        // Modo edición
        const indice = gastos.findIndex(g => g.id === gastoEnEdicion);
        if (indice !== -1) {
            // Mantener id y pagos existentes
            gastos[indice] = {
                ...gastos[indice],
                ...datosGasto
            };
        }
        // Resetear modo edición
        gastoEnEdicion = null;
        document.getElementById("btnGuardar").textContent = "Guardar";
    } else {
        // Modo creación
        const nuevoGasto = {
            id: Date.now(),
            ...datosGasto
        };
    gastos.push(nuevoGasto);
    }

    guardarGastos(gastos);
    mostrarGastos();
    
    // Cerrar la modal después de guardar
    cerrarModalAgregarGasto();
    
    // Mostrar notificación de éxito
    if (gastoEnEdicion) {
        mostrarSnackbar("Gasto actualizado exitosamente");
    } else {
        mostrarSnackbar("Gasto creado exitosamente");
    }
}

function mostrarGastos(gastosFiltrados = null) {
    let gastos = gastosFiltrados || obtenerGastos();
    console.log('Mostrando gastos:', gastos);
    
    // Ordenar gastos por día de pago (los que no tienen día van al final)
    gastos = ordenarGastosPorDia(gastos);
    
    const tbody = document.getElementById("tabla_gastos");
    tbody.innerHTML = "";

    gastos.forEach(g => {
        const estadoInfo = calcularEstadoGasto(g);
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td data-label="NIC">${g.nic}</td>
            <td data-label="Nombre">${g.nombre}</td>
            <td data-label="Deuda">${g.deuda.toLocaleString("es-CO", { style: "currency", currency: "COP" })}</td>
            <td data-label="Día de Pago">${g.dia_pago ? `Día ${g.dia_pago}` : 'No definido'}</td>
            <td data-label="Estado"><span class="estado estado-${estadoInfo.estado}">${estadoInfo.estado}</span></td>
            <td data-label="Enlace">${g.enlace_pago ? `<a href="${g.enlace_pago}" target="_blank" class="enlace-pago">Pagar</a>` : 'No disponible'}</td>
            <td data-label="Acciones" class="acciones">
                <div class="botones-container">
                                         ${estadoInfo.estado === 'urgente' ? `
                         <button class="btn-alerta" title="¡Pago Urgente! ${estadoInfo.diasRestantes < 0 ? `Vencido hace ${Math.abs(estadoInfo.diasRestantes)} días` : `Vence en ${estadoInfo.diasRestantes} días`}">
                             <i class="fas fa-exclamation-triangle"></i>
                         </button>
                     ` : ''}
                    <button onclick="abrirModalPago(${g.id})" class="btn-pagar" title="Registrar Pago">
                        <i class="fas fa-dollar-sign"></i>
                    </button>
                    <button onclick="verHistorialPagos(${g.id})" class="btn-historial" title="Ver Historial de Pagos">
                        <i class="fas fa-history"></i>
                    </button>
                    <button onclick="editarGasto(${g.id})" class="btn-editar" title="Editar Gasto">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="eliminarGasto(${g.id})" class="btn-eliminar" title="Eliminar Gasto">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(fila);
    });
    
    // Actualizar contador de resultados
    actualizarContadorResultados(gastos.length);
    
    // Actualizar estadísticas si están visibles
    const statsContent = document.getElementById('statsContent');
    if (statsContent && statsContent.style.display !== 'none') {
        actualizarEstadisticas();
    }
}

function ordenarGastosPorDia(gastos) {
    return gastos.sort((a, b) => {
        // Si ambos tienen día de pago, ordenar por día
        if (a.dia_pago && b.dia_pago) {
            return a.dia_pago - b.dia_pago;
        }
        // Si solo uno tiene día de pago, el que tiene día va primero
        if (a.dia_pago && !b.dia_pago) return -1;
        if (!a.dia_pago && b.dia_pago) return 1;
        // Si ninguno tiene día de pago, ordenar por nombre
        return a.nombre.localeCompare(b.nombre);
    });
}

function filtrarGastos() {
    const busqueda = document.getElementById("filtroBusqueda").value.toLowerCase().trim();
    const filtroEstado = document.getElementById("filtroEstado").value;
    
    const gastos = obtenerGastos();
    const gastosFiltrados = gastos.filter(gasto => {
        const estadoInfo = calcularEstadoGasto(gasto);
        
        // Filtro por búsqueda (NIC, nombre, enlace)
        const coincideBusqueda = !busqueda || 
            gasto.nic.toLowerCase().includes(busqueda) ||
            gasto.nombre.toLowerCase().includes(busqueda) ||
            (gasto.enlace_pago && gasto.enlace_pago.toLowerCase().includes(busqueda));
        
        // Filtro por estado
        const coincideEstado = !filtroEstado || estadoInfo.estado === filtroEstado;
        
        return coincideBusqueda && coincideEstado;
    });
    
    mostrarGastos(gastosFiltrados);
}

function limpiarFiltro() {
    document.getElementById("filtroBusqueda").value = "";
    document.getElementById("filtroEstado").value = "";
    mostrarGastos();
}

function actualizarContadorResultados(cantidad) {
    const totalGastos = obtenerGastos().length;
    const resultadosElement = document.getElementById("resultadosFiltro");
    
    if (cantidad === totalGastos) {
        resultadosElement.textContent = `Mostrando todos los gastos (${totalGastos})`;
    } else {
        resultadosElement.textContent = `Mostrando ${cantidad} de ${totalGastos} gastos`;
    }
}

function calcularDiferenciaPago() {
    const gastos = obtenerGastos();
    const gasto = gastos.find(g => g.id === gastoEnPago);
    if (!gasto) return;

    const valorOriginal = gasto.deuda;
    const valorPagado = parseFloat(document.getElementById("modalValorPagado").value) || 0;
    const diferencia = valorPagado - valorOriginal;
    const diferenciaPagoDiv = document.getElementById("diferenciaPago");

    if (valorPagado === 0) {
        diferenciaPagoDiv.textContent = "";
        diferenciaPagoDiv.className = "diferencia-valor";
        return;
    }

    const formatoMoneda = (valor) => valor.toLocaleString("es-CO", { style: "currency", currency: "COP" });
    
    if (diferencia > 0) {
        diferenciaPagoDiv.textContent = `Pagando ${formatoMoneda(diferencia)} más que el valor original`;
        diferenciaPagoDiv.className = "diferencia-valor mas";
    } else if (diferencia < 0) {
        diferenciaPagoDiv.textContent = `Pagando ${formatoMoneda(Math.abs(diferencia))} menos que el valor original`;
        diferenciaPagoDiv.className = "diferencia-valor menos";
    } else {
        diferenciaPagoDiv.textContent = "Valor igual al original";
        diferenciaPagoDiv.className = "diferencia-valor igual";
    }
}

function abrirModalPago(id) {
    const gastos = obtenerGastos();
    const gasto = gastos.find(g => g.id === id);
    if (gasto) {
        gastoEnPago = id;
        
        // Cargar información en el modal
        document.getElementById("modalNombreGasto").textContent = gasto.nombre;
        document.getElementById("modalMontoGasto").textContent = 
            gasto.deuda.toLocaleString("es-CO", { style: "currency", currency: "COP" });
        document.getElementById("modalFechaPagar").textContent = gasto.dia_pago ? `Día ${gasto.dia_pago}` : "No especificado";
        
        // Establecer fecha actual y valor original
        document.getElementById("modalFechaPago").value = new Date().toISOString().split('T')[0];
        document.getElementById("modalValorPagado").value = gasto.deuda;
        
        // Limpiar otros campos
        document.getElementById("modalComprobante").value = "";
        document.getElementById("modalNotas").value = "";
        document.getElementById("diferenciaPago").textContent = "";
        
        // Configurar evento para calcular diferencia
        document.getElementById("modalValorPagado").addEventListener("input", calcularDiferenciaPago);
        
        // Mostrar modal
        document.getElementById("modalPago").style.display = "flex";
    }
}

function cerrarModal() {
    document.getElementById("modalPago").style.display = "none";
    gastoEnPago = null;
}

function cerrarModalHistorial() {
    document.getElementById("modalHistorial").style.display = "none";
}

let gastoActualHistorial = null;

// Variable global para almacenar el ID del pago a eliminar

let pagoAEliminar = null;

function confirmarEliminacion() {
    if (pagoAEliminar !== null) {
        confirmarEliminarPago();
    } else if (gastoAEliminar !== null) {
        confirmarEliminarGasto();
    }
}

function eliminarGasto(id) {
    const gastos = obtenerGastos();
    const gasto = gastos.find(g => g.id === id);
    if (!gasto) return;

    // Guardar el ID del gasto a eliminar
    gastoAEliminar = id;

    // Mostrar modal de confirmación con detalles del gasto
    const mensaje = `
        <p>¿Estás seguro de que deseas eliminar este gasto?</p>
        <p class="gasto-a-eliminar">Gasto: <strong>${gasto.nombre}</strong></p>
        <p class="gasto-a-eliminar">Valor: <strong>${gasto.deuda.toLocaleString("es-CO", { style: "currency", currency: "COP" })}</strong></p>
    `;

    document.querySelector('.confirmacion-body').innerHTML = mensaje;
    document.getElementById('modalConfirmacion').style.display = 'flex';
}

// Función para confirmar la eliminación de un pago
function confirmarEliminarPago() {
    if (pagoAEliminar === null || !gastoActualHistorial) return;

    const gastos = obtenerGastos();
    const gasto = gastos.find(g => g.id === gastoActualHistorial);
    
    if (gasto && gasto.pagos) {
        // Eliminar el pago
        gasto.pagos = gasto.pagos.filter(p => p.id !== pagoAEliminar);
        
        // Recalcular estado basado en pagos restantes
        const totalPagado = gasto.pagos.reduce((sum, p) => sum + p.valor, 0);
        gasto.estado = totalPagado >= gasto.deuda ? "pagado" : "pendiente";
        
        guardarGastos(gastos);
        mostrarGastos();
        verHistorialPagos(gastoActualHistorial); // Actualizar la vista del historial
        cerrarModalConfirmacion();
        
        // Limpiar la variable
        pagoAEliminar = null;
    }
}

// Función para cerrar el modal de confirmación

function cerrarModalConfirmacion() {
    document.getElementById("modalConfirmacion").style.display = "none";
    gastoAEliminar = null;
    pagoAEliminar = null;
}
// ... existing code ...

function verHistorialPagos(id) {
    const gastos = obtenerGastos();
    const gasto = gastos.find(g => g.id === id);
    if (!gasto) return;

    gastoActualHistorial = id;

    // Actualizar información del gasto
    document.getElementById("historialNombreGasto").textContent = gasto.nombre;
    document.getElementById("historialValorOriginal").textContent = 
        gasto.deuda.toLocaleString("es-CO", { style: "currency", currency: "COP" });
    document.getElementById("historialEstado").textContent = gasto.estado;

    // Mostrar lista de pagos
    const listaPagos = document.getElementById("listaPagos");
    listaPagos.innerHTML = "";

    if (gasto.pagos && gasto.pagos.length > 0) {
        // Ordenar pagos por fecha, del más reciente al más antiguo
        const pagosOrdenados = [...gasto.pagos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        
        listaPagos.innerHTML = pagosOrdenados.map(pago => `
            <tr>
                <td>${pago.fecha}</td>
                <td class="valor">${pago.valor.toLocaleString("es-CO", { style: "currency", currency: "COP" })}</td>
                <td class="diferencia ${pago.diferencia > 0 ? 'diferencia-mas' : pago.diferencia < 0 ? 'diferencia-menos' : ''}">
                    ${pago.diferencia !== 0 ? (pago.diferencia > 0 ? '+' : '') + pago.diferencia.toLocaleString("es-CO", { style: "currency", currency: "COP" }) : '-'}
                </td>
                <td>${pago.comprobante || '-'}</td>
                <td>${pago.notas || '-'}</td>
                <td class="acciones">
                    <button onclick="eliminarPago(${pago.id})" class="btn-eliminar-pago" title="Eliminar Pago">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        // Mostrar total pagado
        const totalPagado = gasto.pagos.reduce((sum, p) => sum + p.valor, 0);
        document.getElementById("historialTotalPagado").innerHTML = `
            Total pagado: ${totalPagado.toLocaleString("es-CO", { style: "currency", currency: "COP" })}
        `;
    } else {
        listaPagos.innerHTML = '<tr><td colspan="5" class="no-pagos">No hay pagos registrados</td></tr>';
        document.getElementById("historialTotalPagado").innerHTML = "";
    }

    // Mostrar modal
    document.getElementById("modalHistorial").style.display = "flex";
}

function calcularEstadoGasto(gasto) {
    // PRIORIDAD 1: Si tiene pagos en el mes actual, está pagado
    if (gasto.pagos && gasto.pagos.length > 0) {
        const hoy = new Date();
        const inicioMesActual = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        const finMesActual = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

        const pagosMesActual = gasto.pagos.filter(pago => {
            const fechaPago = new Date(pago.fecha);
            return fechaPago >= inicioMesActual && fechaPago <= finMesActual;
        });

        if (pagosMesActual.length > 0) {
            return { 
                estado: "pagado", 
                tienepagoMesActual: true, 
                esUrgente: false,
                diasRestantes: 0
            };
        }
    }

    // PRIORIDAD 2 y 3: Verificar urgencia basada en el día de pago
    const estadoInfo = verificarUrgenciaPorDia(gasto);
    
    return {
        estado: estadoInfo.estado,
        tienepagoMesActual: false,
        esUrgente: estadoInfo.estado === "urgente",
        diasRestantes: estadoInfo.diasRestantes
    };
}

function verificarUrgenciaPorDia(gasto) {
    // Si no tiene día de pago, puede esperar
    if (!gasto.dia_pago) {
        return { 
            estado: "puede esperar", 
            diasRestantes: null 
        };
    }

    const hoy = new Date();
    const diaActual = hoy.getDate();
    const diaPago = parseInt(gasto.dia_pago);
    
    // Calcular días restantes hasta el próximo día de pago
    let diasRestantes;
    let estado;
    
    if (diaActual <= diaPago) {
        // El día de pago está en el mes actual
        diasRestantes = diaPago - diaActual;
        
        // Si faltan 2 días o menos, es urgente
        if (diasRestantes <= 2) {
            estado = "urgente";
        } else {
            estado = "puede esperar";
        }
    } else {
        // El día de pago ya pasó este mes - SIEMPRE ES URGENTE
        const diasVencidos = diaActual - diaPago;
        estado = "urgente";
        diasRestantes = -diasVencidos; // Número negativo para indicar vencimiento
    }
    
    console.log('Verificando urgencia para:', gasto.nombre);
    console.log('Día actual:', diaActual);
    console.log('Día de pago:', diaPago);
    console.log('Días restantes:', diasRestantes);
    console.log('Estado:', estado);
    
    return {
        estado: estado,
        diasRestantes: diasRestantes
    };
}

function mostrarNotificacion(mensaje, tipo = 'info') {
    if (!("Notification" in window)) {
        return;
    }

    if (Notification.permission === "granted") {
        new Notification("Gastos - Alerta", {
            body: mensaje,
            icon: "https://cdn-icons-png.flaticon.com/512/2645/2645233.png"
        });
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                new Notification("Gastos - Alerta", {
                    body: mensaje,
                    icon: "https://cdn-icons-png.flaticon.com/512/2645/2645233.png"
                });
            }
        });
    }
}

function registrarPago() {
    if (!gastoEnPago) return;

    const fechaPago = document.getElementById("modalFechaPago").value;
    const valorPagado = parseFloat(document.getElementById("modalValorPagado").value);
    const comprobante = document.getElementById("modalComprobante").value.trim();
    const notas = document.getElementById("modalNotas").value.trim();

    if (!fechaPago) {
        alert("La fecha de pago es obligatoria");
        return;
    }

    if (!valorPagado || valorPagado <= 0) {
        alert("El valor pagado debe ser mayor a 0");
        return;
    }

    const gastos = obtenerGastos();
    const indice = gastos.findIndex(g => g.id === gastoEnPago);
    
    if (indice !== -1) {
        const gasto = gastos[indice];
        const diferencia = valorPagado - gasto.deuda;
        
        // Crear nuevo registro de pago
        const nuevoPago = {
            id: Date.now(),
            fecha: fechaPago,
            valor: valorPagado,
            diferencia: diferencia,
            comprobante: comprobante || null,
            notas: notas || null
        };
        
        // Agregar pago al historial
        if (!gasto.pagos) gasto.pagos = [];
        gasto.pagos.push(nuevoPago);
        
        guardarGastos(gastos);
        mostrarGastos();
        cerrarModal();
    }
}

let gastoAEliminar = null;

function eliminarGasto(id) {
    const gastos = obtenerGastos();
    const gasto = gastos.find(g => g.id === id);
    if (!gasto) return;

    // Guardar el ID del gasto a eliminar
    gastoAEliminar = id;
    
    // Mostrar modal de confirmación con detalles del gasto
    const mensaje = `
        <p>¿Estás seguro de que deseas eliminar este gasto?</p>
        <p class="gasto-a-eliminar">Gasto: <strong>${gasto.nombre}</strong></p>
        <p class="gasto-a-eliminar">Valor: <strong>${gasto.deuda.toLocaleString("es-CO", { style: "currency", currency: "COP" })}</strong></p>
    `;

    document.querySelector('.confirmacion-body').innerHTML = mensaje;
    document.getElementById('modalConfirmacion').style.display = 'flex';
}

function cerrarModalConfirmacion() {
    document.getElementById("modalConfirmacion").style.display = "none";
    gastoAEliminar = null;
}

function confirmarEliminarGasto() {
    if (gastoAEliminar === null) return;

    const gastos = obtenerGastos();
    const gastosActualizados = gastos.filter(g => g.id !== gastoAEliminar);
    guardarGastos(gastosActualizados);
    mostrarGastos();
    cerrarModalConfirmacion();
}

function exportarJSON() {
    const gastos = obtenerGastos();
    const dataStr = JSON.stringify(gastos, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gastos.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    mostrarSnackbar("Archivo JSON exportado exitosamente");
}

function importarJSON() {
    document.getElementById('importarArchivo').click();
}

function procesarArchivoImportado(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const contenido = e.target.result;
            const gastos = JSON.parse(contenido);
            
            // Validar que sea un array de gastos
            if (!Array.isArray(gastos)) {
                mostrarSnackbar("Error: El archivo no contiene una lista válida de gastos", 4000);
                return;
            }

            // Validar estructura básica de los gastos
            const gastosValidos = gastos.every(gasto => 
                gasto.nic && gasto.nombre && typeof gasto.deuda === 'number'
            );

            if (!gastosValidos) {
                mostrarSnackbar("Error: El archivo contiene datos de gastos inválidos", 4000);
                return;
            }

            // Confirmar importación
            const mensaje = `¿Estás seguro de que deseas importar ${gastos.length} gastos? Esto reemplazará todos los gastos actuales.`;
            if (confirm(mensaje)) {
                guardarGastos(gastos);
                mostrarGastos();
                mostrarSnackbar(`${gastos.length} gastos importados exitosamente`);
            }
        } catch (error) {
            console.error('Error al procesar archivo:', error);
            mostrarSnackbar("Error: No se pudo procesar el archivo JSON", 4000);
        }
    };
    
    reader.readAsText(file);
    
    // Limpiar el input para permitir cargar el mismo archivo nuevamente
    event.target.value = '';
}

// Verificar pagos urgentes y mostrar notificaciones
function verificarPagosUrgentes() {
    const gastos = obtenerGastos();
    gastos.forEach(gasto => {
        const estadoInfo = calcularEstadoGasto(gasto);
        if (estadoInfo.estado === "urgente") {
            const mensaje = estadoInfo.diasRestantes < 0 ? 
                `¡Pago urgente! "${gasto.nombre}" está vencido hace ${Math.abs(estadoInfo.diasRestantes)} día(s).` :
                `¡Pago urgente! "${gasto.nombre}" vence en ${estadoInfo.diasRestantes} día(s).`;
            mostrarNotificacion(mensaje);
        }
    });
}

// Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    mostrarGastos();
    
    // Solicitar permiso para notificaciones
    if ("Notification" in window) {
        Notification.requestPermission();
    }
    
    // Verificar pagos urgentes cada hora
    verificarPagosUrgentes();
    setInterval(verificarPagosUrgentes, 3600000); // 3600000 ms = 1 hora
});

// ... existing code ...

// Función para eliminar un pago
function eliminarPago(idPago) {
    // Guardar el ID del pago a eliminar
    pagoAEliminar = idPago;

    // Mostrar modal de confirmación
    const gastos = obtenerGastos();
    const gasto = gastos.find(g => g.id === gastoActualHistorial);
    if (!gasto) return;

    const pago = gasto.pagos.find(p => p.id === idPago);
    if (!pago) return;

    // Mostrar detalles del pago a eliminar en el modal
    const mensaje = `
        <p>¿Estás seguro de que deseas eliminar este pago?</p>
        <p class="gasto-a-eliminar">Fecha: <strong>${pago.fecha}</strong></p>
        <p class="gasto-a-eliminar">Valor: <strong>${pago.valor.toLocaleString("es-CO", { style: "currency", currency: "COP" })}</strong></p>
    `;
    document.querySelector('.confirmacion-body').innerHTML = mensaje;
    document.getElementById('modalConfirmacion').style.display = 'flex';
}

// Eventos para cerrar modales al hacer clic fuera de ellas
document.addEventListener('DOMContentLoaded', () => {
    // Cerrar modal de agregar gasto al hacer clic fuera
    document.getElementById('modalAgregarGasto').addEventListener('click', function(e) {
        if (e.target === this) {
            cerrarModalAgregarGasto();
        }
    });

    // Cerrar modal de pago al hacer clic fuera
    document.getElementById('modalPago').addEventListener('click', function(e) {
        if (e.target === this) {
            cerrarModal();
        }
    });

    // Cerrar modal de historial al hacer clic fuera
    document.getElementById('modalHistorial').addEventListener('click', function(e) {
        if (e.target === this) {
            cerrarModalHistorial();
        }
    });

    // Cerrar modal de confirmación al hacer clic fuera
    document.getElementById('modalConfirmacion').addEventListener('click', function(e) {
        if (e.target === this) {
            cerrarModalConfirmacion();
        }
    });
});

// ===== FUNCIONES DE ESTADÍSTICAS Y GRÁFICOS =====

// Variables globales para los gráficos
let chartEstados = null;
let chartCategorias = null;
let chartPagosMensuales = null;
let chartEstadosDashboard = null;
let chartCategoriasDashboard = null;
let chartPagosMensualesDashboard = null;

// Función para limpiar todos los gráficos
function limpiarGraficos() {
    if (chartEstados) {
        chartEstados.destroy();
        chartEstados = null;
    }
    if (chartCategorias) {
        chartCategorias.destroy();
        chartCategorias = null;
    }
    if (chartPagosMensuales) {
        chartPagosMensuales.destroy();
        chartPagosMensuales = null;
    }
    if (chartEstadosDashboard) {
        chartEstadosDashboard.destroy();
        chartEstadosDashboard = null;
    }
    if (chartCategoriasDashboard) {
        chartCategoriasDashboard.destroy();
        chartCategoriasDashboard = null;
    }
    if (chartPagosMensualesDashboard) {
        chartPagosMensualesDashboard.destroy();
        chartPagosMensualesDashboard = null;
    }
}

// Función para mostrar/ocultar estadísticas
function toggleEstadisticas() {
    const statsContent = document.getElementById('statsContent');
    const btnToggle = document.getElementById('btnToggleStats');
    const icon = btnToggle.querySelector('i');
    
    if (statsContent.style.display === 'none') {
        statsContent.style.display = 'block';
        icon.textContent = 'expand_less';
        btnToggle.innerHTML = '<i class="material-icons">expand_less</i> Ocultar Estadísticas';
        
        // Limpiar gráficos existentes antes de crear nuevos
        limpiarGraficos();
        
        // Pequeño delay para asegurar que el DOM esté listo
        setTimeout(() => {
            actualizarEstadisticas();
            mostrarSnackbar("Estadísticas actualizadas");
        }, 100);
    } else {
        statsContent.style.display = 'none';
        icon.textContent = 'expand_more';
        btnToggle.innerHTML = '<i class="material-icons">expand_more</i> Mostrar Estadísticas';
        
        // Limpiar gráficos al ocultar
        limpiarGraficos();
    }
}

// Función principal para actualizar todas las estadísticas
function actualizarEstadisticas() {
    try {
        actualizarEstadisticasGenerales();
        
        // Actualizar gráficos con delays para evitar conflictos
        setTimeout(() => actualizarGraficoEstados(), 50);
        setTimeout(() => actualizarGraficoCategorias(), 150);
        setTimeout(() => actualizarGraficoPagosMensuales(), 250);
        
        actualizarResumenFinanciero();
    } catch (error) {
        console.error('Error al actualizar estadísticas:', error);
        mostrarSnackbar("Error al actualizar estadísticas", 4000);
    }
}

// Actualizar estadísticas generales
function actualizarEstadisticasGenerales() {
    const gastos = obtenerGastos();
    
    // Contar por estado usando la nueva lógica
    const totalGastos = gastos.length;
    
    // Contar gastos por estado usando calcularEstadoGasto
    let gastosPendientes = 0;
    let gastosPagados = 0;
    let gastosUrgentes = 0;
    
    gastos.forEach(gasto => {
        const estadoInfo = calcularEstadoGasto(gasto);
        switch (estadoInfo.estado) {
            case 'pagado':
                gastosPagados++;
                break;
            case 'urgente':
                gastosUrgentes++;
                break;
            case 'puede esperar':
                gastosPendientes++;
                break;
        }
    });
    
    // Actualizar elementos en el DOM
    document.getElementById('totalGastos').textContent = totalGastos;
    document.getElementById('gastosPendientes').textContent = gastosPendientes;
    document.getElementById('gastosPagados').textContent = gastosPagados;
    document.getElementById('gastosUrgentes').textContent = gastosUrgentes;
}

// Gráfico de distribución por estado
function actualizarGraficoEstados() {
    const gastos = obtenerGastos();
    console.log('Gastos para gráfico de estados:', gastos);
    
    // Contar gastos por estado
    const estados = {};
    gastos.forEach(gasto => {
        const estadoInfo = calcularEstadoGasto(gasto);
        const estado = estadoInfo.estado;
        estados[estado] = (estados[estado] || 0) + 1;
        console.log(`Gasto: ${gasto.nombre}, Estado calculado: ${estado}`);
    });
    
    console.log('Estados contados:', estados);
    
    const ctx = document.getElementById('chartEstados');
    if (!ctx) {
        console.error('Canvas chartEstados no encontrado');
        return;
    }
    
    // Destruir gráfico existente si existe
    if (chartEstados) {
        chartEstados.destroy();
        chartEstados = null;
    }
    
    // Verificar que hay datos para mostrar
    if (Object.keys(estados).length === 0) {
        console.log('No hay datos para mostrar en el gráfico de estados');
        return;
    }
    
    try {
        chartEstados = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(estados).map(estado => {
                    const labels = {
                        'puede esperar': 'Pendientes',
                        'urgente': 'Urgentes',
                        'pagado': 'Pagados'
                    };
                    return labels[estado] || estado;
                }),
                datasets: [{
                    data: Object.values(estados),
                    backgroundColor: [
                        '#FF6384', // Rojo para urgentes
                        '#36A2EB', // Azul para pendientes
                        '#4BC0C0', // Verde para pagados
                        '#FFCE56'  // Amarillo para otros
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: ${context.parsed} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error al crear gráfico de estados:', error);
    }
}

// Gráfico de gastos por categoría
function actualizarGraficoCategorias() {
    const gastos = obtenerGastos();
    console.log('Gastos para gráfico de categorías:', gastos);
    
    // Agrupar por categoría (usando el nombre del gasto como categoría)
    const categorias = {};
    gastos.forEach(gasto => {
        const categoria = obtenerCategoriaGasto(gasto.nombre);
        if (!categorias[categoria]) {
            categorias[categoria] = {
                cantidad: 0,
                total: 0
            };
        }
        categorias[categoria].cantidad++;
        categorias[categoria].total += parseFloat(gasto.deuda);
        console.log(`Gasto: ${gasto.nombre}, Categoría: ${categoria}, Deuda: ${gasto.deuda}`);
    });
    
    console.log('Categorías agrupadas:', categorias);
    
    const ctx = document.getElementById('chartCategorias');
    if (!ctx) {
        console.error('Canvas chartCategorias no encontrado');
        return;
    }
    
    // Destruir gráfico existente si existe
    if (chartCategorias) {
        chartCategorias.destroy();
        chartCategorias = null;
    }
    
    // Verificar que hay datos para mostrar
    if (Object.keys(categorias).length === 0) {
        console.log('No hay datos para mostrar en el gráfico de categorías');
        return;
    }
    
    try {
        chartCategorias = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(categorias),
                datasets: [{
                    label: 'Cantidad de Gastos',
                    data: Object.values(categorias).map(cat => cat.cantidad),
                    backgroundColor: 'rgba(54, 162, 235, 0.8)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    yAxisID: 'y'
                }, {
                    label: 'Total (miles COP)',
                    data: Object.values(categorias).map(cat => Math.round(cat.total / 1000)),
                    backgroundColor: 'rgba(255, 99, 132, 0.8)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1,
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Categorías'
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Cantidad'
                        },
                        grid: {
                            drawOnChartArea: true,
                        },
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Total (miles COP)'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                    }
                },
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error al crear gráfico de categorías:', error);
    }
}

// Gráfico de pagos por mes
function actualizarGraficoPagosMensuales() {
    const gastos = obtenerGastos();
    console.log('Gastos para gráfico de pagos mensuales:', gastos);
    
    // Obtener todos los pagos de todos los gastos
    const todosLosPagos = [];
    gastos.forEach(gasto => {
        if (gasto.pagos && gasto.pagos.length > 0) {
            gasto.pagos.forEach(pago => {
                todosLosPagos.push({
                    fecha: pago.fecha,
                    valor: pago.valor
                });
            });
        }
    });
    
    console.log('Todos los pagos recolectados:', todosLosPagos);
    
    // Agrupar pagos por mes
    const pagosPorMes = {};
    todosLosPagos.forEach(pago => {
        const fecha = new Date(pago.fecha);
        const mesAnio = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
        
        if (!pagosPorMes[mesAnio]) {
            pagosPorMes[mesAnio] = {
                total: 0,
                cantidad: 0
            };
        }
        pagosPorMes[mesAnio].total += pago.valor;
        pagosPorMes[mesAnio].cantidad++;
    });
    
    // Ordenar por fecha
    const mesesOrdenados = Object.keys(pagosPorMes).sort();
    
    const ctx = document.getElementById('chartPagosMensuales');
    if (!ctx) {
        console.error('Canvas chartPagosMensuales no encontrado');
        return;
    }
    
    // Destruir gráfico existente si existe
    if (chartPagosMensuales) {
        chartPagosMensuales.destroy();
        chartPagosMensuales = null;
    }
    
    // Verificar que hay datos para mostrar
    if (mesesOrdenados.length === 0) {
        console.log('No hay datos para mostrar en el gráfico de pagos mensuales');
        return;
    }
    
    try {
        chartPagosMensuales = new Chart(ctx, {
            type: 'line',
            data: {
                labels: mesesOrdenados.map(mes => {
                    const [anio, mesNum] = mes.split('-');
                    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                                 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                    return `${meses[parseInt(mesNum) - 1]} ${anio}`;
                }),
                datasets: [{
                    label: 'Total Pagado (miles COP)',
                    data: mesesOrdenados.map(mes => Math.round(pagosPorMes[mes].total / 1000)),
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.1,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Mes'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Total (miles COP)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top'
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error al crear gráfico de pagos mensuales:', error);
    }
}

// Actualizar resumen financiero
function actualizarResumenFinanciero() {
    const gastos = obtenerGastos();
    
    let totalDeudas = 0;
    let totalPagado = 0;
    
    gastos.forEach(gasto => {
        totalDeudas += parseFloat(gasto.deuda);
        
        // Sumar todos los pagos realizados
        if (gasto.pagos && gasto.pagos.length > 0) {
            gasto.pagos.forEach(pago => {
                totalPagado += pago.valor;
            });
        }
    });
    
    const pendientePagar = totalDeudas - totalPagado;
    
    // Formatear números como moneda colombiana
    document.getElementById('totalDeudas').textContent = 
        totalDeudas.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
    document.getElementById('totalPagado').textContent = 
        totalPagado.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
    document.getElementById('pendientePagar').textContent = 
        pendientePagar.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
}

// Función auxiliar para obtener categoría de un gasto
function obtenerCategoriaGasto(nombre) {
    const nombreLower = nombre.toLowerCase();
    
    if (nombreLower.includes('internet') || nombreLower.includes('wifi')) {
        return 'Internet';
    } else if (nombreLower.includes('agua') || nombreLower.includes('aaa')) {
        return 'Servicios Públicos';
    } else if (nombreLower.includes('luz') || nombreLower.includes('electricidad') || nombreLower.includes('energía')) {
        return 'Servicios Públicos';
    } else if (nombreLower.includes('gas')) {
        return 'Servicios Públicos';
    } else if (nombreLower.includes('davivienda') || nombreLower.includes('bancolombia') || nombreLower.includes('banco')) {
        return 'Bancos';
    } else if (nombreLower.includes('icetex') || nombreLower.includes('universidad') || nombreLower.includes('colegio')) {
        return 'Educación';
    } else if (nombreLower.includes('administración') || nombreLower.includes('condominio')) {
        return 'Vivienda';
    } else if (nombreLower.includes('netflix') || nombreLower.includes('spotify') || nombreLower.includes('streaming')) {
        return 'Entretenimiento';
    } else {
        return 'Otros';
    }
}

// ===== FUNCIONES DEL MENÚ LATERAL Y NAVEGACIÓN =====

// Toggle del sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const mainContent = document.getElementById('mainContent');
    const sidebarToggleDesktop = document.querySelector('.sidebar-toggle-desktop');
    
    // Verificar si estamos en pantalla grande (desktop)
    if (window.innerWidth >= 1024) {
        // En desktop: alternar entre abierto y cerrado
        sidebar.classList.toggle('closed');
        mainContent.classList.toggle('sidebar-closed');
        
        // Cambiar ícono del botón según el estado
        if (sidebarToggleDesktop) {
            const icon = sidebarToggleDesktop.querySelector('i');
            if (sidebar.classList.contains('closed')) {
                icon.textContent = 'menu';
            } else {
                icon.textContent = 'close';
            }
        }
        
        // Guardar estado en localStorage
        const isClosed = sidebar.classList.contains('closed');
        localStorage.setItem('sidebarClosed', isClosed);
    } else {
        // En móvil: usar el comportamiento original
        sidebar.classList.toggle('open');
        overlay.classList.toggle('show');
    }
}

// Mostrar sección específica
function mostrarSeccion(seccionId) {
    // Ocultar todas las secciones
    const secciones = document.querySelectorAll('.content-section');
    secciones.forEach(seccion => {
        seccion.classList.remove('active');
    });
    
    // Mostrar la sección seleccionada
    const seccionActiva = document.getElementById(seccionId);
    if (seccionActiva) {
        seccionActiva.classList.add('active');
    }
    
    // Actualizar menú activo
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.classList.remove('active');
    });
    
    const menuItemActivo = document.querySelector(`[data-section="${seccionId}"]`);
    if (menuItemActivo) {
        menuItemActivo.classList.add('active');
    }
    
    // Actualizar título de la página
    const pageTitle = document.getElementById('pageTitle');
    const titulos = {
        'dashboard': 'Dashboard',
        'gastos': 'Gastos',
        'estadisticas': 'Estadísticas',
        'configuracion': 'Configuración',
        'ayuda': 'Ayuda',
        'acerca': 'Acerca de'
    };
    
    if (pageTitle && titulos[seccionId]) {
        pageTitle.textContent = titulos[seccionId];
    }
    
    // Cerrar sidebar en móviles
    if (window.innerWidth < 1024) {
        toggleSidebar();
    }
    
    // Ejecutar funciones específicas según la sección
    switch(seccionId) {
        case 'dashboard':
            actualizarDashboard();
            break;
        case 'gastos':
            mostrarGastosSeccion();
            break;
        case 'estadisticas':
            actualizarEstadisticasSeccion();
            break;
    }
}

// Actualizar dashboard
function actualizarDashboard() {
    const gastos = obtenerGastos();
    
    // Actualizar estadísticas rápidas usando la misma lógica que actualizarEstadisticasGenerales
    document.getElementById('totalGastosDashboard').textContent = gastos.length;
    
    // Contar gastos por estado usando calcularEstadoGasto (misma lógica que estadísticas)
    let gastosPendientes = 0;
    let gastosPagados = 0;
    let gastosUrgentes = 0;
    
    gastos.forEach(gasto => {
        const estadoInfo = calcularEstadoGasto(gasto);
        switch (estadoInfo.estado) {
            case 'pagado':
                gastosPagados++;
                break;
            case 'urgente':
                gastosUrgentes++;
                break;
            case 'puede esperar':
                gastosPendientes++;
                break;
        }
    });
    
    document.getElementById('gastosPendientesDashboard').textContent = gastosPendientes;
    document.getElementById('gastosPagadosDashboard').textContent = gastosPagados;
    document.getElementById('gastosUrgentesDashboard').textContent = gastosUrgentes;
    
    // Actualizar gastos recientes
    actualizarGastosRecientes();
    
    // Actualizar gráficos del dashboard
    setTimeout(() => {
        actualizarGraficoEstadosDashboard();
        actualizarGraficoCategoriasDashboard();
        actualizarGraficoPagosMensualesDashboard();
    }, 100);
}

// Actualizar últimos pagos realizados en el dashboard
function actualizarGastosRecientes() {
    const gastos = obtenerGastos();
    const recentList = document.getElementById('recentGastosList');
    
    if (!recentList) return;
    
    // Recolectar todos los pagos de todos los gastos
    const todosLosPagos = [];
    gastos.forEach(gasto => {
        if (gasto.pagos && gasto.pagos.length > 0) {
            gasto.pagos.forEach(pago => {
                todosLosPagos.push({
                    ...pago,
                    gastoNombre: gasto.nombre,
                    gastoNic: gasto.nic
                });
            });
        }
    });
    
    // Ordenar pagos por fecha (más recientes primero) y tomar los últimos 5
    const pagosRecientes = todosLosPagos
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        .slice(0, 5);
    
    if (pagosRecientes.length === 0) {
        recentList.innerHTML = '<p style="color: var(--md-on-surface-variant); text-align: center;">No hay pagos registrados</p>';
        return;
    }
    
    recentList.innerHTML = pagosRecientes.map(pago => `
        <div class="recent-item" style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px;
            background: var(--md-surface-variant);
            border-radius: 8px;
            border-left: 4px solid #4caf50;
        ">
            <div>
                <div style="font-weight: 500; color: var(--md-on-surface);">${pago.gastoNombre}</div>
                <div style="font-size: 14px; color: var(--md-on-surface-variant);">${pago.gastoNic} - ${pago.fecha}</div>
            </div>
            <div style="text-align: right;">
                <div style="font-weight: 500; color: var(--md-on-surface);">
                    ${parseFloat(pago.valor).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
                </div>
                <div style="font-size: 12px; color: var(--md-on-surface-variant);">
                    Pago realizado
                </div>
            </div>
        </div>
    `).join('');
}

// Función auxiliar para obtener color del estado
function getEstadoColor(estado) {
    switch(estado) {
        case 'urgente': return '#f44336';
        case 'pagado': return '#4caf50';
        case 'puede esperar': return '#ff9800';
        default: return '#9e9e9e';
    }
}

// Mostrar gastos (sección principal)
function mostrarGastosSeccion() {
    mostrarGastos();
    filtrarGastos();
}

// Actualizar estadísticas
function actualizarEstadisticasSeccion() {
    actualizarEstadisticas();
    // Los gráficos se actualizan dentro de actualizarEstadisticas()
    actualizarResumenFinanciero();
}

// ===== FUNCIONES DE CONFIGURACIÓN =====

// Cambiar tema
function cambiarTema() {
    const themeSelect = document.getElementById('themeSelect');
    const tema = themeSelect.value;
    
    // Guardar preferencia
    localStorage.setItem('tema', tema);
    
    // Aplicar tema
    document.body.className = tema;
    
    mostrarSnackbar('Tema cambiado exitosamente');
}

// Cambiar color principal
function cambiarColorPrincipal() {
    const colorInput = document.getElementById('primaryColor');
    const color = colorInput.value;
    
    // Guardar preferencia
    localStorage.setItem('colorPrincipal', color);
    
    // Aplicar color
    document.documentElement.style.setProperty('--md-primary', color);
    
    mostrarSnackbar('Color principal cambiado');
}

// Limpiar todos los datos
function limpiarDatos() {
    if (confirm('¿Estás seguro de que quieres eliminar todos los datos? Esta acción no se puede deshacer.')) {
        localStorage.removeItem('gastos');
        localStorage.removeItem('pagos');
        
        // Limpiar tablas y estadísticas
        document.getElementById('tabla_gastos').innerHTML = '';
        actualizarEstadisticas();
        actualizarDashboard();
        
        mostrarSnackbar('Todos los datos han sido eliminados');
    }
}

// ===== FUNCIONES DE INICIALIZACIÓN =====

// Inicializar configuración
function inicializarConfiguracion() {
    // Cargar tema guardado
    const temaGuardado = localStorage.getItem('tema') || 'light';
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) {
        themeSelect.value = temaGuardado;
        document.body.className = temaGuardado;
    }
    
    // Cargar color principal guardado
    const colorGuardado = localStorage.getItem('colorPrincipal') || '#1976d2';
    const colorInput = document.getElementById('primaryColor');
    if (colorInput) {
        colorInput.value = colorGuardado;
        document.documentElement.style.setProperty('--md-primary', colorGuardado);
    }
    
    // Cargar preferencias de notificaciones
    const notifUrgentes = localStorage.getItem('notifUrgentes') !== 'false';
    const notifVencidos = localStorage.getItem('notifVencidos') !== 'false';
    
    const notifUrgentesCheckbox = document.getElementById('notifUrgentes');
    const notifVencidosCheckbox = document.getElementById('notifVencidos');
    
    if (notifUrgentesCheckbox) notifUrgentesCheckbox.checked = notifUrgentes;
    if (notifVencidosCheckbox) notifVencidosCheckbox.checked = notifVencidos;
}

// Guardar preferencias de notificaciones
function guardarPreferenciasNotificaciones() {
    const notifUrgentes = document.getElementById('notifUrgentes').checked;
    const notifVencidos = document.getElementById('notifVencidos').checked;
    
    localStorage.setItem('notifUrgentes', notifUrgentes);
    localStorage.setItem('notifVencidos', notifVencidos);
    
    mostrarSnackbar('Preferencias guardadas');
}

// ===== EVENT LISTENERS =====

// Agregar event listeners cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar configuración
    inicializarConfiguracion();
    
    // Restaurar estado del sidebar
    restaurarEstadoSidebar();
    
    // Event listeners para checkboxes de configuración
    const notifUrgentesCheckbox = document.getElementById('notifUrgentes');
    const notifVencidosCheckbox = document.getElementById('notifVencidos');
    
    if (notifUrgentesCheckbox) {
        notifUrgentesCheckbox.addEventListener('change', guardarPreferenciasNotificaciones);
    }
    
    if (notifVencidosCheckbox) {
        notifVencidosCheckbox.addEventListener('change', guardarPreferenciasNotificaciones);
    }
    
    // Cerrar sidebar al hacer clic en overlay
    const overlay = document.getElementById('sidebarOverlay');
    if (overlay) {
        overlay.addEventListener('click', toggleSidebar);
    }
    
    // Navegación con teclado
    document.addEventListener('keydown', function(e) {
        // ESC para cerrar sidebar
        if (e.key === 'Escape') {
            const sidebar = document.getElementById('sidebar');
            if (sidebar && sidebar.classList.contains('open')) {
                toggleSidebar();
            }
        }
    });
    
    // Mostrar dashboard por defecto
    mostrarSeccion('dashboard');
    
    // Cargar datos iniciales
    cargarDatosIniciales();
    mostrarGastos();
    actualizarDashboard();
});

// ===== FUNCIONES DE UTILIDAD =====

// Cargar datos iniciales si no existen
function cargarDatosIniciales() {
    const gastos = obtenerGastos();
    console.log('Gastos actuales:', gastos);
    
    // Si no hay gastos, cargar datos de ejemplo
    if (gastos.length === 0) {
        const datosEjemplo = [
            {
                id: 1,
                nic: "NIC-001",
                nombre: "Internet Hogar",
                deuda: 89900,
                dia_pago: 15,
                enlace_pago: "https://www.claro.com.co/pagos",
                estado: "puede esperar",
                fechaCreacion: new Date().toISOString(),
                pagos: [
                    {
                        id: 101,
                        fecha: "2024-01-15",
                        valor: 89900,
                        diferencia: 0,
                        comprobante: "COMP-001",
                        notas: "Pago mensual"
                    }
                ]
            },
            {
                id: 2,
                nic: "NIC-002", 
                nombre: "Servicio de Luz",
                deuda: 156200,
                dia_pago: 10,
                enlace_pago: "https://www.epm.com.co/pagos",
                estado: "urgente",
                fechaCreacion: new Date().toISOString(),
                pagos: [
                    {
                        id: 102,
                        fecha: "2024-01-10",
                        valor: 156200,
                        diferencia: 0,
                        comprobante: "COMP-002",
                        notas: "Pago mensual"
                    },
                    {
                        id: 103,
                        fecha: "2024-02-10",
                        valor: 145000,
                        diferencia: -11200,
                        comprobante: "COMP-003",
                        notas: "Pago con descuento"
                    }
                ]
            },
            {
                id: 3,
                nic: "NIC-003",
                nombre: "Agua y Alcantarillado",
                deuda: 45600,
                dia_pago: 20,
                enlace_pago: "https://www.aaa.com.co/pagos",
                estado: "puede esperar",
                fechaCreacion: new Date().toISOString(),
                pagos: [
                    {
                        id: 104,
                        fecha: "2024-01-20",
                        valor: 45600,
                        diferencia: 0,
                        comprobante: "COMP-004",
                        notas: "Pago mensual"
                    }
                ]
            },
            {
                id: 4,
                nic: "NIC-004",
                nombre: "Netflix Premium",
                deuda: 45000,
                dia_pago: 5,
                enlace_pago: "https://www.netflix.com/account",
                estado: "puede esperar",
                fechaCreacion: new Date().toISOString(),
                pagos: [
                    {
                        id: 105,
                        fecha: "2024-01-05",
                        valor: 45000,
                        diferencia: 0,
                        comprobante: "COMP-005",
                        notas: "Suscripción mensual"
                    }
                ]
            },
            {
                id: 5,
                nic: "NIC-005",
                nombre: "Davivienda Tarjeta",
                deuda: 250000,
                dia_pago: 25,
                enlace_pago: "https://www.davivienda.com",
                estado: "urgente",
                fechaCreacion: new Date().toISOString(),
                pagos: [
                    {
                        id: 106,
                        fecha: "2024-01-25",
                        valor: 250000,
                        diferencia: 0,
                        comprobante: "COMP-006",
                        notas: "Pago tarjeta de crédito"
                    }
                ]
            }
        ];
        
        localStorage.setItem('gastos', JSON.stringify(datosEjemplo));
        console.log('Datos de ejemplo cargados:', datosEjemplo);
    }
}

// Función para mostrar notificaciones mejorada
function mostrarSnackbar(mensaje, tipo = 'info') {
    const snackbar = document.getElementById('snackbar');
    const snackbarText = document.getElementById('snackbar-text');
    
    if (snackbar && snackbarText) {
        snackbarText.textContent = mensaje;
        
        // Aplicar clase según el tipo
        snackbar.className = `md-snackbar ${tipo}`;
        
        snackbar.classList.add('show');
        
        setTimeout(() => {
            snackbar.classList.remove('show');
        }, 3000);
    }
}

// Función para formatear fechas
function formatearFecha(fecha) {
    if (!fecha) return 'N/A';
    
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Función para formatear moneda
function formatearMoneda(valor) {
    return parseFloat(valor).toLocaleString('es-CO', {
        style: 'currency',
        currency: 'COP'
    });
}

// Función para restaurar el estado del sidebar
function restaurarEstadoSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const sidebarToggleDesktop = document.querySelector('.sidebar-toggle-desktop');
    
    if (window.innerWidth >= 1024) {
        // En desktop: restaurar estado guardado
        const sidebarClosed = localStorage.getItem('sidebarClosed') === 'true';
        if (sidebarClosed) {
            sidebar.classList.add('closed');
            mainContent.classList.add('sidebar-closed');
        }
        
        // Actualizar ícono del botón según el estado
        if (sidebarToggleDesktop) {
            const icon = sidebarToggleDesktop.querySelector('i');
            if (sidebar.classList.contains('closed')) {
                icon.textContent = 'menu';
            } else {
                icon.textContent = 'close';
            }
        }
    }
}

// Listener para cambio de tamaño de ventana
window.addEventListener('resize', function() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const overlay = document.getElementById('sidebarOverlay');
    const sidebarToggleDesktop = document.querySelector('.sidebar-toggle-desktop');
    
    if (window.innerWidth >= 1024) {
        // Cambiar a desktop: limpiar clases de móvil
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
        
        // Restaurar estado del sidebar
        restaurarEstadoSidebar();
    } else {
        // Cambiar a móvil: limpiar clases de desktop
        sidebar.classList.remove('closed');
        mainContent.classList.remove('sidebar-closed');
        
        // Resetear ícono del botón en móvil
        if (sidebarToggleDesktop) {
            const icon = sidebarToggleDesktop.querySelector('i');
            icon.textContent = 'menu';
        }
    }
});

// ===== FUNCIONES ESPECÍFICAS PARA GRÁFICOS DEL DASHBOARD =====

// Gráfico de distribución por estado para el dashboard
function actualizarGraficoEstadosDashboard() {
    const gastos = obtenerGastos();
    console.log('Gastos para gráfico de estados del dashboard:', gastos);
    
    // Contar gastos por estado
    const estados = {};
    gastos.forEach(gasto => {
        const estadoInfo = calcularEstadoGasto(gasto);
        const estado = estadoInfo.estado;
        estados[estado] = (estados[estado] || 0) + 1;
        console.log(`Gasto: ${gasto.nombre}, Estado calculado: ${estado}`);
    });
    
    console.log('Estados contados para dashboard:', estados);
    
    const ctx = document.getElementById('chartEstadosDashboard');
    if (!ctx) {
        console.error('Canvas chartEstadosDashboard no encontrado');
        return;
    }
    
    // Destruir gráfico existente si existe
    if (chartEstadosDashboard) {
        chartEstadosDashboard.destroy();
        chartEstadosDashboard = null;
    }
    
    // Verificar que hay datos para mostrar
    if (Object.keys(estados).length === 0) {
        console.log('No hay datos para mostrar en el gráfico de estados del dashboard');
        return;
    }
    
    try {
        chartEstadosDashboard = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(estados).map(estado => {
                    const labels = {
                        'puede esperar': 'Pendientes',
                        'urgente': 'Urgentes',
                        'pagado': 'Pagados'
                    };
                    return labels[estado] || estado;
                }),
                datasets: [{
                    data: Object.values(estados),
                    backgroundColor: [
                        '#FF6384', // Rojo para urgentes
                        '#36A2EB', // Azul para pendientes
                        '#4BC0C0', // Verde para pagados
                        '#FFCE56'  // Amarillo para otros
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: ${context.parsed} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
        console.log('Gráfico de estados del dashboard creado exitosamente');
    } catch (error) {
        console.error('Error al crear gráfico de estados del dashboard:', error);
    }
}

// Gráfico de gastos por categoría para el dashboard
function actualizarGraficoCategoriasDashboard() {
    const gastos = obtenerGastos();
    console.log('Gastos para gráfico de categorías del dashboard:', gastos);
    
    // Agrupar por categoría (usando el nombre del gasto como categoría)
    const categorias = {};
    gastos.forEach(gasto => {
        const categoria = obtenerCategoriaGasto(gasto.nombre);
        if (!categorias[categoria]) {
            categorias[categoria] = {
                cantidad: 0,
                total: 0
            };
        }
        categorias[categoria].cantidad++;
        categorias[categoria].total += parseFloat(gasto.deuda);
        console.log(`Gasto: ${gasto.nombre}, Categoría: ${categoria}, Deuda: ${gasto.deuda}`);
    });
    
    console.log('Categorías agrupadas para dashboard:', categorias);
    
    const ctx = document.getElementById('chartCategoriasDashboard');
    if (!ctx) {
        console.error('Canvas chartCategoriasDashboard no encontrado');
        return;
    }
    
    // Destruir gráfico existente si existe
    if (chartCategoriasDashboard) {
        chartCategoriasDashboard.destroy();
        chartCategoriasDashboard = null;
    }
    
    // Verificar que hay datos para mostrar
    if (Object.keys(categorias).length === 0) {
        console.log('No hay datos para mostrar en el gráfico de categorías del dashboard');
        return;
    }
    
    try {
        chartCategoriasDashboard = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(categorias),
                datasets: [{
                    label: 'Cantidad de Gastos',
                    data: Object.values(categorias).map(cat => cat.cantidad),
                    backgroundColor: 'rgba(54, 162, 235, 0.8)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    yAxisID: 'y'
                }, {
                    label: 'Total (miles COP)',
                    data: Object.values(categorias).map(cat => Math.round(cat.total / 1000)),
                    backgroundColor: 'rgba(255, 99, 132, 0.8)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1,
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Categorías'
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Cantidad'
                        },
                        grid: {
                            drawOnChartArea: true,
                        },
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Total (miles COP)'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                    }
                },
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                }
            }
        });
        console.log('Gráfico de categorías del dashboard creado exitosamente');
    } catch (error) {
        console.error('Error al crear gráfico de categorías del dashboard:', error);
    }
}

// Gráfico de pagos por mes para el dashboard
function actualizarGraficoPagosMensualesDashboard() {
    const gastos = obtenerGastos();
    console.log('Gastos para gráfico de pagos mensuales del dashboard:', gastos);
    
    // Obtener todos los pagos de todos los gastos
    const todosLosPagos = [];
    gastos.forEach(gasto => {
        if (gasto.pagos && gasto.pagos.length > 0) {
            gasto.pagos.forEach(pago => {
                todosLosPagos.push({
                    fecha: pago.fecha,
                    valor: pago.valor
                });
            });
        }
    });
    
    console.log('Todos los pagos recolectados para dashboard:', todosLosPagos);
    
    // Agrupar pagos por mes
    const pagosPorMes = {};
    todosLosPagos.forEach(pago => {
        const fecha = new Date(pago.fecha);
        const mesAnio = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
        
        if (!pagosPorMes[mesAnio]) {
            pagosPorMes[mesAnio] = {
                total: 0,
                cantidad: 0
            };
        }
        pagosPorMes[mesAnio].total += pago.valor;
        pagosPorMes[mesAnio].cantidad++;
    });
    
    // Ordenar por fecha
    const mesesOrdenados = Object.keys(pagosPorMes).sort();
    
    const ctx = document.getElementById('chartPagosMensualesDashboard');
    if (!ctx) {
        console.error('Canvas chartPagosMensualesDashboard no encontrado');
        return;
    }
    
    // Destruir gráfico existente si existe
    if (chartPagosMensualesDashboard) {
        chartPagosMensualesDashboard.destroy();
        chartPagosMensualesDashboard = null;
    }
    
    // Verificar que hay datos para mostrar
    if (mesesOrdenados.length === 0) {
        console.log('No hay datos para mostrar en el gráfico de pagos mensuales del dashboard');
        return;
    }
    
    try {
        chartPagosMensualesDashboard = new Chart(ctx, {
            type: 'line',
            data: {
                labels: mesesOrdenados.map(mes => {
                    const [anio, mesNum] = mes.split('-');
                    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                                 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                    return `${meses[parseInt(mesNum) - 1]} ${anio}`;
                }),
                datasets: [{
                    label: 'Total Pagado (miles COP)',
                    data: mesesOrdenados.map(mes => Math.round(pagosPorMes[mes].total / 1000)),
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.1,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Mes'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Total (miles COP)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top'
                    }
                }
            }
        });
        console.log('Gráfico de pagos mensuales del dashboard creado exitosamente');
    } catch (error) {
        console.error('Error al crear gráfico de pagos mensuales del dashboard:', error);
    }
}
