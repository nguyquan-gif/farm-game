# Green Valley Farm

Game nông trại offline dành cho mobile, dùng React 19 + Vite 8 và Capacitor 8. Giao diện SVG/CSS local, font đóng gói cùng game; không cần backend.

**Vòng chơi:** gieo → tưới → đợi hoặc sang ngày mới → thu hoạch → cho gà ăn → nhặt trứng → giao đơn cho Linh → kiếm xu → nâng cấp và mở câu chuyện. Chương 1 có 6 nhiệm vụ, năng lượng tối đa **5**. Ngày mới miễn phí hồi năng lượng, bổ sung nước, giảm 5% thức ăn và làm rau/trứng sẵn sàng. Góc tiếp tế có quà hàng xóm miễn phí mỗi ngày, bể có nước mưa miễn phí.

## Web local

Cần **Node.js 22.12+** và npm. Trong thư mục repo:

```powershell
npm install
npm run dev
```

Mở URL Vite hiển thị (thường `http://localhost:5173`). Build/kiểm tra:

```powershell
npm run lint
npm test
npm run build
npm run preview
```

Kiểm tra UI tự động (tùy chọn, cần tải browser một lần):

```powershell
npx playwright install chromium
npm run test:ui
```

## Android

Cần Android Studio **2025.2.1+**, **JDK 21**, Android SDK Platform **API 36**, Build Tools **36.0.0**, platform-tools. Android tối thiểu API 24. App ID: `com.nguyquan.farmgame`.

```powershell
npm run cap:sync
npm run android:open
npm run android:debug
```

`android:debug` tự chọn `gradlew.bat` trên Windows và `sh ./gradlew` trên Linux/macOS, nên dùng được cả PowerShell, CMD và Git Bash. Thư mục `android/` đã có trong repo; không chạy lại `cap add android`.

APK output: **`android/app/build/outputs/apk/debug/app-debug.apk`**. Chép sang điện thoại, mở tệp và bật **Install unknown apps** cho ứng dụng đang mở APK khi Android yêu cầu. Đây là bản debug/alpha để thử nội bộ.

Hướng dẫn từng bước, biến môi trường và lệnh Gradle trực tiếp: [docs/BUILD_ANDROID.md](docs/BUILD_ANDROID.md).

Workflow [Android alpha](../../actions/workflows/android-alpha.yml) chạy lint, game tests, UI tests, build APK và tạo prerelease `v0.1.0-android-alpha` sau lần build thành công đầu tiên. Những lần sau APK nằm trong artifact của workflow; không ghi đè release đã phát hành.

## Lưu và đặt lại

Game tự lưu `localStorage` trên trình duyệt hoặc thiết bị. **Cài đặt → Đặt lại tiến trình → Xác nhận** để bắt đầu ngày 1. Bản lưu prototype `green_valley_v4_save` được chuyển sang schema v5 trong cùng web origin. APK app ID cũ không tự chuyển dữ liệu sang app ID mới. Xóa dữ liệu/gỡ ứng dụng có thể mất tiến trình.

## Troubleshooting Windows

- **npm install lỗi:** kiểm tra `node -v` (22.12+), mạng và quyền ghi thư mục; đóng dev server/Android Studio rồi thử `npm ci`. Không cần chạy npm bằng Administrator. Không copy `node_modules` từ máy khác.
- **JAVA_HOME:** trỏ đến JDK 21 hoặc thư mục `jbr` của Android Studio, không thêm `\bin`; mở terminal mới và kiểm tra `java -version`.
- **ANDROID_HOME / ANDROID_SDK_ROOT:** thường là `%LOCALAPPDATA%\Android\Sdk`; nếu đặt cả hai phải cùng thư mục. Có thể dùng `android/local.properties` với `sdk.dir` đúng máy.
- **Gradle/SDK missing:** dùng wrapper đã commit; cài API 36 và Build Tools trong SDK Manager, chấp nhận licenses bằng `sdkmanager --licenses`, kiểm tra mạng tới Google Maven/Maven Central/Gradle. Chi tiết trong hướng dẫn Android.

## Source

- `src/game/`: schema, migration, timer, các transition nguyên tử và âm thanh Web Audio.
- `src/data/`: nhiệm vụ/câu chuyện.
- `src/hooks/`: persistence, feedback, haptic, audio lifecycle.
- `src/components/`: HUD, bản đồ, icon, mission, bottom sheet.
- `src/screens/`: farm, tiếp tế, nhật ký, các bảng tương tác/settings.
- `src/styles/`: token và CSS responsive, safe areas, reduced motion.
- `tests/`: game tests và browser tests.

Không commit dependency/build output, `.env`, APK, keystore hoặc signing password. `node_modules` và `dist` từng có trong initial commit; đã bỏ tracking từ bản nâng cấp, không viết lại lịch sử cũ.
