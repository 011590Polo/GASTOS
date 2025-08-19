// Módulo principal de la aplicación
import { Storage } from './storage.js';
import { Utils } from './utils.js';
import { UI } from './ui.js';
import { Gastos } from './gastos.js';
import { Pagos } from './pagos.js';
import { Filtros } from './filtros.js';

export const App = {
    // Inicializar la aplicación
    async inicializar() {
        try {
            console.log('Inicializando aplicación...');
            
            // Cargar datos iniciales
            this.cargarDatosIniciales();
            
            // Configurar event listeners
            this.configurarEventListeners();
            
            // Restaurar estado de la UI
            UI.restaurarEstadoSidebar();
            
            // Cargar filtros guardados
            Filtros.cargarFiltros();
            
                               // Mostrar gastos iniciales
                   Gastos.mostrarGastos();

                   // Verificar pagos urgentes
                   Gastos.verificarPagosUrgentes();

                   // Actualizar estadísticas rápidas
                   this.actualizarEstadisticasRapidas();
            
            // Configurar notificaciones
            this.configurarNotificaciones();
            
            console.log('Aplicación inicializada correctamente');
            
        } catch (error) {
            console.error('Error al inicializar la aplicación:', error);
            UI.mostrarSnackbar('Error al inicializar la aplicación', 5000);
        }
    },

    // Cargar datos iniciales
    cargarDatosIniciales() {
        const gastos = Storage.obtenerGastos();
        
        if (gastos.length === 0) {
            // Cargar datos de ejemplo si no hay gastos
            this.cargarDatosEjemplo();
        }
    },

    // Cargar datos de ejemplo
    cargarDatosEjemplo() {
        const datosEjemplo = [
            {
                id: 1,
                nic: "123456789",
                nombre: "Energía Eléctrica",
                deuda: 150000,
                dia_pago: 15,
                enlace_pago: "https://www.epm.com.co",
                pagos: []
            },
            {
                id: 2,
                nic: "987654321",
                nombre: "Agua",
                deuda: 45000,
                dia_pago: 20,
                enlace_pago: "https://www.epm.com.co",
                pagos: []
            },
            {
                id: 3,
                nic: "456789123",
                nombre: "Internet",
                deuda: 89000,
                dia_pago: 10,
                enlace_pago: "https://www.claro.com.co",
                pagos: []
            }
        ];
        
        Storage.guardarGastos(datosEjemplo);
        UI.mostrarSnackbar('Datos de ejemplo cargados');
    },

    // Configurar event listeners
    configurarEventListeners() {
        // Event listeners para modales
        this.configurarModales();
        
        // Event listeners para filtros
        this.configurarFiltros();
        
        // Event listeners para navegación
        this.configurarNavegacion();
        
        // Event listeners para formularios
        this.configurarFormularios();
        
        // Event listeners para botones de acción
        this.configurarBotonesAccion();
    },

    // Configurar modales
    configurarModales() {
        // Cerrar modales con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                UI.cerrarModalAgregarGasto();
                UI.cerrarModalPago();
                UI.cerrarModalHistorial();
                UI.cerrarModalConfirmacion();
            }
        });

        // Cerrar modales al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                UI.cerrarModalAgregarGasto();
                UI.cerrarModalPago();
                UI.cerrarModalHistorial();
                UI.cerrarModalConfirmacion();
            }
        });
    },

    // Configurar filtros
    configurarFiltros() {
        const filtroBusqueda = document.getElementById('filtroBusqueda');
        const filtroEstado = document.getElementById('filtroEstado');
        
        if (filtroBusqueda) {
            filtroBusqueda.addEventListener('input', Utils.debounce(() => {
                Filtros.filtrarGastos();
                Filtros.guardarFiltros();
            }, 300));
        }
        
        if (filtroEstado) {
            filtroEstado.addEventListener('change', () => {
                Filtros.filtrarGastos();
                Filtros.guardarFiltros();
            });
        }
    },

    // Configurar navegación
    configurarNavegacion() {
        const sidebarToggle = document.getElementById('sidebar-toggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                UI.toggleSidebar();
            });
        }

        // Navegación por secciones
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-seccion]')) {
                const seccionId = e.target.getAttribute('data-seccion');
                UI.mostrarSeccion(seccionId);
            }
        });
    },

    // Configurar formularios
    configurarFormularios() {
        // Formulario de gasto
        const formGasto = document.getElementById('formGasto');
        if (formGasto) {
            formGasto.addEventListener('submit', (e) => {
                e.preventDefault();
                Gastos.crearGasto();
            });
        }

        // Formulario de pago
        const formPago = document.getElementById('formPago');
        if (formPago) {
            formPago.addEventListener('submit', (e) => {
                e.preventDefault();
                Pagos.registrarPago();
            });
        }

        // Campo de valor de pago
        const valorPago = document.getElementById('valorPago');
        if (valorPago) {
            valorPago.addEventListener('input', () => {
                Pagos.calcularDiferenciaPago();
            });
        }
    },

    // Configurar botones de acción
    configurarBotonesAccion() {
        // Botón de agregar gasto
        const btnAgregarGasto = document.getElementById('btnAgregarGasto');
        if (btnAgregarGasto) {
            btnAgregarGasto.addEventListener('click', () => {
                UI.abrirModalAgregarGasto();
            });
        }

        // Botón de limpiar filtros
        const btnLimpiarFiltros = document.getElementById('btnLimpiarFiltros');
        if (btnLimpiarFiltros) {
            btnLimpiarFiltros.addEventListener('click', () => {
                Filtros.limpiarFiltros();
                Filtros.limpiarFiltrosGuardados();
            });
        }

        // Botón de exportar
        const btnExportar = document.getElementById('btnExportar');
        if (btnExportar) {
            btnExportar.addEventListener('click', () => {
                this.exportarDatos();
            });
        }

        // Botón de importar
        const btnImportar = document.getElementById('btnImportar');
        if (btnImportar) {
            btnImportar.addEventListener('click', () => {
                this.importarDatos();
            });
        }
    },

    // Configurar notificaciones
    configurarNotificaciones() {
        if ('Notification' in window) {
            if (Notification.permission === 'default') {
                Notification.requestPermission();
            }
        }
    },

    // Exportar datos
    exportarDatos() {
        const datos = Storage.exportarDatos();
        const blob = new Blob([datos], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `gastos_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        UI.mostrarSnackbar('Datos exportados exitosamente');
    },

    // Importar datos
    importarDatos() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const contenido = e.target.result;
                    if (Storage.importarDatos(contenido)) {
                        Gastos.mostrarGastos();
                        UI.mostrarSnackbar('Datos importados exitosamente');
                    } else {
                        UI.mostrarSnackbar('Error al importar datos', 5000);
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    },

    // Limpiar datos
    limpiarDatos() {
        UI.mostrarModalConfirmacion(
            "¿Estás seguro de que quieres eliminar todos los datos? Esta acción no se puede deshacer.",
            () => {
                Storage.limpiarDatos();
                Gastos.mostrarGastos();
                UI.mostrarSnackbar('Todos los datos han sido eliminados');
            }
        );
    },

    // Actualizar aplicación
    actualizar() {
        Gastos.mostrarGastos();
        Gastos.verificarPagosUrgentes();
        this.actualizarEstadisticasRapidas();
    },

    // Actualizar estadísticas rápidas
    actualizarEstadisticasRapidas() {
        const gastos = Storage.obtenerGastos();
        
        // Total de gastos
        const totalGastos = gastos.length;
        
        // Gastos pendientes (con deuda > 0)
        const gastosPendientes = gastos.filter(gasto => gasto.deuda > 0).length;
        
        // Gastos urgentes (próximos 3 días)
        const gastosUrgentes = gastos.filter(gasto => {
            if (!gasto.dia_pago) return false;
            
            const hoy = new Date();
            const diaActual = hoy.getDate();
            const mesActual = hoy.getMonth();
            const añoActual = hoy.getFullYear();
            
            let proximoPago = new Date(añoActual, mesActual, gasto.dia_pago);
            if (proximoPago < hoy) {
                proximoPago = new Date(añoActual, mesActual + 1, gasto.dia_pago);
            }
            
            const diasRestantes = Math.ceil((proximoPago - hoy) / (1000 * 60 * 60 * 24));
            return diasRestantes <= 3 && diasRestantes >= 0;
        }).length;
        
        // Gastos pagados (deuda = 0 o con pagos)
        const gastosPagados = gastos.filter(gasto => 
            gasto.deuda === 0 || (gasto.pagos && gasto.pagos.length > 0)
        ).length;
        
        // Actualizar elementos en el DOM
        const quickTotalGastos = document.getElementById('quickTotalGastos');
        const quickPendientes = document.getElementById('quickPendientes');
        const quickUrgentes = document.getElementById('quickUrgentes');
        const quickPagados = document.getElementById('quickPagados');
        
        if (quickTotalGastos) quickTotalGastos.textContent = totalGastos;
        if (quickPendientes) quickPendientes.textContent = gastosPendientes;
        if (quickUrgentes) quickUrgentes.textContent = gastosUrgentes;
        if (quickPagados) quickPagados.textContent = gastosPagados;
    }
};

// Hacer funciones disponibles globalmente para compatibilidad
window.abrirModalAgregarGasto = () => UI.abrirModalAgregarGasto();
window.cerrarModalAgregarGasto = () => UI.cerrarModalAgregarGasto();
window.crearGasto = () => Gastos.crearGasto();
window.editarGasto = (id) => Gastos.editarGasto(id);
window.eliminarGasto = (id) => Gastos.eliminarGasto(id);
window.abrirModalPago = (id) => UI.abrirModalPago(id);
window.cerrarModalPago = () => UI.cerrarModalPago();
window.registrarPago = () => Pagos.registrarPago();
window.calcularDiferenciaPago = () => Pagos.calcularDiferenciaPago();
window.verHistorialPagos = (id) => Gastos.verHistorialPagos(id);
window.cerrarModalHistorial = () => UI.cerrarModalHistorial();
window.eliminarPago = (idGasto, idPago) => Gastos.eliminarPago(idGasto, idPago);
window.filtrarGastos = () => Filtros.filtrarGastos();
window.limpiarFiltro = () => Filtros.limpiarFiltros();
window.toggleSidebar = () => UI.toggleSidebar();
window.mostrarSeccion = (seccionId) => UI.mostrarSeccion(seccionId);
window.cambiarTema = () => UI.cambiarTema();
window.cambiarColorPrincipal = () => UI.cambiarColorPrincipal();
window.exportarJSON = () => App.exportarDatos();
window.importarJSON = () => App.importarDatos();
window.limpiarDatos = () => App.limpiarDatos();

// Funciones para la nueva sección de resultados
window.filtrarUrgentes = () => Filtros.filtrarUrgentes();
window.filtrarProximos = () => Filtros.filtrarProximos();
window.filtrarPagados = () => Filtros.filtrarPagados();
window.filtrarPendientes = () => Filtros.filtrarPendientes();

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    App.inicializar();
});
