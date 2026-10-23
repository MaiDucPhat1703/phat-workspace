# PHÁT WORKSPACE — SETUP MIỄN PHÍ TRÊN GITHUB

**Mở `BAT_DAU_O_DAY.html` để đọc bản hướng dẫn dễ nhìn hơn.** Hướng dẫn này đi từ tài khoản trống đến website và email nhắc deadline hoạt động. Bạn tự sở hữu các tài khoản, dữ liệu và mã nguồn; không cần ChatGPT vận hành.

## 1. Bạn sẽ có gì?

| Phần | Dùng dịch vụ nào? | Việc của nó |
|---|---|---|
| Website | GitHub Pages | Giao diện quản lý công việc, dự án, lịch, chọn nhiều việc đổi lịch |
| Database + đăng nhập | Supabase Free | Lưu dữ liệu lâu dài và chỉ cho tài khoản chủ sở hữu truy cập |
| Kiểm tra lịch | GitHub Actions | Kiểm tra khoảng mỗi 15 phút, kể cả khi bạn tắt máy |
| Email nhắc hạn | Gmail SMTP | Gửi thông báo vào địa chỉ email bạn điền trên web |

Bản này dùng **ngày deadline và giờ gửi tổng hợp hằng ngày**, chưa có giờ deadline riêng từng việc. Đặt “Nhắc trước = 0” để nhận nhắc bắt đầu từ ngày đến hạn. Việc quá hạn tiếp tục xuất hiện trong bản nhắc mỗi ngày cho đến khi hoàn thành hoặc thay lịch. Đặt số lớn hơn nếu muốn nhắc trước.

Một địa chỉ nhận được tối đa một email tổng hợp mỗi ngày khi có việc đủ điều kiện. Email thử là riêng. GitHub có thể chạy lịch trễ; đây không phải thông báo đảm bảo chính xác đến phút.

**Miễn phí trong hạn mức hiện hành**, không cần mua tên miền. GitHub Free dùng Pages từ repo công khai; mã nguồn công khai nhưng dữ liệu công việc không đưa vào repo. Phần bảo vệ database đã có trong SQL, phải làm đủ bước chỉ định chủ sở hữu.

## 2. Chuẩn bị trước khi cài

Bạn cần một tài khoản GitHub, một tài khoản Supabase và một Gmail có thể tạo App Password. Không phải cài plugin Gmail. Không gửi mật khẩu hoặc khóa bí mật vào cuộc trò chuyện.

1. Giải nén ZIP vào một thư mục dễ tìm.
2. Nếu có web cũ, mở Cài đặt → Xuất bản sao JSON và giữ file ngoài thư mục mã nguồn. Bạn sẽ nhập lại sau.
3. Mở file bằng VS Code hoặc Notepad khi cần sao chép. Không dùng Word để sửa mã.
4. Dành một buổi để làm theo các bước dưới. Bạn không cần cài Node hay chạy terminal nếu dùng cách tải lên bằng trình duyệt.

**Ba loại thông tin khác nhau:** mật khẩu database Supabase chỉ dành cho quản trị database; mật khẩu đăng nhập web do bạn tạo ở bước 4; Gmail App Password chỉ dành cho tác vụ gửi mail. Không dùng lẫn chúng.

## 3. Tạo database Supabase miễn phí

1. Mở [Supabase Dashboard](https://supabase.com/dashboard), đăng nhập hoặc tạo tài khoản.
2. Chọn **New project**, chọn tổ chức ở gói **Free**, đặt tên `phat-workspace`.
3. Đặt mật khẩu database mạnh và giữ trong trình quản lý mật khẩu. Ứng dụng này không yêu cầu dán mật khẩu database vào GitHub.
4. Chọn khu vực gần Việt Nam, ví dụ Singapore nếu có. Giữ gói Free; không bật dịch vụ trả phí.
5. Bấm tạo và đợi dự án sẵn sàng.
6. Mở **Project Settings → API Keys**. Giao diện có thể hiển thị ở nút **Connect** hoặc mục **Data API**: bạn cần lấy **Project URL** và **Publishable key**. URL có dạng `https://xxxxx.supabase.co`; publishable key thường bắt đầu `sb_publishable_`.
7. Cũng ở API Keys, tạo/lấy **Secret key** bắt đầu `sb_secret_`. Khóa này chỉ đưa vào **GitHub Secrets** ở bước 8, tuyệt đối không đưa vào mã nguồn hoặc biến bắt đầu `VITE_`.

Nếu dự án hiển thị khóa kiểu cũ: dùng `anon` cho publishable key và `service_role` cho secret key tương ứng. Không lấy nhầm hai khóa. Cả hai đều có thể dài và bắt đầu `eyJ...`, nên phải nhìn đúng tên/role trong Dashboard.

## 4. Tạo tài khoản đăng nhập web

1. Trong Supabase, mở **Authentication → Users**.
2. Chọn **Add user → Create new user** (hoặc Create user).
3. Điền email của bạn, ví dụ Gmail cá nhân. Đặt **mật khẩu riêng cho ứng dụng**, không dùng mật khẩu Gmail.
4. Bật **Auto Confirm User** nếu có. Tạo người dùng trực tiếp, **không chọn Invite user**: cách mời cần thêm cấu hình email xác thực Supabase.
5. Sau khi tạo, sao chép **User UID / UUID**, ví dụ chuỗi có dạng `12345678-1234-1234-1234-123456789abc`. Không dùng email thay cho UUID.
6. Vào **Authentication → Sign In / Providers → Email** hoặc **Authentication → Configuration**, giữ đăng nhập Email/Password bật và tắt **Allow new users to sign up**. Ứng dụng chỉ dùng tài khoản bạn vừa tạo, không có nút đăng ký.

Tài khoản Supabase Dashboard và tài khoản đăng nhập ứng dụng là hai tài khoản theo hai vai trò; dù dùng cùng email, mật khẩu web là mật khẩu bạn vừa tạo ở bước này.

## 5. Tạo bảng và chỉ định bạn là chủ sở hữu

1. Trong dự án Supabase, mở **SQL Editor → New query**.
2. Mở `supabase/01_schema.sql` trong ZIP. Sao chép **toàn bộ**, dán vào SQL Editor và bấm **Run**.
3. Kết quả cần chạy thành công, không có dòng báo lỗi màu đỏ. Bước này tạo bảng, khóa dữ liệu bằng RLS và các hàm đã kiểm tra chủ sở hữu. Chạy lại không xóa dữ liệu.
4. Tạo query mới. Mở `supabase/02_owner.sql`, thay đúng chuỗi `REPLACE_WITH_YOUR_USER_UUID` bằng UUID vừa lấy, giữ nguyên dấu nháy và phần `::uuid`.
5. Chạy query đã thay UUID. Không chia sẻ quyền chủ sở hữu cho tài khoản khác.

Ví dụ cách thay (UUID này chỉ để minh họa, không sao chép nguyên):

```sql
insert into pw_private.owner_config(singleton,owner_id)
values(true,'12345678-1234-1234-1234-123456789abc'::uuid)
on conflict(singleton) do update set owner_id=excluded.owner_id;
```

Bảng `workspaces` sẽ có bản dữ liệu đầu tiên **sau lần đăng nhập web thành công đầu tiên**. Chưa thấy dòng dữ liệu ngay sau chạy schema là bình thường. Hãy sửa dữ liệu bằng web, không sửa trực tiếp JSON trong Table Editor.

## 6. Tạo repository GitHub và tải mã lên

1. Mở [GitHub](https://github.com), đăng nhập.
2. Bấm dấu **+ → New repository**.
3. Đặt tên **`phat-workspace`**, chọn **Public** để dùng GitHub Pages trên tài khoản Free. Không đưa dữ liệu riêng vào mã nguồn.
4. Có thể chọn Add a README rồi bấm **Create repository**. Nếu repo tạo sẵn nhánh khác `main`, dùng nhánh `main` làm mặc định để khớp workflow.
5. Trong repo, chọn **Add file → Upload files** (repo trống có link **uploading an existing file**).
6. Kéo **nội dung bên trong thư mục đã giải nén** vào vùng tải lên. Cấp ngoài cùng của repo phải có `package.json`, `package-lock.json`, `src`, `scripts`, `supabase`, `tests`, `public`, `index.html`, `vite.config.ts`, `tsconfig.json`. Không tải nguyên ZIP lên và không để thêm một lớp thư mục bao ngoài.
7. Không tải `node_modules`, `dist`, file `.env` thật hoặc bản sao JSON riêng của bạn. File `.env.example` chỉ là mẫu, có thể tải lên.
8. Bấm **Commit changes**, lưu vào nhánh `main`.

### Quan trọng: kiểm tra thư mục `.github/workflows`

Một số cách kéo thả bỏ qua thư mục bắt đầu bằng dấu chấm. Trong repo phải có đúng:

- `.github/workflows/deploy.yml`
- `.github/workflows/reminders.yml`

Nếu chưa có, tạo thủ công hai file:

1. **Add file → Create new file**.
2. Ô tên file nhập **`.github/workflows/deploy.yml`**.
3. Dán toàn bộ nội dung file `deploy.yml` cùng đường dẫn trong ZIP → **Commit changes** vào `main`.
4. Làm tương tự với **`.github/workflows/reminders.yml`**.

Nếu upload hiện “too many files”, tải từng thư mục một. Không bỏ file `package-lock.json` hay thư mục `tests`: quy trình deploy cần chúng.

Workflow deploy có thể báo đỏ lúc này vì chưa điền cấu hình. Làm xong bước 7–9 rồi chạy lại; không cần xóa repo hoặc tạo lại database.

## 7. Thêm Variables — các giá trị công khai cho web

Trong repo GitHub, vào **Settings → Secrets and variables → Actions → tab Variables → New repository variable**.

Tạo ba biến ở **cấp repository**, không phải environment:

| Name — nhập đúng từng ký tự | Value — bạn điền gì? |
|---|---|
| `VITE_SUPABASE_URL` | Project URL Supabase, ví dụ `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Publishable key `sb_publishable_...` hoặc legacy `anon` key |
| `PUBLIC_SITE_URL` | Dự kiến `https://TEN_GITHUB_CUA_BAN.github.io/phat-workspace/` |

Ví dụ nếu tài khoản GitHub là `phat123`, URL dự kiến là `https://phat123.github.io/phat-workspace/`. Thay tên thật của bạn; đừng dùng nguyên ví dụ.

Hai giá trị `VITE_` được đưa vào mã trình duyệt theo thiết kế của Supabase. Dữ liệu được bảo vệ bằng đăng nhập và quyền chủ sở hữu; publishable key không phải mật khẩu. Secret key và Gmail App Password **không bao giờ** được đặt ở tab Variables hay biến `VITE_`.

Bạn chưa biết URL chính xác cũng được: dùng dạng dự kiến rồi sửa `PUBLIC_SITE_URL` theo URL thật sau khi deploy. `VITE_REPO_URL` được workflow tự tạo, không phải tự điền.

## 8. Cấu hình Gmail gửi thông báo và GitHub Secrets

### Tạo Gmail App Password

1. Dùng Gmail bạn muốn làm tài khoản **gửi** thư; có thể cũng là Gmail **nhận** thư của bạn.
2. Mở [bảo mật Google](https://myaccount.google.com/security), bật **2-Step Verification / Xác minh hai bước** nếu chưa bật.
3. Mở [App passwords / Mật khẩu ứng dụng](https://myaccount.google.com/apppasswords).
4. Đặt tên ứng dụng `Phat Workspace`, bấm tạo.
5. Google hiển thị một mật khẩu ứng dụng, thường 16 ký tự chia thành nhóm. Sao chép vào nơi an toàn tạm thời. Mã tự bỏ khoảng trắng khi gửi.

Đây không phải mật khẩu Google thông thường. Một số tài khoản cơ quan, Advanced Protection hoặc chính sách đăng nhập không cho tạo App Password. Nếu không có lựa chọn này, phần gửi Gmail theo cách này chưa dùng được với tài khoản đó; có thể chọn Gmail cá nhân khác có hỗ trợ. Đừng tắt các lớp bảo vệ để cố làm theo.

### Thêm đúng ba Secrets

Quay lại GitHub repo → **Settings → Secrets and variables → Actions → tab Secrets → New repository secret**:

| Name — nhập đúng | Value |
|---|---|
| `SUPABASE_SECRET_KEY` | Supabase Secret key `sb_secret_...` hoặc legacy `service_role` |
| `SMTP_USER` | Gmail gửi, ví dụ `phat.cua.ban@gmail.com` |
| `SMTP_APP_PASSWORD` | Mật khẩu ứng dụng Google vừa tạo, không phải mật khẩu Gmail thường |

Không thêm dấu nháy quanh giá trị. Dùng **Repository secrets** để cả workflow nhắc và lần chạy tay đều đọc được. Không dán các giá trị này vào `src`, README, issue, comment hoặc ảnh chụp màn hình.

**Không cần điền SMTP host hay port**: mã đã dùng `smtp.gmail.com`, TLS cổng 465. Không cần Resend, Railway hoặc mua tên miền. GitHub giữ Secrets cho tác vụ gửi; database không lưu mật khẩu Gmail này.

## 9. Bật GitHub Pages và deploy website

1. Trong repo mở **Settings → Pages**.
2. Ở **Build and deployment → Source**, chọn **GitHub Actions**. Không chọn Deploy from a branch.
3. Mở tab **Actions**. Nếu GitHub yêu cầu bật workflows cho repo, đọc và bật.
4. Chọn workflow **Deploy website → Run workflow → nhánh main → Run workflow**.
5. Đợi cả job **build** và **deploy** xanh. Nếu đỏ, bấm vào lần chạy rồi đọc bước lỗi; xem bảng xử lý ở cuối hướng dẫn.
6. Quay lại **Settings → Pages**, mở URL website được GitHub cung cấp.
7. Sao chép URL thật, cập nhật biến **`PUBLIC_SITE_URL`** ở bước 7 nếu khác. Biến này giúp email có link quay lại web. Runner đọc giá trị mới ở lần chạy tiếp theo, không cần build lại vì riêng biến link này.

Mỗi lần bạn commit thay đổi mã vào `main`, workflow tự build và deploy lại. Thay hai biến `VITE_` thì phải **Run workflow Deploy website** lại vì chúng được nhúng ở thời điểm build.

Không mở `index.html` trên máy để dùng ứng dụng. Không dùng URL repo `github.com/...` làm địa chỉ website. Web chạy ở URL Pages `https://...github.io/.../`.

## 10. Đăng nhập, nhập công việc và điền email nhận

1. Mở URL website ở bước 9. Điền email và **mật khẩu ứng dụng đã tạo trong Authentication → Users ở bước 4**. Không điền App Password hay mật khẩu database ở đây.
2. Nếu đã chạy đúng SQL và chỉ định UID, bạn sẽ thấy giao diện tổng quan, ba dự án trống và chưa có công việc. Điều này giúp mã nguồn công khai không mang thông tin cuộc họp riêng.
3. Nếu có dữ liệu cũ, vào **Cài đặt → Khôi phục toàn bộ từ bản sao JSON**, chọn bản đã xuất từ web cũ. Xuất bản sao trước nếu bản mới đã có dữ liệu cần giữ. Khôi phục là thay thế dữ liệu hiện tại.
4. Vào **Cài đặt → Gmail nhận thông báo**. Điền địa chỉ bạn muốn nhận, ví dụ chính Gmail đang gửi.
5. Chọn **Giờ gửi hằng ngày (Việt Nam)**, ví dụ `08:00`.
6. Bật **Cho phép nhắc công việc tự động**.
7. Đặt **Số ngày nhắc trước mặc định = 0** nếu chỉ muốn bắt đầu nhắc vào ngày deadline. Giá trị mặc định này áp dụng cho việc mới; các việc đã có giữ giá trị riêng.
8. Bấm **Lưu cài đặt**.

Tài khoản gửi được cấu hình một lần ở GitHub Secrets. Ô Gmail trong web là **địa chỉ nhận**. Sau này chỉ đổi địa chỉ nhận thì sửa trên web và lưu, không phải sửa code.

## 11. Gửi email thử — bước bắt buộc để kiểm tra thực tế

1. Trên web → Cài đặt, bấm **Lưu & yêu cầu email thử**. Web báo đã xếp vào hàng đợi; đây chưa phải thư đã gửi.
2. Mở repo GitHub → **Actions → Deadline reminders → Run workflow → main → Run workflow**.
3. Đợi workflow hoàn tất xanh. Một lần kiểm tra thấy chưa có workspace nghĩa là bạn chưa đăng nhập web thành công ở bước 10.
4. Mở Gmail nhận và kiểm tra **Inbox + Spam**. Tiêu đề có **[Phát Workspace] Kiểm tra email nhắc deadline**.
5. Trở lại web → Cài đặt → Lịch sử email → **Làm mới**. Bạn sẽ thấy Đang chờ, Đã tiếp nhận, Thất bại hoặc Cần kiểm tra.

“Đã tiếp nhận” chỉ nghĩa là máy chủ Gmail chấp nhận thư. Vẫn phải tự kiểm tra thư thực nhận. Gửi thử tối đa 1 lần/phút và 10 yêu cầu/24 giờ để tránh bấm nhầm hàng loạt.

Nếu không chạy tay, yêu cầu sẽ được xử lý vào một lần lịch nền sau đó. Lịch khoảng 15 phút nhưng có thể chậm hơn; bấm gửi thử không gửi tức thì trực tiếp từ trình duyệt. Yêu cầu chờ quá 24 giờ bị bỏ qua.

## 12. Kiểm tra một deadline thật

1. Tạo một việc tên **Kiểm tra nhắc deadline**, chọn ngày hạn **hôm nay theo giờ Việt Nam**, nhắc trước **0**, trạng thái **Cần làm**.
2. Chọn giờ gửi trong Cài đặt **sớm hơn giờ Việt Nam hiện tại**, bật nhắc rồi lưu. Ví dụ đang 14:00 thì chọn 13:00.
3. Chạy lại workflow **Deadline reminders** như bước 11.
4. Kiểm tra Gmail: có bản tổng hợp chứa việc vừa tạo, nhãn **Đến hạn hôm nay** và link mở web.
5. Đổi việc thử sang **Hoàn thành** và đặt lại giờ gửi bạn muốn dùng hằng ngày.

Nếu hôm nay bản tổng hợp đã gửi thành công tới địa chỉ đó rồi, hệ thống không gửi bản thứ hai dù bạn thêm việc sau đó. Dùng email thử để kiểm tra kênh gửi, còn kiểm tra bản tổng hợp tiếp vào ngày sau. Email thử không tính vào bản tổng hợp hằng ngày.

Đổi địa chỉ nhận có thể tạo một bản tổng hợp gửi tới địa chỉ mới trong ngày. Đổi lại địa chỉ cũ đã nhận hôm nay sẽ không gửi trùng. Tắt nhắc dừng bản tổng hợp; yêu cầu email thử đã bấm là một thao tác riêng.

## 13. Sửa lịch nhiều việc cùng lúc

1. Mở **Công việc**, lọc dự án/trạng thái nếu muốn.
2. Tích ô bên trái từng dòng hoặc ô chọn tất cả kết quả đang lọc.
3. Dùng thanh công cụ để **đặt chung một ngày**, **dời +/− số ngày**, **xóa hạn** và đổi **số ngày nhắc trước** cùng lúc.
4. Bấm áp dụng. Có thể hoàn tác lần đổi lịch ngay trong giao diện.
5. Khi dời tương đối, việc chưa có ngày hạn sẽ bị bỏ qua; giao diện báo số việc bỏ qua.

Có thể chọn ngày trực tiếp trên từng dòng rồi nhấn Tab/Enter để lưu. Việc đang kéo/sửa mà lưu chưa thành công sẽ có thông báo; đừng đóng tab trước khi kiểm tra.

## 14. Tự quản lý sau khi đã cài xong

- Dùng cùng tài khoản đăng nhập web trên máy tính/điện thoại. Khi hai tab cùng sửa, bản cũ bị chặn ghi đè; bấm Tải dữ liệu mới nhất trước khi sửa tiếp.
- Định kỳ **Xuất bản sao JSON**, giữ ngoài repo công khai. Bản JSON có thể có thông tin công việc và email riêng.
- Lịch sử email giữ khoảng 90 ngày; mỗi lần mở web hiển thị 30 yêu cầu gần nhất.
- Khi không nhận mail, xem thời điểm bộ kiểm tra gần nhất trong Cài đặt và tab Actions; trạng thái gần đây không phải bảo đảm lịch tương lai sẽ chạy.
- Nếu đang có lịch nhắc ChatGPT cũ, sau khi kiểm tra bản mới chạy ổn, bạn có thể tắt lịch cũ trong Tasks của ChatGPT để tránh hai nguồn nhắc. Gói mã không tự tắt lịch cũ.
- Dừng gửi tổng hợp: tắt nhắc trong web rồi lưu. Dừng cả bộ kiểm tra: GitHub → Actions → Deadline reminders → menu → Disable workflow. Bật lại bằng Enable workflow.
- Thay Gmail gửi: cập nhật cả `SMTP_USER` và `SMTP_APP_PASSWORD`, rồi yêu cầu email thử. Đổi mật khẩu Google có thể thu hồi mật khẩu ứng dụng; khi đó tạo lại và cập nhật Secret.
- Đừng xóa dự án Supabase hoặc repo nếu chưa có bản sao. Cập nhật mã không cần chạy lại bước tạo tài khoản hoặc reset database.

### Giới hạn miễn phí cần nắm rõ

Supabase Free hiện có database 500 MB và chính sách tạm dừng dự án ít hoạt động sau khoảng 7 ngày. Tác vụ nền của hệ thống có hoạt động đọc dữ liệu thật, nhưng không có cam kết miễn tạm dừng; nếu dự án bị pause, vào Dashboard để khôi phục rồi kiểm tra email lại.

GitHub Actions dùng runner tiêu chuẩn miễn phí cho repo công khai. Lịch chạy có thể trễ hoặc bỏ lượt lúc tải cao, và workflow lịch trong repo công khai có thể tự tắt khi repo không có hoạt động 60 ngày. **Mỗi tháng hãy mở Actions kiểm tra workflow còn bật và xem lần chạy gần nhất**; không chỉ xem website còn mở được. Chỉnh công việc trong database không phải là hoạt động commit của repo. Hệ thống không tự tạo commit giả để né giới hạn này.

Gmail cũng có hạn mức gửi và chính sách bảo mật. Với một người nhận và một bản tổng hợp/ngày, lượng sử dụng dự kiến nhỏ; không có cam kết miễn phí không giới hạn hoặc gửi luôn thành công. Hệ thống không khôi phục các email đã lỡ ngày khi dịch vụ ngừng chạy; lần kiểm tra sau sẽ xử lý ngày Việt Nam hiện tại và các việc còn quá hạn.

Nếu cần lịch nhắc luôn chạy mà không cần kiểm tra repo 60 ngày, nên chuyển phần chạy nền sang nền tảng lịch chuyên dụng; đây là giới hạn của phương án GitHub miễn phí đã chọn.

## 15. Bảng xử lý lỗi

| Hiện tượng | Cách xử lý |
|---|---|
| Web trắng/404 | Kiểm tra package.json ở gốc repo, Pages Source = GitHub Actions, hai job deploy xanh và mở đúng URL Pages. Vite đã cấu hình đường dẫn tương đối để dùng thư mục repo. |
| Chưa cấu hình Supabase | Tạo đúng 2 biến VITE_ trong tab Variables, lấy publishable/anon key rồi chạy lại Deploy website. |
| Deploy báo chặn secret key | Bạn đã điền nhầm khóa bí mật vào biến frontend. Thay bằng publishable/anon. Nếu đã public hoặc build khóa bí mật trước đó, thu hồi/đổi secret key trong Supabase và cập nhật GitHub Secret. |
| Đăng nhập không thành công | Kiểm tra mật khẩu ở bước tạo User, Auto Confirm, Email/Password bật, URL/key đúng dự án và Supabase không pause. |
| Tài khoản chưa được cấp quyền chủ sở hữu | Mở Authentication → Users, lấy đúng UUID tài khoản đang đăng nhập, thay vào 02_owner.sql và chạy lại. |
| Không tìm thấy hàm pw_* / schema cache | Chạy toàn bộ 01_schema.sql đúng dự án; đợi API cập nhật schema rồi tải lại. Không chỉ tạo ba bảng bằng tay. |
| SMTP chưa cấu hình | Kiểm tra đúng tab Secrets, tên SMTP_USER và SMTP_APP_PASSWORD, không phải Variables. Chạy lại Deadline reminders. |
| Gmail từ chối đăng nhập | Dùng App Password của chính SMTP_USER, không dùng mật khẩu Gmail thường; kiểm tra Google có thu hồi App Password không. |
| Email thử đang chờ | Chạy tay workflow Deadline reminders; kiểm tra workflow có bật và file ở nhánh main. Gửi thử chỉ xếp hàng. |
| Workflow đỏ tại npm ci | Kiểm tra có package-lock.json và package.json đúng bản; không tự thay phiên bản một file mà bỏ file kia. |
| Workflow đỏ vì quyền deploy Pages | Kiểm tra Settings → Pages = GitHub Actions; repo/organization có cho phép Actions và GitHub Pages. Gói Free dùng repo Public. |
| Workflow xanh nhưng no-workspace | Đăng nhập web một lần để khởi tạo dữ liệu. Kiểm tra URL/secret Supabase cùng dự án, owner UID đã cấu hình. |
| Workflow xanh nhưng không có mail tổng hợp | Chưa đến giờ Việt Nam, chưa bật nhắc, không có việc đủ điều kiện, hoặc đã gửi tổng hợp hôm nay. Xem ngày hạn, remind và trạng thái từng việc. |
| Cần kiểm tra / unknown | Lỗi mạng hoặc gián đoạn giữa SMTP và lưu kết quả. Kiểm tra Gmail thật; hệ thống không tự gửi lại mù quáng vì có thể tạo thư trùng. |
| Có Đã tiếp nhận nhưng Inbox không có | Kiểm tra Spam, địa chỉ nhận đã lưu, hộp thư khác; SMTP tiếp nhận chưa đảm bảo thư nằm trong Inbox. |
| Hai tab sửa xung đột | Tải dữ liệu mới nhất, nhập lại thay đổi chưa lưu. Lưu được kiểm tra phiên bản để bảo vệ cập nhật mới. |
| Nhắc tự động bỗng ngừng | Kiểm tra workflow bị tắt vì 60 ngày, project Supabase pause/hết hạn mức, Gmail App Password bị thu hồi và các lần chạy đỏ. |

Có thể chạy `supabase/03_health_check.sql` trong SQL Editor để xem chủ sở hữu, phiên bản dữ liệu và trạng thái gửi gần nhất. Kết quả có thông tin riêng; không đăng công khai.

## 16. Sau này muốn sửa giao diện hoặc chức năng

Nếu chỉ đổi công việc, deadline, email nhận: làm ngay trên web, không phải sửa mã.

Nếu sửa code: cài Node.js 24 từ [nodejs.org](https://nodejs.org), mở terminal tại thư mục có package.json, chạy lần lượt:

```bash
npm ci
npm test
npm run build
```

Để xem trên máy: tạo `.env` từ `.env.example`, chỉ điền hai biến `VITE_` cho frontend rồi chạy `npm run dev`. Môi trường local vẫn dùng database Supabase thật của bạn; không dùng để thử xóa dữ liệu nếu chưa sao lưu. Không commit `.env`.

Sau khi sửa, cập nhật file trong repo và commit vào main. Workflow Deploy website tự xuất bản bản mới. Nếu thay schema, chạy SQL migration phù hợp trong Supabase trước; không xóa bảng hiện tại để nâng cấp.

## 17. Đã kiểm tra gì và còn gì bạn cần xác minh?

Đã chạy kiểm tra SQL trên PostgreSQL nhúng (PGlite): chủ sở hữu, chặn truy cập vô danh/tài khoản khác, lưu có số phiên bản, hạn chế yêu cầu email thử và quyền riêng cho runner. Đã kiểm tra logic deadline theo giờ Việt Nam, không nhắc việc hoàn thành/chưa có hạn, chống gửi trùng, email thử và trường hợp gửi xong nhưng ghi kết quả lỗi. Đã biên dịch giao diện và xem trang đăng nhập trong trình duyệt.

**Chưa tạo/deploy trên tài khoản GitHub/Supabase/Google của bạn và chưa gửi email thật.** Bạn phải hoàn thành bước 11 và 12 để xác minh toàn bộ hệ thống trên tài khoản của mình. Không có khóa tài khoản hay thông tin đăng nhập thật trong ZIP.

SMTP không hỗ trợ giao dịch nguyên tử cùng database. Nếu bị ngắt ngay giữa gửi thư và lưu kết quả, hệ thống ghi trạng thái cần kiểm tra và không tự gửi lại để tránh trùng; vẫn không thể cam kết giao thư chính xác một lần.

## 18. Tài liệu chính thức

- [GitHub Pages — tạo website](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)
- [GitHub Actions — lịch chạy và giới hạn](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule)
- [GitHub Actions — phí sử dụng](https://docs.github.com/en/billing/concepts/product-billing/github-actions)
- [Supabase Free — phí và hạn mức](https://supabase.com/pricing)
- [Supabase — project pausing](https://supabase.com/docs/guides/platform/free-project-pausing)
- [Supabase — RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Google — App Passwords](https://support.google.com/accounts/answer/185833)
- [Google — Gmail SMTP](https://developers.google.com/workspace/gmail/imap/imap-smtp)
