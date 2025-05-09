import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import PerfilUsuari from "./PerfilUsuari";
import Login from "./Login";
import "../styles/Header.css";

export default function Header() {
    const {
        isLogged,
        isBilbiotecari,
        isAdministrador,
        mostrarPerfil,
        setMostrarPerfil,
        mostrarLogin,
        setMostrarLogin,
        usuari,
    } = useContext(AuthContext);

    const togglePerfil = () => {
        setMostrarPerfil((prev) => !prev);
    };

    const toggleLogin = () => {
        setMostrarLogin((prev) => !prev);
    };

  return (
    <>
      <div id="header-container">
        <h1>Biblioteca Maricarmen Brito</h1>
        <div id="header-buttons">
          {!isLogged ? (
            <button id="login-button" onClick={toggleLogin}>
              Login
            </button>
          ) : (
            <button id="profile-button" onClick={togglePerfil}>
              {isAdministrador 
                ? `Administrador/a ${usuari?.first_name || ''}` 
                : isBilbiotecari 
                  ? `Bibliotecari/a ${usuari?.first_name || ''}` 
                  : `Usuari/a ${usuari?.first_name || ''}`}
            </button>
          )}
        </div>
      </div>

            {mostrarPerfil && <PerfilUsuari />}
            {mostrarLogin && !isLogged && <Login />}
        </>
    );
}
