# 📊 Estadísticas y Gráficos - Documentación

## 🎯 Descripción General

La funcionalidad de **Estadísticas y Gráficos** proporciona un análisis visual completo de tus gastos y pagos, permitiéndote tomar decisiones financieras más informadas.

## 🚀 Características Implementadas

### 📈 **Estadísticas Generales**
- **Total Gastos**: Número total de gastos registrados
- **Pendientes**: Cantidad de gastos cuyo estado es "puede esperar"
- **Pagados**: Cantidad de gastos cuyo estado es "pagado"
- **Urgentes**: Cantidad de gastos cuyo estado es "urgente"

### 📊 **Gráfico de Distribución por Estado**
- **Tipo**: Gráfico circular (doughnut chart)
- **Datos mostrados**: Proporción de gastos por estado (Pendientes, Urgentes, Pagados)
- **Características**:
  - Colores diferenciados para cada estado:
    - 🔵 Azul: Pendientes (puede esperar)
    - 🔴 Rojo: Urgentes
    - 🟢 Verde: Pagados
  - Porcentajes en tooltips
  - Leyenda interactiva
  - Responsive design

### 📊 **Gráfico de Gastos por Categoría**
- **Tipo**: Gráfico de barras (bar chart)
- **Datos mostrados**: 
  - Cantidad de gastos por categoría
  - Total monetario por categoría (en miles de COP)
- **Categorías automáticas**:
  - **Servicios Públicos**: Agua, luz, gas
  - **Internet**: Servicios de internet y WiFi
  - **Bancos**: DAVIVIENDA, Bancolombia, etc.
  - **Educación**: ICETEX, universidades, colegios
  - **Vivienda**: Administración, condominios
  - **Entretenimiento**: Netflix, Spotify, streaming
  - **Otros**: Gastos no clasificados

### 📉 **Gráfico de Pagos por Mes**
- **Tipo**: Gráfico de líneas (line chart)
- **Datos mostrados**: Total pagado por mes
- **Características**:
  - Tendencia temporal de pagos
  - Área sombreada bajo la línea
  - Etiquetas de meses en español
  - Escala en miles de pesos colombianos

### 💰 **Resumen Financiero**
- **Total Deudas**: Suma de todas las deudas registradas
- **Total Pagado**: Suma de todos los pagos realizados
- **Pendiente por Pagar**: Diferencia entre deudas y pagos
- **Formato**: Moneda colombiana (COP)

## 🛠️ Implementación Técnica

### **Tecnologías Utilizadas**
- **Chart.js**: Biblioteca para gráficos interactivos
- **JavaScript ES6+**: Lógica de procesamiento de datos
- **CSS3**: Estilos y animaciones
- **HTML5**: Estructura semántica

### **Funciones Principales**

#### `actualizarEstadisticas()`
Función principal que actualiza todas las estadísticas y gráficos.

#### `actualizarEstadisticasGenerales()`
Calcula y muestra las estadísticas básicas (totales, pendientes, pagados, urgentes).

#### `actualizarGraficoEstados()`
Genera el gráfico circular de distribución por estado.

#### `actualizarGraficoCategorias()`
Genera el gráfico de barras de gastos por categoría.

#### `actualizarGraficoPagosMensuales()`
Genera el gráfico de líneas de pagos por mes.

#### `actualizarResumenFinanciero()`
Calcula y muestra el resumen financiero total.

#### `obtenerCategoriaGasto(nombre)`
Clasifica automáticamente los gastos por categoría basándose en el nombre.

### **Integración con el Sistema**
- **Actualización automática**: Las estadísticas se actualizan cada vez que se modifica un gasto
- **Persistencia**: Los datos se mantienen en LocalStorage
- **Responsive**: Los gráficos se adaptan a diferentes tamaños de pantalla

## 📱 Uso de la Funcionalidad

### **Acceso a las Estadísticas**
1. Abre la aplicación principal (`index.html`)
2. Busca la sección "Estadísticas y Gráficos"
3. Haz clic en "Mostrar Estadísticas"
4. Los gráficos y estadísticas se cargarán automáticamente

### **Interpretación de los Datos**

#### **Gráfico de Estados**
- **Pendientes**: Gastos cuyo estado es "puede esperar" (no vencen pronto)
- **Urgentes**: Gastos cuyo estado es "urgente" (vencen pronto o están vencidos)
- **Pagados**: Gastos cuyo estado es "pagado" (tienen pagos en el mes actual)

#### **Gráfico de Categorías**
- **Barras azules**: Cantidad de gastos
- **Barras rojas**: Total monetario (miles de COP)
- **Eje izquierdo**: Cantidad
- **Eje derecho**: Monto

#### **Gráfico de Pagos**
- **Línea**: Tendencia de pagos a lo largo del tiempo
- **Área sombreada**: Visualización del volumen de pagos
- **Puntos**: Pagos individuales por mes

## 🧪 Archivos de Prueba

### **test-estadisticas-graficos.html**
Archivo de prueba completo que incluye:
- Pruebas unitarias de cada función
- Datos de ejemplo para testing
- Verificación de cálculos
- Validación de gráficos

### **test-estadisticas-mejoradas.html**
Archivo de prueba específico para las estadísticas mejoradas que incluye:
- Verificación de la nueva lógica de estados
- Pruebas de estadísticas generales
- Validación del gráfico de estados
- Datos de prueba con diferentes estados

### **Cómo usar los archivos de prueba**
1. Abre `test-estadisticas-mejoradas.html` en tu navegador
2. Haz clic en "Cargar Datos de Prueba"
3. Ejecuta las diferentes pruebas
4. Verifica que todos los resultados sean correctos
5. También puedes usar `test-estadisticas-graficos.html` para pruebas más completas

## 🎨 Personalización

### **Colores de los Gráficos**
Los colores se pueden personalizar modificando las configuraciones de Chart.js:

```javascript
backgroundColor: [
    '#FF6384',  // Rojo
    '#36A2EB',  // Azul
    '#FFCE56',  // Amarillo
    '#4BC0C0'   // Verde
]
```

### **Categorías Personalizadas**
Para agregar nuevas categorías, modifica la función `obtenerCategoriaGasto()`:

```javascript
if (nombreLower.includes('nueva_categoria')) {
    return 'Nueva Categoría';
}
```

### **Estilos CSS**
Los estilos se encuentran en `styles.css` en la sección de estadísticas:

```css
.stats-card { /* Estilos de la tarjeta principal */ }
.stat-card { /* Estilos de las tarjetas individuales */ }
.chart-card { /* Estilos de los contenedores de gráficos */ }
```

## 🔧 Solución de Problemas

### **Gráficos no se muestran**
1. Verifica que Chart.js esté cargado correctamente
2. Revisa la consola del navegador para errores
3. Asegúrate de que hay datos en LocalStorage

### **Estadísticas no se actualizan**
1. Verifica que la función `mostrarGastos()` esté siendo llamada
2. Revisa que el elemento `statsContent` exista en el DOM
3. Confirma que las funciones de estadísticas estén definidas

### **Rendimiento lento**
1. Los gráficos se regeneran completamente cada vez
2. Para mejor rendimiento, considera actualizar solo los datos necesarios
3. En dispositivos móviles, los gráficos pueden tardar más en cargar

## 📈 Mejoras Futuras

### **Funcionalidades Planificadas**
- [ ] **Exportar gráficos**: Descargar gráficos como imágenes
- [ ] **Filtros temporales**: Ver estadísticas por período específico
- [ ] **Comparativas**: Comparar meses o años
- [ ] **Predicciones**: Análisis predictivo de gastos futuros
- [ ] **Alertas visuales**: Notificaciones en gráficos para gastos urgentes

### **Optimizaciones Técnicas**
- [ ] **Lazy loading**: Cargar gráficos solo cuando sean visibles
- [ ] **Caché de datos**: Almacenar cálculos para mejorar rendimiento
- [ ] **Web Workers**: Procesar datos en segundo plano
- [ ] **Compresión**: Optimizar el tamaño de los gráficos

## 📞 Soporte

Si encuentras problemas con las estadísticas y gráficos:

1. **Revisa la consola del navegador** para errores JavaScript
2. **Verifica que Chart.js esté cargado** en la página
3. **Prueba con datos de ejemplo** usando el archivo de test
4. **Reporta el problema** con detalles específicos

---

**¡Disfruta analizando tus finanzas con estas poderosas herramientas visuales!** 📊✨
