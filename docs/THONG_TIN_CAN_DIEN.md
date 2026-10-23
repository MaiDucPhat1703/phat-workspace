# Tờ kiểm tra cấu hình — không điền bí mật vào file rồi upload

| Thông tin | Điền ở đâu? |
|---|---|
| UUID người sở hữu | Thay chỗ giữ sẵn trong 02_owner.sql, chạy ở SQL Editor |
| VITE_SUPABASE_URL | GitHub repo → Settings → Secrets and variables → Actions → Variables |
| VITE_SUPABASE_PUBLISHABLE_KEY | GitHub Variables; chỉ publishable hoặc legacy anon |
| PUBLIC_SITE_URL | GitHub Variables; URL Pages có https và dấu / cuối |
| SUPABASE_SECRET_KEY | GitHub Secrets; chỉ secret key hoặc legacy service_role |
| SMTP_USER | GitHub Secrets; Gmail gửi thư |
| SMTP_APP_PASSWORD | GitHub Secrets; mật khẩu ứng dụng Google, không phải mật khẩu thường |
| Email nhận | Trên web → Cài đặt → Gmail nhận thông báo |
| Giờ gửi | Trên web → Cài đặt; giờ Việt Nam |
| Ngày hạn/nhắc trước | Trong mỗi công việc; 0 ngày để nhắc từ ngày đến hạn |

Đã xong khi: Deploy website xanh, đăng nhập được, lưu được một việc, Deadline reminders xanh, nhận được email thử thật và một bản tổng hợp kiểm tra deadline.
