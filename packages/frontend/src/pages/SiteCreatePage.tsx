import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { DEFAULT_CHECKLIST_ITEMS } from '@/lib/constants';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';

export function SiteCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [checklistItems, setChecklistItems] = useState<string[]>([
    ...DEFAULT_CHECKLIST_ITEMS,
  ]);
  const [workers, setWorkers] = useState<{ name: string; phone: string }[]>([
    { name: '', phone: '' },
  ]);

  const addChecklistItem = () => setChecklistItems([...checklistItems, '']);
  const removeChecklistItem = (idx: number) =>
    setChecklistItems(checklistItems.filter((_, i) => i !== idx));
  const updateChecklistItem = (idx: number, val: string) =>
    setChecklistItems(checklistItems.map((item, i) => (i === idx ? val : item)));

  const addWorker = () => setWorkers([...workers, { name: '', phone: '' }]);
  const removeWorker = (idx: number) =>
    setWorkers(workers.filter((_, i) => i !== idx));
  const updateWorker = (idx: number, field: 'name' | 'phone', val: string) =>
    setWorkers(workers.map((w, i) => (i === idx ? { ...w, [field]: val } : w)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address) return;

    setLoading(true);
    try {
      const validWorkers = workers.filter((w) => w.name.trim());
      const validChecklist = checklistItems.filter((item) => item.trim());

      const site = await api.createSite({
        name,
        address,
        checklist_items: validChecklist,
        workers: validWorkers,
      });
      navigate(`/sites/${site.id}`);
    } catch (err: any) {
      alert(err.message || '현장 등록에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        뒤로
      </button>

      <h1 className="text-2xl font-bold mb-6">현장 등록</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
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

        {/* Checklist */}
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

        {/* Workers */}
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">작업자 등록</h2>
            <button
              type="button"
              onClick={addWorker}
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              <Plus className="w-4 h-4" />
              작업자 추가
            </button>
          </div>
          <div className="space-y-3">
            {workers.map((w, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  value={w.name}
                  onChange={(e) => updateWorker(idx, 'name', e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="이름"
                />
                <input
                  value={w.phone}
                  onChange={(e) => updateWorker(idx, 'phone', e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="전화번호 (선택)"
                />
                {workers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeWorker(idx)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {loading ? '등록 중...' : '현장 등록'}
        </button>
      </form>
    </div>
  );
}
