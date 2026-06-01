const STYLES = `
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

let injected = false;

export function injectStyles(): void {
  if (injected) return;
  const style = document.createElement('style');
  style.textContent = STYLES;
  document.head.appendChild(style);
  injected = true;
}
