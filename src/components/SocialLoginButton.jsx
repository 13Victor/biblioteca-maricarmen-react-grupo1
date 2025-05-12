// src/components/SocialLoginButton.jsx
import React from "react";

function SocialLoginButton({ provider, text, icon }) {
  const handleClick = async () => {
    try {
      // Solicitar URL de autenticación al backend
      const response = await fetch(`http://localhost:8000/api/auth/social/?provider=${provider}`);

      if (!response.ok) {
        throw new Error("Error al iniciar la autenticación");
      }

      const data = await response.json();

      // Redirigir a la URL de autenticación del proveedor
      if (data.auth_url) {
        window.location.href = data.auth_url;
      } else {
        console.error("Error: No se recibió la URL de autenticación");
      }
    } catch (error) {
      console.error("Error al iniciar autenticación social:", error);
    }
  };
  return (
    <button className={`social-login-button ${provider}`} onClick={handleClick} type="button">
      {icon && <span className="social-icon">{icon}</span>}
      <span className="social-text">{text}</span>
    </button>
  );
}

export default SocialLoginButton;
