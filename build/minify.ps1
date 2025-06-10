# Script para minificar archivos CSS y JavaScript
param(
    [string]$type = "all" # Puede ser "css", "js" o "all"
)

# Función para minificar CSS
function Minify-CSS {
    param([string]$inputFile)
    
    $content = Get-Content $inputFile -Raw
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

# Función para minificar JavaScript
function Minify-JS {
    param([string]$inputFile)
    
    $content = Get-Content $inputFile -Raw
    # Eliminar comentarios de una línea
    $content = $content -replace '//.*$', ''
    # Eliminar comentarios multilinea
    $content = $content -replace '/\*[\s\S]*?\*/', ''
    # Eliminar espacios en blanco innecesarios
    $content = $content -replace '\s+', ' '
    # Eliminar espacios antes y después de operadores
    $content = $content -replace '\s*([=+\-*/%&|^<>!?:])\s*', '$1'
    # Eliminar espacios antes y después de punto y coma
    $content = $content -replace '\s*;\s*', ';'
    
    return $content.Trim()
}

# Crear directorio dist si no existe
if (-not (Test-Path "dist")) {
    New-Item -ItemType Directory -Path "dist"
}

# Procesar archivos CSS
if ($type -eq "css" -or $type -eq "all") {
    if (Test-Path "css") {
        Get-ChildItem "css" -Filter "*.css" | ForEach-Object {
            $minified = Minify-CSS $_.FullName
            $outputPath = "dist/$($_.BaseName).min.css"
            Set-Content -Path $outputPath -Value $minified
            Write-Host "CSS minificado: $outputPath"
        }
    }
}

# Procesar archivos JavaScript
if ($type -eq "js" -or $type -eq "all") {
    if (Test-Path "js") {
        Get-ChildItem "js" -Filter "*.js" | ForEach-Object {
            $minified = Minify-JS $_.FullName
            $outputPath = "dist/$($_.BaseName).min.js"
            Set-Content -Path $outputPath -Value $minified
            Write-Host "JavaScript minificado: $outputPath"
        }
    }
} 