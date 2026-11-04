. "$PSScriptRoot/env.ps1"
Push-Location (Join-Path $projectRoot 'frontend')
try {
    npm ci
    if ($LASTEXITCODE) { throw 'npm ci falhou' }
    npm run lint
    if ($LASTEXITCODE) { throw 'Lint falhou' }
    npm test
    if ($LASTEXITCODE) { throw 'Testes de frontend falharam' }
    npm run build
    if ($LASTEXITCODE) { throw 'Build do frontend falhou' }
} finally { Pop-Location }
Push-Location (Join-Path $projectRoot 'backend')
try {
    & ./mvnw.cmd -B clean verify
    if ($LASTEXITCODE) { throw 'Verificação do backend falhou' }
} finally { Pop-Location }
Write-Host 'Build validado: backend/target/pife-1.0.0.jar'
