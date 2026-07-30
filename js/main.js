/* 이성과 본질 — 공통 스크립트
   책 내용을 고치려면 js/books-data.js 파일만 수정하면 됩니다.
   표지 이미지 데이터(js/books-images.js)는 손으로 수정하지 않아도 됩니다. */

document.addEventListener("DOMContentLoaded", () => {
  /* 로고 / 파비콘 적용 */
  if (typeof LOGO_ICON !== "undefined") {
    document.querySelectorAll(".site-logo").forEach((img) => (img.src = LOGO_ICON));
    const favicon = document.getElementById("favicon-link");
    if (favicon) favicon.href = LOGO_ICON;
  }

  /* 모바일 내비게이션 토글 */
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => nav.classList.toggle("open"));
  }

  /* 홈 화면 — 대표 도서 4권 렌더링 */
  const featuredEl = document.getElementById("featured-books");
  if (featuredEl && typeof BOOKS !== "undefined") {
    const featuredIds = ["world-essence", "wandering", "questioning-machine", "boundary-science"];
    const featured = featuredIds
      .map((id) => BOOKS.find((b) => b.id === id))
      .filter(Boolean);
    featuredEl.innerHTML = featured.map(bookCardHTML).join("");
  }

  /* 도서목록 페이지 — 전체 렌더링 + 필터 */
  const gridEl = document.getElementById("book-grid");
  if (gridEl && typeof BOOKS !== "undefined") {
    renderGrid(BOOKS);

    const filterBtns = document.querySelectorAll(".filter-bar button");
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const cat = btn.dataset.filter;
        const list = cat === "all" ? BOOKS : BOOKS.filter((b) => b.category === cat);
        renderGrid(list);
      });
    });
  }

  /* 도서 상세 페이지 — book.html?id=... */
  const detailEl = document.getElementById("book-detail");
  if (detailEl && typeof BOOKS !== "undefined") {
    renderBookDetail();
  }

  function renderGrid(list) {
    gridEl.innerHTML = list.map(bookCardHTML).join("");
  }

  function coverSrc(b) {
    return typeof BOOK_IMAGES !== "undefined" && BOOK_IMAGES[b.id] ? BOOK_IMAGES[b.id] : "";
  }

  function bookCardHTML(b) {
    return `
      <a class="book-card-link" href="book.html?id=${b.id}">
        <article class="book-card">
          <div class="cover"><img src="${coverSrc(b)}" alt="${b.title} 표지" loading="lazy"></div>
          <div class="meta">
            <div class="status">${b.status}</div>
            <h3>${b.title}</h3>
            <div class="subtitle">${b.subtitle}</div>
            <p class="desc">${b.desc}</p>
          </div>
        </article>
      </a>`;
  }

  function renderBookDetail() {
    const params = new URLSearchParams(location.search);
    const id = params.get("id");
    const b = BOOKS.find((x) => x.id === id);

    if (!b) {
      detailEl.innerHTML = `
        <div class="empty-state">
          <h3>책을 찾을 수 없습니다</h3>
          <p>주소가 올바른지 확인해주시거나, 도서목록에서 다시 선택해주세요.</p>
        </div>
        <div style="text-align:center; margin-top:32px;">
          <a href="books.html" class="btn">도서목록으로 돌아가기</a>
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

    detailEl.innerHTML = `
      <div class="detail-top">
        <div class="detail-cover">
          <img src="${coverSrc(b)}" alt="${b.title} 표지">
        </div>
        <div class="detail-info">
          <span class="pill">${b.category}</span>
          <div class="status" style="margin-top:14px;">${b.status}</div>
          <h1>${b.title}</h1>
          <div class="subtitle">${b.subtitle}</div>
          <p class="desc">${b.desc}</p>
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
          <h2>목차(안)</h2>
          ${
            tocHTML
              ? `${tocHTML}<p class="toc-note">* 목차는 출간 전 최종 확정될 수 있습니다.</p>`
              : `<p>목차는 출간 준비 중 순차적으로 공개됩니다.</p>`
          }
        </section>
      </div>

      <div style="text-align:center; margin-top:56px;">
        <a href="books.html" class="btn">← 도서목록으로 돌아가기</a>
      </div>`;
  }
});
