  📊 数据库表结构

  创建了以下表：
  1. posts - 帖子表（标题、作者、分类、内容、摘要、标签等）
  2. ai_analysis - AI解读表
  3. user_ai_usage - 用户AI使用记录表
  4. pdf_process_status - PDF处理状态表

  🔧 已创建的文件

  | 文件路径                    | 说明                 |
  |-----------------------------|----------------------|
  | database/schema.sql         | 数据库表结构定义     |
  | lib/db.ts                   | 数据库连接和操作封装 |
  | app/api/posts/route.ts      | 帖子列表 API         |
  | app/api/posts/[id]/route.ts | 帖子详情 API         |
  | app/api/categories/route.ts | 分类列表 API         |
  | app/api/ai/analyze/route.ts | AI 解读 API          |
  | scripts/init-db.ts          | 数据库初始化脚本     |
  | scripts/import-pdfs.ts      | PDF 导入脚本         |
  | .env.local                  | 环境变量配置         |

  🚀 使用步骤

  1. 确保数据库已初始化
  # 数据库已初始化完成 ✅

  2. 启动 MineRU 服务
  # 确保 MineRU 服务在 http://localhost:7777 运行

  3. 配置 OpenAI API Key
  编辑 .env.local 文件，添加：
  OPENAI_API_KEY=你的密钥

  4. 导入 PDF 数据
  npm run import:pdfs

  这个脚本会：
  - 扫描 tiezi_extracted 目录下的所有 PDF 文件
  - 调用 MineRU API 转换为 Markdown
  - 解析文件名获取帖子信息
  - 存储到数据库中

  5. 启动开发服务器
  npm run dev

  访问 http://localhost:3000 即可查看

  ✨ 新功能特性

  1. 从数据库动态获取帖子 - 不再使用 MOCK 数据
  2. Markdown 内容渲染 - 支持 PDF 转换后的 Markdown 格式
  3. 分类筛选 - 从数据库获取实际分类
  4. AI 快捷解读 - 5种专业分析按钮：
    - 内容摘要
    - 核心要点
    - 时代背景
    - 深度分析
    - 预测验证
  5. 智能问答 - 基于帖子内容的 AI 对话
  6. 使用次数限制 - 每日3次，存储在 localStorage

  📝 注意事项

  1. 确保 MineRU API 服务正在运行
  2. 确保数据库连接配置正确
  3. PDF 导入可能需要较长时间，取决于文件数量和大小
  4. AI 功能需要有效的 OpenAI API Key

  系统已准备就绪！你可以运行 npm run import:pdfs 开始导入 PDF 数据了。