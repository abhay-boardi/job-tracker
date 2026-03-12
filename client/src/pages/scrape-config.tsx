import { useState } from "react";
import { useScrapeLinkedIn, useScrapeGoogle } from "@/hooks/use-jobs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Linkedin, Globe, Zap, Search, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PRESETS = [
  { label: "Frontend Dev", query: "Frontend Developer", location: "Bangalore" },
  { label: "Backend Eng", query: "Backend Engineer", location: "India" },
  { label: "Full Stack", query: "Full Stack Developer", location: "Remote India" },
  { label: "Data Scientist", query: "Data Scientist", location: "Hyderabad" },
  { label: "DevOps", query: "DevOps Engineer", location: "Pune" },
  { label: "Product Mgr", query: "Product Manager", location: "Mumbai" },
];

export default function ScrapeConfig() {
  const [linkedinQuery, setLinkedinQuery] = useState("");
  const [linkedinLocation, setLinkedinLocation] = useState("");
  const [linkedinLimit, setLinkedinLimit] = useState("20");
  const [googleQuery, setGoogleQuery] = useState("");
  const [googleLocation, setGoogleLocation] = useState("");
  const [googleCountry, setGoogleCountry] = useState("in");
  const { toast } = useToast();

  const scrapeLinkedIn = useScrapeLinkedIn();
  const scrapeGoogle = useScrapeGoogle();

  const handleLinkedInScrape = () => {
    if (!linkedinQuery.trim()) return;
    scrapeLinkedIn.mutate(
      {
        query: linkedinQuery,
        location: linkedinLocation || undefined,
        limit: parseInt(linkedinLimit) || 20,
      },
      {
        onSuccess: () =>
          toast({
            title: "LinkedIn scrape started",
            description: "Jobs will appear shortly.",
          }),
      }
    );
  };

  const handleGoogleScrape = () => {
    if (!googleQuery.trim()) return;
    scrapeGoogle.mutate(
      {
        query: googleQuery,
        location: googleLocation || undefined,
        country: googleCountry || undefined,
      },
      {
        onSuccess: () =>
          toast({
            title: "Google Jobs scrape started",
            description: "Jobs will appear shortly.",
          }),
      }
    );
  };

  const applyPreset = (preset: (typeof PRESETS)[0], tab: "linkedin" | "google") => {
    if (tab === "linkedin") {
      setLinkedinQuery(preset.query);
      setLinkedinLocation(preset.location);
    } else {
      setGoogleQuery(preset.query);
      setGoogleLocation(preset.location);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Scrape Jobs</h1>
        <p className="text-sm text-muted-foreground">
          Configure and trigger job scraping from LinkedIn and Google Jobs
        </p>
      </div>

      <Tabs defaultValue="linkedin">
        <TabsList>
          <TabsTrigger value="linkedin" className="gap-1.5">
            <Linkedin className="h-3.5 w-3.5" />
            LinkedIn
          </TabsTrigger>
          <TabsTrigger value="google" className="gap-1.5">
            <Globe className="h-3.5 w-3.5" />
            Google Jobs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="linkedin" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Linkedin className="h-4 w-4 text-[#0A66C2]" />
                  LinkedIn Jobs Scraper
                </CardTitle>
                <CardDescription className="text-xs">
                  Uses Apify to scrape LinkedIn job listings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs">Search Query</Label>
                  <Input
                    placeholder="e.g., Senior Frontend Developer"
                    value={linkedinQuery}
                    onChange={(e) => setLinkedinQuery(e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Location</Label>
                    <Input
                      placeholder="e.g., Bangalore"
                      value={linkedinLocation}
                      onChange={(e) => setLinkedinLocation(e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Max Results</Label>
                    <Input
                      type="number"
                      placeholder="20"
                      value={linkedinLimit}
                      onChange={(e) => setLinkedinLimit(e.target.value)}
                      className="h-9"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleLinkedInScrape}
                  disabled={!linkedinQuery.trim() || scrapeLinkedIn.isPending}
                  className="w-full"
                >
                  {scrapeLinkedIn.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Start LinkedIn Scrape
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  Quick Presets
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    className="flex items-center justify-between w-full px-3 py-2 text-xs rounded-lg hover:bg-muted/50 transition-colors text-left"
                    onClick={() => applyPreset(preset, "linkedin")}
                  >
                    <span className="font-medium">{preset.label}</span>
                    <span className="text-muted-foreground">{preset.location}</span>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="google" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Globe className="h-4 w-4 text-emerald-500" />
                  Google Jobs Search
                </CardTitle>
                <CardDescription className="text-xs">
                  Uses Serper API to search Google Jobs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs">Search Query</Label>
                  <Input
                    placeholder="e.g., React Developer"
                    value={googleQuery}
                    onChange={(e) => setGoogleQuery(e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Location</Label>
                    <Input
                      placeholder="e.g., Mumbai"
                      value={googleLocation}
                      onChange={(e) => setGoogleLocation(e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Country Code</Label>
                    <Input
                      placeholder="in"
                      value={googleCountry}
                      onChange={(e) => setGoogleCountry(e.target.value)}
                      className="h-9"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleGoogleScrape}
                  disabled={!googleQuery.trim() || scrapeGoogle.isPending}
                  className="w-full"
                >
                  {scrapeGoogle.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Start Google Jobs Search
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  Quick Presets
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    className="flex items-center justify-between w-full px-3 py-2 text-xs rounded-lg hover:bg-muted/50 transition-colors text-left"
                    onClick={() => applyPreset(preset, "google")}
                  >
                    <span className="font-medium">{preset.label}</span>
                    <span className="text-muted-foreground">{preset.location}</span>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
