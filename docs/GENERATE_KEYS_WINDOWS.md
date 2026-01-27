# PowerShell Commands for Key Generation on Windows

## توليد مفتاح واحد (32 bytes hex)
```powershell
$bytes = [byte[]]::new(32)
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
-join ($bytes | ForEach-Object { $_.ToString('x2') })
```

## توليد جميع المفاتيح دفعة واحدة
```powershell
# JWT_SECRET
$jwt = [byte[]]::new(32)
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($jwt)
$jwtKey = -join ($jwt | ForEach-Object { $_.ToString('x2') })
Write-Host "JWT_SECRET=$jwtKey"

# TWO_FACTOR_ENCRYPTION_KEY
$twofa = [byte[]]::new(32)
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($twofa)
$twofaKey = -join ($twofa | ForEach-Object { $_.ToString('x2') })
Write-Host "TWO_FACTOR_ENCRYPTION_KEY=$twofaKey"

# INTERNAL_API_SECRET
$internal = [byte[]]::new(32)
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($internal)
$internalKey = -join ($internal | ForEach-Object { $_.ToString('x2') })
Write-Host "INTERNAL_API_SECRET=$internalKey"
```

## سكريبت واحد - انسخ والصق
```powershell
Write-Host "`n=== Rukny.io - Security Keys ===" -ForegroundColor Green
Write-Host "Copy these to your .env file`n" -ForegroundColor Yellow

$jwt = [byte[]]::new(32); [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($jwt)
Write-Host "JWT_SECRET=$(-join ($jwt | ForEach-Object { $_.ToString('x2') }))" -ForegroundColor Cyan

$twofa = [byte[]]::new(32); [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($twofa)
Write-Host "TWO_FACTOR_ENCRYPTION_KEY=$(-join ($twofa | ForEach-Object { $_.ToString('x2') }))" -ForegroundColor Cyan

$internal = [byte[]]::new(32); [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($internal)
Write-Host "INTERNAL_API_SECRET=$(-join ($internal | ForEach-Object { $_.ToString('x2') }))" -ForegroundColor Cyan

Write-Host "`n✅ Keys generated successfully!" -ForegroundColor Green
```

## بديل: استخدام Node.js
إذا كان لديك Node.js مثبت:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## بديل: استخدام موقع ويب
إذا لم تكن الطرق السابقة متاحة، يمكنك استخدام:
https://www.random.org/cgi-bin/randbyte?nbytes=32&format=h

⚠️ **تحذير**: لا تستخدم مفاتيح من الإنترنت في الإنتاج، استخدم فقط للتطوير المحلي.

## التحقق من طول المفتاح
```powershell
$key = "your-key-here"
Write-Host "Key length: $($key.Length) characters (needs 64+ for 32 bytes hex)"
```

المفاتيح التي تم توليدها تلقائياً:
- JWT_SECRET: 47ef4834efc6e98bc69769e4e3340a7cc1fb45b936d305341ef21387566f3b0a
- TWO_FACTOR_ENCRYPTION_KEY: 1036f96689ee891c546438151e0e8faaaab2175b9f7b6b96c671f167d9e3b06b
- INTERNAL_API_SECRET: d72129ca73d607f83a1e51529c4eb387240c4cc146ab73354f3bfb55fafeba9b

✅ انسخ هذه المفاتيح إلى ملف `.env` الخاص بك!
