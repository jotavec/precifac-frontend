import React, { useRef } from "react";
import Modal from "react-modal";
import { FiDownload, FiUpload, FiX } from "react-icons/fi";
import * as XLSX from "xlsx";

export default function ModalImportarProdutos({ isOpen, onRequestClose, onImportarDados }) {
  const inputFileRef = useRef(null);

  function handleImportarArquivoClick() {
    inputFileRef.current.click();
  }

  function handleArquivoSelecionado(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      // Aqui já temos o array de objetos da planilha!
      if (onImportarDados) onImportarDados(json);
    };
    reader.readAsArrayBuffer(file);
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Importar Produtos"
      style={{
        overlay: {
          backgroundColor: "rgba(16,11,40,0.55)",
          backdropFilter: "blur(2px)",
          zIndex: 1000,
          transition: "background .25s"
        },
        content: {
          zIndex: 1100,
          top: "50%",
          left: "50%",
          right: "auto",
          bottom: "auto",
          marginRight: "-50%",
          transform: "translate(-50%, -50%)",
          background: "linear-gradient(135deg, #241d39 80%, #18132d 100%)",
          borderRadius: "16px",
          padding: "2.5rem 2rem",
          minWidth: 340,
          maxWidth: 380,
          boxShadow: "0 2px 32px #0007"
        }
      }}
    >
      <button
        onClick={onRequestClose}
        style={{
          position: "absolute",
          top: 18,
          right: 20,
          background: "none",
          border: "none",
          color: "#fff",
          fontSize: 22,
          cursor: "pointer"
        }}
        aria-label="Fechar"
      >
        <FiX />
      </button>
      <h2 style={{ color: "#fff", marginBottom: 24, fontWeight: 700 }}>Importar Produtos</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <a
          href="/ARQUIVO%20EXEMPLO%20DE%20IMPORTAÇÃO.xlsx"
          download="ARQUIVO_EXEMPLO_DE_IMPORTACAO.xlsx"
          style={{ textDecoration: "none" }}
        >
          <button
            type="button"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#7E4FFF",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "12px 16px",
              fontSize: 16,
              cursor: "pointer",
              fontWeight: 600,
              width: "100%"
            }}
          >
            <FiDownload /> Baixar arquivo modelo
          </button>
        </a>
        <button
          onClick={handleImportarArquivoClick}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#ffe156",
            color: "#1e1847",
            border: "none",
            borderRadius: 8,
            padding: "12px 16px",
            fontSize: 16,
            cursor: "pointer",
            fontWeight: 600,
            width: "100%"
          }}
        >
          <FiUpload /> Importar arquivo
        </button>
        <input
          ref={inputFileRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleArquivoSelecionado}
          style={{ display: "none" }}
        />
      </div>
    </Modal>
  );
}
