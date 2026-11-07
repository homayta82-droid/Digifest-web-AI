/**
 * Asisten AI Virtual — SMA Negeri 1 Singaraja
 * Optimized: Native DOM Markdown renderer, quick action chips, robust error handling
 */

async function mountChat() {
  if (document.getElementById('aiChatButton')) return;

  const cssUrl = new URL('./ai-chat.css?v=visual-5', import.meta.url);
  if (!document.querySelector(`link[href="${cssUrl.href}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssUrl.href;
    document.head.appendChild(link);
  }

  const htmlUrl = new URL('./ai-chat.html?v=visual-3', import.meta.url);
  const response = await fetch(htmlUrl);
  if (!response.ok) throw new Error('Komponen chat tidak dapat dimuat');
  const wrapper = document.createElement('div');
  wrapper.innerHTML = await response.text();
  document.body.appendChild(wrapper);

  initializeChat();
}

function initializeChat() {
  const button = document.getElementById('aiChatButton');
  const panel = document.getElementById('aiChatPanel');
  const closeButton = document.getElementById('aiChatClose');
  const guide = document.getElementById('aiGuide');
  const guideDismiss = document.getElementById('aiGuideDismiss');
  const guideStart = guide?.querySelector('.ai-guide__start');
  const form = document.getElementById('aiChatForm');
  const input = document.getElementById('aiChatInput');
  const messages = document.getElementById('aiChatMessages');
  const chipsContainer = document.getElementById('aiChatChips');

  if (!button || !panel || !form || !input || !messages) return;

  const history = [];
  let closeTimer;
  let guideTimer;
  let dragStart = null;
  let hasDragged = false;
  let suppressNextClick = false;
  let suppressClickTimer;
  const guideSeenKey = 'smansa-ai-guide-seen';
  const launcherPositionKey = 'smansa-ai-launcher-position';

  function readStorage(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('Preferensi Asisten AI tidak dapat dibaca:', error);
      return null;
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn('Preferensi Asisten AI tidak dapat disimpan:', error);
    }
  }

  function hideGuide() {
    clearTimeout(guideTimer);
    writeStorage(guideSeenKey, 'true');
    if (!guide || guide.hidden) return;
    guide.classList.remove('is-visible');
    window.setTimeout(() => { guide.hidden = true; }, 250);
  }

  function updateGuidePosition() {
    if (!guide || guide.hidden) return;

    const launcher = button.getBoundingClientRect();
    const guideRect = guide.getBoundingClientRect();
    const margin = 12;

    if (window.innerWidth <= 480) {
      let top = launcher.top - guideRect.height - margin;
      if (top < margin) top = launcher.bottom + margin;
      if (top + guideRect.height > window.innerHeight - margin) {
        top = Math.max(margin, window.innerHeight - guideRect.height - margin);
      }
      guide.style.left = '16px';
      guide.style.top = `${top}px`;
      guide.style.right = 'auto';
      return;
    }

    const leftOfLauncher = launcher.left - guideRect.width - margin;
    const rightSpace = window.innerWidth - launcher.right - guideRect.width - margin;
    const placeAbove = leftOfLauncher < margin && rightSpace < margin;
    const left = leftOfLauncher >= margin
      ? leftOfLauncher
      : placeAbove
        ? Math.min(
          Math.max(margin, launcher.right - guideRect.width),
          window.innerWidth - guideRect.width - margin
        )
        : launcher.right + margin;
    const top = placeAbove
      ? Math.max(margin, launcher.top - guideRect.height - margin)
      : Math.min(
        Math.max(margin, launcher.top + (launcher.height - guideRect.height) / 2),
        window.innerHeight - guideRect.height - margin
      );

    guide.style.left = `${left}px`;
    guide.style.top = `${top}px`;
    guide.style.right = 'auto';
  }

  function showGuide() {
    if (!guide || readStorage(guideSeenKey)) return;
    guide.hidden = false;
    updateGuidePosition();
    requestAnimationFrame(() => guide.classList.add('is-visible'));
  }

  function clampLauncherPosition(left, top) {
    const bounds = button.getBoundingClientRect();
    return {
      left: Math.max(12, Math.min(left, window.innerWidth - bounds.width - 12)),
      top: Math.max(12, Math.min(top, window.innerHeight - bounds.height - 12))
    };
  }

  function setLauncherPosition(left, top) {
    const position = clampLauncherPosition(left, top);
    button.style.left = `${position.left}px`;
    button.style.top = `${position.top}px`;
    button.style.right = 'auto';
    button.style.bottom = 'auto';
    return position;
  }

  function restoreLauncherPosition() {
    const savedPosition = readStorage(launcherPositionKey);
    if (!savedPosition) return;

    try {
      const position = JSON.parse(savedPosition);
      if (Number.isFinite(position.left) && Number.isFinite(position.top)) {
        setLauncherPosition(position.left, position.top);
      }
    } catch (error) {
      console.warn('Posisi tombol Asisten AI tersimpan tidak valid:', error);
    }
  }

  restoreLauncherPosition();

  // Safe inline formatter: parses **bold** and [text](url) without innerHTML vulnerability
  function appendFormattedInline(text, parentEl) {
    const regex = /(\*\*.*?\*\*|\[.*?\]\(.*?\))/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parentEl.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
      }

      const token = match[0];
      if (token.startsWith('**') && token.endsWith('**')) {
        const strong = document.createElement('strong');
        strong.textContent = token.slice(2, -2);
        parentEl.appendChild(strong);
      } else if (token.startsWith('[') && token.includes('](') && token.endsWith(')')) {
        const linkText = token.slice(1, token.indexOf(']('));
        const linkUrl = token.slice(token.indexOf('](') + 2, -1);
        let destination;
        try {
          destination = new URL(linkUrl, window.location.href);
        } catch {
          destination = null;
        }
        if (!destination || !['http:', 'https:'].includes(destination.protocol)) {
          parentEl.appendChild(document.createTextNode(token));
        } else {
          const a = document.createElement('a');
          a.textContent = linkText;
          a.href = destination.href;
          if (destination.origin !== window.location.origin) {
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
          }
          parentEl.appendChild(a);
        }
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parentEl.appendChild(document.createTextNode(text.slice(lastIndex)));
    }
  }

  function renderMessageText(text, containerEl) {
    const blocks = String(text || '').trim().split(/\n\n+/);

    blocks.forEach((block) => {
      const rawLines = block.split('\n').map((l) => l.trim()).filter(Boolean);
      if (!rawLines.length) return;

      const isNumbered = rawLines.every((l) => /^\d+[.)]\s/.test(l));
      const isBullet = rawLines.every((l) => /^[-*•]\s/.test(l));

      if (isNumbered) {
        const ol = document.createElement('ol');
        rawLines.forEach((line) => {
          const li = document.createElement('li');
          appendFormattedInline(line.replace(/^\d+[.)]\s*/, ''), li);
          ol.appendChild(li);
        });
        containerEl.appendChild(ol);
      } else if (isBullet) {
        const ul = document.createElement('ul');
        rawLines.forEach((line) => {
          const li = document.createElement('li');
          appendFormattedInline(line.replace(/^[-*•]\s*/, ''), li);
          ul.appendChild(li);
        });
        containerEl.appendChild(ul);
      } else {
        rawLines.forEach((line) => {
          const p = document.createElement('p');
          appendFormattedInline(line, p);
          containerEl.appendChild(p);
        });
      }
    });
  }

  function setOpen(open) {
    clearTimeout(closeTimer);
    hideGuide();
    if (open) {
      panel.hidden = false;
      requestAnimationFrame(() => panel.classList.add('is-open'));
      button.classList.add('is-hidden');
      input.focus();
    } else {
      panel.classList.remove('is-open');
      button.classList.remove('is-hidden');
      closeTimer = setTimeout(() => { panel.hidden = true; }, 220);
    }
    button.setAttribute('aria-expanded', String(open));
  }

  function addMessage(text, role) {
    const row = document.createElement('div');
    row.className = `ai-message-row ai-message-row--${role}`;

    const message = document.createElement('div');
    message.className = `ai-message ai-message--${role}`;

    if (role === 'loading') {
      message.innerHTML = '<span></span><span></span><span></span>';
    } else {
      renderMessageText(text, message);
    }

    row.appendChild(message);
    messages.appendChild(row);
    messages.scrollTo({ top: messages.scrollHeight, behavior: 'smooth' });
    return row;
  }

  button.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || !panel.hidden) return;
    dragStart = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      left: button.getBoundingClientRect().left,
      top: button.getBoundingClientRect().top
    };
    hasDragged = false;
    button.setPointerCapture(event.pointerId);
  });

  button.addEventListener('pointermove', (event) => {
    if (!dragStart || event.pointerId !== dragStart.pointerId) return;

    const deltaX = event.clientX - dragStart.x;
    const deltaY = event.clientY - dragStart.y;
    if (!hasDragged && Math.hypot(deltaX, deltaY) < 6) return;

    hasDragged = true;
    button.classList.add('is-dragging');
    dragStart.position = setLauncherPosition(dragStart.left + deltaX, dragStart.top + deltaY);
    if (guide && !guide.hidden) updateGuidePosition();
    event.preventDefault();
  });

  function finishLauncherDrag(event) {
    if (!dragStart || event.pointerId !== dragStart.pointerId) return;
    if (hasDragged) {
      const position = dragStart.position || clampLauncherPosition(dragStart.left, dragStart.top);
      writeStorage(launcherPositionKey, JSON.stringify(position));
      suppressNextClick = true;
      clearTimeout(suppressClickTimer);
      suppressClickTimer = window.setTimeout(() => { suppressNextClick = false; }, 500);
    }
    dragStart = null;
    button.classList.remove('is-dragging');
  }

  button.addEventListener('pointerup', finishLauncherDrag);
  button.addEventListener('pointercancel', finishLauncherDrag);
  button.addEventListener('click', () => {
    if (suppressNextClick) {
      suppressNextClick = false;
      clearTimeout(suppressClickTimer);
      return;
    }
    setOpen(panel.hidden);
  });
  closeButton?.addEventListener('click', () => setOpen(false));
  guideDismiss?.addEventListener('click', hideGuide);
  guideStart?.addEventListener('click', () => setOpen(true));
  window.addEventListener('resize', () => {
    const rect = button.getBoundingClientRect();
    if (button.style.left) setLauncherPosition(rect.left, rect.top);
    updateGuidePosition();
  });
  window.visualViewport?.addEventListener('resize', updateGuidePosition);

  guideTimer = window.setTimeout(showGuide, 900);

  async function handleSendMessage(messageText) {
    const message = (messageText || input.value || '').trim();
    if (!message) return;

    addMessage(message, 'user');
    input.value = '';
    input.disabled = true;
    const submitBtn = form.querySelector('button');
    if (submitBtn) submitBtn.disabled = true;

    const loadingRow = addMessage('', 'loading');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history })
      });

      const data = await response.json().catch(() => ({}));
      loadingRow.remove();

      if (!response.ok) {
        throw new Error(data.error || 'Layanan asisten sedang tidak dapat diakses.');
      }

      addMessage(data.reply, 'bot');
      history.push({ role: 'user', parts: [{ text: message }] });
      history.push({ role: 'model', parts: [{ text: data.reply }] });

      // Keep maximum 8 turns
      if (history.length > 16) history.splice(0, 2);
    } catch (error) {
      loadingRow.remove();
      const errorMessage = error instanceof TypeError || error instanceof SyntaxError
        ? 'Maaf, koneksi ke layanan AI sedang terganggu. Coba kembali beberapa saat lagi.'
        : error.message || 'Maaf, layanan AI sedang mengalami kendala. Coba kembali beberapa saat lagi.';
      addMessage(errorMessage, 'bot ai-message--error');
    } finally {
      input.disabled = false;
      if (submitBtn) submitBtn.disabled = false;
      input.focus();
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    handleSendMessage();
  });

  // Quick Action Chips listener
  if (chipsContainer) {
    chipsContainer.addEventListener('click', (e) => {
      const chip = e.target.closest('.ai-chip');
      if (chip && chip.dataset.query) {
        handleSendMessage(chip.dataset.query);
      }
    });
  }
}

mountChat().catch((error) => console.error('Chat initialization error:', error));
