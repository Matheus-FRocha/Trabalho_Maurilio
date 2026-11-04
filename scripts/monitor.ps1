param([Parameter(Mandatory=$true)][string]$File)
. "$PSScriptRoot/env.ps1"
$monitorClass = Join-Path $projectRoot 'backend/target/classes'
& java -cp $monitorClass br.edu.pife.util.SharedMemoryMonitor $File
if ($LASTEXITCODE) { throw 'Monitor falhou. Confira o arquivo mapeado.' }
