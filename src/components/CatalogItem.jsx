import { useState } from "react";
import BookModal from "./BookModal";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

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
        {item.tipus === "dispositiu"
          ? item.marca && <p className="informative-text item-author">{item.marca}</p>
          : item.autor && <p className="informative-text item-author">{item.autor}</p>}
        <div className="badgeContainer">
          <span className="badge item-type-badge">{item.tipus}</span>

          {/* Mostrar contadores de ejemplares por estado con tooltips */}
          {hasExemplarCounts ? (
            <div className="exemplar-status-container">
              {item.exemplar_counts.disponible > 0 && (
                <Tippy content="Disponible" placement="top">
                  <span className="badge item-status available">{item.exemplar_counts.disponible}</span>
                </Tippy>
              )}
              {item.exemplar_counts.exclos_prestec > 0 && (
                <Tippy content="Excluido de préstamo" placement="top">
                  <span className="badge item-status excluded">{item.exemplar_counts.exclos_prestec}</span>
                </Tippy>
              )}
              {item.exemplar_counts.baixa > 0 && (
                <Tippy content="De baja" placement="top">
                  <span className="badge item-status baixa">{item.exemplar_counts.baixa}</span>
                </Tippy>
              )}
            </div>
          ) : (
            // Fallback a la visualización anterior si no hay datos de conteo
            <>
              {item.exclos_prestec ? (
                <span className="badge item-status excluded">No disponible par préstec</span>
              ) : item.baixa ? (
                <span className="badge item-status baixa">De baixa</span>
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
