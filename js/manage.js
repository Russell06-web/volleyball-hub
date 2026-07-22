// Volleyball Hub — manage.html only: dashboard <-> create-event wizard

document.addEventListener('DOMContentLoaded', () => {
  const manageDashboard = document.getElementById('manage-dashboard');
  const manageCreate = document.getElementById('manage-create');
  const btnNewEvent = document.getElementById('btnNewEvent');
  const btnBackToDashboard = document.getElementById('btnBackToDashboard');
  const manageSubTabs = document.getElementById('manageSubTabs');
  const manageEvents = document.getElementById('manage-events');
  const manageRecords = document.getElementById('manage-records');

  if (!manageDashboard || !manageCreate) return;

  function showDashboard() {
    manageDashboard.hidden = false;
    manageCreate.hidden = true;
    window.scrollTo(0, 0);
  }
  function showCreate() {
    manageDashboard.hidden = true;
    manageCreate.hidden = false;
    goToStep(1);
    window.scrollTo(0, 0);
  }

  btnNewEvent.addEventListener('click', showCreate);
  btnBackToDashboard.addEventListener('click', showDashboard);

  manageSubTabs.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-sub]');
    if (!btn) return;
    [...manageSubTabs.children].forEach((b) => b.classList.toggle('active', b === btn));
    const sub = btn.dataset.sub;
    manageEvents.hidden = sub !== 'events';
    manageRecords.hidden = sub !== 'records';
  });

  // ---- create-event wizard: 3 steps ----
  let currentStep = 1;
  const stepFill = document.getElementById('stepFill');
  const stepLabel = document.getElementById('stepLabel');
  const stepPct = document.getElementById('stepPct');
  const btnStepPrev = document.getElementById('btnStepPrev');
  const btnStepNext = document.getElementById('btnStepNext');

  function goToStep(n) {
    currentStep = n;
    [1, 2, 3].forEach((i) => { document.getElementById('step-' + i).hidden = i !== n; });
    const pct = Math.round((n / 3) * 100);
    stepFill.style.width = pct + '%';
    stepLabel.textContent = '步驟 ' + n + ' / 3';
    stepPct.textContent = pct + '%';
    btnStepPrev.hidden = n === 1;
    btnStepNext.textContent = n === 3 ? '發布活動' : '下一步';
    window.scrollTo(0, 0);
  }

  btnStepPrev.addEventListener('click', () => { if (currentStep > 1) goToStep(currentStep - 1); });
  btnStepNext.addEventListener('click', () => {
    if (currentStep < 3) {
      goToStep(currentStep + 1);
    } else {
      showDashboard();
    }
  });
});
