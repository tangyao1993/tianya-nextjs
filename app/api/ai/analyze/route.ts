import { NextRequest, NextResponse } from 'next/server';
import { ChatOpenAI } from '@langchain/openai';
import { StringOutputParser } from '@langchain/core/output_parsers';

// AI 解读类型
type AnalysisType = 'summary' | 'key_points' | 'background' | 'analysis' | 'prediction';

// 解读提示词模板
const prompts: Record<AnalysisType, string> = {
  summary: '请为以下天涯神帖写一份200-300字的摘要，突出核心观点和精华内容。',
  key_points: '请提炼出这篇帖子的3-5个核心要点，每个要点用一句话概括。',
  background: '请分析这篇帖子产生的历史背景和社会环境，帮助读者理解其时代意义。',
  analysis: '请深入分析这篇帖子的观点和逻辑，评价其价值和局限性。',
  prediction: '如果这篇帖子包含预测性内容，请分析其预测的准确性或现实意义。'
};

export async function POST(request: NextRequest) {
  try {
    const { postId, content, title, type = 'summary' } = await request.json();

    if (!content) {
      return NextResponse.json({
        success: false,
        error: '缺少内容参数'
      }, { status: 400 });
    }

    // 检查 API Key
    const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'OpenAI API Key 未配置'
      }, { status: 500 });
    }

    // 使用 LangChain 调用 OpenAI
    const model = new ChatOpenAI({
      modelName: 'gpt-3.5-turbo',
      temperature: 0.7,
      openAIApiKey: apiKey,
    });

    const parser = new StringOutputParser();

    // 截取前3000字用于分析
    const contentForAnalysis = content.substring(0, 3000);

    const prompt = `你是一个专业的文学和社会分析助手。

${prompts[type as AnalysisType]}

帖子标题：《${title}》

帖子内容：
${contentForAnalysis}

请用中文回答，格式清晰，内容专业。`;

    const chain = model.pipe(parser);
    const answer = await chain.invoke(prompt);

    return NextResponse.json({
      success: true,
      data: {
        type,
        content: answer,
        model: 'gpt-3.5-turbo'
      }
    });

  } catch (error: any) {
    console.error('AI 解读失败:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'AI 解读失败'
    }, { status: 500 });
  }
}

// 获取解读选项
export async function GET() {
  return NextResponse.json({
    success: true,
    data: [
      { value: 'summary', label: '内容摘要' },
      { value: 'key_points', label: '核心要点' },
      { value: 'background', label: '时代背景' },
      { value: 'analysis', label: '深度分析' },
      { value: 'prediction', label: '预测验证' }
    ]
  });
}
