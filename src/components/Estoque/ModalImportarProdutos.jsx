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
          backgroundColor: "rgba(16,16,40,0.22)",
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
          background: "#fff",
          borderRadius: "32px",
          padding: "3.2rem 2.8rem 2.8rem 2.8rem",
          minWidth: 400,
          maxWidth: 480,
          boxShadow: "0 8px 38px 0 #38a1ff23, 0 1.5px 0.5px #2196f366",
          border: "none",
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }
      }}
    >
      <button
        onClick={onRequestClose}
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          background: "none",
          border: "none",
          color: "#4baaf7",
          fontSize: 32,
          cursor: "pointer",
          fontWeight: 700,
          transition: "color 0.17s"
        }}
        aria-label="Fechar"
        title="Fechar"
        tabIndex={0}
      >
        <FiX />
      </button>

      <h2 style={{
        color: "#1898ff",
        marginBottom: 46,
        fontWeight: 900,
        fontSize: 28,
        letterSpacing: 0.1,
        textAlign: "center",
        fontFamily: "inherit"
      }}>
        Importar Produtos
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 32, width: "100%" }}>
        <a
          href="/ARQUIVO%20EXEMPLO%20DE%20IMPORTAÇÃO.xlsx"
          download="ARQUIVO_EXEMPLO_DE_IMPORTACAO.xlsx"
          style={{ textDecoration: "none", width: "100%" }}
        >
          <button
            type="button"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              background: "linear-gradient(90deg,#20bbff 0%,#1898ff 100%)",
              color: "#fff",
              border: "none",
              borderRadius: 15,
              padding: "18px 0",
              fontSize: 1.18 + "rem",
              fontWeight: 900,
              width: "100%",
              cursor: "pointer",
              boxShadow: "0 2px 16px #2196f33a",
              justifyContent: "center",
              transition: "filter .17s, background .17s"
            }}
          >
            <FiDownload size={25} style={{ marginRight: 2 }} /> Baixar arquivo modelo
          </button>
        </a>
        <button
          onClick={handleImportarArquivoClick}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            background: "linear-gradient(90deg,#ffe156 0%,#ffe066 100%)",
            color: "#222",
            border: "none",
            borderRadius: 15,
            padding: "18px 0",
            fontSize: 1.18 + "rem",
            fontWeight: 900,
            width: "100%",
            cursor: "pointer",
            boxShadow: "0 2px 16px #ffe06623",
            justifyContent: "center",
            transition: "filter .17s, background .17s"
          }}
        >
          <FiUpload size={25} style={{ marginRight: 2 }} /> Importar arquivo
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
