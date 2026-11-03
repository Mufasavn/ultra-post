# Build Ultra PostUltra Post 0.3.1

Mã nguồn ứng dụng Windows x64. File EXE đã đóng gói được cung cấp trong GitHub Releases, kèm mã SHA-256 và tài liệu. Kho GitHub và Releases phải được giữ ở chế độ private theo yêu cầu của chủ sở hữu.

## Chạy và đóng gói trên Windows

Cài Node.js phù hợp với Electron/electron-builder và npm. Không cần Python để build vì icon đã có sẵn trong desktop/assets.

```powershell
npm ci
npm test
npm run build
```

Kết quả: `release/Ultra-PostUltra-Post-0.3.1-Windows-x64.exe`. Bản portable đã chứa runtime; người dùng cuối không cần cài Node.js.

Chạy từ mã nguồn bằng `npm start`. Ứng dụng dùng kho Windows riêng tại `%APPDATA%\ultra-postultra-post-v2`; không đóng gói kho này vào chương trình.

## Kiểm thử giao diện

Các bài kiểm tra giao diện dùng Playwright để điều khiển Electron. Nếu máy không có runtime Playwright của môi trường phát triển ban đầu:

```powershell
npm install --no-save --package-lock=false playwright
$env:PLAYWRIGHT_MODULE = 'playwright'
npm run test:profiles
npm run test:ui
npm run test:lock
node tests/portable.cjs
```

Chạy build trước bài kiểm tra portable. Các bài kiểm tra dùng hồ sơ riêng trong test-output, bao gồm cả khóa mã hóa Windows, không dùng kho thật. Luồng Facebook và AI được giả lập trong các bài kiểm tra tự động.

Các công cụ trong scripts để sao lưu/gỡ khóa/kiểm tra kho thật là công cụ bảo trì dành cho chủ máy, không được đóng gói trong EXE. Không chạy trên kho đang sử dụng nếu chưa sao lưu và chưa được chủ sở hữu cho phép. Xem SECURITY.md và TEST-REPORT.md để biết giới hạn.

## Phạm vi mã nguồn

Gồm desktop, lib, ui, scripts, tests, package.json, package-lock.json và tài liệu. Không đưa node_modules, release/win-unpacked, test-output, kho dữ liệu, API key, bản sao lưu hoặc phần mềm không thuộc Ultra Post lên kho mã nguồn. Các tệp phát hành được đính kèm Releases, không đưa binary lớn vào lịch sử Git.
