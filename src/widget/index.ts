import type { WidgetConfig } from './types';
import { injectStyles } from './styles';
import { createApiClient } from './api';
import { AnnotationEngine } from './annotation-engine';

declare global {
  interface Window {
    FeedspaceWidget?: {
      init: (config: WidgetConfig) => void;
      destroy: () => void;
    };
  }
}

function initWidget(config: WidgetConfig): AnnotationEngine {
  function dbg(msg: string, data?: unknown) {
    const arr = (window as any).__feedspaceDebug;
    if (arr && Array.isArray(arr)) arr.push({ msg, data, time: Date.now() });
    console.log('[Feedspace]', msg, data || '');
  }

  dbg('initWidget() called with config', { apiUrl: config.apiUrl, projectId: config.projectId, pageUrl: config.pageUrl });

  injectStyles();
  dbg('Styles injected');

  const api = createApiClient(config.apiUrl, config.token, config.wpApiUrl, config.wpApiKey);
  dbg('API client created');

  const engine = new AnnotationEngine(config, api);
  dbg('AnnotationEngine instance created');

  engine.init().catch((err) => {
    console.error('Feedspace widget init error:', err);
    dbg('init() threw error', String(err));
  });

  return engine;
}

let currentEngine: AnnotationEngine | null = null;

window.FeedspaceWidget = {
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
