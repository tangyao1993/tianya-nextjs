import mysql from 'mysql2/promise';

// 数据库连接配置
const dbConfig = {
  host: process.env.DB_HOST || '146.56.246.38',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'wznba778899',
  database: process.env.DB_NAME || 'tianya',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
};

// 创建连接池
const pool = mysql.createPool(dbConfig);

export default pool;

// 数据库操作辅助函数
export async function query(sql: string, params?: any[]) {
  const connection = await pool.getConnection();
  try {
    const [results] = await connection.execute(sql, params);
    return results;
  } finally {
    connection.release();
  }
}

// 帖子相关操作
export const postDb = {
  // 获取所有帖子
  async findAll(options?: { category?: string; limit?: number; offset?: number }) {
    const { category, limit = 100, offset = 0 } = options || {};
    let sql = 'SELECT id, title, author, category, summary, tags, view_count, reply_count, like_count, created_at FROM posts';
    const params: any[] = [];

    if (category) {
      sql += ' WHERE category = ?';
      params.push(category);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    return query(sql, params) as any;
  },

  // 获取帖子总数
  async count(category?: string) {
    let sql = 'SELECT COUNT(*) as total FROM posts';
    const params: any[] = [];

    if (category) {
      sql += ' WHERE category = ?';
      params.push(category);
    }

    const result = await query(sql, params) as any;
    return result[0].total;
  },

  // 根据ID获取帖子详情
  async findById(id: number) {
    const sql = 'SELECT * FROM posts WHERE id = ?';
    const result = await query(sql, [id]) as any;
    return result[0];
  },

  // 搜索帖子
  async search(keyword: string, limit = 20) {
    const sql = `
      SELECT id, title, author, category, summary, tags, view_count, reply_count, created_at
      FROM posts
      WHERE MATCH(title, content_text, summary) AGAINST(? IN NATURAL LANGUAGE MODE)
      ORDER BY created_at DESC
      LIMIT ?
    `;
    return query(sql, [keyword, limit]) as any;
  },

  // 创建帖子
  async create(post: {
    title: string;
    author?: string;
    category?: string;
    original_filename?: string;
    pdf_path?: string;
    content?: string;
    content_text?: string;
    summary?: string;
    tags?: string;
  }) {
    const sql = `
      INSERT INTO posts (title, author, category, original_filename, pdf_path, content, content_text, summary, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [
      post.title,
      post.author || null,
      post.category || null,
      post.original_filename || null,
      post.pdf_path || null,
      post.content || null,
      post.content_text || null,
      post.summary || null,
      post.tags || null
    ]) as any;

    return result.insertId;
  },

  // 更新浏览量
  async incrementViews(id: number) {
    const sql = 'UPDATE posts SET view_count = view_count + 1 WHERE id = ?';
    await query(sql, [id]);
  },

  // 获取所有分类
  async getCategories() {
    const sql = 'SELECT DISTINCT category FROM posts WHERE category IS NOT NULL ORDER BY category';
    return query(sql) as any;
  }
};

// AI解读相关操作
export const aiAnalysisDb = {
  // 获取帖子的AI解读
  async findByPostId(postId: number, type?: string) {
    let sql = 'SELECT * FROM ai_analysis WHERE post_id = ?';
    const params: any[] = [postId];

    if (type) {
      sql += ' AND analysis_type = ?';
      params.push(type);
    }

    sql += ' ORDER BY created_at DESC';
    return query(sql, params) as any;
  },

  // 创建AI解读
  async create(analysis: {
    post_id: number;
    analysis_type?: string;
    content: string;
    model_version?: string;
  }) {
    const sql = `
      INSERT INTO ai_analysis (post_id, analysis_type, content, model_version)
      VALUES (?, ?, ?, ?)
    `;
    const result = await query(sql, [
      analysis.post_id,
      analysis.analysis_type || 'summary',
      analysis.content,
      analysis.model_version || null
    ]) as any;

    return result.insertId;
  }
};

// 用户AI使用记录
export const userAiUsageDb = {
  // 获取今日使用次数
  async getDailyUsage(sessionId: string): Promise<number> {
    const sql = `
      SELECT COUNT(*) as count
      FROM user_ai_usage
      WHERE session_id = ?
      AND DATE(created_at) = CURDATE()
    `;
    const result = await query(sql, [sessionId]) as any;
    return result[0].count;
  },

  // 创建记录
  async create(record: {
    session_id: string;
    post_id?: number;
    question: string;
    answer?: string;
    tokens_used?: number;
  }) {
    const sql = `
      INSERT INTO user_ai_usage (session_id, post_id, question, answer, tokens_used)
      VALUES (?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [
      record.session_id,
      record.post_id || null,
      record.question,
      record.answer || null,
      record.tokens_used || 0
    ]) as any;

    return result.insertId;
  }
};

// PDF处理状态
export const pdfProcessDb = {
  // 获取处理状态
  async findByPath(pdfPath: string) {
    const sql = 'SELECT * FROM pdf_process_status WHERE pdf_path = ?';
    const result = await query(sql, [pdfPath]) as any;
    return result[0];
  },

  // 创建或更新状态
  async upsert(pdfPath: string, status: string, errorMessage?: string) {
    const sql = `
      INSERT INTO pdf_process_status (pdf_path, status, error_message)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
        status = VALUES(status),
        error_message = VALUES(error_message),
        updated_at = CURRENT_TIMESTAMP
    `;
    await query(sql, [pdfPath, status, errorMessage || null]);
  },

  // 获取待处理的PDF
  async getPending(limit = 10) {
    const sql = `
      SELECT * FROM pdf_process_status
      WHERE status = 'pending'
      ORDER BY created_at ASC
      LIMIT ?
    `;
    return query(sql, [limit]) as any;
  }
};
