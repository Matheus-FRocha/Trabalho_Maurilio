. "$PSScriptRoot/env.ps1"
$jar = Join-Path $projectRoot 'backend/target/pife-1.0.0.jar'
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
    Copy-Item -LiteralPath (Join-Path $projectRoot 'scripts/launchers/iniciar.cmd') -Destination $staging
    Copy-Item -LiteralPath (Join-Path $projectRoot 'scripts/launchers/monitor.cmd') -Destination $staging
    Compress-Archive -Path (Join-Path $staging '*') -DestinationPath (Join-Path $destination 'pife-com-executavel.zip') -Force
    # Keep staging for inspection; no recursive deletion or external path operations.
    Get-FileHash -Algorithm SHA256 $sourceZip,(Join-Path $destination 'pife-com-executavel.zip') |
        Select-Object Hash,@{Name='File';Expression={Split-Path $_.Path -Leaf}} |
        ConvertTo-Json | Set-Content -Encoding utf8 (Join-Path $destination 'sha256.json')
    Write-Host "Pacotes criados em $destination"
} finally { Pop-Location }
