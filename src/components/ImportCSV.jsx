import { useState } from "react";
import "./ImportCSV.css";

function ImportCSV() {
    const [data, setData] = useState([]);
    const [stats, setStats] = useState({ created: 0, updated: 0, errors: 0 });
    const [showResults, setShowResults] = useState(false);
    const [showSaveStats, setShowSaveStats] = useState(false);
    const [rowResults, setRowResults] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorDetails, setErrorDetails] = useState([]);
    const [apiResponseMessage, setApiResponseMessage] = useState("");
    const [userResults, setUserResults] = useState({});
    const [showValidUsers, setShowValidUsers] = useState(false);
    const [hasValidationErrors, setHasValidationErrors] = useState(false);
    const [showValidation, setShowValidation] = useState(false);

    const checkCurrentRow = (row, headers) => {
        const EXPECTED_COLUMNS = ["nom", "cognom1", "cognom2", "email", "telefon", "centre", "grup"];

        let isValid = true;
        let parsedData = {};
        let errors = [];

        headers.forEach((header, index) => {
            let value = row[index];

            if (!value) {
                isValid = false;
                errors.push(`${header} es obligatorio.`);
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
                        errors.push("El teléfono debe contener exactamente 9 números.");
                    }
                    parsedData.telefon = value;
                    break;

                default:
                    errors.push(`Columna no reconocida: ${header}`);
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
        setStats({ created: 0, updated: 0, errors: 0 });
        setShowSaveStats(false);
        setErrorDetails([]);
        setApiResponseMessage("");
        setShowValidUsers(false);
        setShowValidation(true);

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
            setRowResults(results);
            setShowResults(true);
            setHasValidationErrors(hasErrors);
        };
        reader.readAsText(file);
    };

    const saveUsersToBackend = async () => {
        if (data.length === 0) return;

        setIsProcessing(true);
        setApiResponseMessage("Procesando usuarios...");
        setShowValidation(false);

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
                setStats({
                    created: result.created,
                    updated: result.updated,
                    errors: result.errors || 0,
                });

                // Guardar los detalles de errores si existen
                if (result.error_details) {
                    setErrorDetails(result.error_details);

                    // Crear un objeto con los resultados por email
                    const results = {};
                    result.error_details.forEach((error) => {
                        results[error.email] = { status: "error", message: error.error };
                    });

                    // Para los usuarios que no tienen errores, asumimos que fueron creados
                    data.forEach((user) => {
                        if (!results[user.email]) {
                            results[user.email] = { status: "success", message: "Usuario creado correctamente" };
                        }
                    });

                    setUserResults(results);
                } else {
                    // Si no hay errores, todos los usuarios fueron creados exitosamente
                    const results = {};
                    data.forEach((user) => {
                        results[user.email] = { status: "success", message: "Usuario creado correctamente" };
                    });
                    setUserResults(results);
                    setErrorDetails([]);
                }

                // Mostrar la sección de estadísticas y de usuarios válidos
                setShowSaveStats(true);
                setShowValidUsers(true);

                if (result.errors === 0) {
                    setApiResponseMessage("Usuarios importados correctamente.");
                } else {
                    setApiResponseMessage(`Importación completada con ${result.errors} errores. Revisa los detalles.`);
                }
            } else {
                setApiResponseMessage(`Error: ${result.error}`);
                setShowValidation(true);
            }
        } catch (error) {
            setApiResponseMessage(`Error al conectar con el backend: ${error.message}`);
            setShowValidation(true);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <>
            <h2>Importar Usuarios por CSV</h2>
            <p>Carga un fichero CSV para importar usuarios de manera automatizada.</p>

            <div className={"CSV-actions"}>
                <input type="file" accept=".csv" onChange={handleFileUpload} />
                {data.length > 0 && (
                    <button onClick={saveUsersToBackend} disabled={isProcessing} className="save-button">
                        {isProcessing ? "Guardando..." : "Guardar usuarios válidos"}
                    </button>
                )}
            </div>

            <div className={`API-response ${apiResponseMessage ? "visible" : "hidden"}`}>
                <p className="API-response-messages">{apiResponseMessage}</p>
            </div>

            {showResults && showValidation && (
                <div className="CSV-validation-results">
                    <h3>Validación del CSV</h3>
                    {hasValidationErrors ? (
                        <ul className="validation-list">
                            {rowResults
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
                        <p className="valid-format">El formato del CSV parece correcto</p>
                    )}
                </div>
            )}

            <div className={`CSV-show-results ${showValidUsers ? "visible" : "hidden"}`}>
                <h3>Usuarios Válidos</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Fila</th>
                            {data.length > 0 && Object.keys(data[0]).map((key) => <th key={key}>{key}</th>)}
                            <th>Resultado</th>
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
                                        userResults[row.email]?.status === "error" ? "error-message" : "success-message"
                                    }>
                                    {userResults[row.email]?.message || "-"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}

export default ImportCSV;
