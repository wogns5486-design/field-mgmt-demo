import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { usePolling } from '@/hooks/usePolling';
import { formatDate } from '@/lib/utils';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Pagination } from '@/components/Pagination';
import {
  ArrowLeft,
  RefreshCw,
  ClipboardCopy,
  Users,
  FileText,
  CheckCircle2,
  XCircle,
  Image,
  Trash2,
  FileSpreadsheet,
  Link as LinkIcon,
  Pencil,
  Plus,
  Check,
  X,
} from 'lucide-react';

export function SiteDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingWorker, setEditingWorker] = useState<{ id: number; name: string; phone: string } | null>(null);
  const [addingWorker, setAddingWorker] = useState(false);
  const [newWorker, setNewWorker] = useState({ name: '', phone: '' });
  const [subPage, setSubPage] = useState(1);
  const [subTotalPages, setSubTotalPages] = useState(1);
  const [paginatedSubmissions, setPaginatedSubmissions] = useState<any[]>([]);

  const fetchSite = useCallback(() => api.getSite(Number(id)), [id]);
  const { data: site, loading, refresh } = usePolling(fetchSite);

  const fetchSubmissions = useCallback(async () => {
    if (!id) return;
    try {
      const result = await api.getSubmissions(Number(id), subPage);
      setPaginatedSubmissions(result.data);
      setSubTotalPages(result.totalPages);
    } catch {
      // silently fail, initial data from site detail is fallback
    }
  }, [id, subPage]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const copyUrl = () => {
    if (!site) return;
    const url = `${window.location.origin}/s/${site.short_url}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('URL이 복사되었습니다');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadXlsx = async () => {
    try {
      const blob = await api.downloadXlsx(Number(id));
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `submissions-${id}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      toast.error(err.message || '다운로드에 실패했습니다');
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteSite(Number(id));
      toast.success('현장이 삭제되었습니다');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message || '삭제 중 오류가 발생했습니다');
    }
    setShowDeleteDialog(false);
  };

  const handleSaveWorker = async () => {
    if (!editingWorker || !editingWorker.name.trim()) return;
    try {
      await api.updateWorker(editingWorker.id, { name: editingWorker.name, phone: editingWorker.phone || undefined });
      toast.success('작업자 정보가 수정되었습니다');
      setEditingWorker(null);
      refresh();
    } catch (err: any) {
      toast.error(err.message || '수정 중 오류가 발생했습니다');
    }
  };

  const handleDeleteWorker = async (workerId: number) => {
    try {
      await api.deleteWorker(workerId);
      toast.success('작업자가 삭제되었습니다');
      refresh();
    } catch (err: any) {
      toast.error(err.message || '삭제 중 오류가 발생했습니다');
    }
  };

  const handleAddWorker = async () => {
    if (!newWorker.name.trim()) return;
    try {
      await api.addWorkers(Number(id), [{ name: newWorker.name, phone: newWorker.phone || undefined }]);
      toast.success('작업자가 추가되었습니다');
      setNewWorker({ name: '', phone: '' });
      setAddingWorker(false);
      refresh();
    } catch (err: any) {
      toast.error(err.message || '추가 중 오류가 발생했습니다');
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
  const checklistItems: string[] = Array.isArray(site.checklist_items)
    ? site.checklist_items
    : typeof site.checklist_items === 'string'
      ? JSON.parse(site.checklist_items)
      : [];

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
              onClick={() => navigate(`/sites/${id}/edit`)}
              className="flex items-center gap-2 px-3 py-2 text-sm border rounded-lg hover:bg-accent transition-colors"
            >
              <Pencil className="w-4 h-4" />
              수정
            </button>
            <button
              onClick={handleDownloadXlsx}
              className="flex items-center gap-2 px-3 py-2 text-sm border rounded-lg hover:bg-accent transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              엑셀 다운로드
            </button>
            <button
              onClick={copyUrl}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <ClipboardCopy className="w-4 h-4" />
              {copied ? '복사됨!' : 'URL 복사'}
            </button>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              삭제
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">작업자 목록</h2>
          <button
            onClick={() => setAddingWorker(true)}
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <Plus className="w-4 h-4" />
            작업자 추가
          </button>
        </div>
        <div className="divide-y">
          {workers.map((w: any) => (
            <div key={w.id} className="flex items-center justify-between py-3 gap-2">
              {editingWorker?.id === w.id ? (
                <>
                  <div className="flex-1 flex gap-2">
                    <input
                      value={editingWorker!.name}
                      onChange={(e) => setEditingWorker({ ...editingWorker!, name: e.target.value })}
                      className="flex-1 px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="이름"
                    />
                    <input
                      value={editingWorker!.phone || ''}
                      onChange={(e) => setEditingWorker({ ...editingWorker!, phone: e.target.value })}
                      className="flex-1 px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="전화번호"
                    />
                  </div>
                  <div className="flex gap-1">
                    <button onClick={handleSaveWorker} className="p-1.5 text-green-600 hover:bg-green-50 rounded">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => setEditingWorker(null)} className="p-1.5 text-gray-400 hover:bg-gray-50 rounded">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="font-medium">{w.name}</p>
                    {w.phone && <p className="text-sm text-muted-foreground">{w.phone}</p>}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditingWorker({ id: w.id, name: w.name, phone: w.phone || '' })}
                      className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteWorker(w.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
          {addingWorker && (
            <div className="flex items-center gap-2 py-3">
              <input
                value={newWorker.name}
                onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
                className="flex-1 px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="이름"
                autoFocus
              />
              <input
                value={newWorker.phone}
                onChange={(e) => setNewWorker({ ...newWorker, phone: e.target.value })}
                className="flex-1 px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="전화번호"
              />
              <button onClick={handleAddWorker} className="p-1.5 text-green-600 hover:bg-green-50 rounded">
                <Check className="w-4 h-4" />
              </button>
              <button onClick={() => { setAddingWorker(false); setNewWorker({ name: '', phone: '' }); }} className="p-1.5 text-gray-400 hover:bg-gray-50 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          {workers.length === 0 && !addingWorker && (
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
          <>
            {/* Mobile card view */}
            <div className="md:hidden space-y-3">
              {(paginatedSubmissions.length > 0 ? paginatedSubmissions : submissions).map((sub: any) => {
                const checklist: Record<string, boolean> = JSON.parse(sub.checklist_data || '{}');
                const photos: string[] = JSON.parse(sub.photos || '[]');
                const checkedCount = Object.values(checklist).filter(Boolean).length;
                return (
                  <div key={sub.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{sub.worker_name}</span>
                      <span className="text-xs text-muted-foreground">{formatDate(sub.submitted_at)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        {checkedCount}/{checklistItems.length}
                      </span>
                      {photos.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Image className="w-4 h-4" />
                          {photos.length}
                        </span>
                      )}
                    </div>
                    {sub.text_note && (
                      <p className="text-sm text-muted-foreground mt-2 truncate">{sub.text_note}</p>
                    )}
                  </div>
                );
              })}
            </div>
            {/* Desktop table view */}
            <div className="hidden md:block overflow-x-auto">
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
                  {(paginatedSubmissions.length > 0 ? paginatedSubmissions : submissions).map((sub: any) => {
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
            <Pagination page={subPage} totalPages={subTotalPages} onPageChange={setSubPage} />
          </>
        )}
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        title="현장 삭제"
        message="이 현장과 모든 관련 데이터(작업자, 제출 내역)가 삭제됩니다. 이 작업은 되돌릴 수 없습니다."
        confirmLabel="삭제"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </div>
  );
}
