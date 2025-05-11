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

  // Add this inside your Header component
  console.log("Header render state:", {
    isLogged,
    isBilbiotecari,
    isAdministrador,
    usuari,
    mostrarPerfil,
  });

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
                ? "Perfil Administrador"
                : isBilbiotecari
                ? "Perfil Bibliotecari"
                : usuari && usuari.username
                ? `Perfil ${usuari.username}`
                : isLogged
                ? "Carregant perfil..." // Show loading state when logged in but no user data
                : "Perfil"}
            </button>
          )}
        </div>
      </div>

      {mostrarPerfil && <PerfilUsuari />}
      {mostrarLogin && !isLogged && <Login />}
    </>
  );
}
