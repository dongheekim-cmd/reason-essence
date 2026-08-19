/* 이성과 본질 — 공통 스크립트
   책 내용을 고치려면 js/books-data.js 파일만 수정하면 됩니다.
   표지 이미지는 images/books/ 폴더에 넣고 books-data.js의 image 항목에 경로를 적습니다. */

document.addEventListener("DOMContentLoaded", () => {
  /* 로고 / 파비콘 적용 */
  if (typeof LOGO_ICON !== "undefined") {
    document.querySelectorAll(".site-logo").forEach((img) => (img.src = LOGO_ICON));
  }
  const favicon = document.getElementById("favicon-link");
  if (favicon) {
    favicon.href =
      typeof FAVICON_ICON !== "undefined"
        ? FAVICON_ICON
        : typeof LOGO_ICON !== "undefined"
        ? LOGO_ICON
        : favicon.href;
  }

  /* 모바일 내비게이션 토글 */
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => nav.classList.toggle("open"));
  }

  /* 홈 화면 — 출간 도서 / 출간 예정 도서 렌더링 */
  const publishedEl = document.getElementById("published-books");
  const publishedSection = document.getElementById("published-section");
  if (publishedEl && typeof BOOKS !== "undefined") {
    const published = BOOKS.filter(isPublished).sort(byPubDateDesc);
    if (published.length) {
      publishedEl.innerHTML = published.map(bookCardHTML).join("");
    } else if (publishedSection) {
      publishedSection.style.display = "none";
    }
  }

  const featuredEl = document.getElementById("featured-books");
  const featuredSection = document.getElementById("forthcoming-section");
  if (featuredEl && typeof BOOKS !== "undefined") {
    const featuredIds = ["wandering", "questioning-machine", "universe-pocket", "star-calculation"];
    const featured = featuredIds
      .map((id) => BOOKS.find((b) => b.id === id))
      .filter((b) => b && !isPublished(b));
    const fill = BOOKS.filter((b) => !isPublished(b) && !featured.includes(b));
    while (featured.length < 4 && fill.length) featured.push(fill.shift());
    if (featured.length) {
      featuredEl.innerHTML = featured.map(bookCardHTML).join("");
    } else if (featuredSection) {
      featuredSection.style.display = "none";
    }
  }

  /* 도서목록 페이지 — 전체 렌더링 + 필터 + 보기 전환(진열형/목록형) */
  const gridEl = document.getElementById("book-grid");
  let currentList = typeof BOOKS !== "undefined" ? BOOKS : [];
  let viewMode = "grid";
  try {
    viewMode = localStorage.getItem("re_book_view") || "grid";
  } catch (e) {}

  if (gridEl && typeof BOOKS !== "undefined") {
    const viewBtns = document.querySelectorAll(".view-toggle button");
    if (viewBtns.length) {
      viewBtns.forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.view === viewMode);
        btn.addEventListener("click", () => {
          viewMode = btn.dataset.view;
          viewBtns.forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          try {
            localStorage.setItem("re_book_view", viewMode);
          } catch (e) {}
          renderGrid(currentList);
        });
      });
    }

    currentList = sortPublishedFirst(BOOKS);
    renderGrid(currentList);

    const filterBtns = document.querySelectorAll(".filter-bar button");
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const cat = btn.dataset.filter;
        const base =
          cat === "all"
            ? BOOKS
            : cat === "출간"
            ? BOOKS.filter(isPublished)
            : BOOKS.filter((b) => b.category === cat);
        currentList = sortPublishedFirst(base);
        renderGrid(currentList);
      });
    });
  }

  /* 보도자료 페이지 */
  const pressEl = document.getElementById("press-list");
  if (pressEl) renderPress(pressEl);

  /* 도서 상세 페이지 — books/<id>.html (구 book.html?id=... 도 지원) */
  const detailEl = document.getElementById("book-detail");
  if (detailEl && typeof BOOKS !== "undefined") {
    renderBookDetail();
  }

  function renderGrid(list) {
    if (viewMode === "list") {
      gridEl.className = "book-list";
      gridEl.innerHTML = list.map(bookRowHTML).join("");
    } else {
      gridEl.className = "book-grid";
      gridEl.innerHTML = list.map(bookCardHTML).join("");
    }
  }

  function coverSrc(b) {
    const p = b.image
      ? b.image
      : typeof BOOK_IMAGES !== "undefined" && BOOK_IMAGES[b.id]
      ? BOOK_IMAGES[b.id]
      : "";
    return p && !/^(https?:|\/)/.test(p) ? "/" + p : p;
  }

  /* ---------- 출간 / 서점 ---------- */

  function storeList(b) {
    if (!b || !b.stores || typeof STORES === "undefined") return [];
    return STORES.filter((s) => (b.stores[s.key] || "").trim()).map((s) => ({
      key: s.key,
      label: s.label,
      url: b.stores[s.key].trim()
    }));
  }

  function isPublished(b) {
    return !!(b && b.published);
  }

  function statusLabel(b) {
    return isPublished(b) ? "출간" : b.status || "출간예정";
  }

  function formatDate(value) {
    if (!value) return "";
    const parts = String(value).split("-");
    if (parts.length !== 3) return value;
    return `${parts[0]}. ${Number(parts[1])}. ${Number(parts[2])}`;
  }

  function byPubDateDesc(a, b) {
    return String(b.pubDate || "").localeCompare(String(a.pubDate || ""));
  }

  function sortPublishedFirst(list) {
    const pub = list.filter(isPublished).sort(byPubDateDesc);
    const rest = list.filter((b) => !isPublished(b));
    return pub.concat(rest);
  }

  function publishedBadge(b) {
    return isPublished(b) ? `<span class="pub-badge">출간</span>` : "";
  }

  function buyButtonHTML(b, variant) {
    const stores = storeList(b);
    if (!stores.length) return "";
    const cls = variant === "solid" ? "btn solid buy-btn" : "btn buy-btn";
    const count = stores.length > 1 ? `<span class="buy-count">${stores.length}</span>` : "";
    return `<button type="button" class="${cls}" data-buy="${b.id}">구매하기${count}</button>`;
  }

  function bookCardHTML(b) {
    return `
      <article class="book-card${isPublished(b) ? " is-published" : ""}">
        <a class="book-card-link" href="books/${b.id}.html">
          <div class="cover">
            <img src="${coverSrc(b)}" alt="${b.title} 표지" loading="lazy">
            ${publishedBadge(b)}
          </div>
          <div class="meta">
            <div class="status">${statusLabel(b)}</div>
            <h3>${b.title}</h3>
            <div class="subtitle">${b.subtitle}</div>
            <p class="desc">${b.desc}</p>
          </div>
        </a>
      </article>`;
  }

  function bookRowHTML(b) {
    return `
      <article class="book-row${isPublished(b) ? " is-published" : ""}">
        <a class="book-row-link" href="books/${b.id}.html">
          <div class="cover">
            <img src="${coverSrc(b)}" alt="${b.title} 표지" loading="lazy">
            ${publishedBadge(b)}
          </div>
          <div class="info">
            <div class="status">${statusLabel(b)}</div>
            <h3>${b.title}</h3>
            <div class="subtitle">${b.subtitle}</div>
            <p class="desc">${b.desc}</p>
          </div>
        </a>
      </article>`;
  }

  /* ---------- 구매하기 모달 ---------- */

  function ensureStoreModal() {
    let modal = document.getElementById("store-modal");
    if (modal) return modal;
    modal = document.createElement("div");
    modal.id = "store-modal";
    modal.className = "store-modal";
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML = `
      <div class="store-backdrop" data-store-close></div>
      <div class="store-panel" role="dialog" aria-modal="true" aria-labelledby="store-modal-title">
        <button type="button" class="store-close" data-store-close aria-label="닫기">×</button>
        <span class="store-kicker">전자책 구매</span>
        <h3 id="store-modal-title"></h3>
        <p class="store-sub"></p>
        <div class="store-links"></div>
        <p class="store-note">서점을 선택하시면 해당 서점의 상품 페이지가 새 창으로 열립니다.</p>
      </div>`;
    document.body.appendChild(modal);
    modal.querySelectorAll("[data-store-close]").forEach((el) => {
      el.addEventListener("click", closeStoreModal);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && modal.classList.contains("open")) closeStoreModal();
    });
    return modal;
  }

  function openStoreModal(b) {
    const stores = storeList(b);
    if (!stores.length) return;
    const modal = ensureStoreModal();
    modal.querySelector("#store-modal-title").textContent = b.title;
    modal.querySelector(".store-sub").textContent = b.subtitle || "";
    modal.querySelector(".store-links").innerHTML = stores
      .map(
        (s) =>
          `<a class="store-link" href="${s.url}" target="_blank" rel="noopener noreferrer"><span>${s.label}</span><em>바로가기 →</em></a>`
      )
      .join("");
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("preview-lock");
    const first = modal.querySelector(".store-link");
    if (first) first.focus();
  }

  function closeStoreModal() {
    const modal = document.getElementById("store-modal");
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("preview-lock");
  }

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-buy]");
    if (!trigger || typeof BOOKS === "undefined") return;
    event.preventDefault();
    const book = BOOKS.find((b) => b.id === trigger.getAttribute("data-buy"));
    if (book) openStoreModal(book);
  });

  /* ---------- 보도자료 ---------- */

  function renderPress(container) {
    const manual = typeof PRESS_ITEMS !== "undefined" ? PRESS_ITEMS.slice() : [];
    const covered = new Set(manual.map((item) => item.bookId).filter(Boolean));
    const auto =
      typeof BOOKS === "undefined"
        ? []
        : BOOKS.filter(isPublished)
            .filter((b) => !covered.has(b.id))
            .map((b) => {
              const stores = storeList(b);
              return {
                bookId: b.id,
                date: b.pubDate || "",
                title: `『${b.title}』 전자책 출간`,
                body: `이성과 본질의 신간 『${b.title}』(부제: ${b.subtitle})이 전자책으로 출간되었습니다. ${b.desc}`,
                stores: stores
              };
            });

    const items = manual
      .concat(auto)
      .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));

    if (!items.length) {
      container.innerHTML = `
        <div class="empty-state">
          <h3>준비 중입니다</h3>
          <p>이성과 본질의 첫 책들이 출간되면 이 페이지에 관련 보도자료와 소식을 순서대로 업데이트할 예정입니다.</p>
        </div>`;
      return;
    }

    container.innerHTML = items
      .map((item) => {
        const book = typeof BOOKS !== "undefined" ? BOOKS.find((b) => b.id === item.bookId) : null;
        const stores = item.stores && item.stores.length ? item.stores : storeList(book);
        const links = stores.length
          ? `<div class="press-stores">${stores
              .map(
                (s) =>
                  `<a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.label}</a>`
              )
              .join("")}</div>`
          : "";
        const cover = book && coverSrc(book) ? `<div class="press-cover"><img src="${coverSrc(book)}" alt="${book.title} 표지" loading="lazy"></div>` : "";
        const more = book ? `<a class="press-more" href="books/${book.id}.html">도서 상세 보기 →</a>` : "";
        return `
          <div class="press-item${cover ? " has-cover" : ""}">
            ${cover}
            <div class="press-body">
              <div class="date">${formatDate(item.date)}</div>
              <h3>${item.title}</h3>
              <p>${item.body}</p>
              ${links}
              ${more}
            </div>
          </div>`;
      })
      .join("");
  }

  function renderBookDetail() {
    const params = new URLSearchParams(location.search);
    const id = params.get("id") || detailEl.getAttribute("data-book-id");
    const b = BOOKS.find((x) => x.id === id);

    if (!b) {
      detailEl.innerHTML = `
        <div class="empty-state">
          <h3>책을 찾을 수 없습니다</h3>
          <p>주소가 올바른지 확인해주시거나, 도서목록에서 다시 선택해주세요.</p>
        </div>
        <div style="text-align:center; margin-top:32px;">
          <a href="/books.html" class="btn">도서목록으로 돌아가기</a>
        </div>`;
      document.title = "도서를 찾을 수 없습니다 | 이성과 본질";
      return;
    }

    document.title = `${b.title} | 이성과 본질`;

    const tocHTML = (b.toc || [])
      .map((section) => {
        const chapters = section.chapters || [];
        const list = chapters.length
          ? `<ul class="toc-list">${chapters.map((c) => `<li>${c}</li>`).join("")}</ul>`
          : "";
        return `<div class="toc-part">${section.part ? `<h3 class="toc-part-title">${section.part}</h3>` : ""}${list}</div>`;
      })
      .join("");
    const previewPages = buildPreviewPages(b);

    detailEl.innerHTML = `
      <div class="detail-top">
        <div class="detail-cover">
          <img src="${coverSrc(b)}" alt="${b.title} 표지" id="cover-zoom-trigger" tabindex="0" role="button" aria-label="표지 원본 크기로 보기">
        </div>
        <div class="detail-info">
          <span class="pill">${b.category}</span>
          <div class="status" style="margin-top:14px;">${statusLabel(b)}${
      isPublished(b) && b.pubDate ? ` · ${formatDate(b.pubDate)}` : ""
    }</div>
          <h1>${b.title}</h1>
          <div class="subtitle">${b.subtitle}</div>
          <p class="desc">${b.desc}</p>
          <div class="detail-actions">
            <button type="button" class="btn preview-open" id="preview-open">책 미리보기</button>
          </div>
          ${
            storeList(b).length
              ? `<div class="detail-stores">
                   <span class="detail-stores-label">구매처</span>
                   ${storeList(b)
                     .map(
                       (s) =>
                         `<a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.label}</a>`
                     )
                     .join("")}
                 </div>`
              : ""
          }
        </div>
      </div>

      <div class="detail-sections">
        <section class="detail-section">
          <h2>기획 의도</h2>
          <p>${b.intent || "준비 중입니다."}</p>
        </section>

        <section class="detail-section">
          <h2>예상 독자</h2>
          <p>${b.audience || "준비 중입니다."}</p>
        </section>

        <section class="detail-section">
          <h2>${isPublished(b) ? "목차" : "목차(안)"}</h2>
          ${
            tocHTML
              ? `${tocHTML}${
                  isPublished(b)
                    ? ""
                    : `<p class="toc-note">* 목차는 출간 전 최종 확정될 수 있습니다.</p>`
                }`
              : `<p>목차는 출간 준비 중 순차적으로 공개됩니다.</p>`
          }
        </section>
      </div>

      <div style="text-align:center; margin-top:56px;">
        <a href="/books.html" class="btn">← 도서목록으로 돌아가기</a>
      </div>

      <div class="cover-lightbox" id="cover-lightbox" aria-hidden="true">
        <div class="cover-lightbox-backdrop" data-cover-close></div>
        <div class="cover-lightbox-inner">
          <button type="button" class="cover-lightbox-close" data-cover-close aria-label="닫기">×</button>
          <img src="${coverSrc(b)}" alt="${b.title} 표지 원본" data-cover-close>
        </div>
      </div>

      <div class="preview-modal" id="preview-modal" aria-hidden="true">
        <div class="preview-backdrop" data-preview-close></div>
        <section class="preview-reader" role="dialog" aria-modal="true" aria-labelledby="preview-title">
          <header class="preview-header">
            <div>
              <span class="preview-kicker">BOOK PREVIEW</span>
              <h2 id="preview-title">${b.title}</h2>
            </div>
            <div class="preview-tools">
              <button type="button" class="preview-tool" id="preview-font-down" aria-label="글자 작게">가−</button>
              <button type="button" class="preview-tool" id="preview-font-up" aria-label="글자 크게">가+</button>
              <button type="button" class="preview-close" data-preview-close aria-label="미리보기 닫기">×</button>
            </div>
          </header>
          <div class="preview-body">
            <aside class="preview-book">
              <img src="${coverSrc(b)}" alt="${b.title} 표지">
              <strong>${b.title}</strong>
              <span>${b.subtitle}</span>
            </aside>
            <article class="preview-page" id="preview-page" tabindex="0"></article>
          </div>
          <footer class="preview-footer">
            <button type="button" class="preview-nav" id="preview-prev">← 이전</button>
            <span id="preview-progress" aria-live="polite"></span>
            <button type="button" class="preview-nav" id="preview-next">다음 →</button>
          </footer>
        </section>
      </div>`;

    setupPreview(previewPages);
    setupCoverZoom();
  }

  function setupCoverZoom() {
    const trigger = document.getElementById("cover-zoom-trigger");
    const lightbox = document.getElementById("cover-lightbox");
    if (!trigger || !lightbox) return;

    const openLightbox = () => {
      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("preview-lock");
    };
    const closeLightbox = () => {
      lightbox.classList.remove("open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.classList.remove("preview-lock");
      trigger.focus();
    };

    trigger.addEventListener("click", openLightbox);
    trigger.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openLightbox();
      }
    });
    lightbox.querySelectorAll("[data-cover-close]").forEach((el) => {
      el.addEventListener("click", closeLightbox);
    });
    document.addEventListener("keydown", (event) => {
      if (lightbox.classList.contains("open") && event.key === "Escape") closeLightbox();
    });
  }

  function buildPreviewPages(b) {
    const manuscriptPreview =
      typeof BOOK_PREVIEWS !== "undefined" && BOOK_PREVIEWS[b.id]
        ? BOOK_PREVIEWS[b.id]
        : b.preview;

    if (Array.isArray(manuscriptPreview) && manuscriptPreview.length) {
      return manuscriptPreview.map((item, index) => ({
        label: item.label || `미리보기 ${index + 1}`,
        title: item.title || b.title,
        html: (item.paragraphs || []).map((paragraph) => `<p>${paragraph}</p>`).join("")
      }));
    }

    const toc = b.toc || [];
    const firstSection = toc.find((section) => (section.chapters || []).length) || {};
    const sampleChapters = (firstSection.chapters || []).slice(0, 5);

    return [
      {
        label: "책을 열며",
        title: b.subtitle || b.title,
        html: `
          <p class="preview-lead">${b.desc}</p>
          <p>${b.intent || "이 책의 미리보기 원고는 출간 준비와 함께 순차적으로 공개됩니다."}</p>
          <p class="preview-note">이 미리보기는 출간 전 편집 과정에 따라 달라질 수 있습니다.</p>`
      },
      {
        label: "이 책의 독자",
        title: "이런 독자에게 권합니다",
        html: `
          <p>${b.audience || "이 책의 주제에 관심 있는 모든 독자를 위한 교양서입니다."}</p>
          <blockquote>${b.desc}</blockquote>`
      },
      {
        label: "목차 미리보기",
        title: firstSection.part || "차례",
        html: sampleChapters.length
          ? `<ol>${sampleChapters.map((chapter) => `<li>${chapter}</li>`).join("")}</ol>
             <p class="preview-note">전체 목차는 상세 페이지 아래에서 확인할 수 있습니다.</p>`
          : `<p>목차는 출간 준비 중 순차적으로 공개됩니다.</p>`
      }
    ];
  }

  function setupPreview(pages) {
    const modal = document.getElementById("preview-modal");
    const openButton = document.getElementById("preview-open");
    const page = document.getElementById("preview-page");
    const progress = document.getElementById("preview-progress");
    const prev = document.getElementById("preview-prev");
    const next = document.getElementById("preview-next");
    const fontDown = document.getElementById("preview-font-down");
    const fontUp = document.getElementById("preview-font-up");
    let pageIndex = 0;
    let fontScale = 1;

    if (!modal || !openButton || !page) return;

    const renderPage = () => {
      const current = pages[pageIndex];
      page.innerHTML = `
        <span class="preview-page-label">${current.label}</span>
        <h3>${current.title}</h3>
        <div class="preview-copy">${current.html}</div>`;
      page.style.setProperty("--preview-font-scale", fontScale);
      progress.textContent = `${pageIndex + 1} / ${pages.length}`;
      prev.disabled = pageIndex === 0;
      next.disabled = pageIndex === pages.length - 1;
      page.scrollTop = 0;
    };

    const openPreview = () => {
      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("preview-lock");
      renderPage();
      page.focus();
    };

    const closePreview = () => {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("preview-lock");
      openButton.focus();
    };

    openButton.addEventListener("click", openPreview);
    modal.querySelectorAll("[data-preview-close]").forEach((button) => {
      button.addEventListener("click", closePreview);
    });
    prev.addEventListener("click", () => {
      if (pageIndex > 0) {
        pageIndex -= 1;
        renderPage();
      }
    });
    next.addEventListener("click", () => {
      if (pageIndex < pages.length - 1) {
        pageIndex += 1;
        renderPage();
      }
    });
    fontDown.addEventListener("click", () => {
      fontScale = Math.max(0.85, +(fontScale - 0.1).toFixed(2));
      renderPage();
    });
    fontUp.addEventListener("click", () => {
      fontScale = Math.min(1.4, +(fontScale + 0.1).toFixed(2));
      renderPage();
    });
    document.addEventListener("keydown", (event) => {
      if (!modal.classList.contains("open")) return;
      if (event.key === "Escape") closePreview();
      if (event.key === "ArrowLeft" && pageIndex > 0) {
        pageIndex -= 1;
        renderPage();
      }
      if (event.key === "ArrowRight" && pageIndex < pages.length - 1) {
        pageIndex += 1;
        renderPage();
      }
    });
  }
});
