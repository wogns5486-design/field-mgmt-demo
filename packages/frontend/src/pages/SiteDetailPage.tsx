import { useCallback, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { usePolling } from '@/hooks/usePolling';
import { formatDate } from '@/lib/utils';
import {
  ArrowLeft,
  RefreshCw,
  Download,
  ClipboardCopy,
  Users,
  FileText,
  CheckCircle2,
  XCircle,
  Image,
  Trash2,
  Link as LinkIcon,
} from 'lucide-react';

export function SiteDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const fetchSite = useCallback(() => api.getSite(Number(id)), [id]);
  const { data: site, loading, refresh } = usePolling(fetchSite);

  const copyUrl = () => {
    if (!site) return;
    const url = `${window.location.origin}/s/${site.short_url}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCsv = async () => {
    try {
      const blob = await api.downloadCsv(Number(id));
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `submissions-${id}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || '다운로드에 실패했습니다');
    }
  };

  if (loading && !site) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!site) {
    return <div className="text-center py-16 text-muted-foreground">현장을 찾을 수 없습니다</div>;
  }

  const submissions = site.submissions || [];
  const workers = site.workers || [];
  const checklistItems: string[] = site.checklist_items || [];

  return (
    <div>
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        대시보드로
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{site.name}</h1>
            <p className="text-muted-foreground text-sm mt-1">{site.address}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={refresh}
              className="flex items-center gap-2 px-3 py-2 text-sm border rounded-lg hover:bg-accent transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              새로고침
            </button>
            <button
              onClick={handleDownloadCsv}
              className="flex items-center gap-2 px-3 py-2 text-sm border rounded-lg hover:bg-accent transition-colors"
            >
              <Download className="w-4 h-4" />
              CSV 다운로드
            </button>
            <button
              onClick={copyUrl}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <ClipboardCopy className="w-4 h-4" />
              {copied ? '복사됨!' : 'URL 복사'}
            </button>
          </div>
        </div>

        {/* Short URL display */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center gap-2">
          <LinkIcon className="w-4 h-4 text-blue-600" />
          <code className="text-sm text-blue-800 font-mono">
            {window.location.origin}/s/{site.short_url}
          </code>
        </div>

        {/* Stats */}
        <div className="flex gap-6 mt-4 text-sm">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="w-4 h-4" />
            작업자 {workers.length}명
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <FileText className="w-4 h-4" />
            제출 {submissions.length}건
          </span>
        </div>
      </div>

      {/* Workers */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <h2 className="font-semibold text-lg mb-4">작업자 목록</h2>
        <div className="divide-y">
          {workers.map((w: any) => (
            <div key={w.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">{w.name}</p>
                {w.phone && (
                  <p className="text-sm text-muted-foreground">{w.phone}</p>
                )}
              </div>
            </div>
          ))}
          {workers.length === 0 && (
            <p className="text-muted-foreground text-sm py-4">등록된 작업자가 없습니다</p>
          )}
        </div>
      </div>

      {/* Submissions table */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-lg mb-4">제출 내역</h2>
        {submissions.length === 0 ? (
          <p className="text-muted-foreground text-sm py-8 text-center">
            아직 제출된 데이터가 없습니다
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 font-medium">작업자</th>
                  <th className="text-left py-3 px-2 font-medium">제출일시</th>
                  {checklistItems.map((item: string, i: number) => (
                    <th key={i} className="text-center py-3 px-2 font-medium whitespace-nowrap">
                      {item.length > 6 ? item.slice(0, 6) + '...' : item}
                    </th>
                  ))}
                  <th className="text-left py-3 px-2 font-medium">비고</th>
                  <th className="text-center py-3 px-2 font-medium">사진</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub: any) => {
                  const checklist: Record<string, boolean> = JSON.parse(
                    sub.checklist_data || '{}'
                  );
                  const photos: string[] = JSON.parse(sub.photos || '[]');
                  return (
                    <tr key={sub.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 px-2 font-medium">{sub.worker_name}</td>
                      <td className="py-3 px-2 text-muted-foreground whitespace-nowrap">
                        {formatDate(sub.submitted_at)}
                      </td>
                      {checklistItems.map((item: string, i: number) => (
                        <td key={i} className="py-3 px-2 text-center">
                          {checklist[item] ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-400 mx-auto" />
                          )}
                        </td>
                      ))}
                      <td className="py-3 px-2 text-muted-foreground max-w-[200px] truncate">
                        {sub.text_note || '-'}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className="flex items-center justify-center gap-1 text-muted-foreground">
                          <Image className="w-4 h-4" />
                          {photos.length}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
