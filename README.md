# elysia-fullstack-base

## 📝 Tổng quan dự án

**`elysia-fullstack-base`** là một mã nguồn mẫu (Boilerplate / Starter Template) được thiết kế tối giản nhưng mạnh mẽ, giúp tăng tốc độ khởi tạo các dự án **Full-stack hoặc Web API** hiện đại.

Dự án được xây dựng dựa trên hệ sinh thái siêu nhanh của **Bun**, kết hợp với sự an toàn tuyệt đối về kiểu dữ liệu (**End-to-End Type Safety**) kéo dài từ tầng cơ sở dữ liệu cho tới các API Endpoint nhờ vào bộ đôi **ElysiaJS** và **Drizzle ORM**.

---

## 🛠️ Công nghệ cốt lõi (Tech Stack)

- **Runtime:** `Bun` – Trình chạy JavaScript/TypeScript thế hệ mới, mang lại tốc độ biên dịch và phản hồi API tối ưu (nhanh hơn Node.js nhiều lần).
- **Backend Framework:** `ElysiaJS` – Framework ưu tiên hiệu năng cao, hỗ trợ TypeScript hoàn hảo ngay từ khi khởi tạo mà không cần cấu hình phức tạp.
- **Database Layer (ORM):** `Drizzle ORM` – Cung cấp cơ chế viết câu lệnh truy vấn SQL bằng TypeScript an toàn, trực quan, gọn nhẹ và không cần bước sinh code (`code-generation`) cồng kềnh.
- **Authentication:** `JWT (JSON Web Token)` – Xác thực người dùng thông qua mã hóa Token, được lưu trữ an toàn trong `cookie` (HttpOnly) nhằm phòng chống các cuộc tấn công bảo mật cơ bản như XSS.

---

## 🏗️ Kiến trúc & Tính năng nổi bật

Dự án được chia nhỏ thành các module rõ ràng theo tư duy **"Plug-and-Play" (Cắm vào là chạy)**:

### 1. Kiến trúc Router Tùy Biến (`Base Router`)

Thay vì khởi tạo `new Elysia()` thủ công ở mọi nơi, dự án đóng gói một hàm khởi tạo tập trung `Router(value)` kế thừa kiểu dữ liệu `Root`. Việc này giúp lập trình viên dễ dàng mở rộng context hoặc cấu hình tiền tố đường dẫn (`prefix`) đồng bộ cho toàn bộ hệ thống API.

### 2. Xác thực Động không nghẽn Database (`Dynamic Auth Middleware`)

Hệ thống sử dụng cơ chế `.derive()` của Elysia để bóc tách `accessToken` từ cookie và giải mã ngay lập tức ở mỗi request. Quá trình giải mã kiểm tra tính hợp lệ dựa trên cấu trúc `{ email: string }` trực tiếp từ JWT payload mà không cần liên tục truy vấn vào Database, giúp giải phóng hoàn toàn gánh nặng cho máy chủ SQL.

### 3. Xử lý Lỗi tập trung (`Centralized Error Handler`)

Bộ lọc lỗi `onError` toàn cục được thiết kế để tự động bắt các lỗi Validation dữ liệu (mã lỗi `422`). Nó tự động phân tách (parse) các chuỗi báo lỗi JSON phức tạp của hệ thống để trả về một cấu trúc lỗi đồng nhất và sạch sẽ: `{ error: "Thông báo lỗi" }`, giúp phía Frontend dễ dàng hiển thị thông báo lên giao diện.

### 4. Thiết kế bảo mật phía kiểm soát Đăng nhập

API xác thực tuân thủ nghiêm ngặt nguyên tắc an toàn thông tin: Trả về mã lỗi chung `401 Unauthorized` cùng thông báo gộp `"Email hoặc mật khẩu không chính xác"` khi đăng nhập thất bại, ngăn chặn triệt để lỗ hổng dò tìm danh sách tài khoản hợp lệ (User Enumeration).

---

## 📂 Cấu trúc thư mục định hướng

Mã nguồn được tổ chức theo cấu trúc module tách biệt trách nhiệm (Separation of Concerns):

- `src/base/` hoặc `src/utils/`: Chứa các hàm xử lý mã hóa JWT, cấu hình chung (`jwt.ts`).
- `src/database/`: Chứa cấu hình kết nối Drizzle (`connect.ts`) và định nghĩa thực thể bảng (`schema.ts`).
- `src/middlewares/`: Nơi lưu trữ bộ lọc lỗi toàn cục và các bộ lọc quyền truy cập (Auth logic).
- `src/routes/`: Quản lý các endpoints điều hướng của ứng dụng.

---

## 🚀 Đánh giá chung

Đây là một bộ mã nguồn nền tảng (base-code) rất sạch sẽ, giải quyết tốt bài toán phân quyền, bảo mật cơ bản và tối ưu hiệu năng. Dự án cực kỳ phù hợp để làm móng vuốt vững chắc nhằm phát triển các sản phẩm SaaS hoặc Web App quy mô từ nhỏ đến lớn.
