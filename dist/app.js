(function () {
  'use strict';
  var D = window.SAIYAR || { products: [], wa: '918980026639' };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  /* ---- mobile drawer ---- */
  var drawer = $('#drawer'), burger = $('#burger');
  function setDrawer(open) {
    drawer.classList.toggle('open', open); drawer.inert = !open;
    burger.setAttribute('aria-expanded', open); document.body.classList.toggle('lock', open);
    if (open) $('#drawer-x').focus(); else burger.focus();
  }
  burger.addEventListener('click', function () { setDrawer(true); });
  $('#drawer-x').addEventListener('click', function () { setDrawer(false); });
  $('#drawer-back').addEventListener('click', function () { setDrawer(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && drawer.classList.contains('open')) setDrawer(false); });

  /* ---- dialogs (native <dialog>: focus trap, Escape, focus return) ---- */
  function lockOnClose(d) {
    d.addEventListener('close', function () { document.body.classList.remove('lock'); });
    d.addEventListener('click', function (e) { if (e.target === d) d.close(); });
  }
  var qv = $('#qv'), search = $('#search');
  lockOnClose(qv); lockOnClose(search);

  function openQV(slug) {
    var p = D.products.filter(function (x) { return x.slug === slug; })[0];
    if (!p) return;
    $('#qv-body').innerHTML =
      '<button class="icon-btn qv-x" type="button" aria-label="Close quick view" id="qv-x"><svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
      '<div class="qv-img"><img src="' + esc(p.image) + '" alt="' + esc(p.alt) + '" width="800" height="1000"></div>' +
      '<div class="qv-info"><p class="card-cat">' + esc(p.categoryLabel) + '</p><h2 id="qv-title">' + esc(p.name) + '</h2>' +
      '<p class="pdp-price">' + esc(p.price) + '</p><p class="lead">' + esc(p.description) + '</p>' +
      '<ul class="qv-meta"><li>' + esc(p.color) + '</li>' + p.occasions.map(function (o) { return '<li>' + esc(o) + '</li>'; }).join('') + '</ul>' +
      '<div class="btn-row"><a class="btn btn-wa" target="_blank" rel="noopener noreferrer" href="' + esc(p.wa) + '">Enquire on WhatsApp</a>' +
      '<a class="btn btn-ghost" href="' + esc(p.url) + '">View Full Details</a></div>' +
      '<p class="note" style="margin-top:14px">Price, availability and sizing are confirmed by the studio.</p></div>';
    $('#qv-x').addEventListener('click', function () { qv.close(); });
    document.body.classList.add('lock'); qv.showModal();
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-qv]');
    if (t && !(e.metaKey || e.ctrlKey)) { e.preventDefault(); openQV(t.getAttribute('data-qv')); }
  });

  /* ---- search ---- */
  var sIn = $('#search-input'), sOut = $('#search-results');
  $('#open-search').addEventListener('click', function () { search.showModal(); document.body.classList.add('lock'); sIn.focus(); renderSearch(); });
  $('#search-x').addEventListener('click', function () { search.close(); });
  function renderSearch() {
    var q = sIn.value.trim().toLowerCase();
    var list = D.products.filter(function (p) {
      var hay = (p.name + ' ' + p.color + ' ' + p.categoryLabel + ' ' + p.occasions.join(' ')).toLowerCase();
      return q.split(/\s+/).every(function (w) { return hay.indexOf(w) > -1; });
    }).slice(0, 8);
    sOut.innerHTML = list.length ? list.map(function (p) {
      return '<a class="sr" href="' + esc(p.url) + '"><img src="' + esc(p.image) + '" alt="" width="52" height="65"><span><b>' + esc(p.name) + '</b><small>' + esc(p.categoryLabel) + ' · ' + esc(p.color) + '</small></span></a>';
    }).join('') : '<p class="sr-empty">No outfits found for “' + esc(sIn.value) + '”. Try a colour or occasion, or <a href="https://wa.me/' + D.wa + '">ask us on WhatsApp</a>.</p>';
  }
  sIn.addEventListener('input', renderSearch);

  /* ---- collection filters ---- */
  var grid = $('[data-grid]');
  if (grid) {
    var cards = $$('.card', grid), PAGE = 12, limit = PAGE;
    var fixedCat = grid.getAttribute('data-fixed-cat') || '';
    var el = { q: $('#f-q'), cat: $('#f-cat'), occ: $('#f-occ'), color: $('#f-color'), price: $('#f-price'), sort: $('#f-sort') };
    var count = $('#count'), empty = $('#empty'), more = $('#more');
    cards.forEach(function (c, i) { c.dataset.i = i; });
    var params = new URLSearchParams(location.search);
    [['q', 'q'], ['cat', 'category'], ['occ', 'occasion'], ['color', 'color'], ['price', 'price'], ['sort', 'sort']].forEach(function (m) {
      if (el[m[0]] && params.get(m[1])) el[m[0]].value = params.get(m[1]);
    });
    var apply = function (resetLimit) {
      if (resetLimit) limit = PAGE;
      var q = (el.q.value || '').trim().toLowerCase(), cat = fixedCat || (el.cat && el.cat.value) || '', occ = el.occ.value, col = el.color.value, max = el.price ? Number(el.price.value) : 0;
      var shown = cards.filter(function (c) {
        var d = c.dataset;
        if (cat && d.category !== cat) return false;
        if (occ && d.occ.split('|').indexOf(occ) < 0) return false;
        if (col && d.color !== col) return false;
        if (max && !(d.price && Number(d.price) <= max)) return false;
        return q.split(/\s+/).every(function (w) { return d.search.indexOf(w) > -1; });
      });
      var s = el.sort.value;
      var priced = function (c) { return c.dataset.price ? Number(c.dataset.price) : null; };
      shown.sort(function (a, b) {
        if (s === 'name-asc') return a.dataset.name.localeCompare(b.dataset.name);
        if (s === 'name-desc') return b.dataset.name.localeCompare(a.dataset.name);
        if (s === 'price-asc' || s === 'price-desc') {
          var pa = priced(a), pb = priced(b); if (pa === null && pb === null) return a.dataset.i - b.dataset.i; if (pa === null) return 1; if (pb === null) return -1;
          return s === 'price-asc' ? pa - pb : pb - pa;
        }
        return a.dataset.i - b.dataset.i;
      });
      cards.forEach(function (c) { c.hidden = true; });
      shown.forEach(function (c, i) { grid.appendChild(c); c.hidden = i >= limit; });
      count.textContent = shown.length + (shown.length === 1 ? ' outfit' : ' outfits');
      empty.hidden = shown.length > 0; more.hidden = shown.length <= limit;
      var out = new URLSearchParams();
      if (q) out.set('q', el.q.value.trim()); if (el.cat && el.cat.value) out.set('category', el.cat.value); if (occ) out.set('occasion', occ);
      if (col) out.set('color', col); if (max) out.set('price', el.price.value); if (s !== 'featured') out.set('sort', s);
      history.replaceState(null, '', location.pathname + (out.toString() ? '?' + out : ''));
    };
    Object.keys(el).forEach(function (k) { if (el[k]) el[k].addEventListener(el[k].tagName === 'INPUT' ? 'input' : 'change', function () { apply(true); }); });
    $('#f-reset').addEventListener('click', function () { Object.keys(el).forEach(function (k) { if (el[k]) el[k].value = k === 'sort' ? 'featured' : ''; }); apply(true); });
    more.addEventListener('click', function () { limit += PAGE; apply(false); });
    var ft = $('#filters-toggle'), fp = $('#filters-panel');
    ft.addEventListener('click', function () { var o = fp.classList.toggle('open'); ft.setAttribute('aria-expanded', o); });
    apply(true);
  }

  /* ---- product page: gallery thumbs + back link keeps previous filters ---- */
  $$('.thumb').forEach(function (b) {
    b.addEventListener('click', function () {
      $('#pdp-img').src = b.getAttribute('data-img');
      $$('.thumb').forEach(function (x) { x.removeAttribute('aria-current'); }); b.setAttribute('aria-current', 'true');
    });
  });
  var back = $('#back-link');
  if (back && document.referrer) {
    try { var r = new URL(document.referrer); if (r.origin === location.origin && r.pathname.indexOf('/collections/') === 0) back.href = r.pathname + r.search; } catch (e) {}
  }

  /* ---- contact form -> WhatsApp ---- */
  var form = $('#contact-form');
  if (form) {
    var fields = [['c-name', 'e-name', 'Please enter your name.'], ['c-phone', 'e-phone', 'Please enter a valid WhatsApp number (10 digits).'], ['c-cat', 'e-cat', 'Please choose an outfit category.']];
    form.addEventListener('submit', function (e) {
      e.preventDefault(); var ok = true, first = null;
      fields.forEach(function (f) {
        var inp = document.getElementById(f[0]), err = document.getElementById(f[1]), v = inp.value.trim();
        var bad = !v || (f[0] === 'c-phone' && v.replace(/\D/g, '').replace(/^91/, '').length < 10);
        err.textContent = bad ? f[2] : ''; inp.parentNode.classList.toggle('f-invalid', bad); inp.setAttribute('aria-invalid', bad);
        if (bad) { ok = false; first = first || inp; }
      });
      if (!ok) { first.focus(); return; }
      var g = function (id) { return document.getElementById(id).value.trim(); };
      var lines = ['Hello Saiyar Ethnic Studio, I would like to enquire about renting an outfit.', '', 'Name: ' + g('c-name'), 'WhatsApp: ' + g('c-phone'), 'Category: ' + g('c-cat')];
      if (g('c-occ')) lines.push('Occasion: ' + g('c-occ'));
      if (g('c-date')) lines.push('Required date: ' + g('c-date'));
      if (g('c-budget')) lines.push('Budget: ' + g('c-budget'));
      if (g('c-msg')) lines.push('Message: ' + g('c-msg'));
      lines.push('', 'Please share price, availability, sizing and rental terms.');
      var text = lines.join('\n'), url = 'https://wa.me/' + D.wa + '?text=' + encodeURIComponent(text);
      var w = window.open(url, '_blank', 'noopener');
      var fb = $('#fallback'); $('#fallback-text').value = text; $('#fallback-link').href = url;
      if (!w) { fb.hidden = false; fb.scrollIntoView({ block: 'nearest' }); }
    });
    $('#copy-btn').addEventListener('click', function () {
      var t = $('#fallback-text'); t.select();
      (navigator.clipboard ? navigator.clipboard.writeText(t.value) : Promise.reject()).catch(function () { document.execCommand('copy'); });
      this.textContent = 'Copied';
    });
  }
})();
