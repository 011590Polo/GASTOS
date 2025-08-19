// Módulo de Pagos - Gestión de pagos
import { Storage } from './storage.js';
import { Utils } from './utils.js';
import { UI } from './ui.js';

export const Pagos = {
    // Registrar pago
    registrarPago() {
        const gastos = Storage.obtenerGastos();
        const gasto = gastos.find(g => g.id === UI.gastoEnPago);
        
        if (!gasto) {
            UI.mostrarSnackbar("Gasto no encontrado", 3000);
            return;
        }

        const valorPago = parseFloat(document.getElementById("valorPago").value) || 0;
        const notaPago = document.getElementById("notaPago").value.trim() || "";

        if (valorPago <= 0) {
            UI.mostrarSnackbar("El valor del pago debe ser mayor a 0", 4000);
            return;
        }

        // Crear nuevo pago
        const nuevoPago = {
            id: Utils.generarId(),
            fecha: new Date().toISOString(),
            valor: valorPago,
            nota: notaPago
        };

        // Agregar pago al gasto
        if (!gasto.pagos) {
            gasto.pagos = [];
        }
        gasto.pagos.push(nuevoPago);

        // Actualizar deuda
        gasto.deuda = Math.max(0, gasto.deuda - valorPago);

        // Guardar cambios
        Storage.guardarGastos(gastos);

        // Cerrar modal y actualizar vista
        UI.cerrarModalPago();
        
        // Limpiar formulario
        document.getElementById("valorPago").value = "";
        document.getElementById("notaPago").value = "";

        // Mostrar notificación
        UI.mostrarSnackbar(`Pago de ${Utils.formatearMoneda(valorPago)} registrado exitosamente`);

        // Actualizar vista de gastos
        import('./gastos.js').then(module => {
            module.Gastos.mostrarGastos();
        });
    },

    // Calcular diferencia de pago
    calcularDiferenciaPago() {
        const gastos = Storage.obtenerGastos();
        const gasto = gastos.find(g => g.id === UI.gastoEnPago);
        
        if (!gasto) return;

        const valorOriginal = gasto.deuda;
        const valorPago = parseFloat(document.getElementById("valorPago").value) || 0;
        const diferencia = valorOriginal - valorPago;

        const diferenciaElement = document.getElementById("diferenciaPago");
        if (diferenciaElement) {
            if (diferencia >= 0) {
                diferenciaElement.textContent = `Deuda restante: ${Utils.formatearMoneda(diferencia)}`;
                diferenciaElement.className = "diferencia-positiva";
            } else {
                diferenciaElement.textContent = `Excedente: ${Utils.formatearMoneda(Math.abs(diferencia))}`;
                diferenciaElement.className = "diferencia-negativa";
            }
        }
    },

    // Obtener total de pagos de un gasto
    obtenerTotalPagos(gasto) {
        if (!gasto.pagos || gasto.pagos.length === 0) {
            return 0;
        }
        return gasto.pagos.reduce((total, pago) => total + pago.valor, 0);
    },

    // Obtener pagos del mes actual
    obtenerPagosMesActual() {
        const gastos = Storage.obtenerGastos();
        const mesActual = new Date().getMonth();
        const añoActual = new Date().getFullYear();
        
        const pagosMes = [];
        
        gastos.forEach(gasto => {
            if (gasto.pagos) {
                gasto.pagos.forEach(pago => {
                    const fechaPago = new Date(pago.fecha);
                    if (fechaPago.getMonth() === mesActual && fechaPago.getFullYear() === añoActual) {
                        pagosMes.push({
                            ...pago,
                            gastoNombre: gasto.nombre,
                            gastoId: gasto.id
                        });
                    }
                });
            }
        });
        
        return pagosMes;
    },

    // Obtener estadísticas de pagos
    obtenerEstadisticasPagos() {
        const gastos = Storage.obtenerGastos();
        const pagosMes = this.obtenerPagosMesActual();
        
        const totalPagos = pagosMes.reduce((total, pago) => total + pago.valor, 0);
        const totalDeuda = gastos.reduce((total, gasto) => total + gasto.deuda, 0);
        const totalPagado = gastos.reduce((total, gasto) => total + this.obtenerTotalPagos(gasto), 0);
        
        return {
            totalPagos,
            totalDeuda,
            totalPagado,
            cantidadPagos: pagosMes.length,
            cantidadGastos: gastos.length
        };
    },

    // Obtener pagos por categoría
    obtenerPagosPorCategoria() {
        const gastos = Storage.obtenerGastos();
        const categorias = {};
        
        gastos.forEach(gasto => {
            const categoria = Utils.obtenerCategoriaGasto(gasto.nombre);
            const totalPagos = this.obtenerTotalPagos(gasto);
            
            if (!categorias[categoria]) {
                categorias[categoria] = 0;
            }
            categorias[categoria] += totalPagos;
        });
        
        return categorias;
    },

    // Obtener pagos por mes (últimos 12 meses)
    obtenerPagosPorMes() {
        const gastos = Storage.obtenerGastos();
        const pagosPorMes = {};
        
        // Inicializar últimos 12 meses
        for (let i = 11; i >= 0; i--) {
            const fecha = new Date();
            fecha.setMonth(fecha.getMonth() - i);
            const clave = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
            pagosPorMes[clave] = 0;
        }
        
        // Contar pagos por mes
        gastos.forEach(gasto => {
            if (gasto.pagos) {
                gasto.pagos.forEach(pago => {
                    const fechaPago = new Date(pago.fecha);
                    const clave = `${fechaPago.getFullYear()}-${String(fechaPago.getMonth() + 1).padStart(2, '0')}`;
                    
                    if (pagosPorMes.hasOwnProperty(clave)) {
                        pagosPorMes[clave] += pago.valor;
                    }
                });
            }
        });
        
        return pagosPorMes;
    },

    // Validar pago
    validarPago(valor, gasto) {
        if (valor <= 0) {
            return { valido: false, mensaje: "El valor del pago debe ser mayor a 0" };
        }
        
        if (valor > gasto.deuda * 1.5) {
            return { valido: false, mensaje: "El valor del pago es significativamente mayor a la deuda" };
        }
        
        return { valido: true, mensaje: "" };
    },

    // Procesar pago automático
    procesarPagoAutomatico(gasto, valor) {
        const validacion = this.validarPago(valor, gasto);
        if (!validacion.valido) {
            return { exito: false, mensaje: validacion.mensaje };
        }

        const nuevoPago = {
            id: Utils.generarId(),
            fecha: new Date().toISOString(),
            valor: valor,
            nota: "Pago automático"
        };

        if (!gasto.pagos) {
            gasto.pagos = [];
        }
        gasto.pagos.push(nuevoPago);
        gasto.deuda = Math.max(0, gasto.deuda - valor);

        return { exito: true, mensaje: "Pago procesado exitosamente" };
    }
};

