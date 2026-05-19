@echo off
cd /d "%~dp0backend"
npm install
npm run seed:admin
npm run dev
pause
