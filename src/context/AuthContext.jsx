import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Estados para gestionar el usuario y el login
  const [usuari, setUsuari] = useState(null);
  const [isLogged, setIsLogged] = useState(false);
  const [isBilbiotecari, setIsBilbiotecari] = useState(false);
  const [isAdministrador, setIsAdministrador] = useState(false);
  const [errorProfile, setErrorProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estado para controlar la visibilidad del perfil
  const [mostrarPerfil, setMostrarPerfil] = useState(false);

  // Estado para controlar la visibilidad del login
  const [mostrarLogin, setMostrarLogin] = useState(false);

  // Función para cerrar sesión
  const handleLogOut = async () => {
    try {
      // Realizar logout en el backend
      await fetch("http://localhost:8000/accounts/logout/", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCsrfToken(),
        },
      });
    } catch (error) {
      console.error("Error en logout:", error);
    } finally {
      // Limpiar estados locales
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("userData");
      setUsuari(null);
      setIsLogged(false);
      setIsAdministrador(false);
      setIsBilbiotecari(false);
      setMostrarPerfil(false);
      setMostrarLogin(false);

      // Redirigir a la página de catálogo en lugar de login
      window.location.href = "/cataleg";
    }
  };

  // Obtener CSRF token de las cookies
  const getCsrfToken = () => {
    const name = "csrftoken=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(";");

    for (let i = 0; i < cookieArray.length; i++) {
      let cookie = cookieArray[i].trim();
      if (cookie.indexOf(name) === 0) {
        return cookie.substring(name.length, cookie.length);
      }
    }

    return "";
  };

  // Verificar la sesión con el backend al cargar
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        // Primero intentamos recuperar datos del sessionStorage
        const storedUserData = sessionStorage.getItem("userData");
        const storedToken = sessionStorage.getItem("token");

        if (storedUserData && storedToken) {
          try {
            const userData = JSON.parse(storedUserData);
            console.log("Loading stored user data:", userData);

            // Never set isLogged without setting user data
            setUsuari(userData);
            setIsLogged(true);
            setIsAdministrador(userData.is_superuser || false);
            setIsBilbiotecari(userData.is_staff || false);

            // Make sure we have complete data
            if (storedToken !== "session-auth" && (!userData.first_name || !userData.last_name)) {
              console.log("Fetching complete user data...");
              const response = await fetch("http://localhost:8000/api/usuari/", {
                headers: {
                  Authorization: `Bearer ${storedToken}`,
                },
              });

              if (response.ok) {
                const completeUserData = await response.json();
                console.log("Received complete user data:", completeUserData);
                setUsuari(completeUserData);
                setIsAdministrador(completeUserData.is_superuser || false);
                setIsBilbiotecari(completeUserData.is_staff || false);
                sessionStorage.setItem("userData", JSON.stringify(completeUserData));
              }
            }
          } catch (error) {
            console.error("Error processing stored user data:", error);
            // Clear invalid data
            sessionStorage.removeItem("userData");
            sessionStorage.removeItem("token");
            setUsuari(null);
            setIsLogged(false);
          }
        } else {
          // No data in sessionStorage, try with session endpoint
          try {
            const response = await fetch("http://localhost:8000/api/auth/session/", {
              credentials: "include",
            });

            if (response.ok) {
              const data = await response.json();
              console.log("Session check response:", data);

              if (data.isAuthenticated && data.user) {
                // Always set user data together with isLogged
                setUsuari(data.user);
                setIsLogged(true);
                setIsAdministrador(data.user.is_superuser || false);
                setIsBilbiotecari(data.user.is_staff || false);
                sessionStorage.setItem("userData", JSON.stringify(data.user));
                sessionStorage.setItem("token", "session-auth");
              } else {
                // Clear all state if not authenticated
                setUsuari(null);
                setIsLogged(false);
                setIsAdministrador(false);
                setIsBilbiotecari(false);
              }
            } else {
              // Session check failed, ensure logged out state
              setUsuari(null);
              setIsLogged(false);
            }
          } catch (error) {
            console.error("Error checking session:", error);
            setUsuari(null);
            setIsLogged(false);
          }
        }
      } catch (error) {
        console.error("Authentication check error:", error);
        setErrorProfile("Error al verificar la sesión");
        // Ensure user is logged out on error
        setUsuari(null);
        setIsLogged(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuthentication();
  }, []);

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
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
