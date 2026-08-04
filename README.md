# Course Marketplace

Full-stack web bán khóa học online với 3 vai trò chính: học viên, người bán/giảng viên và quản trị viên. Dự án dùng React/Vite cho frontend, Spring Boot cho backend và MySQL cho database. Các luồng thanh toán trong repo này dùng sandbox/demo để phù hợp mục đích portfolio.

## Tính năng chính

- Marketplace khóa học: xem danh sách, lọc/tìm kiếm, xem chi tiết khóa học, giảng viên và bài học xem thử.
- Learner flow: đăng ký/đăng nhập, mua khóa học, học video, theo dõi tiến độ, tài liệu từng bài, Q&A theo bài học, yêu thích, lịch sử đơn hàng, khiếu nại, hoàn tiền và thông báo.
- Seller flow: quản lý khóa học, bài học/video/tài liệu, gửi duyệt khóa học, theo dõi doanh thu, ví người bán, rút tiền demo, hoàn tiền, khiếu nại và Q&A cần trả lời.
- Admin flow: tổng quan vận hành, duyệt khóa học, đơn hàng, hoàn tiền, chi trả người bán, khiếu nại, người dùng và phân tích dữ liệu thật từ hệ thống.
- Vận hành demo: seed dữ liệu mẫu bằng Spring profile `demo`, migration bằng Flyway, Docker Compose cho local demo.

## Công nghệ

- Frontend: React, Vite, Tailwind CSS, React Router, Axios, Chart.js/Recharts.
- Backend: Java 17, Spring Boot, Spring Security, Spring Data JPA, Flyway.
- Database: MySQL.
- Upload/media: Cloudinary config qua biến môi trường.
- Payment: PayPal/VNPay sandbox và luồng demo nội bộ.

## Chuẩn bị trước khi push/deploy

Repo đã ignore các file/thư mục local không nên push:

- `.env`, `*.env`
- `node_modules`, `dist`, `target`, `build`
- `.idea`, `.vscode`, `.kiro`
- `.agents`, `.codex`, `aidlc-docs`, `aws-aidlc-rule-details`
- log và video record local như `*.log`, `*.mp4`, `bandicam*.mp4`

Không commit credential thật. Chỉ commit `.env.example` để người khác biết cần cấu hình biến nào.

## Cấu hình local

1. Tạo file môi trường:

```powershell
Copy-Item .env.example .env
Copy-Item back_end/.env.example back_end/.env
Copy-Item front_end/.env.example front_end/.env
```

2. Điền các biến quan trọng:

- `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`
- `JWT_SIGNER_KEY`
- `DEMO_LEARNER_PASSWORD`, `DEMO_SELLER_PASSWORD`, `DEMO_ADMIN_PASSWORD`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `VNPAY_TMN_CODE`, `VNPAY_HASH_SECRET`
- `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`
- `VITE_API_BASE_URL=http://localhost:8080/api`

3. Bật dữ liệu demo:

```properties
SPRING_PROFILES_ACTIVE=demo
```

## Chạy bằng Docker Compose

```powershell
docker compose up --build
```

Sau khi chạy:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8080/api`
- MySQL: service `db` trong Compose

## Chạy thủ công khi phát triển

Backend:

```powershell
cd back_end
.\mvnw.cmd spring-boot:run
```

Frontend:

```powershell
cd front_end
npm install
npm run dev
```

## Tài khoản demo

Khi bật profile `demo`, backend tự seed 3 tài khoản nếu chưa tồn tại:

- Learner: `demo.learner@example.test`
- Seller: `demo.seller@example.test`
- Admin: `demo.admin@example.test`

Mật khẩu lấy từ các biến `DEMO_LEARNER_PASSWORD`, `DEMO_SELLER_PASSWORD`, `DEMO_ADMIN_PASSWORD` trong `.env`.

## Flow test cho Learner

1. Vào `/auth/login`, đăng nhập bằng tài khoản learner.
2. Vào `/shop`, tìm kiếm/lọc khóa học, mở chi tiết tại `/detail/:id`.
3. Kiểm tra thông tin khóa học: mô tả, giảng viên, bài học xem thử, chứng chỉ/thành tựu của seller nếu có.
4. Bấm mua khóa học, đi qua `/checkout/:id`, chọn thanh toán sandbox/demo.
5. Sau khi thanh toán thành công, kiểm tra `/payment-result` và quyền học được mở.
6. Vào `/course-video/:id`, xem video bài học, đổi bài trong mục lục, đánh dấu tiến độ.
7. Tab `Tài liệu`: kiểm tra tài liệu của từng video.
8. Tab `Hỏi đáp`: đặt câu hỏi theo bài học, phản hồi trong thread, đánh dấu đã giải đáp khi xong.
9. Vào `/UserHistory` hoặc `/history` để xem khóa học/đơn hàng đã mua.
10. Vào `/favorites` để kiểm tra danh sách yêu thích.
11. Gửi khiếu nại từ chi tiết khóa học, sau đó xem tại `/my-reports`.
12. Nếu admin duyệt hoàn tiền, xem tín dụng và rút tiền demo tại `/my-refunds`.
13. Vào `/notifications`, mở thông báo và kiểm tra điều hướng tới đúng trang liên quan.
14. Vào `/user-info`, cập nhật hồ sơ, thêm nhiều chứng chỉ/thành tựu; liên kết là tùy chọn.

## Flow test cho Seller

1. Đăng nhập bằng tài khoản seller.
2. Vào `/seller/dashboard`.
3. Tab `Quản lý khóa học`: tìm kiếm/lọc/phân trang khóa học, xem STT, xem chi tiết, sửa hoặc tạo khóa học mới.
4. Vào `/seller/course/new`, nhập thông tin khóa học, bài học/video và tài liệu từng video.
5. Gửi khóa học để admin duyệt; kiểm tra trạng thái chờ duyệt hoặc bị từ chối.
6. Tab `Hỏi đáp`: lọc theo trạng thái, tìm kiếm câu hỏi, trả lời học viên và đánh dấu đã giải quyết.
7. Tab `Doanh thu`: xem doanh thu và giao dịch theo dữ liệu thật từ đơn hàng.
8. Tab `Rút tiền`: kiểm tra ví người bán, tài khoản nhận tiền demo, lịch sử yêu cầu và phân trang.
9. Tab `Hoàn tiền`: xem các yêu cầu hoàn tiền liên quan khóa học của mình.
10. Tab `Khiếu nại`: xem khiếu nại học viên gửi, phản hồi/xử lý theo luồng đang có.
11. Vào `/seller/wallet/top-up` nếu cần nạp tiền demo cho ví người bán để test hoàn tiền/chi trả.

## Flow test cho Admin

1. Đăng nhập bằng tài khoản admin.
2. Vào `/admin/dashboard` để xem tổng quan vận hành.
3. Vào `/admin/course-approval`: xem khóa học seller gửi duyệt, kiểm tra video/tài liệu, duyệt hoặc từ chối kèm lý do.
4. Vào `/admin/orders`: tìm kiếm/lọc/phân trang đơn hàng, kiểm tra STT và trạng thái.
5. Vào `/admin/refunds`: xử lý yêu cầu hoàn tiền, duyệt/từ chối và kiểm tra tác động tới tín dụng learner.
6. Vào `/admin/withdrawals`: xử lý chi trả/rút tiền của seller, chạy chi trả tự động nếu cần.
7. Vào `/admin/ComplaintManagement`: xem khiếu nại, lọc trạng thái, phản hồi, đề xuất hoàn tiền khi phù hợp.
8. Vào `/admin/UserManagement`: tìm kiếm/lọc/phân trang người dùng, kiểm tra vai trò và trạng thái tài khoản.
9. Vào `/admin/CourseAnalytics`: kiểm tra doanh thu, số đơn, top khóa học và đơn hàng gần đây từ dữ liệu thật.
10. Kiểm tra dropdown tài khoản admin ở header: menu phải ưu tiên Tổng quan, Duyệt khóa học, Đơn hàng, Hoàn tiền, Chi trả, Khiếu nại, Người dùng, Phân tích.

## Checklist demo đẹp cho portfolio

1. Seller tạo hoặc sửa khóa học, thêm video và tài liệu từng bài.
2. Admin duyệt khóa học.
3. Learner mua khóa học.
4. Learner học video, mở tài liệu, đặt Q&A.
5. Seller nhận Q&A trong dashboard và trả lời.
6. Learner đánh dấu câu hỏi đã giải đáp.
7. Learner gửi khiếu nại hoặc hoàn tiền.
8. Admin xử lý khiếu nại/hoàn tiền.
9. Learner nhận thông báo, xem tín dụng hoặc lịch sử xử lý.
10. Admin xem phân tích và đơn hàng cập nhật theo dữ liệu thật.

## Kiểm tra trước khi deploy

Frontend:

```powershell
cd front_end
npm run build
```

Backend:

```powershell
cd back_end
.\mvnw.cmd test
```

Kiểm tra nhanh Git:

```powershell
git status --short
git check-ignore -v .agents .codex aidlc-docs aws-aidlc-rule-details
```

## Ghi chú bảo mật

- Không dùng credential thanh toán thật trong portfolio.
- Không commit `.env`.
- Cấu hình production cần HTTPS, CORS đúng domain, secret manager, database backup và storage policy riêng.
- Firebase/chat trực tiếp đã được loại khỏi app; giao tiếp chính là Q&A theo bài học và notification.
