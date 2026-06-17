// Frontbits — site interactions

(function () {
  "use strict";

  const nav = document.getElementById("nav");
  const burger = document.getElementById("navBurger");
  const links = document.getElementById("navLinks");

  // Sticky nav shadow
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 10);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Mobile menu
  burger.addEventListener("click", () => {
    const open = links.classList.toggle("is-open");
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
  });

  links.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      links.classList.remove("is-open");
      burger.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
    }
  });

  // Scroll reveal
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealEls = document.querySelectorAll(".reveal");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  // Animated stat counters
  const stats = document.querySelectorAll(".stat__num[data-count]");

  const animateCount = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || "";
    const duration = 1400;
    const start = performance.now();

    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if (reduceMotion || !("IntersectionObserver" in window)) {
    stats.forEach((el) => {
      el.textContent = el.dataset.count + (el.dataset.suffix || "");
    });
  } else {
    const statIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            statIo.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    stats.forEach((el) => statIo.observe(el));
  }

  // Close other FAQ items when one opens
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (item.open) {
        faqItems.forEach((other) => {
          if (other !== item) other.open = false;
        });
      }
    });
  });
})();

// ---- Project showcase: auto-scroll + manual prev/next arrows ----
(function () {
  "use strict";
  const vp = document.getElementById("showcaseViewport");
  if (!vp) return;
  const track = vp.querySelector(".showcase__track");
  const prevBtn = document.getElementById("showcasePrev");
  const nextBtn = document.getElementById("showcaseNext");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // The track holds two identical sets; one set's width is the seamless loop point.
  let oneSet = 0, step = 320;
  const measure = () => {
    oneSet = track.scrollWidth / 2;
    const card = track.querySelector(".showcase__card");
    if (card) step = card.offsetWidth + parseFloat(getComputedStyle(card).marginRight || 0);
  };
  measure();
  window.addEventListener("load", measure);
  window.addEventListener("resize", measure);

  const normalize = () => {
    if (oneSet <= 0) return;
    if (vp.scrollLeft >= oneSet) vp.scrollLeft -= oneSet;
    else if (vp.scrollLeft < 0) vp.scrollLeft += oneSet;
  };

  // Manual navigation (also briefly pauses the auto-scroll)
  let lastInteract = 0;
  const pauseNow = () => { lastInteract = performance.now(); };
  const go = (dir) => {
    pauseNow();
    normalize();
    // wrap seamlessly when stepping back past the start
    if (dir < 0 && oneSet > 0 && vp.scrollLeft - step < 0) vp.scrollLeft += oneSet;
    vp.scrollBy({ left: dir * step, behavior: "smooth" });
  };
  if (nextBtn) nextBtn.addEventListener("click", () => go(1));
  if (prevBtn) prevBtn.addEventListener("click", () => go(-1));

  // Pause auto-scroll on hover and after any manual interaction
  let hovering = false;
  const showcase = vp.closest(".showcase");
  showcase.addEventListener("pointerenter", () => { hovering = true; });
  showcase.addEventListener("pointerleave", () => { hovering = false; });
  ["wheel", "touchstart", "pointerdown", "keydown"].forEach((ev) =>
    vp.addEventListener(ev, pauseNow, { passive: true }));

  // Auto-advance (skipped entirely when the user prefers reduced motion)
  if (!reduce) {
    const SPEED = 0.045; // px per ms ≈ 45 px/s
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min(now - last, 50);
      last = now;
      if (!hovering && now - lastInteract > 3500 && oneSet > 0 &&
          document.visibilityState === "visible") {
        vp.scrollLeft += SPEED * dt;
        if (vp.scrollLeft >= oneSet) vp.scrollLeft -= oneSet;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
})();
