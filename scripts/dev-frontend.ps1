$projectRoot = Split-Path $PSScriptRoot -Parent
Push-Location (Join-Path $projectRoot 'frontend')
try { npm run dev; if ($LASTEXITCODE) { throw 'Frontend falhou.' } } finally { Pop-Location }
