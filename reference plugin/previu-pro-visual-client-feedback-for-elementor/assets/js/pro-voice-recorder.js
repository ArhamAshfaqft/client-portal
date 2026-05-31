/**
 * Previu Pro — Voice Recorder
 * Uses the browser's MediaRecorder API to capture audio notes.
 */
(function () {
  'use strict';

  if (!window.ccfeReview) return;

  var mediaRecorder = null;
  var audioChunks = [];
  var isRecording = false;
  var stream = null;

  window.CCFE_VoiceRecorder = {
    open: openRecorder,
    close: closeRecorder,
  };

  /* ── Recorder UI ──────────────────────────────────────────── */
  function openRecorder() {
    var rv = window.ccfeReview || {};
    if (rv.fileUploads === false || rv.uploadsAudio === false) return;

    var existing = document.querySelector('.ccfe-voice-modal-overlay');
    if (existing) existing.remove();

    var overlay = document.createElement('div');
    overlay.className = 'ccfe-voice-modal-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999998;background:rgba(0,0,0,0.75);display:flex;align-items:center;justify-content:center;';

    overlay.innerHTML =
      '<div style="background:#1a1a2e;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px;text-align:center;max-width:360px;width:90%;">' +
        '<h3 style="color:#fff;margin:0 0 24px;font-size:18px;font-weight:700;">Voice Note</h3>' +
        '<div id="ccfe-voice-timer" style="font-size:48px;font-weight:300;color:#fff;font-family:monospace;margin-bottom:8px;">00:00</div>' +
        '<div id="ccfe-voice-status" style="font-size:13px;color:rgba(255,255,255,0.4);margin-bottom:24px;">Press record to start</div>' +
        '<div id="ccfe-voice-visualizer" style="height:40px;display:flex;align-items:flex-end;justify-content:center;gap:3px;margin-bottom:24px;"></div>' +
        '<div style="display:flex;gap:12px;justify-content:center;">' +
          '<button id="ccfe-voice-record" style="width:56px;height:56px;border-radius:50%;border:none;background:#ef4444;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s;box-shadow:0 4px 15px rgba(239,68,68,0.4);">' +
            '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="6"/></svg>' +
          '</button>' +
          '<button id="ccfe-voice-stop" style="width:56px;height:56px;border-radius:50%;border:none;background:rgba(255,255,255,0.1);color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;opacity:0.3;" disabled>' +
            '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="1"/></svg>' +
          '</button>' +
          '<button id="ccfe-voice-close" style="width:56px;height:56px;border-radius:50%;border:1px solid rgba(255,255,255,0.1);background:transparent;color:rgba(255,255,255,0.4);cursor:pointer;font-size:22px;line-height:1;">&times;</button>' +
        '</div>' +
        '<div id="ccfe-voice-preview" style="margin-top:16px;display:none;"></div>' +
        '<button id="ccfe-voice-attach" style="display:none;margin-top:12px;width:100%;padding:10px;border-radius:8px;border:none;background:#6366f1;color:#fff;font-weight:700;cursor:pointer;">Attach to Comment</button>' +
      '</div>';

    document.body.appendChild(overlay);

    // Close button
    overlay.querySelector('#ccfe-voice-close').onclick = closeRecorder;
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay && !isRecording) closeRecorder();
    });

    // Record button
    overlay.querySelector('#ccfe-voice-record').onclick = startRecording;

    // Stop button
    overlay.querySelector('#ccfe-voice-stop').onclick = stopRecording;
  }

  function closeRecorder() {
    if (isRecording) return;
    var overlay = document.querySelector('.ccfe-voice-modal-overlay');
    if (overlay) overlay.remove();
    if (stream) {
      stream.getTracks().forEach(function (t) { t.stop(); });
      stream = null;
    }
  }

  /* ── Recording Logic ──────────────────────────────────────── */
  var timerInterval = null;
  var seconds = 0;

  function startRecording() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showVoiceError('Your browser does not support audio recording.');
      return;
    }

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(function (s) {
        stream = s;
        audioChunks = [];
        seconds = 0;

        mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });

        mediaRecorder.ondataavailable = function (e) {
          if (e.data.size > 0) audioChunks.push(e.data);
        };

        mediaRecorder.onstop = function () {
          var blob = new Blob(audioChunks, { type: 'audio/webm' });
          handleAudioBlob(blob);

          stream.getTracks().forEach(function (t) { t.stop(); });
          stream = null;
        };

        mediaRecorder.start(250);
        isRecording = true;

        updateVoiceUI('recording');
        timerInterval = setInterval(updateTimer, 1000);
      })
      .catch(function () {
        showVoiceError('Microphone access denied. Please allow microphone permissions.');
      });
  }

  function stopRecording() {
    if (!mediaRecorder || mediaRecorder.state === 'inactive') return;

    mediaRecorder.stop();
    isRecording = false;
    clearInterval(timerInterval);
    updateVoiceUI('stopped');
  }

  function updateTimer() {
    seconds++;
    var m = Math.floor(seconds / 60);
    var s = seconds % 60;
    var el = document.getElementById('ccfe-voice-timer');
    if (el) el.textContent = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  }

  function updateVoiceUI(state) {
    var recordBtn = document.getElementById('ccfe-voice-record');
    var stopBtn = document.getElementById('ccfe-voice-stop');
    var status = document.getElementById('ccfe-voice-status');

    if (state === 'recording') {
      if (recordBtn) { recordBtn.style.background = '#991b1b'; recordBtn.disabled = true; }
      if (stopBtn) { stopBtn.style.opacity = '1'; stopBtn.disabled = false; stopBtn.style.background = 'rgba(255,255,255,0.2)'; }
      if (status) status.textContent = 'Recording...';
    } else {
      if (recordBtn) { recordBtn.style.background = '#ef4444'; recordBtn.disabled = false; }
      if (stopBtn) { stopBtn.style.opacity = '0.3'; stopBtn.disabled = true; stopBtn.style.background = 'rgba(255,255,255,0.1)'; }
      if (status) status.textContent = 'Recording saved';
    }
  }

  function showVoiceError(msg) {
    var status = document.getElementById('ccfe-voice-status');
    if (status) {
      status.textContent = msg;
      status.style.color = '#f87171';
    }
  }

  /* ── Handle recorded audio ────────────────────────────────── */
  function handleAudioBlob(blob) {
    var url = URL.createObjectURL(blob);
    var preview = document.getElementById('ccfe-voice-preview');
    var attachBtn = document.getElementById('ccfe-voice-attach');

    if (preview) {
      preview.style.display = 'block';
      preview.innerHTML = '<audio controls src="' + url + '" style="width:100%;height:36px;"></audio>';
    }
    if (attachBtn) {
      attachBtn.style.display = 'block';
      attachBtn.onclick = function () {
        var cfg = window.ccfePro || window.ccfeProElementor || {};
        if ( ! cfg.restUrl || ! cfg.nonce ) {
          showVoiceError('Upload config not available. Try refreshing the page.');
          return;
        }

        attachBtn.disabled = true;
        attachBtn.textContent = 'Uploading...';

        var formData = new FormData();
        formData.append('file', blob, 'voice-note-' + Date.now() + '.webm');

        var apiUrl = cfg.restUrl.replace(/\/$/, '') + '/media/upload';
        var sep = apiUrl.indexOf('?') > -1 ? '&' : '?';
        apiUrl += sep + '_t=' + Date.now();

        fetch(apiUrl, {
          method: 'POST',
          body: formData,
          headers: { 'X-WP-Nonce': cfg.nonce },
          cache: 'no-store',
        })
          .then(function (r) { return r.json(); })
          .then(function (data) {
            if (data.url) {
              data.is_voice = true;
              if (window.CCFE_ProExtensions && window.CCFE_ProExtensions.addUpload) {
                window.CCFE_ProExtensions.addUpload(data);
              }
              closeRecorder();
              document.dispatchEvent(new CustomEvent('ccfe_panel_opened', {
                detail: { panel: document.getElementById('ccfe-comment-panel'), annotation: null }
              }));
            } else {
              showVoiceError(data.message || 'Upload failed.');
              attachBtn.disabled = false;
              attachBtn.textContent = 'Attach to Comment';
            }
          })
          .catch(function () {
            showVoiceError('Upload failed. Check your connection.');
            attachBtn.disabled = false;
            attachBtn.textContent = 'Attach to Comment';
          });
      };
    }
  }

  // Add keyframe animation for spinner if not exists
  if (!document.getElementById('ccfe-pro-keyframes')) {
    var style = document.createElement('style');
    style.id = 'ccfe-pro-keyframes';
    style.textContent = '@keyframes ccfe-spin{to{transform:rotate(360deg);}}';
    document.head.appendChild(style);
  }
})();
