import { useState } from "react";
import { useJobs, useDeleteJob, useUpdateJob } from "@/hooks/use-jobs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Trash2,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  reviewed: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  shortlisted: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  applied: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const enrichmentColors: Record<string, string> = {
  pending: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  enriching: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  failed: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
};

export default function Jobs() {
  const [source, setSource] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { toast } = useToast();

  const { data, isLoading } = useJobs({
    source: source || undefined,
    status: status || undefined,
    search: search || undefined,
    page,
    limit: 15,
  });

  const deleteJob = useDeleteJob();

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    deleteJob.mutate(id, {
      onSuccess: () => toast({ title: "Job deleted" }),
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Jobs</h1>
        <p className="text-sm text-muted-foreground">
          Browse and manage scraped job listings
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search jobs..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 h-9"
              />
            </div>
            <Select
              value={source}
              onValueChange={(v) => {
                setSource(v === "all" ? "" : v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[150px] h-9">
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="google_jobs">Google Jobs</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={status}
              onValueChange={(v) => {
                setStatus(v === "all" ? "" : v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[150px] h-9">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !data?.jobs?.length ? (
            <div className="p-12 text-center text-muted-foreground">
              No jobs found matching your filters.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Title</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Enrichment</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.jobs.map((job) => (
                    <TableRow key={job.id} className="cursor-pointer group">
                      <TableCell>
                        <Link href={`/jobs/${job.id}`}>
                          <span className="font-medium text-sm hover:text-primary transition-colors">
                            {job.title}
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm">{job.company}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {job.location || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={job.source === "linkedin" ? "default" : "secondary"}
                          className="text-[10px]"
                        >
                          {job.source === "linkedin" ? "LinkedIn" : "Google"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            statusColors[job.status] || ""
                          }`}
                        >
                          {job.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            enrichmentColors[job.enrichmentStatus || "pending"] || ""
                          }`}
                        >
                          {job.enrichmentStatus === "completed" && (
                            <Sparkles className="h-2.5 w-2.5 mr-1" />
                          )}
                          {job.enrichmentStatus || "pending"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {job.aiMatchScore != null ? (
                          <span className="text-sm font-semibold">{job.aiMatchScore}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100"
                          onClick={(e) => handleDelete(job.id, e)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {data.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <p className="text-xs text-muted-foreground">
                    Page {data.page} of {data.totalPages} &middot; {data.total} total
                  </p>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      disabled={page >= data.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
