import { useState, useEffect, useContext } from "react";
import { getExemplarsByItem } from "../services/api";
import Pagination from "./Pagination";
import "../styles/Table.css";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

function ItemPrestecTable({ bookId }) {
  const [exemplars, setExemplars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Properly access the isBibliotecari from context
  const { isBilbiotecari, userCentre } = useContext(AuthContext);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Show 10 exemplars per page
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchExemplars = async () => {
      try {
        setLoading(true);
        const data = await getExemplarsByItem(bookId);
        setExemplars(data);
        setTotalPages(Math.ceil(data.length / itemsPerPage));
        setError(null);
      } catch (err) {
        setError("Error al carregar els exemplars");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (bookId) {
      fetchExemplars();
    }
  }, [bookId, itemsPerPage]);

  if (loading) return <p>Carregant exemplars...</p>;
  if (error) return <p className="error-message">{error}</p>;
  if (exemplars.length === 0) return <p>No hi ha exemplars disponibles per a aquest ítem.</p>;

  const getStatusClass = (exemplar) => {
    if (exemplar.baixa) return "estat-pill baixa";
    if (exemplar.exclos_prestec) return "estat-pill pendent";
    return "estat-pill retornat";
  };

  const getStatusText = (exemplar) => {
    if (exemplar.baixa) return "De baixa";
    if (exemplar.exclos_prestec) return "Exclòs de préstec";
    return "Disponible";
  };

  // Get current items for page
  const getCurrentItems = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return exemplars.slice(indexOfFirstItem, indexOfLastItem);
  };

  // Pagination handlers
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

  const currentExemplars = getCurrentItems();

  // Add a console log to check the value of isBilbiotecari
  console.log("ItemPrestecTable - isBilbiotecari:", isBilbiotecari);

  // Add a function to check if the exemplar can be loaned by this user
  const canLoanExemplar = (exemplar) => {
    // Must be available (not excluded from loans and not retired)
    const isAvailable = !exemplar.baixa && !exemplar.exclos_prestec;

    // Must be from the same center as the librarian
    const isFromSameCentre = userCentre && exemplar.centre && userCentre.id === exemplar.centre.id;

    console.log(`Exemplar ${exemplar.id} check - Available: ${isAvailable}, Same Centre: ${isFromSameCentre}`);
    console.log(`User Centre:`, userCentre);
    console.log(`Exemplar Centre:`, exemplar.centre);

    return isAvailable && isFromSameCentre;
  };

  return (
    <div id="exemplars-disponibles-container">
      <h3>Exemplars disponibles ({exemplars.length})</h3>
      <table>
        <thead>
          <tr>
            <th>Registre</th>
            <th>Centre</th>
            <th>Estat</th>
            {isBilbiotecari && <th>Accions</th>}
          </tr>
        </thead>
        <tbody>
          {currentExemplars.map((exemplar) => (
            <tr key={exemplar.id}>
              <td>{exemplar.registre || "Sense registre"}</td>
              <td>{exemplar.centre?.nom || "Sense centre"}</td>
              <td>
                <span className={getStatusClass(exemplar)}>{getStatusText(exemplar)}</span>
              </td>
              {isBilbiotecari && (
                <td>
                  {canLoanExemplar(exemplar) ? (
                    <Link to={`/crear-prestamo/${exemplar.id}`} className="button_prestec">
                      Fer préstec
                    </Link>
                  ) : (
                    <span className="disabled-action">
                      {!exemplar.baixa && !exemplar.exclos_prestec ? "Altre centre" : "No disponible"}
                    </span>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

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
  );
}

export default ItemPrestecTable;
