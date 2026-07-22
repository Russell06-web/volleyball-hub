// Volleyball Hub — shared front-end behaviour (no framework, no build step)

document.addEventListener('DOMContentLoaded', () => {

  // Generic single-select chip / type-card groups: clicking a sibling
  // toggles `active` off the rest of the group and onto itself.
  document.querySelectorAll('.chip, .type-card').forEach((el) => {
    el.addEventListener('click', () => {
      const group = el.parentElement;
      if (!group) return;
      [...group.children].forEach((sib) => sib.classList && sib.classList.remove('active'));
      el.classList.add('active');
    });
  });

  // Full-screen filter modal (explore page, mobile/tablet only —
  // the trigger button is hidden by CSS at desktop widths).
  const filterModal = document.getElementById('filterModal');
  const filterTrigger = document.getElementById('filterTrigger');
  const filterClose = document.getElementById('filterModalClose');
  const filterApply = document.getElementById('filterApply');
  const filterBackdrop = filterModal ? filterModal.querySelector('.filter-modal-backdrop') : null;

  function openFilterModal() {
    if (!filterModal) return;
    filterModal.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function closeFilterModal() {
    if (!filterModal) return;
    filterModal.hidden = true;
    document.body.style.overflow = '';
  }

  if (filterModal) {
    filterTrigger && filterTrigger.addEventListener('click', openFilterModal);
    filterClose && filterClose.addEventListener('click', closeFilterModal);
    filterApply && filterApply.addEventListener('click', closeFilterModal);
    filterBackdrop && filterBackdrop.addEventListener('click', closeFilterModal);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !filterModal.hidden) closeFilterModal();
    });
  }
});
