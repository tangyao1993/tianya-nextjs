import { NextRequest, NextResponse } from 'next/server';
import { postDb } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = parseInt(params.id);

    if (isNaN(postId)) {
      return NextResponse.json({
        success: false,
        error: '无效的帖子ID'
      }, { status: 400 });
    }

    const post = await postDb.findById(postId);

    if (!post) {
      return NextResponse.json({
        success: false,
        error: '帖子不存在'
      }, { status: 404 });
    }

    // 增加浏览量
    await postDb.incrementViews(postId);

    return NextResponse.json({
      success: true,
      data: post
    });
  } catch (error: any) {
    console.error('获取帖子详情失败:', error);
    return NextResponse.json({
      success: false,
      error: error.message || '获取帖子详情失败'
    }, { status: 500 });
  }
}
