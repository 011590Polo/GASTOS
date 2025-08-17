@echo off
echo Iniciando servidor HTTP local...
echo.
echo La aplicacion estara disponible en: http://localhost:8000
echo.
echo Presiona Ctrl+C para detener el servidor
echo.

powershell -Command "& {Add-Type -AssemblyName System.Web; $listener = New-Object System.Net.HttpListener; $listener.Prefixes.Add('http://localhost:8000/'); $listener.Start(); Write-Host 'Servidor iniciado en http://localhost:8000/'; while ($listener.IsListening) { $context = $listener.GetContext(); $request = $context.Request; $response = $context.Response; $localPath = $request.Url.LocalPath; $localPath = $localPath -replace '/', '\'; if ($localPath -eq '\') { $localPath = '\index.html'; } $filePath = (Get-Location).Path + $localPath; if (Test-Path $filePath -PathType Leaf) { $content = [System.IO.File]::ReadAllBytes($filePath); $response.ContentLength64 = $content.Length; $response.OutputStream.Write($content, 0, $content.Length); } else { $response.StatusCode = 404; $notFound = [System.Text.Encoding]::UTF8.GetBytes('Archivo no encontrado'); $response.OutputStream.Write($notFound, 0, $notFound.Length); } $response.Close(); } }"
