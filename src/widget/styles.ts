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
  display: flex;
  justify-content: center;
  position: fixed;
  z-index: 99999;
  bottom: 0;
  left: 0;
  right: 0;
  pointer-events: none;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: #0f172a;
}

/* ===== TOOLBAR (inside #feedspace-widget-root) ===== */
#feedspace-widget-root .feedspace-toolbar {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 6px 10px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  margin-bottom: 24px;
  pointer-events: auto;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: #0f172a;
}

#feedspace-widget-root .feedspace-toolbar-divider {
  width: 1px;
  height: 28px;
  background: #e2e8f0;
  margin: 0 8px;
  border: none;
}

#feedspace-widget-root .feedspace-tool-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  color: #64748b;
  transition: all 0.15s;
  position: relative;
  padding: 0;
  line-height: 1;
  box-shadow: none;
  text-shadow: none;
  outline: none;
  font-family: 'Poppins', -apple-system, sans-serif;
  font-size: 14px;
  text-transform: none;
  letter-spacing: normal;
  text-decoration: none;
  margin: 0;
}
#feedspace-widget-root .feedspace-tool-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
}
#feedspace-widget-root .feedspace-tool-btn.active {
  background: #2563eb;
  color: #fff;
}
#feedspace-widget-root .feedspace-tool-btn.active:hover {
  background: #1d4ed8;
}
#feedspace-widget-root .feedspace-tool-btn svg {
  width: 20px;
  height: 20px;
  display: block;
}
#feedspace-widget-root .feedspace-tool-btn .badge {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  background: #ef4444;
  color: #fff;
  font-size: 10px;
  line-height: 18px;
  text-align: center;
  padding: 0 4px;
  font-weight: 700;
  border: 2px solid #fff;
}

#feedspace-widget-root .feedspace-device-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  color: #94a3b8;
  transition: all 0.15s;
  padding: 0;
  line-height: 1;
  box-shadow: none;
  outline: none;
  font-family: 'Poppins', -apple-system, sans-serif;
  font-size: 14px;
  margin: 0;
}
#feedspace-widget-root .feedspace-device-btn:hover {
  color: #2563eb;
  background: #eff6ff;
}
#feedspace-widget-root .feedspace-device-btn.active {
  color: #2563eb;
  background: #eff6ff;
}
#feedspace-widget-root .feedspace-device-btn svg {
  width: 16px;
  height: 16px;
  display: block;
}

#feedspace-widget-root .feedspace-submit-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 18px;
  border: none;
  border-radius: 8px;
  background: #2563eb;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  font-family: 'Poppins', -apple-system, sans-serif;
  line-height: 1.4;
  box-shadow: none;
  text-shadow: none;
  outline: none;
  text-transform: none;
  letter-spacing: normal;
  text-decoration: none;
  margin: 0;
}
#feedspace-widget-root .feedspace-submit-btn:hover {
  background: #1d4ed8;
  text-decoration: none;
}
#feedspace-widget-root .feedspace-submit-btn:active {
  background: #1e40af;
}
#feedspace-widget-root .feedspace-submit-btn svg {
  width: 16px;
  height: 16px;
  display: block;
}

/* Body-level submit button (inside panels, not in widget root) */
.feedspace-submit-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 18px;
  border: none;
  border-radius: 8px;
  background: #2563eb;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  font-family: 'Poppins', -apple-system, sans-serif;
  line-height: 1.4;
  box-shadow: none;
  text-shadow: none;
  outline: none;
  text-transform: none;
  letter-spacing: normal;
  text-decoration: none;
  margin: 0;
}
.feedspace-submit-btn:hover {
  background: #1d4ed8;
  text-decoration: none;
}
.feedspace-submit-btn:active {
  background: #1e40af;
}
.feedspace-submit-btn svg {
  width: 16px;
  height: 16px;
  display: block;
}

#feedspace-widget-root .feedspace-annotation-pin {
  cursor: pointer;
  transition: transform 0.15s, filter 0.15s;
  filter: drop-shadow(0 1px 3px rgba(0,0,0,0.2));
}
#feedspace-widget-root .feedspace-annotation-pin:hover {
  transform: scale(1.15);
  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.3));
}

/* ===== PANELS (appended to document.body) ===== */
.feedspace-panel-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.3);
  z-index: 99998;
  animation: feedspace-fade-in 0.15s;
  pointer-events: auto;
}

.feedspace-panel {
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  right: 0;
  width: 420px;
  max-width: 100vw;
  height: 100vh;
  background: #fff;
  z-index: 99999;
  box-shadow: -8px 0 40px rgba(0,0,0,0.1);
  animation: feedspace-slide-in 0.2s ease;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: #0f172a;
  pointer-events: auto;
}

.feedspace-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #e2e8f0;
}
.feedspace-panel-title {
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  letter-spacing: -0.01em;
}
.feedspace-panel-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  color: #94a3b8;
  transition: all 0.15s;
  padding: 0;
  line-height: 1;
  box-shadow: none;
  outline: none;
  font-family: 'Poppins', -apple-system, sans-serif;
  font-size: 14px;
  margin: 0;
}
.feedspace-panel-close:hover {
  background: #f1f5f9;
  color: #0f172a;
}
.feedspace-panel-close svg {
  width: 18px;
  height: 18px;
  display: block;
}

.feedspace-panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
}

.feedspace-panel-footer {
  padding: 16px 24px 20px;
  border-top: 1px solid #e2e8f0;
}

.feedspace-comment-input {
  display: block;
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 13px;
  font-family: 'Poppins', -apple-system, sans-serif;
  outline: none;
  resize: none;
  min-height: 44px;
  max-height: 120px;
  transition: border-color 0.15s, box-shadow 0.15s;
  line-height: 1.5;
  background: #fff;
  color: #0f172a;
  margin: 0;
  box-shadow: none;
  text-shadow: none;
}
.feedspace-comment-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
}
.feedspace-comment-input::placeholder {
  color: #94a3b8;
  opacity: 1;
}

.feedspace-media-actions {
  display: flex;
  gap: 4px;
  margin-top: 10px;
}

.feedspace-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  color: #64748b;
  transition: all 0.15s;
  flex-shrink: 0;
  padding: 0;
  line-height: 1;
  box-shadow: none;
  outline: none;
  font-family: 'Poppins', -apple-system, sans-serif;
  font-size: 14px;
  margin: 0;
}
.feedspace-icon-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #0f172a;
}
.feedspace-icon-btn.active {
  background: #eff6ff;
  border-color: #2563eb;
  color: #2563eb;
}
.feedspace-icon-btn svg {
  width: 16px;
  height: 16px;
  display: block;
}

.feedspace-avatar-sm {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #2563eb;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}

.feedspace-avatar-xs {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #3b82f6;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
  flex-shrink: 0;
}

.feedspace-feedback-item {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 14px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.15s;
}
.feedspace-feedback-item:hover {
  border-color: #cbd5e1;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.feedspace-feedback-item.highlight {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
}

.feedspace-feedback-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.feedspace-feedback-author {
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
  line-height: 1.3;
}
.feedspace-feedback-status {
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 999px;
  white-space: nowrap;
  border: none;
}
.feedspace-feedback-status.open {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}
.feedspace-feedback-status.in_progress {
  background: rgba(37, 99, 235, 0.1);
  color: #2563eb;
}
.feedspace-feedback-status.resolved {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
}
.feedspace-feedback-status.closed {
  background: #f1f5f9;
  color: #64748b;
}

.feedspace-feedback-content {
  font-size: 13px;
  color: #334155;
  line-height: 1.6;
}
.feedspace-feedback-meta {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 1px;
}

.feedspace-reply-count {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #94a3b8;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #f1f5f9;
}
.feedspace-reply-count svg {
  width: 12px;
  height: 12px;
}

.feedspace-reply {
  margin-top: 10px;
  padding: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}
.feedspace-reply-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.feedspace-reply-author {
  font-size: 12px;
  font-weight: 600;
  color: #0f172a;
}
.feedspace-reply-text {
  font-size: 12px;
  color: #475569;
  line-height: 1.5;
}
.feedspace-reply-meta {
  font-size: 10px;
  color: #94a3b8;
  margin-top: 1px;
}

.feedspace-section-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 16px 0;
  border: none;
}

.feedspace-file-preview {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-top: 8px;
  font-size: 12px;
  color: #334155;
}
.feedspace-file-thumb {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}
.feedspace-file-icon {
  font-size: 18px;
  flex-shrink: 0;
}
.feedspace-file-info {
  flex: 1;
  min-width: 0;
}
.feedspace-file-name {
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #0f172a;
}
.feedspace-file-size {
  font-size: 10px;
  color: #94a3b8;
}
.feedspace-file-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  color: #94a3b8;
  transition: all 0.15s;
  flex-shrink: 0;
  padding: 0;
  line-height: 1;
  box-shadow: none;
  outline: none;
  margin: 0;
}
.feedspace-file-remove:hover {
  background: #fef2f2;
  color: #ef4444;
}
.feedspace-file-remove svg {
  width: 14px;
  height: 14px;
  display: block;
}

.feedspace-recording-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ef4444;
  font-size: 12px;
  font-weight: 500;
  padding: 10px 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  margin-top: 8px;
}
.feedspace-recording-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ef4444;
  animation: feedspace-pulse 1s infinite;
}
.feedspace-recording-time {
  font-variant-numeric: tabular-nums;
  color: #dc2626;
}

.feedspace-empty-state {
  text-align: center;
  padding: 48px 24px;
  color: #94a3b8;
}
.feedspace-empty-state svg {
  width: 48px;
  height: 48px;
  margin-bottom: 12px;
  opacity: 0.3;
}
.feedspace-empty-state p {
  font-size: 14px;
  line-height: 1.6;
  color: #64748b;
  margin: 0;
}

.feedspace-filter-tabs {
  display: flex;
  gap: 4px;
  padding: 0 24px 12px;
  border-bottom: 1px solid #e2e8f0;
  overflow-x: auto;
}
.feedspace-filter-tab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
  font-family: 'Poppins', -apple-system, sans-serif;
  line-height: 1;
  box-shadow: none;
  outline: none;
  margin: 0;
  text-transform: none;
  letter-spacing: normal;
  text-decoration: none;
}
.feedspace-filter-tab:hover {
  background: #f1f5f9;
  color: #0f172a;
}
.feedspace-filter-tab.active {
  background: #2563eb;
  color: #fff;
}

/* ===== NAME MODAL (appended to document.body) ===== */
.feedspace-name-modal {
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  inset: 0;
  z-index: 100000;
  background: rgba(15, 23, 42, 0.4);
  animation: feedspace-fade-in 0.15s;
}
.feedspace-name-modal-card {
  display: block;
  background: #fff;
  border-radius: 12px;
  padding: 28px;
  width: 360px;
  max-width: 90vw;
  box-shadow: 0 24px 64px rgba(0,0,0,0.15);
  animation: feedspace-scale-in 0.2s ease;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: #0f172a;
}
.feedspace-name-modal h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #0f172a;
}
.feedspace-name-modal p {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 20px;
  line-height: 1.5;
}
.feedspace-name-modal input {
  display: block;
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 14px;
  font-family: 'Poppins', -apple-system, sans-serif;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  margin-bottom: 16px;
  color: #0f172a;
  background: #fff;
  box-shadow: none;
  line-height: 1.5;
}
.feedspace-name-modal input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
}
.feedspace-name-modal input::placeholder {
  color: #94a3b8;
  opacity: 1;
}
.feedspace-name-modal .actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.feedspace-name-modal .actions button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  font-family: 'Poppins', -apple-system, sans-serif;
  transition: all 0.15s;
  line-height: 1.4;
  box-shadow: none;
  outline: none;
  margin: 0;
}
.feedspace-name-modal .actions .cancel {
  background: #f1f5f9;
  color: #334155;
}
.feedspace-name-modal .actions .cancel:hover {
  background: #e2e8f0;
}
.feedspace-name-modal .actions .confirm {
  background: #2563eb;
  color: #fff;
}
.feedspace-name-modal .actions .confirm:hover {
  background: #1d4ed8;
}

/* ===== HOVER HIGHLIGHT (applied to page elements) ===== */
.feedspace-hover-highlight {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
  border-radius: 2px;
}

[data-feedspace-tool="pin"] {
  cursor: crosshair;
}

/* ===== ANIMATIONS ===== */
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
`;

let injected = false;

export function injectStyles(): void {
  if (injected) return;
  const style = document.createElement('style');
  style.textContent = STYLES;
  document.head.appendChild(style);
  injected = true;
}
