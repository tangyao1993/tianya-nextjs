/**
 * 数据库初始化脚本
 * 读取 schema.sql 并执行
 */

import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';

// 数据库配置（不含数据库名）
const dbConfig = {
  host: '146.56.246.38',
  port: 3306,
  user: 'root',
  password: 'wznba778899',
  multipleStatements: true, // 允许执行多条SQL语句
};

async function main() {
  console.log('========================================');
  console.log('数据库初始化工具');
  console.log('========================================\n');

  // 读取 schema.sql
  const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
  console.log(`读取 schema.sql: ${schemaPath}`);

  let schema: string;
  try {
    schema = fs.readFileSync(schemaPath, 'utf-8');
  } catch (error: any) {
    console.error('读取 schema.sql 失败:', error.message);
    process.exit(1);
  }

  // 连接数据库
  console.log('连接数据库...');
  let connection: mysql.Connection;

  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('数据库连接成功');
  } catch (error: any) {
    console.error('数据库连接失败:', error.message);
    process.exit(1);
  }

  try {
    // 执行 SQL
    console.log('\n执行 SQL 脚本...\n');
    await connection.query(schema);
    console.log('数据库初始化完成!');
    console.log('\n已创建以下表:');
    console.log('  - posts (帖子表)');
    console.log('  - ai_analysis (AI解读表)');
    console.log('  - user_ai_usage (用户AI使用记录表)');
    console.log('  - pdf_process_status (PDF处理状态表)');
  } catch (error: any) {
    console.error('执行 SQL 失败:', error.message);

    // 如果是数据库已存在的错误，不算失败
    if (error.code !== 'ER_DB_CREATE_EXISTS' && !error.message.includes('already exists')) {
      process.exit(1);
    }
    console.log('数据库/表已存在，跳过创建');
  } finally {
    await connection.end();
  }

  console.log('\n========================================');
  console.log('初始化完成!');
  console.log('========================================');
}

main().catch(error => {
  console.error('发生错误:', error);
  process.exit(1);
});
