import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getExemplarById, getAvailableUsers, createLoan } from "../services/api";
import { AuthContext } from "../context/AuthContext";
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
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

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

  // Load exemplar and users data
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
        
        // Get available users - handle API errors more carefully
        try {
          console.log("Fetching available users");
          const usersData = await getAvailableUsers();
          console.log("Users data received:", usersData);
          setUsers(usersData);
          setFilteredUsers(usersData);
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

  // Filter users based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        (user.username?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.first_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.last_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.email?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log("Creating loan with:", {
      usuari_id: selectedUser,
      exemplar_id: exemplarId,
      anotacions: notes
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
        anotacions: notes || ""
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

  if (loading) return <div className="loan-form-container loading">Cargando datos...</div>;
  if (error) return <div className="loan-form-container error">{error}</div>;
  if (success) return <div className="loan-form-container success">¡Préstamo creado correctamente!</div>;

  return (
    <div className="loan-form-container">
      <h2>Crear Préstamo</h2>
      
      <div className="exemplar-info">
        <h3>Información del ejemplar</h3>
        <p><strong>Título:</strong> {exemplar?.cataleg?.titol}</p>
        <p><strong>Autor:</strong> {exemplar?.cataleg?.autor || "No especificado"}</p>
        <p><strong>Registro:</strong> {exemplar?.registre || "Sin registro"}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="user-search">Buscar usuario:</label>
          <input
            id="user-search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, email o usuario..."
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="user-select">Seleccionar usuario:</label>
          <select
            id="user-select"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="form-control"
            required
          >
            <option value="">-- Seleccionar usuario --</option>
            {filteredUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.first_name} {user.last_name} ({user.username}) - {user.centre || "Sin centro"}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="notes">Anotaciones (opcional):</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="form-control"
            rows="3"
          />
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate(-1)}
            className="btn btn-secondary"
            disabled={submitting}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? "Creando préstamo..." : "Crear préstamo"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default LoanCreationForm;
