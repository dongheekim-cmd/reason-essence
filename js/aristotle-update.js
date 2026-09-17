/* 2026-09-18: 아리스토텔레스 도서명/부제/표지 변경 */
if (typeof BOOKS !== "undefined") {
  const book = BOOKS.find((b) => b.id === "scientist-aristotle");
  if (book) {
    book.title = "아리스토텔레스라는 세계";
    book.subtitle = "자연과 인간을 하나의 체계로 읽다";
    book.image = "images/books/scientist-aristotle-20260918.webp";
  }
}
