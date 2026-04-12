[English](https://github.com/tiesen243/graduation-thesis/blob/dev/docs/CONTRIBUTING.md) | [Tiếng Việt](https://github.com/tiesen243/graduation-thesis/blob/dev/docs/CONTRIBUTING.vi.md)

# Hướng dẫn đóng góp cho dự án

Lời đầu tiên, cảm ơn bạn đã dành thời gian đóng góp! Chính những người như bạn đã giúp hệ thống IoT chăm sóc sức khỏe người cao tuổi này trở nên tốt hơn.

Vì dự án này bao gồm cả **Phần cứng (Cơ khí/Mạch điện)** và **Phần mềm (Web/Cloud)**, vui lòng làm theo các hướng dẫn sau để duy trì một kho lưu trữ mã nguồn gọn gàng và hoạt động ổn định.

## 1. Trước khi bắt đầu

Trước khi thực hiện bất kỳ thay đổi nào, vui lòng kiểm tra danh sách [Issues](https://github.com/your-username/your-repo/issues):

- **Nếu đã có issue:** Hãy để lại bình luận cho chúng tôi biết bạn đang làm việc với issue đó để tránh việc trùng lặp công sức.
- **Nếu chưa có issue:** Vui lòng [mở một issue mới](https://github.com/tiesen243/graduation-thesis/issues/new/choose) trước để mô tả lỗi bạn tìm thấy hoặc tính năng bạn đang đề xuất.

## 2. Quy trình phát triển

1. **Fork** kho lưu trữ (repository) về tài khoản GitHub của riêng bạn.
2. **Clone** bản fork đó về máy tính cục bộ của bạn.
3. Thực hiện các thay đổi của bạn và **Commit** chúng (xem Tiêu chuẩn viết Commit Message bên dưới).
4. **Push** lên bản fork của bạn và gửi một **Pull Request (PR)** vào nhánh `dev` của chúng tôi.
5. Tạo một **Branch (Nhánh)** mới cho tính năng hoặc bản sửa lỗi của bạn (Nên làm ngay sau bước 2):
   ```bash
   git checkout -b feature/ten-tinh-nang-cua-ban
   # hoặc
   git checkout -b fix/ten-loi-cua-ban
   ```

## 3. Tiêu chuẩn viết Commit Message (Commitlint)

Chúng tôi tuân theo tiêu chuẩn **Conventional Commits**. Mỗi tin nhắn commit (commit message) phải được cấu trúc như sau:

`<type>(<scope>): <mô tả>`

### Các Loại (Type) Phổ biến:

- `feat`: Một tính năng mới.
- `fix`: Sửa lỗi (bug).
- `docs`: Các thay đổi chỉ liên quan đến tài liệu (ví dụ: cập nhật README).
- `style`: Các thay đổi không ảnh hưởng đến ý nghĩa của mã nguồn (khoảng trắng, định dạng, v.v.).
- `refactor`: Thay đổi mã nguồn không sửa lỗi cũng không thêm tính năng mới.
- `chore`: Cập nhật các tác vụ build, cấu hình trình quản lý gói (package manager), v.v.

### Các Ví dụ Hợp lệ:

- `feat(api): add endpoint for medication schedules`
- `fix(sensor): recalibrate load cell threshold`
- `docs: add wiring diagram for Raspberry Pi`
- `hw(mechanical): optimize motor torque for pill dispenser`

## 4. Yêu cầu cho Pull Request

- Cung cấp mô tả rõ ràng về các thay đổi trong PR.
- Liên kết với issue tương ứng (ví dụ: `Closes #12`).
- Đảm bảo mã nguồn đã được kiểm tra trên phần cứng (nếu áp dụng) hoặc thông qua unit test cho Web/App.
- Chờ đánh giá và phê duyệt từ ít nhất một người bảo trì dự án (**[Tên Tác Giả 1]** hoặc **[Tên Tác Giả 2]**).

## 5. Giấy phép

Bằng cách đóng góp vào dự án này, bạn đồng ý rằng các đóng góp của bạn sẽ được cấp phép theo **Apache License 2.0** đã được đính kèm trong kho lưu trữ này.
