import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getExemplarById, getAvailableUsers, createLoan } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import Pagination from "./Pagination";
import "../styles/LoanCreationForm.css";

function LoanCreationForm() {
  const { exemplarId } = useParams();
  const navigate = useNavigate();
  const { isBilbiotecari, isLogged } = useContext(AuthContext);

  const [exemplar, setExemplar] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(4);
  const [totalPages, setTotalPages] = useState(0);

  // Debug access state
  console.log("LoanCreationForm - Auth state:", { isLogged, isBilbiotecari, exemplarId });

  // Add this useEffect to check if userData is being stored in sessionStorage
  useEffect(() => {
    const userData = sessionStorage.getItem("userData");
    console.log("LoanCreationForm - userData from sessionStorage:", userData ? JSON.parse(userData) : null);

    // If userData isn't in sessionStorage, try to get it from the context and store it
    if (!userData && usuari) {
      console.log("Storing userData from context", usuari);
      sessionStorage.setItem("userData", JSON.stringify(usuari));
    }
  }, []);

  // Calculate total pages when filtered users change
  useEffect(() => {
    setTotalPages(Math.ceil(filteredUsers.length / itemsPerPage));
    // Reset to first page when new search results arrive
    setCurrentPage(1);
  }, [filteredUsers, itemsPerPage]);

  // Load exemplar data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("Fetching data with:", { exemplarId, isLogged, isBilbiotecari });

        if (!exemplarId) {
          throw new Error("ID de ejemplar no proporcionado");
        }

        // This part is crucial - get the token directly
        const token = sessionStorage.getItem("token");
        console.log("Token available:", !!token);

        if (!token) {
          throw new Error("No hay token de autenticación. Debes iniciar sesión.");
        }

        // Get exemplar details - handle API errors more carefully
        try {
          console.log("Fetching exemplar with ID:", exemplarId);
          const exemplarData = await getExemplarById(exemplarId);
          console.log("Exemplar data received:", exemplarData);

          if (!exemplarData) {
            throw new Error("Ejemplar no encontrado");
          }

          // Check if exemplar is available for loan
          if (exemplarData.baixa || exemplarData.exclos_prestec) {
            throw new Error("Este ejemplar no está disponible para préstamo");
          }

          setExemplar(exemplarData);
        } catch (err) {
          console.error("Error fetching exemplar:", err);
          throw new Error(`Error al obtener el ejemplar: ${err.message}`);
        }

        // Load all users initially - don't filter by center
        try {
          console.log("Fetching all available users");
          const usersData = await getAvailableUsers();
          console.log("Users data received:", usersData);
          setUsers(usersData);
        } catch (err) {
          console.error("Error fetching users:", err);
          throw new Error(`Error al obtener usuarios: ${err.message}`);
        }
      } catch (err) {
        setError(err.message || "Error al cargar datos");
        console.error("Final error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [exemplarId, isLogged, isBilbiotecari]);

  // Handle user search
  const handleSearch = () => {
    setIsSearching(true);

    // Search only if there's a search term
    if (searchTerm.trim() === "") {
      setFilteredUsers([]);
      setHasSearched(true);
      setIsSearching(false);
      return;
    }

    // Filter users regardless of center
    const filtered = users.filter(
      (user) =>
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredUsers(filtered);
    setHasSearched(true);
    setIsSearching(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Creating loan with:", {
      usuari_id: selectedUser,
      exemplar_id: exemplarId,
    });

    if (!selectedUser) {
      setError("Debes seleccionar un usuario");
      return;
    }

    try {
      setSubmitting(true);
      await createLoan({
        usuari_id: selectedUser,
        exemplar_id: exemplarId,
        anotacions: "",
      });

      setSuccess(true);
      setTimeout(() => {
        navigate(-1); // Go back after successful creation
      }, 2000);
    } catch (err) {
      setError(err.message || "Error al crear el préstamo");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Get current users for the page
  const getCurrentUsers = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
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

  if (loading) return <div className="loan-form-container loading fullscreen">Cargando datos...</div>;
  if (error) return <div className="loan-form-container error fullscreen">{error}</div>;
  if (success) return <div className="loan-form-container success fullscreen">¡Préstamo creado correctamente!</div>;

  const currentUsers = getCurrentUsers();

  return (
    <div className="loan-form-container fullscreen">
      <div className="loan-form-content">
        <h2>Crear Préstamo</h2>

        <div className="exemplar-info">
          <h3>Información del ejemplar</h3>
          <p>
            <strong>Título:</strong> {exemplar?.cataleg?.titol}
          </p>
          <p>
            <strong>Autor:</strong> {exemplar?.cataleg?.autor || "No especificado"}
          </p>
          <p>
            <strong>Registro:</strong> {exemplar?.registre || "Sin registro"}
          </p>
        </div>

        <div className="search-section">
          <form onSubmit={handleSearchSubmit} className="search-form">
            <div className="search-input-container">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar usuario por nombre, email o username..."
                className="search-input"
              />
            </div>
            <button type="submit" className="search-button" disabled={isSearching || searchTerm.trim() === ""}>
              {isSearching ? "Buscando..." : "Buscar"}
            </button>
          </form>
        </div>

        {hasSearched && (
          <div className="search-results-container">
            <h3>Resultados de la búsqueda ({filteredUsers.length})</h3>

            {filteredUsers.length > 0 ? (
              <div className="results-with-pagination">
                <div className="user-results-grid catalog-grid">
                  {currentUsers.map((user) => (
                    <div
                      key={user.id}
                      className={`user-card catalog-item ${selectedUser === user.id ? "selected" : ""}`}
                      onClick={() => setSelectedUser(user.id)}
                    >
                      <p className="item-title">{`${user.first_name} ${user.last_name}`}</p>
                      <p className="informative-text item-author">{user.username}</p>
                      <div className="badgeContainer">
                        <span className="badge item-type-badge">{user.email}</span>
                        {user.centre && (
                          <span className="badge item-status available">
                            {typeof user.centre === "object" ? user.centre.nom : user.centre}
                          </span>
                        )}
                      </div>
                      {selectedUser === user.id && (
                        <div className="selection-indicator">
                          <i className="fas fa-check"></i>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

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
            ) : (
              <div className="no-results">
                <p>No se encontraron usuarios con ese criterio de búsqueda.</p>
              </div>
            )}
          </div>
        )}

        <div className="form-actions">
          <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary" disabled={submitting}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={submitting || !selectedUser}
            onClick={handleSubmit}
          >
            {submitting ? "Creando préstamo..." : "Crear préstamo"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoanCreationForm;
