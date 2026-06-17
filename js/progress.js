/**
 * progress.js — AP Physics 1 Explorer
 * Local progress tracking via localStorage.
 * Storage key: ap1_progress_v1
 * Status values: 0=not started, 1=in progress, 2=completed, 3=mastered
 */

const PROGRESS_KEY = 'ap1_progress_v1';

const STATUS = {
  NOT_STARTED: 0,
  IN_PROGRESS: 1,
  COMPLETED:   2,
  MASTERED:    3
};

// ── Storage helpers ──────────────────────────────────────────────────────────

function getProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return parsed;
  } catch (e) {
    // Corrupted — reset
    try { localStorage.setItem(PROGRESS_KEY, '{}'); } catch (_) {}
    return {};
  }
}

function saveProgress(progressObj) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progressObj));
    return true;
  } catch (e) {
    return false;
  }
}

function getSubunitStatus(subunitId) {
  try {
    const progress = getProgress();
    const record = progress[subunitId];
    if (!record || typeof record.status !== 'number') return STATUS.NOT_STARTED;
    if (![0, 1, 2, 3].includes(record.status)) return STATUS.NOT_STARTED;
    return record.status;
  } catch (e) {
    return STATUS.NOT_STARTED;
  }
}

function setSubunitStatus(subunitId, status) {
  try {
    const progress = getProgress();
    progress[subunitId] = {
      status: status,
      updatedAt: new Date().toISOString()
    };
    saveProgress(progress);
  } catch (e) {
    // Fail silently — page still works without progress
  }
}

// ── Status metadata ───────────────────────────────────────────────────────────

function getStatusMeta(status) {
  switch (status) {
    case STATUS.IN_PROGRESS:
      return {
        icon: '●',
        iconClass: 'progress-icon--in-progress',
        label: 'In Progress',
        ariaLabel: 'In progress'
      };
    case STATUS.COMPLETED:
      return {
        icon: '✓',
        iconClass: 'progress-icon--completed',
        label: 'Completed',
        ariaLabel: 'Completed'
      };
    case STATUS.MASTERED:
      return {
        icon: '★',
        iconClass: 'progress-icon--mastered',
        label: 'Mastered',
        ariaLabel: 'Mastered'
      };
    default: // NOT_STARTED
      return {
        icon: '○',
        iconClass: 'progress-icon--not-started',
        label: 'Not Started',
        ariaLabel: 'Not started'
      };
  }
}

// ── Course map icons (homepage) ───────────────────────────────────────────────

function renderCourseMapIcons() {
  const nodes = document.querySelectorAll('[data-subunit-id]');
  nodes.forEach(function(node) {
    const id = node.getAttribute('data-subunit-id');
    const status = getSubunitStatus(id);
    const meta = getStatusMeta(status);
    const iconEl = node.querySelector('.progress-icon');
    if (!iconEl) return;
    iconEl.textContent = meta.icon;
    // Remove all status classes, add current
    iconEl.className = 'progress-icon ' + meta.iconClass;
    iconEl.setAttribute('aria-label', meta.ariaLabel);
  });
}

// ── Per-page progress controls (simulation pages) ────────────────────────────

function renderProgressControls(subunitId) {
  const status = getSubunitStatus(subunitId);
  const meta   = getStatusMeta(status);

  const btnStartReset    = document.getElementById('btn-start-reset');
  const btnCompleteResume = document.getElementById('btn-complete-resume');
  const btnMastery       = document.getElementById('btn-mastery');
  const statusText       = document.getElementById('progress-status-text');

  if (!btnStartReset || !btnCompleteResume) return; // panel not present

  // ── Button 1: Start Learning / Start Over ──
  if (status === STATUS.NOT_STARTED) {
    btnStartReset.textContent = 'Start Learning';
    btnStartReset.disabled = false;
    btnStartReset.className = 'progress-btn progress-btn--start';
  } else {
    btnStartReset.textContent = 'Start Over';
    btnStartReset.disabled = false;
    btnStartReset.className = 'progress-btn progress-btn--reset';
  }

  // ── Button 2: Complete Training / Resume Training ──
  if (status === STATUS.IN_PROGRESS) {
    btnCompleteResume.textContent = 'Complete Training';
    btnCompleteResume.disabled = false;
    btnCompleteResume.className = 'progress-btn progress-btn--complete';
  } else if (status === STATUS.COMPLETED) {
    btnCompleteResume.textContent = 'Resume Training';
    btnCompleteResume.disabled = false;
    btnCompleteResume.className = 'progress-btn progress-btn--resume';
  } else {
    btnCompleteResume.textContent = 'Complete Training';
    btnCompleteResume.disabled = true;
    btnCompleteResume.className = 'progress-btn progress-btn--complete';
  }

  // ── Button 3: Mastery (always disabled in v1) ──
  if (btnMastery) {
    btnMastery.textContent = 'Mastery Training — Coming Soon';
    btnMastery.disabled = true;
    btnMastery.className = 'progress-btn progress-btn--mastery';
  }

  // ── Status text ──
  if (statusText) {
    statusText.textContent = 'Current status: ' + meta.label;
  }
}

// ── Event wiring (call once on DOMContentLoaded on sim pages) ────────────────

function initProgressControls(subunitId) {
  renderProgressControls(subunitId);

  const btnStartReset     = document.getElementById('btn-start-reset');
  const btnCompleteResume = document.getElementById('btn-complete-resume');

  if (btnStartReset) {
    btnStartReset.addEventListener('click', function() {
      const current = getSubunitStatus(subunitId);
      if (current === STATUS.NOT_STARTED) {
        setSubunitStatus(subunitId, STATUS.IN_PROGRESS);
      } else {
        setSubunitStatus(subunitId, STATUS.NOT_STARTED);
      }
      renderProgressControls(subunitId);
    });
  }

  if (btnCompleteResume) {
    btnCompleteResume.addEventListener('click', function() {
      const current = getSubunitStatus(subunitId);
      if (current === STATUS.IN_PROGRESS) {
        setSubunitStatus(subunitId, STATUS.COMPLETED);
      } else if (current === STATUS.COMPLETED) {
        setSubunitStatus(subunitId, STATUS.IN_PROGRESS);
      }
      // No-op for other states (button is disabled anyway)
      renderProgressControls(subunitId);
    });
  }
}
