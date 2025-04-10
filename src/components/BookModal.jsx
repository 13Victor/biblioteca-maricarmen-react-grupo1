import placeholderImg from "../assets/placeholder.png";
import "../styles/modal.css";

function BookModal({ book, onClose }) {
  if (!book) return null;

  // Format date safely
  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return !isNaN(date.getTime()) ? date.toLocaleDateString() : null;
  };

  // Safe access to nested properties with null instead of default value
  const getNestedValue = (obj, path) => {
    if (!obj) return null;
    const value = path.split(".").reduce((o, key) => (o && o[key] !== undefined ? o[key] : undefined), obj);
    return value !== undefined && value !== null ? value : null;
  };

  // Crear un componente de presentación para los campos condicionales
  const InfoField = ({ label, value }) => {
    if (value === null || value === undefined || value === "") return null;
    return (
      <p>
        <strong>{label}:</strong> {value}
      </p>
    );
  };

  // Verificar si tenemos datos de conteo de ejemplares
  const hasExemplarCounts =
    book.exemplar_counts &&
    (book.exemplar_counts.disponible > 0 || book.exemplar_counts.exclos_prestec > 0 || book.exemplar_counts.baixa > 0);

  // Determinar qué información específica mostrar según el tipo
  const renderTypeSpecificInfo = () => {
    switch (book.tipus) {
      case "llibre":
        return (
          <>
            <InfoField label="Editorial" value={book.editorial} />
            <InfoField label="Colección" value={book.colleccio} />
            <InfoField label="ISBN" value={book.ISBN} />
            <InfoField label="Páginas" value={book.pagines} />
          </>
        );
      case "revista":
        return (
          <>
            <InfoField label="Editorial" value={book.editorial} />
            <InfoField label="ISSN" value={book.ISSN} />
            <InfoField label="Páginas" value={book.pagines} />
          </>
        );
      case "cd":
        return (
          <>
            <InfoField label="Discográfica" value={book.discografica} />
            <InfoField label="Estilo" value={book.estil} />
            <InfoField label="Duración" value={book.duracio} />
          </>
        );
      case "dvd":
      case "br":
        return (
          <>
            <InfoField label="Productora" value={book.productora} />
            <InfoField label="Duración" value={book.duracio} />
          </>
        );
      case "dispositiu":
        return (
          <>
            <InfoField label="Marca" value={book.marca} />
            <InfoField label="Modelo" value={book.model} />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>

        <div className="modal-grid">
          <div className="modal-image">
            <img
              src={book.thumbnail_url || placeholderImg}
              alt={book.titol}
              onError={(e) => (e.target.src = placeholderImg)}
            />
          </div>

          <div className="modal-info">
            <h2>{book.titol}</h2>
            {book.titol_original && <p className="original-title">Título original: {book.titol_original}</p>}

            {/* Sección de disponibilidad de ejemplares */}
            {hasExemplarCounts && (
              <div className="info-section exemplar-availability">
                <h3>Ejemplares disponibles</h3>
                <div className="ejemplares-estado">
                  <ul>
                    {book.exemplar_counts.disponible > 0 && (
                      <li>
                        <span className="badge item-status available">Disponible</span>
                        <span className="count">{book.exemplar_counts.disponible} ejemplares</span>
                      </li>
                    )}
                    {book.exemplar_counts.exclos_prestec > 0 && (
                      <li>
                        <span className="badge item-status excluded">No disponible para préstamo</span>
                        <span className="count">{book.exemplar_counts.exclos_prestec} ejemplares</span>
                      </li>
                    )}
                    {book.exemplar_counts.baixa > 0 && (
                      <li>
                        <span className="badge item-status baixa">De baja</span>
                        <span className="count">{book.exemplar_counts.baixa} ejemplares</span>
                      </li>
                    )}
                  </ul>
                  <p className="total-exemplares">
                    Total:{" "}
                    {book.exemplar_counts.disponible + book.exemplar_counts.exclos_prestec + book.exemplar_counts.baixa}{" "}
                    ejemplares
                  </p>
                </div>
              </div>
            )}

            <div className="info-section">
              <h3>Información General</h3>
              <InfoField label="Autor" value={book.autor} />

              {/* Renderizar campos específicos según el tipo */}
              {renderTypeSpecificInfo()}

              <InfoField label="Fecha de edición" value={formatDate(book.data_edicio)} />
              <InfoField label="Dimensiones" value={book.mides} />
            </div>

            <div className="info-section">
              <h3>Ubicación y Clasificación</h3>
              <InfoField label="CDU" value={book.CDU} />
              <InfoField label="Signatura" value={book.signatura} />
              <InfoField label="País" value={getNestedValue(book, "pais.nom")} />
              <InfoField label="Lengua" value={getNestedValue(book, "llengua.nom")} />
              <InfoField label="Lugar" value={book.lloc} />
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

            {book.tags && book.tags.length > 0 && (
              <div className="tags-section">
                {book.tags.map((tag) => (
                  <span key={tag.id} className="tag">
                    {tag.nom}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookModal;
