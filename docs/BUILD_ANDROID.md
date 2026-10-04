# Build APK Android trên Windows

## 1. Cài môi trường

1. Cài Node.js **22.12 hoặc mới hơn**. Mở PowerShell mới, chạy `node -v` và `npm -v`.
2. Cài Android Studio **Otter 2025.2.1 hoặc mới hơn** từ [Android Developers](https://developer.android.com/studio). Hoàn tất Setup Wizard.
3. Trong **Tools → SDK Manager**, cài **Android 16 / API 36**, **Android SDK Build-Tools 36.0.0**, **35.0.0** nếu Gradle yêu cầu, **Android SDK Platform-Tools** và **Android SDK Command-line Tools (latest)**. Emulator chỉ cần nếu muốn chạy giả lập.
4. Dùng **JDK 21**. `node_modules/@capacitor/android/capacitor/build.gradle` và `android/app/capacitor.build.gradle` yêu cầu Java 21. Java 17 không đủ. Android Studio kèm JBR; kiểm tra phiên bản trước khi dùng.

Tham khảo cấu hình nền tảng: [Capacitor environment setup](https://capacitorjs.com/docs/getting-started/environment-setup) và [Capacitor 8](https://capacitorjs.com/docs/updating/8-0).

## 2. Cấu hình PowerShell trong phiên hiện tại

Ví dụ cho vị trí Android Studio mặc định; nếu máy cài chỗ khác, thay path theo thực tế:

```powershell
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
$env:Path = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\cmdline-tools\latest\bin;$env:Path"
java -version
node -v
```

`java -version` phải là 21; nếu JBR khác phiên bản, chọn một JDK 21 đã cài. Biến trên chỉ tồn tại trong terminal này. Muốn giữ lâu dài, đặt trong **Environment Variables → User variables**, mở terminal mới rồi kiểm tra lại.

Chấp nhận SDK licenses và cài phần còn thiếu:

```powershell
& "$env:ANDROID_HOME\cmdline-tools\latest\bin\sdkmanager.bat" --licenses
& "$env:ANDROID_HOME\cmdline-tools\latest\bin\sdkmanager.bat" "platform-tools" "platforms;android-36" "build-tools;36.0.0" "build-tools;35.0.0"
```

Nếu không muốn đặt biến SDK, tạo `android/local.properties` chỉ trên máy bạn, ví dụ:

```properties
sdk.dir=C:/Users/YOUR_USER/AppData/Local/Android/Sdk
```

Không commit file này.

## 3. Clone và chạy web trước

```powershell
git clone https://github.com/nguyquan-gif/farm-game.git
cd farm-game
npm install
npm run lint
npm test
npm run build
npm run dev
```

Đóng server bằng Ctrl+C khi đã kiểm tra. Repo có lockfile; các lần cài sạch dùng `npm ci`.

## 4. Build APK debug

Trong thư mục gốc `farm-game`:

```powershell
npm run android:debug
```

Script chạy **build web → cap sync → gradlew.bat assembleDebug** trên Windows. Không yêu cầu cài Gradle global. Lần đầu cần Internet để wrapper tải Gradle **8.14.3** và các dependency Android.

Lệnh thủ công tương đương trong PowerShell:

```powershell
npm run build:web
npx cap sync android
cd android
.\gradlew.bat assembleDebug
cd ..
```

Trong Git Bash có thể dùng `npm run android:debug`; nếu gọi trực tiếp wrapper dùng `./gradlew assembleDebug` khi shell/Java được cấu hình đúng.

**APK output chính xác:**

```text
farm-game\android\app\build\outputs\apk\debug\app-debug.apk
```

Chỉ coi build thành công khi Gradle báo `BUILD SUCCESSFUL` và tệp APK tồn tại. Debug APK tự ký bằng debug key do Android tooling tạo trên máy, không cần keystore release.

## 5. Android Studio / chạy thiết bị

```powershell
npm run cap:sync
npm run android:open
```

Android Studio: chọn **Gradle JDK 21** trong **Settings → Build, Execution, Deployment → Build Tools → Gradle**; đợi Gradle sync, chọn emulator/điện thoại rồi **Run**. Sau thay đổi web luôn chạy `npm run cap:sync`.

Cài bằng USB (bật Developer options → USB debugging và xác nhận máy tính trên điện thoại):

```powershell
adb devices
adb install -r android\app\build\outputs\apk\debug\app-debug.apk
```

Hoặc gửi APK sang điện thoại, mở file, cho phép **Install unknown apps / Cài ứng dụng không rõ nguồn gốc** đối với ứng dụng quản lý tệp hoặc trình duyệt đang mở APK. Game lưu cục bộ trên thiết bị; gỡ app/xóa dữ liệu có thể mất tiến trình. App ID `com.nguyquan.farmgame` được cài riêng với app ID prototype cũ.

## 6. GitHub Release

Workflow `.github/workflows/android-alpha.yml` chạy khi push `main` hoặc **Actions → Android alpha → Run workflow**. Nó tự kiểm tra web/UI, build Android trên JDK 21 + SDK 36, upload artifact và tạo prerelease một lần:

- Tag: `v0.1.0-android-alpha`
- Title: `Green Valley Farm Android Alpha`
- Asset: `GreenValleyFarm-v0.1.0-debug.apk`
- Notes: `docs/ANDROID_RELEASE_NOTES.md`

Nếu Actions bị vô hiệu hóa hoặc không có quyền release, build local rồi dùng GitHub CLI sau khi đăng nhập bằng tài khoản có quyền:

```powershell
Copy-Item android\app\build\outputs\apk\debug\app-debug.apk GreenValleyFarm-v0.1.0-debug.apk
gh release create v0.1.0-android-alpha GreenValleyFarm-v0.1.0-debug.apk --target main --prerelease --title "Green Valley Farm Android Alpha" --notes-file docs/ANDROID_RELEASE_NOTES.md
```

Không chạy tạo tag lần nữa nếu release đã tồn tại. APK được ignore, không dùng `git add -f`.

## 7. Lỗi thường gặp

| Lỗi                                           | Cách xử lý                                                                                                                               |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| npm install / Permission denied               | Kiểm tra Node 22.12+, đóng tiến trình giữ file, dùng thư mục có quyền ghi và `npm ci`; không dùng bản node_modules chép từ Git/máy khác. |
| JAVA_HOME invalid / invalid source release 21 | `JAVA_HOME` trỏ tới JDK 21, không trỏ vào `bin`; chạy `java -version` và `.\android\gradlew.bat --version` trong terminal mới.           |
| SDK location not found                        | Đặt `ANDROID_HOME`/`ANDROID_SDK_ROOT` cùng SDK path hoặc tạo `android/local.properties` đúng máy.                                        |
| Failed to find Platform SDK 36                | Cài API 36 và Build Tools từ SDK Manager hoặc sdkmanager ở trên.                                                                         |
| Licenses not accepted                         | Chạy `sdkmanager.bat --licenses` và đọc/chấp nhận licenses trên máy bạn.                                                                 |
| Gradle download / Network is unreachable      | Kiểm tra kết nối/proxy/firewall tới `services.gradle.org`, Google Maven và Maven Central; không tắt TLS verification.                    |
| App đã cài nhưng UI cũ                        | Chạy `npm run cap:sync`, build lại và cài APK mới.                                                                                       |
| INSTALL_FAILED_UPDATE_INCOMPATIBLE            | Bản cũ có chữ ký khác. Gỡ bản cũ sẽ mất save; dùng cùng debug key/máy build để cập nhật giữ save.                                        |

## Trạng thái build trong môi trường thực hiện

Web build và `cap:sync` đã chạy pass. Lần chạy `npm run android:debug` local dừng khi wrapper tải Gradle với **Network is unreachable**; môi trường chỉ có **OpenJDK 17**, không có **JDK 21**, **Android SDK/API 36** hoặc Android Studio. Không có APK được tạo local. CI/Release chỉ được coi là thành công sau khi workflow pass và asset xuất hiện trên GitHub.
