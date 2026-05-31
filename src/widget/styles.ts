const STYLES = `
#feedspace-widget-root *,
#feedspace-widget-root *::before,
#feedspace-widget-root *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

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
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: #1f2937;
  position: fixed;
  z-index: 99999;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  pointer-events: none;
}

.feedspace-toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  padding: 6px 8px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
  margin-bottom: 20px;
  pointer-events: auto;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.feedspace-toolbar-group {
  display: flex;
  align-items: center;
  gap: 2px;
}
.feedspace-toolbar-divider {
  width: 1px;
  height: 28px;
  background: rgba(0, 0, 0, 0.08);
  margin: 0 4px;
}

.feedspace-tool-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.15s ease;
  position: relative;
}
.feedspace-tool-btn:hover {
  background: rgba(0, 0, 0, 0.06);
  color: #374151;
}
.feedspace-tool-btn.active {
  background: rgba(99, 102, 241, 0.12);
  color: #6366f1;
}
.feedspace-tool-btn svg {
  width: 20px;
  height: 20px;
}
.feedspace-tool-btn .badge {
  position: absolute;
  top: 2px;
  right: 2px;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  background: #ef4444;
  color: #fff;
  font-size: 10px;
  line-height: 16px;
  text-align: center;
  padding: 0 4px;
  font-weight: 600;
}

.feedspace-toolbar-label {
  font-size: 11px;
  font-weight: 500;
  color: #9ca3af;
  padding: 0 6px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  user-select: none;
}

.feedspace-device-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  color: #9ca3af;
  transition: all 0.15s ease;
}
.feedspace-device-btn:hover {
  color: #6b7280;
}
.feedspace-device-btn.active {
  color: #6366f1;
  background: rgba(99, 102, 241, 0.1);
}
.feedspace-device-btn svg {
  width: 16px;
  height: 16px;
}

.feedspace-submit-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: #6366f1;
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease;
  font-family: inherit;
}
.feedspace-submit-btn:hover {
  background: #4f46e5;
}
.feedspace-submit-btn svg {
  width: 16px;
  height: 16px;
}

.feedspace-annotation-pin {
  cursor: pointer;
  transition: transform 0.15s ease;
}
.feedspace-annotation-pin:hover {
  transform: scale(1.15);
}

.feedspace-panel-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 99998;
  animation: feedspace-fade-in 0.15s ease;
}

.feedspace-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 380px;
  max-width: 100vw;
  height: 100vh;
  background: #fff;
  z-index: 99999;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  animation: feedspace-slide-in 0.2s ease;
}

.feedspace-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #f3f4f6;
}
.feedspace-panel-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}
.feedspace-panel-close {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}
.feedspace-panel-close:hover {
  background: #f3f4f6;
  color: #374151;
}
.feedspace-panel-close svg {
  width: 18px;
  height: 18px;
}

.feedspace-panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
}

.feedspace-panel-footer {
  padding: 12px 20px;
  border-top: 1px solid #f3f4f6;
}

.feedspace-comment-input-wrap {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}
.feedspace-comment-input {
  flex: 1;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  font-family: inherit;
  outline: none;
  resize: none;
  min-height: 36px;
  max-height: 120px;
  transition: border-color 0.15s;
  line-height: 1.5;
  background: #fff;
  color: #1f2937;
}
.feedspace-comment-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
}
.feedspace-comment-input::placeholder {
  color: #9ca3af;
}

.feedspace-icon-btn {
  width: 36px;
  height: 36px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  transition: all 0.15s;
  flex-shrink: 0;
}
.feedspace-icon-btn:hover {
  background: #f9fafb;
  border-color: #d1d5db;
  color: #374151;
}
.feedspace-icon-btn.active {
  background: rgba(99, 102, 241, 0.08);
  border-color: #6366f1;
  color: #6366f1;
}
.feedspace-icon-btn svg {
  width: 18px;
  height: 18px;
}

.feedspace-feedback-item {
  background: #f9fafb;
  border: 1px solid #f3f4f6;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.15s;
}
.feedspace-feedback-item:hover {
  border-color: #e5e7eb;
  background: #fff;
}
.feedspace-feedback-item.highlight {
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.15);
}

.feedspace-feedback-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}
.feedspace-feedback-type {
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 2px 6px;
  border-radius: 4px;
  background: #eef2ff;
  color: #6366f1;
}
.feedspace-feedback-status {
  font-size: 11px;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 4px;
}
.feedspace-feedback-status.open {
  background: #fef3c7;
  color: #d97706;
}
.feedspace-feedback-status.in_progress {
  background: #dbeafe;
  color: #2563eb;
}
.feedspace-feedback-status.resolved {
  background: #d1fae5;
  color: #059669;
}
.feedspace-feedback-status.closed {
  background: #f3f4f6;
  color: #6b7280;
}

.feedspace-feedback-content {
  font-size: 13px;
  color: #374151;
  line-height: 1.5;
  margin-bottom: 6px;
}
.feedspace-feedback-meta {
  font-size: 11px;
  color: #9ca3af;
}

.feedspace-reply {
  margin-top: 8px;
  padding: 8px 10px;
  background: #fff;
  border: 1px solid #f3f4f6;
  border-radius: 6px;
}
.feedspace-reply-text {
  font-size: 12px;
  color: #4b5563;
}
.feedspace-reply-meta {
  font-size: 10px;
  color: #9ca3af;
  margin-top: 4px;
}

.feedspace-file-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: #f3f4f6;
  border-radius: 6px;
  margin-top: 6px;
  font-size: 12px;
  color: #374151;
}
.feedspace-file-preview svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}
.feedspace-file-preview .remove {
  margin-left: auto;
  cursor: pointer;
  color: #ef4444;
  font-size: 16px;
  line-height: 1;
}

.feedspace-recording-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ef4444;
  font-size: 13px;
  font-weight: 500;
  padding: 8px 0;
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
}

.feedspace-empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #9ca3af;
}
.feedspace-empty-state svg {
  width: 48px;
  height: 48px;
  margin-bottom: 12px;
  opacity: 0.4;
}
.feedspace-empty-state p {
  font-size: 14px;
}

.feedspace-filter-tabs {
  display: flex;
  gap: 4px;
  padding: 0 20px 12px;
  border-bottom: 1px solid #f3f4f6;
  overflow-x: auto;
}
.feedspace-filter-tab {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
  font-family: inherit;
}
.feedspace-filter-tab:hover {
  background: #f3f4f6;
}
.feedspace-filter-tab.active {
  background: #6366f1;
  color: #fff;
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
  50% { opacity: 0.4; }
}
@keyframes feedspace-heartbeat {
  0% { r: 10; opacity: 1; }
  50% { r: 18; opacity: 0; }
  100% { r: 10; opacity: 0; }
}

.feedspace-name-modal {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100000;
  background: rgba(0, 0, 0, 0.4);
  animation: feedspace-fade-in 0.15s;
}
.feedspace-name-modal-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  width: 340px;
  max-width: 90vw;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}
.feedspace-name-modal h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #111827;
}
.feedspace-name-modal p {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 16px;
}
.feedspace-name-modal input {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s;
  margin-bottom: 12px;
}
.feedspace-name-modal input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
}
.feedspace-name-modal .actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.feedspace-name-modal .actions button {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  font-family: inherit;
}
.feedspace-name-modal .actions .cancel {
  background: #f3f4f6;
  color: #374151;
}
.feedspace-name-modal .actions .confirm {
  background: #6366f1;
  color: #fff;
}
.feedspace-name-modal .actions .confirm:hover {
  background: #4f46e5;
}

[data-feedspace-tool="pin"] { cursor: crosshair; }
[data-feedspace-tool="rect"] { cursor: crosshair; }
[data-feedspace-tool="arrow"] { cursor: crosshair; }
[data-feedspace-tool="draw"] { cursor: crosshair; }

.feedspace-viewport-wrapper {
  overflow: auto;
  margin: 0 auto;
  background: #fff;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05), 0 8px 32px rgba(0, 0, 0, 0.1);
  min-height: 100vh;
  transition: max-width 0.3s ease;
}

.feedspace-draw-preview {
  pointer-events: none;
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
