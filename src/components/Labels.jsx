import { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import Pagination from "./Pagination";
import ExemplarSearch from "./ExemplarSearch";
import "../styles/Labels.css";

import { generateLabelsPDF, searchExemplars } from "../services/api";

export default function Labels() {
    const { userCentre } = useContext(AuthContext);
    const [textQuery, setTextQuery] = useState("");
    const [rangeStart, setRangeStart] = useState("");
    const [rangeEnd, setRangeEnd] = useState("");
    const [codeQuery, setCodeQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false); // Nuevo estado para imprimir
    const [searchResults, setSearchResults] = useState([]);
    const [selectedExemplars, setSelectedExemplars] = useState([]);
    const [error, setError] = useState(null);
    const [activeSearch, setActiveSearch] = useState(null); // Tipo de búsqueda activa
    const searchInputRef = useRef(null);
    const [selectedSuggestion, setSelectedSuggestion] = useState(null);

    // Estado para paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const itemsPerPage = 10;

    // Manejar cambios en el campo de búsqueda
    const handleTextQueryChange = (query) => {
        setTextQuery(query);
    };

    const handleCodeQueryChange = (e) => {
        let value = e.target.value.replace(/[^0-9]/g, ""); // Elimina todo excepto números

        // Limita a un máximo de 10 dígitos
        value = value.slice(0, 10);

        let formatted = value;
        if (value.length > 4) {
            formatted = `${value.slice(0, 4)}-${value.slice(4, 10)}`;
        }

        setCodeQuery(`EX-${formatted}`);
    };

    const handleClearInputs = () => {
        setTextQuery("");
        setRangeStart("");
        setRangeEnd("");
        setCodeQuery("");
        setSelectedSuggestion(null); // Limpiar también la sugerencia seleccionada

        // Resetear el componente ExemplarSearch
        if (searchInputRef.current) {
            searchInputRef.current.reset();
        }
    };

    // Reemplazar la función handlePrintLabels con esta implementación:
    const handlePrintLabels = async () => {
        if (selectedExemplars.length === 0) {
            setError("No hay ejemplares seleccionados para imprimir");
            return;
        }

        try {
            setIsPrinting(true); // Usar el nuevo estado en lugar de isSearching

            // Obtener lista de IDs de ejemplares seleccionados
            const exemplarIds = selectedExemplars.map((exemplar) => exemplar.id);

            // Llamar al backend para generar el PDF
            const pdfBlob = await generateLabelsPDF(exemplarIds);

            // Crear una URL para el blob y abrirlo en una nueva ventana
            const pdfUrl = URL.createObjectURL(pdfBlob);
            window.open(pdfUrl, "_blank");

            // Limpiar la URL del objeto después de un tiempo
            setTimeout(() => URL.revokeObjectURL(pdfUrl), 30000);
        } catch (error) {
            console.error("Error al generar las etiquetas:", error);
            setError(`Error al generar las etiquetas: ${error.message}`);
        } finally {
            setIsPrinting(false); // Restablecer el nuevo estado
        }
    };

    // Función para realizar la búsqueda
    const handleSearch = async (e) => {
        e.preventDefault();
        setIsSearching(true);
        setError(null);

        try {
            let searchQuery = {};
            let hasCriteria = false;

            // Añadir criterios de texto si existen
            if (textQuery.trim()) {
                hasCriteria = true;
                if (selectedSuggestion) {
                    // Si hay una sugerencia seleccionada, añadir información exacta
                    searchQuery.exact = true;
                    searchQuery.id = selectedSuggestion.id;
                    searchQuery.tipo = selectedSuggestion.tipo;
                    searchQuery.query = textQuery;
                } else {
                    // Búsqueda normal por texto
                    searchQuery.textQuery = textQuery;
                }
                setActiveSearch("combined"); // Indicar que es una búsqueda combinada
            }

            // Añadir criterios de rango si existen
            if (rangeStart.trim() && rangeEnd.trim()) {
                hasCriteria = true;
                // Añadir parámetros de búsqueda por rango
                searchQuery.rangeSearch = true;
                searchQuery.rangeStart = rangeStart.trim().padStart(6, "0");
                searchQuery.rangeEnd = rangeEnd.trim().padStart(6, "0");

                setActiveSearch(textQuery.trim() ? "combined" : "range");
            }

            // Añadir criterio de código específico si existe
            if (codeQuery.trim()) {
                hasCriteria = true;
                searchQuery.codeQuery = codeQuery;
                setActiveSearch(textQuery.trim() || (rangeStart.trim() && rangeEnd.trim()) ? "combined" : "code");
            }

            if (!hasCriteria) {
                setError("Si us plau, introdueix almenys un criteri de cerca");
                setIsSearching(false);
                return;
            }

            // Obtener el ID del centro del usuario actual
            const centreId = userCentre?.id;

            // Realizar la búsqueda filtrando por centro
            let results = await searchExemplars(searchQuery, centreId);

            // Ordenar los resultados por código de registro
            results = results.sort((a, b) => {
                // Extraer la parte numérica después del último guion
                const getNumericPart = (reg) => {
                    const parts = reg.split("-");
                    if (parts.length > 2) {
                        // Convertir la parte de año y secuencia a un número
                        const year = parseInt(parts[1]) || 0;
                        const seq = parseInt(parts[2]) || 0;
                        return year * 1000000 + seq; // Combinar para mantener orden correcto
                    }
                    return 0;
                };

                const numA = getNumericPart(a.registre);
                const numB = getNumericPart(b.registre);

                return numA - numB; // Orden ascendente
            });

            setSearchResults(results);
            setCurrentPage(1);
            setTotalPages(Math.ceil(results.length / itemsPerPage));
        } catch (error) {
            setError(`Error al realizar la búsqueda: ${error.message}`);
        } finally {
            setIsSearching(false);
        }
    };

    // Función para obtener los resultados de la página actual
    const getCurrentPageResults = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return searchResults.slice(startIndex, endIndex);
    };

    // Función para toggle la selección de un ejemplar
    const toggleSelection = (exemplar) => {
        setSelectedExemplars((prev) => {
            const isSelected = prev.some((item) => item.id === exemplar.id);

            if (isSelected) {
                return prev.filter((item) => item.id !== exemplar.id);
            } else {
                return [...prev, exemplar];
            }
        });
    };

    // Función para quitar un ejemplar de los seleccionados
    const removeSelection = (id) => {
        setSelectedExemplars((prev) => prev.filter((item) => item.id !== id));
    };

    // Función para limpiar todas las selecciones
    const clearSelections = () => {
        setSelectedExemplars([]);
    };

    // Navegación por páginas
    const handlePageChange = (pageNum) => {
        setCurrentPage(pageNum);
    };

    // Handlers específicos para distintos tipos de navegación
    const handleFirstPage = () => setCurrentPage(1);
    const handleLastPage = () => setCurrentPage(totalPages);
    const handlePrevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
    const handleNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

    return (
        <div className="labels-container">
            <div className="labels-search-section">
                <h2>Cercador d'exemplars per imprimir etiquetes</h2>

                <div className="search-form-container">
                    <form onSubmit={handleSearch} className="search-form">
                        <div className="form-inputs">
                            {/* Primera fila: búsqueda por texto y rango */}
                            <div className="form-row-grid">
                                <div className="form-group">
                                    <label htmlFor="text-search">Obra, autor o editorial:</label>
                                    <ExemplarSearch
                                        ref={searchInputRef}
                                        value={textQuery}
                                        onSearchResults={() => {}}
                                        onQueryChange={(query, suggestion) => {
                                            setTextQuery(query);
                                            setSelectedSuggestion(suggestion || null);
                                        }}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="range-start">Rang de codis:</label>
                                    <div className="range-inputs">
                                        <input
                                            type="text"
                                            id="range-start"
                                            value={rangeStart}
                                            onChange={(e) => setRangeStart(e.target.value.replace(/\D/g, ""))}
                                            placeholder="Codi inicial"
                                            maxLength={6}
                                        />
                                        <span className="range-separator">-</span>
                                        <input
                                            type="text"
                                            id="range-end"
                                            value={rangeEnd}
                                            onChange={(e) => setRangeEnd(e.target.value.replace(/\D/g, ""))}
                                            placeholder="Codi final"
                                            maxLength={6}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Segunda fila: búsqueda por código específico y botón de búsqueda */}
                            <div className="form-row-grid">
                                <div className="form-group">
                                    <label htmlFor="code-search">Codi d'exemplar específic:</label>
                                    <input
                                        type="text"
                                        id="code-search"
                                        value={codeQuery}
                                        onChange={handleCodeQueryChange}
                                        placeholder="EX-YYYY-NNNNNN"
                                    />
                                </div>

                                <div className="form-group search-button-wrapper">
                                    <label>&nbsp;</label>
                                    <div className="button-group">
                                        <button
                                            type="button"
                                            className="clear-inputs-button"
                                            onClick={handleClearInputs}>
                                            Neteja
                                        </button>
                                        <button type="submit" className="search-button search-exemplars">
                                            {isSearching ? "Cercant..." : "Cercar"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Mensajes de error */}
                {error && <div className="error-message">{error}</div>}

                {/* Resultados de la búsqueda */}
                {searchResults.length > 0 && (
                    <div className="search-results">
                        <h3>Resultats ({searchResults.length})</h3>

                        <table className="results-table">
                            <thead>
                                <tr>
                                    <th>Registre</th>
                                    <th>Obra</th>
                                    <th>Autor</th>
                                    <th>Editorial</th>
                                    <th>Tipus</th>
                                    <th>Afegir</th>
                                </tr>
                            </thead>
                            <tbody>
                                {getCurrentPageResults().map((exemplar) => {
                                    const isSelected = selectedExemplars.some((item) => item.id === exemplar.id);

                                    return (
                                        <tr key={exemplar.id} className={isSelected ? "selected" : ""}>
                                            <td>{exemplar.registre}</td>
                                            <td>{exemplar.titol}</td>
                                            <td>{exemplar.autor}</td>
                                            <td>{exemplar.editorial}</td>
                                            <td>
                                                <span className="badge item-type-badge">{exemplar.tipus}</span>
                                            </td>
                                            <td className="text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleSelection(exemplar)}
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {/* Paginación */}
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
                )}

                {searchResults.length === 0 && isSearching === false && activeSearch !== null && (
                    <div className="no-results">
                        <p>No s'han trobat resultats amb els criteris especificats</p>
                    </div>
                )}
            </div>

            {/* Panel lateral con ejemplares seleccionados */}
            <div className="labels-selection-panel">
                <h3>Exemplars seleccionats ({selectedExemplars.length})</h3>

                {selectedExemplars.length > 0 ? (
                    <>
                        <div className="selected-items">
                            {selectedExemplars.map((exemplar) => (
                                <div key={exemplar.id} className="selected-item">
                                    <div className="item-info">
                                        <p className="item-code">{exemplar.registre}</p>
                                        <p className="item-title">{exemplar.titol}</p>
                                    </div>
                                    <button
                                        className="remove-button"
                                        onClick={() => removeSelection(exemplar.id)}
                                        title="Eliminar de la selecció">
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="action-buttons">
                            <button onClick={clearSelections} className="clear-button">
                                Esborrar selecció
                            </button>
                            <button onClick={handlePrintLabels} className="print-button">
                                {isPrinting ? "Imprimint..." : "Imprimir etiquetes"}
                            </button>{" "}
                        </div>
                    </>
                ) : (
                    <div className="empty-selection">
                        <p>No hi ha exemplars seleccionats</p>
                        <p>Selecciona exemplars de la llista de resultats per a crear etiquetes</p>
                    </div>
                )}
            </div>
        </div>
    );
}
