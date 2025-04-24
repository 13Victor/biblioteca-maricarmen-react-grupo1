import "../styles/Aside.css";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function Aside({ onComponentChange }) {
    const { isLogged, usuari } = useContext(AuthContext);
    console.log("usuari: ",usuari);
  
    return (
      <aside className="aside-container">
          <div id="aside-default-content">
          {/* Botón Catàleg siempre visible */}
          <button onClick={() => onComponentChange('catalog')}>
            Catàleg
          </button>
  
          {/* Historial solo visible si está logueado */}
          {isLogged && !usuari?.is_admin && !usuari?.is_staff && (
            <button>Historial</button>
          )}
          </div>
  
          <div id="aside-admin-content">
          {/* Botones visibles solo si es admin O bibliotecari */}
          {isLogged && (usuari?.is_admin || usuari?.is_staff) && (
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