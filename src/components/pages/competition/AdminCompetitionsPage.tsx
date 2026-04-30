"use client";

import { formatCompetitionDate } from "@/components/pages/competition/competitionUi";
import { ICompetition, Mode } from "@/models";
import { Badge, Button, Card, TextField } from "@radix-ui/themes";
import { ArrowLeft, CalendarPlus, ChevronRight, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export function AdminCompetitionsPage() {
  const [competitions, setCompetitions] = useState<ICompetition[]>([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const loadCompetitions = async () => {
      const response = await fetch("/api/competitions");

      if (!response.ok) {
        setError("Unable to load competitions");
        setIsLoading(false);
        return;
      }

      setCompetitions(await response.json());
      setIsLoading(false);
    };

    void loadCompetitions();
  }, []);

  const handleCreateCompetition = async (event: FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      const response = await fetch("/api/competitions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, date, mode: Mode.yellow }),
      });

      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.error ?? "Unable to create competition");
      }

      router.push(`/competitions/${body.id}`);
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Unable to create competition",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="container max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="2"
            className="text-black"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            <h1 className="text-xl font-semibold">Competitions</h1>
          </div>
        </div>
      </header>

      <main className="container max-w-3xl mx-auto px-4 py-6 space-y-6">
        <form onSubmit={handleCreateCompetition}>
          <Card className="p-6 space-y-5">
            <div>
              <h2 className="text-2xl font-bold">Create Competition</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Create the public check-in link and scoring cards.
              </p>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-medium">Competition name</span>
              <TextField.Root
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Spring club shoot"
                maxLength={80}
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium">Date</span>
              <input
                className="w-full rounded-md border bg-background px-3 py-2"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </label>

            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="font-semibold">Rounds</p>
              <p className="text-sm text-muted-foreground mt-1">
                Morning uses yellow mode. Afternoon uses red mode.
              </p>
            </div>

            {error && <p className="text-sm text-red-700">{error}</p>}

            <Button type="submit" size="3" disabled={isSaving || !title.trim()}>
              <CalendarPlus className="w-5 h-5 mr-1" />
              Create Competition
            </Button>
          </Card>
        </form>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Your Competitions</h2>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading competitions...</p>
          ) : competitions.length === 0 ? (
            <Card className="p-4 text-sm text-muted-foreground">
              No competitions yet.
            </Card>
          ) : (
            competitions.map((competition) => (
              <button
                key={competition.id}
                className="block w-full text-left"
                onClick={() => router.push(`/competitions/${competition.id}`)}
              >
                <Card className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{competition.title}</h3>
                        <Badge
                          color={
                            competition.status === "finished" ? "green" : "blue"
                          }
                          variant="surface"
                        >
                          {competition.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatCompetitionDate(competition.date)} · Morning
                        yellow · Afternoon red
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </Card>
              </button>
            ))
          )}
        </section>
      </main>
    </div>
  );
}
