import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import placeholderImg from "../assets/placeholder.png";
import ItemPrestecTable from "./ItemPrestecTable";
import { getExemplarsByItem } from "../services/api";
import "../styles/modal.css";

function BookModal({ book, onClose }) {
  const { isBilbiotecari } = useContext(AuthContext);
  const {isAdministrador} = useContext(AuthContext);
  const [exemplarsByCentre, setExemplarsByCentre] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Cargar los ejemplares por centro si tenemos un libro
    if (book && book.id) {
      setLoading(true);
      getExemplarsByItem(book.id)
        .then((data) => {
          // Agrupar ejemplares por centro y estado
          const centreMap = {};

          // Procesar los ejemplares
          data.forEach((exemplar) => {
            if (!exemplar.centre) return;

            const centreId = exemplar.centre.id;
            const centreName = exemplar.centre.nom;

            if (!centreMap[centreId]) {
              centreMap[centreId] = {
                nom: centreName,
                disponible: 0,
                exclos_prestec: 0,
                baixa: 0,
              };
            }

            // Contar según estado
            if (exemplar.baixa) {
              centreMap[centreId].baixa++;
            } else if (exemplar.exclos_prestec) {
              centreMap[centreId].exclos_prestec++;
            } else {
              centreMap[centreId].disponible++;
            }
          });

          setExemplarsByCentre(centreMap);
        })
        .catch((error) => {
          console.error("Error al cargar ejemplares por centro:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [book]);

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

  // Renderizar la disponibilidad por centro
  const renderCentresAvailability = () => {
    if (!exemplarsByCentre) return null;

    // Filtrar solo centros con ejemplares disponibles
    const centresWithAvailable = Object.values(exemplarsByCentre)
      .filter((centre) => centre.disponible > 0)
      .sort((a, b) => a.nom.localeCompare(b.nom));

    if (centresWithAvailable.length === 0) return null;

    return (
      <p className="centres-availability">
        {centresWithAvailable.map((centre, index) => (
          <span key={index} className=" item-type-badge centre-availability">
            {centre.nom}: {centre.disponible}
            {index < centresWithAvailable.length - 1 ? "    " : ""}
          </span>
        ))}
      </p>
    );
  };

  // Determinar qué información específica mostrar según el tipo
  const renderTypeSpecificInfo = () => {
    switch (book.tipus) {
      case "llibre":
        return (
          <>
            <InfoField label="Editorial" value={book.editorial} />
            <InfoField label="Colecció" value={book.colleccio} />
            <InfoField label="ISBN" value={book.ISBN} />
            <InfoField label="Pàgines" value={book.pagines} />
          </>
        );
      case "revista":
        return (
          <>
            <InfoField label="Editorial" value={book.editorial} />
            <InfoField label="ISSN" value={book.ISSN} />
            <InfoField label="Pàgines" value={book.pagines} />
          </>
        );
      case "cd":
        return (
          <>
            <InfoField label="Discogràfica" value={book.discografica} />
            <InfoField label="Estil" value={book.estil} />
            <InfoField label="Duració" value={book.duracio} />
          </>
        );
      case "dvd":
      case "br":
        return (
          <>
            <InfoField label="Productora" value={book.productora} />
            <InfoField label="Durada" value={book.duracio} />
          </>
        );
      case "dispositiu":
        return (
          <>
            <InfoField label="Marca" value={book.marca} />
            <InfoField label="Model" value={book.model} />
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
          <i className="fa-solid fa-xmark"></i>
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
            {book.titol_original && <p className="original-title">Títol original: {book.titol_original}</p>}

            {/* Sección de disponibilidad de ejemplares */}
            {hasExemplarCounts && (
              <div className="info-section exemplar-availability">
                <h3>Exemplars disponibles</h3>
                <div className="ejemplares-estado">
                  <ul>
                    {book.exemplar_counts.disponible > 0 && (
                      <li>
                        <span className="badge item-status available">Disponible</span>
                        <span className="count">{book.exemplar_counts.disponible} exemplars</span>
                      </li>
                    )}
                    {book.exemplar_counts.exclos_prestec > 0 && (
                      <li>
                        <span className="badge item-status excluded">No disponible par préstec</span>
                        <span className="count">{book.exemplar_counts.exclos_prestec} exemplars</span>
                      </li>
                    )}
                    {(book.exemplar_counts.baixa > 0 && (isBilbiotecari === true || isAdministrador === true)) && (
                      <li>
                        <span className="badge item-status baixa">De baixa</span>
                        <span className="count">{book.exemplar_counts.baixa} exemplars</span>
                      </li>
                    )}
                  </ul>
                  <p className="total-exemplares">
                    Total:{" "}
                    {book.exemplar_counts.disponible + book.exemplar_counts.exclos_prestec + book.exemplar_counts.baixa}{" "}
                    exemplars
                  </p>

                  {/* Nueva sección para mostrar disponibilidad por centro */}
                  {loading ? <p>Cargando disponibilidad por centros...</p> : renderCentresAvailability()}
                </div>
              </div>
            )}

            <div className="info-section">
              <h3>Informació General</h3>
              <InfoField label="Autor" value={book.autor} />

              {/* Renderizar campos específicos según el tipo */}
              {renderTypeSpecificInfo()}

              <InfoField label="Data d'edició" value={formatDate(book.data_edicio)} />
              <InfoField label="Dimensions" value={book.mides} />
            </div>

            <div className="info-section">
              <h3>Ubicació i Classificació</h3>
              <InfoField label="CDU" value={book.CDU} />
              <InfoField label="Signatura" value={book.signatura} />
              <InfoField label="País" value={getNestedValue(book, "pais.nom")} />
              <InfoField label="Llengua" value={getNestedValue(book, "llengua.nom")} />
              <InfoField label="Lloc" value={book.lloc} />
            </div>

            {book.resum && (
              <div className="info-section">
                <h3>Resum</h3>
                <p>{book.resum}</p>
              </div>
            )}

            {book.anotacions && (
              <div className="info-section">
                <h3>Anotacions</h3>
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

            {isBilbiotecari && (
              <div className="info-section exemplars-center">
                <ItemPrestecTable bookId={book.id} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookModal;
