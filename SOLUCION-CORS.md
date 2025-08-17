# 🔧 Solución para Errores de CORS y PWA

## ❌ **Problemas Detectados**

1. **CORS Policy Error**: No se pueden cargar recursos externos desde `file://`
2. **Service Worker Error**: No funciona con protocolo `file://`
3. **Origin 'null'**: El navegador bloquea funcionalidades avanzadas

## ✅ **Soluciones Disponibles**

### **Opción 1: Servidor Local con Node.js (RECOMENDADO)**

#### Paso 1: Verificar Node.js
```bash
node --version
```
Si no tienes Node.js, descárgalo de: https://nodejs.org/

#### Paso 2: Iniciar el servidor
```bash
# En la carpeta del proyecto
node server.js
```

#### Paso 3: Acceder a la aplicación
Abre tu navegador y ve a: `http://localhost:8000`

### **Opción 2: Servidor Local con PowerShell**

#### Paso 1: Ejecutar el script
```bash
# Doble clic en start-server.bat
# O ejecutar en PowerShell:
.\start-server.bat
```

#### Paso 2: Acceder a la aplicación
Abre tu navegador y ve a: `http://localhost:8000`

### **Opción 3: Extensiones de Navegador (TEMPORAL)**

#### Para Chrome:
1. Instala la extensión "Web Server for Chrome"
2. Configura la carpeta del proyecto
3. Accede a la URL proporcionada

#### Para Firefox:
1. Instala la extensión "Web Server"
2. Configura la carpeta del proyecto
3. Accede a la URL proporcionada

## 🚀 **Verificación de PWA**

Una vez que tengas el servidor funcionando:

### 1. **Verificar en DevTools**
- Presiona **F12**
- Ve a **Application** → **Manifest**
- Debe mostrar la configuración sin errores

### 2. **Verificar Service Worker**
- **F12** → **Application** → **Service Workers**
- Debe mostrar "Registered and active"

### 3. **Buscar el Icono de Instalación**
- En Chrome: Busca el icono de instalación en la barra de direcciones
- En móviles: Aparecerá un banner de instalación

## 📱 **Generar Iconos (OBLIGATORIO)**

### Paso 1: Abrir el generador
```bash
# Con el servidor funcionando, abre:
http://localhost:8000/generate-icons.html
```

### Paso 2: Descargar iconos
1. Haz clic en "Descargar Todos"
2. Guarda todos los archivos PNG en la carpeta `icons/`

### Paso 3: Verificar archivos
Asegúrate de tener estos archivos:
- `icons/icon-72x72.png`
- `icons/icon-96x96.png`
- `icons/icon-128x128.png`
- `icons/icon-144x144.png`
- `icons/icon-152x152.png`
- `icons/icon-192x192.png`
- `icons/icon-384x384.png`
- `icons/icon-512x512.png`

## 🔍 **Troubleshooting**

### Si el servidor no inicia:
```bash
# Verificar si el puerto está ocupado
netstat -an | findstr :8000

# Usar otro puerto (editar server.js)
const PORT = 8080;
```

### Si los iconos no aparecen:
1. Verifica que los archivos PNG existan
2. Recarga la página con Ctrl+F5
3. Limpia el cache del navegador

### Si la PWA no se instala:
1. Verifica que estés usando HTTPS o localhost
2. Asegúrate de que el manifest.json sea válido
3. Verifica que el Service Worker esté registrado

## 📞 **Soporte**

Si sigues teniendo problemas:
1. Revisa la consola del navegador (F12)
2. Verifica que todos los archivos estén en su lugar
3. Asegúrate de usar un servidor HTTP (no file://)
