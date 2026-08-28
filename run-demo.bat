@echo off
title NSG SUPPORT - DEMO LAUNCHER
echo ====================================================
echo   NSG SUPPORT - HE THONG PHAN ANH VA HO TRO KY THUAT
echo ====================================================
echo.
echo Dang khoi dong Web Demo Server tai http://127.0.0.1:8080 ...
echo Trinh duyet web se tu dong mo len trong giay lat...
echo.

start "" "http://127.0.0.1:8080"
python -m http.server 8080 --bind 127.0.0.1 --directory frontend

pause
