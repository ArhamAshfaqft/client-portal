/**
 * Previu Pro — Admin Dashboard (tiny bootstrap)
 * Enables the save buttons on the settings page by removing disabled states.
 * The actual settings persistence is handled by PHP hooks.
 */
(function () {
  'use strict';
  // The admin-dashboard.js already reads cfg.isPro and cfg.proSettings from the localized data,
  // which are now populated by the `ccfe_is_pro_active` and `ccfe_pro_settings` filters.
  // No additional client-side work needed — the free dashboard SPA handles everything.
})();
