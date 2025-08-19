// Módulo de Utilidades - Funciones auxiliares
export const Utils = {
    // Formatear fecha
    formatearFecha(fecha) {
        if (!fecha) return '';
        const d = new Date(fecha);
        return d.toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    // Formatear moneda
    formatearMoneda(valor) {
        return valor.toLocaleString("es-CO", { 
            style: "currency", 
            currency: "COP" 
        });
    },

    // Obtener color del estado
    getEstadoColor(estado) {
        const colores = {
            'al día': '#4CAF50',
            'próximo': '#FF9800',
            'urgente': '#F44336',
            'vencido': '#9C27B0'
        };
        return colores[estado] || '#757575';
    },

    // Obtener categoría del gasto basada en el nombre
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

    // Validar día de pago
    validarDiaPago(dia) {
        return dia >= 1 && dia <= 31;
    },

    // Validar email
    validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },

    // Generar ID único
    generarId() {
        return Date.now() + Math.random().toString(36).substr(2, 9);
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

