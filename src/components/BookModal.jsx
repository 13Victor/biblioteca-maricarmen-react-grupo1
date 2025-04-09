import placeholderImg from '../assets/placeholder.png';
import "../styles/modal.css";

function BookModal({ book, onClose }) {
  if (!book) return null;


  console.log(book);
  // Format date safely
  const formatDate = (dateString) => {
    if (!dateString) return "No disponible";
    const date = new Date(dateString);
    return !isNaN(date.getTime()) ? date.toLocaleDateString() : "No disponible";
  };

  // Safe access to nested properties
  const getNestedValue = (obj, path, defaultValue = "No disponible") => {
    if (!obj) return defaultValue;
    const value = path.split('.').reduce((o, key) => (o && o[key] !== undefined ? o[key] : undefined), obj);
    return value !== undefined && value !== null ? value : defaultValue;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        
        <div className="modal-grid">
          <div className="modal-image">
            <img 
              src={book.thumbnail_url || placeholderImg} 
              alt={book.titol}
              onError={(e) => e.target.src = placeholderImg}
            />
          </div>
          
          <div className="modal-info">
            <h2>{book.titol}</h2>
            {book.titol_original && <p className="original-title">Título original: {book.titol_original}</p>}
            
            <div className="info-section">
              <h3>Información General</h3>
              <p><strong>Autor:</strong> {getNestedValue(book, 'autor')}</p>
              <p><strong>Editorial:</strong> {getNestedValue(book, 'editorial')}</p>
              {book.colleccio && <p><strong>Colección:</strong> {book.colleccio}</p>}
              <p><strong>ISBN:</strong> {getNestedValue(book, 'ISBN')}</p>
              <p><strong>Fecha de edición:</strong> {formatDate(book.data_edicio)}</p>
              <p><strong>Páginas:</strong> {getNestedValue(book, 'pagines')}</p>
              {book.mides && <p><strong>Dimensiones:</strong> {book.mides}</p>}
            </div>

            <div className="info-section">
              <h3>Ubicación y Clasificación</h3>
              <p><strong>CDU:</strong> {getNestedValue(book, 'CDU')}</p>
              <p><strong>Signatura:</strong> {getNestedValue(book, 'signatura')}</p>
              <p><strong>País:</strong> {getNestedValue(book, 'pais.nom')}</p>
              <p><strong>Lengua:</strong> {getNestedValue(book, 'llengua.nom')}</p>
              <p><strong>Lugar:</strong> {getNestedValue(book, 'lloc')}</p>
            </div>

            {book.resum && (
              <div className="info-section">
                <h3>Resumen</h3>
                <p>{book.resum}</p>
              </div>
            )}
            
            {book.anotacions && (
              <div className="info-section">
                <h3>Anotaciones</h3>
                <p>{book.anotacions}</p>
              </div>
            )}

            <div className="tags-section">
              {book.tags && book.tags.length > 0 && book.tags.map(tag => (
                <span key={tag.id} className="tag">{tag.nom}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookModal;