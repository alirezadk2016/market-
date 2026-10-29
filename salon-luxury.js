/* Small editorial enhancements. The collection, form and photographs work without these. */
(() => {
  'use strict';
  const t = (key, fallback) => (window.AZ ? window.AZ.t(key) : fallback);


  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const phone = matchMedia('(max-width: 700px)');
  const collectionLabelKeys = { bags: 'col.bags', eyewear: 'col.eyewear', watches: 'col.watches', headwear: 'col.headwear' };
  const collectionLabels = new Proxy({}, { get: (_, key) => t(collectionLabelKeys[key], String(key)) });
  const registry = typeof RANGES === 'undefined' ? null : RANGES;
  const collectionCount = key => {
    const items = registry?.[key]?.items;
    if (!Array.isArray(items)) return null;
    return items.filter(item => Array.isArray(item?.variants) && item.variants.some(variant =>
      Array.isArray(variant?.shots) && variant.shots.some(shot => typeof shot === 'string' && shot.trim()))).length;
  };

  document.querySelectorAll('[data-collection-count]').forEach(node => {
    const count = collectionCount(node.dataset.collectionCount);
    if (count !== null) node.textContent = count + (count === 1 ? ' piece' : ' pieces');
  });
  document.querySelectorAll('[data-collection-nav-count]').forEach(node => {
    const count = collectionCount(node.dataset.collectionNavCount);
    if (count !== null) node.textContent = String(count);
  });
  document.querySelectorAll('[data-luxury-year]').forEach(node => { node.textContent = String(new Date().getFullYear()); });

  const rail = document.querySelector('.luxury-exhibits');
  const exhibits = [...document.querySelectorAll('[data-exhibit]')];
  const collectionButtons = [...document.querySelectorAll('[data-target-collection]')];
  function selectCollection(key) {
    collectionButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.targetCollection === key)));
  }
  collectionButtons.forEach(button => button.addEventListener('click', () => {
    const key = button.dataset.targetCollection;
    const exhibit = exhibits.find(item => item.dataset.exhibit === key);
    if (!exhibit || !rail) return;
    const behavior = reduced.matches ? 'auto' : 'smooth';
    selectCollection(key);
    if (phone.matches) {
      const padding = parseFloat(getComputedStyle(rail).paddingLeft) || 0;
      const left = rail.scrollLeft + exhibit.getBoundingClientRect().left - rail.getBoundingClientRect().left - padding;
      rail.scrollTo({ left, behavior });
    } else exhibit.scrollIntoView({ block: 'center', behavior });
  }));

  let exhibitObserver = null;
  function observeExhibits() {
    exhibitObserver?.disconnect();
    if (!rail || !exhibits.length || !('IntersectionObserver' in window)) return;
    const visible = new Map();
    exhibitObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => visible.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0));
      const best = [...visible.entries()].sort((a, b) => b[1] - a[1])[0];
      if (best && best[1] > .25) selectCollection(best[0].dataset.exhibit);
    }, { root: phone.matches ? rail : null, threshold: [0, .25, .5, .75, 1] });
    exhibits.forEach(exhibit => exhibitObserver.observe(exhibit));
  }
  observeExhibits();
  phone.addEventListener('change', observeExhibits);

  // This creates navigation only after native dialog support is confirmed.
  // The original mobile Collections link remains a usable no-script fallback.
  const header = document.querySelector('.header');
  if (header && typeof HTMLDialogElement !== 'undefined') {
    const menu = document.createElement('dialog');
    if (typeof menu.showModal === 'function') {
      menu.id = 'luxuryNavigation';
      menu.setAttribute('aria-label', 'A.z navigation');
      const menuHead = document.createElement('div');
      menuHead.className = 'luxury-menu-head';
      const home = document.createElement('a');
      home.href = '#entrance';
      home.setAttribute('aria-label', 'Return to the A.z entrance');
      const mark = document.createElement('img');
      mark.src = 'assets/logo-silver.png';
      mark.alt = 'A.z';
      mark.width = 64;
      mark.height = 64;
      home.append(mark);
      const close = document.createElement('button');
      close.type = 'button';
      close.className = 'luxury-menu-close';
      close.setAttribute('aria-label', 'Close menu');
      close.textContent = t('menu.close', 'Close');
      menuHead.append(home, close);

      const menuBody = document.createElement('div');
      menuBody.className = 'luxury-menu-body';
      const links = document.createElement('nav');
      links.className = 'luxury-menu-section-links';
      links.setAttribute('aria-label', 'Site sections');
      [['#entrance', 'menu.salon'], ['#collections', 'nav.collections'], ['#advisory', 'nav.advisoryLower'], ['#questions', 'nav.questions']].forEach(([href, key]) => {
        const label = t(key, key);
        const link = document.createElement('a');
        link.href = href;
        link.textContent = label;
        links.append(link);
      });
      const categories = document.createElement('div');
      categories.className = 'luxury-menu-collections';
      categories.setAttribute('role', 'group');
      categories.setAttribute('aria-label', 'Open a collection');
      Object.entries(collectionLabels).forEach(([key, label]) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.setAttribute('aria-label', 'Open the ' + label + ' collection');
        const name = document.createElement('span');
        name.textContent = label;
        const amount = document.createElement('span');
        const count = collectionCount(key);
        amount.textContent = count === null ? '' : String(count);
        button.append(name, amount);
        button.addEventListener('click', () => {
          menu.close();
          if (typeof window.openSalonCollection === 'function') window.openSalonCollection(key);
          else location.href = '?view=collection&c=' + encodeURIComponent(key) + '#collections';
        });
        categories.append(button);
      });
      const enquire = document.createElement('a');
      enquire.className = 'luxury-menu-enquire';
      enquire.href = '#private-enquiry';
      enquire.textContent = t('menu.begin', 'Begin a private enquiry');
      const email = document.createElement('a');
      email.className = 'luxury-menu-email';
      email.href = 'mailto:alirezadk2020@gmail.com';
      email.textContent = 'alirezadk2020@gmail.com';
      menuBody.append(links, categories, enquire, email);
      menu.append(menuHead, menuBody);
      document.body.append(menu);

      const toggle = document.createElement('button');
      toggle.id = 'luxuryMenuToggle';
      toggle.type = 'button';
      toggle.className = 'luxury-menu-toggle';
      toggle.textContent = 'Menu';
      toggle.setAttribute('aria-label', 'Open menu');
      toggle.setAttribute('aria-controls', menu.id);
      toggle.setAttribute('aria-haspopup', 'dialog');
      toggle.setAttribute('aria-expanded', 'false');
      header.insertBefore(toggle, header.querySelector('.header-enquiry'));
      header.classList.add('has-luxury-menu');
      toggle.addEventListener('click', () => {
        if (menu.open) return;
        menu.showModal();
        toggle.setAttribute('aria-expanded', 'true');
        close.focus({ preventScroll: true });
      });
      close.addEventListener('click', () => menu.close());
      menu.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', () => menu.close()));
      menu.addEventListener('close', () => toggle.setAttribute('aria-expanded', 'false'));
      phone.addEventListener('change', () => { if (!phone.matches && menu.open) menu.close(); });
    }
  }

  // The canonical mailto link is the draft source, including catalogue-prefilled colours.
  // Reviewing or downloading a note does not send it or create a saved enquiry.
  const form = document.getElementById('salonEnquiry');
  const copy = document.getElementById('copySalonEnquiry');
  const compose = document.getElementById('salonCompose');
  const status = document.getElementById('salonCopyStatus');
  const fallbackPanel = document.getElementById('salonCopyPanel');
  const fallbackText = document.getElementById('salonCopyText');
  const review = document.getElementById('salonEnquiryReview');
  const reviewButton = document.getElementById('reviewSalonEnquiry');
  const reviewSubject = document.getElementById('salonReviewSubject');
  const reviewBody = document.getElementById('salonReviewBody');
  const reviewCollection = document.getElementById('salonReviewCollection');
  const edit = document.getElementById('editSalonEnquiry');
  const gmail = document.getElementById('salonGmailCompose');
  const download = document.getElementById('downloadSalonEnquiry');
  let reviewOpen = false;

  function enquiryDraft() {
    const selection = document.getElementById('salonCollection');
    const preferences = document.getElementById('salonPreferences');
    const key = selection?.value || '';
    const collection = (window.AZ ? window.AZ.field(registry?.[key], 'title') : registry?.[key]?.title) ||
      selection?.selectedOptions?.[0]?.textContent.trim() || t('enq.help', 'Help me choose');
    let body = '';
    let subject = 'A.z private enquiry';
    try {
      const draft = new URL(compose.href);
      if (draft.protocol === 'mailto:') {
        body = draft.searchParams.get('body') || '';
        subject = draft.searchParams.get('subject') || subject;
      }
    } catch (_) { /* A local field-based draft remains usable if the link is unavailable. */ }
    if (!body) {
      body = t('mail.greeting', 'Hello A.z,') + '\n\n' + t('mail.wants', 'I would like advice on') + ' ' +
        (key ? collection : t('mail.helpChoosing', 'help choosing a piece')) + '.';
      if (preferences?.value.trim()) body += '\n\n' + preferences.value.trim();
    }
    return { collection, subject, body,
      text: t('enq.to', 'To') + ': alirezadk2020@gmail.com\n' + t('enq.subject', 'Subject') + ': ' + subject + '\n\n' + body };
  }

  function refreshReview() {
    if (!compose || !review || !reviewSubject || !reviewBody || !reviewCollection || !gmail || !download) return;
    const draft = enquiryDraft();
    reviewSubject.textContent = draft.subject;
    reviewBody.textContent = draft.body;
    reviewCollection.textContent = draft.collection;
    const web = new URL('https://mail.google.com/mail/');
    web.searchParams.set('view', 'cm');
    web.searchParams.set('fs', '1');
    web.searchParams.set('to', 'alirezadk2020@gmail.com');
    web.searchParams.set('su', draft.subject);
    web.searchParams.set('body', draft.body);
    gmail.href = web.href;
    download.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(draft.text);
  }

  function showReview(behavior = reduced.matches ? 'auto' : 'smooth') {
    if (!review || !reviewButton) return;
    refreshReview();
    reviewOpen = true;
    review.hidden = false;
    reviewButton.setAttribute('aria-expanded', 'true');
    if (status) status.textContent = '';
    review.focus({ preventScroll: true });
    review.scrollIntoView({ block: 'start', behavior });
  }

  if (form && compose && review && reviewButton && reviewSubject && reviewBody && reviewCollection && gmail && download) {
    reviewButton.hidden = false;
    form.classList.add('has-enquiry-review');
    reviewButton.addEventListener('click', () => showReview());
    // Preserve the existing submit draft update, then make the review the final focus target.
    form.addEventListener('submit', event => {
      event.preventDefault();
      queueMicrotask(() => showReview('auto'));
    });
    edit?.addEventListener('click', () => {
      const preferences = document.getElementById('salonPreferences');
      preferences?.focus({ preventScroll: true });
      preferences?.scrollIntoView({ block: 'center', behavior: reduced.matches ? 'auto' : 'smooth' });
    });
    // Product prefilling changes href without dispatching input; observe the real draft API.
    new MutationObserver(() => { if (reviewOpen) refreshReview(); }).observe(compose, { attributes: true, attributeFilter: ['href'] });
    gmail.addEventListener('click', refreshReview);
    download.addEventListener('click', refreshReview);
  }

  if (copy && compose && status && fallbackPanel && fallbackText) {
    copy.addEventListener('click', async () => {
      const draft = enquiryDraft();
      if (reviewOpen) refreshReview();
      copy.disabled = true;
      try {
        if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(draft.text);
        fallbackPanel.hidden = true;
        status.textContent = t('copy.done', 'Enquiry copied.');
      } catch (_) {
        fallbackText.value = draft.text;
        fallbackPanel.hidden = false;
        status.textContent = t('copy.manual', 'Your enquiry is below.');
        fallbackText.focus({ preventScroll: true });
        fallbackText.select();
      } finally {
        copy.disabled = false;
      }
    });
  }
})();
