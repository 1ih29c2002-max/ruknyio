# Generate secure keys for production
# Run these commands in PowerShell to generate secure random keys

# JWT Secret (32+ characters)
Write-Host "JWT_SECRET=" -NoNewline
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})

Write-Host ""

# Two-Factor Encryption Key (32+ characters)
Write-Host "TWO_FACTOR_ENCRYPTION_KEY=" -NoNewline
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})

Write-Host ""

# Internal API Secret (32+ characters)
Write-Host "INTERNAL_API_SECRET=" -NoNewline
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})

Write-Host ""
Write-Host "Copy these values and add them to Render Environment Variables"
