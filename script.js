/* ==========================================================================
   FAZRI VAPE STORE — SCRIPT.JS
   JavaScript ES6 murni (tanpa framework / library eksternal)

   Daftar isi:
   1. Utilities
   2. Loading Screen
   3. Scroll Progress Bar
   4. Navbar (scroll state, mobile toggle, active link)
   5. Ripple Effect
   6. Scroll Reveal Animation (IntersectionObserver)
   7. Counter Animation
   8. Search & Filter Produk
   9. Countdown Promo
   10. Testimonial Slider
   11. FAQ Accordion
   12. Back To Top
   13. Footer Year
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ========================================================================
     1. UTILITIES
     ======================================================================== */
  const $  = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  /* ========================================================================
     2. LOADING SCREEN
     Disembunyikan setelah seluruh asset halaman selesai dimuat,
     dengan minimal durasi tampil agar animasi terlihat halus.
     ======================================================================== */
  const loadingScreen = $('#loadingScreen');

  const hideLoadingScreen = () => {
    if (!loadingScreen) return;
    loadingScreen.classList.add('is-hidden');
    // Hapus dari alur DOM setelah transisi selesai agar tidak menghalangi klik
    setTimeout(() => loadingScreen.remove(), 700);
  };

  const MIN_LOADING_TIME = 900; // ms
  const loadStart = Date.now();

  window.addEventListener('load', () => {
    const elapsed = Date.now() - loadStart;
    const remaining = clamp(MIN_LOADING_TIME - elapsed, 0, MIN_LOADING_TIME);
    setTimeout(hideLoadingScreen, remaining);
  });

  // Fallback pengaman jika event 'load' lambat / tidak terpicu
  setTimeout(hideLoadingScreen, 4000);

  /* ========================================================================
     3. SCROLL PROGRESS BAR
     ======================================================================== */
  const progressBar = $('#progressBar');

  const updateProgressBar = () => {
    if (!progressBar) return;
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = `${percent}%`;
  };

  /* ========================================================================
     4. NAVBAR — scroll state, mobile toggle, active link highlight
     ======================================================================== */
  const navbar    = $('#navbar');
  const navMenu   = $('#navMenu');
  const navToggle = $('#navToggle');
  const navLinks  = $$('.nav__link');

  const updateNavbarScrollState = () => {
    if (!navbar) return;
    navbar.classList.toggle('is-scrolled', window.scrollY > 12);
  };

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('is-open');
      navToggle.classList.toggle('is-active', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Tutup menu mobile setelah salah satu link diklik
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('is-open');
        navToggle.classList.remove('is-active');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Highlight menu aktif sesuai section yang sedang dilihat (scroll spy)
  const sections = navLinks
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if (sections.length) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = `#${entry.target.id}`;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === id);
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

    sections.forEach(section => navObserver.observe(section));
  }

  /* ========================================================================
     5. RIPPLE EFFECT — micro interaction pada setiap tombol .ripple
     ======================================================================== */
  $$('.ripple').forEach(button => {
    button.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const circle = document.createElement('span');

      circle.className = 'ripple-circle';
      circle.style.width = circle.style.height = `${size}px`;
      circle.style.left = `${e.clientX - rect.left - size / 2}px`;
      circle.style.top = `${e.clientY - rect.top - size / 2}px`;

      this.appendChild(circle);
      setTimeout(() => circle.remove(), 650);
    });
  });

  /* ========================================================================
     6. SCROLL REVEAL ANIMATION
     Elemen dengan atribut [data-animate] akan fade/slide/zoom masuk
     saat memasuki viewport.
     ======================================================================== */
  const animatedEls = $$('[data-animate]');

  if (animatedEls.length) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    animatedEls.forEach((el, index) => {
      // Stagger ringan agar elemen tidak muncul serentak
      el.style.transitionDelay = `${(index % 6) * 0.06}s`;
      revealObserver.observe(el);
    });
  }

  /* ========================================================================
     7. COUNTER ANIMATION — angka statistik berjalan naik saat terlihat
     ======================================================================== */
  const counters = $$('.stat__number');

  const animateCounter = (el) => {
    const target = parseFloat(el.dataset.target) || 0;
    const duration = 1600;
    const startTime = performance.now();

    const tick = (now) => {
      const progress = clamp((now - startTime) / duration, 0, 1);
      // easeOutCubic untuk pergerakan angka yang halus
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * eased);
      el.textContent = current.toLocaleString('id-ID');
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if (counters.length) {
    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    counters.forEach(counter => counterObserver.observe(counter));
  }

  /* ========================================================================
     8. SEARCH & FILTER PRODUK
     ======================================================================== */
  const searchInput   = $('#searchInput');
  const categoryPills = $$('#categoryPills .pill');
  const priceFilter   = $('#priceFilter');
  const brandFilter   = $('#brandFilter');
  const sortFilter    = $('#sortFilter');
  const promoFilter   = $('#promoFilter');
  const resetBtn      = $('#resetFilters');
  const productGrid   = $('#productGrid');
  const productCards  = $$('.product-card', productGrid);
  const resultCount   = $('#resultCount');
  const noResults     = $('#noResults');

  let activeCategory = 'all';

  const matchesPriceRange = (price, rangeValue) => {
    if (rangeValue === 'all') return true;
    const [min, max] = rangeValue.split('-').map(Number);
    return price >= min && price <= max;
  };

  const applyFilters = () => {
    const searchTerm = (searchInput?.value || '').trim().toLowerCase();
    const priceValue = priceFilter?.value || 'all';
    const brandValue = brandFilter?.value || 'all';
    const sortValue  = sortFilter?.value || 'default';
    const promoOnly  = promoFilter?.checked || false;

    let visibleCount = 0;

    productCards.forEach(card => {
      const name     = card.dataset.name || '';
      const brand    = card.dataset.brand || '';
      const category = card.dataset.category || '';
      const price    = Number(card.dataset.price) || 0;
      const isPromo  = card.dataset.promo === 'true';

      const matchSearch   = !searchTerm || name.includes(searchTerm) || brand.toLowerCase().includes(searchTerm);
      const matchCategory = activeCategory === 'all' || category === activeCategory;
      const matchPrice    = matchesPriceRange(price, priceValue);
      const matchBrand    = brandValue === 'all' || brand === brandValue;
      const matchPromo    = !promoOnly || isPromo;

      const isVisible = matchSearch && matchCategory && matchPrice && matchBrand && matchPromo;
      card.classList.toggle('is-hidden', !isVisible);
      if (isVisible) visibleCount += 1;
    });

    // Urutkan kartu yang tampil sesuai opsi sorting yang dipilih
    const sorted = productCards.slice().sort((a, b) => {
      switch (sortValue) {
        case 'price-low':
          return Number(a.dataset.price) - Number(b.dataset.price);
        case 'price-high':
          return Number(b.dataset.price) - Number(a.dataset.price);
        case 'rating':
          return Number(b.dataset.rating) - Number(a.dataset.rating);
        case 'newest':
          return (b.dataset.new === 'true' ? 1 : 0) - (a.dataset.new === 'true' ? 1 : 0);
        default:
          return 0;
      }
    });
    sorted.forEach(card => productGrid.appendChild(card));

    // Update info hasil pencarian
    if (resultCount) {
      resultCount.textContent = visibleCount > 0
        ? `Menampilkan ${visibleCount} produk`
        : '';
    }
    if (noResults) noResults.hidden = visibleCount !== 0;
  };

  searchInput?.addEventListener('input', applyFilters);
  priceFilter?.addEventListener('change', applyFilters);
  brandFilter?.addEventListener('change', applyFilters);
  sortFilter?.addEventListener('change', applyFilters);
  promoFilter?.addEventListener('change', applyFilters);

  categoryPills.forEach(pill => {
    pill.addEventListener('click', () => {
      categoryPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeCategory = pill.dataset.category;
      applyFilters();
    });
  });

  resetBtn?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    if (priceFilter) priceFilter.value = 'all';
    if (brandFilter) brandFilter.value = 'all';
    if (sortFilter) sortFilter.value = 'default';
    if (promoFilter) promoFilter.checked = false;
    activeCategory = 'all';
    categoryPills.forEach(p => p.classList.toggle('active', p.dataset.category === 'all'));
    applyFilters();
  });

  // Jalankan sekali di awal untuk menampilkan jumlah produk
  applyFilters();

  /* ========================================================================
     9. COUNTDOWN PROMO
     Countdown berjalan mundur dan otomatis ter-reset agar promo
     selalu terlihat aktif setiap kali halaman dibuka.
     ======================================================================== */
  const cdDays    = $('#cdDays');
  const cdHours   = $('#cdHours');
  const cdMinutes = $('#cdMinutes');
  const cdSeconds = $('#cdSeconds');

  if (cdDays && cdHours && cdMinutes && cdSeconds) {
    const COUNTDOWN_DURATION = 2 * 24 * 60 * 60 * 1000; // 2 hari
    let countdownEnd = Date.now() + COUNTDOWN_DURATION;

    const pad = (num) => String(num).padStart(2, '0');

    const updateCountdown = () => {
      let diff = countdownEnd - Date.now();

      if (diff <= 0) {
        countdownEnd = Date.now() + COUNTDOWN_DURATION;
        diff = COUNTDOWN_DURATION;
      }

      const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours   = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      cdDays.textContent    = pad(days);
      cdHours.textContent   = pad(hours);
      cdMinutes.textContent = pad(minutes);
      cdSeconds.textContent = pad(seconds);
    };

    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  /* ========================================================================
     10. TESTIMONIAL SLIDER — autoplay + navigasi manual + dots
     ======================================================================== */
  const track     = $('#testimonialTrack');
  const slides    = $$('.testimonial-card', track);
  const dotsWrap  = $('#testimonialDots');
  const prevBtn   = $('#prevTestimonial');
  const nextBtn   = $('#nextTestimonial');

  if (track && slides.length) {
    let currentSlide = 0;
    let autoplayTimer = null;
    const AUTOPLAY_DELAY = 5000;

    // Buat dot navigasi secara dinamis
    slides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.setAttribute('aria-label', `Lihat testimoni ${index + 1}`);
      if (index === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goToSlide(index));
      dotsWrap?.appendChild(dot);
    });
    const dots = $$('button', dotsWrap);

    function updateSlidePosition() {
      track.style.transform = `translateX(-${currentSlide * 100}%)`;
      dots.forEach((dot, index) => dot.classList.toggle('active', index === currentSlide));
    }

    function goToSlide(index) {
      currentSlide = (index + slides.length) % slides.length;
      updateSlidePosition();
      restartAutoplay();
    }

    function nextSlide() { goToSlide(currentSlide + 1); }
    function prevSlide() { goToSlide(currentSlide - 1); }

    function startAutoplay() {
      autoplayTimer = setInterval(nextSlide, AUTOPLAY_DELAY);
    }
    function stopAutoplay() {
      clearInterval(autoplayTimer);
    }
    function restartAutoplay() {
      stopAutoplay();
      startAutoplay();
    }

    nextBtn?.addEventListener('click', nextSlide);
    prevBtn?.addEventListener('click', prevSlide);

    // Jeda autoplay saat pengguna berinteraksi dengan slider
    const sliderWrap = track.closest('.testimonial-slider');
    sliderWrap?.addEventListener('mouseenter', stopAutoplay);
    sliderWrap?.addEventListener('mouseleave', startAutoplay);

    updateSlidePosition();
    startAutoplay();
  }

  /* ========================================================================
     11. FAQ ACCORDION
     ======================================================================== */
  const faqItems = $$('.faq-item');

  faqItems.forEach(item => {
    const question = $('.faq-question', item);
    const answer   = $('.faq-answer', item);

    question?.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      // Tutup item lain agar tampilan tetap rapi (single-open accordion)
      faqItems.forEach(other => {
        if (other === item) return;
        other.classList.remove('is-open');
        $('.faq-question', other)?.setAttribute('aria-expanded', 'false');
        const otherAnswer = $('.faq-answer', other);
        if (otherAnswer) otherAnswer.style.maxHeight = null;
      });

      item.classList.toggle('is-open', !isOpen);
      question.setAttribute('aria-expanded', String(!isOpen));
      if (answer) answer.style.maxHeight = !isOpen ? `${answer.scrollHeight}px` : null;
    });
  });

  /* ========================================================================
     12. BACK TO TOP
     ======================================================================== */
  const backToTop = $('#backToTop');

  backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ========================================================================
     13. FOOTER YEAR
     ======================================================================== */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ========================================================================
     MASTER SCROLL LISTENER
     Menggabungkan semua fungsi yang bergantung pada event scroll
     ke dalam satu listener (dengan requestAnimationFrame) demi performa.
     ======================================================================== */
  let scrollTicking = false;

  const onScroll = () => {
    updateProgressBar();
    updateNavbarScrollState();
    backToTop?.classList.toggle('is-visible', window.scrollY > 420);
    scrollTicking = false;
  };

  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      requestAnimationFrame(onScroll);
      scrollTicking = true;
    }
  });

  // Inisialisasi state awal saat halaman dimuat
  onScroll();

});
