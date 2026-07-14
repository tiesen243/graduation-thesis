[English](https://github.com/tiesen243/graduation-thesis/blob/dev/docs/README.en.md) | [Tiếng Việt](https://github.com/tiesen243/graduation-thesis/blob/dev/docs/README.vi.md)

# Rozumari (ローズマリー): Thiết kế hộp thuốc thông minh hổ trợ người cao tuổi

<p align="center">
    <a href="https://github.com/tiesen243/graduation-thesis/releases">
        <img src="https://img.shields.io/github/package-json/v/tiesen243/graduation-thesis?filename=apps/api/package.json&label=version@api" alt="Phiên bản API">
    </a>
    <a href="https://github.com/tiesen243/graduation-thesis/releases">
        <img src="https://img.shields.io/github/package-json/v/tiesen243/graduation-thesis?filename=apps/web/package.json&label=version@web" alt="Phiên bản Web">
    </a>
    <a href="https://github.com/tiesen243/graduation-thesis/releases">
        <img src="https://img.shields.io/github/package-json/v/tiesen243/graduation-thesis?filename=apps/mobile/package.json&label=version@mobile" alt="Phiên bản Mobile">
    </a>
    <a href="https://github.com/tiesen243/graduation-thesis/releases">
        <img src="https://img.shields.io/github/package-json/v/tiesen243/graduation-thesis?filename=packages/firmware/package.json&label=version@firmware" alt="Phiên bản Firmware">
    </a>
    <a href="LICENSE">
        <img src="https://img.shields.io/github/license/tiesen243/graduation-thesis" alt="Giấy phép">
    </a>
</p>

## Giới thiệu

Hệ thống tự động mở ngăn thuốc được chỉ định theo lịch, phát lời nhắc bằng âm thanh và gửi thông báo cho người chăm sóc nếu bệnh nhân bỏ lỡ liều hoặc lấy thuốc từ sai ngăn.

**Mã môn học:** 422001423801

**Giảng viên hướng dẫn:** Trần Hồng Vinh

**Nhóm:** [name]

**Thành viên:**

| **MSSV** | **Họ và tên** | **Email**                | **Vai trò** |
| -------- | ------------- | ------------------------ | ----------- |
| 22653991 | Trần Tiên     | tiesen243@tiesen.id.vn   | Phần mềm    |
| 22637811 | Đào Anh Huy   | ninjahuykunfbi@gmail.com | Phần cứng   |

## Kiến trúc hệ thống

Hệ thống gồm ba thành phần chính:

1. **Phần cứng**: Hộp thuốc được trang bị vi điều khiển, động cơ servo để mở các ngăn, loa để nhắc nhở bằng âm thanh và cảm biến để phát hiện ngăn thuốc đã được mở hay chưa.

2. **Phần mềm**: Thành phần phần mềm bao gồm hệ thống lập lịch để quản lý thời gian uống thuốc, hệ thống thông báo để cảnh báo người chăm sóc và giao diện cho người dùng nhập lịch dùng thuốc.

3. **Truyền thông**: Hệ thống sử dụng kết nối không dây (Wi-Fi) để liên kết phần cứng và phần mềm, cho phép cập nhật và gửi thông báo theo thời gian thực.

## Tính năng

- **Tự động mở ngăn thuốc**: Hệ thống tự động mở đúng ngăn thuốc vào thời điểm đã lên lịch.
- ...

## Cấu trúc dự án

```plain
├── apps/
│   ├── api/                # Các endpoint API để quản lý lịch dùng thuốc và thông báo
│   ├── web/                # Giao diện web để người dùng nhập lịch dùng thuốc và xem thông báo
│   └── mobile/             # Ứng dụng di động để người chăm sóc nhận thông báo
├── packages/
│   ├── firmware/           # Firmware cho vi điều khiển điều khiển hộp thuốc
│   ├── pcb/                # Tệp thiết kế mạch in (PCB)
│   └── proteus/            # Tệp mô phỏng để kiểm thử thiết kế phần cứng
├── docs/                   # Tài liệu dự án
└── README.md               # Tổng quan và hướng dẫn dự án
```

## Kết luận

Hệ thống hộp thuốc thông minh này hướng đến việc cải thiện mức độ tuân thủ dùng thuốc ở người cao tuổi, mang lại cách quản lý lịch dùng thuốc thuận tiện và đáng tin cậy, đồng thời giúp người chăm sóc yên tâm hơn. Trong tương lai, dự án có thể tích hợp thêm các tính năng như nhận diện giọng nói để tương tác với người dùng và mở rộng hệ thống để hỗ trợ nhiều người dùng trong một hộ gia đình.

## Giấy phép

Dự án này là mã nguồn mở và được phát hành theo Apache License 2.0. Xem file [LICENSE](https://github.com/tiesen243/graduation-thesis/blob/dev/LICENSE) để biết thêm chi tiết.
