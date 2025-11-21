param(
  [int]$Port = 4000
)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSCommandPath | Split-Path -Parent
Push-Location $root
$server = Start-Process -FilePath "cmd.exe" -ArgumentList @("/c","npm --workspace server run dev") -PassThru -WindowStyle Hidden
try {
  $ok=$false; 1..30 | % { if((Test-NetConnection 127.0.0.1 -Port $Port -WarningAction SilentlyContinue).TcpTestSucceeded){$ok=$true;break}; Start-Sleep 1 }
  if(-not $ok){ throw "Server failed to start on :$Port" }
  Invoke-RestMethod "http://localhost:$Port/health" | Out-Null
  $resp = Invoke-RestMethod "http://localhost:$Port/api/uploads?limit=5"
  $resp | ConvertTo-Json -Depth 6
} finally {
  Stop-Process -Id $server.Id -Force -ErrorAction SilentlyContinue
  Pop-Location
}
