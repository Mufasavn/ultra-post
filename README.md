# Ultra PostUltra Post 0.3.1

Ứng dụng Windows x64 để viết bài affiliate, nhập nội dung LinkedIn và quản lý lịch đăng Fanpage. **Bản này dùng Facebook giữ lịch; đã bỏ Cloudflare và mục Cloud & cài đặt.**

## Mở ứng dụng

Chạy `release/Ultra-PostUltra-Post-0.3.1-Windows-x64.exe`. Bản portable không cần Node/Python trên máy đích. EXE chưa ký chứng thư thương mại. Chưa kiểm thử trên máy Windows thứ hai.

Dữ liệu, key và media nằm trong kho mã hóa của tài khoản Windows. Các bản cùng tên ứng dụng dùng lại kho dữ liệu trên máy. Khi chuyển máy khác, nhập lại kết nối; không sao chép kho mã hóa giữa tài khoản Windows. Ứng dụng chặn mở hai phiên cùng một kho; khi bấm mở lần nữa sẽ đưa cửa sổ hiện có ra trước.

## Thiết lập

1. **Fanpage của bạn**: nhập tên, Page ID và Page access token có quyền quản lý bài viết; kiểm tra kết nối. Bản hiện tại dùng token thủ công, chưa có đăng nhập Facebook OAuth. Không cần mở Business Suite để đăng từng bài; token/quyền vẫn cần được cấp lại khi hết hiệu lực hoặc bị thu hồi.
2. **Kết nối API**: nhập Gemini ưu tiên, 3 OpenRouter, 3 Tavily, Gemini dự phòng hoặc DeepSeek. Lưu rồi kiểm tra key; chọn model bằng nút lấy danh sách model.
3. **Kết nối API → Bảo mật & tùy chỉnh**: bật khóa ứng dụng, khai báo model ảnh tùy chọn, và ngân sách mục tiêu. Mật khẩu khóa không có cơ chế khôi phục trong bản này.

## Viết bài affiliate

Nhập link sản phẩm và affiliate. Có thể bổ sung thông tin thủ công nếu không đọc được trang. Tìm thêm nguồn bằng Tavily là tùy chọn. Mặc định chia sẻ link để Facebook lấy ảnh xem trước; ảnh AI chỉ được tạo khi bạn chọn và đã cấu hình model hỗ trợ.

Nguồn được lưu cùng bản nháp. Kiểm tra thông tin, giá và lời nhận xét trước khi đăng. Ứng dụng không tự đăng nội dung chưa duyệt chỉ vì tạo bài xong.

## Lên lịch ngay trong Ultra Post

1. Chọn Fanpage, hoàn tất văn bản và ảnh/video.
2. Chọn thời gian cách hiện tại ít nhất 20 phút, tối đa 28 ngày. Đây là giới hạn bảo thủ của ứng dụng; Meta vẫn có thể từ chối theo quyền, phiên bản API hoặc định dạng.
3. Nhấn **Gửi lịch cho Facebook**. Ứng dụng tải media và nội dung lên bằng API chính thức rồi đọc lại thời gian lịch.
4. Chỉ trạng thái **Đã lên lịch** mới xác nhận Facebook đã trả lại đúng thời gian. Sau đó có thể đóng EXE/tắt máy; Facebook giữ bài đã gửi.
5. Nếu **Chờ xác minh lịch Facebook**, dùng **Đồng bộ Facebook**. Không tự gửi lại bài đó. Ứng dụng giữ ID để tránh tạo lịch trùng khi mạng gián đoạn.

Không cần máy chủ riêng cho lịch này, không phải mở Business Suite cho từng bài. Đây là tích hợp API đăng Page, không phải nhúng giao diện Business Suite hoặc điều khiển tài khoản bằng cookie.

Ảnh được upload dạng media Facebook; video được upload trực tiếp kèm văn bản gốc. Bản đầu hỗ trợ tối đa 95 MB/tệp, 10 ảnh/bài hoặc một video/bài. Chưa kiểm thử mọi codec hoặc kích thước thực tế.

Lệnh **Xóa lịch Facebook** xóa đối tượng đang chờ lịch ở Facebook sau khi kiểm tra trạng thái, đồng thời giữ bản nháp trên máy. Đây không phải chuyển đối tượng Facebook sang nháp. Ứng dụng không xóa nếu đã đăng, trạng thái chưa rõ hoặc giờ đăng còn dưới hai phút.

## LinkedIn không có API

Dán nguyên văn và chọn các tệp gốc bạn có quyền đăng lại. Xác nhận đủ nội dung rồi đăng/lên lịch. Không cần API LinkedIn cho cách này. Khối link/API LinkedIn và khối kết nối LinkedIn đã được bỏ. Không dùng cookie hoặc mật khẩu LinkedIn.

## Chi phí và phạm vi

- Không còn chi phí máy chủ Cloudflare trong phiên bản này. AI viết bài, tìm kiếm hoặc tạo ảnh vẫn tuân theo phí/hạn mức nhà cung cấp.
- Credit Google AI Pro chỉ áp dụng nếu dự án của bạn thực sự được cấp quyền lợi. Chỉ API key không đủ để ứng dụng xác nhận số dư này.
- % còn lại chỉ hiển thị khi API có số liệu và hạn mức để tính. Ba key cùng tài khoản có thể chia sẻ hạn mức.
- Ngân sách USD trong tùy chỉnh là mục tiêu theo dõi, không phải giới hạn hóa đơn; đặt giới hạn thực tế ở nhà cung cấp.
- Không thể tìm sản phẩm hoặc tạo nội dung mới khi máy tắt. Phần chạy khi máy tắt là Facebook xuất bản các bài đã nhận và xác nhận lịch.
- Thư viện lưu bài tạo từ ứng dụng trên máy này; không tự nhập toàn bộ lịch sử Facebook hoặc đồng bộ mọi bản nháp giữa máy.
- Chưa kiểm thử đăng/lên lịch Facebook bằng token thật trong môi trường xây dựng. Cần thử với một Page được cấp quyền trước khi dùng hằng ngày.
- Nếu từng tự triển khai Cloudflare ở bản cũ, gỡ tính năng trong EXE không tự tắt Worker hoặc hủy lịch còn ở deployment đó; quản lý chúng trong tài khoản Cloudflare cũ.

## Bảo mật và kiểm thử

Xem [SECURITY.md](SECURITY.md) và [TEST-REPORT.md](TEST-REPORT.md). Các lớp bảo vệ được giữ lại khi bỏ Cloudflare. Không cam kết bảo mật tuyệt đối.

Để phát triển: `npm install`, `npm start`, `npm test`, `npm run test:ui`, `npm run build`. Kiểm thử UI dùng Playwright trong runtime của môi trường xây dựng; có thể đặt `PLAYWRIGHT_MODULE` khi phát triển trên máy khác.

## Ngôn ngữ, giao diện và văn phong

Dùng hai ô **Ngôn ngữ / Language** và **Giao diện / Theme** ở cuối thanh bên để chọn Tiếng Việt/English và Sáng/Light hoặc Tối/Dark. Lựa chọn được lưu và áp dụng cả khi mở lại/màn hình khóa. Đổi ngôn ngữ không dịch nội dung bài, tên Fanpage hoặc tệp của bạn.

Bài affiliate dùng giọng tiếng Anh rõ ràng, ngắn gọn, có căn cứ và CTA nhẹ; không giả nhận đã dùng thử. Xem WRITING-GUIDE.md để biết khung viết, nguồn nghiên cứu và giới hạn kiểm thử. Không thêm lượt AI chấm/chữa bài.

Tự thay đổi 7 phong cách, 9 hướng mở bài và 16 lời mời xem link theo từng Fanpage; tránh CTA vừa dùng và các bài gần đây. Bộ đếm được lưu kể cả khi tạo lại mà chưa lưu nháp. Không tự thêm thông báo hoa hồng.

## Khởi tạo lại ngày 03/11/2026

Theo yêu cầu, kho cũ được sao chép nguyên thư mục AppData, gồm state.json, Local State và media. Kho mới dùng thư mục `%APPDATA%\ultra-postultra-post-v2`, ổn định cho các bản cập nhật tiếp theo. Kho cũ giữ riêng ở `%APPDATA%\ultra-postultra-post` và bản sao đã đối chiếu từng tệp. Bản mới bắt đầu với kho trống, không có mật khẩu khóa, không có API key hoặc Fanpage cấu hình sẵn. Nhập lại kết nối để sử dụng. Lớp khóa ứng dụng vẫn có thể bật trong Kết nối API → Bảo mật & tùy chỉnh.

Bản 0.3.1 tách hoàn toàn hồ sơ Windows của kiểm thử khỏi hồ sơ dùng thật. Không thay thế Local State, chép riêng state.json hoặc mở bản EXE cũ đồng thời với bản mới. Sao lưu nguyên thư mục là cần thiết để giữ cặp khóa và dữ liệu mã hóa.
