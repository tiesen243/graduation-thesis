[English](https://github.com/tiesen243/graduation-thesis/blob/dev/docs/README.en.md) | [Tiếng Việt](https://github.com/tiesen243/graduation-thesis/blob/dev/docs/README.vi.md)

# Rozumari (ローズマリー): Thiết kế hộp thuốc thông minh hỗ trợ người già và trẻ nhỏ

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
    <a href="https://github.com/tiesen243/graduation-thesis/releases">
      <img src="https://img.shields.io/github/package-json/v/tiesen243/graduation-thesis?filename=packages/firmware/package.json&label=version@eda" alt="Phiên bản EDA">
    </a>
    <a href="LICENSE">
      <img src="https://img.shields.io/github/license/tiesen243/graduation-thesis" alt="Giấy phép">
    </a>
</p>

## **Tổng quan**

**Rozumari** là hệ thống hộp thuốc thông minh IoT được thiết kế nhằm hỗ trợ **người cao tuổi và trẻ nhỏ** tuân thủ lịch uống thuốc hàng ngày. Hệ thống tự động nhả thuốc theo giờ đã hẹn, phát thông báo qua màn hình LCD và còi Buzzer, tự động kiểm tra số lượng thuốc rơi qua cảm biến và lập tức gửi cảnh báo về máy chủ để thông báo cho phụ huynh/người chăm sóc nếu xảy ra tình trạng quên uống thuốc hoặc bất thường.

- **Đề tài:** Thiết kế hộp thuốc thông minh hỗ trợ người già và trẻ nhỏ
- **Mã học phần:** 422001423801
- **Giảng viên hướng dẫn:** ThS. Trần Hồng Vinh

### **Ý nghĩa tên gọi "Rozumari"**

**Rozumari** (ローズマリー) trong tiếng Nhật có nghĩa là **Cây Hương Thảo** (Rosemary) — loài thảo dược nổi tiếng từ lâu trong y học với khả năng **kích thích trí não, cải thiện tư duy và tăng cường trí nhớ**. Lấy cảm hứng từ đặc tính này, dự án được đặt tên là **Rozumari** với mong muốn trở thành "trợ lý ghi nhớ" tin cậy, giúp hỗ trợ người già (vốn hay quên do tuổi tác) và trẻ nhỏ (chưa tự giác hoặc chưa có khả năng tự quản lý liều dùng) uống thuốc đúng giờ, đúng liều lượng.

### **Thành viên nhóm**

| **MSSV** | **Họ và tên** | **Email**                | **Vai trò** |
| -------- | ------------- | ------------------------ | ----------- |
| 22653991 | Trần Tiên     | tiesen243@tiesen.id.vn   | Phần mềm    |
| 22637811 | Đào Anh Huy   | ninjahuykunfbi@gmail.com | Phần cứng   |

## **Tính năng chính**

- **Nhả thuốc tự động & An toàn tuyệt đối:** Thuốc được tự động thả xuống từ ngăn chứa theo lịch hẹn—người dùng không thể tự mở hộp thủ công nhằm tránh việc trẻ nhỏ lấy nhầm hoặc người già uống quá liều.
- **Hiển thị & Cảnh báo âm thanh:** Trang bị màn hình LCD hiển thị chi tiết liều dùng và còi Buzzer phát âm thanh nhắc nhở khi đến giờ uống thuốc.
- **Kiểm tra nhả thuốc & Tuân thủ:** Tự động phát hiện thuốc đã rơi đủ số lượng hay chưa và giám sát xem bệnh nhân đã lấy thuốc ra uống hay chưa.
- **Cảnh báo người chăm sóc thời gian thực:** Phát hiện các bất thường hoặc việc bỏ lỡ liều dùng, lập tức đồng bộ trạng thái về server để gửi Email và thông báo trên ứng dụng di động cho phụ huynh/người chăm sóc.
- **Quản lý đa nền tảng:** Giao diện Web Dashboard và Mobile App hỗ trợ cài đặt lịch trình, quản lý đơn thuốc và theo dõi lịch sử uống thuốc từ xa.

## **Kiến trúc hệ thống**

1. **Phần cứng (Hardware):** Sử dụng vi điều khiển kết nối cơ cấu động cơ nhả thuốc, màn hình LCD, còi Buzzer và hệ thống cảm biến giám sát số lượng thuốc rơi cùng trạng thái lấy thuốc.
2. **Phần mềm (Software):** Bao gồm REST API Backend quản lý lịch trình, Web Dashboard cho quản trị viên/người dùng và Mobile App hỗ trợ trung tâm thông báo trong ứng dụng & kích hoạt gửi Email cảnh báo.
3. **Truyền thông (Communication):** Kết nối Wi-Fi độ trễ thấp sử dụng giao thức **Real-Time Streaming** giúp đồng bộ dữ liệu hai chiều tức thì giữa thiết bị phần cứng, máy chủ đám mây và các ứng dụng client.

## Cấu trúc dự án

```plain
├── apps/
│   ├── api/        # REST API / Backend dịch vụ quản lý lịch trình & thông báo
│   ├── mobile/     # Ứng dụng di động nhận cảnh báo dành cho người chăm sóc
│   └── web/        # Web Dashboard cho quản trị viên và người dùng thiết lập lịch
├── packages/
│   ├── eda/        # File thiết kế mạch điện tử & sơ đồ nguyên lý (EDA)
│   ├── contract/   # API Contract định nghĩa kiểu dữ liệu dùng chung (Shared Types)
│   ├── firmware/   # Mã nguồn nhúng cho vi điều khiển điều khiển hộp thuốc
│   ├── lib/        # Các thư viện & tiện ích dùng chung trong toàn bộ hệ thống
│   └── ui/         # Thư viện UI Components & Styles dùng chung cho Web/Mobile
├── docs/           # Tài liệu kỹ thuật & báo cáo đồ án
└── README.md       # Tổng quan dự án và hướng dẫn sử dụng
```

## Hướng phát triển tương lai

- **Tự động kiểm kê số lượng thuốc:** Ứng dụng công nghệ xử lý ảnh (Computer Vision) hoặc cảm biến trọng lượng để tự động đếm và quản lý số lượng thuốc còn lại trong hộp, loại bỏ việc phải nhập tay thủ công.

- **Nâng cấp khả năng nhận diện thuốc:** Nâng cấp từ cảm biến hồng ngoại (IR) hiện tại lên hệ thống camera/AI nhận diện thị giác để xác minh chính xác vật thể rớt xuống là thuốc (tránh nhận diện sai khi có vật thể lạ rơi vào).

- **Hệ thống tương tác giọng nói:** Tích hợp nhận diện giọng nói và phản hồi âm thanh giúp người già và trẻ em dễ dàng tương tác rảnh tay.

- **Quản lý đa người dùng:** Mở rộng khả năng phần cứng và phần mềm để hỗ trợ phân lịch uống thuốc riêng biệt cho nhiều thành viên (vừa cho ông bà, vừa cho cháu) trong cùng hộ gia đình.

- **Phân tích hành vi tuân thủ:** Sử dụng học máy (Machine Learning) để phân tích thói quen uống thuốc của bệnh nhân và dự đoán các nguy cơ bỏ lỡ liều dùng.

## Kết luận

Hệ thống **Rozumari** mang đến một giải pháp toàn diện kết hợp giữa phần cứng và phần mềm nhằm giải quyết vấn đề quên, uống sai liều hoặc tự ý lấy thuốc ở **người cao tuổi và trẻ nhỏ**. Bằng việc thay thế thao tác phân loại thuốc thủ công bằng cơ chế nhả thuốc tự động khóa an toàn, kiểm tra bằng cảm biến thời gian thực và gửi cảnh báo từ xa đa kênh, hệ thống giúp giảm thiểu tối đa các sai sót y tế nguy hiểm. Qua đó, Rozumari đem lại sự an tâm tuyệt đối cho các phụ huynh và người chăm sóc trong gia đình, góp phần nâng cao chất lượng theo dõi sức khỏe dài hạn.

## Giấy phép

Dự án này là mã nguồn mở và được phát hành theo Apache License 2.0. Xem file [LICENSE](https://github.com/tiesen243/graduation-thesis/blob/dev/LICENSE) để biết thêm chi tiết.
