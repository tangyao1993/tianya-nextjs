import { NextResponse } from 'next/server';
import { postDb } from '@/lib/db';

export async function GET() {
  try {
    const categories = await postDb.getCategories();

    return NextResponse.json({
      success: true,
      data: categories.map((c: any) => c.category)
    });
  } catch (error: any) {
    console.error('获取分类失败:', error);
    return NextResponse.json({
      success: false,
      error: error.message || '获取分类失败'
    }, { status: 500 });
  }
}
