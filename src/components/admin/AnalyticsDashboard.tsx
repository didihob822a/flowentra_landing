import { useState, useEffect, useMemo } from "react";
import {
  BarChart3, Users, Eye, Clock, Globe, Monitor, Smartphone,
  TrendingUp, ArrowUp, ArrowDown, Activity, MousePointerClick,
  RefreshCw,
} from "lucide-react";

// ==================== TYPES ====================

interface PageView {
  path: string;
  timestamp: number;
  referrer: string;
  userAgent: string;
  sessionId: string;
  screenWidth: number;
}

interface AnalyticsData {
  views: PageView[];
}

// ==================== STORAGE ====================

const ANALYTICS_KEY = "flowentra_analytics";

function loadAnalytics(): AnalyticsData {
  try {
    const stored = localStorage.getItem(ANALYTICS_KEY);
    return stored ? JSON.parse(stored) : { views: [] };
  } catch {
    return { views: [] };
  }
}

// ==================== HELPERS ====================

function getSessionId(): string {
  let sid = sessionStorage.getItem("flo_sid");
  if (!sid) {
    sid = Date.now().toString(36) + Math.random().toString(36).slice(2);
    sessionStorage.setItem("flo_sid", sid);
  }
  return sid;
}

function getDeviceType(width: number): "desktop" | "tablet" | "mobile" {
  if (width >= 1024) return "desktop";
  if (width >= 768) return "tablet";
  return "mobile";
}

// ==================== TRACKER (called from App) ====================

export function trackPageView(path: string) {
  try {
    const blocked = ["lovable.dev", "lovable.app", "lovableproject.com"];
    const referrer = document.referrer || "direct";
    // Skip tracking if referrer is from lovable
    const cleanReferrer = (referrer !== "direct" && blocked.some(b => referrer.includes(b))) ? "direct" : referrer;
    
    const data = loadAnalytics();
    const view: PageView = {
      path,
      timestamp: Date.now(),
      referrer: cleanReferrer,
      userAgent: navigator.userAgent,
      sessionId: getSessionId(),
      screenWidth: window.innerWidth,
    };
    data.views.push(view);
    // Keep last 10000 entries
    if (data.views.length > 10000) data.views = data.views.slice(-10000);
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(data));
  } catch {
    // Fail silently
  }
}

// ==================== COMPONENT ====================

type TimeRange = "today" | "7d" | "30d" | "all";

const AnalyticsDashboard = () => {
  const [data, setData] = useState<AnalyticsData>(loadAnalytics());
  const [range, setRange] = useState<TimeRange>("7d");

  const refresh = () => setData(loadAnalytics());

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const filteredViews = useMemo(() => {
    const now = Date.now();
    const cutoff = range === "today" ? now - 86400000
      : range === "7d" ? now - 7 * 86400000
      : range === "30d" ? now - 30 * 86400000
      : 0;
    return data.views.filter(v => v.timestamp >= cutoff);
  }, [data, range]);

  // ---- Computed metrics ----
  const totalViews = filteredViews.length;
  const uniqueSessions = new Set(filteredViews.map(v => v.sessionId)).size;
  const topPages = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredViews.forEach(v => { counts[v.path] = (counts[v.path] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [filteredViews]);

  const topReferrers = useMemo(() => {
    const counts: Record<string, number> = {};
    const blocked = ["lovable.dev", "lovable.app", "lovableproject.com"];
    filteredViews.forEach(v => {
      let ref = "Direct";
      if (v.referrer && v.referrer !== "direct") {
        try {
          const hostname = new URL(v.referrer).hostname;
          if (blocked.some(b => hostname.includes(b))) return;
          ref = hostname;
        } catch {
          ref = "Direct";
        }
      }
      counts[ref] = (counts[ref] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [filteredViews]);

  const deviceBreakdown = useMemo(() => {
    const counts = { desktop: 0, tablet: 0, mobile: 0 };
    filteredViews.forEach(v => { counts[getDeviceType(v.screenWidth)]++; });
    return counts;
  }, [filteredViews]);

  const hourlyData = useMemo(() => {
    const hours: number[] = Array(24).fill(0);
    filteredViews.forEach(v => {
      const h = new Date(v.timestamp).getHours();
      hours[h]++;
    });
    return hours;
  }, [filteredViews]);

  const dailyData = useMemo(() => {
    const days: Record<string, number> = {};
    filteredViews.forEach(v => {
      const day = new Date(v.timestamp).toISOString().slice(0, 10);
      days[day] = (days[day] || 0) + 1;
    });
    return Object.entries(days).sort((a, b) => a[0].localeCompare(b[0])).slice(-30);
  }, [filteredViews]);

  // ---- Real-time: active in last 5 min ----
  const realtimeActive = useMemo(() => {
    const cutoff = Date.now() - 5 * 60000;
    return new Set(data.views.filter(v => v.timestamp >= cutoff).map(v => v.sessionId)).size;
  }, [data]);

  const maxHourly = Math.max(...hourlyData, 1);
  const maxDaily = Math.max(...dailyData.map(d => d[1]), 1);
  const deviceTotal = deviceBreakdown.desktop + deviceBreakdown.tablet + deviceBreakdown.mobile || 1;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          {(["today", "7d", "30d", "all"] as TimeRange[]).map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                range === r ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r === "today" ? "Today" : r === "7d" ? "7 Days" : r === "30d" ? "30 Days" : "All Time"}
            </button>
          ))}
        </div>
        <button onClick={refresh} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Refresh">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Page Views", value: totalViews.toLocaleString(), icon: Eye, color: "text-blue-600 bg-blue-500/10" },
          { label: "Unique Visitors", value: uniqueSessions.toLocaleString(), icon: Users, color: "text-green-600 bg-green-500/10" },
          { label: "Active Now", value: realtimeActive.toString(), icon: Activity, color: "text-amber-600 bg-amber-500/10" },
          { label: "Avg/Day", value: dailyData.length > 0 ? Math.round(totalViews / dailyData.length).toLocaleString() : "0", icon: TrendingUp, color: "text-purple-600 bg-purple-500/10" },
        ].map(stat => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{stat.label}</p>
                <p className="text-xl font-bold">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        {/* Daily Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" /> Daily Views
          </h3>
          {dailyData.length > 0 ? (
            <div className="flex items-end gap-1 h-32">
              {dailyData.map(([day, count]) => (
                <div key={day} className="flex-1 flex flex-col items-center group relative" title={`${day}: ${count} views`}>
                  <div
                    className="w-full bg-primary/20 hover:bg-primary/40 rounded-t transition-colors min-h-[2px]"
                    style={{ height: `${(count / maxDaily) * 100}%` }}
                  />
                  <div className="absolute -top-6 bg-foreground text-background text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {count}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-10">No data for this period</p>
          )}
          {dailyData.length > 0 && (
            <div className="flex justify-between mt-2 text-[9px] text-muted-foreground/50">
              <span>{dailyData[0]?.[0]}</span>
              <span>{dailyData[dailyData.length - 1]?.[0]}</span>
            </div>
          )}
        </div>

        {/* Hourly Heatmap */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" /> Hourly Activity
          </h3>
          <div className="grid grid-cols-6 gap-1">
            {hourlyData.map((count, h) => (
              <div
                key={h}
                className="aspect-square rounded flex items-center justify-center text-[8px] font-mono cursor-default transition-colors"
                style={{
                  backgroundColor: count === 0 ? "hsl(var(--muted))" : `hsl(var(--primary) / ${Math.max(0.1, count / maxHourly)})`,
                  color: count / maxHourly > 0.5 ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
                }}
                title={`${h}:00 — ${count} views`}
              >
                {h}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Top Pages */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
            <MousePointerClick className="w-4 h-4 text-primary" /> Top Pages
          </h3>
          {topPages.length > 0 ? (
            <div className="space-y-2">
              {topPages.map(([path, count]) => (
                <div key={path} className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="relative h-6 bg-muted rounded overflow-hidden">
                      <div className="absolute inset-y-0 left-0 bg-primary/15 rounded" style={{ width: `${(count / (topPages[0]?.[1] || 1)) * 100}%` }} />
                      <span className="absolute inset-0 flex items-center px-2 text-[10px] font-mono truncate">{path}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-6">No data</p>
          )}
        </div>

        {/* Top Referrers */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" /> Top Referrers
          </h3>
          {topReferrers.length > 0 ? (
            <div className="space-y-2">
              {topReferrers.map(([ref, count]) => (
                <div key={ref} className="flex items-center justify-between">
                  <span className="text-xs truncate max-w-[150px]">{ref}</span>
                  <span className="text-[10px] font-bold text-muted-foreground">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-6">No data</p>
          )}
        </div>

        {/* Device Breakdown */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
            <Monitor className="w-4 h-4 text-primary" /> Devices
          </h3>
          <div className="space-y-3">
            {[
              { label: "Desktop", value: deviceBreakdown.desktop, icon: Monitor },
              { label: "Tablet", value: deviceBreakdown.tablet, icon: Monitor },
              { label: "Mobile", value: deviceBreakdown.mobile, icon: Smartphone },
            ].map(d => {
              const pct = Math.round((d.value / deviceTotal) * 100);
              return (
                <div key={d.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">{d.label}</span>
                    <span className="text-[10px] text-muted-foreground">{pct}% ({d.value})</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary/50 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
