Write-Host "Starting server..."

# Resolve npm command path on Windows (cmd.exe npm.cmd)
$npmCmd = if (Get-Command npm -ErrorAction SilentlyContinue) { "npm" } else { "npm.cmd" }

# Start backend in a separate terminal window
Push-Location "backend"
$backend = Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "$npmCmd run dev" -PassThru
Pop-Location

# Start frontend in a separate terminal window
Push-Location "frontend"
$frontend = Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "$npmCmd run dev" -PassThru
Pop-Location

Write-Host "Backend (PID: $($backend.Id)) and Frontend (PID: $($frontend.Id)) started in separate windows."
Write-Host "Close the windows to stop the servers."

try {
    # Wait for both processes to exit
    $backend.WaitForExit()
    $frontend.WaitForExit()
} catch {
    Write-Host "Error waiting for processes: $_"
} finally {
    Write-Host "Stopping servers..."
    if ($backend -and -not $backend.HasExited) { Stop-Process -Id $backend.Id -Force -ErrorAction SilentlyContinue }
    if ($frontend -and -not $frontend.HasExited) { Stop-Process -Id $frontend.Id -Force -ErrorAction SilentlyContinue }
}

exit 0
