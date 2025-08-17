// Manejador de errores para PWA
class PWAErrorHandler {
    constructor() {
        this.init();
    }

    init() {
        this.setupGlobalErrorHandling();
        this.setupServiceWorkerErrorHandling();
        this.setupUnhandledRejectionHandling();
    }

    // Manejar errores globales
    setupGlobalErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('Error global capturado:', event.error);
            this.logError('Global Error', event.error);
        });
    }

    // Manejar errores de Service Worker
    setupServiceWorkerErrorHandling() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('error', (event) => {
                console.error('Error de Service Worker:', event.error);
                this.logError('Service Worker Error', event.error);
            });

            navigator.serviceWorker.addEventListener('messageerror', (event) => {
                console.error('Error de mensaje en Service Worker:', event);
                this.logError('Service Worker Message Error', event);
            });
        }
    }

    // Manejar promesas rechazadas no capturadas
    setupUnhandledRejectionHandling() {
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Promesa rechazada no capturada:', event.reason);
            this.logError('Unhandled Promise Rejection', event.reason);
            
            // Prevenir que el error aparezca en la consola
            event.preventDefault();
        });
    }

    // Registrar errores
    logError(type, error) {
        const errorInfo = {
            type: type,
            message: error.message || error.toString(),
            stack: error.stack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        console.group('🚨 Error de PWA');
        console.log('Tipo:', errorInfo.type);
        console.log('Mensaje:', errorInfo.message);
        console.log('Timestamp:', errorInfo.timestamp);
        console.log('URL:', errorInfo.url);
        console.groupEnd();

        // Guardar en localStorage para debugging
        this.saveErrorToStorage(errorInfo);
    }

    // Guardar error en localStorage
    saveErrorToStorage(errorInfo) {
        try {
            const errors = JSON.parse(localStorage.getItem('pwa_errors') || '[]');
            errors.push(errorInfo);
            
            // Mantener solo los últimos 10 errores
            if (errors.length > 10) {
                errors.splice(0, errors.length - 10);
            }
            
            localStorage.setItem('pwa_errors', JSON.stringify(errors));
        } catch (e) {
            console.error('Error al guardar error en localStorage:', e);
        }
    }

    // Obtener errores guardados
    getStoredErrors() {
        try {
            return JSON.parse(localStorage.getItem('pwa_errors') || '[]');
        } catch (e) {
            return [];
        }
    }

    // Limpiar errores guardados
    clearStoredErrors() {
        localStorage.removeItem('pwa_errors');
    }

    // Verificar si hay errores recientes
    hasRecentErrors() {
        const errors = this.getStoredErrors();
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        
        return errors.some(error => new Date(error.timestamp) > oneHourAgo);
    }

    // Mostrar resumen de errores
    showErrorSummary() {
        const errors = this.getStoredErrors();
        if (errors.length === 0) {
            return 'No hay errores registrados';
        }

        const summary = errors.reduce((acc, error) => {
            acc[error.type] = (acc[error.type] || 0) + 1;
            return acc;
        }, {});

        return `Errores encontrados: ${Object.entries(summary)
            .map(([type, count]) => `${type}: ${count}`)
            .join(', ')}`;
    }
}

// Inicializar el manejador de errores cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.pwaErrorHandler = new PWAErrorHandler();
    
    // Agregar función global para debugging
    window.debugPWA = () => {
        console.group('🔍 Debug PWA');
        console.log('Errores almacenados:', window.pwaErrorHandler.getStoredErrors());
        console.log('Resumen de errores:', window.pwaErrorHandler.showErrorSummary());
        console.log('Service Worker soportado:', 'serviceWorker' in navigator);
        console.log('PWA instalable:', window.pwa ? window.pwa.getPWAInfo() : 'PWA no inicializada');
        console.groupEnd();
    };
});
