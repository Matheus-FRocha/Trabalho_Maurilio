. "$PSScriptRoot/env.ps1"
$jar = Join-Path $projectRoot 'backend/target/pife-1.0.0.jar'
if (-not (Test-Path -LiteralPath $jar)) { throw 'Execute scripts/build.ps1 primeiro.' }
Push-Location $projectRoot
try { & java -jar $jar; if ($LASTEXITCODE) { throw 'Servidor encerrou com erro.' } } finally { Pop-Location }
