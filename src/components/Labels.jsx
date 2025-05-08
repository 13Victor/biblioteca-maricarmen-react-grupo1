import { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import Pagination from "./Pagination";
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
    const handleTextQueryChange = (e) => {
        const query = e.target.value;
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

    // Función para generar las etiquetas en PDF
    const handlePrintLabels = () => {
        if (selectedExemplars.length === 0) {
            setError("No hay ejemplares seleccionados para imprimir");
            return;
        }

        // Crear un nuevo documento PDF
        const doc = new jsPDF({
            orientation: "portrait",
            unit: "cm",
            format: "a4",
        });

        // Dimensiones de la página
        const pageWidth = 21; // A4 width in cm
        const pageHeight = 29.7; // A4 height in cm

        // Márgenes (en cm)
        const marginLeft = 0.5;
        const marginTop = 0.5;

        // Calcular dimensiones efectivas
        const availableWidth = pageWidth - marginLeft * 2;
        const availableHeight = pageHeight - marginTop * 2;

        // Ajustar tamaño de etiqueta si es necesario para que quepan en la página
        const effectiveLabelWidth = availableWidth / LABEL_COLUMNS;
        const effectiveLabelHeight = availableHeight / LABEL_ROWS;

        let currentPage = 1;
        let currentRow = 0;
        let currentCol = 0;
        let labelIndex = 0;

        // Procesar cada ejemplar y generar sus dos etiquetas
        selectedExemplars.forEach((exemplar) => {
            // Por cada ejemplar, generamos dos pares de etiquetas (4 en total)
            // Dos etiquetas con código de barras y dos con información textual
            for (let pair = 0; pair < 2; pair++) {
                // Generar 2 pares idénticos
                // Primera etiqueta del par: código de barras
                // Si la página está llena, añadir una nueva
                if (currentRow >= LABEL_ROWS) {
                    doc.addPage();
                    currentPage++;
                    currentRow = 0;
                    currentCol = 0;
                }

                // Calcular la posición de la etiqueta actual
                const barcodeX = marginLeft + currentCol * effectiveLabelWidth;
                const barcodeY = marginTop + currentRow * effectiveLabelHeight;

                // Generar el código de barras
                const canvas = createCanvas(300, 100);
                JsBarcode(canvas, exemplar.registre, {
                    format: "CODE128",
                    width: 2,
                    height: 50,
                    displayValue: true,
                });

                // Convertir el canvas a imagen para insertar en el PDF
                const imgData = canvas.toDataURL("image/png");

                // Insertar el código de barras en el PDF
                doc.addImage(
                    imgData,
                    "PNG",
                    barcodeX + 0.5, // margen interno horizontal
                    barcodeY + 0.5, // margen interno vertical
                    effectiveLabelWidth - 1, // ancho de imagen (con margen interno)
                    effectiveLabelHeight - 1.5 // altura de imagen (con margen interno)
                );

                // Añadir texto descriptivo
                doc.setFontSize(10);
                doc.text(`Título: ${exemplar.titol}`, barcodeX + 0.5, barcodeY + effectiveLabelHeight - 0.7);

                // Dibujar el borde de la etiqueta
                doc.rect(barcodeX, barcodeY, effectiveLabelWidth, effectiveLabelHeight);

                // Avanzar a la siguiente posición
                currentCol++;
                if (currentCol >= LABEL_COLUMNS) {
                    currentCol = 0;
                    currentRow++;
                }
                labelIndex++;

                // Segunda etiqueta del par: información del registro
                // Si la página está llena, añadir una nueva
                if (currentRow >= LABEL_ROWS) {
                    doc.addPage();
                    currentPage++;
                    currentRow = 0;
                    currentCol = 0;
                }

                // Calcular la posición de la etiqueta actual
                const infoX = marginLeft + currentCol * effectiveLabelWidth;
                const infoY = marginTop + currentRow * effectiveLabelHeight;

                // Segunda etiqueta: información del registro
                doc.setFontSize(12);
                doc.text(`Registre: ${exemplar.registre}`, infoX + 0.5, infoY + 1);

                // Dibujar el borde de la etiqueta
                doc.rect(infoX, infoY, effectiveLabelWidth, effectiveLabelHeight);

                // Avanzar a la siguiente posición
                currentCol++;
                if (currentCol >= LABEL_COLUMNS) {
                    currentCol = 0;
                    currentRow++;
                }
                labelIndex++;
            }
        });

        // Guardar el PDF
        doc.save("etiquetas_biblioteca.pdf");
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
                                    <input
                                        type="text"
                                        id="text-search"
                                        value={textQuery}
                                        onChange={handleTextQueryChange}
                                        placeholder="Introdueix títol, autor o editorial..."
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
