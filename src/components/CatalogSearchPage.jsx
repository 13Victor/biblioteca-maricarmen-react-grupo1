import { useState } from "react";
import CatalogSearch from "./CatalogSearch";
import CatalogItem from "./CatalogItem";
import "../styles/search.css";

function CatalogSearchPage() {
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const handleSearchResults = (results, isUserSearch = false) => {
    setSearchResults(results);

    // Mostrar resultados (o mensaje de "no hay resultados") para cualquier búsqueda con texto
    if (isUserSearch) {
      setHasSearched(true);
      setIsInitialLoad(false);
    } else {
      // Si es una búsqueda vacía, no mostramos resultados
      setHasSearched(false);
    }
  };

  return (
    <div className="container">
      <h2>Catálogo de la Biblioteca</h2>

      <CatalogSearch onSearchResults={handleSearchResults} />

      {hasSearched && (
        <div className="search-results-container">
          <h3>{`Resultados de la búsqueda (${searchResults.length})`}</h3>

          {searchResults.length > 0 ? (
            <div className="catalog-grid">
              {searchResults.map((item) => (
                <CatalogItem key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="no-results">
              <p>No se encontraron resultados para esta búsqueda.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CatalogSearchPage;
