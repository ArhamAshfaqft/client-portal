"use client";

import { useState, useCallback } from "react";
import { Pin, MessageSquareText, Mic, Image, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FeedbackWidgetProps {
  projectId: string;
  previewToken: string;
  primaryColor?: string;
  wpUrl?: string;
  wpApiKey?: string;
  onFeedbackSubmit?: (feedback: {
    type: string;
    content: string;
    pageUrl: string;
    coordinates?: { x: number; y: number };
    media?: File[];
  }) => void;
}

type WidgetMode = "pin" | "comment" | "voice" | "media" | null;

export function FeedbackWidget({
  projectId,
  previewToken,
  primaryColor = "#2563eb",
  onFeedbackSubmit,
  wpUrl,
  wpApiKey,
}: FeedbackWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<WidgetMode>(null);
  const [comment, setComment] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [pinMode, setPinMode] = useState(false);
  const [pinPosition, setPinPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const toggleWidget = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      setMode(null);
      setPinMode(false);
      setPinPosition(null);
    }
  };

  const handlePinClick = () => {
    setMode("pin");
    setPinMode(true);
  };

  const handlePageClick = useCallback(
    (e: React.MouseEvent) => {
      if (!pinMode) return;
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setPinPosition({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      });
      setPinMode(false);
    },
    [pinMode]
  );

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioUrl(URL.createObjectURL(blob));
        setIsRecording(false);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch {
      console.error("Microphone access denied");
      setMode(null);
    }
  };

  const stopRecording = () => {
    mediaRecorder?.stop();
    mediaRecorder?.stream.getTracks().forEach((t) => t.stop());
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const submitFeedback = () => {
    const feedback: {
      type: string;
      content: string;
      pageUrl: string;
      coordinates?: { x: number; y: number };
      media?: File[];
    } = {
      type: mode || "comment",
      content: comment || "Feedback submission",
      pageUrl: window.location.href,
    };

    if (pinPosition) {
      feedback.coordinates = pinPosition;
    }

    if (audioUrl) {
      fetch(audioUrl)
        .then((r) => r.blob())
        .then((blob) => {
          feedback.media = [
            new File([blob], `voice-${Date.now()}.webm`, {
              type: "audio/webm",
            }),
          ];
          submitToServer(feedback);
        })
        .catch(console.error);
    } else if (selectedFiles.length > 0) {
      feedback.media = selectedFiles;
      submitToServer(feedback);
    } else {
      submitToServer(feedback);
    }
  };

  const submitToServer = async (
    feedback: {
      type: string;
      content: string;
      pageUrl: string;
      coordinates?: { x: number; y: number };
      media?: File[];
    }
  ) => {
    let mediaUrls: string[] = [];

    if (feedback.media && feedback.media.length > 0) {
      if (wpUrl && wpApiKey) {
        for (const file of feedback.media) {
          const wpFormData = new FormData();
          wpFormData.append("file", file);
          wpFormData.append("project_id", projectId);
          try {
            const wpRes = await fetch(wpUrl.endsWith("/") ? `${wpUrl}feeddash/v1/media` : `${wpUrl}/feeddash/v1/media`, {
              method: "POST",
              headers: { "X-FeedDash-Key": wpApiKey },
              body: wpFormData,
            });
            if (wpRes.ok) {
              const wpData = await wpRes.json();
              mediaUrls.push(wpData.url);
            }
          } catch {
            // fall through to default upload
          }
        }
      }
    }

    const formData = new FormData();
    formData.append("projectId", projectId);
    formData.append("previewToken", previewToken);
    formData.append("type", feedback.type);
    formData.append("content", feedback.content);
    formData.append("pageUrl", feedback.pageUrl);
    if (feedback.coordinates) {
      formData.append("coordinatesX", String(feedback.coordinates.x));
      formData.append("coordinatesY", String(feedback.coordinates.y));
    }
    formData.append("viewportWidth", String(window.innerWidth));
    formData.append("viewportHeight", String(window.innerHeight));

    if (mediaUrls.length > 0) {
      formData.append("mediaUrls", JSON.stringify(mediaUrls));
      formData.append("storageType", "wordpress");
    } else if (feedback.media) {
      feedback.media.forEach((file) => formData.append("media", file));
    }

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setComment("");
        setAudioUrl(null);
        setSelectedFiles([]);
        setPinPosition(null);
        setMode(null);
        setIsOpen(false);
        onFeedbackSubmit?.(feedback);
      }
    } catch (err) {
      console.error("Failed to submit feedback:", err);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[9998]"
        onClick={handlePageClick}
        style={{ pointerEvents: pinMode ? "auto" : "none" }}
      />

      {pinPosition && mode === "pin" && (
        <div
          className="fixed z-[9999] w-8 h-8 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${pinPosition.x}%`, top: `${pinPosition.y}%` }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg animate-ping-once"
            style={{ backgroundColor: primaryColor }}
          >
            <Pin className="w-4 h-4" />
          </div>
        </div>
      )}

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-[9999] w-80 bg-card border border-border rounded-xl shadow-xl">
          <div
            className="flex items-center justify-between px-4 py-3 border-b border-border rounded-t-xl"
            style={{ backgroundColor: primaryColor }}
          >
            <span className="text-sm font-medium text-white">
              {mode === "pin"
                ? "Drop a Pin"
                : mode === "voice"
                  ? "Voice Note"
                  : mode === "media"
                    ? "Attach Files"
                    : "Leave Feedback"}
            </span>
            <button
              onClick={() => {
                setMode(null);
                setPinPosition(null);
                setPinMode(false);
              }}
              className="p-0.5 rounded hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          <div className="p-4">
            {mode === null && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handlePinClick}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-border hover:bg-accent transition-colors"
                >
                  <Pin className="w-5 h-5 text-foreground" />
                  <span className="text-xs text-foreground">Pin</span>
                </button>
                <button
                  onClick={() => setMode("comment")}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-border hover:bg-accent transition-colors"
                >
                  <MessageSquareText className="w-5 h-5 text-foreground" />
                  <span className="text-xs text-foreground">Comment</span>
                </button>
                <button
                  onClick={() => {
                    setMode("voice");
                    startRecording();
                  }}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-border hover:bg-accent transition-colors"
                >
                  <Mic className="w-5 h-5 text-foreground" />
                  <span className="text-xs text-foreground">Voice</span>
                </button>
                <button
                  onClick={() => setMode("media")}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-border hover:bg-accent transition-colors"
                >
                  <Image className="w-5 h-5 text-foreground" />
                  <span className="text-xs text-foreground">Media</span>
                </button>
              </div>
            )}

            {(mode === "comment" || (mode === "pin" && pinPosition)) && (
              <div className="space-y-3">
                {mode === "pin" && pinPosition && (
                  <p className="text-xs text-muted-foreground">
                    Pin placed at ({Math.round(pinPosition.x)}%,{" "}
                    {Math.round(pinPosition.y)}%)
                  </p>
                )}
                <textarea
                  placeholder="Write your feedback..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[100px] resize-none"
                />
                <Button onClick={submitFeedback} className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  Submit Feedback
                </Button>
              </div>
            )}

            {mode === "voice" && (
              <div className="text-center py-4 space-y-3">
                {isRecording ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-danger animate-pulse" />
                      <span className="text-sm text-muted-foreground">
                        Recording...
                      </span>
                    </div>
                    <Button variant="danger" onClick={stopRecording}>
                      Stop Recording
                    </Button>
                  </div>
                ) : audioUrl ? (
                  <div className="space-y-3">
                    <audio src={audioUrl} controls className="w-full" />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setAudioUrl(null)}
                      >
                        Re-record
                      </Button>
                      <Button onClick={submitFeedback}>Submit</Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Preparing microphone...
                  </p>
                )}
              </div>
            )}

            {mode === "media" && (
              <div className="space-y-3">
                <label className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent transition-colors">
                  <Image className="w-8 h-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Drop files or click to upload
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Images, videos, documents
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*,.pdf,.doc,.docx"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
                {selectedFiles.length > 0 && (
                  <div className="space-y-1">
                    {selectedFiles.map((file, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between px-3 py-2 rounded-lg bg-accent"
                      >
                        <span className="text-sm text-foreground truncate">
                          {file.name}
                        </span>
                        <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                          {(file.size / 1024 / 1024).toFixed(1)}MB
                        </span>
                      </div>
                    ))}
                    <Button
                      onClick={submitFeedback}
                      className="w-full mt-2"
                    >
                      Upload {selectedFiles.length} file
                      {selectedFiles.length > 1 ? "s" : ""}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <button
        onClick={toggleWidget}
        className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white transition-transform hover:scale-105 active:scale-95"
        style={{ backgroundColor: primaryColor }}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageSquareText className="w-6 h-6" />
        )}
      </button>
    </>
  );
}
