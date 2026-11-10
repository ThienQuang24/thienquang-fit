#!/bin/bash
set -e

TARGET_DIR="${1:-.}"
cd "$TARGET_DIR"

# 1. Tạo cấu trúc thư mục chuẩn chống rác (Frontend + Backend)
mkdir -p src/{components/ui,components/common,features,composables,services,utils,types,assets}
mkdir -p src/{controllers,repositories,middlewares,validators,config}
mkdir -p .agents/{rules,skills}

# 2. Sinh file AGENTS.md ép AI tuân thủ MCP và cấu trúc thư mục
cat << 'EOF' > AGENTS.md
# SYSTEM ARCHITECTURE & MCP ENFORCEMENT RULES

> **BẮT BUỘC (MANDATORY STEP 0 PRE-FLIGHT):**
> Trước khi bắt đầu khởi tạo dự án, viết code mới, hoặc chỉnh sửa bất kỳ tính năng nào (Frontend / Backend / Fullstack), AI Agent **BẮT BUỘC** phải:
> 1. Đọc toàn bộ file `AGENTS.md` này đầu tiên.
> 2. Đọc các file quy tắc chuyên sâu trong `.agents/rules/` (hoặc `~/.gemini/config/rules/`):
>    - `01-frontend-rules.md` (Khi làm giao diện, UI/UX, Vue/Nuxt/React/Tailwind)
>    - `02-backend-rules.md` (Khi làm API, Database, Server, Service/Repository)
>    - `03-clean-code-zero-bloat.md` (Quy tắc chống code rác, chống trùng lặp, kiểm soát chất lượng)
> 3. Quét cấu trúc thư mục hiện tại (`src/components/`, `src/composables/`, `src/services/`, `src/utils/`, `src/types/`) trước khi tạo bất kỳ file hay hàm mới nào.

---

## 1. Quy tắc sử dụng MCP (Bắt buộc)
- **Context7 MCP (`context7`):** Luôn gọi `context7` (`resolve-library-id` & `query-docs`) để tra cứu tài liệu mới nhất trước khi viết code cho thư viện bên thứ 3. Không tự bịa API.
- **UI MCP (`shadcn-vue` / `shadcn` / `magicui`):** Khi cần tạo UI component mới, ưu tiên kéo từ MCP về `src/components/ui/` thay vì tự viết từ đầu.
- **Playwright MCP (`playwright`):** Sau khi hoàn thành UI/luồng tính năng, dùng `playwright` để kiểm tra giao diện thực tế và đảm bảo 0 lỗi Console.
- **Filesystem & Diff (`filesystem` / `desktop-commander`):** Chỉ sửa đúng vùng code cần thiết, tuyệt đối không tạo các file backup rác như `index.old.js`, `ComponentCopy.vue`, `test2.js`.

## 2. Cấu trúc Thư mục Cố định (Không tự đẻ thư mục lạ)
- `src/components/ui/`: Chứa các base component từ shadcn/Inspira/MagicUI (Button, Input, Modal, Table).
- `src/components/common/`: Các component dùng chung toàn app (Header, Sidebar, DataTable).
- `src/features/<ten-module>/`: Chứa các component, logic riêng biệt của từng tính năng.
- `src/services/`: Chứa toàn bộ lệnh gọi API (axios/fetch) hoặc Business Logic. CẤM gọi API trực tiếp trong file `.vue` / `.tsx`.
- `src/composables/` & `src/utils/`: Chứa hàm xử lý logic, format dữ liệu, state.
- `src/types/`: Chứa toàn bộ định nghĩa TypeScript interfaces, types, DTOs dùng chung.
- `src/controllers/`, `src/repositories/`, `src/middlewares/`, `src/validators/`: Cấu trúc chuẩn cho tầng Backend API.

## 3. Quy tắc Sạch Code (Zero-Bloat)
- Quét `src/components/` và `src/utils/` trước khi viết hàm/component mới để tránh trùng lặp 100%.
- Giới hạn tối đa 250 dòng/file. Nếu dài hơn phải tách nhỏ.
- Dùng Tailwind CSS hoàn toàn, không viết inline style hoặc tạo file `.css` lẻ tẻ.
- Xóa toàn bộ `console.log`, biến không dùng và code comment thừa sau khi hoàn thành task.
EOF

# 3. Liên kết bộ quy tắc chuẩn từ ~/.gemini/config/rules vào .agents/rules
if [ -d "$HOME/.gemini/config/rules" ]; then
  for rule_file in 01-frontend-rules.md 02-backend-rules.md 03-clean-code-zero-bloat.md; do
    if [ -f "$HOME/.gemini/config/rules/$rule_file" ]; then
      ln -sf "$HOME/.gemini/config/rules/$rule_file" ".agents/rules/$rule_file"
    fi
  done
fi

echo "Đã khởi tạo xong cấu trúc thư mục chuẩn và file quy tắc AGENTS.md tại: $(pwd)"
