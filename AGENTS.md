# SYSTEM ARCHITECTURE & MCP ENFORCEMENT RULES

> **BẮT BUỘC (MANDATORY STEP 0 PRE-FLIGHT):**
> Trước khi bắt đầu khởi tạo dự án, viết code mới, hoặc chỉnh sửa bất kỳ tính năng nào (Frontend / Backend / Fullstack), AI Agent **BẮT BUỘC** phải:
> 1. Đọc toàn bộ file `AGENTS.md` này đầu tiên.
> 2. Đọc các file quy tắc chuyên sâu trong `.agents/rules/` (hoặc `~/.gemini/config/rules/`):
>    - `01-frontend-rules.md` (Khi làm giao diện, UI/UX, Vue/Nuxt/React/Tailwind)
>    - `02-backend-rules.md` (Khi làm API, Database, Server, Service/Repository)
>    - `03-clean-code-zero-bloat.md` (Quy tắc chống code rác, chống trùng lặp, kiểm soát chất lượng)
> 3. Quét cấu trúc thư mục hiện tại (`src/components/`, `src/composables/`, `src/services/`, `src/utils/`, `src/types/`) trước khi tạo bất kỳ file hay hàm mới nào.
> 4. Nếu dự án mới chưa có cấu trúc chuẩn, chạy script khởi tạo `~/.gemini/config/scripts/init-standard-project.sh` trước khi viết code.

---

## 1. Quy tắc sử dụng MCP (Bắt buộc)
- **Context7 MCP (`context7`):** Luôn gọi `resolve-library-id` và `query-docs` của `context7` để tra cứu tài liệu mới nhất trước khi viết code cho thư viện bên thứ 3. Không tự bịa API.
- **UI MCP (`shadcn-vue` / `shadcn` / `magicui`):** Khi cần tạo UI component mới, ưu tiên kéo từ MCP về `src/components/ui/` thay vì tự viết từ đầu (`search_items_in_registries`, `view_items_in_registries`, `get_item_examples_from_registries`, `getRegistryItem`).
- **Sequential Thinking & Memory MCP (`sequential-thinking` / `memory`):** Với các bài toán kiến trúc phức tạp hoặc luồng nghiệp vụ nhiều bước, sử dụng `sequentialthinking` để phân tích trước khi code.
- **Playwright MCP (`playwright`):** Sau khi hoàn thành giao diện hoặc luồng tính năng web, sử dụng `playwright` (`browser_navigate`, `browser_snapshot`, `browser_console_messages`, `browser_take_screenshot`) để kiểm tra thực tế trên trình duyệt, đảm bảo không có lỗi Console/Network và không vỡ layout.
- **Filesystem & Diff (`filesystem` / `desktop-commander`):** Chỉ sửa đúng vùng code cần thiết, tuyệt đối không tạo các file backup rác như `index.old.js`, `ComponentCopy.vue`, `test2.js`.

## 2. Cấu trúc Thư mục Cố định (Không tự đẻ thư mục lạ)
- `src/components/ui/`: Chứa các base component từ shadcn/Inspira/MagicUI (Button, Input, Modal, Table).
- `src/components/common/`: Các component dùng chung toàn app (Header, Sidebar, DataTable).
- `src/features/<ten-module>/`: Chứa các component, logic riêng biệt của từng tính năng.
- `src/services/`: Chứa toàn bộ lệnh gọi API (axios/fetch). CẤM gọi API trực tiếp trong file `.vue` / `.tsx`.
- `src/composables/` & `src/utils/`: Chứa hàm xử lý logic, format dữ liệu, state.
- `src/types/`: Chứa toàn bộ định nghĩa TypeScript interfaces, types, DTOs và schemas dùng chung.
- `src/assets/`: Chứa tài nguyên tĩnh (icons, images, fonts) đã tối ưu.

## 3. Quy tắc Sạch Code (Zero-Bloat)
- Quét `src/components/` và `src/utils/` trước khi viết hàm/component mới để tránh trùng lặp 100%.
- Giới hạn tối đa 250 dòng/file. Nếu dài hơn phải tách nhỏ.
- Dùng Tailwind CSS hoàn toàn, không viết inline style hoặc tạo file `.css` lẻ tẻ.
- Xóa toàn bộ `console.log`, biến không dùng và code comment thừa sau khi hoàn thành task.
