// Script principal modular - Gestión de Gastos
// Este archivo reemplaza al script.js original con una arquitectura modular

// Importar todos los módulos
import { App } from './modules/app.js';

// La aplicación se inicializa automáticamente cuando el DOM esté listo
// Ver modules/app.js para más detalles

console.log('Sistema de Gestión de Gastos - Versión Modular');
console.log('Cargando módulos...');

// Exportar la aplicación para acceso global si es necesario
window.App = App;


