import React, { useState } from "react";
import { API_URL } from "../../services/api";

export default function ImportarNotaFiscalXML({ onUpload }) {
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState("");
  const [carregando, setCarregando] = useState(false);

  function handleFileChange(e) {
    setFile(e.target.files[0]);
    setMsg("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) {
      setMsg("Selecione um arquivo XML para importar.");
      return;
    }
    setCarregando(true);
    setMsg("");
    const formData = new FormData();
    formData.append("xml", file);
    try {
      const res = await fetch(`${API_URL}/produtos/importar-xml-nfe`, {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("Arquivo enviado com sucesso!");
        if (onUpload) onUpload(data); // Chama callback, se passar do pai
      } else {
        setMsg(data.error || "Erro ao processar o arquivo.");
      }
    } catch (err) {
      setMsg("Erro ao conectar ao servidor.");
    }
    setCarregando(false);
  }

  return (
    <div style={{ padding: 32, maxWidth: 480 }}>
      <h2 style={{ color: "#7c3aed" }}>Importar Nota Fiscal (XML)</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept=".xml"
          onChange={handleFileChange}
          style={{ marginBottom: 16 }}
        />
        <button
          type="submit"
          disabled={carregando}
          style={{
            background: "#7c3aed",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 24px",
            fontWeight: 600,
            fontSize: 16,
            cursor: "pointer",
            opacity: carregando ? 0.7 : 1,
            marginLeft: 10
          }}
        >
          {carregando ? "Enviando..." : "Importar XML"}
        </button>
        {msg && <div style={{ marginTop: 16, color: "#ffe066" }}>{msg}</div>}
      </form>
    </div>
  );
}
