import { useState, useEffect } from "react";
import CatalogSearch from "./CatalogSearch";
import CatalogItem from "./CatalogItem";
import Pagination from "./Pagination";
import "../styles/search.css";

function CatalogSearchPage() {
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(16); // Changed from 12 to 16
  const [totalPages, setTotalPages] = useState(0);

  // Calculate total pages when results change
  useEffect(() => {
    setTotalPages(Math.ceil(searchResults.length / itemsPerPage));
    // Reset to first page when new search results arrive
    setCurrentPage(1);
  }, [searchResults, itemsPerPage]);

  const handleSearchResults = (results, isUserSearch = false) => {
    setSearchResults(results);
    setIsLoading(false);

    // Mostrar resultados (o mensaje de "no hay resultados") para cualquier búsqueda con texto
    if (isUserSearch) {
      setHasSearched(true);
      setIsInitialLoad(false);
    } else {
      // Si es una búsqueda vacía, no mostramos resultados
      setHasSearched(false);
    }
  };

  // Get current items for the page
  const getCurrentItems = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return searchResults.slice(indexOfFirstItem, indexOfLastItem);
  };

  // Handlers for pagination
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleFirstPage = () => {
    setCurrentPage(1);
  };

  const handleLastPage = () => {
    setCurrentPage(totalPages);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="container">
      <h2>Catàleg de la Biblioteca</h2>

      <CatalogSearch onSearchResults={handleSearchResults} onSearchStart={() => setIsLoading(true)} />

      {hasSearched && (
        <div className="search-results-container">
          <h3>{`Resultats de la cerca (${searchResults.length})`}</h3>

          {searchResults.length > 0 ? (
            <div className="results-with-pagination">
              <div className="catalog-grid">
                {getCurrentItems().map((item) => (
                  <CatalogItem key={item.id} item={item} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="pagination-wrapper">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    onFirstPage={handleFirstPage}
                    onLastPage={handleLastPage}
                    onPrevPage={handlePrevPage}
                    onNextPage={handleNextPage}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="no-results">
              <p>No s'han trobat resultats per aquesta cerca.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CatalogSearchPage;
