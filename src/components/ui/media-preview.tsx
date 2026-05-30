"use client";

import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight, Download, FileText } from "lucide-react";
import type { FeedbackMedia } from "@/types";

interface MediaPreviewProps {
  media: FeedbackMedia[];
  initialIndex: number;
  onClose: () => void;
}

export function MediaPreview({ media, initialIndex, onClose }: MediaPreviewProps) {
  const [index, setIndex] = useState(initialIndex);
  const current = media[index];

  useEffect(() => {
    setIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && index > 0) setIndex(index - 1);
      if (e.key === "ArrowRight" && index < media.length - 1) setIndex(index + 1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, index, media.length]);

  if (!current) return null;

  const isImage = current.file_type.startsWith("image/");
  const isVideo = current.file_type.startsWith("video/");
  const isAudio = current.file_type.startsWith("audio/");
  const isPdf = current.file_type === "application/pdf" || current.file_name.endsWith(".pdf");
  const fileSize = current.file_size > 1024 * 1024
    ? `${(current.file_size / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.round(current.file_size / 1024)} KB`;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black">
      {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-black/80 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {media.length > 1 && (
            <span className="text-sm text-white/60 font-mono">
              {index + 1} / {media.length}
            </span>
          )}
          <span className="text-sm text-white/80 truncate">{current.file_name}</span>
          <span className="text-xs text-white/40">{fileSize}</span>
        </div>
        <div className="flex items-center gap-1">
          <a
            href={current.file_url}
            download={current.file_name}
            className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            title="Download"
          >
            <Download className="w-5 h-5" />
          </a>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 flex items-center justify-center relative min-h-0 p-4">
        {/* Prev arrow */}
        {index > 0 && (
          <button
            onClick={() => setIndex(index - 1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors z-10"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Next arrow */}
        {index < media.length - 1 && (
          <button
            onClick={() => setIndex(index + 1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors z-10"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {isImage && (
          <img
            src={current.file_url}
            alt={current.file_name}
            className="max-w-full max-h-full object-contain"
          />
        )}

        {isVideo && (
          <video
            src={current.file_url}
            controls
            autoPlay
            className="max-w-full max-h-full rounded-lg"
          />
        )}

        {isAudio && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
              <div className="w-0 h-0 border-t-[12px] border-b-[12px] border-l-[20px] border-t-transparent border-b-transparent border-l-white/60 ml-2" />
            </div>
            <audio src={current.file_url} controls autoPlay className="w-80 max-w-full" />
          </div>
        )}

        {isPdf && (
          <iframe
            src={`${current.file_url}#toolbar=0`}
            className="w-full h-full rounded-lg bg-white"
            title={current.file_name}
          />
        )}

        {!isImage && !isVideo && !isAudio && !isPdf && (
          <div className="flex flex-col items-center gap-4 text-white/60">
            <FileText className="w-16 h-16" />
            <p className="text-sm">Preview not available for this file type</p>
            <a
              href={current.file_url}
              download={current.file_name}
              className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors text-sm"
            >
              <Download className="w-4 h-4 inline mr-2" />
              Download {current.file_name}
            </a>
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {media.length > 1 && (
        <div className="flex items-center gap-2 px-4 py-3 bg-black/80 border-t border-white/10 overflow-x-auto flex-shrink-0">
          {media.map((m, i) => {
            const isImg = m.file_type.startsWith("image/");
            return (
              <button
                key={m.id}
                onClick={() => setIndex(i)}
                className={`w-14 h-14 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                  i === index
                    ? "border-white ring-1 ring-white/30"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                {isImg ? (
                  <img src={m.file_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-white/10 flex items-center justify-center text-white/40 text-xs">
                    {m.file_name.split(".").pop()}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
