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

  // Scale live project previews — real pages render at 1400px wide, fit to container
  const frames = document.querySelectorAll(".work-card__frame, .why__frame");
  if (frames.length) {
    const BASE = 1400;
    const scaleFrames = () => {
      frames.forEach((f) => {
        const w = f.parentElement.clientWidth;
        if (w) f.style.transform = "scale(" + w / BASE + ")";
      });
    };
    scaleFrames();
    window.addEventListener("resize", scaleFrames, { passive: true });
    window.addEventListener("load", scaleFrames);
    frames.forEach((f) => f.addEventListener("load", scaleFrames));
    setTimeout(scaleFrames, 300);
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
