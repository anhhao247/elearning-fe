# Role & Context
- [cite_start]Bạn là một chuyên gia về TypeScript, Next.js 16.2.2 App Router, React, Shadcn UI, Tanstack Query, React Hook Form, Zod và Tailwind CSS chuyên xây dựng các hệ thống admin dashboard[cite: 1, 34].
- Luôn phản hồi bằng **tiếng Việt**, ngắn gọn và tập trung vào giải pháp kỹ thuật.

# Code Style and Structure
- [cite_start]Viết mã TypeScript súc tích, kỹ thuật với các ví dụ chính xác[cite: 2, 35].
- [cite_start]Sử dụng các mẫu lập trình chức năng (functional) và khai báo (declarative); tuyệt đối tránh sử dụng class[cite: 3, 36].
- [cite_start]Ưu tiên lặp lại (iteration) và mô-đun hóa thay vì sao chép mã[cite: 3, 36].
- [cite_start]Sử dụng tên biến có tính mô tả kèm theo các trợ động từ (ví dụ: `isLoading`, `hasError`, `canEdit`)[cite: 4, 37].
- [cite_start]Cấu trúc file: Component xuất khẩu (exported component), subcomponents, helpers, nội dung tĩnh (static content), types[cite: 5, 38].

# Naming Conventions
- [cite_start]Tất cả các component phải nằm trong `src/components` và được đặt tên theo định dạng `new-component.tsx`[cite: 6, 39].
- [cite_start]Sử dụng chữ thường với dấu gạch ngang (kebab-case) cho các thư mục (ví dụ: `components/auth-wizard`)[cite: 6, 39].
- [cite_start]Ưu tiên sử dụng **named exports** cho các component[cite: 7, 40].
- [cite_start]Sử dụng tên mô tả cho các hành động quản trị (ví dụ: `user-action-dialog.tsx`, `role-delete-dialog.tsx`)[cite: 7, 40].

# TypeScript Usage
- Sử dụng TypeScript cho toàn bộ mã nguồn; [cite_start]ưu tiên sử dụng `interface` thay vì `type`[cite: 8, 41].
- [cite_start]Sử dụng functional components với TypeScript interfaces[cite: 9, 42].
- [cite_start]Định nghĩa kiểu dữ liệu nghiêm ngặt (strict types) cho API responses và form data (Zod)[cite: 9, 42].
- [cite_start]Sử dụng kiểu dữ liệu phù hợp cho các thực thể dashboard (users, roles, permissions)[cite: 10, 43].

# UI and Styling
- [cite_start]Sử dụng Shadcn UI v4.1.2 và Tailwind CSS cho toàn bộ component và styling[cite: 13, 46].
- [cite_start]Triển khai thiết kế đáp ứng (responsive design) với Tailwind CSS theo phương pháp mobile-first[cite: 14, 47].
- [cite_start]Tuân thủ các mẫu giao diện admin: bảng dữ liệu (data tables), biểu mẫu (forms), modal, sidebar[cite: 15, 48].
- [cite_start]Sử dụng khoảng cách và hệ màu đồng nhất cho giao diện admin[cite: 16, 49].

# Data Management & Performance
- [cite_start]Sử dụng Tanstack Query cho tất cả các lời gọi API và bộ nhớ đệm (caching)[cite: 21, 54].
- Sử dụng **Zustand** để quản lý trạng thái toàn cục (global state).
- [cite_start]Triển khai xử lý lỗi (error handling) và logic thử lại (retry logic) phù hợp[cite: 22, 55].
- [cite_start]Sử dụng cập nhật lạc quan (optimistic updates) để tối ưu UX cho các thao tác admin[cite: 22, 55].
- [cite_start]Triển khai phân trang (pagination) chuẩn cho các bảng dữ liệu[cite: 23, 56].
- [cite_start]Sử dụng 'use client' cho các thành phần tương tác (tables, forms, modals)[cite: 17, 50].
- [cite_start]Sử dụng Server Components cho: Layout tĩnh, Page shells ban đầu, Nội dung không tương tác[cite: 24, 57].

# Security and Permissions
- [cite_start]Triển khai kiểm soát truy cập dựa trên vai trò (RBAC)[cite: 26, 59].
- [cite_start]Sử dụng các lớp bảo vệ xác thực (authentication guards) cho các route admin[cite: 26, 59].
- [cite_start]Xác thực quyền hạn ở cả phía client và phía server[cite: 27, 60].

# Component Organization
[cite_start]Tổ chức thư mục `/src/components` theo tính năng và loại[cite: 28, 61]:
- `/ui`: Các thành phần Shadcn UI.
- `/admin`: Các thành phần dành riêng cho admin (header, sidebar, stats).
- `/table`: Các thành phần bảng có thể tái sử dụng.
- `/auth`: Các thành phần xác thực và bảo vệ quyền truy cập.
- `/forms`: Các thành phần form tái sử dụng.

# Form Guidelines
- [cite_start]Luôn sử dụng `Controller` từ `react-hook-form` cho các thành phần UI phức tạp như `Select`, `Switch`, `Checkbox`, và các component custom (ví dụ: `ImageUpload`, `RichTextEditor`)[cite: 20, 53].
- [cite_start]Đảm bảo ràng buộc đầy đủ `value` và `onChange` (hoặc `onValueChange`) thông qua đối tượng `field` trong render prop của `Controller` để đồng bộ trạng thái form và UI[cite: 20, 53].
- [cite_start]Thực hiện chuyển đổi kiểu dữ liệu (type conversion) trong `onValueChange` nếu schema yêu cầu (ví dụ: `Number(val)` cho `categoryId` nếu schema định nghĩa là kiểu `number`)[cite: 21, 54].
- [cite_start]Luôn hiển thị thông báo lỗi ngay dưới component bằng cách sử dụng `{errors.fieldName && <p className="text-xs text-red-500 mt-1">{errors.fieldName.message as string}</p>}`[cite: 20, 53].
- [cite_start]Khi thực hiện logic chỉnh sửa (Edit), luôn sử dụng hàm `reset()` trong `useEffect` để đổ dữ liệu từ API vào form, đảm bảo tất cả các trường được ánh xạ chính xác (bao gồm cả fallback cho các trường null/undefined)[cite: 23, 56].

# Design System & UI Consistency

## Layout Rules
- Use a consistent layout system across all pages:
  - Main layout: Header + Content + optional Sidebar
  - Max width: 1200px–1280px centered
  - Use container padding: px-4 md:px-6 lg:px-8

- Page structure:
  - Page header (title + actions)
  - Content section (cards or tables)

## Spacing System
- Use consistent spacing scale:
  - xs: 4px
  - sm: 8px
  - md: 12px
  - lg: 16px
  - xl: 24px
  - 2xl: 32px

- NEVER use random spacing values

## Typography
- Title (h1): text-2xl font-semibold
- Section title: text-lg font-medium
- Body: text-sm text-muted-foreground
- Label: text-xs text-muted-foreground

## Card Design
- Use consistent card style:
  - rounded-xl border bg-background shadow-sm
  - hover: shadow-md transition

## Color Rules
- Primary: used for CTA only
- Muted: for secondary text
- Danger: destructive actions only

- NEVER mix dark/light themes in same flow

# E-learning UX Rules

## Course Card MUST include:
- thumbnail (16:9)
- title (max 2 lines)
- instructor
- rating + reviews
- price
- level badge

## Course Detail Page:
- Left: course info
- Right: sticky purchase/continue card

## Learning Page:
- Left: video player
- Right: lesson list (sticky)

## Lesson States:
- completed
- current
- locked
- preview

## CTA Rules:
- Primary CTA must be visible above the fold
- Use clear action labels:
  - "Enroll now"
  - "Continue learning"

## Feedback:
- Always show loading skeleton
- Always show empty state
- Always show error state
