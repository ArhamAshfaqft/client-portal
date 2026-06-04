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
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
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

.feedspace-hover-dashed {
  outline: 2px dashed #6366f1;
  outline-offset: 2px;
  border-radius: 2px;
}

[data-feedspace-tool="pin"] {
  cursor: crosshair;
}

/* ===== SIDEBAR CARD ENHANCEMENTS ===== */
.fs-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.fs-number-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  flex-shrink: 0;
  background: #2563eb;
}

.fs-device-pill {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 100px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  white-space: nowrap;
}
.fs-device-pill.desktop {
  background: rgba(37, 99, 235, 0.1);
  color: #2563eb;
}
.fs-device-pill.tablet {
  background: rgba(124, 58, 237, 0.1);
  color: #7c3aed;
}
.fs-device-pill.mobile {
  background: rgba(219, 39, 119, 0.1);
  color: #db2777;
}

.fs-tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 9px;
  font-weight: 800;
  padding: 1px 5px;
  border-radius: 3px;
  background: rgba(99, 102, 241, 0.13);
  color: #818cf8;
  font-family: monospace;
  letter-spacing: 0.3px;
  max-width: 130px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fs-dot-menu {
  animation: feedspace-fade-in 0.1s ease;
}
.fs-menu-item:hover {
  background: #f1f5f9;
}

.fs-reveal-btn:hover {
  color: #2563eb !important;
}

/* Device filter row */
.feedspace-device-filter {
  display: flex;
  gap: 4px;
  padding: 8px 16px;
  border-bottom: 1px solid #e2e8f0;
  align-items: center;
}
.fs-df-btn {
  font-family: 'Poppins', -apple-system, sans-serif;
}
.fs-df-btn:hover {
  opacity: 0.8;
}

/* Card highlight */
.feedspace-feedback-item.highlight {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
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
      this.deviceFilter = "all";
      this.projectFilter = "";
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
    setDeviceFilter(device) {
      this.deviceFilter = device;
      this.renderAll();
    }
    setProjectFilter(projectId) {
      this.projectFilter = projectId;
      this.renderAll();
    }
    setSelected(id) {
      this.selectedId = id;
      this.renderAll();
    }
    getFiltered() {
      let result = this.filter === "all" ? this.annotations : this.annotations.filter((a) => a.status === this.filter);
      if (this.deviceFilter && this.deviceFilter !== "all") {
        result = result.filter((a) => (a.device || "desktop") === this.deviceFilter);
      }
      if (this.projectFilter) {
        result = result.filter((a) => a.projectId === this.projectFilter);
      }
      return result;
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
      const num = index + 1;
      if (annotation.type === "rect") {
        const rect = el.getBoundingClientRect();
        const g2 = document.createElementNS("http://www.w3.org/2000/svg", "g");
        const box = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        box.setAttribute("x", String(rect.left + scrollX));
        box.setAttribute("y", String(rect.top + scrollY));
        box.setAttribute("width", String(rect.width));
        box.setAttribute("height", String(rect.height));
        box.setAttribute("fill", "rgba(99,102,241,0.08)");
        box.setAttribute("stroke", "#6366f1");
        box.setAttribute("stroke-width", "2");
        box.setAttribute("stroke-dasharray", "6,3");
        box.setAttribute("rx", "4");
        const badge2 = this.createBadge(num, annotation.id, annotation.status, "rect");
        badge2.setAttribute("transform", `translate(${rect.left + scrollX - 10}, ${rect.top + scrollY - 10})`);
        g2.appendChild(box);
        g2.appendChild(badge2);
        g2.style.pointerEvents = "auto";
        this.svg.appendChild(g2);
        return;
      }
      const anchor = toAbsolute(el, annotation.anchorXPct, annotation.anchorYPct);
      if (annotation.type === "arrow") {
        const g2 = document.createElementNS("http://www.w3.org/2000/svg", "g");
        const tailX = anchor.x - 80;
        const tailY = anchor.y - 80;
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", String(tailX));
        line.setAttribute("y1", String(tailY));
        line.setAttribute("x2", String(anchor.x));
        line.setAttribute("y2", String(anchor.y));
        line.setAttribute("stroke", "#6366f1");
        line.setAttribute("stroke-width", "2.5");
        line.setAttribute("marker-end", "url(#feedspace-arrowhead)");
        g2.appendChild(line);
        const badge2 = this.createBadge(num, annotation.id, annotation.status, "arrow");
        badge2.setAttribute("transform", `translate(${tailX - 10}, ${tailY - 10})`);
        g2.appendChild(badge2);
        g2.style.pointerEvents = "auto";
        this.svg.appendChild(g2);
        return;
      }
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      const badge = this.createBadge(num, annotation.id, annotation.status);
      badge.setAttribute("transform", `translate(${anchor.x - 10}, ${anchor.y - 10})`);
      g.appendChild(badge);
      g.style.pointerEvents = "auto";
      this.svg.appendChild(g);
    }
    createBadge(num, id, status, type) {
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("data-annotation-id", id);
      g.classList.add("feedspace-annotation-pin");
      g.style.cursor = "pointer";
      let color = "#6366f1";
      if (status === "resolved" || status === "closed") color = "#10b981";
      if (status === "in_progress") color = "#f59e0b";
      const shape = document.createElementNS("http://www.w3.org/2000/svg", type === "rect" ? "rect" : "circle");
      if (type === "rect") {
        shape.setAttribute("x", "1");
        shape.setAttribute("y", "1");
        shape.setAttribute("width", "18");
        shape.setAttribute("height", "18");
        shape.setAttribute("rx", "3");
      } else {
        shape.setAttribute("cx", "10");
        shape.setAttribute("cy", "10");
        shape.setAttribute("r", "10");
      }
      shape.setAttribute("fill", color);
      shape.setAttribute("stroke", "#fff");
      shape.setAttribute("stroke-width", "2");
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
      g.appendChild(shape);
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
  function escHtml(str) {
    const d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }
  function posPopup(anchorX, anchorY, w, h) {
    const pad = 12;
    let left = anchorX + pad;
    let top = anchorY + pad;
    if (left + w > window.innerWidth - pad) left = anchorX - w - pad;
    if (top + h > window.innerHeight - pad) top = anchorY - h - pad;
    if (left < pad) left = pad;
    if (top < pad) top = pad;
    return { top, left };
  }
  var SVG_ICONS = {
    mic: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>',
    paperclip: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>',
    file: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>',
    send: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
    close: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
  };
  var CommentPanel = class {
    constructor() {
      this.root = null;
      this.overlay = null;
      this.callbacks = null;
      this.annotation = null;
      this.files = [];
      this.inputEl = null;
      this.onClose = null;
      this.anchorX = 0;
      this.anchorY = 0;
    }
    open(anchorX, anchorY, annotation, callbacks, onClose) {
      this.anchorX = anchorX;
      this.anchorY = anchorY;
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
    addFile(file) {
      var _a;
      this.files.push(file);
      const previews = (_a = this.root) == null ? void 0 : _a.querySelector("#fs-popup-previews");
      if (previews) this.updatePreviews(previews);
    }
    updateRecordingState() {
      var _a;
      if (!this.root) return;
      const isRec = ((_a = this.callbacks) == null ? void 0 : _a.isRecording()) || false;
      const indicator = this.root.querySelector("#fs-popup-rec-indicator");
      const micBtn = this.root.querySelector("#fs-popup-mic-btn");
      if (indicator) indicator.style.display = isRec ? "flex" : "none";
      if (micBtn) micBtn.style.color = isRec ? "#ef4444" : "";
    }
    render() {
      this.close();
      const isNew = !this.annotation;
      this.overlay = document.createElement("div");
      this.overlay.style.cssText = "position:fixed;inset:0;z-index:99998;background:transparent;";
      this.overlay.addEventListener("click", () => this.close());
      document.body.appendChild(this.overlay);
      let bodyHtml = "";
      if (!isNew && this.annotation) {
        const initial = (this.annotation.createdBy || "A").charAt(0).toUpperCase();
        const dateStr = new Date(this.annotation.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        const statusLabels = { open: "Open", in_progress: "In Progress", resolved: "Resolved", closed: "Closed" };
        const statusLabel = statusLabels[this.annotation.status] || this.annotation.status;
        bodyHtml += `<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
        <div style="width:32px;height:32px;border-radius:50%;background:#2563eb;color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;flex-shrink:0;">${initial}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:13px;font-weight:600;color:#0f172a;">${escHtml(this.annotation.createdBy)}</div>
          <div style="font-size:10px;color:#94a3b8;">${dateStr}</div>
        </div>
        <span style="display:inline-flex;align-items:center;font-size:10px;font-weight:500;padding:2px 7px;border-radius:999px;background:rgba(37,99,235,0.1);color:#2563eb;">${statusLabel}</span>
      </div>`;
        bodyHtml += `<div style="font-size:13px;color:#334155;line-height:1.6;margin-bottom:12px;word-wrap:break-word;">${escHtml(this.annotation.content)}</div>`;
        if (this.annotation.replies && this.annotation.replies.length > 0) {
          for (const r of this.annotation.replies) {
            const rInit = (r.createdBy || "A").charAt(0).toUpperCase();
            const rDate = new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
            bodyHtml += `<div style="margin-top:8px;padding:10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
              <div style="width:24px;height:24px;border-radius:50%;background:#3b82f6;color:#fff;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:600;flex-shrink:0;">${rInit}</div>
              <div style="font-size:12px;font-weight:600;color:#0f172a;">${escHtml(r.createdBy)}</div>
              <div style="font-size:10px;color:#94a3b8;">${rDate}</div>
            </div>
            <div style="font-size:12px;color:#475569;line-height:1.5;">${escHtml(r.content)}</div>
          </div>`;
          }
          bodyHtml += `<div style="height:1px;background:#e2e8f0;margin:12px 0;"></div>`;
        }
      }
      bodyHtml += `<textarea id="fs-popup-input" placeholder="${isNew ? "Describe your feedback..." : "Write a reply..."}" style="display:block;width:100%;border:1px solid #e2e8f0;border-radius:8px;padding:10px 12px;font-size:13px;font-family:'Poppins',sans-serif;outline:none;resize:none;min-height:44px;max-height:100px;line-height:1.5;background:#fff;color:#0f172a;box-sizing:border-box;margin:0;"></textarea>`;
      bodyHtml += `<div style="display:flex;gap:4px;margin-top:8px;">
      <button id="fs-popup-mic-btn" style="display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border:1px solid #e2e8f0;border-radius:8px;background:#fff;cursor:pointer;color:#64748b;padding:0;line-height:1;flex-shrink:0;transition:all 0.15s;" title="Record voice">${SVG_ICONS.mic}</button>
      <button id="fs-popup-media-btn" style="display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border:1px solid #e2e8f0;border-radius:8px;background:#fff;cursor:pointer;color:#64748b;padding:0;line-height:1;flex-shrink:0;" title="Attach media">${SVG_ICONS.paperclip}</button>
      <button id="fs-popup-doc-btn" style="display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border:1px solid #e2e8f0;border-radius:8px;background:#fff;cursor:pointer;color:#64748b;padding:0;line-height:1;flex-shrink:0;" title="Attach document">${SVG_ICONS.file}</button>
    </div>`;
      bodyHtml += `<div id="fs-popup-previews" style="margin-top:8px;"></div>`;
      bodyHtml += `<div id="fs-popup-rec-indicator" style="display:none;align-items:center;gap:8px;color:#ef4444;font-size:12px;font-weight:500;padding:8px 10px;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;margin-top:8px;">
      <span style="width:6px;height:6px;border-radius:50%;background:#ef4444;flex-shrink:0;"></span>
      <span id="fs-popup-rec-time" style="font-variant-numeric:tabular-nums;">0:00</span>
      <button id="fs-popup-stop-rec" style="margin-left:auto;display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border:1px solid #ef4444;border-radius:6px;background:transparent;cursor:pointer;color:#ef4444;padding:0;line-height:1;flex-shrink:0;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
      </button>
    </div>`;
      bodyHtml += `<button id="fs-popup-submit" style="display:inline-flex;align-items:center;justify-content:center;gap:6px;width:100%;padding:9px 16px;border:none;border-radius:8px;background:#2563eb;color:#fff;font-size:13px;font-weight:600;cursor:pointer;font-family:'Poppins',sans-serif;line-height:1.4;margin-top:10px;transition:background 0.15s;">
      ${SVG_ICONS.send} ${isNew ? "Submit Feedback" : "Send Reply"}
    </button>`;
      bodyHtml += `<input type="file" id="fs-popup-media-input" multiple accept="image/*,video/*,audio/*" style="display:none;">`;
      bodyHtml += `<input type="file" id="fs-popup-doc-input" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.zip,.rar,.json,.xml,.md" style="display:none;">`;
      this.root = document.createElement("div");
      this.root.id = "fs-popup-root";
      this.root.style.cssText = "position:fixed;z-index:99999;background:#fff;border:1px solid #e2e8f0;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.12);padding:16px;width:340px;max-width:90vw;font-family:'Poppins',-apple-system,sans-serif;font-size:14px;line-height:1.5;color:#0f172a;";
      this.root.innerHTML = bodyHtml;
      document.body.appendChild(this.root);
      const pw = this.root.offsetWidth;
      const ph = this.root.offsetHeight;
      const pos = posPopup(this.anchorX, this.anchorY, pw, ph);
      this.root.style.top = pos.top + "px";
      this.root.style.left = pos.left + "px";
      this.inputEl = this.root.querySelector("#fs-popup-input");
      const micBtn = this.root.querySelector("#fs-popup-mic-btn");
      const mediaBtn = this.root.querySelector("#fs-popup-media-btn");
      const docBtn = this.root.querySelector("#fs-popup-doc-btn");
      const submitBtn = this.root.querySelector("#fs-popup-submit");
      const mediaInput = this.root.querySelector("#fs-popup-media-input");
      const docInput = this.root.querySelector("#fs-popup-doc-input");
      const previews = this.root.querySelector("#fs-popup-previews");
      const stopRecBtn = this.root.querySelector("#fs-popup-stop-rec");
      this.inputEl.focus();
      micBtn.addEventListener("click", () => {
        var _a;
        return (_a = this.callbacks) == null ? void 0 : _a.onToggleRecording();
      });
      mediaBtn.addEventListener("click", () => mediaInput.click());
      docBtn.addEventListener("click", () => docInput.click());
      stopRecBtn.addEventListener("click", () => {
        var _a;
        return (_a = this.callbacks) == null ? void 0 : _a.onToggleRecording();
      });
      submitBtn.addEventListener("click", () => this.handleSubmit());
      mediaInput.addEventListener("change", () => {
        const selected = Array.from(mediaInput.files || []);
        this.files = [...this.files, ...selected];
        this.updatePreviews(previews);
        mediaInput.value = "";
      });
      docInput.addEventListener("change", () => {
        const selected = Array.from(docInput.files || []);
        this.files = [...this.files, ...selected];
        this.updatePreviews(previews);
        docInput.value = "";
      });
      this.inputEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          this.handleSubmit();
        }
      });
      this.updateRecordingState();
    }
    updatePreviews(container) {
      var _a;
      container.innerHTML = "";
      for (let i = 0; i < this.files.length; i++) {
        const f = this.files[i];
        const url = URL.createObjectURL(f);
        let inner = "";
        if (f.type.startsWith("image/")) {
          inner = `<img src="${url}" style="width:36px;height:36px;border-radius:6px;object-fit:cover;flex-shrink:0;">`;
        } else if (f.type.startsWith("audio/")) {
          inner = `<audio controls style="flex:1;height:32px;min-width:0;" src="${url}" preload="metadata"></audio>`;
        } else if (f.type.startsWith("video/")) {
          inner = `<video controls style="flex:1;height:36px;min-width:0;border-radius:4px;" src="${url}" preload="metadata"></video>`;
        } else {
          const ext = ((_a = f.name.split(".").pop()) == null ? void 0 : _a.toUpperCase()) || "FILE";
          inner = `<span style="font-size:9px;font-weight:700;color:#94a3b8;flex-shrink:0;">${ext}</span>`;
        }
        const div = document.createElement("div");
        div.style.cssText = "display:flex;align-items:center;gap:8px;padding:6px 8px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-top:6px;";
        div.innerHTML = inner + `<span style="flex:1;font-size:11px;color:#334155;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;">${escHtml(f.name)}</span><button class="fs-preview-remove" data-idx="${i}" style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border:none;border-radius:4px;background:transparent;cursor:pointer;color:#94a3b8;padding:0;flex-shrink:0;">${SVG_ICONS.close}</button>`;
        container.appendChild(div);
        div.querySelector(".fs-preview-remove").addEventListener("click", () => {
          URL.revokeObjectURL(url);
          this.files.splice(i, 1);
          this.updatePreviews(container);
        });
      }
    }
    handleSubmit() {
      var _a, _b, _c;
      const content = ((_a = this.inputEl) == null ? void 0 : _a.value.trim()) || "";
      if (!content && this.files.length === 0) return;
      (_b = this.callbacks) == null ? void 0 : _b.onSubmit(content, this.files);
      if (this.inputEl) this.inputEl.value = "";
      this.files = [];
      const previews = (_c = this.root) == null ? void 0 : _c.querySelector("#fs-popup-previews");
      if (previews) previews.innerHTML = "";
    }
  };

  // src/widget/feedback-list.ts
  function timeAgo(date) {
    if (!date) return "";
    let iso = date.trim();
    const hasTz = /[zZ]$/.test(iso) || /[+-]\d{2}:?\d{2}$/.test(iso);
    if (!hasTz) {
      iso = iso.replace(" ", "T") + "Z";
    } else if (iso.includes(" ") && !iso.includes("T")) {
      iso = iso.replace(" ", "T");
    }
    const t = new Date(iso).getTime();
    if (isNaN(t)) return "";
    const s = Math.floor((Date.now() - t) / 1e3);
    if (s < 0) return "Just now";
    const ints = [[31536e3, "y"], [2592e3, "mo"], [86400, "d"], [3600, "h"], [60, "m"]];
    for (const [sec, l] of ints) {
      const v = s / sec;
      if (v > 1) return Math.floor(v) + l + " ago";
    }
    return "Just now";
  }
  function escHtml2(str) {
    const d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }
  function lightbox(atts, start, onSave) {
    document.querySelectorAll(".fs-lb").forEach((el) => el.remove());
    let cur = start;
    const ov = document.createElement("div");
    ov.className = "fs-lb";
    ov.style.cssText = "position:fixed;inset:0;z-index:999999;background:rgba(0,0,0,0.94);display:flex;flex-direction:column;";
    function formatSize(bytes) {
      if (!bytes || bytes === 0) return "";
      const units = ["B", "KB", "MB", "GB"];
      let i = 0, s = bytes;
      while (s >= 1024 && i < 3) {
        s /= 1024;
        i++;
      }
      return s.toFixed(i > 0 ? 1 : 0) + " " + units[i];
    }
    const render = () => {
      var _a;
      const a = atts[cur];
      const ext = ((_a = (a.name || "").split(".").pop()) == null ? void 0 : _a.toUpperCase()) || "";
      let c = "";
      if (a.type.startsWith("image/")) {
        c = `<img src="${escHtml2(a.url)}" style="max-width:100%;max-height:100%;object-fit:contain;border-radius:4px;">`;
      } else if (a.type.startsWith("video/")) {
        c = `<video controls style="max-width:100%;max-height:100%;border-radius:4px;" src="${escHtml2(a.url)}" preload="metadata"></video>`;
      } else if (a.type.startsWith("audio/")) {
        c = `<div style="display:flex;flex-direction:column;align-items:center;gap:24px;padding:20px;"><div style="width:48px;height:48px;color:rgba(255,255,255,0.3);">${SVG_ICONS2.music}</div><div style="font-size:14px;color:rgba(255,255,255,0.5);">${escHtml2(a.name || "Audio")}</div><audio controls style="width:420px;max-width:85vw;" src="${escHtml2(a.url)}" preload="metadata"></audio></div>`;
      } else {
        c = `<div style="display:flex;flex-direction:column;align-items:center;gap:20px;padding:20px;"><div style="width:80px;height:80px;border-radius:12px;background:rgba(255,255,255,0.04);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;color:rgba(255,255,255,0.5);border:1px solid rgba(255,255,255,0.08);">${escHtml2(ext)}</div><a href="${escHtml2(a.url)}" target="_blank" style="color:#818cf8;font-size:14px;text-decoration:none;font-weight:600;">${escHtml2(a.name || "Download")}</a></div>`;
      }
      const pag = atts.length > 1 ? `<span style="color:rgba(255,255,255,0.35);font-size:12px;">${cur + 1} / ${atts.length}</span>` : "";
      ov.innerHTML = `<button class="fs-lb-close" style="position:fixed;top:14px;right:14px;width:34px;height:34px;border-radius:50%;border:none;background:rgba(255,255,255,0.08);color:#fff;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:10;">&times;</button>` + (atts.length > 1 ? `<button class="fs-lb-prev" style="position:fixed;left:14px;top:50%;transform:translateY(-50%);width:38px;height:38px;border-radius:50%;border:none;background:rgba(255,255,255,0.08);color:#fff;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:10;">\u2039</button>` : "") + (atts.length > 1 ? `<button class="fs-lb-next" style="position:fixed;right:14px;top:50%;transform:translateY(-50%);width:38px;height:38px;border-radius:50%;border:none;background:rgba(255,255,255,0.08);color:#fff;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:10;">\u203A</button>` : "") + `<div class="fs-lb-content" style="flex:1;display:flex;align-items:center;justify-content:center;padding:70px 70px 80px;overflow:hidden;">${c}</div><div style="position:fixed;bottom:0;left:0;right:0;height:52px;background:rgba(0,0,0,0.7);backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:space-between;padding:0 20px;z-index:10;border-top:1px solid rgba(255,255,255,0.06);"><div style="display:flex;align-items:center;gap:10px;flex:1;min-width:0;"><span style="color:rgba(255,255,255,0.85);font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escHtml2(a.name || "")}</span>${a.size ? `<span style="color:rgba(255,255,255,0.35);font-size:11px;">${formatSize(a.size)}</span>` : ""}<span style="background:rgba(255,255,255,0.08);padding:1px 7px;border-radius:4px;color:rgba(255,255,255,0.5);font-size:10px;font-weight:700;">${escHtml2(ext.substring(0, 6))}</span></div><div style="display:flex;align-items:center;gap:12px;">${pag}${onSave ? `<button class="fs-lb-send" data-url="${escHtml2(a.url)}" style="padding:6px 14px;border-radius:6px;border:none;background:rgba(99,102,241,0.8);color:#fff;font-size:12px;font-weight:600;cursor:pointer;">Save to Media</button>` : ""}<a href="${escHtml2(a.url)}" download style="text-decoration:none;padding:6px 14px;border-radius:6px;background:#6366f1;color:#fff;font-size:12px;font-weight:600;">Download</a></div></div>`;
    };
    render();
    document.body.appendChild(ov);
    ov.addEventListener("click", (e) => {
      const t = e.target;
      if (t.classList.contains("fs-lb-close")) ov.remove();
      else if (t.classList.contains("fs-lb-prev") && cur > 0) {
        cur--;
        render();
      } else if (t.classList.contains("fs-lb-next") && cur < atts.length - 1) {
        cur++;
        render();
      } else if (t.classList.contains("fs-lb-send") && onSave) {
        const btn = t;
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<span style="display:inline-block;width:12px;height:12px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:fs-spin 0.6s linear infinite;"></span>';
        btn.disabled = true;
        onSave(atts[cur].url).then((ok) => {
          if (ok) {
            btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>';
            btn.title = "Saved to Media Library";
          } else {
            btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
            btn.title = "Save failed";
          }
          setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.disabled = false;
            btn.title = "Save to Media Library";
          }, 2500);
        });
      } else if (t === ov) ov.remove();
    });
    const kd = (e) => {
      if (!document.body.contains(ov)) {
        document.removeEventListener("keydown", kd);
        return;
      }
      if (e.key === "Escape") ov.remove();
      if (e.key === "ArrowLeft" && cur > 0) {
        cur--;
        render();
        e.preventDefault();
      }
      if (e.key === "ArrowRight" && cur < atts.length - 1) {
        cur++;
        render();
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", kd);
  }
  var SVG_ICONS2 = {
    mic: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15 8a5 5 0 0 1 0 8"/></svg>',
    desktop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
    tablet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="2" width="18" height="20" rx="2"/><circle cx="12" cy="18.5" r="1.2" fill="currentColor" stroke="none"/></svg>',
    mobile: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="2" width="12" height="20" rx="2"/><circle cx="12" cy="18.5" r="1.2" fill="currentColor" stroke="none"/></svg>',
    file: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>',
    music: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
    play: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>'
  };
  var FeedbackListPanel = class {
    constructor() {
      this.root = null;
      this.overlay = null;
      this.callbacks = null;
      this.annotations = [];
      this.currentFilter = "all";
      this.currentDeviceFilter = "all";
      this.currentSort = "newest";
      this.currentProjectFilter = "";
      this.onClose = null;
      this.siteName = "";
      this._closeProjectMenu = null;
    }
    get distinctProjects() {
      const seen = /* @__PURE__ */ new Set();
      const out = [];
      for (const a of this.annotations) {
        const pid = a.projectId;
        if (pid && !seen.has(pid)) {
          seen.add(pid);
          const name = a.projectName || "Session #" + pid.slice(0, 8);
          out.push({ id: pid, title: name });
        }
      }
      return out;
    }
    open(annotations, callbacks, onClose, siteName, defaultProjectId) {
      var _a, _b;
      this.annotations = annotations;
      this.callbacks = callbacks;
      this.onClose = onClose;
      if (siteName) this.siteName = siteName;
      try {
        const v = localStorage.getItem("fs_project_filter");
        if (v && this.distinctProjects.some((p) => p.id === v)) {
          this.currentProjectFilter = v;
        } else if (defaultProjectId && this.distinctProjects.some((p) => p.id === defaultProjectId)) {
          this.currentProjectFilter = defaultProjectId;
        } else {
          this.currentProjectFilter = "";
        }
        (_b = (_a = this.callbacks) == null ? void 0 : _a.onProjectFilterChange) == null ? void 0 : _b.call(_a, this.currentProjectFilter);
      } catch (e) {
      }
      this.render();
    }
    isOpen() {
      return this.root !== null;
    }
    close() {
      const m = document.getElementById("fs-project-menu");
      if (m) m.remove();
      if (this._closeProjectMenu) this._closeProjectMenu();
      if (this.overlay && this.overlay.parentNode) this.overlay.parentNode.removeChild(this.overlay);
      if (this.root && this.root.parentNode) this.root.parentNode.removeChild(this.root);
      document.querySelectorAll(".fs-lb").forEach((el) => el.remove());
      this.overlay = null;
      this.root = null;
    }
    updateAnnotations(annotations) {
      this.annotations = annotations;
      if (this.root) {
        const sessBtn = this.root.querySelector("#fs-session-btn");
        if (sessBtn) {
          if (this.distinctProjects.length > 0) {
            sessBtn.style.display = "flex";
            const ap = this.distinctProjects.find((p) => p.id === this.currentProjectFilter);
            if (ap) sessBtn.title = ap.title;
          } else {
            sessBtn.style.display = "none";
          }
        }
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
      const activeProject = this.distinctProjects.find((p) => p.id === this.currentProjectFilter);
      header.innerHTML = `
      <span class="feedspace-panel-title">Feedback List</span>
      <button class="fs-session-btn" id="fs-session-btn" title="Filter by session" style="display:none;align-items:center;justify-content:center;width:26px;height:26px;border-radius:6px;border:1px solid #e2e8f0;background:transparent;color:#64748b;cursor:pointer;padding:0;margin-right:auto;margin-left:8px;flex-shrink:0;">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
      </button>
      <button class="feedspace-panel-close" id="feedback-list-close">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    `;
      this.root.appendChild(header);
      header.querySelector("#feedback-list-close").addEventListener("click", () => this.close());
      const sessBtn = header.querySelector("#fs-session-btn");
      if (this.distinctProjects.length > 0) {
        sessBtn.style.display = "flex";
        if (activeProject) sessBtn.title = activeProject.title;
      }
      sessBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.showProjectFilterMenu(sessBtn);
      });
      const filters = document.createElement("div");
      filters.className = "feedspace-filter-tabs";
      const filterOptions = [
        { value: "all", label: "All" },
        { value: "pending", label: "Pending" },
        { value: "resolved", label: "Resolved" }
      ];
      const filtersRoot = filters;
      for (const opt of filterOptions) {
        const btn = document.createElement("button");
        btn.className = `feedspace-filter-tab${this.currentFilter === opt.value ? " active" : ""}`;
        btn.textContent = opt.label;
        btn.dataset.filter = opt.value;
        btn.addEventListener("click", () => {
          var _a;
          this.currentFilter = opt.value;
          filtersRoot.querySelectorAll(".feedspace-filter-tab").forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          (_a = this.callbacks) == null ? void 0 : _a.onFilterChange(opt.value);
          this.renderList();
        });
        filters.appendChild(btn);
      }
      this.root.appendChild(filters);
      const deviceRow = document.createElement("div");
      deviceRow.className = "feedspace-device-filter";
      const deviceIcons = { desktop: SVG_ICONS2.desktop, tablet: SVG_ICONS2.tablet, mobile: SVG_ICONS2.mobile };
      const deviceBtnHtml = (dv, label) => {
        const active = dv === this.currentDeviceFilter;
        const icon = dv !== "all" ? `<span style="width:12px;height:12px;display:inline-flex;align-items:center;">${deviceIcons[dv] || ""}</span>` : "";
        return `<button class="fs-df-btn${active ? " active" : ""}" data-device="${dv}" style="flex:1;display:inline-flex;align-items:center;justify-content:center;gap:4px;padding:5px 4px;border:none;border-radius:6px;cursor:pointer;font-size:11px;font-weight:600;transition:all 0.2s;background:${active ? "#2563eb" : "transparent"};color:${active ? "#fff" : "#64748b"};">${icon}${label} <span class="fs-df-count" style="background:${active ? "rgba(255,255,255,0.2)" : "#f1f5f9"};border-radius:10px;padding:0 5px;font-size:10px;line-height:18px;">0</span></button>`;
      };
      deviceRow.innerHTML = deviceBtnHtml("all", "All") + deviceBtnHtml("desktop", "Desktop") + deviceBtnHtml("tablet", "Tablet") + deviceBtnHtml("mobile", "Mobile") + `<button class="fs-sort-btn" title="${this.currentSort === "newest" ? "Newest first" : "Oldest first"}" style="flex:0 0 26px;display:flex;align-items:center;justify-content:center;border:none;border-radius:4px;background:transparent;color:#94a3b8;cursor:pointer;font-size:9px;font-weight:700;padding:0;">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
      </button>`;
      this.root.appendChild(deviceRow);
      const body = document.createElement("div");
      body.className = "feedspace-panel-body";
      body.id = "feedback-list-body";
      this.root.appendChild(body);
      document.body.appendChild(this.root);
      deviceRow.querySelectorAll(".fs-df-btn").forEach((el) => {
        const btn = el;
        btn.addEventListener("click", () => {
          var _a;
          deviceRow.querySelectorAll(".fs-df-btn").forEach((e) => {
            const b = e;
            b.classList.remove("active");
            b.style.background = "transparent";
            b.style.color = "#64748b";
          });
          btn.classList.add("active");
          btn.style.background = "#2563eb";
          btn.style.color = "#fff";
          this.currentDeviceFilter = btn.dataset.device || "all";
          (_a = this.callbacks) == null ? void 0 : _a.onDeviceFilterChange(this.currentDeviceFilter);
          this.renderList();
        });
      });
      const sortBtn = deviceRow.querySelector(".fs-sort-btn");
      sortBtn.addEventListener("click", () => {
        this.currentSort = this.currentSort === "newest" ? "oldest" : "newest";
        sortBtn.title = this.currentSort === "newest" ? "Newest first" : "Oldest first";
        this.renderList();
      });
      this.renderList();
    }
    showProjectFilterMenu(btn) {
      const existing = document.getElementById("fs-project-menu");
      if (existing) {
        existing.remove();
        if (this._closeProjectMenu) this._closeProjectMenu();
        return;
      }
      const menu = document.createElement("div");
      menu.id = "fs-project-menu";
      const rect = btn.getBoundingClientRect();
      menu.style.cssText = "position:fixed;left:" + Math.max(10, rect.left - 160) + "px;top:" + (rect.bottom + 4) + "px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;z-index:2147483647;min-width:170px;padding:4px;box-shadow:0 4px 12px rgba(0,0,0,0.1);";
      const addItem = (label, value) => {
        const isActive = String(this.currentProjectFilter) === String(value);
        const item = document.createElement("div");
        item.dataset.value = value;
        item.style.cssText = "padding:7px 12px;display:flex;align-items:center;gap:8px;font-size:12px;font-weight:500;cursor:pointer;border-radius:5px;color:" + (isActive ? "#fff!important;background:#2563eb;" : "#334155!important;");
        item.innerHTML = (isActive ? '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="flex-shrink:0;"><polyline points="20 6 9 17 4 12"/></svg>' : "") + label;
        item.addEventListener("mouseenter", () => {
          if (!isActive) item.style.background = "#f1f5f9";
        });
        item.addEventListener("mouseleave", () => {
          if (!isActive) item.style.background = "transparent";
        });
        item.addEventListener("click", (e) => {
          var _a, _b;
          e.stopPropagation();
          menu.remove();
          if (this._closeProjectMenu) this._closeProjectMenu();
          this.currentProjectFilter = value;
          btn.title = value ? label : "Filter by session";
          try {
            localStorage.setItem("fs_project_filter", this.currentProjectFilter);
          } catch (e2) {
          }
          this.renderList();
          (_b = (_a = this.callbacks) == null ? void 0 : _a.onProjectFilterChange) == null ? void 0 : _b.call(_a, value);
        });
        menu.appendChild(item);
      };
      addItem("All sessions", "");
      for (const p of this.distinctProjects) addItem(p.title, p.id);
      document.body.appendChild(menu);
      const handler = (e) => {
        if (!menu.contains(e.target) && e.target !== btn) {
          menu.remove();
          document.removeEventListener("click", handler);
        }
      };
      if (this._closeProjectMenu) this._closeProjectMenu();
      this._closeProjectMenu = () => document.removeEventListener("click", handler);
      setTimeout(() => document.addEventListener("click", handler), 10);
    }
    renderList() {
      var _a, _b, _c;
      const body = (_a = this.root) == null ? void 0 : _a.querySelector("#feedback-list-body");
      if (!body) return;
      body.innerHTML = "";
      if (this.currentProjectFilter) {
        const projects = this.distinctProjects;
        if (!projects.find((p) => p.id === this.currentProjectFilter)) {
          this.currentProjectFilter = "";
          try {
            localStorage.removeItem("fs_project_filter");
          } catch (e) {
          }
          const sessBtn = (_b = this.root) == null ? void 0 : _b.querySelector("#fs-session-btn");
          if (sessBtn) sessBtn.title = "Filter by session";
        }
      }
      let filtered = this.currentFilter === "all" ? this.annotations : this.currentFilter === "pending" ? this.annotations.filter((a) => a.status === "open" || a.status === "in_progress") : this.annotations.filter((a) => a.status === this.currentFilter);
      if (this.currentProjectFilter) {
        filtered = filtered.filter((a) => String(a.projectId) === this.currentProjectFilter);
      }
      if (this.currentDeviceFilter && this.currentDeviceFilter !== "all") {
        filtered = filtered.filter((a) => (a.device || "desktop") === this.currentDeviceFilter);
      }
      const deviceCounts = { all: 0, desktop: 0, tablet: 0, mobile: 0 };
      let baseForCounts = this.currentFilter === "all" ? this.annotations : this.currentFilter === "pending" ? this.annotations.filter((a) => a.status === "open" || a.status === "in_progress") : this.annotations.filter((a) => a.status === this.currentFilter);
      if (this.currentProjectFilter) {
        baseForCounts = baseForCounts.filter((a) => String(a.projectId) === this.currentProjectFilter);
      }
      baseForCounts.forEach((a) => {
        deviceCounts.all++;
        const d = a.device || "desktop";
        if (deviceCounts[d] !== void 0) deviceCounts[d]++;
      });
      const deviceRow = (_c = this.root) == null ? void 0 : _c.querySelector(".feedspace-device-filter");
      if (deviceRow) {
        deviceRow.querySelectorAll(".fs-df-btn").forEach((btn) => {
          const dv = btn.dataset.device || "all";
          const countEl = btn.querySelector(".fs-df-count");
          if (countEl) countEl.textContent = String(deviceCounts[dv] || 0);
        });
      }
      filtered.sort((a, b) => {
        const ta = new Date(a.createdAt).getTime();
        const tb = new Date(b.createdAt).getTime();
        return this.currentSort === "newest" ? tb - ta : ta - tb;
      });
      if (filtered.length === 0) {
        body.innerHTML = `<div class="feedspace-empty-state"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg><p>No feedback items yet</p></div>`;
        return;
      }
      const statusLabels = { open: "Pending", in_progress: "Pending", resolved: "Resolved", closed: "Closed" };
      const html = filtered.map((a, idx) => {
        var _a2, _b2, _c2;
        const initial = (a.createdBy || "A").charAt(0).toUpperCase();
        const timeStr = timeAgo(a.createdAt);
        const replyCount = ((_a2 = a.replies) == null ? void 0 : _a2.length) || 0;
        const d = a.device || "desktop";
        let comment = a.content;
        if (!comment && a.media && a.media.length > 0) {
          const hasAudio = a.media.some((m) => m.fileType.startsWith("audio/"));
          const hasVideo = a.media.some((m) => m.fileType.startsWith("video/"));
          const hasImage = a.media.some((m) => m.fileType.startsWith("image/"));
          if (hasAudio) comment = "Voice note";
          else if (hasVideo) comment = "Video note";
          else if (hasImage) comment = "Image feedback";
          else comment = "Attachment";
        }
        if (!comment) comment = "No comment";
        const needsReadMore = comment.length > 160;
        const shortComment = needsReadMore ? comment.slice(0, 157) + "..." : comment;
        let mediaHtml = "";
        if (a.media && a.media.length > 0) {
          const items = a.media.map((m, mi) => {
            var _a3;
            const ext = ((_a3 = (m.fileName || m.fileUrl).split(".").pop()) == null ? void 0 : _a3.toUpperCase()) || "";
            let inner = "";
            if (m.fileType.startsWith("image/")) {
              inner = `<img src="${escHtml2(m.fileUrl)}" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block;" alt="">`;
            } else if (m.fileType.startsWith("video/")) {
              inner = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:12px;color:#94a3b8;">\u25B6</div>`;
            } else if (m.fileType.startsWith("audio/")) {
              inner = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;">${SVG_ICONS2.mic}</div>`;
            } else {
              inner = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#94a3b8;">${escHtml2(ext.substring(0, 4))}</div>`;
            }
            return `<div class="fs-att-thumb" data-index="${mi}" style="flex-shrink:0;width:44px;height:44px;border-radius:6px;overflow:hidden;border:1px solid #e2e8f0;cursor:pointer;position:relative;background:#f8fafc;">${inner}</div>`;
          }).join("");
          mediaHtml = `<div class="fs-att-strip" style="display:flex;gap:4px;overflow-x:auto;padding:4px 0 2px;margin-top:8px;scrollbar-width:thin;">${items}</div>`;
        }
        const tag = ((_b2 = a.elementDna) == null ? void 0 : _b2.tag) || "";
        const tagText = (((_c2 = a.elementDna) == null ? void 0 : _c2.text) || "").slice(0, 22);
        const skipTags = ["div", "section", "article", "main", "aside", "figure", "header", "footer"];
        let tagChip = "";
        if (tag && !skipTags.includes(tag.toLowerCase())) {
          tagChip = `<span class="fs-tag-chip">${escHtml2(tag.toUpperCase())}${tagText ? " " + escHtml2(tagText) : ""}</span>`;
        }
        return `<div class="feedspace-feedback-item" data-id="${a.id}" data-idx="${idx}">
        <div class="fs-card-header">
          <div style="display:flex;align-items:center;gap:8px;min-width:0;">
            <span class="fs-number-badge">${a._num || idx + 1}</span>
            <span class="fs-device-pill ${d}">${d.charAt(0).toUpperCase() + d.slice(1)}</span>
            ${tagChip}
          </div>
          <div class="fs-dots-trigger" style="padding:4px;cursor:pointer;opacity:0.4;flex-shrink:0;line-height:1;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;margin-top:10px;">
          <div class="feedspace-avatar-sm" style="width:28px;height:28px;font-size:11px;">${initial}</div>
          <div style="min-width:0;flex:1;">
            <div class="feedspace-feedback-author" style="font-size:13px;">${escHtml2(a.createdBy)}</div>
            <div style="font-size:10px;color:#94a3b8;">${timeStr}</div>
          </div>
          <span class="feedspace-feedback-status ${a.status}" style="font-size:10px;">${statusLabels[a.status] || a.status}</span>
        </div>
        <div class="feedspace-feedback-content" style="margin-top:8px;font-size:13px;">
          <span class="fs-comment-text">${escHtml2(needsReadMore ? shortComment : comment)}</span>
          ${needsReadMore ? `<button class="fs-read-more" style="background:none;border:none;color:#2563eb;cursor:pointer;font-size:12px;font-weight:600;padding:0;margin-left:4px;">Read More</button>` : ""}
        </div>
        ${mediaHtml}
        <div style="display:flex;align-items:center;gap:12px;margin-top:10px;">
          ${a.elementDna && a.type === "pin" ? `<button class="fs-reveal-btn" data-id="${a.id}" style="display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:500;color:#94a3b8;background:none;border:none;cursor:pointer;padding:0;"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>Reveal</button>` : ""}
          ${replyCount > 0 ? `<span style="display:flex;align-items:center;gap:4px;font-size:11px;color:#94a3b8;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> ${replyCount}</span>` : ""}
          <span style="flex:1"></span>
          ${a.status === "resolved" ? `<button class="fs-reopen-btn" data-id="${a.id}" style="display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:600;color:#64748b;background:#f1f5f9;border:none;border-radius:6px;cursor:pointer;padding:3px 8px;"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>Reopen</button>` : `<button class="fs-resolve-btn" data-id="${a.id}" style="display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:600;color:#059669;background:#ecfdf5;border:none;border-radius:6px;cursor:pointer;padding:3px 8px;"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>Resolve</button>`}
        </div>
      </div>`;
      }).join("");
      body.innerHTML = html;
      body.querySelectorAll(".feedspace-feedback-item").forEach((item) => {
        item.addEventListener("click", (e) => {
          var _a2;
          if (e.target.closest(".fs-dots-trigger, .fs-dot-menu, .fs-reveal-btn, .fs-read-more, .fs-att-thumb")) return;
          const id = item.dataset.id;
          body.querySelectorAll(".feedspace-feedback-item").forEach((el) => el.classList.remove("highlight"));
          item.classList.add("highlight");
          if (id) (_a2 = this.callbacks) == null ? void 0 : _a2.onSelectAnnotation(id);
        });
      });
      body.querySelectorAll(".fs-read-more").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          var _a2;
          e.stopPropagation();
          const parent = e.target.closest(".feedspace-feedback-content");
          if (!parent) return;
          const textEl = parent.querySelector(".fs-comment-text");
          if (!textEl) return;
          const full = e.target.dataset.fullText || textEl.textContent || "";
          if (e.target.textContent === "Read More") {
            e.target.dataset.fullText = textEl.textContent || "";
            textEl.textContent = full;
            e.target.textContent = "Show Less";
          } else {
            textEl.textContent = ((_a2 = e.target.dataset.fullText) == null ? void 0 : _a2.slice(0, 157)) + "...";
            e.target.textContent = "Read More";
          }
        });
      });
      body.querySelectorAll(".fs-reveal-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          var _a2;
          e.stopPropagation();
          const id = e.target.dataset.id;
          if (id) (_a2 = this.callbacks) == null ? void 0 : _a2.onSelectAnnotation(id);
        });
      });
      body.querySelectorAll(".fs-resolve-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          var _a2;
          e.stopPropagation();
          const id = e.currentTarget.dataset.id;
          if (id) (_a2 = this.callbacks) == null ? void 0 : _a2.onStatusChange(id, "resolved");
        });
      });
      body.querySelectorAll(".fs-reopen-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          var _a2;
          e.stopPropagation();
          const id = e.currentTarget.dataset.id;
          if (id) (_a2 = this.callbacks) == null ? void 0 : _a2.onStatusChange(id, "open");
        });
      });
      body.querySelectorAll(".fs-dots-trigger").forEach((trigger) => {
        trigger.addEventListener("click", (e) => {
          e.stopPropagation();
          document.querySelectorAll(".fs-dot-menu").forEach((m) => m.remove());
          const item = e.target.closest(".feedspace-feedback-item");
          const id = item == null ? void 0 : item.dataset.id;
          const menu = document.createElement("div");
          menu.className = "fs-dot-menu";
          menu.style.cssText = "position:absolute;top:36px;right:8px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;box-shadow:0 10px 30px rgba(0,0,0,0.12);z-index:100;width:130px;overflow:hidden;padding:4px;";
          menu.innerHTML = `<div class="fs-menu-item" data-action="locate" style="padding:8px 10px;display:flex;align-items:center;gap:8px;font-size:12px;font-weight:600;cursor:pointer;border-radius:6px;color:#334155;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <span>Locate</span>
          </div>
          <div class="fs-menu-item" data-action="delete" style="padding:8px 10px;display:flex;align-items:center;gap:8px;font-size:12px;font-weight:600;cursor:pointer;border-radius:6px;color:#ef4444;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            <span>Delete</span>
          </div>`;
          item.style.position = "relative";
          item.appendChild(menu);
          setTimeout(() => {
            const close = (ev) => {
              if (!menu.contains(ev.target)) {
                menu.remove();
                document.removeEventListener("click", close);
              }
            };
            document.addEventListener("click", close);
          }, 10);
          menu.querySelectorAll(".fs-menu-item").forEach((el) => {
            el.addEventListener("click", (ev) => {
              var _a2, _b2;
              ev.stopPropagation();
              const action = ev.currentTarget.dataset.action;
              menu.remove();
              if (action === "locate" && id) (_a2 = this.callbacks) == null ? void 0 : _a2.onSelectAnnotation(id);
              if (action === "delete" && id && confirm("Delete this annotation?")) (_b2 = this.callbacks) == null ? void 0 : _b2.onDeleteAnnotation(id);
            });
          });
        });
      });
      body.querySelectorAll(".fs-att-thumb").forEach((thumb) => {
        thumb.addEventListener("click", (e) => {
          var _a2;
          e.stopPropagation();
          const item = e.target.closest(".feedspace-feedback-item");
          const id = item == null ? void 0 : item.dataset.id;
          if (!id) return;
          const a = this.annotations.find((ann) => ann.id === id);
          if (!a || !a.media || !a.media.length) return;
          const atts = a.media.map((m) => ({ url: m.fileUrl, type: m.fileType, name: m.fileName, size: 0 }));
          const idx = parseInt(thumb.dataset.index || "0");
          lightbox(atts, idx, ((_a2 = this.callbacks) == null ? void 0 : _a2.onSaveToLibrary) ? (url) => this.callbacks.onSaveToLibrary(url, "") : void 0);
        });
      });
    }
  };

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
  var SVG_ICONS3 = {
    select: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3l14 8-7 2-3 7z"/></svg>',
    pin: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>',
    arrow: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="19" x2="19" y2="5"/><polyline points="12 5 19 5 19 12"/></svg>',
    rect: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>',
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
      this.arrowPreviewEl = null;
      this.pendingAnnotationEl = null;
      this.projectNameCache = {};
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
      const dev = !!this.config.devMode;
      this.toolbarRoot = document.createElement("div");
      this.toolbarRoot.id = "feedspace-widget-root";
      this.toolbarRoot.innerHTML = `
      <div class="feedspace-toolbar">
        ${dev ? "" : `<button class="feedspace-tool-btn active" data-tool="select" title="Select">${SVG_ICONS3.select}</button>
        <button class="feedspace-tool-btn" data-tool="pin" title="Add Pin">${SVG_ICONS3.pin}</button>
        <button class="feedspace-tool-btn" data-tool="arrow" title="Add Arrow">${SVG_ICONS3.arrow}</button>
        <button class="feedspace-tool-btn" data-tool="rect" title="Add Rectangle">${SVG_ICONS3.rect}</button>
        <div class="feedspace-toolbar-divider"></div>`}
        <button class="feedspace-tool-btn" data-action="list" title="Feedback List" id="feedspace-list-btn">
          ${SVG_ICONS3.list}
          <span class="badge" id="feedspace-list-count" style="display:none">0</span>
        </button>
        ${dev ? "" : `<div class="feedspace-toolbar-divider"></div>
        <button class="feedspace-submit-btn" data-action="submit" title="Finish reviewing">
          ${SVG_ICONS3.submit}
          Finish Review
        </button>`}
      </div>
    `;
      document.body.appendChild(this.toolbarRoot);
      if (!dev) {
        this.toolbarRoot.querySelectorAll("[data-tool]").forEach((btn) => {
          btn.addEventListener("click", () => this.setTool(btn.getAttribute("data-tool")));
        });
        this.toolbarRoot.querySelectorAll("[data-device]").forEach((btn) => {
          btn.addEventListener("click", () => this.setDevice(btn.getAttribute("data-device")));
        });
      }
      (_a = this.toolbarRoot.querySelector('[data-action="list"]')) == null ? void 0 : _a.addEventListener("click", () => {
        if (this.feedbackList.isOpen()) {
          this.feedbackList.close();
          return;
        }
        this.feedbackList.open(this.annotations, {
          onSelectAnnotation: (id) => this.focusAnnotation(id),
          onFilterChange: (filter) => {
            this.filterMode = filter;
            this.renderer.setFilter(filter);
          },
          onProjectFilterChange: (projectId) => {
            this.renderer.setProjectFilter(projectId);
          },
          onDeleteAnnotation: (id) => this.deleteAnnotation(id),
          onDeviceFilterChange: (device) => {
            this.renderer.setDeviceFilter(device);
          },
          onStatusChange: (id, status) => this.changeAnnotationStatus(id, status),
          onSaveToLibrary: (fileUrl, fileName) => this.saveToLibrary(fileUrl, fileName)
        }, () => {
        }, this.config.siteName, this.config.projectId);
      });
      if (dev) {
        setTimeout(() => {
          var _a2, _b2;
          (_b2 = (_a2 = this.toolbarRoot) == null ? void 0 : _a2.querySelector('[data-action="list"]')) == null ? void 0 : _b2.click();
        }, 500);
      } else {
        (_b = this.toolbarRoot.querySelector('[data-action="submit"]')) == null ? void 0 : _b.addEventListener("click", () => {
          this.showToast("Feedback saved! Thanks for your input.");
        });
      }
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
      if (!target || target === document.body) return;
      if (this.currentTool === "arrow") {
        const rect = target.getBoundingClientRect();
        const cx = rect.left + rect.width / 2 + window.scrollX;
        const cy = rect.top + rect.height / 2 + window.scrollY;
        const svg = document.getElementById("feedspace-overlay");
        if (svg) {
          const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
          line.setAttribute("x1", String(cx - 80));
          line.setAttribute("y1", String(cy - 80));
          line.setAttribute("x2", String(cx));
          line.setAttribute("y2", String(cy));
          line.setAttribute("stroke", "#6366f1");
          line.setAttribute("stroke-width", "2.5");
          line.setAttribute("stroke-dasharray", "6,3");
          line.setAttribute("marker-end", "url(#feedspace-arrowhead)");
          line.setAttribute("opacity", "0.6");
          svg.appendChild(line);
          this.arrowPreviewEl = line;
        }
        this.hoverHighlightEl = target;
      } else if (this.currentTool === "rect") {
        target.classList.add("feedspace-hover-dashed");
        this.hoverHighlightEl = target;
      } else {
        target.classList.add("feedspace-hover-highlight");
        this.hoverHighlightEl = target;
      }
    }
    clearHoverHighlight() {
      if (this.arrowPreviewEl && this.arrowPreviewEl.parentNode) {
        this.arrowPreviewEl.parentNode.removeChild(this.arrowPreviewEl);
        this.arrowPreviewEl = null;
      }
      if (this.hoverHighlightEl) {
        this.hoverHighlightEl.classList.remove("feedspace-hover-highlight");
        this.hoverHighlightEl.classList.remove("feedspace-hover-dashed");
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
      if (this.currentTool === "pin" || this.currentTool === "arrow" || this.currentTool === "rect") {
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
      const toolType = this.currentTool;
      if (toolType === "arrow" || toolType === "rect") {
        this.showPendingAnnotation(el, startDna);
      }
      this.commentPanel.open(this.drawStart.x, this.drawStart.y, null, {
        onSubmit: (content, files) => this.saveAnnotation(content, files, el, startDna, firstPoint, points, toolType),
        onToggleRecording: () => this.toggleRecording(),
        onDeleteRecording: () => this.deleteRecording(),
        isRecording: () => this.isRecording
      }, () => {
        this.removePendingAnnotation();
      });
      this.setTool("select");
      this.cleanupDrawState();
    }
    showPendingAnnotation(el, dna) {
      const svg = document.getElementById("feedspace-overlay");
      if (!svg) return;
      this.removePendingAnnotation();
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;
      const rect = el.getBoundingClientRect();
      if (this.currentTool === "arrow") {
        const cx = rect.left + rect.width / 2 + scrollX;
        const cy = rect.top + rect.height / 2 + scrollY;
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", String(cx - 80));
        line.setAttribute("y1", String(cy - 80));
        line.setAttribute("x2", String(cx));
        line.setAttribute("y2", String(cy));
        line.setAttribute("stroke", "#6366f1");
        line.setAttribute("stroke-width", "2.5");
        line.setAttribute("marker-end", "url(#feedspace-arrowhead)");
        g.appendChild(line);
        svg.appendChild(g);
        this.pendingAnnotationEl = g;
      } else if (this.currentTool === "rect") {
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        const box = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        box.setAttribute("x", String(rect.left + scrollX));
        box.setAttribute("y", String(rect.top + scrollY));
        box.setAttribute("width", String(rect.width));
        box.setAttribute("height", String(rect.height));
        box.setAttribute("fill", "rgba(99,102,241,0.08)");
        box.setAttribute("stroke", "#6366f1");
        box.setAttribute("stroke-width", "2");
        box.setAttribute("stroke-dasharray", "6,3");
        box.setAttribute("rx", "4");
        g.appendChild(box);
        svg.appendChild(g);
        this.pendingAnnotationEl = g;
      }
    }
    removePendingAnnotation() {
      if (this.pendingAnnotationEl && this.pendingAnnotationEl.parentNode) {
        this.pendingAnnotationEl.parentNode.removeChild(this.pendingAnnotationEl);
        this.pendingAnnotationEl = null;
      }
    }
    cleanupDrawState() {
      this.isDrawing = false;
      this.drawStart = null;
      this.drawPoints = [];
      this.tempSvgEl = null;
    }
    async saveAnnotation(content, files, el, startDna, firstPoint, _points, toolType) {
      const metaData = {
        device: this.deviceMode,
        elementTag: startDna.tag,
        elementText: startDna.text,
        projectName: this.config.siteName || ""
      };
      const payload = {
        projectId: this.config.projectId,
        previewToken: this.config.token,
        type: toolType,
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
        const media = [];
        if (files.length > 0) {
          for (const file of files) {
            try {
              const result = await uploadToWordPress(this.config.wpApiUrl, this.config.wpApiKey, file, this.config.projectId);
              media.push({
                id: result.id || "",
                fileUrl: result.url,
                fileType: file.type || "",
                fileName: file.name || ""
              });
            } catch (err) {
              console.error("Upload failed", err);
              this.showToast("File upload failed. Pin saved without media.");
            }
          }
        }
        if (media.length > 0) {
          payload.media = media;
        }
        this.removePendingAnnotation();
        const annotation = await this.api.createAnnotation(payload);
        annotation._num = this.annotations.length + 1;
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
    async changeAnnotationStatus(id, status) {
      try {
        console.log("[Feedspace] changeAnnotationStatus:", { id, status });
        const updated = await this.api.updateAnnotation(id, { status });
        console.log("[Feedspace] changeAnnotationStatus response:", updated);
        const idx = this.annotations.findIndex((a) => a.id === id);
        if (idx >= 0) {
          this.annotations[idx] = { ...this.annotations[idx], ...updated, status };
        }
        this.renderer.setAnnotations(this.annotations);
        this.feedbackList.updateAnnotations(this.annotations);
        this.updateBadge();
        this.showToast(status === "resolved" ? "Marked as resolved" : "Reopened");
      } catch (err) {
        console.error("Failed to update annotation status", err);
        this.showToast("Failed to update status");
      }
    }
    async saveToLibrary(fileUrl, fileName) {
      try {
        const wpUrl = this.config.wpApiUrl.replace(/\/+$/, "");
        const res = await fetch(`${wpUrl}/wp-json/feedspace/v1/media/save-to-library`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Feedspace-Key": this.config.wpApiKey
          },
          body: JSON.stringify({ url: fileUrl })
        });
        const data = await res.json();
        if (data.attachment_id) {
          dbg("save_to_library_ok", data);
          return true;
        } else {
          dbg("save_to_library_failed", data);
          return false;
        }
      } catch (err) {
        dbg("save_to_library_error", err);
        return false;
      }
    }
    async deleteAnnotation(id) {
      try {
        await this.api.deleteAnnotation(id);
        this.annotations = this.annotations.filter((a) => a.id !== id);
        this.renderer.setAnnotations(this.annotations);
        this.updateBadge();
        this.showToast("Annotation deleted");
      } catch (err) {
        console.error("Failed to delete annotation", err);
        this.showToast("Failed to delete");
      }
    }
    async loadAnnotations() {
      try {
        this.annotations = await this.api.getAnnotations(this.config.pageUrl, this.config.projectId);
        this.annotations.forEach((a, i) => a._num = i + 1);
        dbg("loadAnnotations: fetched " + this.annotations.length + " annotations");
        await this.backfillProjectNames();
        this.renderer.setAnnotations(this.annotations);
        this.updateBadge();
      } catch (err) {
        console.error("Failed to load annotations", err);
        dbg("loadAnnotations: FAILED", String(err));
      }
    }
    async backfillProjectNames() {
      const seen = /* @__PURE__ */ new Set();
      const missing = [];
      for (const a of this.annotations) {
        if (a.projectId && !a.projectName && !seen.has(a.projectId)) {
          seen.add(a.projectId);
          if (this.projectNameCache[a.projectId]) {
            a.projectName = this.projectNameCache[a.projectId];
          } else {
            missing.push({ pid: a.projectId, token: a.previewToken || "" });
          }
        }
      }
      if (missing.length === 0) return;
      const apiUrl = this.config.apiUrl.replace(/\/+$/, "");
      for (const { pid, token } of missing) {
        try {
          const res = await fetch(`${apiUrl}/api/widget/verify-token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ projectId: pid })
          });
          const data = await res.json();
          console.log("[Feedspace] Project name lookup:", { projectId: pid, status: res.status, response: data });
          if (res.ok && data.name) {
            this.projectNameCache[pid] = data.name;
            for (const a of this.annotations) {
              if (a.projectId === pid && !a.projectName) a.projectName = data.name;
            }
            continue;
          }
          if (token) {
            console.log("[Feedspace] Falling back to token lookup for", pid);
            const tres = await fetch(`${apiUrl}/api/widget/verify-token`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token })
            });
            const tdata = await tres.json();
            console.log("[Feedspace] Token lookup result:", { token, status: tres.status, response: tdata });
            if (tres.ok && tdata.valid && tdata.siteName) {
              this.projectNameCache[pid] = tdata.siteName;
              for (const a of this.annotations) {
                if (a.projectId === pid && !a.projectName) a.projectName = tdata.siteName;
              }
              console.log("[Feedspace] Set projectName from token fallback:", pid, "->", tdata.siteName);
              continue;
            }
          }
          console.log("[Feedspace] No name found for project", pid, "- using fallback");
        } catch (e) {
        }
      }
    }
    onAnnotationClick(id) {
      const annotation = this.annotations.find((a) => a.id === id);
      if (!annotation) return;
      this.renderer.setSelected(id);
      let px = window.innerWidth / 2, py = 100;
      if (annotation.elementDna) {
        const el = findElement(annotation.elementDna);
        if (el) {
          const rect = el.getBoundingClientRect();
          px = rect.left + window.scrollX + rect.width * annotation.anchorXPct / 100;
          py = rect.top + window.scrollY + rect.height * annotation.anchorYPct / 100;
        }
      }
      this.commentPanel.open(px, py, annotation, {
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
        onToggleRecording: () => this.toggleRecording(),
        onDeleteRecording: () => this.deleteRecording(),
        isRecording: () => this.isRecording
      }, () => {
        this.renderer.setSelected(null);
      });
    }
    focusAnnotation(id) {
      this.renderer.setSelected(id);
      const annotation = this.annotations.find((a) => a.id === id);
      if (!(annotation == null ? void 0 : annotation.elementDna)) return;
      const el = findElement(annotation.elementDna);
      if (!el) {
        this.showToast("Element not found on page");
        return;
      }
      const device = annotation.device || "desktop";
      const widths = { desktop: "", tablet: "768px", mobile: "375px" };
      document.body.style.maxWidth = widths[device] || "";
      document.body.style.margin = device === "desktop" ? "" : "0 auto";
      document.body.style.boxShadow = device === "desktop" ? "" : "0 0 60px rgba(0,0,0,0.3)";
      document.documentElement.style.background = device !== "desktop" ? "#e5e7eb" : "";
      let revealEl = el;
      const semanticTags = ["H1", "H2", "H3", "H4", "H5", "H6", "P", "A", "BUTTON", "INPUT", "TEXTAREA", "IMG", "SPAN", "LABEL"];
      if (annotation.elementDna.tag && semanticTags.includes(annotation.elementDna.tag.toUpperCase())) {
        const inner = el.querySelector(annotation.elementDna.tag.toLowerCase());
        if (inner) revealEl = inner;
      }
      window.dispatchEvent(new Event("resize"));
      revealEl.scrollIntoView({ behavior: "smooth", block: "center" });
      const htmlEl = revealEl;
      const prev = {
        outline: htmlEl.style.outline,
        outlineOffset: htmlEl.style.outlineOffset,
        transition: htmlEl.style.transition
      };
      htmlEl.style.transition = "outline 0.15s";
      htmlEl.style.outline = "2px dashed #6366f1";
      htmlEl.style.outlineOffset = "4px";
      let count = 0;
      const pulse = setInterval(() => {
        count++;
        htmlEl.style.outline = count % 2 === 0 ? "2px dashed #6366f1" : "2px dashed transparent";
        if (count >= 6) {
          clearInterval(pulse);
          htmlEl.style.outline = prev.outline;
          htmlEl.style.outlineOffset = prev.outlineOffset;
          htmlEl.style.transition = prev.transition;
        }
      }, 300);
    }
    updateBadge() {
      const badge = document.getElementById("feedspace-list-count");
      if (!badge) return;
      const count = this.annotations.length;
      badge.textContent = String(count);
      badge.style.display = count > 0 ? "" : "none";
    }
    toggleRecording() {
      if (this.isRecording) {
        this.stopRecording();
      } else {
        this.startRecording();
      }
    }
    startRecording() {
      var _a;
      if (this.isRecording) return;
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
        this.mediaRecorder.start(100);
        if (this.recordingTimer) clearInterval(this.recordingTimer);
        this.recordingTimer = window.setInterval(() => {
          const elapsed = Math.floor((Date.now() - this.recordingStartTime) / 1e3);
          const mins = Math.floor(elapsed / 60);
          const secs = elapsed % 60;
          const indicator = document.getElementById("fs-popup-rec-indicator");
          if (indicator) {
            indicator.style.display = "flex";
            const timeEl = document.getElementById("fs-popup-rec-time");
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
      const indicator = document.getElementById("fs-popup-rec-indicator");
      if (indicator) indicator.style.display = "none";
      const blob = new Blob(this.audioChunks, { type: "audio/webm" });
      if (blob.size === 0) {
        this.showToast("Recording is empty");
        return;
      }
      const file = new File([blob], `recording-${Date.now()}.weba`, { type: "audio/webm" });
      this.commentPanel.addFile(file);
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
      const indicator = document.getElementById("fs-popup-rec-indicator");
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
      this.removePendingAnnotation();
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
    dbg2("initWidget() called with config", { apiUrl: config.apiUrl, projectId: config.projectId, pageUrl: config.pageUrl, wpApiUrl: config.wpApiUrl, hasWpKey: !!config.wpApiKey, siteName: config.siteName });
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
