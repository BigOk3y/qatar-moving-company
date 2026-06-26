/* ============================================================
   NAVBAR — active link highlight + hamburger toggle + scroll shadow
   ============================================================ */
(function () {
    const nav       = document.querySelector('nav');
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks  = document.querySelector('.nav-links');

    // Nav scroll shadow
    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });

    // Mark current page as active
    const current = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(link => {
        const href = link.getAttribute('href').split('/').pop();
        if (href === current) link.closest('li').classList.add('active');
    });

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function () {
            const expanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', String(!expanded));
            navLinks.classList.toggle('open');
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navToggle.setAttribute('aria-expanded', 'false');
                navLinks.classList.remove('open');
            });
        });

        document.addEventListener('click', (e) => {
            if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
                navToggle.setAttribute('aria-expanded', 'false');
                navLinks.classList.remove('open');
            }
        });
    }
})();

/* ============================================================
   CAROUSEL
   ============================================================ */
(function () {
    const carousel = document.getElementById('myCarousel');
    if (!carousel) return;

    const track    = carousel.querySelector('.carousel-track');
    const slides   = Array.from(track.children);
    const nextBtn  = carousel.querySelector('.next');
    const prevBtn  = carousel.querySelector('.prev');
    const dotsWrap = carousel.querySelector('.carousel-dots');

    let idx = 0;
    let w   = carousel.offsetWidth;

    slides.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(dot);
    });
    const dots = Array.from(dotsWrap.children);

    function update(animate = true) {
        w = carousel.offsetWidth;
        track.style.transition = animate ? 'transform 0.4s ease' : 'none';
        track.style.transform  = `translateX(-${idx * w}px)`;
        dots.forEach(d => d.classList.remove('active'));
        dots[idx].classList.add('active');
        // also update slide widths on resize
        slides.forEach(s => { s.style.width = w + 'px'; });
    }

    function goTo(i) {
        idx = (i + slides.length) % slides.length;
        update();
    }

    nextBtn.addEventListener('click', () => goTo(idx + 1));
    prevBtn.addEventListener('click', () => goTo(idx - 1));

    let autoplay = setInterval(() => goTo(idx + 1), 4000);
    carousel.addEventListener('mouseenter', () => clearInterval(autoplay));
    carousel.addEventListener('mouseleave', () => {
        autoplay = setInterval(() => goTo(idx + 1), 4000);
    });

    // Touch / swipe
    let startX = 0, dragging = false;
    carousel.addEventListener('touchstart', e => {
        startX = e.touches[0].clientX; dragging = true;
        clearInterval(autoplay);
    }, { passive: true });
    carousel.addEventListener('touchmove', e => {
        if (!dragging) return;
        track.style.transition = 'none';
        track.style.transform  = `translateX(${-(idx * w) + (e.touches[0].clientX - startX)}px)`;
    }, { passive: true });
    carousel.addEventListener('touchend', e => {
        if (!dragging) return; dragging = false;
        const diff = e.changedTouches[0].clientX - startX;
        if (diff > 50) goTo(idx - 1);
        else if (diff < -50) goTo(idx + 1);
        else update();
        autoplay = setInterval(() => goTo(idx + 1), 4000);
    });

    // Keyboard
    carousel.setAttribute('tabindex', '0');
    carousel.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft')  goTo(idx - 1);
        if (e.key === 'ArrowRight') goTo(idx + 1);
    });

    window.addEventListener('resize', () => update(false));
    update(false);
})();

/* ============================================================
   FAQ ACCORDION
   ============================================================ */
document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
        const item   = btn.closest('.faq-item');
        const isOpen = item.classList.contains('open');

        document.querySelectorAll('.faq-item.open').forEach(open => {
            open.classList.remove('open');
            open.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        });

        if (!isOpen) {
            item.classList.add('open');
            btn.setAttribute('aria-expanded', 'true');
        }
    });
});

/* ============================================================
   STATS COUNTER ANIMATION
   ============================================================ */
(function () {
    const statsBar = document.querySelector('.stats-bar');
    if (!statsBar) return;

    function animateCounter(el) {
        const target   = parseInt(el.getAttribute('data-target'), 10);
        const duration = 1600;
        const start    = performance.now();
        function step(now) {
            const p = Math.min((now - start) / duration, 1);
            const e = 1 - Math.pow(1 - p, 3); // ease-out cubic
            el.textContent = Math.floor(e * target);
            if (p < 1) requestAnimationFrame(step);
            else el.textContent = target;
        }
        requestAnimationFrame(step);
    }

    let counted = false;
    new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && !counted) {
            counted = true;
            document.querySelectorAll('.stat-number[data-target]').forEach(animateCounter);
        }
    }, { threshold: 0.4 }).observe(statsBar);
})();

/* ============================================================
   CONTACT FORM — client-side fake submit + validation
   ============================================================ */
(function () {
    const form    = document.getElementById('quoteForm');
    const success = document.getElementById('formSuccess');
    if (!form) return;

    form.addEventListener('submit', e => {
        e.preventDefault();

        // Basic validation highlight
        let valid = true;
        form.querySelectorAll('[required]').forEach(field => {
            if (!field.value.trim()) {
                field.style.borderColor = '#e74c3c';
                valid = false;
            } else {
                field.style.borderColor = '';
            }
        });
        if (!valid) return;

        // Simulate async submission
        const btn = form.querySelector('.form-submit');
        btn.textContent = 'Sending…';
        btn.disabled    = true;

        setTimeout(() => {
            form.style.display    = 'none';
            if (success) success.style.display = 'block';
        }, 1200);
    });
})();

/* ============================================================
   SCROLL-REVEAL  (lightweight fade-in on scroll)
   ============================================================ */
(function () {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    const obs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    els.forEach(el => obs.observe(el));
})();
