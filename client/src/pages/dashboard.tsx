import { useDashboardStats } from "@/hooks/use-jobs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  Briefcase,
  Sparkles,
  Clock,
  TrendingUp,
  ExternalLink,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  new: "hsl(239 84% 67%)",
  reviewed: "hsl(43 74% 49%)",
  shortlisted: "hsl(173 58% 39%)",
  applied: "hsl(262 83% 58%)",
  rejected: "hsl(0 84% 60%)",
};

const SOURCE_COLORS: Record<string, string> = {
  linkedin: "hsl(239 84% 67%)",
  google_jobs: "hsl(173 58% 39%)",
};

function StatCard({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {title}
            </p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of your job pipeline</p>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const sourceData = stats.sources.map((s) => ({
    name: s.source === "linkedin" ? "LinkedIn" : "Google Jobs",
    value: s.count,
    fill: SOURCE_COLORS[s.source] || "hsl(220 9% 46%)",
  }));

  const statusData = stats.statuses.map((s) => ({
    name: s.status.charAt(0).toUpperCase() + s.status.slice(1),
    value: s.count,
    fill: STATUS_COLORS[s.status] || "hsl(220 9% 46%)",
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your job pipeline
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Jobs"
          value={stats.totalJobs}
          icon={Briefcase}
          description="Across all sources"
        />
        <StatCard
          title="New Jobs"
          value={stats.newJobs}
          icon={Clock}
          description="Unreviewed"
        />
        <StatCard
          title="Enriched"
          value={stats.enrichedJobs}
          icon={Sparkles}
          description="AI-analyzed"
        />
        <StatCard
          title="Match Rate"
          value={
            stats.totalJobs > 0
              ? Math.round((stats.enrichedJobs / stats.totalJobs) * 100) + "%"
              : "0%"
          }
          icon={TrendingUp}
          description="Enrichment coverage"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Jobs by Source
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {sourceData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-2">
              {sourceData.map((s) => (
                <div key={s.name} className="flex items-center gap-2 text-xs">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: s.fill }}
                  />
                  {s.name}: {s.value}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Jobs by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={80}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {statusData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent jobs */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Recent Jobs</CardTitle>
            <Link href="/jobs">
              <span className="text-xs text-primary hover:underline cursor-pointer flex items-center gap-1">
                View all <ExternalLink className="h-3 w-3" />
              </span>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.recentJobs.map((job) => (
              <Link key={job.id} href={`/jobs/${job.id}`}>
                <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{job.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {job.company} &middot; {job.location || "Remote"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Badge
                      variant={job.source === "linkedin" ? "default" : "secondary"}
                      className="text-[10px] px-1.5"
                    >
                      {job.source === "linkedin" ? "LinkedIn" : "Google"}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] px-1.5">
                      {job.status}
                    </Badge>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
