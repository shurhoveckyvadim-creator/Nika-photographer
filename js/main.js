(function () {
  'use strict';

  var S = window.SITE;
  if (!S) return;

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        var val = attrs[key];
        if (val == null || val === false) return;
        if (key === 'text') node.textContent = val;
        else if (key === 'html') node.innerHTML = val;
        else if (key === 'className') node.className = val;
        else node.setAttribute(key, val === true ? '' : val);
      });
    }
    (children || []).forEach(function (child) { if (child) node.appendChild(child); });
    return node;
  }

  // [ЗАПОЛНИТЬ] и [УТОЧНИТЬ] подсвечиваются, чтобы их было видно при правках
  function withTodo(text) {
    var safe = String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    return safe.replace(/\[(ЗАПОЛНИТЬ|УТОЧНИТЬ|СОГЛАСОВАТЬ С НИКОЙ)[^\]]*\]/g, '<span class="todo">$&</span>');
  }

  // Адаптивная картинка: <picture> с webp + jpg
  function picture(photo, sizes, opts) {
    opts = opts || {};
    var base = 'img/p/' + photo.id;
    var size = (window.PHOTO_SIZES || {})[photo.id] || [1400, 1400];
    var srcset = function (ext) { return base + '-600.' + ext + ' 600w, ' + base + '-1400.' + ext + ' ' + size[0] + 'w'; };
    var img = el('img', {
      src: base + '-600.jpg',
      srcset: srcset('jpg'),
      sizes: sizes,
      width: size[0],
      height: size[1],
      alt: photo.alt,
      loading: opts.eager ? null : 'lazy',
      decoding: 'async'
    });
    var pic = opts.target || el('picture');
    pic.appendChild(el('source', { type: 'image/webp', srcset: srcset('webp'), sizes: sizes }));
    pic.appendChild(img);
    return pic;
  }

  /* ---------- Контакты ---------- */
  $$('[data-contact]').forEach(function (a) {
    var c = S.contacts[a.getAttribute('data-contact')];
    if (!c) return;
    a.href = c.url;
    if (c.external) { a.target = '_blank'; a.rel = 'noopener'; }
  });
  $$('[data-contact-label="phone"]').forEach(function (n) { n.textContent = S.contacts.phone.label; });
  $('#year').textContent = new Date().getFullYear();

  /* ---------- Портфолио ---------- */
  var gallery = $('#gallery');
  var filters = $('#filters');
  var visiblePhotos = S.photos.slice();

  var categories = [{ id: 'all', label: 'Все' }].concat(S.categories.filter(function (c) {
    return S.photos.some(function (p) { return p.cat === c.id; });
  }));

  categories.forEach(function (cat, i) {
    var count = cat.id === 'all' ? S.photos.length : S.photos.filter(function (p) { return p.cat === cat.id; }).length;
    var btn = el('button', {
      type: 'button',
      className: 'filter',
      role: 'tab',
      'aria-selected': i === 0 ? 'true' : 'false',
      'data-cat': cat.id
    }, [document.createTextNode(cat.label), el('span', { className: 'filter__count', text: count })]);
    filters.appendChild(btn);
  });

  S.photos.forEach(function (photo, index) {
    var btn = el('button', { type: 'button', className: 'gallery__btn', 'aria-label': 'Открыть фото: ' + photo.alt, 'data-index': index });
    picture(photo, '(min-width: 1280px) 290px, (min-width: 768px) 33vw, 50vw', { target: btn });
    gallery.appendChild(el('li', { className: 'gallery__item', 'data-cat': photo.cat }, [btn]));
  });

  filters.addEventListener('click', function (e) {
    var btn = e.target.closest('.filter');
    if (!btn) return;
    var cat = btn.getAttribute('data-cat');
    $$('.filter', filters).forEach(function (b) { b.setAttribute('aria-selected', b === btn ? 'true' : 'false'); });
    $$('.gallery__item', gallery).forEach(function (item) {
      item.hidden = cat !== 'all' && item.getAttribute('data-cat') !== cat;
    });
    visiblePhotos = S.photos.filter(function (p) { return cat === 'all' || p.cat === cat; });
  });

  /* ---------- Лайтбокс ---------- */
  var lb = $('#lightbox');
  var lbImg = $('.lightbox__img', lb);
  var lbCaption = $('.lightbox__caption', lb);
  var current = 0;
  var lastFocus = null;

  function showPhoto(i) {
    current = (i + visiblePhotos.length) % visiblePhotos.length;
    var p = visiblePhotos[current];
    var base = 'img/p/' + p.id + '-1400';
    var supportsWebp = document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0;
    lbImg.src = base + (supportsWebp ? '.webp' : '.jpg');
    lbImg.alt = p.alt;
    lbCaption.textContent = (current + 1) + ' / ' + visiblePhotos.length;
  }

  function openLightbox(photo) {
    lastFocus = document.activeElement;
    showPhoto(visiblePhotos.indexOf(photo));
    lb.hidden = false;
    document.body.classList.add('is-locked');
    requestAnimationFrame(function () { lb.classList.add('is-open'); });
    $('.lightbox__close', lb).focus();
  }

  function closeLightbox() {
    lb.classList.remove('is-open');
    document.body.classList.remove('is-locked');
    setTimeout(function () { lb.hidden = true; lbImg.removeAttribute('src'); }, 250);
    if (lastFocus) lastFocus.focus();
  }

  gallery.addEventListener('click', function (e) {
    var btn = e.target.closest('.gallery__btn');
    if (btn) openLightbox(S.photos[+btn.getAttribute('data-index')]);
  });
  $('.lightbox__close', lb).addEventListener('click', closeLightbox);
  $('.lightbox__nav--prev', lb).addEventListener('click', function () { showPhoto(current - 1); });
  $('.lightbox__nav--next', lb).addEventListener('click', function () { showPhoto(current + 1); });
  lb.addEventListener('click', function (e) {
    if (e.target === lb || e.target.classList.contains('lightbox__figure')) closeLightbox();
  });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowLeft') showPhoto(current - 1);
    else if (e.key === 'ArrowRight') showPhoto(current + 1);
    else if (e.key === 'Tab') {
      // Фокус остаётся внутри окна
      var focusables = $$('button', lb).filter(function (b) { return b.offsetParent !== null; });
      var first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  var touchX = null, touchY = null;
  lb.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; touchY = e.touches[0].clientY; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    var dy = e.changedTouches[0].clientY - touchY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) showPhoto(current + (dx < 0 ? 1 : -1));
    else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) closeLightbox();
    touchX = null;
  });

  /* ---------- «Вы точно получитесь красивой» ---------- */
  var careList = $('#care-list');
  S.care.forEach(function (item) {
    careList.appendChild(el('li', null, [el('h3', { text: item.title }), el('p', { html: withTodo(item.text) })]));
  });
  picture(S.photoFor.beautiful, '(min-width: 900px) 560px, 100vw', { target: $('#beautiful-photo') });

  var careQuotes = $('#care-quotes');
  S.careQuotes.forEach(function (q) {
    careQuotes.appendChild(el('li', null, [el('figure', { className: 'quote' }, [
      el('blockquote', { text: '«' + q.text + '»' }),
      el('figcaption', { text: q.name + ', ' + q.date })
    ])]));
  });

  /* ---------- Услуги ---------- */
  var services = $('#services');
  S.services.forEach(function (s) {
    var list = el('ul', { className: 'service__list' });
    s.includes.forEach(function (line) { list.appendChild(el('li', { html: withTodo(line) })); });
    services.appendChild(el('li', { className: 'service' + (s.main ? ' service--main' : '') }, [
      s.main ? el('span', { className: 'service__badge', text: 'Основное направление' }) : null,
      el('h3', { text: s.title }),
      el('p', { className: 'service__price', html: withTodo(s.price) }),
      el('p', { className: 'service__desc', text: s.desc }),
      list,
      el('a', { className: 'btn' + (s.main ? '' : ' btn--ghost'), href: '#booking', 'data-type': s.title, text: 'Записаться' })
    ]));
  });
  services.addEventListener('click', function (e) {
    var a = e.target.closest('[data-type]');
    if (a) $('#f-type').value = a.getAttribute('data-type');
  });

  /* ---------- Обо мне ---------- */
  picture(S.photoFor.about, '(min-width: 900px) 560px, 100vw', { target: $('#about-photo') });
  var aboutText = $('#about-text');
  S.about.paragraphs.forEach(function (p) { aboutText.appendChild(el('p', { html: withTodo(p) })); });
  var aboutFacts = $('#about-facts');
  S.about.facts.forEach(function (f) {
    aboutFacts.appendChild(el('li', null, [el('strong', { text: f.value }), el('span', { text: f.label })]));
  });

  /* ---------- Шаги ---------- */
  var steps = $('#steps');
  S.steps.forEach(function (s, i) {
    steps.appendChild(el('li', { className: 'step' }, [
      el('span', { className: 'step__num', text: String(i + 1).padStart(2, '0') }),
      el('h3', { text: s.title }),
      el('p', { html: withTodo(s.text) })
    ]));
  });

  /* ---------- Отзывы ---------- */
  var reviewsList = $('#reviews-list');
  var REVIEWS_SHOWN = 6;
  $('#reviews-source').innerHTML = withTodo(S.reviewsSource);
  S.reviews.forEach(function (r, i) {
    reviewsList.appendChild(el('li', { className: 'review', hidden: i >= REVIEWS_SHOWN }, [
      el('p', { className: 'review__stars', 'aria-label': 'Оценка 5 из 5', text: '★★★★★' }),
      el('p', { className: 'review__text', text: r.text }),
      el('p', { className: 'review__meta' }, [el('span', { className: 'review__name', text: r.name }), el('span', { text: r.date })])
    ]));
  });
  var moreBtn = $('#reviews-more');
  if (S.reviews.length <= REVIEWS_SHOWN) moreBtn.remove();
  else moreBtn.addEventListener('click', function () {
    $$('.review', reviewsList).forEach(function (r) { r.hidden = false; });
    moreBtn.remove();
  });

  /* ---------- FAQ ---------- */
  var faq = $('#faq-list');
  S.faq.forEach(function (f) {
    faq.appendChild(el('details', null, [el('summary', { text: f.q }), el('div', { className: 'faq__answer', html: withTodo(f.a) })]));
  });

  /* ---------- Форма ---------- */
  var form = $('#booking-form');
  var typeSelect = $('#f-type');
  typeSelect.appendChild(el('option', { value: '', text: 'Выберите' }));
  S.shootTypes.forEach(function (t) { typeSelect.appendChild(el('option', { value: t, text: t })); });
  var dateInput = $('#f-date');
  dateInput.min = new Date().toISOString().slice(0, 10);

  var validators = {
    name: function (v) { return v.trim().length >= 2 ? '' : 'Напишите, как к вам обращаться'; },
    contact: function (v) {
      v = v.trim();
      if (!v) return 'Оставьте телефон или ник в Telegram, чтобы я могла ответить';
      var digits = v.replace(/\D/g, '');
      var isPhone = /^[+\d\s()-]+$/.test(v) && digits.length >= 10 && digits.length <= 12;
      var isTg = /^@?[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(v);
      return isPhone || isTg ? '' : 'Проверьте номер (например, +7 900 000-00-00) или ник (@username)';
    },
    date: function (v) { return !v || v >= dateInput.min ? '' : 'Дата уже прошла — выберите будущую'; },
    type: function (v) { return v ? '' : 'Выберите тип съёмки'; }
  };

  function validateField(name) {
    var input = form.elements[name];
    var msg = validators[name](input.value);
    var field = input.closest('.field');
    field.classList.toggle('is-invalid', !!msg);
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    $('#f-' + name + '-err').textContent = msg;
    return !msg;
  }

  Object.keys(validators).forEach(function (name) {
    var input = form.elements[name];
    input.addEventListener('blur', function () { if (input.value) validateField(name); });
    input.addEventListener('input', function () { if (input.closest('.field').classList.contains('is-invalid')) validateField(name); });
  });

  function formatDate(iso) {
    if (!iso) return 'пока не выбрана';
    var p = iso.split('-');
    return p[2] + '.' + p[1] + '.' + p[0];
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var status = $('#form-status');
    status.className = 'form__status';
    var invalid = Object.keys(validators).filter(function (n) { return !validateField(n); });
    if (invalid.length) {
      form.elements[invalid[0]].focus();
      status.textContent = 'Проверьте отмеченные поля.';
      return;
    }
    var f = form.elements;
    var text = [
      'Здравствуйте, Ника! Хочу записаться на съёмку.',
      'Имя: ' + f.name.value.trim(),
      'Контакт: ' + f.contact.value.trim(),
      'Тип съёмки: ' + f.type.value,
      'Дата: ' + formatDate(f.date.value),
      f.comment.value.trim() ? 'Комментарий: ' + f.comment.value.trim() : ''
    ].filter(Boolean).join('\n');

    var done = function (copied) {
      status.classList.add('is-success');
      status.textContent = copied
        ? 'Текст заявки скопирован. Вставьте его в чат Telegram и отправьте.'
        : 'Скопируйте текст заявки и отправьте его в чат Telegram:\n\n' + text;
    };
    // Открываем сразу, пока действует клик пользователя — иначе браузер заблокирует окно
    window.open(S.contacts.telegram.url, '_blank', 'noopener');
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
    } else {
      done(false);
    }
  });

  /* ---------- Шапка и мобильная панель ---------- */
  var header = $('.header');
  var bar = $('#mobile-bar');
  var hero = $('.hero');
  var booking = $('#booking');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 8);
    var pastHero = y > hero.offsetHeight * 0.6;
    var bookingTop = booking.getBoundingClientRect().top;
    var atBooking = bookingTop < window.innerHeight && booking.getBoundingClientRect().bottom > 0;
    bar.classList.toggle('is-visible', pastHero && !atBooking);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Мягкое появление ---------- */
  if ('IntersectionObserver' in window) {
    var targets = $$('.section__head, .split__text, .split__media, .service, .step, .quote, .booking > *');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-in'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    targets.forEach(function (t) { t.classList.add('reveal'); io.observe(t); });
  }
})();
