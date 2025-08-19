// Módulo de UI - Gestión de interfaz de usuario
export const UI = {
    // Variables de estado
    gastoEnEdicion: null,
    gastoEnPago: null,

    // Mostrar snackbar
    mostrarSnackbar(mensaje, duracion = 3000) {
        const snackbar = document.getElementById("snackbar");
        const snackbarText = document.getElementById("snackbar-text");
        
        if (snackbar && snackbarText) {
            snackbarText.textContent = mensaje;
            snackbar.classList.add("md-snackbar--show");
            
            setTimeout(() => {
                snackbar.classList.remove("md-snackbar--show");
            }, duracion);
        }
    },

    // Abrir modal de agregar gasto
    abrirModalAgregarGasto() {
        try {
            const modal = document.getElementById('modalAgregarGasto');
            if (modal) {
                modal.style.display = 'flex';
                
                // Limpiar el formulario si no está en modo edición
                if (!this.gastoEnEdicion) {
                    this.limpiarFormularioGasto();
                }
                
                // Enfocar el campo nombre después de que la modal aparezca
                setTimeout(() => {
                    const nombreInput = document.getElementById("nombre");
                    if (nombreInput) {
                        nombreInput.focus();
                    }
                }, 300);
                
                this.mostrarSnackbar("Modal abierta para agregar nuevo gasto");
            } else {
                console.error("No se encontró la modal");
                this.mostrarSnackbar("Error: No se pudo abrir la modal", 3000);
            }
        } catch (error) {
            console.error("Error en abrirModalAgregarGasto:", error);
            this.mostrarSnackbar("Error al abrir la modal", 3000);
        }
    },

    // Cerrar modal de agregar gasto
    cerrarModalAgregarGasto() {
        const modal = document.getElementById('modalAgregarGasto');
        if (modal) {
            modal.style.display = 'none';
            this.limpiarFormularioGasto();
            this.gastoEnEdicion = null;
            this.mostrarSnackbar("Modal cerrada");
        }
    },

    // Limpiar formulario de gasto
    limpiarFormularioGasto() {
        const campos = ["nic", "nombre", "deuda", "dia_pago", "enlace_pago"];
        campos.forEach(campo => {
            const elemento = document.getElementById(campo);
            if (elemento) elemento.value = "";
        });
        
        // Resetear el botón
        const btnGuardar = document.getElementById("btnGuardar");
        if (btnGuardar) {
            btnGuardar.innerHTML = '<i class="material-icons">save</i> Guardar';
        }
    },

    // Abrir modal de pago
    abrirModalPago(id) {
        this.gastoEnPago = id;
        const modal = document.getElementById('modalPago');
        if (modal) {
            modal.style.display = 'flex';
            this.mostrarSnackbar("Modal de pago abierta");
        }
    },

    // Cerrar modal de pago
    cerrarModalPago() {
        const modal = document.getElementById('modalPago');
        if (modal) {
            modal.style.display = 'none';
            this.gastoEnPago = null;
            this.mostrarSnackbar("Modal de pago cerrada");
        }
    },

    // Cerrar modal de historial
    cerrarModalHistorial() {
        const modal = document.getElementById('modalHistorial');
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('modal-historial'); // Remover clase específica
            this.mostrarSnackbar("Historial cerrado");
        }
    },

    // Cerrar modal de confirmación
    cerrarModalConfirmacion() {
        const modal = document.getElementById('modalConfirmacion');
        if (modal) {
            modal.style.display = 'none';
        }
    },

    // Mostrar modal de confirmación
    mostrarModalConfirmacion(mensaje, onConfirm) {
        const modal = document.getElementById('modalConfirmacion');
        const mensajeElement = document.getElementById('mensajeConfirmacion');
        const btnConfirmar = document.getElementById('btnConfirmarEliminacion');
        
        if (modal && mensajeElement && btnConfirmar) {
            mensajeElement.textContent = mensaje;
            modal.style.display = 'flex';
            
            // Remover listeners anteriores
            btnConfirmar.onclick = null;
            
            // Agregar nuevo listener
            btnConfirmar.onclick = () => {
                onConfirm();
                this.cerrarModalConfirmacion();
            };
        }
    },

    // Toggle sidebar
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('main-content');
        const toggleBtn = document.getElementById('sidebar-toggle');
        
        if (sidebar && mainContent && toggleBtn) {
            sidebar.classList.toggle('sidebar-collapsed');
            mainContent.classList.toggle('main-expanded');
            
            const isCollapsed = sidebar.classList.contains('sidebar-collapsed');
            toggleBtn.innerHTML = isCollapsed ? 
                '<i class="fas fa-bars"></i>' : 
                '<i class="fas fa-times"></i>';
            
            // Guardar estado
            const config = JSON.parse(localStorage.getItem('configuracion') || '{}');
            config.sidebarCollapsed = isCollapsed;
            localStorage.setItem('configuracion', JSON.stringify(config));
        }
    },

    // Restaurar estado del sidebar
    restaurarEstadoSidebar() {
        const config = JSON.parse(localStorage.getItem('configuracion') || '{}');
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('main-content');
        const toggleBtn = document.getElementById('sidebar-toggle');
        
        if (config.sidebarCollapsed && sidebar && mainContent && toggleBtn) {
            sidebar.classList.add('sidebar-collapsed');
            mainContent.classList.add('main-expanded');
            toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
        }
    },

    // Cambiar tema
    cambiarTema() {
        const body = document.body;
        const temaActual = body.getAttribute('data-tema') || 'claro';
        const nuevoTema = temaActual === 'claro' ? 'oscuro' : 'claro';
        
        body.setAttribute('data-tema', nuevoTema);
        
        // Guardar preferencia
        const config = JSON.parse(localStorage.getItem('configuracion') || '{}');
        config.tema = nuevoTema;
        localStorage.setItem('configuracion', JSON.stringify(config));
        
        this.mostrarSnackbar(`Tema cambiado a ${nuevoTema}`);
    },

    // Cambiar color principal
    cambiarColorPrincipal() {
        const colores = ['#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#F44336', '#607D8B'];
        const colorActual = getComputedStyle(document.documentElement).getPropertyValue('--color-principal').trim();
        const indiceActual = colores.indexOf(colorActual);
        const nuevoColor = colores[(indiceActual + 1) % colores.length];
        
        document.documentElement.style.setProperty('--color-principal', nuevoColor);
        
        // Guardar preferencia
        const config = JSON.parse(localStorage.getItem('configuracion') || '{}');
        config.colorPrincipal = nuevoColor;
        localStorage.setItem('configuracion', JSON.stringify(config));
        
        this.mostrarSnackbar('Color principal cambiado');
    },

    // Mostrar sección específica
    mostrarSeccion(seccionId) {
        const secciones = ['dashboard', 'gastos', 'estadisticas', 'configuracion'];
        const sidebar = document.getElementById('sidebar');
        
        // Ocultar todas las secciones
        secciones.forEach(seccion => {
            const elemento = document.getElementById(seccion);
            if (elemento) {
                elemento.style.display = 'none';
            }
        });
        
        // Mostrar la sección seleccionada
        const seccionSeleccionada = document.getElementById(seccionId);
        if (seccionSeleccionada) {
            seccionSeleccionada.style.display = 'block';
        }
        
        // Actualizar navegación activa
        const navItems = sidebar.querySelectorAll('.nav-item');
        navItems.forEach(item => item.classList.remove('active'));
        
        const navItemActivo = sidebar.querySelector(`[data-seccion="${seccionId}"]`);
        if (navItemActivo) {
            navItemActivo.classList.add('active');
        }
        
        // Cerrar sidebar en móviles
        if (window.innerWidth <= 768) {
            this.toggleSidebar();
        }
    },

    // Actualizar contador de resultados
    actualizarContadorResultados(cantidad, total) {
        const resultadosElement = document.getElementById("resultadosFiltro");
        if (resultadosElement) {
            if (cantidad === total) {
                resultadosElement.textContent = `Mostrando todos los gastos (${total})`;
            } else {
                resultadosElement.textContent = `Mostrando ${cantidad} de ${total} gastos`;
            }
        }
    }
};
