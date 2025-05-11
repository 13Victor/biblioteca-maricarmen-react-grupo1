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

  // Get the usuari object directly
  const { usuari } = useContext(AuthContext);

  // Derive roles directly from user properties
  const isStaff = usuari?.is_staff === true;
  const isSuperuser = usuari?.is_superuser === true;
  const userCentre = usuari?.centre;

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Show 10 exemplars per page
  const [totalPages, setTotalPages] = useState(0);
  console.log("ItemPrestecTable - User Role Check:", {
    usuari: usuari
      ? {
          username: usuari.username,
          is_staff: usuari.is_staff,
          is_superuser: usuari.is_superuser,
          centre: usuari.centre,
        }
      : null,
    isStaff,
    isSuperuser,
  });
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

  // Add a function to check if the exemplar can be loaned by this user

  const canLoanExemplar = (exemplar) => {
    // Must be available (not excluded from loans and not retired)
    const isAvailable = !exemplar.baixa && !exemplar.exclos_prestec;

    // Extract center information
    const userCentreInfo = getCentreInfo(usuari?.centre);
    const exemplarCentreInfo = getCentreInfo(exemplar.centre);

    // Debug information
    console.log("User Centre Info:", userCentreInfo);
    console.log("Exemplar Centre Info:", exemplarCentreInfo);

    // Compare centers - try matching by ID first, then by name
    let isFromSameCentre = false;

    if (userCentreInfo && exemplarCentreInfo) {
      // Try to match by ID first
      if (userCentreInfo.id && exemplarCentreInfo.id) {
        isFromSameCentre = String(userCentreInfo.id) === String(exemplarCentreInfo.id);
      }

      // If we can't match by ID or the match is false, try matching by name
      if (!isFromSameCentre && userCentreInfo.nom && exemplarCentreInfo.nom) {
        isFromSameCentre = areSimilarCentreNames(userCentreInfo.nom, exemplarCentreInfo.nom);
      }
    }

    console.log(`Exemplar ${exemplar.id} check:`, {
      isAvailable,
      userCentreInfo,
      exemplarCentreInfo,
      isFromSameCentre,
    });

    return isAvailable && isFromSameCentre;
  };

  const areSimilarCentreNames = (name1, name2) => {
    if (!name1 || !name2) return false;

    // Normalize both names: lowercase, remove common prefixes, and trim
    const normalize = (str) => {
      let result = str.toLowerCase().trim();
      // Remove common prefixes like "IES", "CEIP", etc.
      return result.replace(/^(ies|ceip|centre|escola|institut)\s+/i, "");
    };

    const normalized1 = normalize(name1);
    const normalized2 = normalize(name2);

    // First try exact match after normalization
    if (normalized1 === normalized2) return true;

    // Then try containment (one is part of the other)
    return normalized1.includes(normalized2) || normalized2.includes(normalized1);
  };

  const getCentreInfo = (centre) => {
    // If it's just a string (name), return an object with the name
    if (typeof centre === "string") {
      return { nom: centre };
    }

    // If it's already an object with id and/or nom, return it
    if (centre && typeof centre === "object") {
      return centre;
    }

    // If it's a number (just the ID), return an object with the ID
    if (typeof centre === "number") {
      return { id: centre };
    }

    return null;
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
            {isStaff && <th>Accions</th>}
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
              {isStaff && (
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
