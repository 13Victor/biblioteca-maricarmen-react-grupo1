import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "../styles/Login.css";
import SocialLoginButton from "./SocialLoginButton";
import { GoogleIcon, MicrosoftIcon } from "./Icons";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function Login() {
  // Add setUsuari to the destructured context values
  const {
    setIsLogged,
    setMostrarLogin,
    setMostrarPerfil,
    setUsuari, // Add this line
    setIsAdministrador,
    setIsBilbiotecari,
  } = useContext(AuthContext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [doFetch, setDoFetch] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8000";

  // Fix the useEffect for traditional login
  useEffect(() => {
    if (!doFetch) return;

    const fetchToken = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Create Basic Auth header
        const credentials = btoa(`${username}:${password}`);

        const response = await fetch(`${API_BASE_URL}/api/token/`, {
          method: "GET",
          headers: {
            Authorization: `Basic ${credentials}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Error de autenticación");
        }

        const data = await response.json();

        if (data.token) {
          // Get user data with the token
          const userResponse = await fetch(`${API_BASE_URL}/api/usuari/`, {
            headers: {
              Authorization: `Bearer ${data.token}`,
            },
          });

          if (!userResponse.ok) {
            throw new Error("Error al obtener datos del usuario");
          }

          const userData = await userResponse.json();

          // Store authentication data
          sessionStorage.setItem("token", data.token);
          sessionStorage.setItem("userData", JSON.stringify(userData));

          // Update context
          setUsuari(userData);
          setIsLogged(true);
          setIsAdministrador(userData.is_superuser || false);
          setIsBilbiotecari(userData.is_staff || false);
          setMostrarLogin(false);

          // Redirect to home or profile
          navigate("/cataleg");
        } else {
          throw new Error("No se recibió un token válido");
        }
      } catch (error) {
        console.error("Login error:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
        setDoFetch(false);
      }
    };

    fetchToken();
  }, [
    doFetch,
    username,
    password,
    API_BASE_URL,
    setIsLogged,
    setMostrarLogin,
    setUsuari,
    setIsAdministrador,
    setIsBilbiotecari,
    navigate,
  ]);

  return (
    <div id="login-container">
      <h1>Login</h1>
      {error && <p style={{ color: "red", padding: "5px" }}>{error}</p>}

      {/* Botones de inicio de sesión social */}
      <div className="social-login-section">
        <SocialLoginButton provider="google" text="Continuar con Google" icon={<GoogleIcon />} />
        <SocialLoginButton provider="microsoft" text="Continuar con Microsoft" icon={<MicrosoftIcon />} />

        <div className="divider">
          <span>O</span>
        </div>
      </div>

      {/* Formulario de inicio de sesión tradicional */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setDoFetch(true);
        }}
      >
        <div>
          <label>Usuari:</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div>
          <label>Contrasenya:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Carregant..." : "Iniciar Sessió"}
        </button>
      </form>
    </div>
  );
}
