import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import "../styles/PerfilUsuari.css";

export default function PerfilUsuari() {
  const { usuari, errorProfile, handleLogOut } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    email: usuari?.email || "",
    first_name: usuari?.first_name || "",
    last_name: usuari?.last_name || "",
  });

  useEffect(() => {
    if (usuari) {
      setEditedData({
        email: usuari.email,
        first_name: usuari.first_name,
        last_name: usuari.last_name,
      });
    }
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
      formData.append("payload", JSON.stringify({
        id: usuari.id,
        email: editedData.email,
        first_name: editedData.first_name,
        last_name: editedData.last_name,
      }));

      if (editedData.imatge) {
        formData.append("imatge", editedData.imatge);
      }

      const response = await fetch("http://localhost:8000/api/editUsuari/", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const updatedUser = await response.json();
        // Actualizar el estado del usuario
        usuari.email = updatedUser.email;
        usuari.first_name = updatedUser.first_name;
        usuari.last_name = updatedUser.last_name;
        if (updatedUser.imatge) {
          usuari.imatge = updatedUser.imatge;
        }
        setIsEditing(false);
        alert("Usuario actualizado correctamente.");
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      alert("Error en la conexión con el servidor.", error);
    }
  };

  if (errorProfile) return <div>{errorProfile}</div>;
  if (!usuari) return <></>;

  return (
    <div id="perfilUsuari-container">
      <h2>{usuari.username}</h2>
      <div id="perfilUsuari-info">
        <div><strong>Nombre: </strong>{isEditing ? <input type="text" name="first_name" value={editedData.first_name} onChange={handleInputChange} /> : usuari.first_name}</div>
        <div><strong>Apellido: </strong>{isEditing ? <input type="text" name="last_name" value={editedData.last_name} onChange={handleInputChange} /> : usuari.last_name}</div>
        <div><strong>Email: </strong>{isEditing ? <input type="email" name="email" value={editedData.email} onChange={handleInputChange} /> : usuari.email}</div>
        <div><strong>Imagen: </strong>{isEditing ? <input type="file" name="imatge" accept="image/*" onChange={handleImageChange} /> : (usuari.imatge && <img src={`../../${usuari.imatge}`} alt="Imagen de perfil" width="100" />)}</div>
        <div><strong>Centro: </strong>{usuari.centre}</div>
        <div><strong>Ciclo: </strong>{usuari.cicle}</div>
        <div><strong>Rol: </strong>{usuari.is_staff && usuari.is_superuser ? "Administrador" : usuari.is_staff ? "Bibliotecario" : "Usuario"}</div>
      </div>
      <div id="perfilUsuari-buttons-container">
        {isEditing ? (
          <>
            <button onClick={handleSave}>Guardar</button>
            <button onClick={() => setIsEditing(false)}>Cancelar</button>
          </>
        ) : (
          <button onClick={() => setIsEditing(true)}>Editar</button>
        )}
        <button onClick={handleLogOut}>Cerrar Sesión</button>
      </div>
    </div>
  );
}