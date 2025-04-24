import "../styles/Aside.css";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function Aside({ onComponentChange }) {
    const { isLogged, user } = useContext(AuthContext);
  
    return (
      <aside className="aside-container">
          <div id="aside-default-content">
          {/* Botón Catàleg siempre visible */}
          <button onClick={() => onComponentChange('catalog')}>
            Catàleg
          </button>
  
          {/* Historial solo visible si está logueado */}
          {isLogged && !user?.isAdmin && !user?.isBibliotecari && (
            <button>Historial</button>
          )}
          </div>
  
          <div id="aside-admin-content">
          {/* Botones visibles solo si es admin O bibliotecari */}
          {isLogged && (!user?.isAdmin || !user?.isBibliotecari) && (
            <>
              <button onClick={() => onComponentChange('importCSV')}>
                Importar Usuaris
              </button>
              <button>Panell d'Administració</button>
            </>
          )}
          </div>
      </aside>
    );
  }

export default Aside;