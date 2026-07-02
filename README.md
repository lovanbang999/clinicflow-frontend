# Đồ án: Hệ thống Quản lý Đặt lịch khám và Xếp hàng thông minh (SmartClinic) - Frontend Portal

Dự án này là phân hệ **Frontend Portal** của hệ thống **SmartClinic** (Hệ thống Quản lý Đặt lịch khám và Xếp hàng thông minh). Ứng dụng được xây dựng trên nền tảng **Next.js 16** và **React 19**, mang lại giao diện hiện đại, tối ưu hiệu năng và cung cấp trải nghiệm sử dụng mượt mà cho 4 nhóm đối tượng người dùng: Bệnh nhân, Bác sĩ, Tiếp tân và Quản trị viên.

---

## 📝 Mục lục
- [1. Giới thiệu phân hệ Frontend](#1-giới-thiệu-phân-hệ-frontend)
- [2. Công nghệ sử dụng](#2-công-nghệ-sử-dụng)
- [3. Phân hệ Giao diện & Dashboard theo vai trò](#3-phân-hệ-giao-diện--dashboard-theo-vai-trò)
- [4. Cấu trúc thư mục mã nguồn](#4-cấu-trúc-thư-mục-mã-nguồn)
- [5. Quốc tế hóa (Internationalization - i18n)](#5-quốc-tế-hóa-internationalization---i18n)
- [6. Hướng dẫn cài đặt & Cấu hình](#6-hướng-dẫn-cài-đặt--cấu-hình)
- [7. Hướng dẫn chạy ứng dụng](#7-hướng-dẫn-chạy-ứng-dụng)
- [8. Các giải pháp kỹ thuật nổi bật](#8-các-giải-pháp-kỹ-thuật-nổi-bật)

---

## 1. Giới thiệu phân hệ Frontend

Phân hệ Frontend đóng vai trò là cổng giao tiếp trực tiếp của người dùng với hệ thống SmartClinic. Ứng dụng tập trung tối ưu hóa trải nghiệm người dùng (UX) thông qua các tiêu chí:
- **Tối ưu hóa thiết bị di động (Mobile-First Design):** Hỗ trợ hiển thị responsive mượt mà trên điện thoại, máy tính bảng và máy tính để bàn.
- **Hỗ trợ đa ngôn ngữ (Bilingual English/Vietnamese):** Bản địa hóa hoàn chỉnh nội dung giao diện.
- **Thời gian thực (Real-time updates):** Cập nhật liên tục trạng thái hàng đợi và lịch khám không cần tải lại trang.
- **Thiết kế hiện đại:** Tích hợp giao diện sáng/tối (Light/Dark mode) linh hoạt.

---

## 2. Công nghệ sử dụng

Hệ thống sử dụng các thư viện và công nghệ hiện đại, bám sát xu hướng phát triển web chuyên nghiệp:

### Khung làm việc & Thư viện UI
- **Khung chính (Core):** [Next.js (v16.1.0)](https://nextjs.org/) với kiến trúc **App Router** hiện đại.
- **Thư viện hiển thị:** [React (v19.2.3)](https://react.dev/) & [TypeScript](https://www.typescriptlang.org/).
- **CSS Framework:** [Tailwind CSS (v4.x)](https://tailwindcss.com/) - Thiết kế giao diện CSS-first tốc độ cao.
- **Thư viện thành phần (Component Library):** [shadcn/ui](https://ui.shadcn.com/) kết hợp [Radix UI](https://www.radix-ui.com/) cung cấp các thành phần giao diện chuẩn ARIA cho người khuyết tật.
- **Bộ biểu tượng:** [Lucide React (v0.562.0)](https://lucide.dev/).
- **Quản lý giao diện tối/sáng:** `next-themes`.

### Quản lý Trạng thái & Gọi API
- **Quản lý State toàn cục (Global State):** [Zustand (v5.0.9)](https://github.com/pmndrs/zustand) - Thay thế cho Redux cồng kềnh, tối ưu hóa quá trình render lại component.
- **Client gọi API:** [Axios (v1.13.2)](https://axios-http.com/) tích hợp cơ chế tự động xoay vòng Token (JWT Refresh Token Rotation Interceptor).
- **Kiểm soát form:** `React Hook Form` kết hợp với thư viện validate dữ liệu đầu vào `Zod`.
- **Thông báo toast:** `Sonner`.

---

## 3. Phân hệ Giao diện & Dashboard theo vai trò

Ứng dụng chia rõ các phân hệ riêng biệt tương ứng với từng quyền hạn người dùng thông qua hệ thống phân quyền định tuyến (Role-Based Route Guard):

### 🌐 1. Cổng thông tin công cộng (Public Portal)
- **Trang chủ giới thiệu (Landing Page):** Giới thiệu dịch vụ phòng khám, quy trình đặt lịch khám và phản hồi của bệnh nhân.
- **Danh bạ Bác sĩ (Doctor Directory):** Tìm kiếm và bộ lọc bác sĩ theo chuyên khoa, kinh nghiệm, lịch trống trực quan.
- **Danh mục Dịch vụ (Services Catalog):** Hiển thị chi tiết bảng giá các gói khám, thời lượng khám dự kiến.

### 👤 2. Phân hệ Bệnh nhân (Patient Dashboard)
- **Quy trình đặt lịch 4 bước (Multi-step Booking Flow):**
  `Chọn dịch vụ → Chọn bác sĩ → Chọn ngày & giờ khám → Xác nhận thông tin`
- **Gợi ý giờ khám thông minh (Smart Suggestions):** Hiển thị danh sách khung giờ trống tối ưu giúp bệnh nhân dễ lựa chọn.
- **Trang quản lý cá nhân:** Theo dõi lịch sử khám bệnh, trạng thái hiện tại của lịch hẹn, và theo dõi số thứ tự (STT) hàng đợi thời gian thực.
- **Cập nhật hồ sơ:** Thay đổi thông tin cá nhân và tải ảnh đại diện lên hệ thống.

### 👨‍⚕️ 3. Phân hệ Bác sĩ (Doctor Dashboard)
- **Quản lý lịch làm việc cá nhân:** Thiết lập lịch trực theo tuần, thiết lập giờ nghỉ giải lao và báo lịch nghỉ phép.
- **Danh sách ca khám:** Xem lịch khám hàng ngày dưới dạng bảng/lịch trực quan.
- **Giao diện khám bệnh:** Xem thông tin bệnh nhân, cập nhật bệnh án trực tuyến và thay đổi trạng thái ca khám sang hoàn thành (`COMPLETED`) hoặc vắng mặt (`NO_SHOW`).

### 👩‍💼 4. Phân hệ Tiếp đón (Receptionist Dashboard)
- **Màn hình Check-in:** Tìm kiếm nhanh bệnh nhân qua Tên, Số điện thoại hoặc Mã đặt lịch y tế để tiến hành Check-in đưa vào hàng đợi.
- **Điều phối Hàng đợi (Queue Board):** 
  - Xem danh sách hàng đợi thời gian thực của từng bác sĩ.
  - Thao tác thủ công: Gọi số tiếp theo, bỏ qua số, hoặc thay đổi mức độ ưu tiên đối với các ca bệnh nhân khẩn cấp.

### ⚙️ 5. Phân hệ Quản trị viên (Admin Dashboard)
- **Quản lý người dùng:** Thêm mới, cập nhật thông tin và phân quyền vai trò cho nhân viên phòng khám (Bác sĩ, Tiếp tân).
- **Cấu hình dịch vụ khám:** Thêm mới dịch vụ, cài đặt đơn giá, hình ảnh minh họa (lưu trữ Cloudinary) và cấu hình thời gian khám trung bình.

---

## 4. Cấu trúc thư mục mã nguồn

Thư mục dự án được tổ chức khoa học để quản lý cấu trúc định tuyến đa ngôn ngữ của Next.js App Router:

```
frontend/
├── public/                     # Tài nguyên tĩnh (Logo, Hình ảnh trống)
├── messages/                   # Chứa các file JSON bản dịch đa ngôn ngữ
│   ├── en/                    # Bản dịch tiếng Anh (auth, booking, common,...)
│   └── vi/                    # Bản dịch tiếng Việt (đồng bộ cấu trúc file)
├── src/
│   ├── app/                   # Định nghĩa các Route của Next.js App Router
│   │   ├── [locale]/          # Nhóm Route đa ngôn ngữ (ví dụ: /vi/login, /en/login)
│   │   │   ├── (auth)/        # Nhóm trang Xác thực (Đăng nhập, Đăng ký, OTP)
│   │   │   ├── (dashboard)/   # Nhóm trang Dashboard bảo vệ bởi Auth Guard
│   │   │   │   ├── patient/   # Dashboard cho Bệnh nhân
│   │   │   │   ├── doctor/    # Dashboard cho Bác sĩ
│   │   │   │   ├── receptionist/  # Dashboard cho Tiếp tân
│   │   │   │   └── admin/     # Dashboard cho Quản trị viên
│   │   │   ├── doctors/       # Trang danh mục bác sĩ công cộng
│   │   │   ├── services/      # Trang danh mục dịch vụ công cộng
│   │   │   ├── layout.tsx     # Layout gốc
│   │   │   └── page.tsx       # Trang chủ hệ thống
│   │   ├── api/               # Next.js Route Handlers (giao tiếp proxy API)
│   │   └── globals.css        # Khai báo biến CSS toàn cục và Tailwind v4
│   ├── components/            # Các React Components tái sử dụng
│   │   ├── booking/          # Các Component phục vụ luồng đặt lịch khám
│   │   ├── common/           # Các Component dùng chung (Loading, Avatar,...)
│   │   ├── dashboard/        # Widget phục vụ các Dashboard
│   │   ├── layout/           # Bố cục giao diện (Navbar, Sidebar, Footer)
│   │   ├── queue/            # Các giao diện liên quan đến hàng đợi y tế
│   │   └── ui/               # Danh sách UI primitives (Nút, Form, Hộp thoại từ shadcn/ui)
│   ├── i18n/                 # Thiết lập cấu hình đa ngôn ngữ next-intl
│   ├── lib/                  # Chứa logic và tích hợp các thư viện ngoài
│   │   ├── api/              # Định nghĩa Client gọi API Backend (Axios)
│   │   ├── store/            # Chứa các Kho lưu trữ trạng thái Zustand
│   │   │   ├── authStore.ts  # Trạng thái đăng nhập của người dùng & Token
│   │   │   ├── bookingStore.ts# Lưu trữ dữ liệu tạm thời khi đặt lịch khám
│   │   │   └── uiStore.ts    # Cấu hình UI như theme sáng/tối
│   │   └── utils/            # Các hàm tiện ích dùng chung
│   ├── styles/               # Chứa các cấu hình theme màu sắc
│   └── types/                # Định nghĩa kiểu dữ liệu TypeScript (DTO, Models)
├── .env.local                # File cấu hình môi trường của Frontend (Cần tạo)
├── .env.example              # File cấu hình môi trường mẫu
├── components.json           # File cấu hình của thư viện shadcn/ui
├── next.config.ts            # Cấu hình hệ thống Next.js
├── package.json              # Chứa thông tin thư viện sử dụng & scripts chạy
├── postcss.config.mjs        # Cấu hình biên dịch CSS PostCSS
└── tsconfig.json             # Cấu hình TypeScript
```

---

## 5. Quốc tế hóa (Internationalization - i18n)

Dự án hỗ trợ chuyển đổi ngôn ngữ linh hoạt bằng thư viện `next-intl`.

### Cấu trúc đa ngôn ngữ
Mọi từ ngữ hiển thị trên giao diện đều được cấu trúc hóa trong các file JSON tại thư mục `/messages`. Khi muốn hiển thị chữ trên UI, ta sử dụng hook `useTranslations`:
```tsx
import { useTranslations } from 'next-intl';

export default function WelcomeHeader() {
  const t = useTranslations('common');
  return <h1>{t('welcome')}</h1>; // Sẽ render ra tiếng Việt hoặc tiếng Anh tương ứng
}
```

---

## 6. Hướng dẫn cài đặt & Cấu hình

### Yêu cầu hệ thống
- **Node.js**: Phiên bản 18.x trở lên.
- **Yarn**: Quản lý gói phụ thuộc.
- **Backend API**: Đã được khởi chạy thành công tại địa chỉ `http://localhost:8080`.

### Các bước cài đặt

#### 1. Di chuyển vào thư mục Frontend
```bash
cd SmartClinic/frontend
```

#### 2. Cài đặt thư viện phụ thuộc
```bash
yarn install
```

#### 3. Tạo file cấu hình môi trường
Sao chép cấu hình mẫu từ `.env.example` tạo thành `.env.local`:
```bash
cp .env.example .env.local
```

Mở `.env.local` và cấu hình các biến sau:
```env
# Địa chỉ cơ sở kết nối với API Backend NestJS
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api

# Địa chỉ chạy Frontend
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Tên ứng dụng hiển thị trên trình duyệt
NEXT_PUBLIC_APP_NAME="SmartClinic"

# Ngôn ngữ mặc định của trang web (vi: Tiếng Việt, en: Tiếng Anh)
NEXT_PUBLIC_DEFAULT_LOCALE=vi
```

---

## 7. Hướng dẫn chạy ứng dụng

### Chạy chế độ nhà phát triển (Development Mode)
```bash
yarn dev
```
Giao diện sẽ chạy tại địa chỉ: **[http://localhost:3000](http://localhost:3000)** (Hoặc port hiển thị trên log terminal).

### Biên dịch dự án và chạy ở môi trường Production
Để hệ thống đạt hiệu năng tốt nhất trước khi demo/chạy thử nghiệm:
```bash
# Biên dịch mã nguồn tối ưu
yarn build

# Khởi chạy server production
yarn start
```

---

## 8. Các giải pháp kỹ thuật nổi bật

Trong báo cáo đồ án, bạn có thể nhấn mạnh các điểm kỹ thuật nổi bật sau của phân hệ Frontend:

### 1. Cơ chế Tự động làm mới Token (Silent JWT Refresh Rotation)
Sử dụng Axios interceptor để bắt lỗi `401 Unauthorized`. Khi Access Token hết hạn, client tự động gửi yêu cầu `/auth/refresh` bằng Refresh Token lưu ở bộ nhớ an toàn để lấy cặp token mới rồi thực hiện lại request lỗi ban đầu. Người dùng sẽ không hề nhận biết hệ thống bị hết hạn phiên đăng nhập khi họ vẫn đang hoạt động.

### 2. Bảo vệ Định tuyến động (Dynamic Route Guards)
Tận dụng Next.js Middleware và React Route Guards để kiểm tra quyền hạn của người dùng trước khi tải trang. Nếu người dùng cố tình truy cập thủ công vào trang Admin (`/admin/...`) bằng tài khoản Patient, hệ thống sẽ tự động chuyển hướng người dùng về trang Dashboard hợp lệ của họ.

### 3. Tối ưu hóa render qua Zustand Stores
Zustand giúp quản lý luồng đặt lịch khám phức tạp gồm nhiều bước mà không xảy ra hiện tượng "prop drilling" (truyền prop qua nhiều tầng component). Trạng thái được chia nhỏ giúp chỉ các component liên quan cập nhật, mang lại tốc độ phản hồi giao diện tức thì.

---
*Dự án thuộc đề tài Đồ án tốt nghiệp / Đồ án chuyên ngành.*
*Người thực hiện: Lò Văn Bằng - Mã số sinh viên: 2251061721*
*Giáo viên hướng dẫn: TS. Nguyễn Tu Trung*
