"use client"

import { useState, useRef } from "react"
import { Upload, Loader2, Check, AlertCircle, FileAudio, Waveform, Users, FileText, Database, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

// Processing step definition
interface ProcessingStep {
  id: number
  label: string
  icon: React.ElementType
  progress: number
  status: "pending" | "processing" | "completed" | "error"
  description?: string
}

// Session data after processing
interface SessionData {
  transcript: string
  summary: string
  embeddingStatus: string
}

export function SessionProcessingFlow() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(-1)
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Define all processing steps
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
      icon: Waveform,
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
      label: "Session Summary Generation",
      icon: FileText,
      progress: 0,
      status: "pending",
      description: "Generating AI-powered summary"
    },
    {
      id: 5,
      label: "Vector Embedding Generation",
      icon: Sparkles,
      progress: 0,
      status: "pending",
      description: "Creating semantic embeddings for search"
    },
    {
      id: 6,
      label: "Database Storage (Supabase)",
      icon: Database,
      progress: 0,
      status: "pending",
      description: "Saving session data to database"
    }
  ])

  // Update a specific step
  const updateStep = (stepId: number, updates: Partial<ProcessingStep>) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ))
  }

  // Simulate step processing with progress animation
  const processStep = async (stepId: number, duration: number = 3000): Promise<void> => {
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

  // Main processing function
  const handleProcessSession = async () => {
    if (!selectedFile) {
      setError("Please select an audio file first")
      return
    }

    setIsProcessing(true)
    setError(null)
    setCurrentStepIndex(0)

    try {
      // Step 1: Audio Upload (instant)
      await processStep(1, 1000)
      setCurrentStepIndex(1)

      // Step 2: Transcription (longest step, 8-10 seconds in simulation)
      await processStep(2, 8000)
      setCurrentStepIndex(2)

      // TODO: Real backend integration
      // const uploadResponse = await fetch('/api/sessions/upload', {
      //   method: 'POST',
      //   body: formData
      // })
      // const { sessionId } = await uploadResponse.json()
      // 
      // Then poll for status:
      // const pollStatus = async () => {
      //   const statusRes = await fetch(`/api/sessions/${sessionId}/status`)
      //   const status = await statusRes.json()
      //   
      //   // Update steps based on status.currentStep and status.progress
      //   updateStep(status.currentStep, { 
      //     progress: status.progress,
      //     status: status.status 
      //   })
      // }
      //
      // Alternative: Use Server-Sent Events (SSE)
      // const eventSource = new EventSource(`/api/sessions/${sessionId}/stream`)
      // eventSource.onmessage = (event) => {
      //   const data = JSON.parse(event.data)
      //   updateStep(data.stepId, { progress: data.progress, status: data.status })
      // }

      // Step 3: Speaker Identification
      await processStep(3, 3000)
      setCurrentStepIndex(3)

      // Step 4: Summary Generation
      await processStep(4, 4000)
      setCurrentStepIndex(4)

      // Step 5: Vector Embedding
      await processStep(5, 2000)
      setCurrentStepIndex(5)

      // Step 6: Database Storage
      await processStep(6, 2000)
      setCurrentStepIndex(6)

      // Simulate final results
      // In real implementation, fetch from: GET /api/sessions/${sessionId}
      setSessionData({
        transcript: `Speaker A (Therapist): How have you been feeling since our last session?

Speaker B (Client): I've been feeling more anxious lately, especially about work deadlines.

Speaker A (Therapist): Can you tell me more about what's triggering this anxiety?

Speaker B (Client): The pressure from my manager and the constant meetings are overwhelming.

Speaker A (Therapist): Let's explore some strategies to help you manage that stress better.`,
        summary: "The client reported increased anxiety related to work stress, specifically from deadline pressure and frequent meetings. The therapist explored triggers and proposed stress management strategies. The session focused on developing coping mechanisms and setting boundaries in the workplace.",
        embeddingStatus: "1536-dimensional vector embedding stored successfully"
      })

      setIsProcessing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Processing failed")
      setIsProcessing(false)
      // Update current step to error state
      if (currentStepIndex >= 0) {
        updateStep(steps[currentStepIndex].id, { status: "error" })
      }
    }
  }

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const validTypes = ["audio/mp3", "audio/mpeg", "audio/wav", "audio/x-wav"]
      if (!file.type.includes("audio") && !validTypes.includes(file.type)) {
        setError("Please select a valid audio file (MP3 or WAV)")
        return
      }
      setSelectedFile(file)
      setError(null)
      // Reset steps
      setSteps(prev => prev.map(step => ({ ...step, progress: 0, status: "pending" })))
      setSessionData(null)
    }
  }

  // Reset form
  const handleReset = () => {
    setSelectedFile(null)
    setIsProcessing(false)
    setCurrentStepIndex(-1)
    setSessionData(null)
    setError(null)
    setSteps(prev => prev.map(step => ({ ...step, progress: 0, status: "pending" })))
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Session Processing
          </h1>
          <p className="text-gray-600">
            Upload a therapy session audio file to process and analyze
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* File Upload Section */}
          <div className="p-6 border-b border-gray-200">
            <div className="space-y-4">
              {/* File Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Audio File
                </label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="audio/mp3,audio/mpeg,audio/wav,audio/x-wav"
                      onChange={handleFileChange}
                      disabled={isProcessing}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  {selectedFile && !isProcessing && (
                    <button
                      onClick={handleReset}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Reset
                    </button>
                  )}
                </div>
                {selectedFile && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                    <FileAudio className="h-4 w-4" />
                    <span>{selectedFile.name}</span>
                    <span className="text-gray-400">
                      ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                )}
              </div>

              {/* Error Display */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Start Button */}
              <button
                onClick={handleProcessSession}
                disabled={!selectedFile || isProcessing}
                className={cn(
                  "w-full py-3 px-4 rounded-lg font-semibold text-white transition-all",
                  !selectedFile || isProcessing
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]"
                )}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  "Start Processing"
                )}
              </button>
            </div>
          </div>

          {/* Processing Steps */}
          <div className="p-6 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Processing Steps
            </h3>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <ProcessingStepCard
                  key={step.id}
                  step={step}
                  isActive={currentStepIndex === index}
                />
              ))}
            </div>
          </div>

          {/* Results Section */}
          {sessionData && (
            <div className="p-6 border-t border-gray-200 space-y-6">
              <div className="flex items-center gap-2 text-green-600 mb-4">
                <Check className="h-5 w-5" />
                <span className="font-semibold">Processing Complete!</span>
              </div>

              {/* Summary */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Session Summary
                </h4>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {sessionData.summary}
                  </p>
                </div>
              </div>

              {/* Transcript */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Transcript
                </h4>
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                    {sessionData.transcript}
                  </pre>
                </div>
              </div>

              {/* Embedding Status */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Vector Embedding
                </h4>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>{sessionData.embeddingStatus}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleReset}
                  className="flex-1 py-2 px-4 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Process Another Session
                </button>
                <button className="flex-1 py-2 px-4 bg-blue-600 rounded-lg font-medium text-white hover:bg-blue-700 transition-colors">
                  View Full Details
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Individual Processing Step Component
function ProcessingStepCard({ 
  step, 
  isActive 
}: { 
  step: ProcessingStep
  isActive: boolean 
}) {
  const Icon = step.icon

  const statusColors = {
    pending: "bg-gray-100 text-gray-400 border-gray-200",
    processing: "bg-blue-50 text-blue-600 border-blue-200",
    completed: "bg-green-50 text-green-600 border-green-200",
    error: "bg-red-50 text-red-600 border-red-200"
  }

  const statusLabels = {
    pending: "Pending",
    processing: "Processing",
    completed: "Completed",
    error: "Error"
  }

  return (
    <div
      className={cn(
        "border rounded-lg p-4 transition-all",
        statusColors[step.status],
        isActive && "ring-2 ring-blue-400 ring-offset-2"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn(
          "p-2 rounded-lg",
          step.status === "completed" ? "bg-green-100" :
          step.status === "processing" ? "bg-blue-100" :
          step.status === "error" ? "bg-red-100" :
          "bg-gray-100"
        )}>
          {step.status === "completed" ? (
            <Check className="h-5 w-5 text-green-600" />
          ) : step.status === "processing" ? (
            <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
          ) : step.status === "error" ? (
            <AlertCircle className="h-5 w-5 text-red-600" />
          ) : (
            <Icon className="h-5 w-5 text-gray-400" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-semibold text-gray-900">
              {step.label}
            </h4>
            <span className={cn(
              "text-xs font-medium px-2 py-1 rounded",
              step.status === "completed" ? "bg-green-100 text-green-700" :
              step.status === "processing" ? "bg-blue-100 text-blue-700" :
              step.status === "error" ? "bg-red-100 text-red-700" :
              "bg-gray-100 text-gray-600"
            )}>
              {statusLabels[step.status]}
            </span>
          </div>

          {step.description && (
            <p className="text-xs text-gray-600 mb-2">
              {step.description}
            </p>
          )}

          {/* Progress Bar */}
          {(step.status === "processing" || step.status === "completed") && (
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-300 ease-out",
                  step.status === "completed" ? "bg-green-500" : "bg-blue-500"
                )}
                style={{ width: `${step.progress}%` }}
              />
            </div>
          )}

          {/* Progress Percentage */}
          {step.status === "processing" && (
            <div className="text-xs text-gray-500 mt-1">
              {Math.round(step.progress)}%
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
