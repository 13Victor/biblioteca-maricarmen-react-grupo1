import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { searchExemplarSuggestions, searchExemplars } from "../services/api";
import useDebounce from "../hooks/useDebounce";

const ExemplarSearch = forwardRef(({ onSearchResults, onQueryChange, value }, ref) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedSuggestion, setSelectedSuggestion] = useState(null); // Nuevo estado para guardar la sugerencia seleccionada
    const suggestionsRef = useRef(null);
    const [query, setQuery] = useState(value || "");

    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    useImperativeHandle(ref, () => ({
        reset: () => {
            setQuery("");
            setSearchQuery("");
            setSuggestions([]);
            setShowSuggestions(false);
            setSelectedSuggestion(null); // Resetear la sugerencia seleccionada
        },
    }));

    useEffect(() => {
        setQuery(value || "");
    }, [value]);

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
                const data = await searchExemplarSuggestions(debouncedSearchQuery);
                setSuggestions(data);
            } catch (error) {
                console.error("Error al obtener sugerencias de ejemplares:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSuggestions();
    }, [debouncedSearchQuery]);

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
        const query = e.target.value;
        setSearchQuery(query);
        setSelectedSuggestion(null); // Limpiar la sugerencia si el usuario edita manualmente
        if (onQueryChange) {
            onQueryChange(query);
        }
        if (query.length > 2) {
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchQuery(suggestion.resultado);
        setSelectedSuggestion(suggestion); // Guardar la sugerencia completa
        setShowSuggestions(false);

        // Transmitir la información de la sugerencia al componente padre
        if (onQueryChange) {
            onQueryChange(suggestion.resultado, suggestion);
        }
    };

    const handleSearch = async (query = searchQuery) => {
        const trimmedQuery = query.trim();

        if (trimmedQuery === "") {
            onSearchResults([], false);
            return;
        }

        setIsLoading(true);

        try {
            let results;
            if (selectedSuggestion) {
                // Si hay una sugerencia seleccionada, buscar por su ID o tipo específico
                results = await searchExemplars({
                    exact: true,
                    id: selectedSuggestion.id,
                    tipo: selectedSuggestion.tipo,
                    query: trimmedQuery,
                });
            } else {
                // Búsqueda normal por texto
                results = await searchExemplars(trimmedQuery);
            }
            onSearchResults(results, true);
        } catch (error) {
            console.error("Error en la búsqueda de ejemplares:", error);
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
        <div>
            <form className="search-form" onSubmit={handleSubmit}>
                <div className="search-input-container" ref={suggestionsRef}>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onFocus={() => searchQuery.trim() !== "" && setShowSuggestions(true)}
                        placeholder="Buscar ejemplares por título, autor o editorial..."
                        className="search-input"
                    />

                    {showSuggestions && suggestions.length > 0 && (
                        <ul className="suggestions-list">
                            {suggestions.map((suggestion) => (
                                <li
                                    key={suggestion.id}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className="suggestion-item">
                                    <span className="suggestion-title">
                                        [{suggestion.tipo}] - {suggestion.resultado}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </form>
        </div>
    );
});

export default ExemplarSearch;
