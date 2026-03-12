import { useRoute } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { useJob, useUpdateJob, useEnrichJob } from "@/hooks/use-jobs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Briefcase,
  Globe,
  Calendar,
  Sparkles,
  ExternalLink,
  Brain,
  Target,
  IndianRupee,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function JobDetail() {
  const [, params] = useRoute("/jobs/:id");
  const jobId = params?.id ? parseInt(params.id) : 0;
  const { data: job, isLoading } = useJob(jobId);
  const updateJob = useUpdateJob();
  const enrichJob = useEnrichJob();
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            <Skeleton className="h-64 rounded-xl" />
          </div>
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Job not found.</p>
        <Link href="/jobs">
          <Button variant="outline" className="mt-4">
            Back to Jobs
          </Button>
        </Link>
      </div>
    );
  }

  const skills: string[] = job.aiKeySkills ? JSON.parse(job.aiKeySkills) : [];

  const handleStatusChange = (newStatus: string) => {
    updateJob.mutate(
      { id: job.id, data: { status: newStatus } },
      { onSuccess: () => toast({ title: `Status updated to ${newStatus}` }) }
    );
  };

  const handleEnrich = () => {
    enrichJob.mutate(job.id, {
      onSuccess: () =>
        toast({
          title: "Enrichment started",
          description: "AI analysis will complete in a few seconds.",
        }),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link href="/jobs">
            <Button variant="ghost" size="icon" className="h-8 w-8 mt-0.5">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold">{job.title}</h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" />
                {job.company}
              </span>
              {job.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {job.location}
                </span>
              )}
              {job.jobType && (
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5" />
                  {job.jobType}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={job.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="shortlisted">Shortlisted</SelectItem>
              <SelectItem value="applied">Applied</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          {job.applyUrl && (
            <a href={job.applyUrl} target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="h-8 text-xs">
                <ExternalLink className="h-3 w-3 mr-1.5" />
                Apply
              </Button>
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Description */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
                {job.description || "No description available."}
              </p>
            </CardContent>
          </Card>

          {/* AI Summary */}
          {job.aiSummary && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  AI Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-relaxed">{job.aiSummary}</p>
                {skills.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Key Skills
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {skills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="text-[10px]"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  {job.aiMatchScore != null && (
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Match Score</p>
                        <p className="text-lg font-bold">{job.aiMatchScore}/100</p>
                      </div>
                    </div>
                  )}
                  {job.aiSalaryEstimate && (
                    <div className="flex items-center gap-2">
                      <IndianRupee className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Est. Salary
                        </p>
                        <p className="text-sm font-semibold">
                          {job.aiSalaryEstimate}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Job meta */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Source</span>
                <Badge
                  variant={job.source === "linkedin" ? "default" : "secondary"}
                  className="text-[10px]"
                >
                  {job.source === "linkedin" ? "LinkedIn" : "Google Jobs"}
                </Badge>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Experience</span>
                <span>{job.experienceLevel || "—"}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Salary</span>
                <span>{job.salary || "—"}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Posted</span>
                <span>
                  {job.postedAt
                    ? new Date(job.postedAt).toLocaleDateString()
                    : "—"}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Enrichment</span>
                <Badge variant="outline" className="text-[10px]">
                  {job.enrichmentStatus || "pending"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Company Info */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  Company Info
                </CardTitle>
                {job.enrichmentStatus !== "completed" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={handleEnrich}
                    disabled={enrichJob.isPending || job.enrichmentStatus === "enriching"}
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    {job.enrichmentStatus === "enriching" ? "Enriching..." : "Enrich"}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {job.companyDescription ? (
                <>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {job.companyDescription}
                  </p>
                  <Separator />
                  {job.companyIndustry && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Industry</span>
                      <span>{job.companyIndustry}</span>
                    </div>
                  )}
                  {job.companySize && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Size</span>
                      <span>{job.companySize}</span>
                    </div>
                  )}
                  {job.companyFounded && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Founded</span>
                      <span>{job.companyFounded}</span>
                    </div>
                  )}
                  {job.companyWebsite && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Website</span>
                      <a
                        href={job.companyWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        <Globe className="h-3 w-3" /> Visit
                      </a>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Company data not yet enriched. Click "Enrich" to fetch company
                  info and AI analysis.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
