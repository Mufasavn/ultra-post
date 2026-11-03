param([switch]$ConfirmArchive,[switch]$Fixture)
$ErrorActionPreference = 'Stop'
if (-not $ConfirmArchive) { throw 'Cần xác nhận lưu kho cũ trước khi khởi tạo lại.' }
$taskBase = [IO.Path]::GetFullPath($env:APPDATA).TrimEnd('\')
if ($Fixture) {
 $taskFixtureBase = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\test-output')).TrimEnd('\') + '\'
 if (-not $taskBase.StartsWith($taskFixtureBase,[StringComparison]::OrdinalIgnoreCase)) { throw 'Kho mẫu phải nằm trong test-output của dự án.' }
}
$taskSource = [IO.Path]::GetFullPath((Join-Path $taskBase 'ultra-postultra-post'))
$taskDestination = [IO.Path]::GetFullPath((Join-Path $taskBase ('ultra-postultra-post.backup-' + (Get-Date -Format 'yyyyMMdd-HHmmss') + '-' + [guid]::NewGuid().ToString('N').Substring(0,6))))
if (-not [string]::Equals([IO.Path]::GetDirectoryName($taskSource),$taskBase,[StringComparison]::OrdinalIgnoreCase) -or
    -not [string]::Equals([IO.Path]::GetDirectoryName($taskDestination),$taskBase,[StringComparison]::OrdinalIgnoreCase) -or
    [IO.Path]::GetFileName($taskSource) -ne 'ultra-postultra-post' -or
    -not [IO.Path]::GetFileName($taskDestination).StartsWith('ultra-postultra-post.backup-')) { throw 'Đường dẫn lưu kho không an toàn.' }
if (-not (Test-Path -LiteralPath (Join-Path $taskSource 'state.json'))) { throw 'Không tìm thấy kho cũ; không thực hiện di chuyển.' }
if (Test-Path -LiteralPath $taskDestination) { throw 'Thư mục lưu kho đã tồn tại; không ghi đè.' }
if ((Get-Item -LiteralPath $taskSource -Force).Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'Không di chuyển thư mục liên kết.' }

if (-not $Fixture) {
$taskProcesses = @(Get-Process -ErrorAction SilentlyContinue | Where-Object {
 $_.ProcessName -eq 'Ultra PostUltra Post' -or $_.ProcessName -match '^Ultra-PostUltra-Post-.*-Windows-x64$' -or
 $_.MainWindowTitle -eq 'Ultra PostUltra Post'
})
foreach ($taskProcess in $taskProcesses) { if ($taskProcess.MainWindowHandle -ne 0) { [void]$taskProcess.CloseMainWindow() } }
$taskDeadline = (Get-Date).AddSeconds(15)
do {
 $taskRemaining = @($taskProcesses | ForEach-Object { Get-Process -Id $_.Id -ErrorAction SilentlyContinue })
 if ($taskRemaining.Count -eq 0) { break }
 Start-Sleep -Milliseconds 500
} while ((Get-Date) -lt $taskDeadline)
if ($taskRemaining.Count -gt 0) { throw 'Ultra Post vẫn đang chạy; kho cũ chưa được di chuyển.' }
}

# Keep all of the profile together: encrypted state, Windows-wrapped key and media.
$taskFiles = @(Get-ChildItem -LiteralPath $taskSource -Recurse -File -Force)
$taskManifest = @($taskFiles | ForEach-Object {
 [pscustomobject]@{ relativePath=$_.FullName.Substring($taskSource.Length+1); length=$_.Length; sha256=(Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash }
})
# Copy explicit files so that the original profile remains available throughout.
New-Item -ItemType Directory -Path $taskDestination | Out-Null
foreach ($taskEntry in $taskManifest) {
 $taskCopied = Join-Path $taskDestination $taskEntry.relativePath
 New-Item -ItemType Directory -Path ([IO.Path]::GetDirectoryName($taskCopied)) -Force | Out-Null
 Copy-Item -LiteralPath (Join-Path $taskSource $taskEntry.relativePath) -Destination $taskCopied
}
foreach ($taskEntry in $taskManifest) {
 $taskCopied = Join-Path $taskDestination $taskEntry.relativePath
 if (-not (Test-Path -LiteralPath $taskCopied) -or (Get-Item -LiteralPath $taskCopied).Length -ne $taskEntry.length -or (Get-FileHash -LiteralPath $taskCopied -Algorithm SHA256).Hash -ne $taskEntry.sha256) {
  throw 'Xác minh lưu kho chưa đạt. Giữ nguyên thư mục sao lưu; chưa khởi tạo ứng dụng mới.'
 }
}
$taskRecord = [ordered]@{ original=$taskSource; backup=$taskDestination; files=$taskManifest.Count; verified=$true; originalKept=$true; createdAt=(Get-Date).ToString('o') }
$taskRecordName = if ($Fixture) { 'archive-fixture.json' } else { 'fresh-start-backup.json' }
$taskRecord | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $PSScriptRoot ('..\test-output\' + $taskRecordName)) -Encoding utf8
$taskRecord | ConvertTo-Json -Compress
