# Ứng dụng quản lý nội dung affiliate Facebook Fanpage

Tên công cụ: **Ultra PostUltra Post**. Cập nhật 2026-10-20.

Trạng thái: đã triển khai bản 0.3.1 trong thư mục này; xem README.md, TEST-REPORT.md và SECURITY.md để biết phạm vi thực hiện và các bước cần tài khoản thật. Không xem danh sách yêu cầu dưới đây là bằng chứng mọi tích hợp production đã được xác minh.

## Khởi tạo lại và hoàn thiện 03/11/2026
- Lưu nguyên kho cũ, khởi tạo kho mới không khóa, không bỏ chức năng.
- Cách ly hồ sơ và khóa kiểm thử, chặn hai phiên cùng kho.
- Kiểm thử chức năng, khóa/mở lại, dữ liệu hỏng, đóng gói và kiểm tra chính EXE phát hành.

## Thay đổi mới trong 0.3.0
- Bỏ hai khối: link/nhập LinkedIn API và kết nối/token LinkedIn. Giữ nhập văn bản, ảnh/video thủ công; không cần URL LinkedIn.
- Giao diện Tiếng Việt/English, Sáng/Tối, lưu lựa chọn và áp dụng màn hình khóa. Không dịch dữ liệu người dùng.
- Nghiên cứu và áp dụng giọng biên tập affiliate tiếng Anh có căn cứ; xem WRITING-GUIDE.md.

## Thay đổi ưu tiên ngày 20/10/2026
- Bỏ mục Cloud & cài đặt, bỏ Cloudflare khỏi ứng dụng và không yêu cầu máy chủ riêng.
- Gửi lịch trực tiếp qua API Facebook từ Ultra Post; đọc lại thời điểm và trạng thái trước khi báo đã lên lịch.
- Upload đủ media trước khi máy tắt. Facebook giữ và thực hiện lịch đã xác nhận; không tạo nội dung mới khi máy tắt.
- Thiết lập bảo mật, model ảnh và các tùy chỉnh chuyển vào mục Kết nối API. Không nhúng Business Suite hoặc lưu cookie đăng nhập.
- Những yêu cầu cloud trong các mục lịch sử phía dưới đã được thay thế bởi quyết định này.

## Bổ sung bảo mật
- Mã hóa toàn bộ kho dữ liệu và media trên máy; không đóng gói bí mật vào EXE.
- Khóa ứng dụng tùy chọn, tự khóa sau 10 phút và khi khởi động lại; xác minh mật khẩu ở backend.
- Giới hạn quyền renderer/IPC, nội dung từ xa, mạng nội bộ và redirect có bí mật.
- Mã hóa Page token, nội dung bài và media trên cloud; yêu cầu xác thực trước khi xử lý dữ liệu.
- Kiểm thử lỗi quyền truy cập, toàn vẹn mã hóa, lộ bí mật và nguồn URL nguy hiểm; không hứa bảo mật tuyệt đối.

## Mục tiêu
- Ứng dụng Windows đóng gói EXE, dùng được trên máy khác.
- Cloud lưu lịch và thực hiện đăng khi máy tính tắt/ngủ hoặc ứng dụng đóng.
- Giao diện hiện đại bằng tiếng Việt; nội dung bài bằng tiếng Anh cho độc giả quốc tế.
- Quy mô ban đầu: tổng 5–10 bài/ngày; ngân sách vận hành phát sinh mục tiêu 0–3 USD/tháng, phụ thuộc hạn mức và quyền lợi thực tế.
- Kết nối nhiều Fanpage qua cấp quyền chính thức; tách sản phẩm, affiliate link, nội dung, lịch, lịch sử theo không gian quản lý; kiểm tra quyền trên máy chủ.

## Nội dung và ảnh
- Nhập link sản phẩm và link affiliate riêng; giữ nguyên thông tin theo dõi affiliate khi xuất bản.
- Đọc nguồn chính thức, tìm thêm nguồn khi cần, lưu nguồn và thời điểm kiểm tra.
- Viết bài ngắn có mở đầu thu hút, lợi ích cụ thể, hạn chế, đối tượng phù hợp và lời mời tìm hiểu nhẹ nhàng; không bịa trải nghiệm dùng thử.
- Mặc định: bài chia sẻ link, dùng ảnh xem trước do Facebook lấy từ trang đích. Ảnh đính kèm của người dùng là ví dụ, không phải bằng chứng mọi link đều có preview.
- Tạo ảnh AI là tùy chọn tắt mặc định; có thể chọn ảnh được phép sử dụng hoặc tải ảnh lên.
- Ảnh preview của link khác với ảnh tải lên. Không cam kết cùng lúc hiển thị cả thẻ preview và ảnh tải lên theo một bố cục cố định.
- Có trạng thái preview chưa xác minh/không có ảnh; không tự gọi tạo ảnh tính phí nếu người dùng chưa bật.
- Link affiliate chuyển hướng có thể cho preview khác link gốc; kiểm tra đường dẫn xuất bản thực tế.
- Xem trước, chỉnh sửa, duyệt, lên lịch, đăng, xem lịch sử và đường dẫn bài; chống đăng lặp và tạm dừng lịch.

## Nhập nguyên bài LinkedIn sang Facebook
- Có mục riêng 'LinkedIn -> Facebook', nhận URL bài viết cụ thể; URL trang chủ LinkedIn không phải URL bài viết hợp lệ.
- Đây là chế độ sao chép nguyên nội dung: không gọi AI viết lại, dịch, tóm tắt hoặc tự thêm affiliate/CTA. Giữ văn bản, thứ tự đoạn, emoji, hashtag và liên kết; mention giữ phần chữ hiển thị nếu không thể ánh xạ tài khoản Facebook. Không cam kết giữ định dạng riêng của LinkedIn.
- Văn bản thu được phải đầy đủ, không lấy bản rút gọn làm bài hoàn chỉnh. Không nhập bình luận, lượt thích hoặc thành phần giao diện.
- Bài chữ: đăng nguyên văn lên Fanpage đã chọn.
- Bài chữ và ảnh: lấy các tệp ảnh có quyền truy cập, giữ thứ tự và tải ảnh trực tiếp lên Facebook kèm văn bản gốc.
- Bài chữ và video: lấy tệp video có quyền truy cập, lưu vào kho cloud trước khi đánh dấu sẵn sàng, rồi upload video trực tiếp lên Facebook kèm văn bản gốc. Không thay video bằng thumbnail hay thẻ link LinkedIn.
- Tắt tạo ảnh AI trong chế độ sao chép mặc định. Nếu thiếu media, giữ bài ở trạng thái cần bổ sung, không tự chuyển sang bài chỉ chữ/link.
- Hiển thị bản xem trước văn bản và toàn bộ media, loại bài, Fanpage đích, tình trạng đầy đủ; có đăng ngay hoặc lên lịch theo cơ chế chung.
- Lưu URL nguồn, tác giả nếu truy xuất được, thời điểm nhập và định danh nguồn; kiểm tra trùng theo nguồn và Fanpage. Không tự chèn ghi nguồn vào văn bản khi người dùng yêu cầu giữ nguyên.
- Truy xuất qua kết nối được cấp quyền; không mặc định API LinkedIn đọc được mọi bài công khai. Quyền r_member_social bị hạn chế; quyền đọc bài tổ chức phụ thuộc vai trò/quyền kết nối.
- Nội dung cần đăng nhập, bị giới hạn hoặc media không tải được: báo rõ và cho dán văn bản/tải tệp gốc lên để hoàn tất. Không vượt kiểm soát truy cập.
- Áp dụng cho nội dung người dùng có quyền đăng lại; quyền truy cập kỹ thuật không tự chứng minh quyền tái sử dụng.
- Chỉ hỗ trợ tự động khi đã kiểm chứng định dạng và quyền của bài thực tế. Tài liệu/PDF, poll, bài chia sẻ lại, live hoặc video nhúng ngoài LinkedIn phải báo loại chưa hỗ trợ hoặc yêu cầu chọn nội dung/tệp; không tự giả lập thành ảnh/video.
- Video có bước tải lên, xử lý, xác minh xuất bản; retry có giới hạn, không đánh dấu đã đăng khi còn xử lý và không tạo video trùng khi phản hồi mạng bị mất.
- Giới hạn tệp, thời lượng, codec theo phiên bản API Facebook đang dùng; lỗi không đáp ứng phải hiển thị trước khi đăng khi có thể kiểm tra.
- Chi phí sao chép không cần AI/Tavily nhưng video có thể phát sinh dung lượng lưu trữ và băng thông; cần hạn mức tệp và thời gian lưu phù hợp ngân sách.

## Kết nối AI và tìm kiếm
- Ưu tiên kết nối Gemini với dự án được áp dụng quyền lợi Google AI Pro, sau khi xác nhận credit thực tế. Đây là cơ chế thanh toán dự án, không phải một API độc lập tên Google AI Pro.
- Cần cấu hình kết nối/dự án cho nguồn Gemini ưu tiên và một kết nối Gemini dự phòng có ô API key và chọn model riêng. Hai kết nối cùng dự án có thể dùng chung hạn mức/credit.
- OpenRouter: ba ô API key được đánh số 1, 2, 3; có chọn model.
- Tavily: ba ô API key được đánh số 1, 2, 3; dành cho tìm kiếm/đọc nguồn, không phải viết bài.
- Gemini dự phòng: một ô API key, chọn model từ danh sách khả dụng của kết nối.
- DeepSeek dự phòng: một ô API key, cấu hình model khả dụng.
- Thứ tự AI mặc định: Gemini ưu tiên -> OpenRouter 1 -> 2 -> 3 -> Gemini dự phòng -> DeepSeek. Cho chỉnh thứ tự và bật/tắt nguồn.
- Thứ tự tìm kiếm: Tavily 1 -> 2 -> 3, độc lập với chuỗi AI.
- Mỗi kết nối có kiểm tra, che/hiện key, xóa, trạng thái, thời điểm kiểm tra gần nhất. Không ghi bí mật vào log hoặc đóng gói key trong EXE.

## Hạn mức và số dư
- Hiển thị riêng tiền còn lại, lượt gọi miễn phí còn lại và hạn mức key; không gọi mọi đơn vị là credit.
- Tavily: đọc /usage, hiển thị cả giới hạn key và tài khoản; % còn = (giới hạn - đã dùng) / giới hạn, khi giới hạn hợp lệ.
- OpenRouter: đọc /api/v1/key; % lượt miễn phí tính từ remaining/limit; % ngân sách key chỉ khi có limit hữu hạn. Ngân sách key không đồng nghĩa số dư tài khoản.
- DeepSeek: hiển thị số dư thật nếu API hỗ trợ và đã kiểm chứng; % chỉ khi có hạn mức/mốc ngân sách xác định.
- Gemini/Google AI Pro: credit dự án cần nguồn dữ liệu thanh toán hoặc người dùng khai báo ngân sách. Nếu chỉ có API key và không đọc được số dư thì hiển thị 'Chưa xác định', không tạo % giả. Ước tính chi phí phải có nhãn và không được dùng làm bằng chứng credit đã được áp dụng.
- Phân biệt số liệu chính thức, ước tính, chưa có dữ liệu và dữ liệu cũ; hiển thị đơn vị, chu kỳ và thời gian reset nếu biết.
- Không mặc định ba key tương đương ba lần hạn mức. Các key cùng tài khoản/dự án có thể chia sẻ ngân sách; tránh cộng trùng và đánh dấu nếu xác định được.

## Tự chuyển kết nối
- Dùng key 1 trước; khi nhà cung cấp xác nhận hết credit/hạn mức key, chuyển sang 2 rồi 3 nếu còn khả dụng.
- Nếu hết hạn mức tài khoản chung, bỏ qua các key đã biết thuộc cùng phạm vi; không quay vòng vô hạn.
- Lỗi giới hạn tốc độ tạm thời: chờ Retry-After và thử lại có giới hạn, không coi là hết tiền.
- Key sai/quyền thiếu: vô hiệu hóa kết nối lỗi cho tác vụ và báo rõ; lỗi nội dung/yêu cầu không hợp lệ không được che bằng đổi key.
- Giới hạn số lần thử; ghi nhật ký chuyển kết nối đã che key; tiếp tục đúng tác vụ, không tạo bài Facebook trùng.
- Hết tất cả nguồn: giữ bài trong hàng chờ, báo cần xử lý. Không tự bật dịch vụ trả phí hay vượt ngân sách đã đặt.

## Tài liệu đã kiểm tra
- https://openrouter.ai/docs/api/reference/limits
- https://docs.tavily.com/documentation/api-reference/endpoint/usage
- https://developers.google.com/program/plans-and-pricing
- https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api

## Điều kiện cần kiểm chứng khi triển khai
- Quyền Meta và khả năng đăng của Fanpage thực tế; hiện chưa có kết nối tài khoản.
- Quyền lợi Google AI Pro của tài khoản cụ thể, cách áp dụng credit và quyền đọc số dư.
- Hạn mức cloud, lưu ảnh, thời gian xử lý và chi phí thực tế trên một lô bài.
- Quyền đọc LinkedIn và khả năng lấy đầy đủ văn bản/ảnh/video của bài nguồn thực tế; chưa có tài khoản kết nối hoặc link bài mẫu để kiểm chứng.
