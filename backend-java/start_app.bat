@echo off
setlocal

:: set JAVA_HOME=C:\Users\Miguel Marin\Documents\JDK\jdk-21
:: set PATH=%JAVA_HOME%\bin;%PATH%

set MAVEN_HOME=%USERPROFILE%\.m2\wrapper\dists\apache-maven-3.9.9
set MAVEN_ZIP_URL=https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.9/apache-maven-3.9.9-bin.zip
set MAVEN_ZIP=%TEMP%\apache-maven-3.9.9-bin.zip
set MAVEN_EXTRACT=%USERPROFILE%\.m2\wrapper\apache-maven-3.9.9

if exist "%MAVEN_EXTRACT%\bin\mvn.cmd" goto run_maven

echo.
echo [TechGamers] Descargando Apache Maven 3.9.9 (primera vez, ~10MB)...
echo.

powershell -NoProfile -Command "Invoke-WebRequest -Uri '%MAVEN_ZIP_URL%' -OutFile '%MAVEN_ZIP%' -UseBasicParsing"
if errorlevel 1 (
    echo ERROR: No se pudo descargar Maven. Verifica tu conexion a internet.
    pause
    exit /b 1
)

echo [TechGamers] Extrayendo Maven...
powershell -NoProfile -Command "Expand-Archive -Path '%MAVEN_ZIP%' -DestinationPath '%USERPROFILE%\.m2\wrapper' -Force"
if errorlevel 1 (
    echo ERROR: No se pudo extraer Maven.
    pause
    exit /b 1
)

del "%MAVEN_ZIP%" 2>nul
echo [TechGamers] Maven instalado correctamente.

:run_maven
set MVN=%MAVEN_EXTRACT%\bin\mvn.cmd

echo.
echo [TechGamers] Iniciando Spring Boot con Java 21...
echo [TechGamers] URL: http://localhost:9151
echo.

"%MVN%" -f "%~dp0pom.xml" spring-boot:run

endlocal
