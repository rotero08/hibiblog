/*
 * Hibi: shared behaviour for every page (custom pages and Starlight guides).
 * Plain script, loaded like leaves.js; safe to evaluate more than once.
 *
 *   • day / night switch with a circular wipe
 *   • mobile menu, dropdown
 *   • things animate in as they scroll into view (tickets get punched)
 *   • tickets lean towards the pointer
 *   • reading progress: a little train along the bottom of the nav
 *   • stamp rally: reading a guide chapter to the end collects its stamp
 *   • the stamp book's owner: the name given on /sellos/, shown where it is used
 */
(function () {
  if (window.__hibi) return;
  window.__hibi = true;

  var root = document.documentElement;
  var STAMPS = 'hibi-stamps';
  var OWNER = 'hibi-name';
  var STAMPS_OFF = 'hibi-stamps-off';
  var reduce = function () {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };
  root.classList.add('fx');

  /* ---------- storage ---------- */
  var store = {
    get: function (k) {
      try {
        return localStorage.getItem(k);
      } catch (e) {
        return null;
      }
    },
    set: function (k, v) {
      try {
        localStorage.setItem(k, v);
      } catch (e) {}
    },
  };
  function readStamps() {
    try {
      return JSON.parse(store.get(STAMPS) || '{}') || {};
    } catch (e) {
      return {};
    }
  }
  var trim = function (p) {
    return p.replace(/\/+$/, '') || '/';
  };
  window.hibiStamps = { read: readStamps, key: trim };
  var esc = function (text) {
    return String(text).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  /* ---------- rough ink, for stamps ---------- */
  function addInkFilter() {
    if (document.getElementById('hibi-ink')) return;
    var holder = document.createElement('div');
    holder.setAttribute('aria-hidden', 'true');
    holder.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    holder.innerHTML =
      '<svg width="0" height="0"><defs><filter id="hibi-ink" x="-6%" y="-6%" width="112%" height="112%">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="4" result="w"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="w" scale="2.2" xChannelSelector="R" yChannelSelector="G" result="d"/>' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" seed="9" result="g"/>' +
      '<feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -6 0 0 0 4.9" result="h"/>' +
      '<feComposite in="d" in2="h" operator="in"/></filter></defs></svg>';
    document.body.appendChild(holder);
    root.classList.add('has-ink');
  }

  /* ---------- theme ---------- */
  function setTheme(theme) {
    root.dataset.theme = theme;
    store.set('starlight-theme', theme);
  }
  function toggleTheme(button) {
    var next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    if (!document.startViewTransition || reduce()) return setTheme(next);
    var r = button.getBoundingClientRect();
    root.style.setProperty('--tx', r.left + r.width / 2 + 'px');
    root.style.setProperty('--ty', r.top + r.height / 2 + 'px');
    root.classList.add('theme-wipe');
    document
      .startViewTransition(function () {
        setTheme(next);
      })
      .finished.finally(function () {
        root.classList.remove('theme-wipe');
      });
  }

  /* ---------- nav ---------- */
  function closeDropdowns() {
    document.querySelectorAll('[data-dropdown-menu].open').forEach(function (m) {
      m.classList.remove('open');
    });
    document.querySelectorAll('[data-dropdown-toggle][aria-expanded="true"]').forEach(function (b) {
      b.setAttribute('aria-expanded', 'false');
    });
  }
  function closeMenu() {
    document.querySelectorAll('.main-nav.menu-open').forEach(function (n) {
      n.classList.remove('menu-open');
    });
    document.querySelectorAll('[data-menu-toggle]').forEach(function (b) {
      b.setAttribute('aria-expanded', 'false');
    });
  }

  document.addEventListener('click', function (e) {
    var t = e.target;
    var theme = t.closest('[data-theme-toggle]');
    if (theme) return toggleTheme(theme);

    var burger = t.closest('[data-menu-toggle]');
    if (burger) {
      var nav = burger.closest('.main-nav');
      var open = !nav.classList.contains('menu-open');
      nav.classList.toggle('menu-open', open);
      burger.setAttribute('aria-expanded', String(open));
      return;
    }

    var toggle = t.closest('[data-stamps-toggle]');
    if (toggle) {
      store.set(STAMPS_OFF, stampsOff() ? '0' : '1');
      markStampsOff();
      watchStampCards();
      return;
    }

    var allReset = t.closest('[data-all-reset]');
    if (allReset) {
      // ask once more before throwing everything away
      if (!allReset.hasAttribute('data-armed')) {
        allReset.setAttribute('data-armed', '');
        allReset.setAttribute('data-label', allReset.textContent);
        allReset.textContent = '¿Seguro? Pulsa otra vez.';
        setTimeout(function () {
          if (!allReset.hasAttribute('data-armed')) return;
          allReset.removeAttribute('data-armed');
          allReset.textContent = allReset.getAttribute('data-label');
        }, 5000);
        return;
      }
      allReset.removeAttribute('data-armed');
      allReset.textContent = allReset.getAttribute('data-label');
      store.set(STAMPS, '{}');
      try {
        localStorage.removeItem(OWNER);
        localStorage.removeItem(OWNER + '-kana');
      } catch (err) {}
      markStamps();
      markOwner();
      if (document.querySelector('[data-nh-input]')) location.reload();
      return;
    }

    var nameReset = t.closest('[data-name-reset]');
    if (nameReset) {
      if (!nameReset.hasAttribute('data-armed')) {
        nameReset.setAttribute('data-armed', '');
        nameReset.setAttribute('data-label', nameReset.textContent);
        nameReset.textContent = '¿Seguro? Se borra tu nombre. Pulsa otra vez.';
        setTimeout(function () {
          if (!nameReset.hasAttribute('data-armed')) return;
          nameReset.removeAttribute('data-armed');
          nameReset.textContent = nameReset.getAttribute('data-label');
        }, 5000);
        return;
      }
      try {
        localStorage.removeItem(OWNER);
        localStorage.removeItem(OWNER + '-kana');
      } catch (err) {}
      markOwner();
      // the name box on /sellos/ reads the name once, so start it again
      if (document.querySelector('[data-nh-input]')) location.reload();
      else {
        nameReset.removeAttribute('data-armed');
        nameReset.textContent = nameReset.getAttribute('data-label');
      }
      return;
    }

    var dd = t.closest('[data-dropdown-toggle]');
    if (dd) {
      var menu = dd.parentElement.querySelector('[data-dropdown-menu]');
      var willOpen = menu && !menu.classList.contains('open');
      closeDropdowns();
      if (willOpen) {
        menu.classList.add('open');
        dd.setAttribute('aria-expanded', 'true');
      }
      return;
    }
    // inside an open panel, only a link closes it
    if (t.closest('[data-dropdown-menu].open') && !t.closest('a')) return;
    closeDropdowns();
    if (t.closest('.nav-links a')) closeMenu();

    var reset = t.closest('[data-stamps-reset]');
    if (reset) {
      // ask once more before throwing the stamps away
      if (!reset.hasAttribute('data-armed')) {
        reset.setAttribute('data-armed', '');
        reset.setAttribute('data-label', reset.textContent);
        reset.textContent = '¿Seguro? Se borran todos los sellos. Pulsa otra vez.';
        setTimeout(function () {
          if (!reset.hasAttribute('data-armed')) return;
          reset.removeAttribute('data-armed');
          reset.textContent = reset.getAttribute('data-label');
        }, 5000);
        return;
      }
      reset.removeAttribute('data-armed');
      reset.textContent = reset.getAttribute('data-label');
      store.set(STAMPS, '{}');
      markStamps();
    }
  });
  // [data-hover] menus open on hover with a mouse, and when focus moves into
  // them (the split menus also have their caret, for touch)
  var hoverTimer;
  function hoverItem(e) {
    return e.target.closest ? e.target.closest('[data-hover]') : null;
  }
  function openHover(item) {
    clearTimeout(hoverTimer);
    var menu = item.querySelector('[data-dropdown-menu]');
    if (!menu || menu.classList.contains('open')) return;
    closeDropdowns();
    menu.classList.add('open');
    var toggle = item.querySelector('[data-dropdown-toggle]');
    if (toggle) toggle.setAttribute('aria-expanded', 'true');
  }
  document.addEventListener('pointerover', function (e) {
    var item = e.pointerType === 'mouse' && hoverItem(e);
    if (item) openHover(item);
  });
  document.addEventListener('pointerout', function (e) {
    var item = e.pointerType === 'mouse' && hoverItem(e);
    if (!item || item.contains(e.relatedTarget)) return;
    hoverTimer = setTimeout(closeDropdowns, 220);
  });
  document.addEventListener('focusin', function (e) {
    var item = hoverItem(e);
    // only for keyboard focus: a click on the link must not flash the panel open
    if (item && e.target.matches(':focus-visible')) openHover(item);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    // hand the focus back to the button that opened the panel
    var open = document.querySelector('[data-dropdown-toggle][aria-expanded="true"]');
    closeDropdowns();
    closeMenu();
    if (open && open.parentElement.contains(document.activeElement)) open.focus();
  });
  // tabbing out of an open panel closes it
  document.addEventListener('focusin', function (e) {
    var open = document.querySelector('[data-dropdown-menu].open');
    if (open && !open.parentElement.contains(e.target)) closeDropdowns();
  });

  /* ---------- tickets lean towards the pointer ---------- */
  document.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch' || reduce()) return;
    var card = e.target.closest && e.target.closest('[data-tilt]');
    document.querySelectorAll('[data-tilt].is-tilting').forEach(function (el) {
      if (el !== card) {
        el.classList.remove('is-tilting');
        el.style.removeProperty('--tilt-x');
        el.style.removeProperty('--tilt-y');
      }
    });
    if (!card) return;
    var r = card.getBoundingClientRect();
    var x = (e.clientX - r.left) / r.width - 0.5;
    var y = (e.clientY - r.top) / r.height - 0.5;
    var max = Math.min(5, 1400 / r.width);
    card.classList.add('is-tilting');
    card.style.setProperty('--tilt-x', (-y * max).toFixed(2) + 'deg');
    card.style.setProperty('--tilt-y', (x * max).toFixed(2) + 'deg');
  });

  /* ---------- stamps ---------- */
  // Every [data-stamp-key] element (a station in a list, a slot in the book, a
  // chapter's tag) is marked .is-stamped once its chapter has been read.
  // Inside a [data-stamp-scope], counts and progress are for that scope only and
  // the first station still missing its stamp is marked .is-next.
  function markStamps() {
    var book = readStamps();
    var total = Object.keys(book).length;

    document.querySelectorAll('[data-stamp-key]').forEach(function (el) {
      var date = book[trim(el.getAttribute('data-stamp-key'))];
      el.classList.toggle('is-stamped', Boolean(date));
      var when = el.querySelector('[data-stamped-on]');
      if (when) when.textContent = date ? date.replace(/-/g, '.') : '';
    });

    document.querySelectorAll('[data-stamp-scope]').forEach(function (scope) {
      var keys = scope.querySelectorAll('[data-stamp-key]');
      var done = 0;
      var next = null;
      keys.forEach(function (el) {
        el.classList.remove('is-next');
        if (el.classList.contains('is-stamped')) done++;
        else if (!next) next = el;
      });
      if (next) next.classList.add('is-next');
      scope.style.setProperty('--stamp-progress', keys.length ? (done / keys.length).toFixed(4) : '0');
      scope.classList.toggle('is-complete', keys.length > 0 && done === keys.length);
    });

    document.querySelectorAll('[data-stamp-count]').forEach(function (el) {
      var scope = el.closest('[data-stamp-scope]');
      el.textContent = String(scope ? scope.querySelectorAll('[data-stamp-key].is-stamped').length : total);
    });
    // how full the book is, for anything that changes with it (the counter in
    // the nav, its panel): none / some / all, and the number itself
    var totalEl = document.querySelector('[data-stamp-total]');
    var all = totalEl ? Number(totalEl.getAttribute('data-stamp-total')) : 0;
    root.setAttribute('data-stamps', total === 0 ? 'none' : all && total >= all ? 'all' : 'some');
    root.style.setProperty('--stamps', String(total));
    // 達磨: one eye is painted when a goal is set, the other when it is reached
    document.querySelectorAll('[data-daruma]').forEach(function (el) {
      var all = Number(el.getAttribute('data-total')) || 1;
      el.setAttribute('data-eyes', total >= all ? '2' : total > 0 ? '1' : '0');
    });
    document.dispatchEvent(new CustomEvent('hibi:stamps', { detail: { book: book, count: total } }));
  }

  /* ---------- stamps on / off ---------- */
  // A reader can switch every stamp-related piece of the site off (CSS hides it
  // while <html data-stamps-off> is set). The collected stamps are kept.
  function stampsOff() {
    return store.get(STAMPS_OFF) === '1';
  }
  function markStampsOff() {
    root.toggleAttribute('data-stamps-off', stampsOff());
  }

  /* ---------- the book's owner ---------- */
  // The name is given on /sellos/ (NameHanko.astro) and kept in this browser.
  function owner() {
    return (store.get(OWNER) || '').trim();
  }
  function markOwner() {
    var name = owner();
    var kana = name ? store.get(OWNER + '-kana') || '' : '';
    root.toggleAttribute('data-owner', Boolean(name));
    document.querySelectorAll('[data-owner-name]').forEach(function (el) { el.textContent = name; });
    document.querySelectorAll('[data-owner-kana]').forEach(function (el) { el.textContent = kana; });
    // the small name box in the stamp menu shows the current name, unless it is being typed in
    document.querySelectorAll('[data-owner-input]').forEach(function (el) {
      if (el !== document.activeElement) el.value = name;
    });
  }
  document.addEventListener('hibi:owner', markOwner);

  function toast(html) {
    var old = document.querySelector('.hibi-toast');
    if (old) old.remove();
    var t = document.createElement('div');
    t.className = 'hibi-toast';
    t.setAttribute('role', 'status');
    t.innerHTML = html;
    document.body.appendChild(t);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { t.classList.add('is-in'); });
    });
    var hide = function () {
      t.classList.remove('is-in');
      setTimeout(function () { t.remove(); }, 600);
    };
    var timer = setTimeout(hide, 6500);
    t.addEventListener('pointerenter', function () { clearTimeout(timer); });
    t.addEventListener('pointerleave', function () { timer = setTimeout(hide, 2500); });
  }

  var pageObservers = [];
  // a chapter page has one card (the station board); the single-page guide has one per chapter
  function watchStampCards() {
    if (stampsOff()) return;
    document.querySelectorAll('[data-stamp-card]').forEach(watchStampCard);
  }
  function watchStampCard(card) {
    var key = trim(card.getAttribute('data-stamp-card'));
    if (readStamps()[key]) return card.classList.add('is-stamped');
    var io = new IntersectionObserver(
      function (entries) {
        if (!entries.some(function (en) { return en.isIntersecting; })) return;
        io.disconnect();
        var book = readStamps();
        var d = new Date();
        book[key] = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        store.set(STAMPS, JSON.stringify(book));
        card.classList.add('is-stamped', 'is-pressing');
        markStamps();
        var count = Object.keys(book).length;
        var all = Number(card.getAttribute('data-total')) || count;
        var name = card.getAttribute('data-station') || '';
        var who = owner();
        // a short line next to the stamp, gone after a few seconds
        var say = card.querySelector('[data-stamp-say]');
        if (say) {
          say.textContent = '¡Sello conseguido' + (who ? ', ' + who : '') + '! ' + count + ' de ' + all;
          say.classList.add('is-on');
          setTimeout(function () { say.classList.remove('is-on'); }, 4500);
        } else {
          toast(
            '<span class="hibi-toast-seal">済</span>' +
              '<span><b>¡Sello conseguido' + (who ? ', ' + esc(who) : '') + '!</b> ' + esc(name) + ' · llevas ' + count + ' de ' + all + '</span>' +
              '<a href="/sellos/" data-astro-reload>Ver libreta →</a>'
          );
        }
        // the counter in the nav takes the stamp too
        document.querySelectorAll('.nav-book-chip').forEach(function (chip) {
          chip.classList.remove('is-bump');
          void chip.offsetWidth;
          chip.classList.add('is-bump');
        });
      },
      { threshold: 0.7 }
    );
    io.observe(card);
    pageObservers.push(io);
  }

  /* ---------- reveal on scroll ---------- */
  function watchReveals() {
    var targets = document.querySelectorAll('[data-reveal], [data-inview]');
    if (!targets.length) return;
    var io = new IntersectionObserver(
      function (entries) {
        var batch = 0;
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var el = en.target;
          io.unobserve(el);
          if (el.hasAttribute('data-reveal') && el.animate && !reduce()) {
            var from = el.getAttribute('data-reveal') === 'left' ? '-22px 0' : '0 18px';
            el.animate(
              [
                { opacity: 0, translate: from },
                { opacity: 1, translate: '0 0' },
              ],
              // things that arrive together come in one after another
              { duration: 700, delay: Math.min(batch++, 6) * 80, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)', fill: 'backwards' }
            );
          }
          el.classList.add('is-in');
        });
      },
      { rootMargin: '0px 0px -5% 0px', threshold: 0.01 }
    );
    targets.forEach(function (t) { io.observe(t); });
    pageObservers.push(io);
  }

  /* ---------- scroll: progress train + hero drift ---------- */
  var queued = false;
  function onScroll() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () {
      queued = false;
      var max = document.documentElement.scrollHeight - innerHeight;
      var p = max > 40 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
      root.style.setProperty('--scroll', String(Math.round(scrollY)));
      document.querySelectorAll('.nav-rail').forEach(function (rail) {
        rail.style.setProperty('--p', p.toFixed(4));
        rail.classList.toggle('is-on', scrollY > 80 && max > 500);
      });
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });

  /* ---------- the time in Japan (hero) ---------- */
  var WEEK = { Sun: '日', Mon: '月', Tue: '火', Wed: '水', Thu: '木', Fri: '金', Sat: '土' };
  function japanClock() {
    if (!document.querySelector('[data-jp-time]')) return;
    var now = new Date();
    var parts = {};
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23', weekday: 'short',
    }).formatToParts(now).forEach(function (p) { parts[p.type] = p.value; });
    var set = function (sel, text) {
      document.querySelectorAll(sel).forEach(function (n) { if (n.textContent !== text) n.textContent = text; });
    };
    set('[data-jp-time]', parts.hour + ':' + parts.minute);
    set('[data-jp-date]', parts.year + '.' + parts.month + '.' + parts.day);
    set('[data-jp-weekday]', WEEK[parts.weekday] || '');
    set('[data-jp-era]', new Intl.DateTimeFormat('ja-JP-u-ca-japanese', { timeZone: 'Asia/Tokyo', era: 'long', year: 'numeric' }).format(now));
  }
  setInterval(japanClock, 15000);

  /* ---------- per page ---------- */
  function init() {
    pageObservers.forEach(function (io) { io.disconnect(); });
    pageObservers = [];
    addInkFilter();
    closeMenu();
    closeDropdowns();
    markStampsOff();
    markStamps();
    markOwner();
    watchStampCards();
    watchReveals();
    japanClock();
    onScroll();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
  document.addEventListener('astro:page-load', init);
  // The router swaps in a fresh <html>; carry the theme and our flags across.
  document.addEventListener('astro:before-swap', function (e) {
    var next = e.newDocument.documentElement;
    next.dataset.theme = root.dataset.theme || 'light';
    next.classList.add('fx');
    next.toggleAttribute('data-stamps-off', stampsOff());
  });
  document.addEventListener('astro:after-swap', function () {
    root = document.documentElement;
    root.classList.add('fx');
    // fill in the counters before the new page is shown, so they don't tick up from 0
    markStamps();
    markOwner();
  });
})();
