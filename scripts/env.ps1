$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$localJdk = Get-ChildItem (Join-Path $projectRoot '.tools/java') -Directory -ErrorAction SilentlyContinue | Select-Object -First 1
if ($localJdk) { $env:JAVA_HOME = $localJdk.FullName }
if ($env:JAVA_HOME) { $env:PATH = "$env:JAVA_HOME/bin;$env:PATH" }
# Use a canonical path: AF_UNIX wakeup sockets in JDK 21 can fail on Windows 8.3 TEMP aliases.
$projectTemp = Join-Path $projectRoot '.tools/tmp'
New-Item -ItemType Directory -Force $projectTemp | Out-Null
$env:TEMP = $projectTemp
$env:TMP = $projectTemp
