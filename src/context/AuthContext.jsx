import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Estados para gestionar el usuario y el login
  const [usuari, setUsuari] = useState(null);
  const [isLogged, setIsLogged] = useState(false);
  const [isBilbiotecari, setIsBilbiotecari] = useState(false);
  const [isAdministrador, setIsAdministrador] = useState(false);
  const [errorProfile, setErrorProfile] = useState(null);
  const [userCentre, setUserCentre] = useState(null);

  // Estado para controlar la visibilidad del perfil
  const [mostrarPerfil, setMostrarPerfil] = useState(false);

  // Estado para controlar la visibilidad del login
  const [mostrarLogin, setMostrarLogin] = useState(false);

  // Función para cerrar sesión
  const handleLogOut = () => {
    sessionStorage.removeItem("token");
    setUsuari(null);
    setIsLogged(false);
    setIsAdministrador(false);
    setIsBilbiotecari(false);
    setMostrarPerfil(false);
    setMostrarLogin(false);
  };

  // Comprobar si hay un token y actualizar el estado
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      setIsLogged(true);
    }
  }, []);

  // Comprobar si el usuario es bibliotecario o administrador
  useEffect(() => {
    if (usuari) {
      setIsAdministrador(usuari.is_superuser);
      setIsBilbiotecari(usuari.is_staff);
    }
  }, [usuari]);

  // Fetch de datos de usuario
  useEffect(() => {
    if (!isLogged) return;
    const timeout = setTimeout(() => {
      const token = sessionStorage.getItem("token");

      if (!token) {
        setErrorProfile("No s'ha trobat cap usuari. Si us plau, inicia sessió.");
        return;
      }

      // Usar la misma base URL que en api.js
      const API_BASE_URL = "http://localhost:8000/api";

      fetch(`${API_BASE_URL}/usuari/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Error en la solicitud: " + response.status);
          }
          return response.json();
        })
        .then((data) => {
          setUsuari(data);
          // IMPORTANT: Store user data in sessionStorage for access across routes
          sessionStorage.setItem("userData", JSON.stringify(data));
          console.log("User data stored in session:", data);

          // Set user center information - handle both object and string formats
          if (data.centre) {
            // Ensure we have a proper object with id and nom
            const centreInfo =
              typeof data.centre === "object" && data.centre !== null ? data.centre : { id: null, nom: data.centre };

            setUserCentre(centreInfo);
            console.log("Setting user centre:", centreInfo);
          } else {
            setUserCentre(null);
          }
        })
        .catch((error) => {
          console.error("Error al obtenir les dades:", error);
          setErrorProfile("Error al obtenir les dades");
        });
    }, 100);

    return () => clearTimeout(timeout);
  }, [isLogged]);

  return (
    <AuthContext.Provider
      value={{
        usuari,
        setUsuari,
        isLogged,
        setIsLogged,
        isBilbiotecari,
        isAdministrador,
        errorProfile,
        setErrorProfile,
        mostrarPerfil,
        setMostrarPerfil,
        mostrarLogin,
        setMostrarLogin,
        handleLogOut,
        userCentre,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
