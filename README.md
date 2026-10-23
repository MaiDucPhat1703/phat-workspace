# Phát Workspace — GitHub Pages + Supabase + Gmail

**Giải nén và mở BAT_DAU_O_DAY.html.** Hướng dẫn từng bước bằng tiếng Việt ở HUONG_DAN_SETUP.md.

- React/Vite: tổng quan, danh sách, Kanban, lịch, dự án, ghi chú, nhập/xuất JSON, chọn nhiều việc đổi lịch và hoàn tác.
- Supabase: đăng nhập email/mật khẩu, database có RLS và RPC chỉ cho UID chủ sở hữu.
- GitHub Pages: giao diện tĩnh; GitHub Actions: kiểm tra khoảng 15 phút, gửi tổng hợp sau giờ đã chọn theo Việt Nam.
- Gmail SMTP: dùng App Password trong GitHub Secrets; không dùng plugin Gmail, không cần tên miền riêng.

## Thứ tự cài đặt

1. Tạo Supabase Free → tạo Auth user bằng email/mật khẩu, auto confirm.
2. Chạy supabase/01_schema.sql → thay UID và chạy 02_owner.sql.
3. Tải mã lên repo GitHub Public nhánh main, gồm .github/workflows và package-lock.json.
4. Repository Variables: VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, PUBLIC_SITE_URL.
5. Repository Secrets: SUPABASE_SECRET_KEY, SMTP_USER, SMTP_APP_PASSWORD.
6. Settings → Pages → Source: GitHub Actions. Chạy Deploy website.
7. Đăng nhập web → nhập JSON cũ hoặc thêm việc → lưu email nhận, giờ gửi và bật nhắc.
8. Yêu cầu email thử → chạy Deadline reminders → kiểm tra Gmail và lịch sử gửi.

## Chạy trên máy

Node 24. `npm ci`, `npm test`, `npm run build`. Sao chép .env.example thành .env rồi điền hai giá trị frontend công khai nếu muốn `npm run dev`. Môi trường này dùng database thật được cấu hình, không có dữ liệu giả ngầm.

`npm run reminders` chỉ dành cho chạy nền trên máy đã điền Secrets trong .env. Không commit .env; không đặt secret key hoặc mật khẩu Gmail vào biến VITE_.

## Giới hạn

Miễn phí trong hạn mức dịch vụ; Supabase Free có chính sách tạm dừng dự án ít hoạt động. Lịch GitHub có thể trễ/bỏ lượt và tự tắt sau 60 ngày repo công khai không hoạt động. Kiểm tra Actions định kỳ. Deadline theo ngày, giờ gửi tổng hợp riêng, chưa có deadline theo giờ/phút cho từng việc. Email thử là hàng đợi, không gửi ngay trong trình duyệt.

SMTP và database không có giao dịch chung: trường hợp kết quả không chắc chắn được đánh dấu unknown, không tự gửi lại để tránh trùng. Lịch sử giữ khoảng 90 ngày. Không có SLA hoặc cam kết email luôn đến Inbox.

## Kiểm chứng

npm test gồm kiểm tra SQL trên PostgreSQL nhúng PGlite, quyền truy cập, phiên bản lưu, lịch hạn, bulk schedule, Unicode, thoát HTML, chống gửi trùng và lỗi giữa gửi SMTP/ghi database. Không tự gửi email thật trong tests. Việc deploy GitHub/Supabase và nhận email thực tế cần được chủ tài khoản xác minh sau cài đặt.
