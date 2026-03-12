import { useScrapeRuns } from "@/hooks/use-jobs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
} from "lucide-react";

const statusIcon: Record<string, React.ReactNode> = {
  completed: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />,
  failed: <XCircle className="h-3.5 w-3.5 text-red-500" />,
  running: <Loader2 className="h-3.5 w-3.5 text-amber-500 animate-spin" />,
  pending: <Clock className="h-3.5 w-3.5 text-muted-foreground" />,
};

const statusBadgeColor: Record<string, string> = {
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  running: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  pending: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

export default function RunHistory() {
  const { data: runs, isLoading } = useScrapeRuns();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Run History</h1>
        <p className="text-sm text-muted-foreground">
          Track scraping runs and their results
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !runs?.length ? (
            <div className="p-12 text-center text-muted-foreground">
              No scrape runs yet. Go to the Scrape page to trigger one.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Query</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Found</TableHead>
                  <TableHead className="text-right">New</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runs.map((run) => {
                  const started = new Date(run.startedAt);
                  const completed = run.completedAt
                    ? new Date(run.completedAt)
                    : null;
                  const duration = completed
                    ? Math.round(
                        (completed.getTime() - started.getTime()) / 1000
                      )
                    : null;

                  return (
                    <TableRow key={run.id}>
                      <TableCell className="text-xs text-muted-foreground">
                        {run.id}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            run.source === "linkedin" ? "default" : "secondary"
                          }
                          className="text-[10px]"
                        >
                          {run.source === "linkedin" ? "LinkedIn" : "Google"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {run.query}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {run.location || "—"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            statusBadgeColor[run.status] || ""
                          }`}
                        >
                          {statusIcon[run.status]}
                          {run.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {run.jobsFound ?? "—"}
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {run.jobsNew ?? "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {started.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {duration != null ? `${duration}s` : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
