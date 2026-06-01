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
  gap: 6px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 16px;
  padding: 6px 10px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1), 0 1px 4px rgba(0, 0, 0, 0.04);
  margin-bottom: 24px;
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
  background: rgba(0, 0, 0, 0.06);
  margin: 0 6px;
}

.feedspace-tool-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border: none;
  border-radius: 10px;
  background: transparent;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s ease;
  position: relative;
}
.feedspace-tool-btn:hover {
  background: rgba(99, 102, 241, 0.08);
  color: #6366f1;
}
.feedspace-tool-btn.active {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.feedspace-tool-btn svg {
  width: 20px;
  height: 20px;
}
.feedspace-tool-btn .badge {
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
  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.35);
  border: 2px solid rgba(255,255,255,0.8);
}

.feedspace-device-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  color: #9ca3af;
  transition: all 0.15s ease;
}
.feedspace-device-btn:hover {
  color: #6366f1;
  background: rgba(99, 102, 241, 0.06);
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
  padding: 10px 20px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.25);
}
.feedspace-submit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.35);
}
.feedspace-submit-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(99, 102, 241, 0.2);
}
.feedspace-submit-btn svg {
  width: 16px;
  height: 16px;
}

.feedspace-annotation-pin {
  cursor: pointer;
  transition: transform 0.2s ease, filter 0.2s ease;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}
.feedspace-annotation-pin:hover {
  transform: scale(1.2);
  filter: drop-shadow(0 3px 8px rgba(0, 0, 0, 0.3));
}

.feedspace-panel-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.25);
  z-index: 99998;
  animation: feedspace-fade-in 0.2s ease;
}

.feedspace-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 420px;
  max-width: 100vw;
  height: 100vh;
  background: #fff;
  z-index: 99999;
  box-shadow: -8px 0 40px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  animation: feedspace-slide-in 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.feedspace-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #f3f4f6;
}
.feedspace-panel-title {
  font-size: 17px;
  font-weight: 600;
  color: #111827;
  letter-spacing: -0.01em;
}
.feedspace-panel-close {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
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
  padding: 16px 24px;
}

.feedspace-panel-footer {
  padding: 16px 24px 20px;
  border-top: 1px solid #f3f4f6;
}

.feedspace-comment-input {
  width: 100%;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 13px;
  font-family: inherit;
  outline: none;
  resize: none;
  min-height: 44px;
  max-height: 120px;
  transition: border-color 0.15s, box-shadow 0.15s;
  line-height: 1.5;
  background: #fff;
  color: #1f2937;
}
.feedspace-comment-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}
.feedspace-comment-input::placeholder {
  color: #9ca3af;
}

.feedspace-media-actions {
  display: flex;
  gap: 6px;
  margin-top: 10px;
}

.feedspace-icon-btn {
  width: 40px;
  height: 40px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
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
  color: #6366f1;
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

.feedspace-avatar-sm {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 600;
  flex-shrink: 0;
}

.feedspace-avatar-xs {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #a5b4fc, #6366f1);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
}

.feedspace-feedback-item {
  background: #f9fafb;
  border: 1px solid #f3f4f6;
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.15s;
}
.feedspace-feedback-item:hover {
  border-color: #e5e7eb;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transform: translateY(-1px);
}
.feedspace-feedback-item.highlight {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

.feedspace-feedback-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.feedspace-feedback-author {
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
}
.feedspace-feedback-status {
  font-size: 11px;
  font-weight: 500;
  padding: 3px 10px;
  border-radius: 6px;
  white-space: nowrap;
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
  line-height: 1.6;
}
.feedspace-feedback-meta {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 1px;
}

.feedspace-reply-count {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #9ca3af;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #f3f4f6;
}
.feedspace-reply-count svg {
  width: 12px;
  height: 12px;
}

.feedspace-reply {
  margin-top: 10px;
  padding: 12px 14px;
  background: #fff;
  border: 1px solid #f3f4f6;
  border-radius: 12px;
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
  color: #374151;
}
.feedspace-reply-text {
  font-size: 12px;
  color: #4b5563;
  line-height: 1.5;
}
.feedspace-reply-meta {
  font-size: 10px;
  color: #9ca3af;
  margin-top: 1px;
}

.feedspace-section-divider {
  height: 1px;
  background: #f3f4f6;
  margin: 16px 0;
}

.feedspace-file-preview {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: #f9fafb;
  border: 1px solid #f3f4f6;
  border-radius: 10px;
  margin-top: 8px;
  font-size: 12px;
  color: #374151;
}
.feedspace-file-thumb {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}
.feedspace-file-icon {
  font-size: 20px;
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
}
.feedspace-file-size {
  font-size: 10px;
  color: #9ca3af;
}
.feedspace-file-remove {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  flex-shrink: 0;
}
.feedspace-file-remove:hover {
  background: #fef2f2;
  color: #ef4444;
}
.feedspace-file-remove svg {
  width: 14px;
  height: 14px;
}

.feedspace-recording-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ef4444;
  font-size: 13px;
  font-weight: 500;
  padding: 10px 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 10px;
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
  color: #9ca3af;
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
}

.feedspace-filter-tabs {
  display: flex;
  gap: 4px;
  padding: 0 24px 12px;
  border-bottom: 1px solid #f3f4f6;
  overflow-x: auto;
}
.feedspace-filter-tab {
  padding: 6px 12px;
  border-radius: 8px;
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
  box-shadow: 0 2px 6px rgba(99, 102, 241, 0.25);
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

.feedspace-name-modal {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100000;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  animation: feedspace-fade-in 0.2s ease;
}
.feedspace-name-modal-card {
  background: #fff;
  border-radius: 20px;
  padding: 32px;
  width: 360px;
  max-width: 90vw;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.2);
  animation: feedspace-scale-in 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.feedspace-name-modal h3 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 4px;
  color: #111827;
  letter-spacing: -0.01em;
}
.feedspace-name-modal p {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 20px;
  line-height: 1.5;
}
.feedspace-name-modal input {
  width: 100%;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 15px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  margin-bottom: 16px;
  color: #1f2937;
}
.feedspace-name-modal input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}
.feedspace-name-modal input::placeholder {
  color: #9ca3af;
}
.feedspace-name-modal .actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.feedspace-name-modal .actions button {
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  font-family: inherit;
  transition: all 0.15s;
}
.feedspace-name-modal .actions .cancel {
  background: #f3f4f6;
  color: #374151;
}
.feedspace-name-modal .actions .cancel:hover {
  background: #e5e7eb;
}
.feedspace-name-modal .actions .confirm {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.25);
}
.feedspace-name-modal .actions .confirm:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.35);
}

.feedspace-hover-highlight {
  outline: 2px solid #6366f1 !important;
  outline-offset: 2px !important;
  border-radius: 2px;
  transition: outline 0.1s ease;
}

[data-feedspace-tool="pin"] { cursor: crosshair; }
`;

let injected = false;

export function injectStyles(): void {
  if (injected) return;
  const style = document.createElement('style');
  style.textContent = STYLES;
  document.head.appendChild(style);
  injected = true;
}
