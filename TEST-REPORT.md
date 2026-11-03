# Kiểm thử Ultra PostUltra Post 0.3.1

Ngày 03/11/2026, Windows x64 hiện tại, Electron 44.9.1.

## Kết quả đã xác nhận

- 52/52 kiểm thử logic, đăng bài giả lập, chuyển nhà cung cấp, văn phong và bảo mật đạt.
- Kiểm thử giao diện Electron thật đạt: tám mục điều hướng, chín ô API, thư viện, lịch, Page riêng biệt, bản nháp, preview media, Việt/English, sáng/tối và lưu lựa chọn sau mở lại.
- Tạo bài qua cầu nối thật với phản hồi AI giả lập: giữ đúng link, không tự thêm thông báo hoa hồng, đổi phong cách và CTA riêng theo từng Page, lưu lượt sau mở lại.
- Luồng khóa đạt: tối thiểu 10 ký tự, tự khóa sau 10 phút, chặn IPC khi khóa, sai năm lần phải chờ một phút, không chấp nhận mật khẩu đúng trong thời gian chờ, đổi mật khẩu, khởi động lại vẫn khóa và tắt khóa sau xác minh. Thời gian chờ được giả lập trong kiểm thử.
- Hồ sơ thử nghiệm có cả userData và sessionData riêng. Đối chiếu hash trước/sau xác nhận không thay đổi kho/khóa dùng thật. Hai hồ sơ riêng chạy đồng thời được; phiên thứ hai trên cùng hồ sơ bị từ chối.
- Khóa được giữ qua mở lại. Hồ sơ khác không giải mã được. Sai khóa hoặc JSON hỏng bị từ chối; state.json không bị ghi đè.
- Media được mã hóa và xác thực tính toàn vẹn; tệp bị sửa hoặc dùng sai khóa bị từ chối. Chặn nguồn mạng riêng, URL không an toàn và chuyển hướng có thông tin xác thực. CSP không cho mã từ xa.
- npm audit --omit=dev ngày 03/11/2026: 0 cảnh báo trên dependency production. Kết quả này không đánh giá toàn bộ công cụ build hoặc chứng nhận an toàn tuyệt đối.

## Facebook và AI

Đã kiểm tra bằng phản hồi giả lập: bài chữ, link affiliate chính xác, ảnh/nhiều ảnh, video upload kèm nguyên văn, lịch Facebook đọc lại đúng timestamp, trạng thái chờ xác minh khi mạng lỗi, chống gửi lặp và xóa lịch sau xác nhận. Bài được Facebook giữ lịch không cần máy chủ riêng sau khi được xác nhận.

AI được giả lập khi kiểm thử luồng tạo bài; không gọi API trả phí, không đánh giá chất lượng câu chữ từ model thật hoặc mức tăng click. Chưa kiểm tra đăng Facebook bằng token thật, video xử lý hoàn tất hay xuất bản đúng giờ khi máy tắt trên tài khoản người dùng.

## Khởi tạo mới trên máy này

Đã sao chép nguyên kho cũ và đối chiếu đủ 69 tệp. Thư mục gốc vẫn được giữ lại. Vị trí bản sao được ghi trong test-output/fresh-start-backup.json; không đưa dữ liệu này vào EXE hoặc ZIP phát hành.

Kho mới nằm ở %APPDATA%\ultra-postultra-post-v2, độc lập với kho cũ. Kiểm tra trên bản đóng gói xác nhận: không khóa, không Page/bài viết/key mẫu, đủ chín ô API, tám màn hình hoạt động. Đã đóng/mở lại thành công, giữ giao diện đã chọn và cùng khóa Windows; hash kho cũ không đổi trong bước kiểm tra này.

## Phát hành

Chính EXE portable phát hành đã được chạy hai lần trong hồ sơ riêng: mở mới không khóa, đủ chín API trống và tám mục điều hướng, mở lại đọc được dữ liệu với cùng khóa Windows. Kho mới thật trên máy này cũng đã mở/đóng/mở lại thành công.


Bản portable tự chứa runtime; không cần Node/Python trên máy đích. Không đóng gói các công cụ bảo trì, tests, mật khẩu hoặc dữ liệu thật. EXE chưa ký chứng thư thương mại. Chưa kiểm thử trên máy Windows thứ hai và chưa có đánh giá xâm nhập độc lập. Quyền đăng Page hiện dùng token thủ công, chưa tích hợp OAuth.

