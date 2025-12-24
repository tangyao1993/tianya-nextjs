'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header, Footer } from '@/components/Layout';
import { ViewState } from '@/types';

const backendOptions = [
  { value: 'pipeline', label: 'pipeline（通用）' },
  { value: 'vlm-transformers', label: 'vlm-transformers（更通用，较慢）' },
  { value: 'vlm-mlx-engine', label: 'vlm-mlx-engine（Apple Silicon + macOS 13.5+）' },
  { value: 'vlm-vllm-async-engine', label: 'vlm-vllm-async-engine（需 vllm）' },
  { value: 'vlm-lmdeploy-engine', label: 'vlm-lmdeploy-engine（需 lmdeploy）' },
  { value: 'vlm-http-client', label: 'vlm-http-client（OpenAI 兼容服务）' },
];

const parseMethodOptions = [
  { value: 'auto', label: 'auto（自动判断）' },
  { value: 'txt', label: 'txt（文字提取）' },
  { value: 'ocr', label: 'ocr（扫描件/图片）' },
];

export default function MineruTestPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [backend, setBackend] = useState('pipeline');
  const [parseMethod, setParseMethod] = useState('auto');
  const [langList, setLangList] = useState('ch');
  const [startPageId, setStartPageId] = useState('0');
  const [endPageId, setEndPageId] = useState('99999');
  const [formulaEnable, setFormulaEnable] = useState(true);
  const [tableEnable, setTableEnable] = useState(true);
  const [returnMd, setReturnMd] = useState(true);
  const [responseFormatZip, setResponseFormatZip] = useState(false);

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [resultText, setResultText] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');

  const canSubmit = files.length > 0 && status !== 'loading';

  const parsedLangList = useMemo(() => {
    return langList
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
  }, [langList]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    setFiles(selectedFiles);
  };

  const resetResult = () => {
    setStatus('idle');
    setMessage('');
    setResultText('');
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl('');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    resetResult();
    setStatus('loading');
    setMessage('正在上传并解析，请稍候...');

    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('backend', backend);
    formData.append('parse_method', parseMethod);
    parsedLangList.forEach(lang => formData.append('lang_list', lang));
    formData.append('start_page_id', startPageId);
    formData.append('end_page_id', endPageId);
    formData.append('formula_enable', String(formulaEnable));
    formData.append('table_enable', String(tableEnable));
    formData.append('return_md', String(returnMd));
    formData.append('response_format_zip', String(responseFormatZip));

    try {
      const response = await fetch('/api/mineru/parse', {
        method: 'POST',
        body: formData,
      });

      const contentType = response.headers.get('content-type') ?? '';
      if (!response.ok) {
        const errorText = await response.text();
        setStatus('error');
        setMessage(`解析失败（HTTP ${response.status}）`);
        setResultText(errorText || '服务返回了错误，但没有提供详细信息。');
        return;
      }

      if (contentType.includes('application/zip') || contentType.includes('application/octet-stream')) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        setStatus('success');
        setMessage('解析完成，已生成 ZIP 结果文件。');
        setResultText('ZIP 内容较大，请使用下方链接下载查看。');
        return;
      }

      if (contentType.includes('application/json')) {
        const data = await response.json();
        setStatus('success');
        setMessage('解析完成，已返回 JSON 结果。');
        setResultText(JSON.stringify(data, null, 2));
      } else {
        const text = await response.text();
        setStatus('success');
        setMessage('解析完成，返回了文本结果。');
        setResultText(text || '服务返回了空内容。');
      }
    } catch (error) {
      setStatus('error');
      setMessage('请求失败，请确认本地 mineru 服务正在运行。');
      setResultText(error instanceof Error ? error.message : '未知错误');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      <Header onNavigateHome={() => router.push('/')} currentView={ViewState.HOME} />

      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 mb-2">MinerU PDF 解析测试</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                通过本地接口 <span className="font-mono text-slate-700">http://127.0.0.1:7777/file_parse</span> 解析 PDF，
                适用于验证 OCR / 结构化输出是否正常。
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-500 space-y-1">
              <div>提示：若请求失败，请确认 mineru 已启动。</div>
              <div>接口：/api/mineru/parse（本地代理）</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="border border-dashed border-slate-300 rounded-xl p-4 bg-slate-50">
                  <label className="text-sm font-medium text-slate-700">选择 PDF 文件</label>
                  <input
                    type="file"
                    accept="application/pdf"
                    multiple
                    onChange={handleFileChange}
                    className="mt-3 block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-sky-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-sky-700"
                  />
                  <div className="mt-3 text-xs text-slate-500">
                    已选择 {files.length} 个文件
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="text-sm text-slate-600">
                    后端
                    <select
                      value={backend}
                      onChange={(event) => setBackend(event.target.value)}
                      className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                    >
                      {backendOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </label>

                  <label className="text-sm text-slate-600">
                    解析方式
                    <select
                      value={parseMethod}
                      onChange={(event) => setParseMethod(event.target.value)}
                      className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                    >
                      {parseMethodOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="text-sm text-slate-600">
                  语言列表（逗号分隔）
                  <input
                    value={langList}
                    onChange={(event) => setLangList(event.target.value)}
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                    placeholder="ch,en"
                  />
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="text-sm text-slate-600">
                    起始页
                    <input
                      type="number"
                      value={startPageId}
                      onChange={(event) => setStartPageId(event.target.value)}
                      className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                      min="0"
                    />
                  </label>
                  <label className="text-sm text-slate-600">
                    结束页
                    <input
                      type="number"
                      value={endPageId}
                      onChange={(event) => setEndPageId(event.target.value)}
                      className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                      min="0"
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="text-sm font-medium text-slate-700 mb-3">输出选项</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-600">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formulaEnable}
                        onChange={(event) => setFormulaEnable(event.target.checked)}
                        className="h-4 w-4 rounded border-slate-300"
                      />
                      解析公式
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={tableEnable}
                        onChange={(event) => setTableEnable(event.target.checked)}
                        className="h-4 w-4 rounded border-slate-300"
                      />
                      解析表格
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={returnMd}
                        onChange={(event) => setReturnMd(event.target.checked)}
                        className="h-4 w-4 rounded border-slate-300"
                      />
                      返回 Markdown
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={responseFormatZip}
                        onChange={(event) => setResponseFormatZip(event.target.checked)}
                        className="h-4 w-4 rounded border-slate-300"
                      />
                      ZIP 输出
                    </label>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs text-slate-500 leading-relaxed">
                  <div className="font-medium text-slate-700 mb-2">请求预览</div>
                  <div>文件数量：{files.length}</div>
                  <div>后端：{backend}</div>
                  <div>解析方式：{parseMethod}</div>
                  <div>语言列表：{parsedLangList.join(', ') || '默认'}</div>
                  <div>页码范围：{startPageId} - {endPageId}</div>
                </div>

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="w-full bg-sky-600 text-white py-3 rounded-xl text-sm font-semibold shadow-md shadow-sky-200 hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? '解析中...' : '开始解析'}
                </button>
              </div>
            </div>
          </form>
        </section>

        <section className="mt-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">解析结果</h3>
            <span
              className={`text-xs px-2 py-1 rounded-full border ${
                status === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : status === 'error'
                    ? 'border-rose-200 bg-rose-50 text-rose-600'
                    : 'border-slate-200 bg-slate-50 text-slate-500'
              }`}
            >
              {status === 'loading' ? '解析中' : status === 'success' ? '成功' : status === 'error' ? '失败' : '待解析'}
            </span>
          </div>

          {message && (
            <div className="text-sm text-slate-600 mb-4">{message}</div>
          )}

          {downloadUrl && (
            <a
              href={downloadUrl}
              download="mineru-result.zip"
              className="inline-flex items-center gap-2 text-sm text-sky-600 hover:text-sky-700 mb-4"
            >
              下载 ZIP 结果
            </a>
          )}

          <pre className="bg-slate-900 text-slate-100 text-xs rounded-xl p-4 max-h-[420px] overflow-auto whitespace-pre-wrap">
            {resultText || '暂无结果'}
          </pre>
        </section>
      </main>

      <Footer />
    </div>
  );
}
