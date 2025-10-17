# 🥊 One Punch Man Series Grouping Test Guide

## 🎯 **Mục Tiêu:**
Đảm bảo tính năng nhóm phim hoạt động chính xác với One Punch Man series, tương tự như cách RoPhim hiển thị.

## 🚀 **Cách Test:**

### **Option 1: Test Chuyên Dụng**
```
Truy cập: http://localhost:5173/one-punch-man-test
```

### **Option 2: Test Trong Tìm Kiếm**
```
1. Truy cập: http://localhost:5173/search-test
2. Click "đấm" hoặc nhập "one punch man"
3. Click "Tìm Kiếm"
4. Kiểm tra kết quả nhóm phim
```

## 📊 **Dữ Liệu Test:**

### **4 Phim One Punch Man:**
```
1. Đấm Phát Chết Luôn - Phần 1 HD Vietsub (2015)
2. Đấm Phát Chết Luôn - Phần 2 HD Vietsub (2019)  
3. Đấm Phát Chết Luôn - Phần 3 HD Vietsub (2025)
4. One Punch Man OVA (2016)
```

## ✅ **Kết Quả Mong Đợi:**

### **Chế độ "Hiển thị tất cả":**
```
📱 Hiển thị 4 phim riêng biệt
- Đấm Phát Chết Luôn - Phần 1 HD Vietsub
- Đấm Phát Chết Luôn - Phần 2 HD Vietsub
- Đấm Phát Chết Luôn - Phần 3 HD Vietsub
- One Punch Man OVA
```

### **Chế độ "Nhóm theo series":**
```
📱 Hiển thị 1 phim duy nhất
- Đấm Phát Chết Luôn (4 Phần) ← Badge hiển thị
  ├─ Phần 3 (2025) - Đại diện (mới nhất)
  ├─ Phần 2 (2019)
  ├─ Phần 1 (2015)
  └─ OVA (2016)
```

## 🔍 **Logic Nhóm Phim:**

### **Series Key Creation:**
```
Input: "Đấm Phát Chết Luôn - Phần 1 HD Vietsub"
↓
Clean: "Đấm Phát Chết Luôn"
↓
Normalize: "one punch man"
↓
Series Key: "one punch man"
```

### **Part Number Extraction:**
```
Input: "Đấm Phát Chết Luôn - Phần 1 HD Vietsub"
↓
Pattern Match: "Phần 1"
↓
Part Number: 1
```

### **Representative Selection:**
```
All Parts: [Phần 1 (2015), Phần 2 (2019), Phần 3 (2025), OVA (2016)]
↓
Sort by Part Number: [Phần 3 (2025), Phần 2 (2019), Phần 1 (2015), OVA (2016)]
↓
Select First: Phần 3 (2025) - Mới nhất
```

## 🎨 **UI Features:**

### **SeriesMovieCard:**
- 🏷️ **Badge "4 Phần"** trên poster
- 📊 **Thông tin series** trong tên phim
- 🎯 **Part indicator** hiển thị phần hiện tại

### **SeriesPartsSection (Chi tiết):**
- 📋 **Grid layout** hiển thị tất cả phần
- 🔗 **Link trực tiếp** đến từng phần
- ⭐ **Highlight** phần đang xem
- 📅 **Thông tin chi tiết** (năm, chất lượng, tập)

## 🧪 **Test Cases:**

### **1. Basic Grouping Test:**
```javascript
// Input: 4 One Punch Man movies
// Expected: 1 representative movie
// Actual: ✅ 1 movie with 4 parts
```

### **2. Series Key Test:**
```javascript
// Test different naming patterns:
"Đấm Phát Chết Luôn - Phần 1" → "one punch man" ✅
"One Punch Man Season 2" → "one punch man" ✅
"Đấm Phát Chết Luôn OVA" → "one punch man" ✅
```

### **3. Part Number Test:**
```javascript
// Test part extraction:
"Phần 1" → 1 ✅
"Season 2" → 2 ✅
"Part 3" → 3 ✅
"OVA" → 1 ✅ (default)
```

### **4. Representative Selection:**
```javascript
// Test selection logic:
[Phần 1 (2015), Phần 2 (2019), Phần 3 (2025)]
→ Phần 3 (2025) selected ✅ (highest part number)
```

## 🔧 **Advanced Features:**

### **Name Normalization:**
```javascript
// Vietnamese to English mapping:
"đấm phát chết luôn" → "one punch man"
"tấn công khổng lồ" → "attack on titan"
"thanh gươm diệt quỷ" → "demon slayer"
```

### **Quality & Language Filtering:**
```javascript
// Remove quality indicators:
"HD", "FHD", "4K", "CAM", "TS", "TC" → removed
// Remove language indicators:
"Vietsub", "Thuyết minh", "Lồng tiếng" → removed
```

## 📱 **Responsive Design:**

- 📱 **Mobile:** 2-3 cột, compact layout
- 💻 **Tablet:** 4-5 cột, balanced spacing
- 🖥️ **Desktop:** 6+ cột, full details

## 🐛 **Troubleshooting:**

### **Nếu Không Nhóm Được:**
1. Check console log (F12)
2. Verify series key creation
3. Test with different naming patterns
4. Check part number extraction

### **Nếu Hiển Thị Sai:**
1. Verify representative selection
2. Check sorting logic
3. Test with different years/parts
4. Verify badge display

---

## 🎉 **Kết Luận:**

Với logic nhóm phim được cải thiện, One Punch Man series sẽ được hiển thị chính xác như RoPhim:

- ✅ **1 phim đại diện** thay vì 4 phim riêng biệt
- ✅ **Badge "4 Phần"** hiển thị tổng số phần
- ✅ **Phần 3 (2025)** được chọn làm đại diện
- ✅ **Trang chi tiết** hiển thị tất cả phần
- ✅ **UI/UX** tương tự RoPhim

**Test ngay:** `http://localhost:5173/one-punch-man-test` 🚀
