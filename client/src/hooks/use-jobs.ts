import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Job, ScrapeRun } from "@shared/schema";

export function useDashboardStats() {
  return useQuery<{
    totalJobs: number;
    newJobs: number;
    enrichedJobs: number;
    sources: { source: string; count: number }[];
    statuses: { status: string; count: number }[];
    recentJobs: Job[];
  }>({
    queryKey: ["/api/dashboard/stats"],
  });
}

export function useJobs(filters: {
  source?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const params = new URLSearchParams();
  if (filters.source) params.set("source", filters.source);
  if (filters.status) params.set("status", filters.status);
  if (filters.search) params.set("search", filters.search);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  const qs = params.toString();
  return useQuery<{ jobs: Job[]; total: number; page: number; totalPages: number }>({
    queryKey: ["/api/jobs" + (qs ? `?${qs}` : "")],
  });
}

export function useJob(id: number) {
  return useQuery<Job>({
    queryKey: ["/api/jobs/" + id],
    enabled: !!id,
  });
}

export function useUpdateJob() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Job> }) => {
      const res = await apiRequest("PATCH", `/api/jobs/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
  });
}

export function useDeleteJob() {
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/jobs/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
  });
}

export function useEnrichJob() {
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/jobs/${id}/enrich`);
      return res.json();
    },
    onSuccess: () => {
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      }, 3000);
    },
  });
}

export function useScrapeLinkedIn() {
  return useMutation({
    mutationFn: async (data: { query: string; location?: string; limit?: number }) => {
      const res = await apiRequest("POST", "/api/scrape/linkedin", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scrape/runs"] });
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
        queryClient.invalidateQueries({ queryKey: ["/api/scrape/runs"] });
      }, 4000);
    },
  });
}

export function useScrapeGoogle() {
  return useMutation({
    mutationFn: async (data: { query: string; location?: string; country?: string }) => {
      const res = await apiRequest("POST", "/api/scrape/google", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scrape/runs"] });
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
        queryClient.invalidateQueries({ queryKey: ["/api/scrape/runs"] });
      }, 3000);
    },
  });
}

export function useScrapeRuns() {
  return useQuery<ScrapeRun[]>({
    queryKey: ["/api/scrape/runs"],
  });
}
