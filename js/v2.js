/* Блок направлений версии 2. Подключается после main.js */
(function () {
  'use strict';

  // На телефоне триптих листается: начинаем с центрального фото
  var triptych = document.querySelector('.triptych');
  if (triptych && triptych.scrollWidth > triptych.clientWidth) {
    triptych.scrollLeft = (triptych.scrollWidth - triptych.clientWidth) / 2;
  }

  var list = document.getElementById('directions-list');
  var S = window.SITE;
  if (!list || !S || !S.directions) return;

  S.directions.forEach(function (d) {
    var src = 'img/p/' + d.photo + '-600';
    var a = document.createElement('a');
    a.className = 'direction';
    a.href = d.href || '#portfolio';
    if (d.cat) a.setAttribute('data-filter', d.cat);

    var pic = document.createElement('picture');
    var source = document.createElement('source');
    source.type = 'image/webp';
    source.srcset = src + '.webp';
    var img = document.createElement('img');
    img.src = src + '.jpg';
    img.alt = d.alt;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.width = 600;
    img.height = 600;
    img.style.objectPosition = d.pos;
    pic.appendChild(source);
    pic.appendChild(img);

    var body = document.createElement('span');
    body.className = 'direction__body';
    var title = document.createElement('span');
    title.className = 'direction__title';
    title.textContent = d.title;
    var price = document.createElement('span');
    price.className = 'direction__price';
    price.textContent = d.price;
    body.appendChild(title);
    body.appendChild(price);

    a.appendChild(pic);
    a.appendChild(body);
    var li = document.createElement('li');
    li.appendChild(a);
    list.appendChild(li);
  });

  // Клик по направлению сразу включает нужный фильтр портфолио
  list.addEventListener('click', function (e) {
    var a = e.target.closest('[data-filter]');
    if (!a) return;
    var btn = document.querySelector('.filter[data-cat="' + a.getAttribute('data-filter') + '"]');
    if (btn) btn.click();
  });
})();
