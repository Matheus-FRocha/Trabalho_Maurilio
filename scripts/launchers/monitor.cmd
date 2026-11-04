@echo off
setlocal
cd /d "%~dp0"
if "%~1"=="" (
  echo Uso: monitor.cmd runtime\shared\slot-000.mmap
  exit /b 1
)
if defined JAVA_HOME (
  "%JAVA_HOME%\bin\java.exe" -cp "bin\monitor" br.edu.pife.util.SharedMemoryMonitor "%~1"
) else (
  java -cp "bin\monitor" br.edu.pife.util.SharedMemoryMonitor "%~1"
)
endlocal
