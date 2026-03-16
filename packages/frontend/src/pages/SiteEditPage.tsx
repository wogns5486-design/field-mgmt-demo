import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Plus, Trash2, ArrowLeft, RefreshCw } from 'lucide-react';

export function SiteEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [checklistItems, setChecklistItems] = useState<string[]>([]);

  useEffect(() => {
    const fetchSite = async () => {
      try {
        const site = await api.getSite(Number(id));
        setName(site.name);
        setAddress(site.address);
        const items = typeof site.checklist_items === 'string'
          ? JSON.parse(site.checklist_items)
          : site.checklist_items;
        setChecklistItems(items || []);
      } catch (err: any) {
        toast.error(err.message || '현장 정보를 불러올 수 없습니다');
        navigate('/dashboard');
      } finally {
        setFetching(false);
      }
    };
    fetchSite();
  }, [id, navigate]);

  const addChecklistItem = () => setChecklistItems([...checklistItems, '']);
  const removeChecklistItem = (idx: number) =>
    setChecklistItems(checklistItems.filter((_, i) => i !== idx));
  const updateChecklistItem = (idx: number, val: string) =>
    setChecklistItems(checklistItems.map((item, i) => (i === idx ? val : item)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address) return;

    setLoading(true);
    try {
      const validChecklist = checklistItems.filter((item) => item.trim());
      await api.updateSite(Number(id), {
        name,
        address,
        checklist_items: validChecklist,
      });
      toast.success('현장 정보가 수정되었습니다');
      navigate(`/sites/${id}`);
    } catch (err: any) {
      toast.error(err.message || '수정 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate(`/sites/${id}`)}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        뒤로
      </button>

      <h1 className="text-2xl font-bold mb-6">현장 수정</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold text-lg">기본 정보</h2>
          <div>
            <label className="block text-sm font-medium mb-1.5">현장명 *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="예: 인천 남동 아파트 신축공사"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">주소 *</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="예: 인천광역시 남동구 구월동 123-45"
              required
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">안전점검 항목</h2>
            <button
              type="button"
              onClick={addChecklistItem}
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              <Plus className="w-4 h-4" />
              항목 추가
            </button>
          </div>
          <div className="space-y-2">
            {checklistItems.map((item, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  value={item}
                  onChange={(e) => updateChecklistItem(idx, e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="점검 항목 입력"
                />
                <button
                  type="button"
                  onClick={() => removeChecklistItem(idx)}
                  className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {loading ? '수정 중...' : '현장 수정'}
        </button>
      </form>
    </div>
  );
}
