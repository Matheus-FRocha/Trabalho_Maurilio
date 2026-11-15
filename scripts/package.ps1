param([switch]$ForForms)

. "$PSScriptRoot/env.ps1"
$jarName = if ($ForForms) { 'pife-1.0.0.jar.original' } else { 'pife-1.0.0.jar' }
$jar = Join-Path $projectRoot "backend/target/$jarName"
if (-not (Test-Path -LiteralPath $jar)) { throw 'Execute scripts/build.ps1 primeiro.' }
Push-Location $projectRoot
try {
    $destination = Join-Path $projectRoot 'output/entrega'
    New-Item -ItemType Directory -Force $destination | Out-Null
    $sourceZip = Join-Path $destination 'pife-fontes.zip'
    & git archive --format=zip "--output=$sourceZip" HEAD
    if ($LASTEXITCODE) { throw 'git archive falhou. Execute no repositório com as alterações commitadas.' }
    $staging = Join-Path $destination ('staging-' + [Guid]::NewGuid().ToString('N'))
    Expand-Archive -LiteralPath $sourceZip -DestinationPath $staging
    $bin = Join-Path $staging 'bin'
    New-Item -ItemType Directory -Force $bin | Out-Null
    Copy-Item -LiteralPath $jar -Destination (Join-Path $bin 'pife.jar')
    $monitor = Join-Path $bin 'monitor/br/edu/pife/util'
    New-Item -ItemType Directory -Force $monitor | Out-Null
    Copy-Item -LiteralPath (Join-Path $projectRoot 'backend/target/classes/br/edu/pife/util/SharedMemoryMonitor.class') -Destination $monitor
    $launcher = if ($ForForms) { 'iniciar-formulario.cmd' } else { 'iniciar.cmd' }
    Copy-Item -LiteralPath (Join-Path $projectRoot "scripts/launchers/$launcher") -Destination (Join-Path $staging 'iniciar.cmd')
    Copy-Item -LiteralPath (Join-Path $projectRoot 'scripts/launchers/monitor.cmd') -Destination $staging
    $executableName = if ($ForForms) { 'pife-com-executavel-forms.zip' } else { 'pife-com-executavel.zip' }
    $executableZip = Join-Path $destination $executableName
    Compress-Archive -Path (Join-Path $staging '*') -DestinationPath $executableZip -Force
    if ($ForForms) {
        foreach ($archivePath in @($sourceZip, $executableZip)) {
            if ((Get-Item -LiteralPath $archivePath).Length -gt 10000000) {
                throw "O arquivo $archivePath excede o limite de 10 MB do formulário."
            }
        }
    }
    # Keep staging for inspection; no recursive deletion or external path operations.
    $checksumName = if ($ForForms) { 'sha256-forms.json' } else { 'sha256.json' }
    Get-FileHash -Algorithm SHA256 $sourceZip,$executableZip |
        Select-Object Hash,@{Name='File';Expression={Split-Path $_.Path -Leaf}} |
        ConvertTo-Json | Set-Content -Encoding utf8 (Join-Path $destination $checksumName)
    Write-Host "Pacotes criados em $destination"
} finally { Pop-Location }
