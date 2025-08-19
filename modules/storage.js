// Módulo de Storage - Gestión de localStorage
export const Storage = {
    // Obtener gastos del localStorage
    obtenerGastos() {
        return JSON.parse(localStorage.getItem("gastos") || "[]");
    },

    // Guardar gastos en localStorage
    guardarGastos(gastos) {
        localStorage.setItem("gastos", JSON.stringify(gastos));
    },

    // Obtener configuración
    obtenerConfiguracion() {
        return JSON.parse(localStorage.getItem("configuracion") || "{}");
    },

    // Guardar configuración
    guardarConfiguracion(config) {
        localStorage.setItem("configuracion", JSON.stringify(config));
    },

    // Limpiar todos los datos
    limpiarDatos() {
        localStorage.removeItem("gastos");
        localStorage.removeItem("configuracion");
    },

    // Exportar datos como JSON
    exportarDatos() {
        const datos = {
            gastos: this.obtenerGastos(),
            configuracion: this.obtenerConfiguracion(),
            fechaExportacion: new Date().toISOString()
        };
        return JSON.stringify(datos, null, 2);
    },

    // Importar datos desde JSON
    importarDatos(jsonData) {
        try {
            const datos = JSON.parse(jsonData);
            if (datos.gastos) {
                this.guardarGastos(datos.gastos);
            }
            if (datos.configuracion) {
                this.guardarConfiguracion(datos.configuracion);
            }
            return true;
        } catch (error) {
            console.error("Error al importar datos:", error);
            return false;
        }
    }
};

