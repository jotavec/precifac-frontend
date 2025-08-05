import React from "react";
import Modal from "react-modal";
import { FiTrash2, FiX } from "react-icons/fi";

export default function ConfirmDeleteModal({
  isOpen,
  onRequestClose,
  onConfirm,
  itemLabel = "subcategoria"
}) {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel={`Confirmar exclusão de ${itemLabel}`}
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
          background: "linear-gradient(135deg, #241d39 80%, #ffe06020 100%)",
          color: "#fff",
          borderRadius: 18,
          padding: 36,
          minWidth: 370,
          maxWidth: 420,
          border: "1.5px solid #3e2464",
          boxShadow: "0 11px 36px #0005",
          display: "flex",
          flexDirection: "column",
          gap: 0,
          overflow: "visible",
          transition: "box-shadow 0.2s"
        }
      }}
      shouldCloseOnOverlayClick={true}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <FiTrash2 size={30} color="#ff5c5c" />
        <h2 style={{
          fontWeight: 900,
          fontSize: 22,
          color: "#ff5c5c",
          margin: 0,
          padding: 0
        }}>
          Apagar {itemLabel.charAt(0).toUpperCase() + itemLabel.slice(1)}
        </h2>
      </div>
      <div style={{
        fontSize: 16.5,
        color: "#556072", // Mais legível!
        marginBottom: 18,
        lineHeight: 1.6
      }}>
        Tem certeza que deseja apagar esta {itemLabel}?<br />
        <b style={{ color: "#ff5c5c" }}>Essa ação não pode ser desfeita.</b> Todos os dados relacionados serão removidos permanentemente e não será possível recuperá-los depois.
      </div>
      <div style={{ display: "flex", gap: 16, justifyContent: "flex-end" }}>
        <button
          onClick={onRequestClose}
          style={{
            background: "#fff",
            color: "#251e4a",
            border: "none",
            borderRadius: 9,
            padding: "11px 26px",
            fontSize: 16,
            fontWeight: 900,
            boxShadow: "0 2px 8px #0001",
            display: "flex",
            alignItems: "center",
            gap: 7,
            cursor: "pointer"
          }}
        >
          <FiX size={19} />
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          style={{
            background: "linear-gradient(90deg, #ff5c5c 60%, #ffe060 130%)",
            color: "#20184d",
            border: "none",
            borderRadius: 9,
            padding: "11px 26px",
            fontWeight: 900,
            fontSize: 16,
            boxShadow: "0 2px 8px #0002",
            display: "flex",
            alignItems: "center",
            gap: 7,
            cursor: "pointer"
          }}
        >
          <FiTrash2 size={19} />
          Apagar
        </button>
      </div>
    </Modal>
  );
}
