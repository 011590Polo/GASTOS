// Módulo de Filtros - Búsqueda y filtrado de gastos
import { Storage } from './storage.js';
import { Gastos } from './gastos.js';

export const Filtros = {
    // Filtrar gastos
    filtrarGastos() {
        const busqueda = document.getElementById("filtroBusqueda").value.toLowerCase().trim();
        const filtroEstado = document.getElementById("filtroEstado").value;
        
        const gastos = Storage.obtenerGastos();
        const gastosFiltrados = gastos.filter(gasto => {
            const estadoInfo = Gastos.calcularEstadoGasto(gasto);
            
            // Filtro por búsqueda (NIC, nombre, enlace)
            const coincideBusqueda = !busqueda || 
                gasto.nic.toLowerCase().includes(busqueda) ||
                gasto.nombre.toLowerCase().includes(busqueda) ||
                (gasto.enlace_pago && gasto.enlace_pago.toLowerCase().includes(busqueda));
            
            // Filtro por estado
            const coincideEstado = !filtroEstado || estadoInfo.estado === filtroEstado;
            
            return coincideBusqueda && coincideEstado;
        });
        
        Gastos.mostrarGastos(gastosFiltrados);
    },

    // Limpiar filtros
    limpiarFiltros() {
        document.getElementById("filtroBusqueda").value = "";
        document.getElementById("filtroEstado").value = "";
        Gastos.mostrarGastos();
    },

    // Filtrar por estado específico
    filtrarPorEstado(estado) {
        document.getElementById("filtroEstado").value = estado;
        this.filtrarGastos();
    },

    // Filtrar por rango de fechas
    filtrarPorRangoFechas(fechaInicio, fechaFin) {
        const gastos = Storage.obtenerGastos();
        const gastosFiltrados = gastos.filter(gasto => {
            if (!gasto.dia_pago) return false;
            
            const fechaGasto = new Date();
            fechaGasto.setDate(gasto.dia_pago);
            
            return fechaGasto >= fechaInicio && fechaGasto <= fechaFin;
        });
        
        Gastos.mostrarGastos(gastosFiltrados);
    },

    // Filtrar por rango de deuda
    filtrarPorRangoDeuda(minDeuda, maxDeuda) {
        const gastos = Storage.obtenerGastos();
        const gastosFiltrados = gastos.filter(gasto => {
            return gasto.deuda >= minDeuda && gasto.deuda <= maxDeuda;
        });
        
        Gastos.mostrarGastos(gastosFiltrados);
    },

    // Filtrar gastos urgentes
    filtrarUrgentes() {
        const gastos = Storage.obtenerGastos();
        const gastosUrgentes = gastos.filter(gasto => Gastos.verificarUrgenciaPorDia(gasto));
        Gastos.mostrarGastos(gastosUrgentes);
    },

    // Filtrar gastos vencidos
    filtrarVencidos() {
        const gastos = Storage.obtenerGastos();
        const gastosVencidos = gastos.filter(gasto => {
            const estadoInfo = Gastos.calcularEstadoGasto(gasto);
            return estadoInfo.estado === 'vencido';
        });
        Gastos.mostrarGastos(gastosVencidos);
    },

    // Filtrar por categoría
    filtrarPorCategoria(categoria) {
        const gastos = Storage.obtenerGastos();
        const gastosFiltrados = gastos.filter(gasto => {
            const categoriaGasto = this.obtenerCategoriaGasto(gasto.nombre);
            return categoriaGasto === categoria;
        });
        Gastos.mostrarGastos(gastosFiltrados);
    },

    // Obtener categoría del gasto (método auxiliar)
    obtenerCategoriaGasto(nombre) {
        const nombreLower = nombre.toLowerCase();
        
        const categorias = {
            'servicios': ['energía', 'agua', 'gas', 'internet', 'telefonía', 'cable', 'tv'],
            'vivienda': ['arriendo', 'hipoteca', 'mantenimiento', 'seguridad'],
            'transporte': ['gasolina', 'transporte', 'uber', 'taxi', 'bus', 'metro'],
            'alimentación': ['comida', 'supermercado', 'restaurante', 'delivery'],
            'salud': ['medicina', 'doctor', 'hospital', 'farmacia', 'seguro'],
            'entretenimiento': ['netflix', 'spotify', 'cine', 'teatro', 'música'],
            'educación': ['colegio', 'universidad', 'curso', 'libro', 'material'],
            'finanzas': ['banco', 'tarjeta', 'préstamo', 'inversión', 'seguro']
        };

        for (const [categoria, palabras] of Object.entries(categorias)) {
            if (palabras.some(palabra => nombreLower.includes(palabra))) {
                return categoria;
            }
        }
        
        return 'otros';
    },

    // Búsqueda avanzada
    busquedaAvanzada(criterios) {
        const gastos = Storage.obtenerGastos();
        const gastosFiltrados = gastos.filter(gasto => {
            // Búsqueda por texto
            if (criterios.texto) {
                const texto = criterios.texto.toLowerCase();
                const coincideTexto = 
                    gasto.nic.toLowerCase().includes(texto) ||
                    gasto.nombre.toLowerCase().includes(texto) ||
                    (gasto.enlace_pago && gasto.enlace_pago.toLowerCase().includes(texto));
                
                if (!coincideTexto) return false;
            }
            
            // Filtro por estado
            if (criterios.estado) {
                const estadoInfo = Gastos.calcularEstadoGasto(gasto);
                if (estadoInfo.estado !== criterios.estado) return false;
            }
            
            // Filtro por rango de deuda
            if (criterios.minDeuda !== undefined && gasto.deuda < criterios.minDeuda) return false;
            if (criterios.maxDeuda !== undefined && gasto.deuda > criterios.maxDeuda) return false;
            
            // Filtro por categoría
            if (criterios.categoria) {
                const categoriaGasto = this.obtenerCategoriaGasto(gasto.nombre);
                if (categoriaGasto !== criterios.categoria) return false;
            }
            
            // Filtro por día de pago
            if (criterios.diaPago !== undefined && gasto.dia_pago !== criterios.diaPago) return false;
            
            return true;
        });
        
        Gastos.mostrarGastos(gastosFiltrados);
    },

    // Guardar filtros en localStorage
    guardarFiltros() {
        const filtros = {
            busqueda: document.getElementById("filtroBusqueda").value,
            estado: document.getElementById("filtroEstado").value,
            timestamp: Date.now()
        };
        
        localStorage.setItem('filtrosActivos', JSON.stringify(filtros));
    },

    // Cargar filtros desde localStorage
    cargarFiltros() {
        const filtrosGuardados = localStorage.getItem('filtrosActivos');
        if (filtrosGuardados) {
            const filtros = JSON.parse(filtrosGuardados);
            
            // Solo aplicar filtros si no han pasado más de 1 hora
            const unaHora = 60 * 60 * 1000;
            if (Date.now() - filtros.timestamp < unaHora) {
                document.getElementById("filtroBusqueda").value = filtros.busqueda || "";
                document.getElementById("filtroEstado").value = filtros.estado || "";
                this.filtrarGastos();
            }
        }
    },

    // Limpiar filtros guardados
    limpiarFiltrosGuardados() {
        localStorage.removeItem('filtrosActivos');
    },

    // Aplicar filtro inteligente
    aplicarFiltroInteligente() {
        const gastos = Storage.obtenerGastos();
        const hoy = new Date();
        const diaActual = hoy.getDate();
        
        // Filtrar gastos que vencen en los próximos 7 días
        const gastosProximos = gastos.filter(gasto => {
            if (!gasto.dia_pago) return false;
            
            const diasRestantes = gasto.dia_pago - diaActual;
            return diasRestantes >= 0 && diasRestantes <= 7;
        });
        
        Gastos.mostrarGastos(gastosProximos);
    },

    // Filtrar gastos urgentes (próximos 3 días)
    filtrarUrgentes() {
        const gastos = Storage.obtenerGastos();
        const gastosUrgentes = gastos.filter(gasto => {
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
            return diasRestantes <= 3 && diasRestantes >= 0;
        });
        
        Gastos.mostrarGastos(gastosUrgentes);
        UI.mostrarSnackbar(`Mostrando ${gastosUrgentes.length} gastos urgentes`);
    },

    // Filtrar gastos próximos (próximos 7 días)
    filtrarProximos() {
        const gastos = Storage.obtenerGastos();
        const gastosProximos = gastos.filter(gasto => {
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
            return diasRestantes <= 7 && diasRestantes >= 0;
        });
        
        Gastos.mostrarGastos(gastosProximos);
        UI.mostrarSnackbar(`Mostrando ${gastosProximos.length} gastos próximos`);
    },

    // Filtrar gastos pagados
    filtrarPagados() {
        const gastos = Storage.obtenerGastos();
        const gastosPagados = gastos.filter(gasto => {
            return gasto.deuda === 0 || (gasto.pagos && gasto.pagos.length > 0);
        });
        
        Gastos.mostrarGastos(gastosPagados);
        UI.mostrarSnackbar(`Mostrando ${gastosPagados.length} gastos pagados`);
    },

    // Filtrar gastos pendientes
    filtrarPendientes() {
        const gastos = Storage.obtenerGastos();
        const gastosPendientes = gastos.filter(gasto => {
            return gasto.deuda > 0;
        });
        
        Gastos.mostrarGastos(gastosPendientes);
        UI.mostrarSnackbar(`Mostrando ${gastosPendientes.length} gastos pendientes`);
    }
};
