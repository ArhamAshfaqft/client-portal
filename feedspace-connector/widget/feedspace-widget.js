"use strict";
(() => {
  // src/widget/styles.ts
  var STYLES = `
#feedspace-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 99998;
}
#feedspace-overlay.feedspace-active {
  pointer-events: auto;
}

#feedspace-widget-root {
  display: flex !important;
  justify-content: center !important;
  position: fixed !important;
  z-index: 99999 !important;
  bottom: 0 !important;
  left: 0 !important;
  right: 0 !important;
  pointer-events: none !important;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
  font-size: 14px !important;
  line-height: 1.5 !important;
  color: #0f172a !important;
}

#feedspace-widget-root * {
  box-sizing: border-box !important;
}

#feedspace-widget-root .feedspace-toolbar {
  display: flex !important;
  align-items: center !important;
  gap: 6px !important;
  background: #fff !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 12px !important;
  padding: 6px 10px !important;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08) !important;
  margin-bottom: 24px !important;
  pointer-events: auto !important;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
  font-size: 14px !important;
  line-height: 1.5 !important;
  color: #0f172a !important;
}

#feedspace-widget-root .feedspace-toolbar-divider {
  width: 1px !important;
  height: 28px !important;
  background: #e2e8f0 !important;
  margin: 0 8px !important;
  border: none !important;
}

#feedspace-widget-root .feedspace-tool-btn {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 36px !important;
  height: 36px !important;
  border: none !important;
  border-radius: 8px !important;
  background: transparent !important;
  cursor: pointer !important;
  color: #64748b !important;
  transition: all 0.15s !important;
  position: relative !important;
  padding: 0 !important;
  line-height: 1 !important;
  box-shadow: none !important;
  text-shadow: none !important;
  outline: none !important;
  font-family: 'Poppins', -apple-system, sans-serif !important;
  font-size: 14px !important;
  text-transform: none !important;
  letter-spacing: normal !important;
  text-decoration: none !important;
  margin: 0 !important;
}
#feedspace-widget-root .feedspace-tool-btn:hover {
  background: #f1f5f9 !important;
  color: #0f172a !important;
}
#feedspace-widget-root .feedspace-tool-btn.active {
  background: #2563eb !important;
  color: #fff !important;
}
#feedspace-widget-root .feedspace-tool-btn.active:hover {
  background: #1d4ed8 !important;
}
#feedspace-widget-root .feedspace-tool-btn svg {
  width: 20px !important;
  height: 20px !important;
  display: block !important;
}
#feedspace-widget-root .feedspace-tool-btn .badge {
  position: absolute !important;
  top: -2px !important;
  right: -2px !important;
  min-width: 18px !important;
  height: 18px !important;
  border-radius: 9px !important;
  background: #ef4444 !important;
  color: #fff !important;
  font-size: 10px !important;
  line-height: 18px !important;
  text-align: center !important;
  padding: 0 4px !important;
  font-weight: 700 !important;
  border: 2px solid #fff !important;
}

#feedspace-widget-root .feedspace-device-btn {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 32px !important;
  height: 32px !important;
  border: none !important;
  border-radius: 6px !important;
  background: transparent !important;
  cursor: pointer !important;
  color: #94a3b8 !important;
  transition: all 0.15s !important;
  padding: 0 !important;
  line-height: 1 !important;
  box-shadow: none !important;
  outline: none !important;
  font-family: 'Poppins', -apple-system, sans-serif !important;
  font-size: 14px !important;
  margin: 0 !important;
}
#feedspace-widget-root .feedspace-device-btn:hover {
  color: #2563eb !important;
  background: #eff6ff !important;
}
#feedspace-widget-root .feedspace-device-btn.active {
  color: #2563eb !important;
  background: #eff6ff !important;
}
#feedspace-widget-root .feedspace-device-btn svg {
  width: 16px !important;
  height: 16px !important;
  display: block !important;
}

#feedspace-widget-root .feedspace-submit-btn {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 6px !important;
  padding: 8px 18px !important;
  border: none !important;
  border-radius: 8px !important;
  background: #2563eb !important;
  color: #fff !important;
  font-size: 13px !important;
  font-weight: 600 !important;
  cursor: pointer !important;
  transition: all 0.15s !important;
  font-family: 'Poppins', -apple-system, sans-serif !important;
  line-height: 1.4 !important;
  box-shadow: none !important;
  text-shadow: none !important;
  outline: none !important;
  text-transform: none !important;
  letter-spacing: normal !important;
  text-decoration: none !important;
  margin: 0 !important;
}
#feedspace-widget-root .feedspace-submit-btn:hover {
  background: #1d4ed8 !important;
  text-decoration: none !important;
}
#feedspace-widget-root .feedspace-submit-btn:active {
  background: #1e40af !important;
}
#feedspace-widget-root .feedspace-submit-btn svg {
  width: 16px !important;
  height: 16px !important;
  display: block !important;
}

#feedspace-widget-root .feedspace-annotation-pin {
  cursor: pointer !important;
  transition: transform 0.15s, filter 0.15s !important;
  filter: drop-shadow(0 1px 3px rgba(0,0,0,0.2)) !important;
}
#feedspace-widget-root .feedspace-annotation-pin:hover {
  transform: scale(1.15) !important;
  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.3)) !important;
}

#feedspace-widget-root .feedspace-panel-overlay {
  display: block !important;
  position: fixed !important;
  inset: 0 !important;
  background: rgba(15, 23, 42, 0.3) !important;
  z-index: 99998 !important;
  animation: feedspace-fade-in 0.15s !important;
}

#feedspace-widget-root .feedspace-panel {
  display: flex !important;
  flex-direction: column !important;
  position: fixed !important;
  top: 0 !important;
  right: 0 !important;
  width: 420px !important;
  max-width: 100vw !important;
  height: 100vh !important;
  background: #fff !important;
  z-index: 99999 !important;
  box-shadow: -8px 0 40px rgba(0,0,0,0.1) !important;
  animation: feedspace-slide-in 0.2s ease !important;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
  font-size: 14px !important;
  line-height: 1.5 !important;
  color: #0f172a !important;
}

#feedspace-widget-root .feedspace-panel-header {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 20px 24px 16px !important;
  border-bottom: 1px solid #e2e8f0 !important;
}
#feedspace-widget-root .feedspace-panel-title {
  font-size: 16px !important;
  font-weight: 600 !important;
  color: #0f172a !important;
  letter-spacing: -0.01em !important;
}
#feedspace-widget-root .feedspace-panel-close {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 32px !important;
  height: 32px !important;
  border: none !important;
  border-radius: 8px !important;
  background: transparent !important;
  cursor: pointer !important;
  color: #94a3b8 !important;
  transition: all 0.15s !important;
  padding: 0 !important;
  line-height: 1 !important;
  box-shadow: none !important;
  outline: none !important;
  font-family: 'Poppins', -apple-system, sans-serif !important;
  font-size: 14px !important;
  margin: 0 !important;
}
#feedspace-widget-root .feedspace-panel-close:hover {
  background: #f1f5f9 !important;
  color: #0f172a !important;
}
#feedspace-widget-root .feedspace-panel-close svg {
  width: 18px !important;
  height: 18px !important;
  display: block !important;
}

#feedspace-widget-root .feedspace-panel-body {
  flex: 1 !important;
  overflow-y: auto !important;
  padding: 16px 24px !important;
}

#feedspace-widget-root .feedspace-panel-footer {
  padding: 16px 24px 20px !important;
  border-top: 1px solid #e2e8f0 !important;
}

#feedspace-widget-root .feedspace-comment-input {
  display: block !important;
  width: 100% !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 8px !important;
  padding: 10px 14px !important;
  font-size: 13px !important;
  font-family: 'Poppins', -apple-system, sans-serif !important;
  outline: none !important;
  resize: none !important;
  min-height: 44px !important;
  max-height: 120px !important;
  transition: border-color 0.15s, box-shadow 0.15s !important;
  line-height: 1.5 !important;
  background: #fff !important;
  color: #0f172a !important;
  margin: 0 !important;
  box-shadow: none !important;
  text-shadow: none !important;
}
#feedspace-widget-root .feedspace-comment-input:focus {
  border-color: #2563eb !important;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15) !important;
}
#feedspace-widget-root .feedspace-comment-input::placeholder {
  color: #94a3b8 !important;
  opacity: 1 !important;
}

#feedspace-widget-root .feedspace-media-actions {
  display: flex !important;
  gap: 4px !important;
  margin-top: 10px !important;
}

#feedspace-widget-root .feedspace-icon-btn {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 36px !important;
  height: 36px !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 8px !important;
  background: #fff !important;
  cursor: pointer !important;
  color: #64748b !important;
  transition: all 0.15s !important;
  flex-shrink: 0 !important;
  padding: 0 !important;
  line-height: 1 !important;
  box-shadow: none !important;
  outline: none !important;
  font-family: 'Poppins', -apple-system, sans-serif !important;
  font-size: 14px !important;
  margin: 0 !important;
}
#feedspace-widget-root .feedspace-icon-btn:hover {
  background: #f1f5f9 !important;
  border-color: #cbd5e1 !important;
  color: #0f172a !important;
}
#feedspace-widget-root .feedspace-icon-btn.active {
  background: #eff6ff !important;
  border-color: #2563eb !important;
  color: #2563eb !important;
}
#feedspace-widget-root .feedspace-icon-btn svg {
  width: 16px !important;
  height: 16px !important;
  display: block !important;
}

#feedspace-widget-root .feedspace-avatar-sm {
  width: 36px !important;
  height: 36px !important;
  border-radius: 50% !important;
  background: #2563eb !important;
  color: #fff !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 14px !important;
  font-weight: 600 !important;
  flex-shrink: 0 !important;
}

#feedspace-widget-root .feedspace-avatar-xs {
  width: 26px !important;
  height: 26px !important;
  border-radius: 50% !important;
  background: #3b82f6 !important;
  color: #fff !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 10px !important;
  font-weight: 600 !important;
  flex-shrink: 0 !important;
}

#feedspace-widget-root .feedspace-feedback-item {
  background: #fff !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 8px !important;
  padding: 14px !important;
  margin-bottom: 10px !important;
  cursor: pointer !important;
  transition: all 0.15s !important;
}
#feedspace-widget-root .feedspace-feedback-item:hover {
  border-color: #cbd5e1 !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05) !important;
}
#feedspace-widget-root .feedspace-feedback-item.highlight {
  border-color: #2563eb !important;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15) !important;
}

#feedspace-widget-root .feedspace-feedback-item-header {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  margin-bottom: 8px !important;
}

#feedspace-widget-root .feedspace-feedback-author {
  font-size: 13px !important;
  font-weight: 600 !important;
  color: #0f172a !important;
  line-height: 1.3 !important;
}
#feedspace-widget-root .feedspace-feedback-status {
  display: inline-flex !important;
  align-items: center !important;
  font-size: 11px !important;
  font-weight: 500 !important;
  padding: 2px 8px !important;
  border-radius: 999px !important;
  white-space: nowrap !important;
  border: none !important;
}
#feedspace-widget-root .feedspace-feedback-status.open {
  background: rgba(245, 158, 11, 0.1) !important;
  color: #d97706 !important;
}
#feedspace-widget-root .feedspace-feedback-status.in_progress {
  background: rgba(37, 99, 235, 0.1) !important;
  color: #2563eb !important;
}
#feedspace-widget-root .feedspace-feedback-status.resolved {
  background: rgba(34, 197, 94, 0.1) !important;
  color: #16a34a !important;
}
#feedspace-widget-root .feedspace-feedback-status.closed {
  background: #f1f5f9 !important;
  color: #64748b !important;
}

#feedspace-widget-root .feedspace-feedback-content {
  font-size: 13px !important;
  color: #334155 !important;
  line-height: 1.6 !important;
}
#feedspace-widget-root .feedspace-feedback-meta {
  font-size: 11px !important;
  color: #94a3b8 !important;
  margin-top: 1px !important;
}

#feedspace-widget-root .feedspace-reply-count {
  display: flex !important;
  align-items: center !important;
  gap: 4px !important;
  font-size: 11px !important;
  color: #94a3b8 !important;
  margin-top: 8px !important;
  padding-top: 8px !important;
  border-top: 1px solid #f1f5f9 !important;
}
#feedspace-widget-root .feedspace-reply-count svg {
  width: 12px !important;
  height: 12px !important;
}

#feedspace-widget-root .feedspace-reply {
  margin-top: 10px !important;
  padding: 12px !important;
  background: #f8fafc !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 8px !important;
}
#feedspace-widget-root .feedspace-reply-header {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  margin-bottom: 6px !important;
}
#feedspace-widget-root .feedspace-reply-author {
  font-size: 12px !important;
  font-weight: 600 !important;
  color: #0f172a !important;
}
#feedspace-widget-root .feedspace-reply-text {
  font-size: 12px !important;
  color: #475569 !important;
  line-height: 1.5 !important;
}
#feedspace-widget-root .feedspace-reply-meta {
  font-size: 10px !important;
  color: #94a3b8 !important;
  margin-top: 1px !important;
}

#feedspace-widget-root .feedspace-section-divider {
  height: 1px !important;
  background: #e2e8f0 !important;
  margin: 16px 0 !important;
  border: none !important;
}

#feedspace-widget-root .feedspace-file-preview {
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
  padding: 10px 12px !important;
  background: #f8fafc !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 8px !important;
  margin-top: 8px !important;
  font-size: 12px !important;
  color: #334155 !important;
}
#feedspace-widget-root .feedspace-file-thumb {
  width: 36px !important;
  height: 36px !important;
  border-radius: 6px !important;
  object-fit: cover !important;
  flex-shrink: 0 !important;
}
#feedspace-widget-root .feedspace-file-icon {
  font-size: 18px !important;
  flex-shrink: 0 !important;
}
#feedspace-widget-root .feedspace-file-info {
  flex: 1 !important;
  min-width: 0 !important;
}
#feedspace-widget-root .feedspace-file-name {
  font-weight: 500 !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
  color: #0f172a !important;
}
#feedspace-widget-root .feedspace-file-size {
  font-size: 10px !important;
  color: #94a3b8 !important;
}
#feedspace-widget-root .feedspace-file-remove {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 24px !important;
  height: 24px !important;
  border: none !important;
  border-radius: 6px !important;
  background: transparent !important;
  cursor: pointer !important;
  color: #94a3b8 !important;
  transition: all 0.15s !important;
  flex-shrink: 0 !important;
  padding: 0 !important;
  line-height: 1 !important;
  box-shadow: none !important;
  outline: none !important;
  margin: 0 !important;
}
#feedspace-widget-root .feedspace-file-remove:hover {
  background: #fef2f2 !important;
  color: #ef4444 !important;
}
#feedspace-widget-root .feedspace-file-remove svg {
  width: 14px !important;
  height: 14px !important;
  display: block !important;
}

#feedspace-widget-root .feedspace-recording-indicator {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  color: #ef4444 !important;
  font-size: 12px !important;
  font-weight: 500 !important;
  padding: 10px 12px !important;
  background: #fef2f2 !important;
  border: 1px solid #fecaca !important;
  border-radius: 8px !important;
  margin-top: 8px !important;
}
#feedspace-widget-root .feedspace-recording-dot {
  width: 8px !important;
  height: 8px !important;
  border-radius: 50% !important;
  background: #ef4444 !important;
  animation: feedspace-pulse 1s infinite !important;
}
#feedspace-widget-root .feedspace-recording-time {
  font-variant-numeric: tabular-nums !important;
  color: #dc2626 !important;
}

#feedspace-widget-root .feedspace-empty-state {
  text-align: center !important;
  padding: 48px 24px !important;
  color: #94a3b8 !important;
}
#feedspace-widget-root .feedspace-empty-state svg {
  width: 48px !important;
  height: 48px !important;
  margin-bottom: 12px !important;
  opacity: 0.3 !important;
}
#feedspace-widget-root .feedspace-empty-state p {
  font-size: 14px !important;
  line-height: 1.6 !important;
  color: #64748b !important;
  margin: 0 !important;
}

#feedspace-widget-root .feedspace-filter-tabs {
  display: flex !important;
  gap: 4px !important;
  padding: 0 24px 12px !important;
  border-bottom: 1px solid #e2e8f0 !important;
  overflow-x: auto !important;
}
#feedspace-widget-root .feedspace-filter-tab {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 6px 12px !important;
  border-radius: 8px !important;
  font-size: 12px !important;
  font-weight: 500 !important;
  border: none !important;
  background: transparent !important;
  color: #64748b !important;
  cursor: pointer !important;
  white-space: nowrap !important;
  transition: all 0.15s !important;
  font-family: 'Poppins', -apple-system, sans-serif !important;
  line-height: 1 !important;
  box-shadow: none !important;
  outline: none !important;
  margin: 0 !important;
  text-transform: none !important;
  letter-spacing: normal !important;
  text-decoration: none !important;
}
#feedspace-widget-root .feedspace-filter-tab:hover {
  background: #f1f5f9 !important;
  color: #0f172a !important;
}
#feedspace-widget-root .feedspace-filter-tab.active {
  background: #2563eb !important;
  color: #fff !important;
}

@keyframes feedspace-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes feedspace-slide-in {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
@keyframes feedspace-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
@keyframes feedspace-scale-in {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

#feedspace-widget-root .feedspace-name-modal {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  position: fixed !important;
  inset: 0 !important;
  z-index: 100000 !important;
  background: rgba(15, 23, 42, 0.4) !important;
  animation: feedspace-fade-in 0.15s !important;
}
#feedspace-widget-root .feedspace-name-modal-card {
  display: block !important;
  background: #fff !important;
  border-radius: 12px !important;
  padding: 28px !important;
  width: 360px !important;
  max-width: 90vw !important;
  box-shadow: 0 24px 64px rgba(0,0,0,0.15) !important;
  animation: feedspace-scale-in 0.2s ease !important;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
  font-size: 14px !important;
  line-height: 1.5 !important;
  color: #0f172a !important;
}
#feedspace-widget-root .feedspace-name-modal h3 {
  font-size: 18px !important;
  font-weight: 600 !important;
  margin-bottom: 4px !important;
  color: #0f172a !important;
}
#feedspace-widget-root .feedspace-name-modal p {
  font-size: 14px !important;
  color: #64748b !important;
  margin-bottom: 20px !important;
  line-height: 1.5 !important;
}
#feedspace-widget-root .feedspace-name-modal input {
  display: block !important;
  width: 100% !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 8px !important;
  padding: 10px 14px !important;
  font-size: 14px !important;
  font-family: 'Poppins', -apple-system, sans-serif !important;
  outline: none !important;
  transition: border-color 0.15s, box-shadow 0.15s !important;
  margin-bottom: 16px !important;
  color: #0f172a !important;
  background: #fff !important;
  box-shadow: none !important;
  line-height: 1.5 !important;
}
#feedspace-widget-root .feedspace-name-modal input:focus {
  border-color: #2563eb !important;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15) !important;
}
#feedspace-widget-root .feedspace-name-modal input::placeholder {
  color: #94a3b8 !important;
  opacity: 1 !important;
}
#feedspace-widget-root .feedspace-name-modal .actions {
  display: flex !important;
  justify-content: flex-end !important;
  gap: 8px !important;
}
#feedspace-widget-root .feedspace-name-modal .actions button {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 8px 18px !important;
  border-radius: 8px !important;
  font-size: 13px !important;
  font-weight: 600 !important;
  cursor: pointer !important;
  border: none !important;
  font-family: 'Poppins', -apple-system, sans-serif !important;
  transition: all 0.15s !important;
  line-height: 1.4 !important;
  box-shadow: none !important;
  outline: none !important;
  margin: 0 !important;
}
#feedspace-widget-root .feedspace-name-modal .actions .cancel {
  background: #f1f5f9 !important;
  color: #334155 !important;
}
#feedspace-widget-root .feedspace-name-modal .actions .cancel:hover {
  background: #e2e8f0 !important;
}
#feedspace-widget-root .feedspace-name-modal .actions .confirm {
  background: #2563eb !important;
  color: #fff !important;
}
#feedspace-widget-root .feedspace-name-modal .actions .confirm:hover {
  background: #1d4ed8 !important;
}

#feedspace-widget-root .feedspace-hover-highlight {
  outline: 2px solid #2563eb !important;
  outline-offset: 2px !important;
  border-radius: 2px !important;
}

[data-feedspace-tool="pin"] { cursor: crosshair !important; }
`;
  var injected = false;
  function injectStyles() {
    if (injected) return;
    const style = document.createElement("style");
    style.textContent = STYLES;
    document.head.appendChild(style);
    injected = true;
  }

  // src/widget/api.ts
  function createApiClient(baseUrl, token, wpApiUrl, wpApiKey) {
    async function vercelRequest(path, options = {}) {
      const url = `${baseUrl.replace(/\/+$/, "")}/api${path}`;
      const res = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers
        }
      });
      if (!res.ok) {
        throw new Error(`API error ${res.status}: ${await res.text()}`);
      }
      return res.json();
    }
    async function wpRequest(method, path, body) {
      const url = `${wpApiUrl.replace(/\/+$/, "")}/wp-json/feedspace/v1${path}`;
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "X-Feedspace-Key": wpApiKey
        },
        body: body ? JSON.stringify(body) : void 0
      });
      if (!res.ok) {
        throw new Error(`WordPress API error ${res.status}: ${await res.text()}`);
      }
      return res.json();
    }
    const useWp = !!(wpApiUrl && wpApiKey);
    return {
      verifyToken: () => vercelRequest(`/widget/verify-token`, {
        method: "POST",
        body: JSON.stringify({ token })
      }),
      getAnnotations: (pageUrl, projectId) => {
        if (useWp) {
          return wpRequest("GET", `/annotations?pageUrl=${encodeURIComponent(pageUrl)}&projectId=${encodeURIComponent(projectId)}`);
        }
        return vercelRequest(`/widget/annotations?token=${encodeURIComponent(token)}&pageUrl=${encodeURIComponent(pageUrl)}`);
      },
      createAnnotation: (payload) => {
        if (useWp) {
          return wpRequest("POST", "/annotations", payload);
        }
        return vercelRequest(`/widget/annotations`, {
          method: "POST",
          body: JSON.stringify(payload)
        });
      },
      updateAnnotation: (id, data) => {
        if (useWp) {
          return wpRequest("PATCH", `/annotations/${id}`, data);
        }
        return vercelRequest(`/widget/annotations/${id}`, {
          method: "PATCH",
          body: JSON.stringify(data)
        });
      },
      deleteAnnotation: (id) => {
        if (useWp) {
          return wpRequest("DELETE", `/annotations/${id}`);
        }
        return vercelRequest(`/widget/annotations/${id}`, {
          method: "DELETE"
        });
      }
    };
  }

  // src/widget/element-dna.ts
  function getDataId(el) {
    const widget = el.closest("[data-feedspace-widget-id]");
    if (widget) return widget.getAttribute("data-feedspace-widget-id");
    const elWidget = el.closest("[data-id]");
    if (elWidget) return elWidget.getAttribute("data-id");
    return null;
  }
  function getSelector(el) {
    if (el.id) return `#${CSS.escape(el.id)}`;
    const dataId = getDataId(el);
    if (dataId) return `[data-id="${dataId}"]`;
    const path = [];
    let current = el;
    while (current && current !== document.body) {
      const tag = current.tagName.toLowerCase();
      const parent = current.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children).filter(
          (s) => s.tagName === current.tagName
        );
        const idx = siblings.indexOf(current) + 1;
        path.unshift(`${tag}:nth-of-type(${idx})`);
      } else {
        path.unshift(tag);
      }
      current = parent;
    }
    return path.join(" > ");
  }
  function getTextContent(el) {
    return (el.textContent || "").trim().slice(0, 80);
  }
  function getFingerprint(el) {
    const tag = el.tagName.toLowerCase();
    const text = getTextContent(el);
    const attrs = Array.from(el.attributes).filter((a) => ["class", "style", "src", "href", "alt", "title"].includes(a.name)).map((a) => `${a.name}=${a.value}`).join("|");
    const raw = `${tag}|${text}|${attrs}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      const chr = raw.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0;
    }
    return Math.abs(hash).toString(36);
  }
  function getElementDNA(el) {
    let target = el;
    const widget = el.closest("[data-feedspace-widget-id],[data-id]");
    if (widget) target = widget;
    return {
      selector: getSelector(target),
      tag: target.tagName.toLowerCase(),
      text: getTextContent(target),
      fingerprint: getFingerprint(target),
      dataId: getDataId(target)
    };
  }
  function findElement(dna) {
    if (dna.selector) {
      try {
        const match = document.querySelector(dna.selector);
        if (match) return match;
      } catch {
      }
    }
    if (dna.dataId) {
      const match = document.querySelector(`[data-id="${dna.dataId}"]`);
      if (match) return match;
    }
    const allTag = document.querySelectorAll(dna.tag);
    for (const el of allTag) {
      const text = getTextContent(el);
      if (text === dna.text) return el;
      if (text.includes(dna.text)) return el;
    }
    for (const el of allTag) {
      if (getFingerprint(el) === dna.fingerprint) return el;
    }
    return null;
  }
  function closestTargetable(el) {
    const widget = el.closest("[data-feedspace-widget-id],[data-id]");
    if (widget) return widget;
    const semantic = el.closest("h1,h2,h3,h4,h5,h6,p,a,button,img,section,article,figure");
    if (semantic) return semantic;
    return el;
  }
  function toRelative(el, pageX, pageY) {
    const rect = el.getBoundingClientRect();
    return {
      x: (pageX - rect.left - window.scrollX) / rect.width * 100,
      y: (pageY - rect.top - window.scrollY) / rect.height * 100
    };
  }
  function toAbsolute(el, xPct, yPct) {
    const rect = el.getBoundingClientRect();
    return {
      x: rect.left + window.scrollX + rect.width * xPct / 100,
      y: rect.top + window.scrollY + rect.height * yPct / 100
    };
  }

  // src/widget/annotation-renderer.ts
  var AnnotationRenderer = class {
    constructor() {
      this.svg = null;
      this.annotations = [];
      this.callbacks = null;
      this.filter = "all";
      this.selectedId = null;
    }
    init(callbacks) {
      this.callbacks = callbacks;
      this.createSVG();
    }
    createSVG() {
      let svg = document.getElementById("feedspace-overlay");
      if (!svg) {
        svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.id = "feedspace-overlay";
        document.body.appendChild(svg);
      }
      this.svg = svg;
    }
    setAnnotations(annotations) {
      this.annotations = annotations;
      this.renderAll();
    }
    setFilter(filter) {
      this.filter = filter;
      this.renderAll();
    }
    setSelected(id) {
      this.selectedId = id;
      this.renderAll();
    }
    getFiltered() {
      if (this.filter === "all") return this.annotations;
      return this.annotations.filter((a) => a.status === this.filter);
    }
    renderAll() {
      if (!this.svg) return;
      while (this.svg.firstChild) this.svg.removeChild(this.svg.firstChild);
      const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
      const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
      marker.setAttribute("id", "feedspace-arrowhead");
      marker.setAttribute("markerWidth", "10");
      marker.setAttribute("markerHeight", "7");
      marker.setAttribute("refX", "10");
      marker.setAttribute("refY", "3.5");
      marker.setAttribute("orient", "auto");
      const arrowPath = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      arrowPath.setAttribute("points", "0 0, 10 3.5, 0 7");
      arrowPath.setAttribute("fill", "#6366f1");
      marker.appendChild(arrowPath);
      defs.appendChild(marker);
      this.svg.appendChild(defs);
      const filtered = this.getFiltered();
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;
      this.svg.setAttribute(
        "style",
        `position:absolute;top:0;left:0;width:${document.documentElement.scrollWidth}px;height:${document.documentElement.scrollHeight}px;pointer-events:none;z-index:99998;`
      );
      for (let i = 0; i < filtered.length; i++) {
        this.renderOne(filtered[i], i, scrollX, scrollY);
      }
    }
    renderOne(annotation, index, scrollX, scrollY) {
      const el = annotation.elementDna ? findElement(annotation.elementDna) : null;
      if (!el) return;
      const anchor = toAbsolute(el, annotation.anchorXPct, annotation.anchorYPct);
      const badge = this.createBadge(index + 1, annotation.id, annotation.status);
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.appendChild(badge);
      g.setAttribute("transform", `translate(${anchor.x}, ${anchor.y})`);
      g.style.pointerEvents = "auto";
      this.svg.appendChild(g);
    }
    createBadge(num, id, status) {
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("data-annotation-id", id);
      g.classList.add("feedspace-annotation-pin");
      g.style.cursor = "pointer";
      let color = "#6366f1";
      if (status === "resolved" || status === "closed") color = "#10b981";
      if (status === "in_progress") color = "#f59e0b";
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", "10");
      circle.setAttribute("cy", "10");
      circle.setAttribute("r", "10");
      circle.setAttribute("fill", color);
      circle.setAttribute("stroke", "#fff");
      circle.setAttribute("stroke-width", "2");
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", "10");
      text.setAttribute("y", "10");
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("dominant-baseline", "central");
      text.setAttribute("fill", "#fff");
      text.setAttribute("font-size", "11");
      text.setAttribute("font-weight", "600");
      text.textContent = String(num);
      if (this.selectedId === id) {
        const pulse = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        pulse.setAttribute("cx", "10");
        pulse.setAttribute("cy", "10");
        pulse.setAttribute("r", "10");
        pulse.setAttribute("fill", "none");
        pulse.setAttribute("stroke", color);
        pulse.setAttribute("stroke-width", "2");
        const anim = document.createElementNS("http://www.w3.org/2000/svg", "animate");
        anim.setAttribute("attributeName", "r");
        anim.setAttribute("values", "10;20;10");
        anim.setAttribute("dur", "1.5s");
        anim.setAttribute("repeatCount", "indefinite");
        pulse.appendChild(anim);
        const animOpacity = document.createElementNS("http://www.w3.org/2000/svg", "animate");
        animOpacity.setAttribute("attributeName", "opacity");
        animOpacity.setAttribute("values", "1;0;1");
        animOpacity.setAttribute("dur", "1.5s");
        animOpacity.setAttribute("repeatCount", "indefinite");
        pulse.appendChild(animOpacity);
        g.appendChild(pulse);
      }
      g.appendChild(circle);
      g.appendChild(text);
      g.addEventListener("click", (e) => {
        var _a;
        e.stopPropagation();
        (_a = this.callbacks) == null ? void 0 : _a.onAnnotationClick(id);
      });
      return g;
    }
    destroy() {
      if (this.svg && this.svg.parentNode) {
        this.svg.parentNode.removeChild(this.svg);
      }
      this.svg = null;
      this.annotations = [];
    }
  };

  // src/widget/comment-panel.ts
  var CommentPanel = class {
    constructor() {
      this.root = null;
      this.overlay = null;
      this.callbacks = null;
      this.annotation = null;
      this.files = [];
      this.inputEl = null;
      this.onClose = null;
    }
    open(annotation, callbacks, onClose) {
      this.annotation = annotation;
      this.callbacks = callbacks;
      this.onClose = onClose;
      this.files = [];
      this.render();
    }
    close() {
      if (this.overlay && this.overlay.parentNode) this.overlay.parentNode.removeChild(this.overlay);
      if (this.root && this.root.parentNode) this.root.parentNode.removeChild(this.root);
      this.overlay = null;
      this.root = null;
    }
    render() {
      this.close();
      this.overlay = document.createElement("div");
      this.overlay.className = "feedspace-panel-overlay";
      this.overlay.addEventListener("click", () => this.close());
      document.body.appendChild(this.overlay);
      this.root = document.createElement("div");
      this.root.className = "feedspace-panel";
      const isNew = !this.annotation;
      const title = isNew ? "Add Feedback" : "Feedback Details";
      const header = document.createElement("div");
      header.className = "feedspace-panel-header";
      header.innerHTML = `
      <span class="feedspace-panel-title">${title}</span>
      <button class="feedspace-panel-close" id="feedspace-panel-close">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    `;
      this.root.appendChild(header);
      header.querySelector("#feedspace-panel-close").addEventListener("click", () => this.close());
      const body = document.createElement("div");
      body.className = "feedspace-panel-body";
      if (!isNew && this.annotation) {
        const authorInitial = (this.annotation.createdBy || "A").charAt(0).toUpperCase();
        const dateStr = new Date(this.annotation.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        const info = document.createElement("div");
        info.className = "feedspace-feedback-item";
        info.style.cursor = "default";
        info.innerHTML = `
        <div class="feedspace-feedback-item-header">
          <div style="display:flex;align-items:center;gap:10px;">
            <div class="feedspace-avatar-sm">${escHtml(authorInitial)}</div>
            <div>
              <div class="feedspace-feedback-author">${escHtml(this.annotation.createdBy)}</div>
              <div class="feedspace-feedback-meta">${dateStr}</div>
            </div>
          </div>
          <span class="feedspace-feedback-status ${this.annotation.status}">${this.annotation.status.replace("_", " ")}</span>
        </div>
        <div class="feedspace-feedback-content">${escHtml(this.annotation.content)}</div>
      `;
        body.appendChild(info);
        if (this.annotation.replies && this.annotation.replies.length > 0) {
          for (const reply of this.annotation.replies) {
            const replyInitial = (reply.createdBy || "A").charAt(0).toUpperCase();
            const replyDate = new Date(reply.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
            const r = document.createElement("div");
            r.className = "feedspace-reply";
            r.innerHTML = `
            <div class="feedspace-reply-header">
              <div class="feedspace-avatar-xs">${escHtml(replyInitial)}</div>
              <div>
                <div class="feedspace-reply-author">${escHtml(reply.createdBy)}</div>
                <div class="feedspace-reply-meta">${replyDate}</div>
              </div>
            </div>
            <div class="feedspace-reply-text">${escHtml(reply.content)}</div>
          `;
            body.appendChild(r);
          }
        }
        const divider = document.createElement("div");
        divider.className = "feedspace-section-divider";
        body.appendChild(divider);
      }
      const input = document.createElement("textarea");
      input.className = "feedspace-comment-input";
      input.placeholder = isNew ? "Describe your feedback..." : "Write a reply...";
      input.rows = 3;
      input.style.width = "100%";
      body.appendChild(input);
      this.inputEl = input;
      const mediaActions = document.createElement("div");
      mediaActions.className = "feedspace-media-actions";
      mediaActions.innerHTML = `
      <button class="feedspace-icon-btn" id="feedspace-mic-btn" title="Record voice">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
      </button>
      <button class="feedspace-icon-btn" id="feedspace-media-btn" title="Attach media (images, video, audio)">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
      </button>
      <button class="feedspace-icon-btn" id="feedspace-doc-btn" title="Attach document (PDF, DOC, CSV, etc.)">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
      </button>
    `;
      body.appendChild(mediaActions);
      const mediaFileInput = document.createElement("input");
      mediaFileInput.type = "file";
      mediaFileInput.multiple = true;
      mediaFileInput.style.display = "none";
      mediaFileInput.accept = "image/*,video/*,audio/*";
      body.appendChild(mediaFileInput);
      const docFileInput = document.createElement("input");
      docFileInput.type = "file";
      docFileInput.multiple = true;
      docFileInput.style.display = "none";
      docFileInput.accept = ".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.zip,.rar,.json,.xml,.md";
      body.appendChild(docFileInput);
      const filePreviewContainer = document.createElement("div");
      filePreviewContainer.id = "feedspace-file-previews";
      body.appendChild(filePreviewContainer);
      const recordingIndicator = document.createElement("div");
      recordingIndicator.id = "feedspace-recording-indicator";
      recordingIndicator.style.display = "none";
      recordingIndicator.className = "feedspace-recording-indicator";
      recordingIndicator.innerHTML = `
      <span class="feedspace-recording-dot"></span>
      <span class="feedspace-recording-time">0:00</span>
      <button class="feedspace-icon-btn" id="feedspace-stop-recording" style="margin-left:auto;color:#ef4444;border-color:#ef4444;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
      </button>
    `;
      body.appendChild(recordingIndicator);
      this.root.appendChild(body);
      const footer = document.createElement("div");
      footer.className = "feedspace-panel-footer";
      const submitBtn = document.createElement("button");
      submitBtn.className = "feedspace-submit-btn";
      submitBtn.style.width = "100%";
      submitBtn.style.justifyContent = "center";
      submitBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      ${isNew ? "Submit Feedback" : "Send Reply"}
    `;
      submitBtn.addEventListener("click", () => this.handleSubmit());
      footer.appendChild(submitBtn);
      this.root.appendChild(footer);
      document.body.appendChild(this.root);
      mediaActions.querySelector("#feedspace-mic-btn").addEventListener("click", () => {
        var _a, _b, _c;
        if ((_a = this.callbacks) == null ? void 0 : _a.isRecording) {
          (_b = this.callbacks) == null ? void 0 : _b.onStopRecording();
        } else {
          (_c = this.callbacks) == null ? void 0 : _c.onStartRecording();
        }
      });
      mediaActions.querySelector("#feedspace-media-btn").addEventListener("click", () => mediaFileInput.click());
      mediaActions.querySelector("#feedspace-doc-btn").addEventListener("click", () => docFileInput.click());
      mediaFileInput.addEventListener("change", () => {
        const selected = Array.from(mediaFileInput.files || []);
        this.files = [...this.files, ...selected];
        this.updateFilePreviews(filePreviewContainer);
        mediaFileInput.value = "";
      });
      docFileInput.addEventListener("change", () => {
        const selected = Array.from(docFileInput.files || []);
        this.files = [...this.files, ...selected];
        this.updateFilePreviews(filePreviewContainer);
        docFileInput.value = "";
      });
      setTimeout(() => input.focus(), 100);
    }
    getFileIcon(name) {
      var _a;
      const ext = ((_a = name.split(".").pop()) == null ? void 0 : _a.toLowerCase()) || "";
      if (["jpg", "jpeg", "png", "gif", "webp", "svg", "ico", "bmp"].includes(ext)) return "\u{1F5BC}\uFE0F";
      if (["mp4", "webm", "mov", "avi", "mkv"].includes(ext)) return "\u{1F3AC}";
      if (["mp3", "wav", "ogg", "aac", "flac", "webm"].includes(ext)) return "\u{1F3B5}";
      if (["pdf"].includes(ext)) return "\u{1F4C4}";
      if (["doc", "docx"].includes(ext)) return "\u{1F4DD}";
      if (["xls", "xlsx", "csv"].includes(ext)) return "\u{1F4CA}";
      if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return "\u{1F4E6}";
      if (["json", "xml", "md", "txt", "log"].includes(ext)) return "\u{1F4C3}";
      return "\u{1F4CE}";
    }
    updateFilePreviews(container) {
      container.innerHTML = "";
      for (let i = 0; i < this.files.length; i++) {
        const f = this.files[i];
        const icon = this.getFileIcon(f.name);
        const isMedia = f.type.startsWith("image/") || f.type.startsWith("video/") || f.type.startsWith("audio/");
        const div = document.createElement("div");
        div.className = "feedspace-file-preview";
        let previewHtml = "";
        if (isMedia && f.type.startsWith("image/")) {
          const url = URL.createObjectURL(f);
          previewHtml = `<img src="${url}" class="feedspace-file-thumb" alt="${escHtml(f.name)}">`;
          setTimeout(() => URL.revokeObjectURL(url), 1e4);
        }
        div.innerHTML = `
        ${previewHtml || `<span class="feedspace-file-icon">${icon}</span>`}
        <div class="feedspace-file-info">
          <div class="feedspace-file-name">${escHtml(f.name)}</div>
          <div class="feedspace-file-size">${(f.size / 1024).toFixed(0)} KB</div>
        </div>
        <button class="feedspace-file-remove" data-idx="${i}">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      `;
        div.querySelector(".feedspace-file-remove").addEventListener("click", () => {
          this.files.splice(i, 1);
          this.updateFilePreviews(container);
        });
        container.appendChild(div);
      }
    }
    handleSubmit() {
      var _a, _b;
      const content = ((_a = this.inputEl) == null ? void 0 : _a.value.trim()) || "";
      if (!content && this.files.length === 0) return;
      (_b = this.callbacks) == null ? void 0 : _b.onSubmit(content, this.files);
      if (this.inputEl) this.inputEl.value = "";
      this.files = [];
    }
  };
  function escHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // src/widget/feedback-list.ts
  var FeedbackListPanel = class {
    constructor() {
      this.root = null;
      this.overlay = null;
      this.callbacks = null;
      this.annotations = [];
      this.currentFilter = "all";
      this.onClose = null;
    }
    open(annotations, callbacks, onClose) {
      this.annotations = annotations;
      this.callbacks = callbacks;
      this.onClose = onClose;
      this.render();
    }
    close() {
      if (this.overlay && this.overlay.parentNode) this.overlay.parentNode.removeChild(this.overlay);
      if (this.root && this.root.parentNode) this.root.parentNode.removeChild(this.root);
      this.overlay = null;
      this.root = null;
    }
    updateAnnotations(annotations) {
      this.annotations = annotations;
      if (this.root) {
        this.renderList();
      }
    }
    render() {
      this.close();
      this.overlay = document.createElement("div");
      this.overlay.className = "feedspace-panel-overlay";
      this.overlay.addEventListener("click", () => this.close());
      document.body.appendChild(this.overlay);
      this.root = document.createElement("div");
      this.root.className = "feedspace-panel";
      const header = document.createElement("div");
      header.className = "feedspace-panel-header";
      header.innerHTML = `
      <span class="feedspace-panel-title">Feedback List</span>
      <button class="feedspace-panel-close" id="feedback-list-close">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    `;
      this.root.appendChild(header);
      header.querySelector("#feedback-list-close").addEventListener("click", () => this.close());
      const filters = document.createElement("div");
      filters.className = "feedspace-filter-tabs";
      const filterOptions = [
        { value: "all", label: "All" },
        { value: "open", label: "Open" },
        { value: "in_progress", label: "In Progress" },
        { value: "resolved", label: "Resolved" }
      ];
      for (const opt of filterOptions) {
        const btn = document.createElement("button");
        btn.className = `feedspace-filter-tab${this.currentFilter === opt.value ? " active" : ""}`;
        btn.textContent = opt.label;
        btn.dataset.filter = opt.value;
        btn.addEventListener("click", () => {
          var _a;
          this.currentFilter = opt.value;
          filters.querySelectorAll(".feedspace-filter-tab").forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          (_a = this.callbacks) == null ? void 0 : _a.onFilterChange(opt.value);
        });
        filters.appendChild(btn);
      }
      this.root.appendChild(filters);
      const body = document.createElement("div");
      body.className = "feedspace-panel-body";
      body.id = "feedback-list-body";
      this.root.appendChild(body);
      document.body.appendChild(this.root);
      this.renderList();
    }
    renderList() {
      var _a, _b;
      const body = (_a = this.root) == null ? void 0 : _a.querySelector("#feedback-list-body");
      if (!body) return;
      body.innerHTML = "";
      const filtered = this.currentFilter === "all" ? this.annotations : this.annotations.filter((a) => a.status === this.currentFilter);
      if (filtered.length === 0) {
        body.innerHTML = `
        <div class="feedspace-empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
          <p>No feedback items yet</p>
        </div>
      `;
        return;
      }
      for (const annotation of filtered) {
        const authorInitial = (annotation.createdBy || "A").charAt(0).toUpperCase();
        const dateStr = new Date(annotation.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        const replyCount = ((_b = annotation.replies) == null ? void 0 : _b.length) || 0;
        const item = document.createElement("div");
        item.className = "feedspace-feedback-item";
        item.dataset.annotationId = annotation.id;
        item.innerHTML = `
        <div class="feedspace-feedback-item-header">
          <div style="display:flex;align-items:center;gap:10px;">
            <div class="feedspace-avatar-sm">${authorInitial}</div>
            <div>
              <div class="feedspace-feedback-author">${escHtml2(annotation.createdBy)}</div>
              <div class="feedspace-feedback-meta">${dateStr}</div>
            </div>
          </div>
          <span class="feedspace-feedback-status ${annotation.status}">${annotation.status.replace("_", " ")}</span>
        </div>
        <div class="feedspace-feedback-content">${escHtml2(annotation.content)}</div>
        ${replyCount > 0 ? `<div class="feedspace-reply-count"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> ${replyCount} ${replyCount === 1 ? "reply" : "replies"}</div>` : ""}
      `;
        item.addEventListener("click", () => {
          var _a2;
          body.querySelectorAll(".feedspace-feedback-item").forEach((el) => el.classList.remove("highlight"));
          item.classList.add("highlight");
          (_a2 = this.callbacks) == null ? void 0 : _a2.onSelectAnnotation(annotation.id);
        });
        body.appendChild(item);
      }
    }
  };
  function escHtml2(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // src/widget/uploader.ts
  async function uploadToWordPress(wpApiUrl, wpApiKey, file, projectId) {
    const formData = new FormData();
    formData.append("file", file);
    if (projectId) formData.append("project_id", projectId);
    const baseUrl = wpApiUrl.replace(/\/+$/, "");
    const res = await fetch(`${baseUrl}/wp-json/feedspace/v1/media`, {
      method: "POST",
      headers: { "X-Feedspace-Key": wpApiKey },
      body: formData
    });
    if (!res.ok) {
      throw new Error(`WordPress upload failed: ${res.status}`);
    }
    return res.json();
  }

  // src/widget/annotation-engine.ts
  function dbg(msg, data) {
    const arr = window.__feedspaceDebug;
    if (arr && Array.isArray(arr)) {
      arr.push({ msg, data, time: Date.now() });
    }
    console.log("[Feedspace]", msg, data || "");
  }
  var SVG_ICONS = {
    select: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3l14 8-7 2-3 7z"/></svg>',
    pin: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>',
    list: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',
    desktop: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
    tablet: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>',
    mobile: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>',
    submit: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
    mic: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>',
    paperclip: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>',
    file: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>'
  };
  var AnnotationEngine = class {
    constructor(config, api) {
      this.annotations = [];
      this.currentTool = "select";
      this.deviceMode = "desktop";
      this.filterMode = "all";
      this.clientName = "";
      this.isDrawing = false;
      this.drawStart = null;
      this.drawPoints = [];
      this.tempSvgEl = null;
      this.isRecording = false;
      this.mediaRecorder = null;
      this.audioChunks = [];
      this.recordingStartTime = 0;
      this.recordingTimer = null;
      this.toolbarRoot = null;
      this.nameModal = null;
      this.hoverHighlightEl = null;
      this.config = config;
      this.api = api;
      this.renderer = new AnnotationRenderer();
      this.commentPanel = new CommentPanel();
      this.feedbackList = new FeedbackListPanel();
    }
    async init() {
      dbg("AnnotationEngine.init() called");
      this.clientName = localStorage.getItem("feedspace_client_name") || "";
      dbg("clientName from localStorage:", this.clientName || "(empty)");
      if (!this.clientName) {
        dbg("No client name \u2014 showing name modal");
        this.showNameModal();
        return;
      }
      dbg("Client name found \u2014 booting directly");
      this.boot();
    }
    showNameModal() {
      dbg("showNameModal() called");
      if (this.nameModal) {
        dbg("nameModal already exists \u2014 skipping");
        return;
      }
      const modal = document.createElement("div");
      modal.className = "feedspace-name-modal";
      modal.innerHTML = `
      <div class="feedspace-name-modal-card">
        <h3>What is your name?</h3>
        <p>This will be shown with your feedback.</p>
        <input type="text" id="feedspace-name-input" placeholder="Your name..." maxlength="50" autocomplete="off">
        <div class="actions">
          <button class="cancel" id="feedspace-name-skip">Skip</button>
          <button class="confirm" id="feedspace-name-continue">Continue</button>
        </div>
      </div>
    `;
      document.body.appendChild(modal);
      this.nameModal = modal;
      dbg("Name modal appended to body");
      const input = modal.querySelector("#feedspace-name-input");
      input.focus();
      modal.querySelector("#feedspace-name-skip").addEventListener("click", () => {
        this.clientName = "Anonymous";
        localStorage.setItem("feedspace_client_name", this.clientName);
        this.destroyNameModal();
        this.boot();
      });
      modal.querySelector("#feedspace-name-continue").addEventListener("click", () => {
        this.clientName = input.value.trim() || "Anonymous";
        localStorage.setItem("feedspace_client_name", this.clientName);
        this.destroyNameModal();
        this.boot();
      });
      input.addEventListener("keydown", (e) => {
        var _a;
        if (e.key === "Enter") {
          (_a = modal.querySelector("#feedspace-name-continue")) == null ? void 0 : _a.click();
        }
      });
    }
    destroyNameModal() {
      if (this.nameModal && this.nameModal.parentNode) {
        this.nameModal.parentNode.removeChild(this.nameModal);
      }
      this.nameModal = null;
    }
    boot() {
      dbg("boot() called \u2014 initializing renderer, toolbar, drawing, annotations");
      this.renderer.init({
        onAnnotationClick: (id) => this.onAnnotationClick(id)
      });
      this.buildToolbar();
      this.attachDrawingListeners();
      this.loadAnnotations();
      dbg("boot() complete");
    }
    buildToolbar() {
      var _a, _b;
      this.toolbarRoot = document.createElement("div");
      this.toolbarRoot.id = "feedspace-widget-root";
      this.toolbarRoot.innerHTML = `
      <div class="feedspace-toolbar">
        <button class="feedspace-tool-btn active" data-tool="select" title="Select">${SVG_ICONS.select}</button>
        <button class="feedspace-tool-btn" data-tool="pin" title="Add Pin">${SVG_ICONS.pin}</button>
        <div class="feedspace-toolbar-divider"></div>
        <button class="feedspace-device-btn active" data-device="desktop" title="Desktop">${SVG_ICONS.desktop}</button>
        <button class="feedspace-device-btn" data-device="tablet" title="Tablet">${SVG_ICONS.tablet}</button>
        <button class="feedspace-device-btn" data-device="mobile" title="Mobile">${SVG_ICONS.mobile}</button>
        <div class="feedspace-toolbar-divider"></div>
        <button class="feedspace-tool-btn" data-action="list" title="Feedback List" id="feedspace-list-btn">
          ${SVG_ICONS.list}
          <span class="badge" id="feedspace-list-count" style="display:none">0</span>
        </button>
        <div class="feedspace-toolbar-divider"></div>
        <button class="feedspace-submit-btn" data-action="submit" title="Finish reviewing">
          ${SVG_ICONS.submit}
          Finish Review
        </button>
      </div>
    `;
      document.body.appendChild(this.toolbarRoot);
      this.toolbarRoot.querySelectorAll("[data-tool]").forEach((btn) => {
        btn.addEventListener("click", () => this.setTool(btn.getAttribute("data-tool")));
      });
      this.toolbarRoot.querySelectorAll("[data-device]").forEach((btn) => {
        btn.addEventListener("click", () => this.setDevice(btn.getAttribute("data-device")));
      });
      (_a = this.toolbarRoot.querySelector('[data-action="list"]')) == null ? void 0 : _a.addEventListener("click", () => {
        this.feedbackList.open(this.annotations, {
          onSelectAnnotation: (id) => this.focusAnnotation(id),
          onFilterChange: (filter) => {
            this.filterMode = filter;
            this.renderer.setFilter(filter);
          }
        }, () => {
        });
      });
      (_b = this.toolbarRoot.querySelector('[data-action="submit"]')) == null ? void 0 : _b.addEventListener("click", () => {
        this.showToast("Feedback saved! Thanks for your input.");
      });
    }
    setTool(tool) {
      var _a;
      this.currentTool = this.currentTool === tool ? "select" : tool;
      (_a = this.toolbarRoot) == null ? void 0 : _a.querySelectorAll("[data-tool]").forEach((btn) => {
        btn.classList.toggle("active", btn.getAttribute("data-tool") === this.currentTool);
      });
      document.body.setAttribute("data-feedspace-tool", this.currentTool);
      if (this.currentTool === "select") this.clearHoverHighlight();
      const overlay = document.getElementById("feedspace-overlay");
      if (overlay) {
        overlay.classList.toggle("feedspace-active", this.currentTool === "select");
      }
      this.cleanupDrawState();
    }
    setDevice(device) {
      var _a, _b;
      this.deviceMode = device;
      (_a = this.toolbarRoot) == null ? void 0 : _a.querySelectorAll("[data-device]").forEach((btn) => {
        btn.classList.toggle("active", btn.getAttribute("data-device") === device);
      });
      const body = document.body;
      let wrapper = document.getElementById("feedspace-viewport-wrapper");
      if (wrapper) {
        (_b = wrapper.parentNode) == null ? void 0 : _b.removeChild(wrapper);
      }
      if (device === "desktop") {
        body.style.maxWidth = "";
        body.style.margin = "";
        body.style.boxShadow = "";
      } else {
        const width = device === "tablet" ? "768px" : "375px";
        body.style.maxWidth = width;
        body.style.margin = "0 auto";
        body.style.boxShadow = "0 0 0 1px rgba(0,0,0,0.05), 0 8px 32px rgba(0,0,0,0.1)";
      }
      document.documentElement.style.background = device !== "desktop" ? "#e5e7eb" : "";
      this.renderer.renderAll();
    }
    attachDrawingListeners() {
      document.addEventListener("mousedown", (e) => this.onMouseDown(e));
      document.addEventListener("mousemove", (e) => this.onMouseMove(e));
      document.addEventListener("mouseup", (e) => this.onMouseUp(e));
      document.addEventListener("mouseleave", () => this.clearHoverHighlight());
    }
    updateHoverHighlight(e) {
      if (this.currentTool === "select") {
        this.clearHoverHighlight();
        return;
      }
      const target = closestTargetable(e.target);
      if (target === this.hoverHighlightEl) return;
      this.clearHoverHighlight();
      if (target && target !== document.body) {
        target.classList.add("feedspace-hover-highlight");
        this.hoverHighlightEl = target;
      }
    }
    clearHoverHighlight() {
      if (this.hoverHighlightEl) {
        this.hoverHighlightEl.classList.remove("feedspace-hover-highlight");
        this.hoverHighlightEl = null;
      }
    }
    onMouseDown(e) {
      var _a;
      if (this.currentTool === "select") return;
      if (e.button !== 0) return;
      if ((_a = e.target) == null ? void 0 : _a.closest("#feedspace-widget-root, #feedspace-overlay, .feedspace-panel, .feedspace-panel-overlay, .feedspace-name-modal")) return;
      e.preventDefault();
      this.isDrawing = true;
      const el = closestTargetable(e.target);
      const dna = getElementDNA(el);
      const rel = toRelative(el, e.pageX, e.pageY);
      this.drawStart = { x: e.pageX, y: e.pageY, el, dna };
      this.drawPoints = [{ x: rel.x, y: rel.y }];
      if (this.currentTool === "pin") {
        this.finishDrawing(el, dna, [{ x: rel.x, y: rel.y }]);
      }
    }
    onMouseMove(e) {
      if (!this.isDrawing || !this.drawStart) {
        this.updateHoverHighlight(e);
        return;
      }
    }
    onMouseUp(e) {
      if (!this.isDrawing || !this.drawStart) return;
      if (this.currentTool === "pin") {
        this.isDrawing = false;
        return;
      }
      this.isDrawing = false;
      const overlay = document.getElementById("feedspace-overlay");
      if (overlay) this.removeTempPreview(overlay);
      const { el, dna } = this.drawStart;
      this.finishDrawing(el, dna, this.drawPoints.length > 1 ? this.drawPoints : [{ x: 50, y: 50 }]);
    }
    removeTempPreview(overlay) {
      if (this.tempSvgEl && overlay.contains(this.tempSvgEl)) {
        overlay.removeChild(this.tempSvgEl);
      }
      this.tempSvgEl = null;
    }
    finishDrawing(el, startDna, points) {
      const firstPoint = points[0];
      const rel = toRelative(el, this.drawStart.x, this.drawStart.y);
      this.commentPanel.open(null, {
        onSubmit: (content, files) => this.saveAnnotation(content, files, el, startDna, firstPoint, points),
        onStartRecording: () => this.startRecording(),
        onStopRecording: () => this.stopRecording(),
        onDeleteRecording: () => this.deleteRecording(),
        isRecording: this.isRecording
      }, () => {
      });
      this.cleanupDrawState();
    }
    cleanupDrawState() {
      this.isDrawing = false;
      this.drawStart = null;
      this.drawPoints = [];
      this.tempSvgEl = null;
    }
    async saveAnnotation(content, files, el, startDna, firstPoint, _points) {
      const metaData = {
        device: this.deviceMode,
        elementTag: startDna.tag,
        elementText: startDna.text
      };
      const payload = {
        projectId: this.config.projectId,
        previewToken: this.config.token,
        type: "pin",
        content,
        pageUrl: this.config.pageUrl,
        selector: startDna.selector,
        elementDna: startDna,
        coordinatesX: firstPoint.x,
        coordinatesY: firstPoint.y,
        coordinatesXEnd: null,
        coordinatesYEnd: null,
        width: null,
        height: null,
        drawData: null,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        device: this.deviceMode,
        createdBy: this.clientName,
        metaData
      };
      try {
        const mediaUrls = [];
        if (files.length > 0) {
          for (const file of files) {
            try {
              const result = await uploadToWordPress(this.config.wpApiUrl, this.config.wpApiKey, file, this.config.projectId);
              mediaUrls.push(result.url);
            } catch (err) {
              console.error("Upload failed", err);
            }
          }
        }
        const annotation = await this.api.createAnnotation(payload);
        this.annotations.push(annotation);
        this.renderer.setAnnotations(this.annotations);
        this.updateBadge();
        this.commentPanel.close();
        this.setTool("select");
        this.showToast("Feedback saved!");
      } catch (err) {
        console.error("Failed to save annotation", err);
        this.showToast("Failed to save feedback. Please try again.");
      }
    }
    async loadAnnotations() {
      try {
        this.annotations = await this.api.getAnnotations(this.config.pageUrl, this.config.projectId);
        dbg("loadAnnotations: fetched " + this.annotations.length + " annotations");
        this.renderer.setAnnotations(this.annotations);
        this.updateBadge();
      } catch (err) {
        console.error("Failed to load annotations", err);
        dbg("loadAnnotations: FAILED", String(err));
      }
    }
    onAnnotationClick(id) {
      const annotation = this.annotations.find((a) => a.id === id);
      if (!annotation) return;
      this.renderer.setSelected(id);
      this.commentPanel.open(annotation, {
        onSubmit: async (content, files) => {
          try {
            const mediaUrls = [];
            for (const file of files) {
              try {
                const result = await uploadToWordPress(this.config.wpApiUrl, this.config.wpApiKey, file, this.config.projectId);
                mediaUrls.push(result.url);
              } catch {
              }
            }
            const updated = await this.api.updateAnnotation(id, {
              ...annotation,
              replies: [...annotation.replies || [], {
                id: "",
                content,
                createdBy: this.clientName,
                createdAt: (/* @__PURE__ */ new Date()).toISOString()
              }]
            });
            await this.loadAnnotations();
            this.renderer.setSelected(null);
            this.commentPanel.close();
          } catch (err) {
            console.error("Failed to add reply", err);
          }
        },
        onStartRecording: () => this.startRecording(),
        onStopRecording: () => this.stopRecording(),
        onDeleteRecording: () => this.deleteRecording(),
        isRecording: this.isRecording
      }, () => {
        this.renderer.setSelected(null);
      });
    }
    focusAnnotation(id) {
      this.renderer.setSelected(id);
      const annotation = this.annotations.find((a) => a.id === id);
      if (annotation == null ? void 0 : annotation.elementDna) {
        const el = findElement(annotation.elementDna);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }
    updateBadge() {
      const badge = document.getElementById("feedspace-list-count");
      if (!badge) return;
      const count = this.annotations.length;
      badge.textContent = String(count);
      badge.style.display = count > 0 ? "" : "none";
    }
    startRecording() {
      var _a;
      if (!((_a = navigator.mediaDevices) == null ? void 0 : _a.getUserMedia)) return;
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        this.mediaRecorder = new MediaRecorder(stream);
        this.audioChunks = [];
        this.isRecording = true;
        this.recordingStartTime = Date.now();
        this.mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) this.audioChunks.push(e.data);
        };
        this.mediaRecorder.onstop = () => {
          stream.getTracks().forEach((t) => t.stop());
        };
        this.mediaRecorder.start();
        if (this.recordingTimer) clearInterval(this.recordingTimer);
        this.recordingTimer = window.setInterval(() => {
          const elapsed = Math.floor((Date.now() - this.recordingStartTime) / 1e3);
          const mins = Math.floor(elapsed / 60);
          const secs = elapsed % 60;
          const indicator = document.getElementById("feedspace-recording-indicator");
          if (indicator) {
            indicator.style.display = "flex";
            const timeEl = indicator.querySelector(".feedspace-recording-time");
            if (timeEl) timeEl.textContent = `${mins}:${String(secs).padStart(2, "0")}`;
          }
        }, 1e3);
      }).catch(() => {
        this.showToast("Microphone access denied");
      });
    }
    stopRecording() {
      if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
        this.mediaRecorder.stop();
      }
      this.isRecording = false;
      if (this.recordingTimer) {
        clearInterval(this.recordingTimer);
        this.recordingTimer = null;
      }
      const indicator = document.getElementById("feedspace-recording-indicator");
      if (indicator) indicator.style.display = "none";
      const blob = new Blob(this.audioChunks, { type: "audio/webm" });
      const file = new File([blob], `recording-${Date.now()}.webm`, { type: "audio/webm" });
      const previewContainer = document.getElementById("feedspace-file-previews");
      if (previewContainer) {
        const div = document.createElement("div");
        div.className = "feedspace-file-preview";
        div.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/></svg>
        <span>Voice recording (${(file.size / 1024).toFixed(0)} KB)</span>
      `;
        previewContainer.appendChild(div);
      }
    }
    deleteRecording() {
      this.isRecording = false;
      if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
        this.mediaRecorder.stop();
      }
      if (this.recordingTimer) {
        clearInterval(this.recordingTimer);
        this.recordingTimer = null;
      }
      this.audioChunks = [];
      const indicator = document.getElementById("feedspace-recording-indicator");
      if (indicator) indicator.style.display = "none";
    }
    showToast(message) {
      const existing = document.getElementById("feedspace-toast");
      if (existing) existing.remove();
      const toast = document.createElement("div");
      toast.id = "feedspace-toast";
      toast.style.cssText = `
      position:fixed;bottom:80px;left:50%;transform:translateX(-50%);
      background:#1f2937;color:#fff;padding:10px 20px;border-radius:8px;
      font-size:13px;font-family:'Poppins',sans-serif;z-index:100001;
      box-shadow:0 4px 16px rgba(0,0,0,0.2);animation:feedspace-fade-in 0.15s;
    `;
      toast.textContent = message;
      document.body.appendChild(toast);
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 3e3);
    }
    destroy() {
      var _a;
      this.clearHoverHighlight();
      this.renderer.destroy();
      this.commentPanel.close();
      this.feedbackList.close();
      this.destroyNameModal();
      if (this.toolbarRoot && this.toolbarRoot.parentNode) {
        this.toolbarRoot.parentNode.removeChild(this.toolbarRoot);
      }
      if (this.recordingTimer) clearInterval(this.recordingTimer);
      document.body.removeAttribute("data-feedspace-tool");
      const wrapper = document.getElementById("feedspace-viewport-wrapper");
      if (wrapper) (_a = wrapper.parentNode) == null ? void 0 : _a.removeChild(wrapper);
      document.body.style.maxWidth = "";
      document.body.style.margin = "";
      document.body.style.boxShadow = "";
      document.documentElement.style.background = "";
    }
  };

  // src/widget/index.ts
  function initWidget(config) {
    function dbg2(msg, data) {
      const arr = window.__feedspaceDebug;
      if (arr && Array.isArray(arr)) arr.push({ msg, data, time: Date.now() });
      console.log("[Feedspace]", msg, data || "");
    }
    dbg2("initWidget() called with config", { apiUrl: config.apiUrl, projectId: config.projectId, pageUrl: config.pageUrl, wpApiUrl: config.wpApiUrl, hasWpKey: !!config.wpApiKey });
    injectStyles();
    dbg2("Styles injected");
    if (config.pageUrl) {
      try {
        const u = new URL(config.pageUrl);
        u.searchParams.delete("feedspace_preview");
        config.pageUrl = u.toString();
      } catch {
      }
    }
    const api = createApiClient(config.apiUrl, config.token, config.wpApiUrl, config.wpApiKey);
    dbg2("API client created");
    const engine = new AnnotationEngine(config, api);
    dbg2("AnnotationEngine instance created");
    engine.init().catch((err) => {
      console.error("Feedspace widget init error:", err);
      dbg2("init() threw error", String(err));
    });
    return engine;
  }
  var currentEngine = null;
  window.FeedspaceWidget = {
    init(config) {
      if (currentEngine) {
        currentEngine.destroy();
      }
      currentEngine = initWidget(config);
    },
    destroy() {
      if (currentEngine) {
        currentEngine.destroy();
        currentEngine = null;
      }
    }
  };
})();
