"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileAudio, Loader2, AlertCircle, CloudUpload, Check, AudioWaveform, Users, FileText, Database, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import type { UploadResponse } from "@/lib/types"

// Processing step definition
interface ProcessingStep {
  id: number
  label: string
  icon: React.ElementType
  progress: number
  status: "pending" | "processing" | "completed" | "error"
  description: string
}

export function SessionUploader() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Processing steps state
  const [steps, setSteps] = useState<ProcessingStep[]>([
    {
      id: 1,
      label: "Audio Upload",
      icon: Upload,
      progress: 0,
      status: "pending",
      description: "Uploading audio file to server"
    },
    {
      id: 2,
      label: "Transcription (Whisper)",
      icon: AudioWaveform,
      progress: 0,
      status: "pending",
      description: "Converting speech to text using OpenAI Whisper"
    },
    {
      id: 3,
      label: "Speaker Identification",
      icon: Users,
      progress: 0,
      status: "pending",
      description: "Identifying therapist and client speakers"
    },
    {
      id: 4,
      label: "Session Summary",
      icon: FileText,
      progress: 0,
      status: "pending",
      description: "Generating AI-powered summary"
    },
    {
      id: 5,
      label: "Vector Embeddings",
      icon: Sparkles,
      progress: 0,
      status: "pending",
      description: "Creating semantic embeddings for search"
    },
    {
      id: 6,
      label: "Database Storage",
      icon: Database,
      progress: 0,
      status: "pending",
      description: "Saving session data to Supabase"
    }
  ])

  // Update a specific step
  const updateStep = (stepId: number, updates: Partial<ProcessingStep>) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ))
  }

  // Reset all steps
  const resetSteps = () => {
    setSteps(prev => prev.map(step => ({ ...step, progress: 0, status: "pending" as const })))
  }

  // Simulate step progress for visual feedback
  const simulateStepProgress = async (stepId: number, duration: number): Promise<void> => {
    return new Promise((resolve) => {
      updateStep(stepId, { status: "processing", progress: 0 })
      
      const steps = 20
      const interval = duration / steps
      let currentProgress = 0

      const timer = setInterval(() => {
        currentProgress += 100 / steps
        if (currentProgress >= 100) {
          clearInterval(timer)
          updateStep(stepId, { status: "completed", progress: 100 })
          resolve()
        } else {
          updateStep(stepId, { progress: Math.min(currentProgress, 100) })
        }
      }, interval)
    })
  }

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
      resetSteps()
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
    resetSteps()

    try {
      // Step 1: Upload file
      updateStep(1, { status: "processing", progress: 0 })
      const formData = new FormData()
      formData.append("audio", file)

      // Simulate upload progress
      await simulateStepProgress(1, 1500)

      // Start backend processing - all steps happen in parallel on backend
      // but we simulate sequential progress for better UX
      const uploadPromise = fetch("/api/sessions/upload", {
        method: "POST",
        body: formData,
      })

      // Step 2: Transcription (longest step)
      await simulateStepProgress(2, 8000)

      // Step 3: Speaker Identification
      await simulateStepProgress(3, 3000)

      // Step 4: Summary Generation
      await simulateStepProgress(4, 4000)

      // Step 5: Vector Embeddings
      await simulateStepProgress(5, 2000)

      // Step 6: Database Storage
      await simulateStepProgress(6, 2000)

      // Wait for actual backend response
      const res = await uploadPromise

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || `Upload failed: ${res.statusText}`)
      }

      const data: UploadResponse = await res.json()

      // All steps completed
      setUploadProgress("Processing complete! Redirecting...")
      
      // Small delay before redirect to show completion
      setTimeout(() => {
        router.push(`/sessions/${data.id}`)
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during upload")
      // Mark current processing step as error
      const processingStep = steps.find(s => s.status === "processing")
      if (processingStep) {
        updateStep(processingStep.id, { status: "error" })
      }
    } finally {
      setIsLoading(false)
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

      {/* Processing Steps */}
      {isLoading && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Processing Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {steps.map((step) => (
                <ProcessingStepItem key={step.id} step={step} />
              ))}
            </div>
            {uploadProgress && (
              <div className="mt-4 pt-4 border-t flex items-center justify-center gap-2 text-sm text-green-600 font-medium">
                <Check className="h-4 w-4" />
                {uploadProgress}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Processing Step Item Component
function ProcessingStepItem({ step }: { step: ProcessingStep }) {
  const Icon = step.icon

  return (
    <div
      className={cn(
        "border rounded-lg p-3 transition-all",
        step.status === "completed" && "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-900",
        step.status === "processing" && "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900",
        step.status === "error" && "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900",
        step.status === "pending" && "bg-muted/30 border-muted"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn(
          "p-2 rounded-lg flex-shrink-0",
          step.status === "completed" && "bg-green-100 dark:bg-green-900",
          step.status === "processing" && "bg-blue-100 dark:bg-blue-900",
          step.status === "error" && "bg-red-100 dark:bg-red-900",
          step.status === "pending" && "bg-muted"
        )}>
          {step.status === "completed" ? (
            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
          ) : step.status === "processing" ? (
            <Loader2 className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-spin" />
          ) : step.status === "error" ? (
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          ) : (
            <Icon className="h-4 w-4 text-muted-foreground" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-semibold">
              {step.label}
            </h4>
            <span className={cn(
              "text-xs font-medium px-2 py-0.5 rounded",
              step.status === "completed" && "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
              step.status === "processing" && "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
              step.status === "error" && "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
              step.status === "pending" && "bg-muted text-muted-foreground"
            )}>
              {step.status === "pending" && "Pending"}
              {step.status === "processing" && "Processing"}
              {step.status === "completed" && "Completed"}
              {step.status === "error" && "Error"}
            </span>
          </div>

          <p className="text-xs text-muted-foreground mb-2">
            {step.description}
          </p>

          {/* Progress Bar */}
          {(step.status === "processing" || step.status === "completed") && (
            <div className="space-y-1">
              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-300 ease-out",
                    step.status === "completed" ? "bg-green-500" : "bg-blue-500"
                  )}
                  style={{ width: `${step.progress}%` }}
                />
              </div>
              {step.status === "processing" && (
                <div className="text-xs text-muted-foreground">
                  {Math.round(step.progress)}%
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
