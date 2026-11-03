# Bảo mật Ultra PostUltra Post

## Các lớp đã triển khai

- Toàn bộ kho bài viết, API key, token và cài đặt trên máy được mã hóa bằng Electron safeStorage trên Windows. File dữ liệu không lưu nội dung bài hoặc key dạng văn bản rõ.
- Media đã nhập vào ứng dụng được AES-256-GCM mã hóa, có kiểm tra tính toàn vẹn. Khóa media nằm bên trong kho mã hóa Windows. Tệp gốc do bạn chọn ngoài ứng dụng không bị sửa hoặc xóa.
- Có mật khẩu khóa ứng dụng tùy chọn, lưu bằng scrypt có salt; so sánh hash theo thời gian cố định. Tự khóa sau 10 phút không hoạt động và khi khởi động lại. Nhập sai năm lần phải chờ một phút. Khóa chặn các thao tác backend, không chỉ che giao diện. Không có khôi phục mật khẩu trong bản đầu.
- Giao diện không có quyền Node.js, được bật sandbox và context isolation. Chặn cửa sổ mới, điều hướng ngoài, webview, tải file tự phát và quyền camera/micro/vị trí. IPC chỉ nhận từ khung chính của đúng trang ứng dụng; không trả khóa mã hóa hay token đã lưu.
- Không tải script/font/ảnh trực tiếp từ website sản phẩm trong giao diện. Ảnh preview được lấy qua bộ đọc nguồn và chuyển thành dữ liệu ảnh nội bộ. Nội dung website/bài viết được xử lý như dữ liệu, không chạy mã.
- Link nguồn chỉ dùng HTTPS, không nhận tài khoản trong URL hoặc cổng riêng. Chặn địa chỉ loopback, private, link-local, metadata và các cách biểu diễn IP tương đương. Mỗi chuyển hướng được kiểm tra; kết nối TLS được ghim vào kết quả DNS đã xác minh để hạn chế DNS rebinding. Có giới hạn kích thước, loại nội dung và thời gian tải.
- Yêu cầu có API key hoặc token từ chối redirect để tránh chuyển tiếp bí mật ngoài ý muốn. Không ghi key/token hoặc nguyên thông báo lỗi nhà cung cấp vào nhật ký.
- Runtime Electron đã cập nhật lên 44.9.1. Kiểm tra npm audit cho dependency production ngày 03/11/2026: 0 lỗ hổng được báo cáo. Công cụ build vẫn có cảnh báo mức moderate trong dependency phát triển; không dùng kết quả production audit để khẳng định toàn bộ chuỗi cung ứng đã được chứng nhận an toàn.

## Bổ sung 0.3.1 — 03/11/2026

- Hồ sơ kiểm thử có cả userData và sessionData riêng trước khi khởi tạo Electron. Kiểm thử xác nhận khóa và kho dùng thật không bị thay đổi.
- Chặn nhiều phiên dùng cùng một kho; vẫn cho phép các hồ sơ kiểm thử riêng hoạt động đồng thời.
- Sai khóa hoặc JSON hỏng không làm ứng dụng ghi đè kho cũ.
- Khởi tạo lại chỉ thực hiện khi người dùng yêu cầu, sau khi sao lưu cấu hình/khóa/media và đối chiếu từng tệp. Kho mới `ultra-postultra-post-v2` tách khỏi kho cũ. Bản mới không có mật khẩu mặc định; chức năng bật khóa được giữ nguyên.

## Khi sử dụng

Bật khóa ứng dụng trong **Kết nối API → Bảo mật & tùy chỉnh** nếu cần. Không gửi key qua chat. Dùng Page token có đúng quyền cần thiết; thu hồi token khi không dùng. Bật xác thực hai bước cho Facebook và các tài khoản cung cấp API.

Nếu nghi lộ bí mật, thu hồi/đổi key tại nhà cung cấp, cập nhật trong ứng dụng và kiểm tra lại quyền Fanpage.

## Phạm vi và giới hạn

Đây là các biện pháp đã được kiểm thử trong mã, không phải chứng nhận hoặc cam kết không thể bị hack. Chưa có đánh giá xâm nhập độc lập hoặc kiểm thử quyền đăng Facebook thực tế với tài khoản của người dùng.

Khóa ứng dụng là lớp kiểm soát bổ sung; mật khẩu không tạo lớp mã hóa độc lập ngoài kho Windows. Malware chạy dưới cùng tài khoản Windows, tài khoản quản trị máy hoặc kẻ chiếm quyền tài khoản Facebook có thể vượt một số lớp bảo vệ. Nội dung đang sử dụng vẫn tồn tại trong bộ nhớ và được gửi tới API do bạn cấu hình khi thực hiện tác vụ.

EXE chưa ký chứng thư thương mại. File SHA-256 giúp đối chiếu đúng bản đã giao; nó không thay thế chữ ký số hoặc bảo vệ nếu cả EXE và tệp hash cùng bị thay đổi. Máy Windows thứ hai và việc đăng Facebook thật vẫn cần kiểm thử với kết nối thực tế.
