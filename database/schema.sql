-- 天涯神帖数据库表结构设计

-- 创建数据库
CREATE DATABASE IF NOT EXISTS tianya CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tianya;

-- 帖子表
CREATE TABLE IF NOT EXISTS posts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(500) NOT NULL COMMENT '帖子标题',
  author VARCHAR(100) COMMENT '作者',
  category VARCHAR(50) COMMENT '分类',
  original_filename VARCHAR(255) COMMENT '原始文件名',
  pdf_path VARCHAR(500) COMMENT 'PDF文件路径',
  content LONGTEXT COMMENT 'Markdown格式内容',
  content_text LONGTEXT COMMENT '纯文本内容（用于搜索）',
  summary TEXT COMMENT '摘要',
  tags JSON COMMENT '标签数组',
  view_count INT DEFAULT 0 COMMENT '浏览量',
  reply_count INT DEFAULT 0 COMMENT '回复数',
  like_count INT DEFAULT 0 COMMENT '点赞数',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_category (category),
  INDEX idx_title (title),
  FULLTEXT INDEX ft_content (title, content_text, summary)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='帖子表';

-- AI解读表
CREATE TABLE IF NOT EXISTS ai_analysis (
  id INT PRIMARY KEY AUTO_INCREMENT,
  post_id INT NOT NULL COMMENT '帖子ID',
  analysis_type ENUM('summary', 'key_points', 'background', 'analysis', 'prediction') DEFAULT 'summary' COMMENT '解读类型',
  content TEXT NOT NULL COMMENT '解读内容',
  model_version VARCHAR(50) COMMENT 'AI模型版本',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  INDEX idx_post_id (post_id),
  INDEX idx_type (analysis_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI解读表';

-- 用户AI使用记录表
CREATE TABLE IF NOT EXISTS user_ai_usage (
  id INT PRIMARY KEY AUTO_INCREMENT,
  session_id VARCHAR(100) NOT NULL COMMENT '会话ID',
  post_id INT COMMENT '帖子ID',
  question TEXT NOT NULL COMMENT '用户问题',
  answer TEXT COMMENT 'AI回答',
  tokens_used INT DEFAULT 0 COMMENT '使用的token数',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE SET NULL,
  INDEX idx_session_id (session_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户AI使用记录表';

-- PDF处理状态表
CREATE TABLE IF NOT EXISTS pdf_process_status (
  id INT PRIMARY KEY AUTO_INCREMENT,
  pdf_path VARCHAR(500) NOT NULL UNIQUE COMMENT 'PDF文件路径',
  status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending' COMMENT '处理状态',
  error_message TEXT COMMENT '错误信息',
  retry_count INT DEFAULT 0 COMMENT '重试次数',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='PDF处理状态表';
