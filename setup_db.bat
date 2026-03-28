@echo off
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -pusuario1 < "%~dp0setup_db.sql"
echo Exit code: %ERRORLEVEL%
pause
