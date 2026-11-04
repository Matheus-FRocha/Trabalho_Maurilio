. "$PSScriptRoot/env.ps1"
Push-Location (Join-Path $projectRoot 'backend')
try { & ./mvnw.cmd spring-boot:run; if ($LASTEXITCODE) { throw 'Backend falhou.' } } finally { Pop-Location }
