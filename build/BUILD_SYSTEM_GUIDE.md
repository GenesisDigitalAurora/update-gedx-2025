# Sistema de Build GEDX - Guía Completa

## 🚀 Características del Sistema de Build

El sistema de build de GEDX ha sido actualizado con las siguientes características avanzadas:

### ✅ Funcionalidades Implementadas:

1. **Minificación de CSS y JavaScript**
   - Eliminación de comentarios y espacios innecesarios
   - Optimización del código para producción

2. **Generación de Hashes (Cache Busting)**
   - Cada archivo minificado incluye un hash único de 8 caracteres
   - Garantiza que los navegadores siempre carguen la versión más reciente
   - Formato: `archivo.hash.min.extensión`

3. **Actualización Automática de Referencias HTML**
   - Comenta automáticamente las referencias de desarrollo
   - Inserta las nuevas referencias con hash
   - Funciona en todos los archivos HTML del proyecto

4. **Archivo de Mapeo**
   - Genera `dist/build-map.txt` con la correspondencia de archivos
   - Incluye timestamp de la generación

## 📋 Uso del Sistema de Build

### Comandos Disponibles:

```powershell
# Minificar todos los archivos (CSS y JS)
.\build\minify.ps1

# Solo minificar archivos CSS
.\build\minify.ps1 -type css

# Solo minificar archivos JavaScript
.\build\minify.ps1 -type js

# Minificar sin actualizar HTML
.\build\minify.ps1 -updateHtml:$false
```

### Ejemplo de Salida:

```
=== GEDX BUILD SYSTEM ===
Minificando y generando hashes...
CSS: components.css -> components.55149caa.min.css
CSS: global.css -> global.41cd9837.min.css
CSS: reset.css -> reset.66c547e1.min.css
JS: main.js -> main.bcdd38ac.min.js

Actualizando referencias en HTML...
HTML actualizado: index.html
HTML actualizado: privacidad.html
HTML actualizado: terminos.html

=== BUILD COMPLETADO ===
```

## 📁 Estructura de Archivos

### Antes del Build:
```
gedx-upgrade-2025/
├── css/
│   ├── components.css
│   ├── global.css
│   └── reset.css
├── js/
│   └── main.js
├── index.html
├── privacidad.html
└── terminos.html
```

### Después del Build:
```
gedx-upgrade-2025/
├── css/          # Archivos originales (desarrollo)
├── js/           # Archivos originales (desarrollo)
├── dist/         # Archivos minificados (producción)
│   ├── components.55149caa.min.css
│   ├── global.41cd9837.min.css
│   ├── reset.66c547e1.min.css
│   ├── main.bcdd38ac.min.js
│   └── build-map.txt
├── index.html    # HTML actualizado con referencias
├── privacidad.html
└── terminos.html
```

## 🔄 Cómo Funciona el Sistema de Referencias

### En el HTML (después del build):

**Para CSS:**
```html
<!-- DESARROLLO: <link rel="stylesheet" href="css/components.css"> -->
<link rel="stylesheet" href="dist/components.55149caa.min.css">
```

**Para JavaScript:**
```html
<!-- DESARROLLO: <script src="js/main.js"></script> -->
<script src="dist/main.bcdd38ac.min.js"></script>
```

### Para cambiar entre versiones:

1. **Usar versión de DESARROLLO:**
   - Descomenta las líneas marcadas como `<!-- DESARROLLO: ... -->`
   - Comenta las líneas con hash

2. **Usar versión de PRODUCCIÓN:**
   - Mantén activas las líneas con hash
   - Mantén comentadas las líneas de desarrollo

## 🎯 Ventajas del Sistema

### 1. **Cache Busting Automático**
- Los navegadores detectan automáticamente los cambios
- No hay problemas de caché con archivos antiguos
- Cada cambio genera un hash único

### 2. **Optimización de Rendimiento**
- Archivos minificados ~40-60% más pequeños
- Menor tiempo de carga
- Mejor experiencia de usuario

### 3. **Fácil Desarrollo**
- Archivos originales permanecen intactos
- Fácil debugging en desarrollo
- Transición sencilla entre desarrollo y producción

### 4. **Automatización Completa**
- Un solo comando actualiza todo
- No hay que modificar manualmente las referencias
- Reduce errores humanos

## 🔧 Configuración y Personalización

### Modificar el Script:

1. **Cambiar longitud del hash:**
   ```powershell
   # En la función Get-FileHash-Short
   return $hash.Hash.Substring(0, 8).ToLower()  # Cambiar 8 por el número deseado
   ```

2. **Agregar más tipos de archivo:**
   ```powershell
   # Agregar nuevas extensiones en las condiciones
   if ($original -like "*.scss") {
       # Lógica para SCSS
   }
   ```

3. **Modificar la ubicación de salida:**
   ```powershell
   # Cambiar "dist" por la carpeta deseada
   $finalPath = "assets/$($_.BaseName).$hash.min.css"
   ```

## 🚦 Flujo de Trabajo Recomendado

### Desarrollo:
1. Trabaja con archivos originales (css/, js/)
2. Usa las referencias comentadas como `<!-- DESARROLLO: ... -->`
3. Ejecuta el build solo cuando necesites probar la versión optimizada

### Producción:
1. Ejecuta `.\build\minify.ps1` antes del deploy
2. Usa las referencias con hash para máximo rendimiento
3. Sube la carpeta `dist/` junto con el resto del proyecto

### Actualización de Archivos:
1. Modifica archivos originales (css/, js/)
2. Ejecuta nuevamente el build
3. Los hashes se actualizan automáticamente
4. Las referencias HTML se actualizan automáticamente

## 📊 Beneficios Medibles

- **Reducción de tamaño:** 40-60% menor tamaño de archivos
- **Velocidad de carga:** Mejora significativa en PageSpeed
- **SEO:** Mejor ranking por velocidad del sitio
- **Experiencia de usuario:** Carga más rápida y fluida

## 🔍 Troubleshooting

### Problemas Comunes:

1. **Error "Token inesperado":**
   - Verifica que no haya caracteres especiales en las rutas
   - Ejecuta desde la raíz del proyecto

2. **HTML no se actualiza:**
   - Verifica que las referencias originales estén en el formato correcto
   - Revisa que los archivos HTML tengan permisos de escritura

3. **Archivos no se miniifican:**
   - Verifica que las carpetas `css/` y `js/` existan
   - Comprueba que los archivos tengan las extensiones correctas

### Logs y Debugging:

El script proporciona output detallado para diagnosticar problemas:
- Archivos procesados
- Hashes generados
- Archivos HTML actualizados
- Errores encontrados

## 🎉 Resultado Final

Con este sistema, el sitio web de GEDX tiene:

- ✅ **Cacheo inteligente** con hashes únicos
- ✅ **Optimización automática** de recursos
- ✅ **Fácil alternancia** entre desarrollo y producción  
- ✅ **Build reproducible** y automatizado
- ✅ **Mejor rendimiento** en navegadores
- ✅ **SEO mejorado** por velocidad de carga

El sistema está listo para ser usado en producción y garantiza que siempre se cargue la versión más reciente de los archivos CSS y JavaScript. 