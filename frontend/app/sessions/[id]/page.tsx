"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Copy, Download, FileAudio, Loader2, CheckCircle, HardDrive, Clock } from "lucide-react"
import type { Session } from "@/lib/types"
import { parseTranscript, formatFileSize } from "@/lib/types"
import { cn } from "@/lib/utils"

export default function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  useEffect(() => {
    fetchSession()
  }, [id])

  const fetchSession = async () => {
    try {
      const res = await fetch(`/api/sessions/${id}`)
      if (!res.ok) throw new Error("Failed to fetch session")
      const data = await res.json()
      setSession(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load session")
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const downloadAsFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <main className="min-h-[calc(100vh-3.5rem)] bg-background py-12 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </main>
    )
  }

  if (error || !session) {
    return (
      <main className="min-h-[calc(100vh-3.5rem)] bg-background py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="border-destructive">
            <CardContent className="py-6 text-center">
              <p className="text-destructive mb-4">{error || "Session not found"}</p>
              <Button asChild variant="outline">
                <Link href="/sessions">Back to Sessions</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  const parsedTranscript = parseTranscript(session.transcript)

  return (
    <main className="min-h-[calc(100vh-3.5rem)] bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/sessions">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sessions
            </Link>
          </Button>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileAudio className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-foreground">{session.originalFilename}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <HardDrive className="h-4 w-4" />
                    {formatFileSize(session.size)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {session.mimetype}
                  </span>
                </div>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                session.status === "transcribed"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
              }`}
            >
              {session.status}
            </span>
          </div>
        </div>

        {/* Summary Card */}
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">AI Summary</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(session.summary, "summary")}>
                {copiedField === "summary" ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed">{session.summary}</p>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="speaker-labeled" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="speaker-labeled">Speaker-Labeled</TabsTrigger>
            <TabsTrigger value="raw">Raw Transcript</TabsTrigger>
          </TabsList>

          {/* Speaker-Labeled Transcript */}
          <TabsContent value="speaker-labeled">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Speaker-Labeled Transcript</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(session.transcript, "transcript")}
                    >
                      {copiedField === "transcript" ? (
                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="mr-2 h-4 w-4" />
                      )}
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        downloadAsFile(session.transcript, `${session.originalFilename}-transcript.txt`, "text/plain")
                      }
                    >
                      <Download className="mr-2 h-4 w-4" />
                      TXT
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="max-h-[500px] overflow-y-auto space-y-4 pr-2">
                  {parsedTranscript.length > 0 ? (
                    parsedTranscript.map((entry, index) => (
                      <div
                        key={index}
                        className={cn(
                          "border-l-4 pl-4 py-2",
                          entry.role === "Therapist"
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                            : "border-green-500 bg-green-50 dark:bg-green-950/20",
                        )}
                      >
                        <p
                          className={cn(
                            "text-sm font-semibold mb-1",
                            entry.role === "Therapist"
                              ? "text-blue-700 dark:text-blue-400"
                              : "text-green-700 dark:text-green-400",
                          )}
                        >
                          {entry.speaker} ({entry.role})
                        </p>
                        <p className="text-foreground">{entry.text}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground whitespace-pre-wrap">{session.transcript}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Raw Transcript */}
          <TabsContent value="raw">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Raw Transcript</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(session.rawTranscript, "raw")}>
                      {copiedField === "raw" ? (
                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="mr-2 h-4 w-4" />
                      )}
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        downloadAsFile(session.rawTranscript, `${session.originalFilename}-raw.txt`, "text/plain")
                      }
                    >
                      <Download className="mr-2 h-4 w-4" />
                      TXT
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="max-h-[500px] overflow-y-auto">
                  <p className="text-foreground whitespace-pre-wrap leading-relaxed">{session.rawTranscript}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Export JSON */}
        <div className="mt-6 flex justify-end">
          <Button
            variant="outline"
            onClick={() =>
              downloadAsFile(
                JSON.stringify(session, null, 2),
                `${session.originalFilename}-session.json`,
                "application/json",
              )
            }
          >
            <Download className="mr-2 h-4 w-4" />
            Export JSON
          </Button>
        </div>
      </div>
    </main>
  )
}
