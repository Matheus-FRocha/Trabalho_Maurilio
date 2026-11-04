@echo off
setlocal
cd /d "%~dp0"
if not exist "runtime\tmp" mkdir "runtime\tmp"
set "TEMP=%~dp0runtime\tmp"
set "TMP=%~dp0runtime\tmp"
echo Pife/Caxeta - requer Java 21. Abra http://localhost:8080
if defined JAVA_HOME (
  "%JAVA_HOME%\bin\java.exe" -jar "bin\pife.jar"
) else (
  java -jar "bin\pife.jar"
)
if errorlevel 1 pause
endlocal
