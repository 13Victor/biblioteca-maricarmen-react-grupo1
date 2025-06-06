import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import "../styles/PerfilUsuari.css";

export default function PerfilUsuari() {
  const { usuari, setUsuari, errorProfile, handleLogOut } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(!usuari);
  const [loadError, setLoadError] = useState(null);
  const [editedData, setEditedData] = useState({
    email: usuari?.email || "",
    first_name: usuari?.first_name || "",
    last_name: usuari?.last_name || "",
    telefon: usuari?.telefon || "",
  });

  useEffect(() => {
    if (!usuari && sessionStorage.getItem("token")) {
      setIsLoading(true);
      setLoadError(null);

      fetch("http://localhost:8000/api/usuari/", {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
          }
          return response.json();
        })
        .then((userData) => {
          console.log("Loaded user data:", userData);
          setUsuari(userData);
          sessionStorage.setItem("userData", JSON.stringify(userData));
          setEditedData({
            email: userData.email || "",
            first_name: userData.first_name || "",
            last_name: userData.last_name || "",
            telefon: userData.telefon || "",
          });
        })
        .catch((error) => {
          console.error("Error loading user data:", error);
          setLoadError("No s'ha pogut carregar les dades del perfil.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [usuari, setUsuari]);

  useEffect(() => {
    if (usuari) {
      setEditedData({
        email: usuari.email || "",
        first_name: usuari.first_name || "",
        last_name: usuari.last_name || "",
        telefon: usuari.telefon || "",
      });
    }
  }, [usuari]);

  // Añadir método para cargar datos del usuario
  useEffect(() => {
    // Si tenemos token pero el usuario no tiene todos los datos cargados, intentar recargarlos
    const checkUserData = async () => {
      if (usuari && (!usuari.first_name || !usuari.last_name) && sessionStorage.getItem("token")) {
        try {
          const response = await fetch("http://localhost:8000/api/usuari/", {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          });

          if (response.ok) {
            const updatedUserData = await response.json();
            // Actualizar datos locales
            Object.assign(usuari, updatedUserData);
            // Actualizar también en sessionStorage
            sessionStorage.setItem("userData", JSON.stringify(updatedUserData));

            // Actualizar el formulario de edición
            setEditedData({
              email: updatedUserData.email || "",
              first_name: updatedUserData.first_name || "",
              last_name: updatedUserData.last_name || "",
            });
          }
        } catch (error) {
          console.error("Error al cargar datos actualizados:", error);
        }
      }
    };

    checkUserData();
  }, [usuari]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData({ ...editedData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditedData({ ...editedData, imatge: file });
    }
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append(
        "payload",
        JSON.stringify({
          id: usuari.id,
          email: editedData.email,
          first_name: editedData.first_name,
          last_name: editedData.last_name,
          telefon: editedData.telefon,
        })
      );

      if (editedData.imatge) {
        formData.append("imatge", editedData.imatge);
      }

      const response = await fetch("/api/editUsuari/", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const updatedUser = await response.json();
        // Actualizar el estado del usuario
        usuari.email = updatedUser.email;
        usuari.first_name = updatedUser.first_name;
        usuari.last_name = updatedUser.last_name;
        usuari.telefon = updatedUser.telefon;
        if (updatedUser.imatge) {
          usuari.imatge = updatedUser.imatge;
        }
        setIsEditing(false);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      alert("Error en la conexió amb el servidor.", error);
    }
  };

  if (errorProfile) return <div className="error-message">{errorProfile}</div>;
  if (loadError) return <div className="error-message">{loadError}</div>;
  if (isLoading) return <div className="loading">Carregant dades del perfil...</div>;
  if (!usuari) return <div className="error-message">No s'han trobat dades d'usuari</div>;

  return (
    <div id="perfilUsuari-container">
      <h2>{usuari.username}</h2>

      <div id="perfilUsuari-info">
        <div>
          <strong>Nom: </strong>
          {isEditing ? (
            <input type="text" name="first_name" value={editedData.first_name} onChange={handleInputChange} />
          ) : (
            usuari.first_name
          )}
        </div>
        <div>
          <strong>Cognom: </strong>
          {isEditing ? (
            <input type="text" name="last_name" value={editedData.last_name} onChange={handleInputChange} />
          ) : (
            usuari.last_name
          )}
        </div>
        <div>
          <strong>Email: </strong>
          {isEditing ? (
            <input type="email" name="email" value={editedData.email} onChange={handleInputChange} />
          ) : (
            usuari.email
          )}
        </div>
        <div>
          <strong>Telèfon: </strong>
          {isEditing ? (
            <input
              type="tel"
              name="telefon"
              maxLength="9"
              value={editedData.telefon || ""}
              onChange={handleInputChange}
            />
          ) : (
            usuari.telefon
          )}
        </div>
        <div>
          <strong>Imatge: </strong>
          {isEditing ? (
            <input type="file" name="imatge" accept="image/*" onChange={handleImageChange} />
          ) : (
            usuari.imatge && <img src={`../..${usuari.imatge}`} alt="Imagen de perfil" width="100" />
          )}
        </div>
        <div>
          <strong>Centre: </strong>
          {typeof usuari.centre === "object" ? usuari.centre?.nom || "" : usuari.centre || ""}
        </div>
        <div>
          <strong>Grup: </strong>
          {usuari.grup}
        </div>
        <div>
          <strong>Rol: </strong>
          {usuari.is_staff && usuari.is_superuser ? "Administrador" : usuari.is_staff ? "Bibliotecari" : "Usuari"}
        </div>
      </div>
      <div id="perfilUsuari-buttons-container">
        {isEditing ? (
          <>
            <button onClick={handleSave}>Desar</button>
            <button onClick={() => setIsEditing(false)}>Cancel·lar</button>
          </>
        ) : (
          <button onClick={() => setIsEditing(true)}>Editar</button>
        )}
        <button onClick={handleLogOut}>Tancar Sessió</button>
      </div>
    </div>
  );
}
