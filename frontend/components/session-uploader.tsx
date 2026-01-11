"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileAudio, Loader2, AlertCircle, CloudUpload } from "lucide-react"
import { cn } from "@/lib/utils"
import type { UploadResponse } from "@/lib/types"

export function SessionUploader() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Validate file type
  const validateFile = (file: File): boolean => {
    const validTypes = ["audio/mp3", "audio/mpeg", "audio/wav", "audio/x-wav", "audio/ogg", "audio/webm"]
    if (!file.type.includes("audio") && !validTypes.includes(file.type)) {
      setError("Please select a valid audio file (MP3, WAV, OGG, WebM)")
      return false
    }
    return true
  }

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile)
      setError(null)
    }
  }

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && validateFile(droppedFile)) {
      setFile(droppedFile)
      setError(null)
    }
  }, [])

  // Handle file upload to backend
  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first")
      return
    }

    setIsLoading(true)
    setError(null)
    setUploadProgress("Uploading file...")

    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append("audio", file)

      setUploadProgress("Processing audio... This may take 10-30 seconds")

      const res = await fetch("/api/sessions/upload", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || `Upload failed: ${res.statusText}`)
      }

      const data: UploadResponse = await res.json()

      // Navigate to the session detail page
      router.push(`/sessions/${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during upload")
    } finally {
      setIsLoading(false)
      setUploadProgress(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileAudio className="h-5 w-5" />
            Upload Audio File
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Drag and Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              isDragOver
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
              file && "border-primary/50 bg-primary/5",
            )}
          >
            <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileChange} className="hidden" />
            <CloudUpload
              className={cn("h-10 w-10 mx-auto mb-3", isDragOver ? "text-primary" : "text-muted-foreground")}
            />
            {file ? (
              <div>
                <p className="font-medium text-foreground">{file.name}</p>
                <p className="text-sm text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            ) : (
              <div>
                <p className="font-medium text-foreground">Drop your audio file here</p>
                <p className="text-sm text-muted-foreground">or click to browse (MP3, WAV, OGG)</p>
              </div>
            )}
          </div>

          {/* Upload Button */}
          <Button onClick={handleUpload} disabled={!file || isLoading} className="min-w-[120px]" size="lg">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload & Process
              </>
            )}
          </Button>

          {/* Progress Message */}
          {uploadProgress && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {uploadProgress}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Status badge component for displaying processing status
function StatusBadge({ label, completed }: { label: string; completed: boolean }) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
        completed
          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
          : "bg-muted text-muted-foreground"
      }`}
    >
      {completed ? (
        <div className="h-4 w-4 rounded-full bg-green-800" />
      ) : (
        <div className="h-4 w-4 rounded-full border-2 border-current" />
      )}
      {label}
    </div>
  )
}
