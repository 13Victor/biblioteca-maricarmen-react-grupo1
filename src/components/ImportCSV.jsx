import { useState } from "react";
import "../styles/ImportCSV.css";

function ImportCSV() {
  // Estado principal para datos y validación
  const [data, setData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Variables estado información dinámica
  const [uiState, setUiState] = useState({
    showValidation: false,
    showResults: false,
    validationError: false,
    showUserResults: false,
    message: "",
  });

  // Estado para resultados de validación
  const [validationResults, setValidationResults] = useState([]);

  // Estado para resultados de la API
  const [apiResults, setApiResults] = useState({});

  const checkCurrentRow = (row, headers) => {
    let isValid = true;
    let parsedData = {};
    let errors = [];

    headers.forEach((header, index) => {
      let value = row[index];

            if (!value) {
                isValid = false;
                errors.push(`${header} es obligatori.`);
            }

      switch (header.toLowerCase()) {
        case "nom":
        case "cognom1":
        case "cognom2":
        case "centre":
        case "grup":
          parsedData[header] = value;
          break;

        case "email":
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            isValid = false;
            errors.push("Email inválido.");
          }
          parsedData.email = value;
          break;

                case "telefon":
                    const phoneRegex = /^\d{9}$/;
                    if (!phoneRegex.test(value)) {
                        isValid = false;
                        errors.push("El telèfon ha de contenir exactament 9 números.");
                    }
                    parsedData.telefon = value;
                    break;

                default:
                    errors.push(`Columna no reconeguda: ${header}`);
                    isValid = false;
                    break;
            }
        });

    return { valid: isValid, data: parsedData, errors };
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Reinicia estadísticas y oculta resultados de guardado anterior
    setUiState({
      showValidation: true,
      showResults: false,
      validationError: false,
      showUserResults: false,
      message: "",
    });
    setApiResults({});

    const reader = new FileReader();
    reader.onload = ({ target }) => {
      const text = target.result;
      const rows = text.split("\n").map((row) => row.split(","));
      const headers = rows[0];

      // Procesa cada fila
      const validatedData = [];
      const results = [];
      let hasErrors = false;

      rows.slice(1).forEach((row, rowIndex) => {
        if (row.length === headers.length && row.some((cell) => cell.trim() !== "")) {
          const result = checkCurrentRow(row, headers);

          // Guardar el resultado de validación para esta fila
          results.push({
            rowNumber: rowIndex + 1,
            isValid: result.valid,
            errors: result.errors,
            data: result.data,
          });

          if (result.valid) {
            validatedData.push(result.data);
          } else {
            hasErrors = true;
          }
        }
      });

      setData(validatedData);
      setValidationResults(results);
      setUiState((prev) => ({
        ...prev,
        showResults: true,
        validationError: hasErrors,
      }));
    };
    reader.readAsText(file);
  };

  const saveUsersToBackend = async () => {
    if (data.length === 0) return;

        setIsProcessing(true);
        setUiState((prev) => ({
            ...prev,
            showValidation: false,
            message: "Processant usuaris...",
        }));

    try {
      const response = await fetch("http://127.0.0.1:8000/import_users/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        // Crear un objeto con los resultados por email
        const userResults = {};

        // Procesar errores si existen
        if (result.error_details) {
          result.error_details.forEach((error) => {
            userResults[error.email] = {
              status: "error",
              message: error.error,
            };
          });
        }

                // Para los usuarios que no tienen errores
                data.forEach((user) => {
                    if (!userResults[user.email]) {
                        userResults[user.email] = {
                            status: "success",
                            message: "Usuari creat correctament",
                        };
                    }
                });

        setApiResults(userResults);

                const message =
                    result.errors === 0
                        ? "Usuaris importats correctament."
                        : `Importació completada amb ${result.errors} errors. Revisa els detalls.`;

                setUiState((prev) => ({
                    ...prev,
                    showUserResults: true,
                    message,
                }));
            } else {
                setUiState((prev) => ({
                    ...prev,
                    showValidation: true,
                    message: `Error: ${result.error}`,
                }));
            }
        } catch (error) {
            setUiState((prev) => ({
                ...prev,
                showValidation: true,
                message: `Error al connectar amb el backend: ${error.message}`,
            }));
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <>
            <div className="ImportCSV">
                <h2>Importar Usuaris per CSV</h2>
                <p>Carrega un fitxer CSV per importar usuaris de manera automatitzada.</p>

                <div className="CSV-actions">
                    <input type="file" accept=".csv" onChange={handleFileUpload} />
                    {data.length > 0 && (
                        <button onClick={saveUsersToBackend} disabled={isProcessing} className="save-button">
                            {isProcessing ? "Guardant..." : "Importar"}
                        </button>
                    )}
                </div>

        {uiState.message && (
          <div className="API-response visible">
            <p className="API-response-messages">{uiState.message}</p>
          </div>
        )}

                {uiState.showResults && uiState.showValidation && (
                    <div className="CSV-validation-results">
                        {uiState.validationError ? (
                            <ul className="validation-list">
                                {validationResults
                                    .filter((result) => !result.isValid)
                                    .map((result, index) => (
                                        <li key={index} className="invalid-row">
                                            Fila {result.rowNumber}: ❌ Inválida -
                                            {result.errors.map((error, i) => (
                                                <span key={i}>
                                                    {" "}
                                                    {error}
                                                    {i < result.errors.length - 1 ? "," : ""}
                                                </span>
                                            ))}
                                        </li>
                                    ))}
                            </ul>
                        ) : (
                            <p className="valid-format">
                                El format del CSV és correcte, prem "Importar" per iniciar la pujada de dades.
                            </p>
                        )}
                    </div>
                )}

                {uiState.showUserResults && (
                    <div className="CSV-show-results visible">
                        <h3>Resultat Detallat</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Fila</th>
                                    {data.length > 0 && Object.keys(data[0]).map((key) => <th key={key}>{key}</th>)}
                                    <th>Detalls</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((row, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        {Object.values(row).map((value, i) => (
                                            <td key={i}>{value}</td>
                                        ))}
                                        <td
                                            className={
                                                apiResults[row.email]?.status === "error"
                                                    ? "error-message"
                                                    : "success-message"
                                            }>
                                            {apiResults[row.email]?.message || "-"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}

export default ImportCSV;
