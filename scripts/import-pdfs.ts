/**
 * PDF 导入脚本
 * 扫描 tiezi_extracted 目录下的所有 PDF 文件
 * 调用 MineRU API 将 PDF 转换为 Markdown
 * 将内容存储到数据库中
 */

import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import FormData from 'form-data';
import mysql from 'mysql2/promise';

// 数据库配置
const dbConfig = {
  host: '146.56.246.38',
  port: 3306,
  user: 'root',
  password: 'wznba778899',
  database: 'tianya',
};

// MineRU API 配置
const MINERU_API_URL = 'http://127.0.0.1:7777/file_parse';
const PDF_DIR = path.join(process.cwd(), 'tiezi_extracted');

// 创建数据库连接池
const pool = mysql.createPool(dbConfig);

// 解析文件名，提取帖子信息
function parseFilename(filename: string): {
  title: string;
  author?: string;
  category?: string;
} {
  // 移除 .pdf 扩展名
  const name = path.basename(filename, '.pdf');

  // 尝试匹配格式: 序号-《标题》-作者
  const match2 = name.match(/^\d+-《(.+?)》-(.+)$/);
  if (match2) {
    return {
      title: match2[1].trim(),
      author: match2[2].trim(),
    };
  }

  // 尝试匹配格式: 序号-【分类】标题-作者
  const match3 = name.match(/^\d+-【([^\]]+)】(.+?)-(.+)$/);
  if (match3) {
    return {
      title: match3[2].trim(),
      category: match3[1].trim(),
      author: match3[3].trim(),
    };
  }

  // 尝试匹配格式: 序号-[分类]标题-作者
  const match1 = name.match(/^\d+-\[([^\]]+)\](.+?)-(.+)$/);
  if (match1) {
    return {
      title: match1[2].trim(),
      category: match1[1].trim(),
      author: match1[3].trim(),
    };
  }

  // 尝试匹配格式: 序号-标题
  const match4 = name.match(/^\d+-(.+)$/);
  if (match4) {
    return {
      title: match4[1].trim(),
    };
  }

  // 无法解析，返回文件名作为标题
  return {
    title: name,
  };
}

// 调用 MineRU API 转换 PDF
async function convertPdfToMarkdown(pdfPath: string): Promise<string> {
  try {
    const formData = new FormData();

    // 添加 PDF 文件
    formData.append('files', fs.createReadStream(pdfPath));
    formData.append('backend', 'pipeline');
    formData.append('parse_method', 'auto');
    formData.append('lang_list', 'ch');
    formData.append('return_md', 'true');
    formData.append('formula_enable', 'true');
    formData.append('table_enable', 'true');

    console.log(`  正在调用 MineRU API: ${path.basename(pdfPath)}`);

    const response = await fetch(MINERU_API_URL, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`MineRU API 调用失败: ${response.status} ${errorText}`);
    }

    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const result: any = await response.json();

      // MineRU API 返回格式: { backend, version, results: { filename: { md_content } } }
      if (result.results) {
        const results = result.results;
        const filenames = Object.keys(results);
        if (filenames.length > 0) {
          const firstResult = results[filenames[0]];
          if (firstResult && firstResult.md_content) {
            return firstResult.md_content;
          }
        }
      }

      // 其他可能的格式
      if (result.data && result.data.markdown) {
        return result.data.markdown;
      } else if (result.markdown) {
        return result.markdown;
      } else if (Array.isArray(result.data) && result.data.length > 0) {
        const firstFile = result.data[0];
        if (firstFile.markdown) {
          return firstFile.markdown;
        } else if (typeof firstFile === 'string') {
          return firstFile;
        }
      }

      throw new Error(`无法解析返回的数据结构: ${JSON.stringify(result).substring(0, 200)}`);
    } else {
      // 直接返回文本
      const text = await response.text();
      if (text.length < 100) {
        throw new Error(`返回的内容太短，可能是转换失败: ${text.substring(0, 200)}`);
      }
      return text;
    }
  } catch (error: any) {
    console.error(`  转换失败: ${error.message}`);
    throw error;
  }
}

// 将 markdown 转换为纯文本（用于搜索）
function markdownToPlainText(markdown: string): string {
  return markdown
    .replace(/#{1,6}\s/g, '') // 移除标题标记
    .replace(/\*\*/g, '') // 移除粗体标记
    .replace(/\*/g, '') // 移除斜体标记
    .replace(/`{1,3}/g, '') // 移除代码标记
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 移除链接，保留文本
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1') // 移除图片，保留alt
    .replace(/\n+/g, ' ') // 将换行替换为空格
    .trim();
}

// 生成摘要
function generateSummary(content: string, maxLength = 200): string {
  const plainText = markdownToPlainText(content);
  if (plainText.length <= maxLength) {
    return plainText;
  }
  return plainText.substring(0, maxLength) + '...';
}

// 提取标签
function extractTags(content: string, title: string): string[] {
  const tags: string[] = [];

  // 从分类和标题中提取标签
  const categoryKeywords = ['经济', '房产', '历史', '国学', '情感', '职场', '悬疑', '鬼话', '中医', '文化'];
  categoryKeywords.forEach(keyword => {
    if (title.includes(keyword) || content.includes(keyword)) {
      if (!tags.includes(keyword)) {
        tags.push(keyword);
      }
    }
  });

  return tags;
}

// 更新 PDF 处理状态
async function updatePdfProcessStatus(pdfPath: string, status: 'pending' | 'processing' | 'completed' | 'failed', errorMessage?: string) {
  const connection = await pool.getConnection();

  try {
    const sql = `
      INSERT INTO pdf_process_status (pdf_path, status, error_message)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
        status = VALUES(status),
        error_message = VALUES(error_message),
        updated_at = CURRENT_TIMESTAMP
    `;

    await connection.execute(sql, [pdfPath, status, errorMessage || null]);
  } finally {
    connection.release();
  }
}

// 保存到数据库
async function saveToDatabase(data: {
  title: string;
  author?: string;
  category?: string;
  original_filename: string;
  pdf_path: string;
  content: string;
  content_text: string;
  summary: string;
  tags: string[];
}) {
  const connection = await pool.getConnection();

  try {
    // 检查是否已存在
    const [existing] = await connection.execute(
      'SELECT id FROM posts WHERE original_filename = ?',
      [data.original_filename]
    );

    if (Array.isArray(existing) && existing.length > 0) {
      console.log(`  已存在，跳过: ${data.original_filename}`);
      // 也要更新状态为完成
      await updatePdfProcessStatus(data.pdf_path, 'completed');
      return;
    }

    // 插入数据
    const sql = `
      INSERT INTO posts (
        title, author, category, original_filename, pdf_path,
        content, content_text, summary, tags
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await connection.execute(sql, [
      data.title,
      data.author || null,
      data.category || null,
      data.original_filename,
      data.pdf_path,
      data.content,
      data.content_text,
      data.summary,
      JSON.stringify(data.tags),
    ]);

    console.log(`  保存成功: ${data.title}`);

    // 更新处理状态为完成
    await updatePdfProcessStatus(data.pdf_path, 'completed');
  } finally {
    connection.release();
  }
}

// 处理单个 PDF 文件
async function processPdfFile(pdfPath: string): Promise<void> {
  const filename = path.basename(pdfPath);
  console.log(`\n处理文件: ${filename}`);

  // 标记为处理中
  await updatePdfProcessStatus(pdfPath, 'processing');

  try {
    // 解析文件名
    const fileInfo = parseFilename(filename);
    console.log(`  标题: ${fileInfo.title}`);
    if (fileInfo.author) console.log(`  作者: ${fileInfo.author}`);
    if (fileInfo.category) console.log(`  分类: ${fileInfo.category}`);

    // 转换 PDF 为 Markdown
    const markdown = await convertPdfToMarkdown(pdfPath);

    if (!markdown || markdown.length < 100) {
      throw new Error('转换后的内容太短，可能是转换失败');
    }

    console.log(`  转换成功，内容长度: ${markdown.length} 字符`);

    // 转换为纯文本
    const plainText = markdownToPlainText(markdown);

    // 生成摘要
    const summary = generateSummary(markdown);

    // 提取标签
    const tags = extractTags(markdown, fileInfo.title);

    // 保存到数据库
    await saveToDatabase({
      title: fileInfo.title,
      author: fileInfo.author,
      category: fileInfo.category,
      original_filename: filename,
      pdf_path: pdfPath,
      content: markdown,
      content_text: plainText,
      summary,
      tags,
    });
  } catch (error: any) {
    console.error(`  处理失败: ${error.message}`);
    // 标记为失败
    await updatePdfProcessStatus(pdfPath, 'failed', error.message);
    throw error;
  }
}

// 扫描目录并处理所有 PDF 文件
async function scanAndProcess(): Promise<void> {
  console.log('开始扫描 PDF 文件...');
  console.log(`目录: ${PDF_DIR}`);

  const dirs = fs.readdirSync(PDF_DIR, { withFileTypes: true });
  const pdfFiles: string[] = [];

  // 扫描所有子目录
  for (const dir of dirs) {
    if (dir.isDirectory()) {
      const dirPath = path.join(PDF_DIR, dir.name);
      const files = fs.readdirSync(dirPath);

      for (const file of files) {
        if (file.endsWith('.pdf')) {
          const pdfPath = path.join(dirPath, file);
          pdfFiles.push(pdfPath);
          // 初始化状态为 pending
          await updatePdfProcessStatus(pdfPath, 'pending');
        }
      }
    }
  }

  console.log(`找到 ${pdfFiles.length} 个 PDF 文件`);

  // 处理每个文件
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < pdfFiles.length; i++) {
    console.log(`\n进度: ${i + 1}/${pdfFiles.length}`);

    try {
      await processPdfFile(pdfFiles[i]);
      successCount++;
    } catch (error) {
      console.error(`处理失败: ${pdfFiles[i]}`);
      failCount++;
    }

    // 避免请求过快，添加延迟
    if (i < pdfFiles.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log(`\n\n处理完成!`);
  console.log(`成功: ${successCount}`);
  console.log(`失败: ${failCount}`);
}

// 主函数
async function main() {
  console.log('========================================');
  console.log('天涯神帖 PDF 导入工具');
  console.log('========================================\n');

  // 测试数据库连接
  console.log('测试数据库连接...');
  try {
    const connection = await pool.getConnection();
    console.log('数据库连接成功');
    connection.release();
  } catch (error: any) {
    console.error('数据库连接失败:', error.message);
    process.exit(1);
  }

  // 测试 MineRU API
  console.log('\n测试 MineRU API...');
  try {
    await fetch(MINERU_API_URL, { method: 'HEAD' });
    console.log('MineRU API 连接成功');
  } catch (error: any) {
    console.error('MineRU API 连接失败:', error.message);
    console.error('请确保 MineRU 服务正在运行: http://127.0.0.1:7777');
    process.exit(1);
  }

  // 开始处理
  await scanAndProcess();

  // 关闭连接池
  await pool.end();

  console.log('\n所有任务完成!');
  process.exit(0);
}

// 运行
main().catch(error => {
  console.error('发生错误:', error);
  process.exit(1);
});
