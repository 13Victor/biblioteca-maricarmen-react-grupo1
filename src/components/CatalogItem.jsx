import { useState } from "react";
import BookModal from "./BookModal";

function CatalogItem({ item }) {
  const [showModal, setShowModal] = useState(false);

  // Verificar si tenemos datos de conteo de ejemplares
  const hasExemplarCounts =
    item.exemplar_counts &&
    (item.exemplar_counts.disponible > 0 || item.exemplar_counts.exclos_prestec > 0 || item.exemplar_counts.baixa > 0);
  return (
    <>
      <div className="catalog-item" onClick={() => setShowModal(true)}>
        <i className="fa-solid fa-arrow-up arrow"></i>
        <p className="item-title">{item.titol}</p>
        {item.autor && <p className="informative-text item-author">{item.autor}</p>}
        <div className="badgeContainer">
          <span className="badge item-type-badge">{item.tipus === "llibre" ? "Libro" : ""}</span>

          {/* Mostrar contadores de ejemplares por estado */}
          {hasExemplarCounts ? (
            <div className="exemplar-status-container">
              {item.exemplar_counts.disponible > 0 && (
                <span className="badge item-status available">{item.exemplar_counts.disponible}</span>
              )}
              {item.exemplar_counts.exclos_prestec > 0 && (
                <span className="badge item-status excluded">{item.exemplar_counts.exclos_prestec}</span>
              )}
              {item.exemplar_counts.baixa > 0 && (
                <span className="badge item-status baixa">{item.exemplar_counts.baixa}</span>
              )}
            </div>
          ) : (
            // Fallback a la visualización anterior si no hay datos de conteo
            <>
              {item.exclos_prestec ? (
                <span className="badge item-status excluded">No disponible para préstamo</span>
              ) : item.baixa ? (
                <span className="badge item-status baixa">De baja</span>
              ) : (
                <span className="badge item-status available">Disponible</span>
              )}
            </>
          )}
        </div>
      </div>

      {showModal && <BookModal book={item} onClose={() => setShowModal(false)} />}
    </>
  );
}

export default CatalogItem;
