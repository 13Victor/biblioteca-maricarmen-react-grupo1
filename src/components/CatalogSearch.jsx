import { useState, useEffect, useRef } from 'react';
import { searchSuggestions, searchCatalog } from '../services/api';
import useDebounce from '../hooks/useDebounce';

function CatalogSearch({ onSearchResults }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);
  
  // Aplicar debounce a la consulta de búsqueda
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Cargar todos los resultados al inicio
  useEffect(() => {
    const loadInitialResults = async () => {
      setIsLoading(true);
      try {
        const results = await searchCatalog('');
        onSearchResults(results, false); // false indica que NO es una búsqueda del usuario
      } catch (error) {
        console.error('Error al cargar resultados iniciales:', error);
        onSearchResults([], false);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialResults();
  }, []);

  // Buscar sugerencias cuando cambia la consulta con debounce
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedSearchQuery.trim() === '') {
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
        console.error('Error al obtener sugerencias:', error);
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

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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
    setIsLoading(true);
    
    try {
      const results = await searchCatalog(trimmedQuery);
      // Si la consulta está vacía, tratarla como carga inicial
      const isUserInitiatedSearch = trimmedQuery !== '';
      onSearchResults(results, isUserInitiatedSearch);
    } catch (error) {
      console.error('Error en la búsqueda:', error);
      onSearchResults([], trimmedQuery !== '');
    } finally {
      setIsLoading(false);
      setShowSuggestions(false);
      setSearchQuery('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };
  
  return (
    <div className="search-container">
      <form className='search-form' onSubmit={handleSubmit}>
        <div className="search-input-container" ref={suggestionsRef}>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => searchQuery.trim() !== '' && setShowSuggestions(true)}
            placeholder="Buscar en el catálogo..."
            className="search-input"
          />
          
          {showSuggestions && suggestions.length > 0 && (
            <ul className="suggestions-list">
              {suggestions.map((suggestion) => (
                <li
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="suggestion-item"
                >
                  <span className="suggestion-title">{suggestion.titol}</span>
                  {suggestion.autor && (
                    <span className="informative-text"> - {suggestion.autor}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <button 
          type="submit" 
          className="search-button"
          disabled={isLoading}
        >
          Buscar
        </button>
      </form>
    </div>
  );
}

export default CatalogSearch;