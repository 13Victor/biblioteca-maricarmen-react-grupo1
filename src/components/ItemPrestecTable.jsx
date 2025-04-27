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
  const { isBilbiotecari } = useContext(AuthContext);

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
        setError("Error al cargar los ejemplares");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (bookId) {
      fetchExemplars();
    }
  }, [bookId, itemsPerPage]);

  if (loading) return <p>Cargando ejemplares...</p>;
  if (error) return <p className="error-message">{error}</p>;
  if (exemplars.length === 0) return <p>No hay ejemplares disponibles para este ítem.</p>;

  const getStatusClass = (exemplar) => {
    if (exemplar.baixa) return "estat-pill baixa";
    if (exemplar.exclos_prestec) return "estat-pill pendent";
    return "estat-pill retornat";
  };

  const getStatusText = (exemplar) => {
    if (exemplar.baixa) return "De baja";
    if (exemplar.exclos_prestec) return "Excluido de préstamo";
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

  return (
    <div id="historial-prestecs-container">
      <h3>Ejemplares disponibles ({exemplars.length})</h3>
      <table>
        <thead>
          <tr>
            <th>Registro</th>
            <th>Centro</th>
            <th>Estado</th>
            {isBilbiotecari && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {currentExemplars.map((exemplar) => (
            <tr key={exemplar.id}>
              <td>{exemplar.registre || "Sin registro"}</td>
              <td>{exemplar.centre?.nom || "Sin centro"}</td>
              <td>
                <span className={getStatusClass(exemplar)}>{getStatusText(exemplar)}</span>
              </td>
              {isBilbiotecari && (
                <td>
                  {!exemplar.baixa && !exemplar.exclos_prestec && (
                    <Link
                      to={`/crear-prestamo/${exemplar.id}`}
                      className="button_prestec"
                      onClick={(e) => {
                        // Add a click event to debug
                        console.log(`Navigating to /crear-prestamo/${exemplar.id}`);
                      }}
                    >
                      Hacer préstamo
                    </Link>
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
