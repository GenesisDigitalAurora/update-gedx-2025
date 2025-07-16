# Script para minificar archivos CSS y JavaScript con hashes para cache busting
param(
    [string]$type = "all", # Puede ser "css", "js" o "all"
    [switch]$updateHtml = $true, # Actualizar referencias en HTML
    [switch]$deploy = $false, # Deploy automático a S3
    [string]$bucket = "gedx-website", # Nombre del bucket S3
    [string]$distributionId = "E3LASA40ZAKI67" # ID de distribución CloudFront
)

# Configurar codificación UTF-8 para PowerShell
$PSDefaultParameterValues['Out-File:Encoding'] = 'utf8'
$PSDefaultParameterValues['*:Encoding'] = 'utf8'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::InputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# Función para generar hash de un archivo
function Get-FileHash-Short {
    param([string]$filePath)
    
    $hash = Get-FileHash -Path $filePath -Algorithm SHA256
    return $hash.Hash.Substring(0, 8).ToLower()
}

# Función para minificar CSS
function Minify-CSS {
    param([string]$inputFile)
    
    $content = Get-Content $inputFile -Raw -Encoding UTF8
    # Eliminar comentarios
    $content = $content -replace '/\*[\s\S]*?\*/', ''
    # Eliminar espacios en blanco innecesarios
    $content = $content -replace '\s+', ' '
    # Eliminar espacios antes y después de llaves y punto y coma
    $content = $content -replace '\s*{\s*', '{'
    $content = $content -replace '\s*}\s*', '}'
    $content = $content -replace '\s*;\s*', ';'
    $content = $content -replace '\s*:\s*', ':'
    $content = $content -replace '\s*,\s*', ','
    
    return $content.Trim()
}

# Función para minificar JavaScript (conservadora)
function Minify-JS {
    param([string]$inputFile)
    
    $content = Get-Content $inputFile -Raw -Encoding UTF8
    
    # Eliminar comentarios multilinea (solo los que no están dentro de strings)
    $content = $content -replace '/\*[\s\S]*?\*/', ''
    
    # Eliminar comentarios de una línea pero preservar código después de //
    # Solo eliminar si // está al principio de la línea (comentarios reales)
    $content = $content -replace '(?m)^\s*//.*$', ''
    
    # Eliminar múltiples espacios en blanco pero preservar estructura
    $content = $content -replace '[ \t]+', ' '
    
    # Eliminar espacios innecesarios alrededor de algunos operadores (conservador)
    $content = $content -replace '\s*([{}();,])\s*', '$1'
    
    # Eliminar líneas vacías
    $content = $content -replace '(?m)^\s*$\r?\n?', ''
    
    # Eliminar espacios al inicio y final de líneas
    $content = $content -replace '(?m)^\s+', ''
    $content = $content -replace '(?m)\s+$', ''
    
    return $content.Trim()
}

# Función para actualizar referencias en HTML
function Update-HtmlReferences {
    param(
        [hashtable]$fileMap,
        [string]$htmlFile
    )
    
    if (-not (Test-Path $htmlFile)) {
        Write-Warning "Archivo HTML no encontrado: $htmlFile"
        return
    }
    
    $content = Get-Content $htmlFile -Raw -Encoding UTF8
    $originalContent = $content
    
    # PASO 1: Limpiar todas las referencias anteriores a archivos minificados
    Write-Host "Limpiando referencias anteriores en $htmlFile..." -ForegroundColor Yellow
    
    # Eliminar líneas de CSS minificados anteriores (dist/*.hash.min.css)
    $content = $content -replace '    <link rel="stylesheet" href="dist/[^"]*\.min\.css">\r?\n?', ''
    
    # Eliminar líneas de JS minificados anteriores (dist/*.hash.min.js)
    $content = $content -replace '    <script src="dist/[^"]*\.min\.js"></script>\r?\n?', ''
    
    # Eliminar comentarios de producción anteriores
    $content = $content -replace '    <!-- PRODUCCION [^>]*-->\r?\n?', ''
    
    # PASO 2: Restaurar referencias de desarrollo si están comentadas
    # Restaurar CSS de desarrollo
    $content = $content -replace '    <!-- DESARROLLO: (<link rel="stylesheet" href="css/[^"]*\.css">) -->', '    $1'
    
    # Restaurar JS de desarrollo  
    $content = $content -replace '    <!-- DESARROLLO: (<script src="js/[^"]*\.js"></script>) -->', '    $1'
    
    # PASO 3: Comentar las referencias de desarrollo y agregar las nuevas minificadas
    foreach ($original in $fileMap.Keys) {
        $hashed = $fileMap[$original]
        
        if ($original -like "*.css") {
            # Buscar la línea del CSS original y comentarla
            $originalPath = $original.Replace('\', '/')
            $ltChar = [char]60  # Caracter '<'
            $gtChar = [char]62  # Caracter '>'
            $pattern = "${ltChar}link rel=""stylesheet"" href=""$originalPath""${gtChar}"
            $commentedOriginal = "    ${ltChar}!-- DESARROLLO: $pattern --${gtChar}"
            $hashedPath = $hashed.Replace('\', '/')
            $newHashed = "    ${ltChar}link rel=""stylesheet"" href=""$hashedPath""${gtChar}"
            
            if ($content -match [regex]::Escape($pattern)) {
                $content = $content -replace [regex]::Escape($pattern), "$commentedOriginal`n$newHashed"
                Write-Host "  ✓ CSS actualizado: $original -> $hashedPath" -ForegroundColor Green
            } else {
                Write-Host "  ⚠ CSS no encontrado: $pattern" -ForegroundColor Yellow
            }
        }
        
        if ($original -like "*.js") {
            # Buscar la línea del JS original y comentarla
            $originalPath = $original.Replace('\', '/')
            $ltChar = [char]60  # Caracter '<'
            $gtChar = [char]62  # Caracter '>'
            $pattern = "${ltChar}script src=""$originalPath""${gtChar}${ltChar}/script${gtChar}"
            $commentedOriginal = "    ${ltChar}!-- DESARROLLO: $pattern --${gtChar}"
            $hashedPath = $hashed.Replace('\', '/')
            $newHashed = "    ${ltChar}script src=""$hashedPath""${gtChar}${ltChar}/script${gtChar}"
            
            if ($content -match [regex]::Escape($pattern)) {
                $content = $content -replace [regex]::Escape($pattern), "$commentedOriginal`n$newHashed"
                Write-Host "  ✓ JS actualizado: $original -> $hashedPath" -ForegroundColor Green
            } else {
                Write-Host "  ⚠ JS no encontrado: $pattern" -ForegroundColor Yellow
                Write-Host "  Debug: Buscando en contenido..." -ForegroundColor Gray
                if ($content -match "js/main\.js") {
                    Write-Host "  Debug: Encontrado referencia a main.js en el contenido" -ForegroundColor Gray
                }
            }
        }
    }
    
    # Solo escribir si hay cambios
    if ($content -ne $originalContent) {
        Set-Content -Path $htmlFile -Value $content -Encoding UTF8
        Write-Host "HTML actualizado: $htmlFile (referencias anteriores eliminadas)" -ForegroundColor Green
    } else {
        Write-Host "HTML sin cambios: $htmlFile" -ForegroundColor Gray
    }
}

# Crear directorio dist si no existe
if (-not (Test-Path "dist")) {
    New-Item -ItemType Directory -Path "dist"
}

# Limpiar archivos anteriores de dist
Get-ChildItem "dist" -Filter "*.min.*" | Remove-Item -Force

# Hashtable para mapear archivos originales a archivos con hash
$fileMap = @{}

Write-Host "=== GEDX BUILD SYSTEM ===" -ForegroundColor Cyan
Write-Host "Minificando y generando hashes..." -ForegroundColor Yellow

# Procesar archivos CSS
if ($type -eq "css" -or $type -eq "all") {
    if (Test-Path "css") {
        Get-ChildItem "css" -Filter "*.css" | ForEach-Object {
            $minified = Minify-CSS $_.FullName
            $tempPath = "dist/$($_.BaseName).temp.css"
            Set-Content -Path $tempPath -Value $minified -Encoding UTF8
            
            # Generar hash del archivo minificado
            $hash = Get-FileHash-Short $tempPath
            $finalPath = "dist/$($_.BaseName).$hash.min.css"
            
            # Renombrar archivo con hash
            Move-Item $tempPath $finalPath
            
            # Agregar al mapa de archivos
            $fileMap["css/$($_.Name)"] = $finalPath
            
            Write-Host "CSS: $($_.Name) -> $($_.BaseName).$hash.min.css" -ForegroundColor Green
        }
    }
}

# Procesar archivos JavaScript
if ($type -eq "js" -or $type -eq "all") {
    if (Test-Path "js") {
        Get-ChildItem "js" -Filter "*.js" | ForEach-Object {
            $minified = Minify-JS $_.FullName
            $tempPath = "dist/$($_.BaseName).temp.js"
            Set-Content -Path $tempPath -Value $minified -Encoding UTF8
            
            # Generar hash del archivo minificado
            $hash = Get-FileHash-Short $tempPath
            $finalPath = "dist/$($_.BaseName).$hash.min.js"
            
            # Renombrar archivo con hash
            Move-Item $tempPath $finalPath
            
            # Agregar al mapa de archivos
            $fileMap["js/$($_.Name)"] = $finalPath
            
            Write-Host "JS: $($_.Name) -> $($_.BaseName).$hash.min.js" -ForegroundColor Green
        }
    }
}

# Actualizar referencias en archivos HTML
if ($updateHtml -and $fileMap.Count -gt 0) {
    Write-Host "`nActualizando referencias en HTML..." -ForegroundColor Yellow
    
    # Buscar todos los archivos HTML
    $htmlFiles = @("index.html", "privacidad.html", "terminos.html")
    
    foreach ($htmlFile in $htmlFiles) {
        if (Test-Path $htmlFile) {
            Update-HtmlReferences -fileMap $fileMap -htmlFile $htmlFile
        }
    }
    
    # Buscar archivos HTML en subdirectorios
    if (Test-Path "en") {
        Get-ChildItem "en" -Filter "*.html" | ForEach-Object {
            Update-HtmlReferences -fileMap $fileMap -htmlFile $_.FullName
        }
    }
}

# Generar archivo de mapeo para referencia
$mapContent = "# GEDX Build Map - " + (Get-Date -Format "yyyy-MM-dd HH:mm:ss") + "`n"
$mapContent += "# Mapeo de archivos originales a archivos con hash`n`n"

foreach ($original in $fileMap.Keys) {
    $hashed = $fileMap[$original]
    $mapContent += "$original -> $hashed`n"
}

Set-Content -Path "dist/build-map.txt" -Value $mapContent -Encoding UTF8

Write-Host "`n=== BUILD COMPLETADO ===" -ForegroundColor Cyan
Write-Host "Archivos generados en: dist/" -ForegroundColor Green
Write-Host "Mapa de archivos: dist/build-map.txt" -ForegroundColor Green

if ($updateHtml) {
    Write-Output "`nNOTA: Las referencias HTML han sido actualizadas automaticamente."
    Write-Output "Para usar en PRODUCCION: Descomenta las lineas con hash"
    Write-Output "Para usar en DESARROLLO: Usa las lineas originales"
}

Write-Output "`nEjecuta nuevamente el build cuando modifiques CSS/JS"

# ------------------------------------------
# FUNCIÓN DE DEPLOY A AWS S3
# ------------------------------------------
function Deploy-ToS3 {
    param(
        [string]$bucketName = "gedx-website",
        [string]$cloudfrontDistributionId = "E3LASA40ZAKI67"
    )
    
    Write-Output "`n=== INICIANDO DEPLOY A AWS S3 ==="
    
    # Verificar si AWS CLI está disponible
    try {
        aws --version | Out-Null
    } catch {
        Write-Error "AWS CLI no esta instalado o configurado. Por favor instala AWS CLI y configura tus credenciales."
        return
    }
    
    # Crear directorio temporal para el deploy
    $deployDir = "temp-deploy"
    if (Test-Path $deployDir) {
        Remove-Item $deployDir -Recurse -Force
    }
    New-Item -ItemType Directory -Path $deployDir | Out-Null
    
    Write-Output "Preparando archivos para produccion..."
    
    # Archivos HTML (usar versiones con referencias minificadas)
    Copy-Item "index.html" "$deployDir/" -Force
    Copy-Item "privacidad.html" "$deployDir/" -Force
    Copy-Item "terminos.html" "$deployDir/" -Force
    
    # Copiar carpeta EN si existe
    if (Test-Path "en") {
        Copy-Item "en" "$deployDir/" -Recurse -Force
    }
    
    # Copiar recursos estáticos necesarios
    Copy-Item "images" "$deployDir/" -Recurse -Force
    Copy-Item "dist" "$deployDir/" -Recurse -Force
    
    # Copiar imágenes de la raíz (png, jpg, jpeg, svg, ico, webp)
    $rootImages = Get-ChildItem -Path "." -File | Where-Object { $_.Extension -match '\.(png|jpg|jpeg|svg|ico|webp)$' }
    if ($rootImages.Count -gt 0) {
        Write-Output "Copiando imagenes de la raiz: $($rootImages.Count) archivos"
        foreach ($img in $rootImages) {
            Copy-Item $img.FullName "$deployDir/" -Force
            Write-Output "  • $($img.Name)"
        }
    }
    
    # Copiar archivos CSS y JS originales (por si se necesitan para debugging)
    New-Item -ItemType Directory -Path "$deployDir/css" -Force | Out-Null
    New-Item -ItemType Directory -Path "$deployDir/js" -Force | Out-Null
    Copy-Item "css/*" "$deployDir/css/" -Force
    Copy-Item "js/*" "$deployDir/js/" -Force
    
    Write-Output "Archivos preparados en: $deployDir"
    
    # Mostrar resumen de archivos a subir
    $fileCount = (Get-ChildItem $deployDir -Recurse -File | Measure-Object).Count
    Write-Output "Total de archivos a subir: $fileCount"
    
    # Limpiar S3
    Write-Output "`nLimpiando contenido actual del bucket S3..."
    try {
        aws s3 rm "s3://$bucketName" --recursive
        Write-Output "Bucket limpiado exitosamente"
    } catch {
        Write-Error "Error al limpiar el bucket S3: $_"
        return
    }
    
    # Subir archivos con configuraciones específicas
    Write-Output "`nSubiendo archivos a S3..."
    
    # Subir archivos HTML con cache corto
    Write-Output "Subiendo archivos HTML..."
    aws s3 sync "$deployDir" "s3://$bucketName" --exclude "*" --include "*.html" --cache-control "max-age=300" --content-type "text/html; charset=utf-8"
    
    # Subir archivos minificados con cache largo
    Write-Output "Subiendo archivos minificados (cache largo)..."
    aws s3 sync "$deployDir/dist" "s3://$bucketName/dist" --cache-control "max-age=31536000" --expires "2026-12-31T23:59:59Z"
    
    # Subir imágenes con cache largo
    Write-Output "Subiendo imagenes de la carpeta images..."
    aws s3 sync "$deployDir/images" "s3://$bucketName/images" --cache-control "max-age=2592000"
    
    # Subir imágenes de la raíz con cache largo
    $rootImageFiles = Get-ChildItem "$deployDir" -File | Where-Object { $_.Extension -match '\.(png|jpg|jpeg|svg|ico|webp)$' }
    if ($rootImageFiles.Count -gt 0) {
        Write-Output "Subiendo imagenes de la raiz..."
        foreach ($img in $rootImageFiles) {
            aws s3 cp "$($img.FullName)" "s3://$bucketName/$($img.Name)" --cache-control "max-age=2592000"
            Write-Output "  • $($img.Name) subido"
        }
    }
    
    # Subir CSS y JS originales con cache medio
    Write-Output "Subiendo CSS/JS originales..."
    aws s3 sync "$deployDir/css" "s3://$bucketName/css" --cache-control "max-age=86400"
    aws s3 sync "$deployDir/js" "s3://$bucketName/js" --cache-control "max-age=86400"
    
    # Subir carpeta EN si existe
    if (Test-Path "$deployDir/en") {
        Write-Output "Subiendo version en ingles..."
        aws s3 sync "$deployDir/en" "s3://$bucketName/en" --cache-control "max-age=300" --content-type "text/html; charset=utf-8"
    }
    
    # Invalidar CloudFront
    if ($cloudfrontDistributionId) {
        Write-Output "`nIniciando invalidacion en CloudFront..."
        try {
            $invalidation = aws cloudfront create-invalidation --distribution-id $cloudfrontDistributionId --paths "/*" | ConvertFrom-Json
            Write-Output "Invalidacion iniciada con ID: $($invalidation.Invalidation.Id)"
        } catch {
            Write-Warning "Error al crear invalidacion en CloudFront: $_"
        }
    }
    
    # Limpiar directorio temporal
    Write-Output "`nLimpiando archivos temporales..."
    Remove-Item $deployDir -Recurse -Force
    
    Write-Output "`n=== DEPLOY COMPLETADO EXITOSAMENTE ==="
    Write-Output "El sitio web esta disponible en: https://$bucketName"
    
    # Mostrar estadísticas del deploy
    Write-Output "`nEstadisticas del deploy:"
    Write-Output "• Archivos HTML: Con cache corto (5 minutos)"
    Write-Output "• Archivos minificados: Con cache largo (1 año)"
    Write-Output "• Imagenes (carpeta images): Con cache medio (30 dias)"
    Write-Output "• Imagenes (raiz): Con cache medio (30 dias)"
    Write-Output "• CSS/JS originales: Con cache diario"
    if ($cloudfrontDistributionId) {
        Write-Output "• CloudFront: Invalidacion iniciada"
    }
}

# Si se solicita deploy, ejecutar después del build
if ($deploy) {
    Deploy-ToS3 -bucketName $bucket -cloudfrontDistributionId $distributionId
}