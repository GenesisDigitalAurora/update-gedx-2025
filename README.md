# GEDX Website 2025

Sitio estático de Genesis Digital (GEDX) para 2025. Incluye sistema de build con minificación y cache busting, y guía para configurar Google reCAPTCHA en el formulario de contacto.

## Contenido
- Páginas: `index.html`, `privacidad.html`, `terminos.html` (+ opcional carpeta `en/`)
- Estilos: `css/`
- Scripts: `js/`
- Imágenes: `images/`
- Build: `build/minify.ps1` (genera `dist/` con archivos minificados y versionados)

## Requisitos
- Windows con PowerShell 5.1+ (o PowerShell 7)
- Opcional para deploy: AWS CLI configurado (credenciales y permisos), bucket S3 y distribución CloudFront

## Uso en desarrollo
- Abre `index.html` directamente en el navegador o sirve la carpeta del proyecto con un servidor estático.
- En desarrollo se referencian los archivos sin minificar (`css/*.css`, `js/main.js`).

## Build para producción
El script minifica CSS/JS, genera hashes (cache busting), y actualiza las referencias en los HTML.

```powershell
# Desde la raíz del proyecto
.\build\minify.ps1               # Minificar CSS y JS y actualizar HTML
.\build\minify.ps1 -type css     # Solo CSS
.\build\minify.ps1 -type js      # Solo JS
.\build\minify.ps1 -updateHtml:$false  # No tocar HTML
```

Salida principal:
- Archivos minificados en `dist/` con nombre `archivo.<hash>.min.ext`
- `dist/build-map.txt` con el mapeo original → minificado
- HTMLs actualizados comentando referencias de desarrollo e insertando las con hash

Más detalles en `build/BUILD_SYSTEM_GUIDE.md` (flujo, troubleshooting y personalización).

## Cambiar entre desarrollo y producción
- Producción: usa las referencias con hash agregadas por el script.
- Desarrollo: descomenta las líneas marcadas como `<!-- DESARROLLO: ... -->` y comenta las líneas con `dist/*.min.*` (ver guía en `build/BUILD_SYSTEM_GUIDE.md`).

## Deploy opcional a AWS S3 + CloudFront
El script incluye una rutina de deploy (sync a S3, políticas de caché y invalidación de CloudFront).

```powershell
.\build\minify.ps1 -deploy -bucket "NOMBRE-DE-TU-BUCKET" -distributionId "ID_DISTRIBUCION"
```

- Sube HTML con caché corto, minificados con caché largo, e imágenes con caché medio.
- Requiere AWS CLI instalado y configurado.

## reCAPTCHA (Contacto)
El sitio integra Google reCAPTCHA v2 en el formulario de contacto. Debes colocar tu Site Key en `index.html` donde se indica.

Consulta la guía completa en `CONFIGURACION_RECAPTCHA.md` (pasos, backend, estilos, y ubicación exacta del widget y scripts).

## Estructura rápida
```
├─ build/                # Script de build y guía
├─ css/                  # Estilos (desarrollo)
├─ js/                   # Scripts (desarrollo)
├─ images/               # Recursos estáticos
├─ dist/                 # Salida minificada (se genera tras el build)
├─ index.html
├─ privacidad.html
├─ terminos.html
└─ en/                   # (opcional) versión en inglés
```

## Notas
- Tras modificar CSS/JS, ejecuta el build de nuevo para actualizar hashes y referencias.
- Puedes versionar `dist/` si tu flujo de despliegue lo requiere.
- Revisa la guía de build para resolver problemas comunes.
