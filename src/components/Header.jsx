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

  // Add toggle functions for login and profile
  const toggleLogin = () => {
    setMostrarLogin(!mostrarLogin);
    if (mostrarPerfil) setMostrarPerfil(false);
  };

  const togglePerfil = () => {
    setMostrarPerfil(!mostrarPerfil);
    if (mostrarLogin) setMostrarLogin(false);
  };

  // Add enhanced logging
  console.log("Header render state:", {
    isLogged,
    isBilbiotecari,
    isAdministrador,
    userData: usuari
      ? {
          username: usuari.username,
          is_staff: usuari.is_staff,
          is_superuser: usuari.is_superuser,
        }
      : null,
    mostrarPerfil,
  });

  // Derive roles from user data as a fallback
  const hasAdminRole = isAdministrador || (usuari && usuari.is_superuser === true);
  const hasLibrarianRole = isBilbiotecari || (usuari && usuari.is_staff === true);

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
