import { NextRequest, NextResponse } from 'next/server';
import { postDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const posts = await postDb.findAll({ category, limit, offset });
    const total = await postDb.count(category);

    return NextResponse.json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('获取帖子列表失败:', error);
    return NextResponse.json({
      success: false,
      error: error.message || '获取帖子列表失败'
    }, { status: 500 });
  }
}
