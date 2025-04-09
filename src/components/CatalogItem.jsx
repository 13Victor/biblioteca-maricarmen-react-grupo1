import { useState } from 'react';
import BookModal from './BookModal';

function CatalogItem({ item }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="catalog-item" onClick={() => setShowModal(true)}>
        <i className="fa-solid fa-arrow-up arrow"></i>
        <p className="item-title">{item.titol}</p>
        {item.autor && <p className="informative-text item-author">{item.autor}</p>}
        <div className="badgeContainer">
          <span className="badge item-type-badge">{item.tipus}</span>
          {item.exclos_prestec ? (
            <span className="badge item-status excluded">No disponible para préstamo</span>
          ) : item.baixa ? (
            <span className="badge item-status baixa">De baja</span>
          ) : (
            <span className="badge item-status available">Disponible</span>
          )}
        </div>
      </div>

      {showModal && (
        <BookModal 
          book={item} 
          onClose={() => setShowModal(false)} 
        />
      )}
    </>
  );
}

export default CatalogItem;
