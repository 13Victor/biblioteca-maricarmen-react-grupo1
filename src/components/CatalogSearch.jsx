import { useState, useEffect, useRef } from "react";
import { searchSuggestions, searchCatalog } from "../services/api";
import useDebounce from "../hooks/useDebounce";

function CatalogSearch({ onSearchResults }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);

  // Aplicar debounce a la consulta de búsqueda
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Eliminamos la carga inicial de resultados
  // useEffect(() => {
  //   const loadInitialResults = async () => {
  //     ...
  //   };
  //
  //   loadInitialResults();
  // }, []);

  // Buscar sugerencias cuando cambia la consulta con debounce
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedSearchQuery.trim() === "") {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      if (debouncedSearchQuery.length < 3) {
        setSuggestions([]);
        setIsLoading(false);
        return;
      }

      try {
        const data = await searchSuggestions(debouncedSearchQuery);
        setSuggestions(data);
      } catch (error) {
        console.error("Error al obtener sugerencias:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedSearchQuery]);

  // Cerrar las sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value.length > 2) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.titol);
    setShowSuggestions(false);
    handleSearch(suggestion.titol);
  };

  const handleSearch = async (query = searchQuery) => {
    const trimmedQuery = query.trim();

    // No realizar búsqueda si la consulta está vacía
    if (trimmedQuery === "") {
      onSearchResults([], false);
      return;
    }

    setIsLoading(true);

    try {
      const results = await searchCatalog(trimmedQuery);
      // Pasamos true para indicar que es una búsqueda iniciada por el usuario
      // incluso cuando no hay resultados
      onSearchResults(results, true);
    } catch (error) {
      console.error("Error en la búsqueda:", error);
      onSearchResults([], true);
    } finally {
      setIsLoading(false);
      setShowSuggestions(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <div className="search-container">
      <form className="search-form" onSubmit={handleSubmit}>
        <div className="search-input-container" ref={suggestionsRef}>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => searchQuery.trim() !== "" && setShowSuggestions(true)}
            placeholder="Buscar en el catálogo..."
            className="search-input"
          />

          {showSuggestions && suggestions.length > 0 && (
            <ul className="suggestions-list">
              {suggestions.map((suggestion) => (
                <li key={suggestion.id} onClick={() => handleSuggestionClick(suggestion)} className="suggestion-item">
                  <span className="suggestion-title">{suggestion.titol}</span>
                  {suggestion.autor && <span className="informative-text"> - {suggestion.autor}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button type="submit" className="search-button" disabled={isLoading || searchQuery.trim() === ""}>
          {isLoading ? (
            <div className="button-loader">
              <div className="spinner"></div>
            </div>
          ) : (
            "Buscar"
          )}
        </button>
      </form>
    </div>
  );
}

export default CatalogSearch;
