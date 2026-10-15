@echo off
title DiaPredict - Public Cloudflare HTTPS Tunnel
echo ========================================================
echo   DiaPredict: Public Cloudflare HTTPS Tunnel for R API
echo ========================================================
echo.
echo Forwarding public HTTPS requests to http://127.0.0.1:8000 ...
echo.
echo Look for the URL below that ends with: .trycloudflare.com
echo Copy that URL and paste it into DiaPredict settings (gear icon)
echo on your phone or other device.
echo ========================================================
echo.

"C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel --url http://127.0.0.1:8000
pause
