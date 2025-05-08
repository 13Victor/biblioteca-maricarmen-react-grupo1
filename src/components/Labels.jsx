import { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import Pagination from "./Pagination";
import ExemplarSearch from "./ExemplarSearch";
import "../styles/Labels.css";
// PDF
import jsPDF from "jspdf";
import JsBarcode from "jsbarcode";
import { createCanvas } from "canvas";

export default function Labels() {
    const { userCentre } = useContext(AuthContext);
    const [textQuery, setTextQuery] = useState("");
    const [rangeStart, setRangeStart] = useState("");
    const [rangeEnd, setRangeEnd] = useState("");
    const [codeQuery, setCodeQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [selectedExemplars, setSelectedExemplars] = useState([]);
    const [error, setError] = useState(null);
    const [activeSearch, setActiveSearch] = useState(null); // Tipo de búsqueda activa

    // Estado para paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const itemsPerPage = 10;

    // Etiquetas
    const LABEL_COLUMNS = 4;
    const LABEL_ROWS = 17;
    const LABEL_WIDTH_CM = 10;
    const LABEL_HEIGHT_CM = 5;

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
    };

    // Función para generar las etiquetas en HTML para impresión
    const handlePrintLabels = () => {
        if (selectedExemplars.length === 0) {
            setError("No hay ejemplares seleccionados para imprimir");
            return;
        }

        // Crear una nueva ventana para impresión
        const printWindow = window.open("", "_blank");
        if (!printWindow) {
            setError("No se pudo abrir la ventana de impresión");
            return;
        }

        // Generar contenido HTML para las etiquetas
        const printContent = `
            <html>
            <head>
                <title>Etiquetas Biblioteca</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                    }
                    .label-container {
                        display: grid;
                        grid-template-columns: repeat(4, 4.8cm); /* 4 columnas de 4.8 cm */
                        grid-auto-rows: 1.7cm; /* Altura de cada etiqueta */
                        gap: 0;
                        width: 21cm; /* Ancho de la hoja DIN A4 */
                        height: 29.7cm; /* Altura de la hoja DIN A4 */
                        padding: 0.6cm 0.8cm 0.3cm 0.8cm; /* Márgenes: superior, laterales e inferior */
                        box-sizing: border-box;
                    }
                    .label {
                        border: 1px solid #000;
                        padding: 0.2cm;
                        box-sizing: border-box;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        text-align: center;
                    }
                    .label img {
                        max-width: 100%;
                        max-height: 50%;
                    }
                    .label p {
                        margin: 0.1cm 0 0;
                        font-size: 8pt;
                    }
                </style>
            </head>
            <body>
                <div class="label-container">
                    ${selectedExemplars
                        .map((exemplar) => {
                            const canvas = createCanvas(300, 100);
                            JsBarcode(canvas, exemplar.registre, {
                                format: "CODE128",
                                width: 2,
                                height: 50,
                                displayValue: true,
                            });
                            const barcodeImg = canvas.toDataURL("image/png");

                            return `
                                <div class="label">
                                    <p>${userCentre?.nom || "No especificat"}</p>
                                    <img src="${barcodeImg}" alt="Código de barras">
                                    <p>Registre: ${exemplar.registre}</p>
                                </div>
                                <div class="label">
                                    <p>CDU: ${exemplar.CDU || "No especificat"}</p>
                                </div>
                            `;
                        })
                        .join("")}
                </div>
                <script>
                    window.onload = () => {
                        window.print();
                    };
                </script>
            </body>
            </html>
        `;

        // Escribir el contenido en la nueva ventana
        printWindow.document.open();
        printWindow.document.write(printContent);
        printWindow.document.close();
    };

    // Función para realizar la búsqueda
    const handleSearch = async (e) => {
        e.preventDefault();
        setIsSearching(true);
        setError(null);

        try {
            let endpoint = "/api/exemplars/search/";
            let params = {};

            // Titulo, Autor, Editorial
            if (textQuery.trim()) {
                params = { q: textQuery };
                // Rango de código
            } else if (rangeStart.trim() && rangeEnd.trim()) {
                params = { start: rangeStart, end: rangeEnd };
                // Código específico
            } else if (codeQuery.trim()) {
                params = { exact: codeQuery }; // Buscar por código específico exacto
            } else {
                setError("Si us plau, introdueix almenys un criteri de cerca");
                setIsSearching(false);
                return;
            }

            const response = await fetch(`${endpoint}?${new URLSearchParams(params)}`);
            if (!response.ok) {
                throw new Error(`Error en la consulta al servidor: ${response.status}`);
            }

            const data = await response.json();
            setSearchResults(data);
            setTotalPages(Math.ceil(data.length / itemsPerPage));
            setCurrentPage(1);
        } catch (error) {
            console.error("Error al buscar ejemplares:", error);
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
                                    <label htmlFor="text-search">Títol, autor o editorial:</label>
                                    <ExemplarSearch
                                        onSearchResults={() => {}} // No actualizar resultados
                                        onQueryChange={(query) => setTextQuery(query)} // Actualizar textQuery
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="range-start">Rang de codis:</label>
                                    <div className="range-inputs">
                                        <input
                                            type="text"
                                            id="range-start"
                                            value={rangeStart}
                                            onChange={(e) => setRangeStart(e.target.value)}
                                            placeholder="Codi inicial"
                                            maxLength={6}
                                        />
                                        <span className="range-separator">-</span>
                                        <input
                                            type="text"
                                            id="range-end"
                                            value={rangeEnd}
                                            onChange={(e) => setRangeEnd(e.target.value)}
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
                                    <th>Títol</th>
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
                                            <td>
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
                            <button onClick={handlePrintLabels} className="print-button">
                                Imprimir etiquetes
                            </button>{" "}
                            <button onClick={clearSelections} className="clear-button">
                                Esborrar selecció
                            </button>
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
