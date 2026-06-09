import type { WidgetConfig } from './types';
import { injectStyles } from './styles';
import { createApiClient } from './api';
import { AnnotationEngine } from './annotation-engine';

declare global {
  interface Window {
    FeedDashWidget?: {
      init: (config: WidgetConfig) => void;
      destroy: () => void;
    };
  }
}

function initWidget(config: WidgetConfig): AnnotationEngine {
  function dbg(msg: string, data?: unknown) {
    const arr = (window as any).__feeddashDebug;
    if (arr && Array.isArray(arr)) arr.push({ msg, data, time: Date.now() });
    console.log('[FeedDash]', msg, data || '');
  }

  dbg('initWidget() called with config', { apiUrl: config.apiUrl, projectId: config.projectId, pageUrl: config.pageUrl, wpApiUrl: config.wpApiUrl, hasWpKey: !!config.wpApiKey, siteName: config.siteName });

  injectStyles();
  dbg('Styles injected');

  // Strip feeddash_preview from pageUrl to ensure consistent storage/retrieval
  if (config.pageUrl) {
    try {
      const u = new URL(config.pageUrl);
      u.searchParams.delete('feeddash_preview');
      config.pageUrl = u.toString();
    } catch { /* leave as-is if not a valid URL */ }
  }

  const api = createApiClient(config.apiUrl, config.token, config.projectId, config.wpApiUrl, config.wpApiKey);
  dbg('API client created');

  const engine = new AnnotationEngine(config, api);
  dbg('AnnotationEngine instance created');

  engine.init().catch((err) => {
    console.error('FeedDash widget init error:', err);
    dbg('init() threw error', String(err));
  });

  return engine;
}

let currentEngine: AnnotationEngine | null = null;

window.FeedDashWidget = {
  init(config: WidgetConfig) {
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
  },
};
