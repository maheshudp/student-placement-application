$env:Path = "C:\Program Files\nodejs;" + $env:Path
Start-Process powershell -NoNewWindow -ArgumentList "-ExecutionPolicy Bypass -Command `"npx -y localtunnel --port 8002 --subdomain studentmanagementbackend`""
Start-Process powershell -NoNewWindow -ArgumentList "-ExecutionPolicy Bypass -Command `"npx -y localtunnel --port 5173 --subdomain studentmanagementfrontend`""
