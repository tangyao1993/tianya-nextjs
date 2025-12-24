import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const MINERU_URL = 'http://127.0.0.1:7777/file_parse';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const mineruResponse = await fetch(MINERU_URL, {
      method: 'POST',
      body: formData,
    });

    const contentType = mineruResponse.headers.get('content-type') ?? 'application/json';
    const headers = new Headers();
    headers.set('content-type', contentType);
    headers.set('cache-control', 'no-store');

    const disposition = mineruResponse.headers.get('content-disposition');
    if (disposition) {
      headers.set('content-disposition', disposition);
    }

    if (contentType.includes('application/zip') || contentType.includes('application/octet-stream')) {
      const arrayBuffer = await mineruResponse.arrayBuffer();
      return new NextResponse(arrayBuffer, {
        status: mineruResponse.status,
        headers,
      });
    }

    const text = await mineruResponse.text();
    return new NextResponse(text, {
      status: mineruResponse.status,
      headers,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: '无法连接本地 mineru 服务，请确认 http://127.0.0.1:7777 已启动。',
      },
      { status: 502 }
    );
  }
}
