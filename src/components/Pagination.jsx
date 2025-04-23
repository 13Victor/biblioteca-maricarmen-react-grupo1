import React from "react";

function Pagination({ currentPage, totalPages, onPageChange, onFirstPage, onLastPage, onPrevPage, onNextPage }) {
  // Generate array of page numbers to display
  const getPageNumbers = () => {
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    // Adjust start page if end page is at max
    if (endPage === totalPages) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };

  return (
    <div className="pagination">
      <button className="pagination-arrow" onClick={onFirstPage} disabled={currentPage === 1} title="Primera página">
        <i className="fa-solid fa-angles-left"></i>
      </button>

      <button className="pagination-arrow" onClick={onPrevPage} disabled={currentPage === 1} title="Página anterior">
        <i className="fa-solid fa-angle-left"></i>
      </button>

      <div className="pagination-numbers">
        {getPageNumbers().map((number) => (
          <button
            key={number}
            className={`pagination-number ${number === currentPage ? "active" : ""}`}
            onClick={() => onPageChange(number)}
          >
            {number}
          </button>
        ))}
      </div>

      <button
        className="pagination-arrow"
        onClick={onNextPage}
        disabled={currentPage === totalPages}
        title="Página siguiente"
      >
        <i className="fa-solid fa-angle-right"></i>
      </button>

      <button
        className="pagination-arrow"
        onClick={onLastPage}
        disabled={currentPage === totalPages}
        title="Última página"
      >
        <i className="fa-solid fa-angles-right"></i>
      </button>
    </div>
  );
}

export default Pagination;
