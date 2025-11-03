# Chrome Không Cache - Tự Động Reset

## Mô tả
Script này giúp bạn mở Google Chrome với profile tạm thời, không lưu cache, cookies, history, hoặc bất kỳ dữ liệu nào. Khi đóng Chrome, tất cả dữ liệu sẽ được tự động xóa.

## Các file có sẵn

### 1. `open-chrome-no-cache.bat` (Khuyến nghị)
- **Cách sử dụng**: Double-click để chạy
- **Ưu điểm**: Đơn giản, dễ sử dụng, không cần cấu hình gì thêm
- **Hạn chế**: Ít tùy chọn hơn

### 2. `open-chrome-no-cache.ps1` (Nâng cao)
- **Cách sử dụng**: 
  ```powershell
  .\open-chrome-no-cache.ps1
  # Hoặc với URL tùy chỉnh:
  .\open-chrome-no-cache.ps1 -Url "https://example.com"
  # Hoặc không dùng incognito:
  .\open-chrome-no-cache.ps1 -Incognito:$false
  ```
- **Ưu điểm**: Nhiều tùy chọn, có thể tùy chỉnh URL
- **Hạn chế**: Cần PowerShell

## Tính năng

### ✅ Những gì script sẽ làm:
- Mở Chrome với profile tạm thời
- Không lưu cache, cookies, history
- Không lưu passwords, bookmarks
- Tắt tất cả extensions
- Tự động xóa dữ liệu khi đóng
- Hỗ trợ incognito mode

### ❌ Những gì script KHÔNG làm:
- Không ảnh hưởng đến Chrome profile chính của bạn
- Không thay đổi cài đặt Chrome mặc định
- Không ảnh hưởng đến các ứng dụng khác

## Yêu cầu hệ thống

- **Hệ điều hành**: Windows 10/11
- **Phần mềm**: Google Chrome đã cài đặt
- **Quyền**: Không cần quyền admin

## Cách sử dụng chi tiết

### Sử dụng file .bat (Đơn giản nhất)
1. Double-click vào file `open-chrome-no-cache.bat`
2. Chrome sẽ mở với profile tạm thời
3. Sử dụng Chrome bình thường
4. Đóng Chrome khi xong
5. Script sẽ tự động xóa dữ liệu

### Sử dụng file .ps1 (Nâng cao)
1. Mở PowerShell
2. Di chuyển đến thư mục chứa file
3. Chạy lệnh:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   .\open-chrome-no-cache.ps1
   ```

## Lưu ý quan trọng

⚠️ **Cảnh báo**: 
- Tất cả dữ liệu sẽ bị mất khi đóng Chrome
- Không lưu được passwords, bookmarks, history
- Chỉ phù hợp cho việc duyệt web tạm thời

## Khắc phục sự cố

### Lỗi "Không tìm thấy Google Chrome"
- Đảm bảo Chrome đã được cài đặt
- Kiểm tra Chrome có ở đường dẫn mặc định không

### Lỗi PowerShell Execution Policy
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Chrome không mở được
- Thử chạy file .bat thay vì .ps1
- Kiểm tra Chrome có bị lỗi không

## Tùy chỉnh

### Thay đổi URL mặc định
Sửa file .bat, thay đổi dòng cuối cùng:
```batch
https://www.google.com
```

### Thêm tham số khác
Thêm các tham số Chrome khác vào danh sách argument trong script.

## Bảo mật

Script này:
- ✅ Không gửi dữ liệu đi đâu
- ✅ Chỉ chạy trên máy tính của bạn
- ✅ Không cần kết nối internet để hoạt động
- ✅ Tự động xóa dữ liệu khi hoàn thành

## Hỗ trợ

Nếu gặp vấn đề, hãy kiểm tra:
1. Chrome có hoạt động bình thường không
2. Có đủ quyền ghi file không
3. Antivirus có chặn script không
