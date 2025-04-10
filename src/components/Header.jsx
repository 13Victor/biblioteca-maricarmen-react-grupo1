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
        <h1>Biblioteca Maricarmen</h1>
        <div id="header-buttons">
          {isBilbiotecari && <button onClick={() => window.location.href = "https://biblioteca1.ieti.site/admin"}>Admin Panel</button>}
          {!isLogged ? (
            <button id="login-button" onClick={toggleLogin}>
              Login
            </button>
          ) : (
            <button id="profile-button" onClick={togglePerfil}>
              {isAdministrador ? "Perfil Administrador" : isBilbiotecari ? "Perfil Bibliotecario" : "Perfil Usuario"}
              </button>
          )}
        </div>
      </div>

      {mostrarPerfil && <PerfilUsuari />}
      {mostrarLogin && !isLogged && <Login />}
    </>
  );
}
