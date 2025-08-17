# 💰 Administrador de Gastos

Una aplicación web moderna para gestionar tus deudas y pagos de manera organizada y eficiente.

## 🚀 Características

- ✅ **Gestión completa de gastos** - Agregar, editar y eliminar deudas
- 💳 **Seguimiento de pagos** - Historial detallado de todos los pagos
- 🔍 **Filtros inteligentes** - Búsqueda y filtrado por estado
- 📊 **Estados de gestión** - Puede Esperar, Urgente, Pagado
- 📈 **Estadísticas y gráficos** - Análisis visual de gastos y pagos
- 💾 **Importar/Exportar** - Respaldo completo de datos en JSON
- 🔗 **Enlaces directos** - Acceso rápido a portales de pago
- 📱 **Diseño responsive** - Funciona perfectamente en móviles
- 🎨 **Material Design** - Interfaz moderna y intuitiva
- 🔒 **Privacidad total** - Datos guardados localmente en tu navegador

## 🌐 Demo en Vivo

**🚀 [Ver aplicación en vivo](https://011590polo.github.io/GASTOS/)** - Tu aplicación está desplegada en GitHub Pages y es accesible públicamente.

## 📦 Instalación

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/011590Polo/GASTOS.git
   cd GASTOS
   ```

2. **Abre el archivo principal:**
   - Simplemente abre `index.html` en tu navegador
   - O usa un servidor local: `python -m http.server 8000`

## 🎯 Cómo Usar

### Agregar un Nuevo Gasto
1. Haz clic en el botón flotante "+" 
2. Completa la información:
   - **NIC**: Número de identificación del cliente
   - **Nombre**: Nombre del servicio o entidad
   - **Deuda**: Monto en pesos colombianos
   - **Fecha a pagar**: Fecha de vencimiento
   - **Enlace de pago**: URL del portal de pago (opcional)

### Registrar un Pago
1. Haz clic en "Registrar Pago" en cualquier gasto
2. Completa la información del pago:
   - Fecha de pago
   - Valor pagado
   - Comprobante (opcional)
   - Notas adicionales

### Filtrar Gastos
- Usa la barra de búsqueda para encontrar gastos específicos
- Selecciona un estado para filtrar por: Puede Esperar, Urgente, Pagado

### Respaldo de Datos
- **Exportar**: Descarga todos tus datos en formato JSON
- **Importar**: Restaura tus datos desde un archivo JSON

### Estadísticas y Gráficos
- **📊 Distribución por Estado**: Gráfico circular que muestra la proporción de gastos pendientes, urgentes y pagados
- **📈 Gastos por Categoría**: Gráfico de barras que agrupa gastos por tipo (Servicios Públicos, Bancos, Educación, etc.)
- **📉 Pagos por Mes**: Gráfico de líneas que muestra la tendencia de pagos realizados a lo largo del tiempo
- **💰 Resumen Financiero**: Panel con total de deudas, pagos realizados y pendiente por pagar
- **📱 Actualización Automática**: Las estadísticas se actualizan automáticamente al agregar, editar o eliminar gastos

## 🛠️ Tecnologías Utilizadas

- **HTML5** - Estructura semántica
- **CSS3** - Material Design y responsive design
- **JavaScript ES6+** - Funcionalidad dinámica
- **Chart.js** - Gráficos interactivos y responsivos
- **LocalStorage** - Almacenamiento local de datos
- **Material Icons** - Iconografía moderna

## 📱 Compatibilidad

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Móviles (iOS Safari, Chrome Mobile)

## 🔧 Personalización

### Cambiar Colores
Edita las variables CSS en `material-design.css`:
```css
:root {
    --md-primary: #1976d2;      /* Color principal */
    --md-success: #4caf50;      /* Color de éxito */
    --md-warning: #ff9800;      /* Color de advertencia */
    --md-error: #f44336;        /* Color de error */
}
```

### Agregar Nuevos Estados
Modifica el array de estados en `script.js`:
```javascript
const estados = ["puede esperar", "urgente", "pagado", "nuevo-estado"];
```

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Si tienes preguntas o necesitas ayuda:
- Abre un issue en GitHub
- Contacta al desarrollador

## 🚀 Próximas Características

- [ ] **Notificaciones push** - Recordatorios de pagos
- [x] **Gráficos y estadísticas** - Análisis de gastos ✅
- [ ] **Categorías personalizadas** - Organización por tipo de gasto
- [ ] **Modo oscuro** - Tema nocturno
- [ ] **Aplicación móvil** - Versión nativa para Android/iOS
- [ ] **Sincronización en la nube** - Backup automático

---

**¡Gracias por usar el Administrador de Gastos!** 💰✨
