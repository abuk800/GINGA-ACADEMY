/* ==========================================================================
   FREISTIL KIDS – Seitenlogik (ohne Abhängigkeiten, ohne Tracking)
   ========================================================================== */
(function () {
  'use strict';

  var C = window.FSK_CONFIG || {};
  var root = document.documentElement;
  var FSK = (window.FSK = window.FSK || {});

  /* ---------- Helfer ---------- */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function store(key, val) {
    try {
      if (val === undefined) return localStorage.getItem(key);
      if (val === null) localStorage.removeItem(key); else localStorage.setItem(key, val);
    } catch (e) { return null; }
  }
  var params = new URLSearchParams(location.search);
  var isXmas = !root.classList.contains('xmas-over');

  /* ---------- Weihnachts-Banner ---------- */
  var banner = $('#xmas-banner');
  if (banner && isXmas && store('fsk-xmas-banner') !== 'closed') {
    banner.hidden = false;
    var closeBtn = $('.xmas-banner__close', banner);
    if (closeBtn) closeBtn.addEventListener('click', function () {
      banner.hidden = true;
      store('fsk-xmas-banner', 'closed');
    });
  }

  /* ---------- Header: Schatten beim Scrollen ---------- */
  var header = $('.site-header');
  function onScroll() { if (header) header.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobiles Menü ---------- */
  var toggle = $('.menu-toggle');
  var menu = $('#mobile-menu');
  function setMenu(open) {
    root.classList.toggle('menu-open', open);
    if (toggle) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
    }
    if (menu) menu.toggleAttribute('inert', !open);
  }
  if (toggle && menu) {
    setMenu(false);
    toggle.addEventListener('click', function () { setMenu(!root.classList.contains('menu-open')); });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    window.matchMedia('(min-width: 1000px)').addEventListener('change', function () { setMenu(false); });
  }

  /* ---------- Herkunft (z. B. Flyer-QR-Code) an Buchungs-Links weitergeben ----------
     Keine Cookies, kein Tracking: Der Parameter ?quelle=… wandert nur per Link
     ins Formular (verstecktes Feld) – so sind Flyer-Anmeldungen zählbar. */
  var source = (params.get('quelle') || '').replace(/[^a-z0-9_-]/gi, '').slice(0, 40);
  if (source) {
    $$('a[href]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!/^(anmeldung|gutschein)\.html/.test(href) && !/^\.\.\/(anmeldung|gutschein)\.html/.test(href)) return;
      var parts = href.split('#');
      parts[0] += (parts[0].indexOf('?') > -1 ? '&' : '?') + 'quelle=' + encodeURIComponent(source);
      a.setAttribute('href', parts.join('#'));
    });
    $$('input[name="quelle"]').forEach(function (i) { i.value = source; });
    if (source === 'flyer') root.classList.add('from-flyer');
  }

  /* ---------- Freie Plätze (nur wenn echt & gepflegt) ---------- */
  if (typeof C.freeSpots === 'number' && C.freeSpots >= 0 && !C.bookedOut) {
    $$('[data-free-spots]').forEach(function (el) {
      $('[data-free-spots-num]', el).textContent = String(C.freeSpots);
      el.hidden = false;
    });
  }

  /* ---------- Ausgebucht: Buttons werden zu Warteliste ---------- */
  if (C.bookedOut) {
    $$('[data-waitlist-label]').forEach(function (el) {
      var label = el.querySelector('[data-label]') || el;
      label.textContent = el.getAttribute('data-waitlist-label');
    });
  }

  /* ---------- Sticky-CTA (mobil) ---------- */
  var sticky = $('.sticky-cta');
  if (sticky) {
    var hideWhen = $$('[data-hide-sticky]');
    if (!('IntersectionObserver' in window) || !hideWhen.length) {
      sticky.classList.add('is-visible');
    } else {
      var visibleSet = new Set();
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { en.isIntersecting ? visibleSet.add(en.target) : visibleSet.delete(en.target); });
        sticky.classList.toggle('is-visible', visibleSet.size === 0);
      }, { threshold: 0.15 });
      hideWhen.forEach(function (el) { io.observe(el); });
    }
  }

  /* ---------- Dezente Scroll-Animationen ---------- */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); rio.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { rio.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Jahr im Footer ---------- */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ==========================================================================
     Datenschutz-Hinweis / Einwilligung
     - Ohne optionale Dienste: reiner Info-Hinweis (es wird nichts getrackt).
     - Mit optionalen Diensten (config.optionalServices): echte Einwilligung,
       nichts vorausgewählt; Dienste starten erst nach Zustimmung über FSK.onConsent().
     ========================================================================== */
  var CONSENT_KEY = 'fsk-consent-v1';
  var services = Array.isArray(C.optionalServices) ? C.optionalServices : [];
  var consentListeners = [];
  function readConsent() { try { return JSON.parse(store(CONSENT_KEY) || 'null'); } catch (e) { return null; } }
  FSK.onConsent = function (serviceId, fn) {
    consentListeners.push({ id: serviceId, fn: fn });
    var c = readConsent();
    if (c && c.services && c.services[serviceId]) fn();
  };
  function saveConsent(granted) {
    store(CONSENT_KEY, JSON.stringify({ date: new Date().toISOString(), services: granted }));
    consentListeners.forEach(function (l) { if (granted[l.id]) l.fn(); });
  }
  function buildConsent() {
    var box = document.createElement('section');
    box.className = 'consent';
    box.setAttribute('aria-labelledby', 'consent-title');
    box.setAttribute('role', 'dialog');
    var policy = (document.body.getAttribute('data-root') || '') + 'datenschutz.html';
    if (!services.length) {
      box.innerHTML =
        '<h2 id="consent-title">Kurz zum Datenschutz</h2>' +
        '<p>Wir verwenden keine Tracking- oder Werbe-Cookies und laden keine Inhalte von Drittanbietern. ' +
        'Gespeichert wird nur, was die Seite technisch braucht – zum Beispiel, dass ihr diesen Hinweis gelesen habt. ' +
        '<a href="' + policy + '">Mehr erfahren</a></p>' +
        '<div class="btn-row"><button type="button" class="btn btn--green" data-consent="ok">Alles klar</button></div>';
    } else {
      var opts = services.map(function (s) {
        return '<label><input type="checkbox" name="consent-service" value="' + s.id + '"> ' + s.name + '</label>';
      }).join('');
      box.innerHTML =
        '<h2 id="consent-title">Eure Privatsphäre</h2>' +
        '<p>Technisch notwendige Speicherung ist immer aktiv. Alles Weitere nur, wenn ihr zustimmt. ' +
        '<a href="' + policy + '">Datenschutz</a></p>' +
        '<div class="consent__options">' + opts + '</div>' +
        '<div class="btn-row">' +
        '<button type="button" class="btn btn--secondary" data-consent="none">Nur notwendige</button>' +
        '<button type="button" class="btn btn--secondary" data-consent="selected">Auswahl speichern</button>' +
        '<button type="button" class="btn btn--green" data-consent="all">Alle akzeptieren</button>' +
        '</div>';
    }
    box.hidden = true;
    document.body.appendChild(box);
    box.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-consent]');
      if (!btn) return;
      var mode = btn.getAttribute('data-consent');
      var granted = {};
      services.forEach(function (s) {
        var cb = box.querySelector('input[value="' + s.id + '"]');
        granted[s.id] = mode === 'all' || (mode === 'selected' && cb && cb.checked);
      });
      saveConsent(granted);
      box.hidden = true;
    });
    return box;
  }
  var consentBox = buildConsent();
  function openConsent() {
    var c = readConsent();
    services.forEach(function (s) {
      var cb = consentBox.querySelector('input[value="' + s.id + '"]');
      if (cb) cb.checked = !!(c && c.services && c.services[s.id]);
    });
    consentBox.hidden = false;
  }
  if (!readConsent()) setTimeout(openConsent, 600);
  $$('[data-open-consent]').forEach(function (b) { b.addEventListener('click', openConsent); });

  /* ==========================================================================
     Formulare
     ========================================================================== */
  var DEMO = 'Demo-Modus';

  function fieldOf(el) { return el.closest('.field') || el.closest('fieldset') || el.parentElement; }
  function setError(el, msg) {
    var f = fieldOf(el);
    if (!f) return;
    f.classList.toggle('has-error', !!msg);
    var err = f.querySelector('.field__error');
    if (err && msg) err.textContent = msg;
    $$('input, select, textarea', f).forEach(function (i) {
      if (msg) i.setAttribute('aria-invalid', 'true'); else i.removeAttribute('aria-invalid');
    });
  }
  function messageFor(el) {
    var v = el.validity;
    if (v.valueMissing) {
      if (el.type === 'radio') return el.getAttribute('data-msg') || 'Bitte wählt eine Option.';
      if (el.type === 'checkbox') return el.getAttribute('data-msg') || 'Bitte bestätigt diesen Punkt.';
      return el.getAttribute('data-msg') || 'Bitte ausfüllen.';
    }
    if (v.typeMismatch && el.type === 'email') return 'Bitte eine gültige E-Mail-Adresse angeben.';
    if (v.patternMismatch) return el.getAttribute('data-msg-pattern') || 'Bitte prüft die Eingabe.';
    if (v.rangeUnderflow || v.rangeOverflow) return el.getAttribute('data-msg-range') || 'Wert außerhalb des erlaubten Bereichs.';
    return el.validationMessage;
  }
  function validate(container) {
    var firstBad = null;
    var seenRadio = {};
    $$('input, select, textarea', container).forEach(function (el) {
      if (el.disabled || el.type === 'hidden' || el.closest('[hidden]')) return;
      if (el.type === 'radio') {
        if (seenRadio[el.name]) return;
        seenRadio[el.name] = true;
      }
      var ok = el.checkValidity();
      setError(el, ok ? '' : messageFor(el));
      if (!ok && !firstBad) firstBad = el;
    });
    if (firstBad) {
      firstBad.focus({ preventScroll: true });
      (fieldOf(firstBad) || firstBad).scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return !firstBad;
  }
  function liveValidation(form) {
    form.addEventListener('change', function (e) {
      var f = fieldOf(e.target);
      if (f && f.classList.contains('has-error') && e.target.checkValidity()) setError(e.target, '');
    });
    form.addEventListener('input', function (e) {
      var f = fieldOf(e.target);
      if (f && f.classList.contains('has-error') && e.target.checkValidity()) setError(e.target, '');
    });
  }
  function collect(container) {
    var data = {};
    $$('input, select, textarea', container).forEach(function (el) {
      if (!el.name || el.disabled) return;
      if ((el.type === 'radio' || el.type === 'checkbox') && !el.checked) return;
      data[el.name] = el.type === 'checkbox' ? true : el.value.trim();
    });
    return data;
  }
  function makeRef(prefix) {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var s = '';
    var rnd = (window.crypto && crypto.getRandomValues) ? crypto.getRandomValues(new Uint8Array(6)) : [1, 2, 3, 4, 5, 6].map(function () { return Math.random() * 255; });
    for (var i = 0; i < 6; i++) s += chars[rnd[i] % chars.length];
    return prefix + '-' + s;
  }
  /* Versand an den konfigurierten Endpunkt (oder Demo) */
  function send(endpointKey, payload) {
    var url = C.endpoints && C.endpoints[endpointKey];
    if (!url) {
      return new Promise(function (resolve) {
        setTimeout(function () { resolve({ demo: true, reference: payload.referenz }); }, 500);
      });
    }
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json().catch(function () { return {}; });
    });
  }
  /* Integrationspunkt Zahlungsanbieter – hier später Stripe/PayPal/Mollie o. ä. anbinden. */
  FSK.startPayment = function (order, response) {
    if (response && response.paymentUrl) {
      window.location.href = response.paymentUrl;
      return true;
    }
    return false; // keine Online-Zahlung → Zahlungsinfos kommen per E-Mail
  };
  function busy(btn, on) {
    if (!btn) return;
    btn.disabled = on;
    btn.setAttribute('aria-busy', String(on));
    var label = btn.querySelector('[data-label]') || btn;
    if (on) { btn.dataset.original = label.textContent; label.textContent = 'Wird gesendet …'; }
    else if (btn.dataset.original) { label.textContent = btn.dataset.original; }
  }
  function showStep(form, n) {
    $$('.form-step', form.closest('.form-card') || form).forEach(function (s) {
      s.hidden = s.getAttribute('data-step') !== String(n);
    });
    $$('.progress li', form.closest('.form-card') || form).forEach(function (li, i) {
      li.classList.toggle('is-active', i + 1 === n);
      li.classList.toggle('is-done', i + 1 < n);
    });
    var card = form.closest('.form-card') || form;
    var top = card.getBoundingClientRect().top + window.scrollY - (header ? header.offsetHeight : 0) - 16;
    window.scrollTo({ top: top, behavior: 'smooth' });
    var focusTarget = $('.form-step[data-step="' + n + '"] h2, .form-step[data-step="' + n + '"] legend', card);
    if (focusTarget) { focusTarget.setAttribute('tabindex', '-1'); focusTarget.focus({ preventScroll: true }); }
  }
  function alertBox(form, msg) {
    var box = $('.form-alert', form) || $('.form-alert', form.closest('.form-card') || form);
    if (!box) return;
    box.textContent = msg || '';
    box.classList.toggle('is-visible', !!msg);
  }
  function fillSummary(el, rows) {
    if (!el) return;
    el.innerHTML = '';
    rows.forEach(function (r) {
      if (!r[1]) return;
      var dt = document.createElement('dt'); dt.textContent = r[0];
      var dd = document.createElement('dd'); dd.textContent = r[1];
      el.appendChild(dt); el.appendChild(dd);
    });
  }
  function showDemoNotes() {
    $$('[data-demo-note]').forEach(function (n) { n.hidden = false; });
  }

  /* ---------- Anmeldung ---------- */
  var regForm = $('#form-anmeldung');
  if (regForm) {
    var waitlist = !!C.bookedOut;
    if (!C.endpoints || !C.endpoints.anmeldung) showDemoNotes();
    liveValidation(regForm);
    $$('[data-hide-waitlist] input, [data-hide-waitlist] select', regForm).forEach(function (el) { if (waitlist) el.disabled = true; });
    var typeInput = $('input[name="art"]', regForm);
    if (typeInput) typeInput.value = waitlist ? 'warteliste' : 'anmeldung';
    var codeParam = (params.get('code') || '').replace(/[^a-z0-9-]/gi, '').slice(0, 24);
    if (codeParam && $('#gutscheincode')) $('#gutscheincode').value = codeParam.toUpperCase();

    /* Gutschein einlösen: Code wird Pflicht; eingetragener Code wählt die Zahlungsart vor */
    var codeInput = $('#gutscheincode');
    var voucherRadio = $('input[name="zahlungsart"][value="Gutschein"]', regForm);
    if (codeInput && voucherRadio) {
      codeInput.setAttribute('data-msg', 'Bitte den Gutschein-Code eintragen.');
      codeInput.addEventListener('input', function () {
        var anyChecked = $('input[name="zahlungsart"]:checked', regForm);
        if (codeInput.value.trim() && !anyChecked) { voucherRadio.checked = true; setError(voucherRadio, ''); }
      });
      if (codeInput.value.trim()) voucherRadio.checked = true;
    }

    var regRef = null;
    regForm.addEventListener('submit', function (e) {
      e.preventDefault();
      alertBox(regForm, '');
      if (codeInput && voucherRadio) codeInput.required = voucherRadio.checked && !voucherRadio.disabled;
      if (!validate(regForm)) { alertBox(regForm, 'Bitte prüft die markierten Felder.'); return; }
      var data = collect(regForm);
      regRef = makeRef(waitlist ? 'WL' : 'FK');
      data.referenz = regRef;
      data.zeitpunkt = new Date().toISOString();
      var btn = $('button[type="submit"]', regForm);
      busy(btn, true);
      send('anmeldung', data).then(function (res) {
        busy(btn, false);
        if (res && res.reference) regRef = res.reference;
        $$('[data-ref]').forEach(function (el) { el.textContent = regRef; });
        $$('[data-child-name]').forEach(function (el) { el.textContent = data.kind_vorname || 'euer Kind'; });
        $$('[data-parent-email]').forEach(function (el) { el.textContent = data.eltern_email; });
        fillSummary($('#reg-summary'), [
          ['Referenz', regRef],
          ['Kind', (data.kind_vorname || '') + ' ' + (data.kind_nachname || '') + (data.kind_alter ? ' (' + data.kind_alter + ' J.)' : '')],
          ['Elternteil', (data.eltern_vorname || '') + ' ' + (data.eltern_nachname || '')],
          ['E-Mail', data.eltern_email],
          ['Gutschein', data.gutscheincode],
          ['Zahlungsart', waitlist ? '' : data.zahlungsart],
          ['Status', waitlist ? 'Warteliste' : (data.gutscheincode ? 'Gutschein wird geprüft' : 'Zahlung offen')]
        ]);
        if (!waitlist && FSK.startPayment(data, res)) return;
        showStep(regForm, 2);
      }).catch(function () {
        busy(btn, false);
        alertBox(regForm, 'Das hat leider nicht geklappt. Bitte versucht es gleich noch einmal oder schreibt uns eine E-Mail.');
      });
    });

    var detailForm = $('#form-details');
    if (detailForm) {
      liveValidation(detailForm);
      detailForm.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!validate(detailForm)) return;
        var data = collect(detailForm);
        data.referenz = regRef;
        var btn = $('button[type="submit"]', detailForm);
        busy(btn, true);
        send('anmeldungDetails', data).then(function () {
          busy(btn, false);
          $('#details-later-note') && ($('#details-later-note').hidden = true);
          showStep(regForm, 3);
        }).catch(function () {
          busy(btn, false);
          alertBox(detailForm, 'Speichern hat nicht geklappt. Ihr könnt die Angaben auch einfach per E-Mail nachreichen.');
        });
      });
      var skip = $('[data-skip-details]');
      if (skip) skip.addEventListener('click', function () {
        $('#details-later-note') && ($('#details-later-note').hidden = false);
        showStep(regForm, 3);
      });
    }
  }

  /* ---------- Gutschein ---------- */
  var vForm = $('#form-gutschein');
  if (vForm) {
    if (!C.endpoints || !C.endpoints.gutschein) showDemoNotes();
    liveValidation(vForm);
    var qtyInput = $('#anzahl', vForm);
    var totalEl = $('[data-total]');
    var price = Number(C.price) || 149;
    var fmt = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 2 });
    function updateTotal() {
      var q = Math.min(10, Math.max(1, parseInt(qtyInput.value, 10) || 1));
      qtyInput.value = q;
      if (totalEl) totalEl.textContent = fmt.format(q * price);
      return q;
    }
    $$('[data-qty]', vForm).forEach(function (b) {
      b.addEventListener('click', function () {
        qtyInput.value = (parseInt(qtyInput.value, 10) || 1) + Number(b.getAttribute('data-qty'));
        updateTotal();
      });
    });
    qtyInput.addEventListener('change', updateTotal);
    updateTotal();

    vForm.addEventListener('submit', function (e) {
      e.preventDefault();
      alertBox(vForm, '');
      if (!validate(vForm)) { alertBox(vForm, 'Bitte prüft die markierten Felder.'); return; }
      var data = collect(vForm);
      data.anzahl = updateTotal();
      data.betrag_eur = data.anzahl * price;
      data.referenz = makeRef('GS');
      data.zeitpunkt = new Date().toISOString();
      var btn = $('button[type="submit"]', vForm);
      busy(btn, true);
      send('gutschein', data).then(function (res) {
        busy(btn, false);
        var ref = (res && res.reference) || data.referenz;
        $$('[data-ref]').forEach(function (el) { el.textContent = ref; });
        $$('[data-buyer-email]').forEach(function (el) { el.textContent = data.kaeufer_email; });
        fillSummary($('#voucher-summary'), [
          ['Bestellnummer', ref],
          ['Anzahl', data.anzahl + ' × ' + fmt.format(price)],
          ['Gesamt', fmt.format(data.betrag_eur)],
          ['Für', data.beschenkter],
          ['Zahlungsart', data.zahlungsart]
        ]);
        if (FSK.startPayment(data, res)) return;
        showStep(vForm, 2);
      }).catch(function () {
        busy(btn, false);
        alertBox(vForm, 'Das hat leider nicht geklappt. Bitte versucht es gleich noch einmal oder schreibt uns eine E-Mail.');
      });
    });
  }

  FSK.version = '1.0.0';
  FSK.isDemo = !(C.endpoints && (C.endpoints.anmeldung || C.endpoints.gutschein));
  if (FSK.isDemo && window.console) console.info('FREISTIL KIDS: ' + DEMO + ' – Formulare senden noch keine Daten (siehe assets/js/config.js).');
})();
