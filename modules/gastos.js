// Módulo de Gastos - Gestión CRUD de gastos
import { Storage } from './storage.js';
import { Utils } from './utils.js';
import { UI } from './ui.js';

export const Gastos = {
    // Crear nuevo gasto
    crearGasto() {
        const nic = document.getElementById("nic").value.trim();
        const nombre = document.getElementById("nombre").value.trim();
        const deuda = parseFloat(document.getElementById("deuda").value) || 0;
        const dia_pago = document.getElementById("dia_pago").value ? parseInt(document.getElementById("dia_pago").value) : null;
        const enlace_pago = document.getElementById("enlace_pago").value.trim() || null;

        if (!nic) {
            UI.mostrarSnackbar("El NIC es obligatorio", 4000);
            return;
        }

        if (!nombre) {
            UI.mostrarSnackbar("El nombre es obligatorio", 4000);
            return;
        }

        // Validar día de pago
        if (dia_pago && !Utils.validarDiaPago(dia_pago)) {
            UI.mostrarSnackbar("El día de pago debe estar entre 1 y 31", 4000);
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
        
        const gastos = Storage.obtenerGastos();

        if (UI.gastoEnEdicion) {
            // Modo edición
            const indice = gastos.findIndex(g => g.id === UI.gastoEnEdicion);
            if (indice !== -1) {
                // Mantener id y pagos existentes
                gastos[indice] = {
                    ...gastos[indice],
                    ...datosGasto
                };
            }
            // Resetear modo edición
            UI.gastoEnEdicion = null;
            document.getElementById("btnGuardar").innerHTML = '<i class="material-icons">save</i> Guardar';
        } else {
            // Modo creación
            const nuevoGasto = {
                id: Utils.generarId(),
                ...datosGasto
            };
            gastos.push(nuevoGasto);
        }

        Storage.guardarGastos(gastos);
        this.mostrarGastos();
        
        
        // Cerrar la modal después de guardar
        UI.cerrarModalAgregarGasto();
        actualizarDashboard();
        
        // Mostrar notificación de éxito
        const mensaje = UI.gastoEnEdicion ? "Gasto actualizado exitosamente" : "Gasto creado exitosamente";
        UI.mostrarSnackbar(mensaje);
    },

    // Editar gasto
    editarGasto(id) {
        const gastos = Storage.obtenerGastos();
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
            UI.gastoEnEdicion = id;
            
            // Abrir la modal
            UI.abrirModalAgregarGasto();
        }
    },

    // Eliminar gasto
    eliminarGasto(id) {
        UI.mostrarModalConfirmacion(
            "¿Estás seguro de que quieres eliminar este gasto? Esta acción no se puede deshacer.",
            () => {
                const gastos = Storage.obtenerGastos();
                const gastosFiltrados = gastos.filter(g => g.id !== id);
                Storage.guardarGastos(gastosFiltrados);
                this.mostrarGastos();
                UI.mostrarSnackbar("Gasto eliminado exitosamente");
            }
        );
    },

    // Mostrar gastos en la tabla
    mostrarGastos(gastosFiltrados = null) {
        let gastos = gastosFiltrados || Storage.obtenerGastos();
        console.log('Mostrando gastos:', gastos);
        
        // Ordenar gastos por día de pago
        gastos = this.ordenarGastosPorDia(gastos);
        
        const tbody = document.getElementById("tabla_gastos");
        if (!tbody) return;
        
        tbody.innerHTML = "";

        gastos.forEach(g => {
            const estadoInfo = this.calcularEstadoGasto(g);
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td data-label="NIC">${g.nic}</td>
                <td data-label="Nombre">${g.nombre}</td>
                <td data-label="Deuda">${Utils.formatearMoneda(g.deuda)}</td>
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
                        <button onclick="Gastos.abrirModalPago(${g.id})" class="btn-pagar" title="Registrar Pago">
                            <i class="fas fa-dollar-sign"></i>
                        </button>
                        <button onclick="Gastos.verHistorialPagos(${g.id})" class="btn-historial" title="Ver Historial de Pagos">
                            <i class="fas fa-history"></i>
                        </button>
                        <button onclick="Gastos.editarGasto(${g.id})" class="btn-editar" title="Editar Gasto">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="Gastos.eliminarGasto(${g.id})" class="btn-eliminar" title="Eliminar Gasto">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(fila);
        });
        
                       // Actualizar contador de resultados
               UI.actualizarContadorResultados(gastos.length, Storage.obtenerGastos().length);

               // Actualizar estadísticas si están visibles
               const statsContent = document.getElementById('statsContent');
               if (statsContent && statsContent.style.display !== 'none') {
                   // Importar dinámicamente el módulo de estadísticas
                   import('./estadisticas.js').then(module => {
                       module.Estadisticas.actualizarEstadisticas();
                   });
               }

               // Actualizar estadísticas rápidas
               import('./app.js').then(module => {
                   module.App.actualizarEstadisticasRapidas();
               });
    },

    // Ordenar gastos por día de pago
    ordenarGastosPorDia(gastos) {
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
    },

    // Calcular estado del gasto
    calcularEstadoGasto(gasto) {
        if (!gasto.dia_pago) {
            return { estado: 'sin fecha', diasRestantes: null };
        }

        const hoy = new Date();
        const diaActual = hoy.getDate();
        const mesActual = hoy.getMonth();
        const añoActual = hoy.getFullYear();

        // Calcular el próximo día de pago
        let proximoPago = new Date(añoActual, mesActual, gasto.dia_pago);
        
        // Si ya pasó este mes, calcular para el próximo mes
        if (proximoPago < hoy) {
            proximoPago = new Date(añoActual, mesActual + 1, gasto.dia_pago);
        }

        const diasRestantes = Math.ceil((proximoPago - hoy) / (1000 * 60 * 60 * 24));

        let estado;
        if (diasRestantes < 0) {
            estado = 'vencido';
        } else if (diasRestantes <= 3) {
            estado = 'urgente';
        } else if (diasRestantes <= 7) {
            estado = 'próximo';
        } else {
            estado = 'al día';
        }

        return { estado, diasRestantes };
    },

    // Verificar urgencia por día
    verificarUrgenciaPorDia(gasto) {
        if (!gasto.dia_pago) return false;

        const hoy = new Date();
        const diaActual = hoy.getDate();
        const mesActual = hoy.getMonth();
        const añoActual = hoy.getFullYear();

        // Calcular el próximo día de pago
        let proximoPago = new Date(añoActual, mesActual, gasto.dia_pago);
        
        // Si ya pasó este mes, calcular para el próximo mes
        if (proximoPago < hoy) {
            proximoPago = new Date(añoActual, mesActual + 1, gasto.dia_pago);
        }

        const diasRestantes = Math.ceil((proximoPago - hoy) / (1000 * 60 * 60 * 24));

        return diasRestantes <= 3;
    },

    // Ver historial de pagos
    verHistorialPagos(id) {
        const gastos = Storage.obtenerGastos();
        const gasto = gastos.find(g => g.id === id);
        
        if (!gasto) {
            UI.mostrarSnackbar("Gasto no encontrado", 3000);
            return;
        }

        const modal = document.getElementById('modalHistorial');
        const tbody = document.getElementById('listaPagos');
        
        if (modal && tbody) {
            // Agregar clase para estilos específicos
            modal.classList.add('modal-historial');
            
            // Actualizar información del gasto
            const nombreGasto = document.getElementById('historialNombreGasto');
            const valorOriginal = document.getElementById('historialValorOriginal');
            const estado = document.getElementById('historialEstado');
            const totalPagado = document.getElementById('historialTotalPagado');
            
            if (nombreGasto) nombreGasto.textContent = gasto.nombre;
            if (valorOriginal) valorOriginal.textContent = Utils.formatearMoneda(gasto.valor);
            if (estado) estado.textContent = gasto.estado || 'Pendiente';
            
            tbody.innerHTML = '';
            
            if (gasto.pagos && gasto.pagos.length > 0) {
                let totalPagadoCalculado = 0;
                
                gasto.pagos.forEach(pago => {
                    const fila = document.createElement('tr');
                    const diferencia = pago.valor - gasto.valor;
                    const diferenciaClase = diferencia > 0 ? 'diferencia-mas' : diferencia < 0 ? 'diferencia-menos' : '';
                    totalPagadoCalculado += pago.valor;
                    
                    fila.innerHTML = `
                        <td>${Utils.formatearFecha(pago.fecha)}</td>
                        <td class="valor">${Utils.formatearMoneda(pago.valor)}</td>
                        <td class="diferencia ${diferenciaClase}">${Utils.formatearMoneda(diferencia)}</td>
                        <td>${pago.comprobante || 'Sin comprobante'}</td>
                        <td>${pago.notas || 'Sin notas'}</td>
                        <td class="acciones">
                            <button onclick="Gastos.eliminarPago(${gasto.id}, ${pago.id})" class="btn-eliminar-pago" title="Eliminar pago">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    `;
                    tbody.appendChild(fila);
                });
                
                if (totalPagado) {
                    totalPagado.innerHTML = `<strong>Total Pagado: ${Utils.formatearMoneda(totalPagadoCalculado)}</strong>`;
                }
            } else {
                tbody.innerHTML = '<tr><td colspan="6" class="no-pagos">No hay pagos registrados</td></tr>';
                if (totalPagado) {
                    totalPagado.innerHTML = '<strong>Total Pagado: $0</strong>';
                }
            }
            
            modal.style.display = 'flex';
            UI.mostrarSnackbar("Historial de pagos abierto");
        }
    },

    // Eliminar pago
    eliminarPago(idGasto, idPago) {
        UI.mostrarModalConfirmacion(
            "¿Estás seguro de que quieres eliminar este pago?",
            () => {
                const gastos = Storage.obtenerGastos();
                const gastoIndex = gastos.findIndex(g => g.id === idGasto);
                
                if (gastoIndex !== -1) {
                    gastos[gastoIndex].pagos = gastos[gastoIndex].pagos.filter(p => p.id !== idPago);
                    Storage.guardarGastos(gastos);
                    this.verHistorialPagos(idGasto); // Recargar historial
                    UI.mostrarSnackbar("Pago eliminado exitosamente");
                }
            }
        );
    },

    // Verificar pagos urgentes
    verificarPagosUrgentes() {
        const gastos = Storage.obtenerGastos();
        const gastosUrgentes = gastos.filter(gasto => this.verificarUrgenciaPorDia(gasto));
        
        if (gastosUrgentes.length > 0) {
            const mensaje = `Tienes ${gastosUrgentes.length} pago(s) urgente(s) que vence(n) pronto`;
            UI.mostrarSnackbar(mensaje, 5000);
            
            // Mostrar notificación del navegador si está disponible
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Pagos Urgentes', {
                    body: mensaje,
                    icon: '/icons/icon-192x192.png'
                });
            }
        }
    }
};
