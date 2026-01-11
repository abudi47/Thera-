import { SessionUploader } from "@/components/session-uploader"

export default function Home() {
  return (
    <main className="min-h-[calc(100vh-3.5rem)] bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-3xl font-semibold text-foreground mb-2">Upload Session</h1>
          <p className="text-muted-foreground">Upload an audio file to generate a transcript and AI summary</p>
        </header>
        <SessionUploader />
      </div>
    </main>
  )
}
