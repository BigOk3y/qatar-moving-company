/* ============================================================
   CAROUSEL
   ============================================================ */
const carousel = document.getElementById('myCarousel');
const track = carousel.querySelector('.carousel-track');
const slides = Array.from(track.children);
const nextBtn = carousel.querySelector('.next');
const prevBtn = carousel.querySelector('.prev');
const dotsContainer = carousel.querySelector('.carousel-dots');

let index = 0;
let carouselWidth = carousel.offsetWidth;

// Build dots
slides.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.classList.add('dot');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
});
const dots = Array.from(dotsContainer.children);

function syncWidth() {
    carouselWidth = carousel.offsetWidth;
}

function update(animate = true) {
    track.style.transition = animate ? 'transform 0.4s ease' : 'none';
    track.style.transform = `translateX(-${index * carouselWidth}px)`;
    dots.forEach(d => d.classList.remove('active'));
    dots[index].classList.add('active');
}

function goTo(i) {
    index = (i + slides.length) % slides.length;
    update();
}

nextBtn.addEventListener('click', () => goTo(index + 1));
prevBtn.addEventListener('click', () => goTo(index - 1));

// Autoplay
let autoplay = setInterval(() => goTo(index + 1), 4000);
function pauseAutoplay() { clearInterval(autoplay); }
function resumeAutoplay() { autoplay = setInterval(() => goTo(index + 1), 4000); }

carousel.addEventListener('mouseenter', pauseAutoplay);
carousel.addEventListener('mouseleave', resumeAutoplay);

// Touch / swipe support
let startX = 0;
let isDragging = false;

carousel.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    isDragging = true;
    pauseAutoplay();
}, { passive: true });

carousel.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const diff = e.touches[0].clientX - startX;
    track.style.transition = 'none';
    track.style.transform = `translateX(${-(index * carouselWidth) + diff}px)`;
}, { passive: true });

carousel.addEventListener('touchend', (e) => {
    if (!isDragging) return;
    isDragging = false;
    const diff = e.changedTouches[0].clientX - startX;
    if (diff > 50)       { goTo(index - 1); }
    else if (diff < -50) { goTo(index + 1); }
    else                 { update(); }
    resumeAutoplay();
});

// Keyboard navigation
carousel.setAttribute('tabindex', '0');
carousel.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  goTo(index - 1);
    if (e.key === 'ArrowRight') goTo(index + 1);
});

// Recalculate on resize (handles breakpoints changing carousel width)
window.addEventListener('resize', () => {
    syncWidth();
    update(false); // snap without animating
});

/* ============================================================
   HAMBURGER MENU
   FIX: was inline in index.html — querySelector('.nav-links') returned
   null because the <ul> had no class, throwing a JS error and
   breaking the menu entirely.
   ============================================================ */
const navToggle = document.querySelector('.nav-toggle');
const navLinks  = document.querySelector('.nav-links'); // now works — class added to <ul>

if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
        const expanded = this.getAttribute('aria-expanded') === 'true';
        this.setAttribute('aria-expanded', String(!expanded));
        navLinks.classList.toggle('open');
    });

    // Close menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.setAttribute('aria-expanded', 'false');
            navLinks.classList.remove('open');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
            navToggle.setAttribute('aria-expanded', 'false');
            navLinks.classList.remove('open');
        }
    });
}

/* ============================================================
   FAQ ACCORDION
   ============================================================ */
document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        const isOpen = item.classList.contains('open');

        // Close all
        document.querySelectorAll('.faq-item.open').forEach(openItem => {
            openItem.classList.remove('open');
            openItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        });

        // Open clicked (unless it was already open)
        if (!isOpen) {
            item.classList.add('open');
            btn.setAttribute('aria-expanded', 'true');
        }
    });
});

/* ============================================================
   STATS COUNTER ANIMATION
   Counts up when the stats bar scrolls into view
   ============================================================ */
function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const duration = 1600; // ms
    const start = performance.now();

    function step(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target);
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target;
    }
    requestAnimationFrame(step);
}

const statsBar = document.querySelector('.stats-bar');
if (statsBar) {
    let counted = false;
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !counted) {
            counted = true;
            document.querySelectorAll('.stat-number[data-target]').forEach(animateCounter);
        }
    }, { threshold: 0.4 });
    observer.observe(statsBar);
}
