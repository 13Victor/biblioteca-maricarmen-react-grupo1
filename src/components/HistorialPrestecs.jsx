import "../styles/HistorialPrestecs.css";
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function HistorialPrestecs() {
    const { usuari } = useContext(AuthContext);
    const [historial, setHistorial] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

  useEffect(() => {
    const fetchHistorial = async () => {
      if (!usuari?.id) return;
      
      const token = sessionStorage.getItem('token');
      console.log('Token present:', !!token); // Verificar si hay token
      
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:8000/api/usuari/historial_prestecs?usuari_id=${usuari.id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        // Log del status de la respuesta
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('API Error:', errorData); // Log detallado del error
          throw new Error('Error al obtenir l\'historial');
        }
        
        const data = await response.json();
        setHistorial(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchHistorial();
  }, [usuari]);

  if (loading) return <div>Carregant historial...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!usuari) return <div>Cal iniciar sessió per veure l'historial</div>;

  // Ordenar el historial: primero los pendientes, luego los devueltos
  const historialOrdenat = [...historial].sort((a, b) => {
    if (!a.data_devolucio && b.data_devolucio) return -1;
    if (a.data_devolucio && !b.data_devolucio) return 1;
    return 0;
  });

  // Calcular índices para la paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = historialOrdenat.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(historialOrdenat.length / itemsPerPage);

  // Función para cambiar de página
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div id="historial-prestecs-container">
      <h2>Historial de Préstecs</h2>
      <br></br>
      <table>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Tipus</th>
            <th>Data Préstec</th>
            <th>Data Retorn</th>
            <th>Estat</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((prestec) => (
            <tr key={prestec.prestec_id}>
              <td>{prestec.exemplar.cataleg.titol}</td>
              <td>{prestec.exemplar.cataleg.tipus}</td>
              <td>{new Date(prestec.data_prestec).toLocaleDateString()}</td>
              <td>{prestec.data_devolucio ? new Date(prestec.data_devolucio).toLocaleDateString() : '-'}</td>
              <td>
                <span className={`estat-pill ${prestec.data_devolucio ? 'retornat' : 'pendent'}`}>
                  {prestec.data_devolucio ? 'Retornat' : 'Pendent'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {historial.length === 0 ? (
        <p>No hi ha préstecs registrats</p>
      ) : (
        <div className="pagination">
          <button 
            className="pagination-arrow"
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            title="Primera página"
          >
            <i className="fa-solid fa-angles-left"></i>
          </button>
          
          <button 
            className="pagination-arrow"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            title="Página anterior"
          >
            <i className="fa-solid fa-angle-left"></i>
          </button>

          <div className="pagination-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
              <button
                key={number}
                onClick={() => handlePageChange(number)}
                className={`pagination-number ${currentPage === number ? 'active' : ''}`}
              >
                {number}
              </button>
            ))}
          </div>

          <button 
            className="pagination-arrow"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            title="Página siguiente"
          >
            <i className="fa-solid fa-angle-right"></i>
          </button>

          <button 
            className="pagination-arrow"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            title="Última página"
          >
            <i className="fa-solid fa-angles-right"></i>
          </button>
        </div>
      )}
    </div>
  );
}