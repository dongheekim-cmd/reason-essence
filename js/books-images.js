/* 이성과 본질 — 도서 표지 이미지 및 웹페이지 문구 보정
   2026-08-06: 『끝나지 않는 방랑』 표지와 부제 수정 */

const BOOK_IMAGES = {
  wandering: "images/books/wandering-20260806.webp"
};

/* books-data.js가 로드된 뒤, main.js가 화면을 그리기 전에 문구를 수정합니다. */
document.addEventListener("DOMContentLoaded", () => {
  if (typeof BOOKS === "undefined") return;

  const wandering = BOOKS.find((book) => book.id === "wandering");
  if (!wandering) return;

  wandering.subtitle = "영화 오디세이 원전, 3000년 방랑 서사의 계보";
});
