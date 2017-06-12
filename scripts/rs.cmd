@echo off
taskkill /f /im node.exe
cd %USERPROFILE%/Desktop/Node
node app.js
pause