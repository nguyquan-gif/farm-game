# Kiểm tra phiên hiện tại. Không tải/cài âm thầm hoặc thay biến môi trường hệ thống.
$ErrorActionPreference = "Stop"
Write-Host "Green Valley Farm cần Node.js 22.12+, JDK 21, Android SDK API 36."
Write-Host "Hướng dẫn đầy đủ: docs/BUILD_ANDROID.md"
node -v
java -version
if (-not $env:ANDROID_HOME) {
    Write-Host "Chưa đặt ANDROID_HOME. SDK mặc định thường ở $env:LOCALAPPDATA\Android\Sdk"
    exit 1
}
$sdkManager = Join-Path $env:ANDROID_HOME "cmdline-tools\latest\bin\sdkmanager.bat"
if (-not (Test-Path $sdkManager)) {
    Write-Host "Thiếu SDK Command-line Tools (latest). Cài trong Android Studio SDK Manager."
    exit 1
}
& $sdkManager --list_installed
Write-Host "Sau khi kiểm tra Java 21/API 36: npm run android:debug"
