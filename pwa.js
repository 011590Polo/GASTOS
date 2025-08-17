// PWA - Progressive Web App functionality
class PWA {
    constructor() {
        this.deferredPrompt = null;
        this.installButton = null;
        this.init();
    }

    init() {
        this.registerServiceWorker();
        this.setupInstallPrompt();
        this.setupUpdateNotification();
        this.checkForUpdates();
    }

    // Registrar el Service Worker
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('./sw.js', {
                    scope: './'
                });
                console.log('Service Worker registrado exitosamente:', registration);
                
                // Escuchar actualizaciones del Service Worker
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                this.showUpdateNotification();
                            }
                        });
                    }
                });
                
                // Manejar errores del Service Worker
                registration.addEventListener('error', (error) => {
                    console.error('Error en Service Worker:', error);
                });
                
            } catch (error) {
                console.error('Error al registrar Service Worker:', error);
                // Mostrar mensaje al usuario si es necesario
                this.showSnackbar('Error al cargar la aplicación offline', 'error');
            }
        } else {
            console.log('Service Worker no soportado en este navegador');
        }
    }

    // Configurar el prompt de instalación
    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });

        // Escuchar si la app ya está instalada
        window.addEventListener('appinstalled', () => {
            console.log('PWA instalada exitosamente');
            this.hideInstallButton();
            this.showSnackbar('¡Aplicación instalada exitosamente!', 'success');
        });
    }

    // Mostrar botón de instalación
    showInstallButton() {
        // Crear botón de instalación si no existe
        if (!this.installButton) {
            this.installButton = document.createElement('button');
            this.installButton.className = 'md-button md-button--primary pwa-install-btn';
            this.installButton.innerHTML = '<i class="material-icons">download</i> Instalar App';
            this.installButton.onclick = () => this.installApp();
            
            // Agregar al header
            const headerActions = document.querySelector('.header-actions');
            if (headerActions) {
                headerActions.appendChild(this.installButton);
            }
        }
        this.installButton.style.display = 'inline-flex';
    }

    // Ocultar botón de instalación
    hideInstallButton() {
        if (this.installButton) {
            this.installButton.style.display = 'none';
        }
    }

    // Instalar la aplicación
    async installApp() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                console.log('Usuario aceptó instalar la PWA');
            } else {
                console.log('Usuario rechazó instalar la PWA');
            }
            
            this.deferredPrompt = null;
            this.hideInstallButton();
        }
    }

    // Configurar notificaciones de actualización
    setupUpdateNotification() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                this.showSnackbar('Aplicación actualizada. Recarga para ver los cambios.', 'info');
            });
        }
    }

    // Mostrar notificación de actualización
    showUpdateNotification() {
        const updateDiv = document.createElement('div');
        updateDiv.className = 'pwa-update-notification';
        updateDiv.innerHTML = `
            <div class="update-content">
                <i class="material-icons">system_update</i>
                <span>Nueva versión disponible</span>
                <button onclick="pwa.updateApp()" class="md-button md-button--primary">Actualizar</button>
                <button onclick="pwa.dismissUpdate()" class="md-button">Más tarde</button>
            </div>
        `;
        
        document.body.appendChild(updateDiv);
        
        // Auto-ocultar después de 10 segundos
        setTimeout(() => {
            if (updateDiv.parentNode) {
                updateDiv.remove();
            }
        }, 10000);
    }

    // Actualizar la aplicación
    updateApp() {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            const messageChannel = new MessageChannel();
            
            messageChannel.port1.onmessage = (event) => {
                if (event.data.type === 'SKIP_WAITING_COMPLETED') {
                    console.log('Service Worker actualizado, recargando página...');
                    window.location.reload();
                }
            };
            
            navigator.serviceWorker.controller.postMessage(
                { type: 'SKIP_WAITING' },
                [messageChannel.port2]
            );
        }
    }

    // Descartar actualización
    dismissUpdate() {
        const updateDiv = document.querySelector('.pwa-update-notification');
        if (updateDiv) {
            updateDiv.remove();
        }
    }

    // Verificar actualizaciones
    checkForUpdates() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistration().then(registration => {
                if (registration) {
                    registration.update();
                }
            });
        }
    }

    // Mostrar snackbar
    showSnackbar(message, type = 'info') {
        const snackbar = document.getElementById('snackbar');
        const snackbarText = document.getElementById('snackbar-text');
        
        if (snackbar && snackbarText) {
            snackbarText.textContent = message;
            snackbar.className = `md-snackbar md-snackbar--${type}`;
            snackbar.style.display = 'block';
            
            setTimeout(() => {
                snackbar.style.display = 'none';
            }, 3000);
        }
    }

    // Verificar si la app está en modo standalone
    isStandalone() {
        return window.matchMedia('(display-mode: standalone)').matches ||
               window.navigator.standalone === true;
    }

    // Obtener información de la PWA
    getPWAInfo() {
        return {
            isStandalone: this.isStandalone(),
            hasServiceWorker: 'serviceWorker' in navigator,
            hasPushSupport: 'PushManager' in window,
            hasNotifications: 'Notification' in window
        };
    }
}

// Inicializar PWA cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.pwa = new PWA();
    
    // Agregar estilos CSS para PWA
    const pwaStyles = `
        .pwa-install-btn {
            margin-left: 10px;
            display: none;
        }
        
        .pwa-update-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #1976d2;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            max-width: 300px;
        }
        
        .update-content {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .update-content i {
            font-size: 20px;
        }
        
        .update-content button {
            padding: 4px 8px;
            font-size: 12px;
            margin-left: 5px;
        }
        
        @media (max-width: 768px) {
            .pwa-update-notification {
                top: 10px;
                right: 10px;
                left: 10px;
                max-width: none;
            }
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = pwaStyles;
    document.head.appendChild(styleSheet);
});
