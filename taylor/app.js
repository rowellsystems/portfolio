(() => {
  const P = window.PHOTOS, SHOP = window.SHOP_BASE;
  const $ = (s, r = document) => r.querySelector(s);
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; };

  // ---------- Lightbox (all pages) ----------
  let lbList = P, lbI = 0;
  const lb = el("div", "lb", '<button class="x" aria-label="Close">&times;</button><button class="p" aria-label="Previous">&#8592;</button><img alt=""><button class="n" aria-label="Next">&#8594;</button><div class="lb-cap"></div>');
  document.body.append(lb);
  const lbShow = () => {
    const p = lbList[lbI];
    $("img", lb).src = p.src; $("img", lb).alt = p.title;
    $(".lb-cap", lb).innerHTML = p.title + (p.shop ? `<a href="${SHOP + p.shop}">Buy print</a>` : "");
  };
  window.openLB = (list, i) => { lbList = list; lbI = i; lbShow(); lb.classList.add("open"); };
  const lbStep = d => { lbI = (lbI + d + lbList.length) % lbList.length; lbShow(); };
  $(".x", lb).onclick = () => lb.classList.remove("open");
  $(".p", lb).onclick = () => lbStep(-1);
  $(".n", lb).onclick = () => lbStep(1);
  lb.onclick = e => { if (e.target === lb) lb.classList.remove("open"); };

  // ---------- Hero carousel ----------
  const stage = $(".stage");
  let next = () => {}, prev = () => {};
  if (stage) {
    const DUR = 6500;
    const cap = $(".caption"), strip = $(".strip"), bar = $(".progress"), count = $(".count");
    const slides = P.map((p, i) => {
      const s = el("div", "slide", `<div class="bgblur"></div><img alt="${p.title}" ${i > 1 ? 'loading="lazy"' : ""}>`);
      $(".bgblur", s).style.backgroundImage = `url("${p.src}")`;
      $("img", s).src = p.src;
      stage.prepend(s);
      const dot = el("button"); dot.setAttribute("aria-label", p.title); dot.onclick = () => go(i);
      strip.append(dot);
      return s;
    });
    let cur = -1, timer;
    const go = i => {
      i = (i + P.length) % P.length;
      if (cur >= 0) { slides[cur].classList.remove("on"); strip.children[cur].classList.remove("on"); }
      cur = i; slides[i].classList.add("on"); strip.children[i].classList.add("on");
      cap.classList.add("swap");
      setTimeout(() => {
        const p = P[i];
        $(".set", cap).textContent = p.set;
        $("h2", cap).textContent = p.title;
        const a = $("a", cap);
        a.href = p.shop ? SHOP + p.shop : "#work";
        a.textContent = p.shop ? "Own this print" : "See the work";
        cap.classList.remove("swap");
      }, 450);
      count.textContent = String(i + 1).padStart(2, "0") + " / " + String(P.length).padStart(2, "0");
      bar.classList.remove("run"); bar.style.transitionDuration = "0ms"; void bar.offsetWidth;
      bar.style.transitionDuration = DUR + "ms"; bar.classList.add("run");
      clearTimeout(timer); timer = setTimeout(() => go(cur + 1), DUR);
    };
    next = () => go(cur + 1); prev = () => go(cur - 1);
    $(".controls .n").onclick = next; $(".controls .p").onclick = prev;
    $("img", stage) && stage.addEventListener("click", e => { if (e.target.closest(".slide")) openLB(P, cur); });
    let x0 = null;
    stage.addEventListener("touchstart", e => (x0 = e.touches[0].clientX), { passive: true });
    stage.addEventListener("touchend", e => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) (dx < 0 ? next : prev)(); x0 = null; });
    go(0);
  }

  document.addEventListener("keydown", e => {
    if (lb.classList.contains("open")) {
      if (e.key === "Escape") lb.classList.remove("open");
      if (e.key === "ArrowRight") lbStep(1);
      if (e.key === "ArrowLeft") lbStep(-1);
    } else if (stage) {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    }
  });

  // ---------- Drifting film reel ----------
  const reel = $(".reel-track");
  if (reel) [...P, ...P].forEach((p, i) => {
    const im = el("img"); im.src = p.src; im.alt = p.title; im.loading = "lazy";
    im.onclick = () => openLB(P, i % P.length); reel.append(im);
  });

  // ---------- Masonry grid with filters ----------
  const grid = $(".masonry");
  if (grid) {
    const tiles = P.map((p, i) => {
      const t = el("figure", "tile fade-in", `<img src="${p.src}" alt="${p.title}" loading="lazy"><span>${p.title}</span>`);
      t.dataset.set = p.set; t.onclick = () => openLB(P, i); grid.append(t); return t;
    });
    const f = $(".filters");
    if (f) ["All", ...new Set(P.map(p => p.set))].forEach((s, i) => {
      const b = el("button", i ? "" : "on", s);
      b.onclick = () => {
        [...f.children].forEach(c => c.classList.toggle("on", c === b));
        tiles.forEach(t => t.classList.toggle("hide", s !== "All" && t.dataset.set !== s));
      };
      f.append(b);
    });
  }

  // ---------- Prints grid ----------
  const prints = $(".prints");
  if (prints) {
    const forSale = P.filter(p => p.shop);
    forSale.forEach(p => prints.append(el("a", "print fade-in", `<div class="frame"><img src="${p.src}" alt="${p.title}" loading="lazy"></div><h3>${p.title}</h3><p>Fine-art print &middot; $135</p>`)));
    prints.querySelectorAll(".print").forEach((a, i) => (a.href = SHOP + forSale[i].shop));
  }

  // ---------- Reveal on scroll ----------
  const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && (e.target.classList.add("seen"), io.unobserve(e.target))), { rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll(".fade-in").forEach(n => io.observe(n));
})();
