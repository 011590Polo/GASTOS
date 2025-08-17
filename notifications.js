// Sistema de Notificaciones para PWA
class NotificationManager {
    constructor() {
        this.isSupported = 'Notification' in window && 'serviceWorker' in navigator;
        this.permission = 'default';
        this.subscription = null;
        this.init();
    }

    async init() {
        if (!this.isSupported) {
            console.log('Notificaciones no soportadas en este navegador');
            return;
        }

        this.permission = Notification.permission;
        await this.checkPermission();
        await this.getSubscription();
    }

    // Verificar y solicitar permisos
    async checkPermission() {
        if (this.permission === 'default') {
            try {
                this.permission = await Notification.requestPermission();
                console.log('Permiso de notificaciones:', this.permission);
                
                if (this.permission === 'granted') {
                    this.showSnackbar('Notificaciones activadas', 'success');
                    await this.subscribeToPush();
                } else {
                    this.showSnackbar('Notificaciones desactivadas', 'warning');
                }
            } catch (error) {
                console.error('Error al solicitar permisos:', error);
                this.showSnackbar('Error al configurar notificaciones', 'error');
            }
        }
    }

    // Suscribirse a notificaciones push
    async subscribeToPush() {
        if (!this.isSupported || this.permission !== 'granted') {
            return;
        }

        try {
            const registration = await navigator.serviceWorker.ready;
            
            // Verificar si ya está suscrito
            this.subscription = await registration.pushManager.getSubscription();
            
            if (!this.subscription) {
                // Crear nueva suscripción
                this.subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: this.urlBase64ToUint8Array(this.getVAPIDPublicKey())
                });
                
                console.log('Suscripción push creada:', this.subscription);
                this.saveSubscription();
            }
        } catch (error) {
            console.error('Error al suscribirse a push:', error);
            this.showSnackbar('Error al configurar notificaciones push', 'error');
        }
    }

    // Enviar notificación local
    async sendLocalNotification(title, options = {}) {
        if (!this.isSupported || this.permission !== 'granted') {
            return false;
        }

        try {
            const registration = await navigator.serviceWorker.ready;
            
            const notificationOptions = {
                body: 'Nueva notificación de Gastos',
                icon: './icons/icon-192x192.png',
                badge: './icons/icon-72x72.png',
                vibrate: [100, 50, 100],
                requireInteraction: true,
                tag: 'gastos-notification',
                data: {
                    dateOfArrival: Date.now(),
                    url: './'
                },
                actions: [
                    {
                        action: 'explore',
                        title: 'Ver Gastos',
                        icon: './icons/icon-96x96.png'
                    },
                    {
                        action: 'close',
                        title: 'Cerrar',
                        icon: './icons/icon-96x96.png'
                    }
                ],
                ...options
            };

            await registration.showNotification(title, notificationOptions);
            return true;
        } catch (error) {
            console.error('Error al enviar notificación:', error);
            return false;
        }
    }

    // Notificación de gasto urgente
    async notifyUrgentExpense(expense) {
        const title = '⚠️ Gasto Urgente';
        const body = `${expense.nombre} - $${expense.deuda.toLocaleString()}`;
        
        return await this.sendLocalNotification(title, {
            body: body,
            tag: `urgent-${expense.id}`,
            data: {
                type: 'urgent_expense',
                expenseId: expense.id,
                url: './?section=gastos'
            }
        });
    }

    // Notificación de pago realizado
    async notifyPaymentCompleted(payment) {
        const title = '✅ Pago Registrado';
        const body = `${payment.nombre} - $${payment.valorPagado.toLocaleString()}`;
        
        return await this.sendLocalNotification(title, {
            body: body,
            tag: `payment-${payment.id}`,
            data: {
                type: 'payment_completed',
                paymentId: payment.id,
                url: './?section=gastos'
            }
        });
    }

    // Notificación de recordatorio
    async notifyReminder(message) {
        const title = '🔔 Recordatorio';
        
        return await this.sendLocalNotification(title, {
            body: message,
            tag: 'reminder',
            data: {
                type: 'reminder',
                url: './'
            }
        });
    }

    // Obtener suscripción actual
    async getSubscription() {
        if (!this.isSupported) return null;

        try {
            const registration = await navigator.serviceWorker.ready;
            this.subscription = await registration.pushManager.getSubscription();
            return this.subscription;
        } catch (error) {
            console.error('Error al obtener suscripción:', error);
            return null;
        }
    }

    // Guardar suscripción en localStorage
    saveSubscription() {
        if (this.subscription) {
            try {
                const subscriptionData = {
                    endpoint: this.subscription.endpoint,
                    keys: {
                        p256dh: this.arrayBufferToBase64(this.subscription.getKey('p256dh')),
                        auth: this.arrayBufferToBase64(this.subscription.getKey('auth'))
                    }
                };
                
                localStorage.setItem('push_subscription', JSON.stringify(subscriptionData));
                console.log('Suscripción guardada en localStorage');
            } catch (error) {
                console.error('Error al guardar suscripción:', error);
            }
        }
    }

    // Cargar suscripción desde localStorage
    loadSubscription() {
        try {
            const saved = localStorage.getItem('push_subscription');
            return saved ? JSON.parse(saved) : null;
        } catch (error) {
            console.error('Error al cargar suscripción:', error);
            return null;
        }
    }

    // Cancelar suscripción
    async unsubscribe() {
        if (this.subscription) {
            try {
                await this.subscription.unsubscribe();
                this.subscription = null;
                localStorage.removeItem('push_subscription');
                console.log('Suscripción cancelada');
                this.showSnackbar('Notificaciones push desactivadas', 'info');
            } catch (error) {
                console.error('Error al cancelar suscripción:', error);
            }
        }
    }

    // Verificar estado de notificaciones
    getNotificationStatus() {
        return {
            supported: this.isSupported,
            permission: this.permission,
            subscribed: !!this.subscription,
            canNotify: this.isSupported && this.permission === 'granted'
        };
    }

    // Utilidades para VAPID
    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    arrayBufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    // Clave VAPID pública (debes generar tus propias claves)
    getVAPIDPublicKey() {
        // Esta es una clave de ejemplo. Para producción, genera tus propias claves VAPID
        return 'BEl62iUYgUivxIkv69yViEuiBIa1eQNgYk8zy-a7uKZtGTC2fTWmFb1uVZlUw0SWHuTjHwJ8XVtKQwhgjvU65t1Q';
    }

    // Mostrar snackbar
    showSnackbar(message, type = 'info') {
        if (window.pwa && window.pwa.showSnackbar) {
            window.pwa.showSnackbar(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.notificationManager = new NotificationManager();
    
    // Agregar función global para testing
    window.testNotification = async () => {
        if (window.notificationManager) {
            const success = await window.notificationManager.sendLocalNotification(
                '🧪 Notificación de Prueba',
                {
                    body: 'Esta es una notificación de prueba para verificar que funcionan en tu dispositivo móvil.',
                    tag: 'test-notification'
                }
            );
            
            if (success) {
                console.log('✅ Notificación de prueba enviada exitosamente');
            } else {
                console.log('❌ Error al enviar notificación de prueba');
            }
        }
    };
});
