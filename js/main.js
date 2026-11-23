(function () {
  'use strict';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------- Данные портфолио ----------
     [файл, категория, высота при ширине 1400, описание, extra]
     extra = кадр виден только во вкладке своей категории, во «Все» не попадает */
  var CATEGORIES = [
    { id: 'all', label: 'Все' },
    { id: 'wedding', label: 'Свадьбы' },
    { id: 'street', label: 'Прогулки' },
    { id: 'studio', label: 'Студия' },
    { id: 'events', label: 'Мероприятия' }
  ];
  var PHOTOS = [
    ['st03', 'studio', 2488, 'Мама с малышом на светлом полу'],
    ['wd02', 'wedding', 788, 'Молодожёны целуются среди лепестков на набережной'],
    ['su03', 'street', 2488, 'Девушка с телефоном гуляет по зелёному парку'],
    ['ev03', 'events', 788, 'Малыш делает первые шаги на празднике с шарами'],
    ['st06', 'studio', 2100, 'Пара у кремового дивана, кадр через круглое зеркало'],
    ['wd01', 'wedding', 2488, 'Невеста в пышном платье в зале с люстрой'],
    ['st01', 'studio', 788, 'Пара в белых футболках сидит на полу в студии'],
    ['sud01', 'street', 934, 'Мама с малышом на руках на закате'],
    ['st05', 'studio', 788, 'Девушка с белыми пионами'],
    ['wd03', 'wedding', 788, 'Жених и невеста у стены с зеленью'],
    ['st04', 'studio', 2488, 'Малыш встаёт, держась за стул, на белом фоне'],
    ['su04', 'street', 2100, 'Девушка у стеклянного ограждения на фоне синего неба'],
    ['ev05', 'events', 2100, 'Юная гимнастка сидит на полу на занятии'],
    ['st08', 'studio', 934, 'Силуэт мужчины на стуле на фоне светлого круга'],
    ['wd04', 'wedding', 788, 'Молодожёны на террасе на фоне неба'],
    ['ev02', 'events', 788, 'Две девочки открывают подарок с цветами'],
    ['st02', 'studio', 2488, 'Девушка в чёрном пиджаке на сером фоне'],
    ['wd05', 'wedding', 788, 'Жених и невеста с сиреневым букетом в светлом зале'],
    ['sud05', 'street', 2100, 'Портрет пары в парке'],

    ['wdd01', 'wedding', 2488, 'Невеста на лестнице с коваными перилами', 1],
    ['wdd02', 'wedding', 788, 'Невеста в короне, рядом мама и подруга', 1],
    ['wdd03', 'wedding', 788, 'Невеста ставит подпись, в руке букет роз', 1],
    ['wdd04', 'wedding', 788, 'Улыбающаяся девушка с букетом у колоннады', 1],
    ['wdd07', 'wedding', 2488, 'Жених стоит рядом с невестой, сидящей в кресле', 1],
    ['su02', 'street', 2488, 'Мужчина пьёт кофе у окна в кафе', 1],
    ['sud02', 'street', 934, 'Мама с малышом у зеркального павильона в парке', 1],
    ['sud03', 'street', 934, 'Мама с малышом у стены с зеленью', 1],
    ['sud04', 'street', 934, 'Пара гуляет у воды в парке', 1],
    ['su01', 'street', 2488, 'Прохожий на городской улице, кадр сверху', 1],
    ['st07', 'studio', 2100, 'Мужской профиль в тёмно-зелёных тонах', 1],
    ['std01', 'studio', 2488, 'Девушка сидит на плечах у парня на сером фоне', 1],
    ['std02', 'studio', 2488, 'Малыш в тёплой шапочке в детской студии', 1],
    ['std04', 'studio', 788, 'Малыш лежит на подушке, вид сверху', 1],
    ['std05', 'studio', 788, 'Мама держит малыша в голубом комбинезоне', 1],
    ['std07', 'studio', 788, 'Девушка с белым пионом у лица', 1],
    ['ev01', 'events', 788, 'Соревнования по борьбе в спортивном зале', 1],
    ['evd03', 'events', 934, 'Казак в красной черкеске', 1],
    ['evd04', 'events', 788, 'Выступающий с микрофоном на конференции', 1]
  ].map(function (p) {
    return { src: 'img/p/v3-' + p[0], cat: p[1], h: p[2], alt: p[3], extra: !!p[4] };
  });

  function inTab(p, cat) { return cat === 'all' ? !p.extra : p.cat === cat; }

  /* ---------- Портфолио ---------- */
  var gallery = $('#gallery');
  var filters = $('#filters');
  var visiblePhotos = PHOTOS.filter(function (p) { return inTab(p, 'all'); });
  var SIZES = '(min-width: 1280px) 290px, (min-width: 768px) 33vw, 50vw';

  filters.innerHTML = CATEGORIES.map(function (c, i) {
    var count = PHOTOS.filter(function (p) { return inTab(p, c.id); }).length;
    return '<button type="button" class="filter" data-cat="' + c.id + '" aria-pressed="' + (i === 0) + '">' +
      c.label + '<span class="filter__count">' + count + '</span></button>';
  }).join('');

  // Каждый кадр — готовый <li>; раскладка по колонкам делается в layoutGallery()
  var items = PHOTOS.map(function (p, i) {
    var set = function (ext) { return p.src + '-600.' + ext + ' 600w, ' + p.src + '-1400.' + ext + ' 1400w'; };
    var li = document.createElement('li');
    li.className = 'gallery__item';
    li.innerHTML = '<button type="button" class="gallery__btn" data-index="' + i + '" aria-label="Открыть фото: ' + p.alt + '">' +
      '<picture><source type="image/webp" srcset="' + set('webp') + '" sizes="' + SIZES + '">' +
      '<img src="' + p.src + '-600.jpg" srcset="' + set('jpg') + '" sizes="' + SIZES + '" width="1400" height="' + p.h +
      '" alt="' + p.alt + '" loading="lazy" decoding="async"></picture></button>';
    return li;
  });
  var currentCat = 'all';
  var MAX_CROP = 1.3; // во сколько раз кадр может стать выше/ниже своих пропорций

  function columnCount() {
    if (window.matchMedia('(min-width: 1280px)').matches) return 4;
    if (window.matchMedia('(min-width: 768px)').matches) return 3;
    return 2;
  }

  /* Раскладка кадров по n колонкам с почти равной высотой:
     кадр уходит в самую короткую колонку, затем кадры переносятся/меняются
     между самой высокой и самой низкой колонкой, пока разница уменьшается */
  function planColumns(idx, n, colW, gap) {
    var hOf = function (i) { return colW * PHOTOS[i].h / 1400; };
    var cols = [];
    for (var c = 0; c < n; c++) cols.push({ list: [], h: -gap });
    var pick = function (cmp) { return cols.reduce(function (a, b) { return cmp(b.h, a.h) ? b : a; }); };
    idx.forEach(function (i) { var col = pick(function (x, y) { return x < y; }); col.list.push(i); col.h += hOf(i) + gap; });
    for (var it = 0; it < 60; it++) {
      var hi = pick(function (x, y) { return x > y; }), lo = pick(function (x, y) { return x < y; });
      var spread = hi.h - lo.h, best = null;
      hi.list.forEach(function (a, ai) {
        if (hi.list.length > 1) {
          var d = hOf(a) + gap, s = Math.abs(hi.h - lo.h - 2 * d);
          if (s < spread - 1 && (!best || s < best.s)) best = { s: s, ai: ai, bi: -1 };
        }
        lo.list.forEach(function (b, bi) {
          var s = Math.abs(hi.h - lo.h - 2 * (hOf(a) - hOf(b)));
          if (s < spread - 1 && (!best || s < best.s)) best = { s: s, ai: ai, bi: bi };
        });
      });
      if (!best) break;
      var a = hi.list[best.ai];
      if (best.bi < 0) { hi.list.splice(best.ai, 1); lo.list.push(a); hi.h -= hOf(a) + gap; lo.h += hOf(a) + gap; }
      else { var b = lo.list[best.bi], d = hOf(a) - hOf(b); hi.list[best.ai] = b; lo.list[best.bi] = a; hi.h -= d; lo.h += d; }
    }
    // Остаток разницы делим поровну: высокие колонки чуть ниже, низкие чуть выше
    var hs = cols.map(function (col) { return col.h; });
    var target = Math.sqrt(Math.max.apply(null, hs) * Math.min.apply(null, hs));
    var worst = 1;
    cols.forEach(function (col) {
      col.list.sort(function (x, y) { return x - y; });
      var gaps = gap * (col.list.length - 1);
      col.k = col.list.length ? (target - gaps) / (col.h - gaps) : 1;
      worst = Math.max(worst, col.k, 1 / col.k);
    });
    return { cols: cols, worst: worst };
  }

  /* Masonry без пустот: низ всех колонок совпадает (кадры подрезаются через object-fit: cover).
     Если во вкладке мало кадров и ровно не выходит — колонок становится меньше */
  function layoutGallery() {
    var gap = parseFloat(getComputedStyle(gallery).getPropertyValue('--gap')) || 8;
    var idx = PHOTOS.map(function (p, i) { return i; }).filter(function (i) { return inTab(PHOTOS[i], currentCat); });
    var plan = null;
    for (var n = columnCount(); n >= 2; n--) {
      var next = planColumns(idx, n, (gallery.clientWidth - gap * (n - 1)) / n, gap);
      if (!plan || next.worst < plan.worst) plan = next;
      if (next.worst <= MAX_CROP) break;
    }
    gallery.innerHTML = '';
    plan.cols.forEach(function (col) {
      var ul = document.createElement('ul');
      ul.className = 'gallery__col';
      col.list.forEach(function (i) {
        items[i].firstChild.style.aspectRatio = '1400 / ' + (PHOTOS[i].h * col.k).toFixed(1);
        ul.appendChild(items[i]);
      });
      gallery.appendChild(ul);
    });
  }

  function setFilter(cat) {
    $$('.filter', filters).forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-cat') === cat)); });
    currentCat = cat;
    visiblePhotos = PHOTOS.filter(function (p) { return inTab(p, cat); });
    layoutGallery();
  }
  layoutGallery();

  var lastW = gallery.clientWidth, resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (gallery.clientWidth !== lastW) { lastW = gallery.clientWidth; layoutGallery(); }
    }, 120);
  });

  filters.addEventListener('click', function (e) {
    var btn = e.target.closest('.filter');
    if (btn) setFilter(btn.getAttribute('data-cat'));
  });

  // Карточка направления сразу включает нужную вкладку портфолио
  $$('[data-filter]').forEach(function (a) {
    a.addEventListener('click', function () { setFilter(a.getAttribute('data-filter')); });
  });

  /* ---------- Лайтбокс ---------- */
  var lb = $('#lightbox');
  var lbImg = $('.lightbox__img', lb);
  var lbCaption = $('.lightbox__caption', lb);
  var current = 0;
  var lastFocus = null;
  var ext = document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0 ? '.webp' : '.jpg';

  function showPhoto(i) {
    current = (i + visiblePhotos.length) % visiblePhotos.length;
    var p = visiblePhotos[current];
    lbImg.src = p.src + '-1400' + ext;
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
    if (btn) openLightbox(PHOTOS[+btn.getAttribute('data-index')]);
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

  /* ---------- Отзывы: часть скрыта стилями, кнопка раскрывает все ---------- */
  var reviewsList = $('#reviews-list');
  var moreBtn = $('#reviews-more');
  reviewsList.classList.add('is-collapsed');
  moreBtn.hidden = false;
  moreBtn.addEventListener('click', function () {
    reviewsList.classList.remove('is-collapsed');
    moreBtn.remove();
  });

  $('#year').textContent = new Date().getFullYear();

  /* ---------- Шапка и мобильная панель ---------- */
  var header = $('.header');
  var bar = $('#mobile-bar');
  var hero = $('.hero');
  var booking = $('#booking');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 8);
    var r = booking.getBoundingClientRect();
    var atBooking = r.top < window.innerHeight && r.bottom > 0;
    bar.classList.toggle('is-visible', y > hero.offsetHeight * 0.6 && !atBooking);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Мягкое появление ---------- */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-in'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    $$('.section__head, .split__text, .split__media, .service, .quote, .booking > *').forEach(function (t) {
      t.classList.add('reveal');
      io.observe(t);
    });
  }
})();
