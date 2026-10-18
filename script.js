const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
const yearEl = document.getElementById('year');
const filterButtons = document.querySelectorAll('.category-button');
const storyCards = document.querySelectorAll('.story-card[data-category]');
const emptyState = document.querySelector('.empty-state');
const fanDialog = document.querySelector('.fan-dialog');
const fanForm = document.querySelector('.fan-form');
const fanProfile = document.querySelector('.fan-profile');
const fanNameInput = document.querySelector('#fan-name');
const fanTeamInput = document.querySelector('#fan-team');
const accountLabel = document.querySelector('.account-label');
const progressBar = document.querySelector('.scroll-progress span');
let fanName = '';
let fanTeam = '';
let lastDialogTrigger = null;

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

function closeMenu() {
  if (!menuToggle || !mainNav) return;
  mainNav.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('menu-open');
}

if (menuToggle && mainNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    mainNav.classList.toggle('is-open', isOpen);
    document.body.classList.toggle('menu-open', isOpen);
  });

  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  document.addEventListener('click', (event) => {
    if (
      menuToggle.getAttribute('aria-expanded') === 'true' &&
      !mainNav.contains(event.target) &&
      !menuToggle.contains(event.target)
    ) {
      closeMenu();
    }
  });
}

function openFanDialog(event) {
  if (!fanDialog) return;
  lastDialogTrigger = event.currentTarget;
  fanDialog.showModal();
  document.body.classList.add('dialog-open');
  if (!fanName) fanNameInput?.focus();
}

document.querySelectorAll('.account-open, .fan-join').forEach((button) => {
  button.addEventListener('click', openFanDialog);
});

document.querySelector('.dialog-close')?.addEventListener('click', () => fanDialog?.close());

fanDialog?.addEventListener('close', () => {
  document.body.classList.remove('dialog-open');
  lastDialogTrigger?.focus();
});

fanDialog?.addEventListener('click', (event) => {
  if (event.target === fanDialog) fanDialog.close();
});

fanForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = fanNameInput?.value.trim() ?? '';
  if (name.length < 2 || !fanTeamInput?.value) {
    fanNameInput?.setCustomValidity(name.length < 2 ? 'Laqab kamida 2 ta harfdan iborat bo‘lsin.' : '');
    fanNameInput?.reportValidity();
    fanNameInput?.addEventListener('input', () => fanNameInput.setCustomValidity(''), { once: true });
    return;
  }

  fanName = name;
  fanTeam = fanTeamInput.value;
  fanForm.hidden = true;
  if (fanProfile) fanProfile.hidden = false;
  document.querySelector('.profile-greeting').textContent = `Xush kelibsan, ${fanName}!`;
  document.querySelector('.profile-team').textContent = `Sevimli jamoang: ${fanTeam}`;
  if (accountLabel) accountLabel.textContent = `Salom, ${fanName}`;
});

document.querySelector('.profile-logout')?.addEventListener('click', () => {
  fanName = '';
  fanTeam = '';
  if (fanForm) fanForm.hidden = false;
  if (fanProfile) fanProfile.hidden = true;
  if (fanForm) fanForm.reset();
  if (accountLabel) accountLabel.textContent = 'Muxlis bo‘lish';
  fanNameInput?.focus();
});

if (progressBar) {
  let progressFrame = 0;
  const updateProgress = () => {
    progressFrame = 0;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
    progressBar.style.transform = `scaleX(${Math.min(Math.max(progress, 0), 1)})`;
  };

  window.addEventListener('scroll', () => {
    if (!progressFrame) progressFrame = window.requestAnimationFrame(updateProgress);
  }, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();
}

const revealTargets = document.querySelectorAll('.story-card, .pillar-card, .manifesto-image, .fan-zone-inner');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if ('IntersectionObserver' in window && !reduceMotion) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  revealTargets.forEach((target, index) => {
    target.classList.add('reveal-pending');
    target.style.transitionDelay = `${(index % 3) * 65}ms`;
    revealObserver.observe(target);
  });
}

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    let visibleCount = 0;

    filterButtons.forEach((item) => {
      const isSelected = item === button;
      item.classList.toggle('selected', isSelected);
      item.setAttribute('aria-pressed', String(isSelected));
    });

    storyCards.forEach((card) => {
      const matches = filter === 'all' || card.dataset.category.split(' ').includes(filter);
      card.hidden = !matches;
      if (matches) visibleCount += 1;
    });

    if (emptyState) emptyState.hidden = visibleCount > 0;
  });
});
