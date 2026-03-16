import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { PhotoUpload } from '@/components/PhotoUpload';
import { CheckCircle2, Building2, Loader2 } from 'lucide-react';

export function WorkerFormPage() {
  const { shortUrl } = useParams();
  const [site, setSite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [selectedWorker, setSelectedWorker] = useState<number | null>(null);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [textNote, setTextNote] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    if (!shortUrl) return;
    api
      .getSiteByUrl(shortUrl)
      .then((data) => {
        setSite(data);
        // Initialize checklist
        const initial: Record<string, boolean> = {};
        const items: string[] = Array.isArray(data.checklist_items)
          ? data.checklist_items
          : typeof data.checklist_items === 'string'
            ? JSON.parse(data.checklist_items)
            : [];
        items.forEach((item: string) => {
          initial[item] = false;
        });
        setChecklist(initial);
      })
      .catch(() => setError('현장을 찾을 수 없습니다'))
      .finally(() => setLoading(false));
  }, [shortUrl]);

  const toggleItem = (item: string) => {
    setChecklist((prev) => ({ ...prev, [item]: !prev[item] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorker || !site) return;

    setSubmitting(true);
    try {
      await api.createSubmission({
        site_id: site.id,
        worker_id: selectedWorker,
        checklist_data: checklist,
        text_note: textNote,
        photos,
      });
      setSubmitted(true);
    } catch (err: any) {
      toast.error(err.message || '제출 중 오류가 발생했습니다');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !site) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">{error || '현장을 찾을 수 없습니다'}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <div className="text-center">
          <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">제출 완료</h1>
          <p className="text-muted-foreground">안전점검 보고가 정상적으로 제출되었습니다</p>
          <p className="text-sm text-muted-foreground mt-4">{site.name}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <Building2 className="w-6 h-6" />
          <span className="text-sm opacity-80">안전점검 보고</span>
        </div>
        <h1 className="text-xl font-bold">{site.name}</h1>
        <p className="text-sm opacity-80 mt-1">{site.address}</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-4 space-y-4 pb-24 max-w-lg mx-auto -mt-2"
      >
        {/* Worker selection */}
        <div className="bg-white rounded-xl border p-4">
          <label className="block text-sm font-semibold mb-3">작업자 선택 *</label>
          <div className="grid grid-cols-1 gap-2">
            {(site.workers || []).map((w: any) => (
              <button
                key={w.id}
                type="button"
                onClick={() => setSelectedWorker(w.id)}
                className={`p-3 rounded-lg border text-left text-sm font-medium transition-colors ${
                  selectedWorker === w.id
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {w.name}
              </button>
            ))}
          </div>
        </div>

        {/* Checklist */}
        <div className="bg-white rounded-xl border p-4">
          <label className="block text-sm font-semibold mb-3">안전점검 체크리스트</label>
          <div className="space-y-2">
            {(site.checklist_items || []).map((item: string) => (
              <label
                key={item}
                className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={checklist[item] || false}
                  onChange={() => toggleItem(item)}
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm">{item}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Text note */}
        <div className="bg-white rounded-xl border p-4">
          <label className="block text-sm font-semibold mb-3">비고 / 특이사항</label>
          <textarea
            value={textNote}
            onChange={(e) => setTextNote(e.target.value)}
            rows={3}
            className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            placeholder="특이사항이 있으면 입력하세요"
          />
        </div>

        {/* Photos */}
        <div className="bg-white rounded-xl border p-4">
          <label className="block text-sm font-semibold mb-3">현장 사진</label>
          <PhotoUpload photos={photos} onPhotosChange={setPhotos} />
        </div>

        {/* Submit button - fixed at bottom on mobile */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
          <button
            type="submit"
            disabled={!selectedWorker || submitting}
            className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-semibold text-lg hover:bg-primary/90 transition-colors disabled:opacity-50 max-w-lg mx-auto block"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                제출 중...
              </span>
            ) : (
              '안전점검 보고 제출'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
