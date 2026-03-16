import { useCallback, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { usePolling } from '@/hooks/usePolling';
import { formatDate } from '@/lib/utils';
import { DailySubmissionsChart } from '@/components/charts/DailySubmissionsChart';
import { SiteComparisonChart } from '@/components/charts/SiteComparisonChart';
import { ComplianceRateChart } from '@/components/charts/ComplianceRateChart';
import {
  MapPin,
  Users,
  FileText,
  RefreshCw,
  PlusCircle,
  ExternalLink,
  ClipboardCopy,
} from 'lucide-react';

export function DashboardPage() {
  const fetchSites = useCallback(() => api.getSites(), []);
  const { data: sites, loading, refresh } = usePolling(fetchSites);

  const [dailyData, setDailyData] = useState<{ date: string; count: number }[]>([]);
  const [siteComparison, setSiteComparison] = useState<any[]>([]);
  const [complianceRate, setComplianceRate] = useState<any[]>([]);

  useEffect(() => {
    api.getDailySubmissions(30).then(setDailyData).catch(() => {});
    api.getSiteComparison().then(setSiteComparison).catch(() => {});
    api.getComplianceRate().then(setComplianceRate).catch(() => {});
  }, []);

  const copyUrl = (shortUrl: string) => {
    const url = `${window.location.origin}/s/${shortUrl}`;
    navigator.clipboard.writeText(url);
  };

  if (loading && !sites) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">대시보드</h1>
          <p className="text-muted-foreground text-sm mt-1">
            등록된 현장 및 응답 현황을 확인하세요
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refresh}
            className="flex items-center gap-2 px-3 py-2 text-sm border rounded-lg hover:bg-accent transition-colors"
            title="새로고침"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            to="/sites/new"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            현장 등록
          </Link>
        </div>
      </div>

      {/* Stats */}
      {sites && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-5 rounded-xl border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">전체 현장</p>
                <p className="text-2xl font-bold">{sites.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">전체 작업자</p>
                <p className="text-2xl font-bold">
                  {sites.reduce((s: number, site: any) => s + (site.worker_count || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">전체 제출</p>
                <p className="text-2xl font-bold">
                  {sites.reduce((s: number, site: any) => s + (site.submission_count || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        <DailySubmissionsChart data={dailyData} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SiteComparisonChart data={siteComparison} />
          <ComplianceRateChart data={complianceRate} />
        </div>
      </div>

      {/* Site cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sites?.map((site: any) => (
          <Link
            key={site.id}
            to={`/sites/${site.id}`}
            className="bg-white rounded-xl border p-5 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                {site.name}
              </h3>
              <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mb-4">
              <MapPin className="w-3.5 h-3.5" />
              {site.address}
            </p>
            <div className="flex items-center justify-between text-sm">
              <div className="flex gap-4">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Users className="w-3.5 h-3.5" />
                  {site.worker_count}명
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <FileText className="w-3.5 h-3.5" />
                  {site.submission_count}건
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  copyUrl(site.short_url);
                }}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
                title="URL 복사"
              >
                <ClipboardCopy className="w-3.5 h-3.5" />
                URL 복사
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              {formatDate(site.created_at)}
            </p>
          </Link>
        ))}
      </div>

      {sites?.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <MapPin className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>등록된 현장이 없습니다</p>
          <Link
            to="/sites/new"
            className="inline-flex items-center gap-2 mt-4 text-primary hover:underline"
          >
            <PlusCircle className="w-4 h-4" />
            첫 현장을 등록하세요
          </Link>
        </div>
      )}
    </div>
  );
}
