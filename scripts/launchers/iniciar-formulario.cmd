@echo off
setlocal
cd /d "%~dp0"
if not exist "runtime\tmp" mkdir "runtime\tmp"
set "TEMP=%~dp0runtime\tmp"
set "TMP=%~dp0runtime\tmp"
set "PIFE_JAVA=java"
if defined JAVA_HOME set "PIFE_JAVA=%JAVA_HOME%\bin\java.exe"

if not exist "bin\lib\.pronto" (
  where mvn.cmd >nul 2>&1
  if errorlevel 1 (
    echo Instale o Apache Maven e adicione a pasta bin do Maven ao PATH.
    exit /b 1
  )
  echo Preparando dependencias do Pife. Requer JDK 21 e internet na primeira execucao.
  call mvn.cmd -B -ntp -f "%~dp0backend\pom.xml" dependency:copy-dependencies "-DincludeScope=runtime" "-DoutputDirectory=%~dp0bin\lib"
  if errorlevel 1 exit /b 1
  type nul > "bin\lib\.pronto"
)

echo Abra http://localhost:8080 depois que o servidor iniciar.
"%PIFE_JAVA%" -jar "bin\pife.jar"
exit /b %ERRORLEVEL%
