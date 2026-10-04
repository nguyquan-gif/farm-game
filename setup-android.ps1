Write-Host "Bắt đầu cài đặt môi trường Android..."

# 1. Tải và Cài đặt JDK 17
Write-Host "1/4. Đang cài đặt Microsoft OpenJDK 17..."
winget install --id Microsoft.OpenJDK.17 --silent --accept-package-agreements --accept-source-agreements

# Cập nhật biến môi trường JAVA_HOME
$jdkPath = "C:\Program Files\Microsoft\jdk-17*"
$javaPaths = Resolve-Path $jdkPath -ErrorAction SilentlyContinue
if ($javaPaths) {
    $javaPath = $javaPaths[0].Path
    [Environment]::SetEnvironmentVariable("JAVA_HOME", $javaPath, "User")
    $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
    if ($userPath -notmatch "jdk-17") {
        [Environment]::SetEnvironmentVariable("Path", "$userPath;$javaPath\bin", "User")
    }
    Write-Host "Đã cấu hình JAVA_HOME: $javaPath"
} else {
    Write-Host "Cảnh báo: Không tìm thấy đường dẫn JDK. Có thể cần kiểm tra lại."
}

# 2. Tải Android SDK Command Line Tools
Write-Host "2/4. Đang tải Android SDK Command Line Tools..."
$sdkDir = "C:\AndroidSDK"
$cmdlineToolsDir = "$sdkDir\cmdline-tools\latest"

if (-not (Test-Path $sdkDir)) { New-Item -ItemType Directory -Force -Path $sdkDir | Out-Null }

$zipPath = "$sdkDir\cmdline-tools.zip"
# Link tải bộ tools mới nhất cho Windows
Invoke-WebRequest -Uri "https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip" -OutFile $zipPath

Write-Host "3/4. Đang giải nén Android SDK..."
Expand-Archive -Path $zipPath -DestinationPath $sdkDir -Force
Rename-Item -Path "$sdkDir\cmdline-tools" -NewName "latest"
New-Item -ItemType Directory -Force -Path "$sdkDir\cmdline-tools" | Out-Null
Move-Item -Path "$sdkDir\latest" -Destination "$sdkDir\cmdline-tools\"

# Cập nhật biến môi trường ANDROID_HOME
[Environment]::SetEnvironmentVariable("ANDROID_HOME", $sdkDir, "User")
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($userPath -notmatch "AndroidSDK") {
    [Environment]::SetEnvironmentVariable("Path", "$userPath;$sdkDir\cmdline-tools\latest\bin;$sdkDir\platform-tools", "User")
}

# 4. Chấp nhận điều khoản và cài đặt SDK & Build Tools
Write-Host "4/4. Đang tải các gói Android platforms và build-tools..."
$env:JAVA_HOME = $javaPath
$env:ANDROID_HOME = $sdkDir

# Tự động đồng ý license
$yes = "y`n" * 20
$yes | & "$cmdlineToolsDir\bin\sdkmanager.bat" --licenses | Out-Null

& "$cmdlineToolsDir\bin\sdkmanager.bat" "platform-tools" "platforms;android-34" "build-tools;34.0.0"

Write-Host "----------------------------------------"
Write-Host "HOÀN TẤT CÀI ĐẶT JAVA VÀ ANDROID SDK!"
Write-Host "Bạn có thể cần khởi động lại ứng dụng hoặc terminal để nhận biến môi trường."
