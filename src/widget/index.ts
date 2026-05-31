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
  injectStyles();

  const api = createApiClient(config.apiUrl, config.token);
  const engine = new AnnotationEngine(config, api);

  engine.init().catch((err) => {
    console.error('Feedspace widget init error:', err);
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
