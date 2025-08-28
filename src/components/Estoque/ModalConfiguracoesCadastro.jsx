import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { FiX } from "react-icons/fi";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import api, { API_PREFIX } from "../../services/api"; // <-- usa o axios central

// Switch azul igual o do app
function Switch({ checked, onChange }) {
  return (
    <label style={{
      display: "flex", alignItems: "center", cursor: "pointer", marginLeft: 6
    }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        style={{ display: "none" }}
      />
      <span style={{
        width: 38, height: 22, borderRadius: 16,
        background: checked ? "linear-gradient(90deg,#20bbff 0%,#1898ff 100%)" : "#e3eaf3",
        position: "relative", transition: ".16s", display: "inline-block"
      }}>
        <span style={{
          width: 18, height: 18, borderRadius: "50%",
          background: checked ? "#fff" : "#b0cdf2",
          position: "absolute",
          left: checked ? 17 : 2,
          top: 2,
          boxShadow: checked ? "0 1px 4px #20bbff44" : "none",
          transition: ".16s"
        }} />
      </span>
    </label>
  );
}

const COLUNAS_CADASTRO = [
  { key: "imagem", label: "Imagem" },
  { key: "nome", label: "Nome" },
  { key: "marca", label: "Marca" },
  { key: "categoria", label: "Categoria" },
  { key: "codigo", label: "Código Interno" },
  { key: "codBarras", label: "Código de Barras" },
  { key: "totalEmbalagem", label: "Total na Embalagem" },
  { key: "unidade", label: "Unidade de Medida" },
  { key: "custoTotal", label: "Custo Total" },
  { key: "custoUnitario", label: "Custo Unitário" },
  { key: "estoque", label: "Quantidade em Estoque" },
  { key: "estoqueMinimo", label: "Estoque Mínimo" },
];

export default function ModalConfiguracoesCadastro({ isOpen, onRequestClose }) {
  const [colunas, setColunas] = useState(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    const userId = localStorage.getItem("user_id") || "1";
    api
      .get(`${API_PREFIX}/preferencias/colunas-cadastro/${userId}`)
      .then(({ data }) => {
        if (Array.isArray(data) && data.length > 0)
          setColunas(data);
        else
          setColunas(COLUNAS_CADASTRO.map(item => ({ ...item, visivel: true })));
      })
      .catch(() =>
        setColunas(COLUNAS_CADASTRO.map(item => ({ ...item, visivel: true })))
      );
  }, [isOpen]);

  if (!colunas) return null;

  const ordenadas = [
    ...colunas.filter(c => c.visivel),
    ...colunas.filter(c => !c.visivel)
  ];

  const totalMarcados = colunas.filter(c => c.visivel).length;

  function handleSwitch(idx) {
    const novo = [...colunas];
    if (novo[idx].visivel) {
      if (totalMarcados <= 5) {
        setErro("No mínimo 5 colunas devem estar visíveis.");
        return;
      }
      novo[idx].visivel = false;
    } else {
      if (totalMarcados >= 9) {
        setErro("No máximo 9 colunas podem estar visíveis.");
        return;
      }
      novo[idx].visivel = true;
    }
    setErro("");
    setColunas(novo);
  }

  async function handleSalvar() {
    if (totalMarcados < 5 || totalMarcados > 9) {
      setErro("Selecione de 5 a 9 colunas para salvar.");
      return;
    }
    setErro("");
    try {
      const userId = localStorage.getItem("user_id") || "1";
      await api.post(`${API_PREFIX}/preferencias/colunas-cadastro`, { userId, colunas });
      alert("Preferências salvas! (Agora no banco 😁)");
      onRequestClose();
    } catch (e) {
      setErro("Erro ao salvar no servidor!");
    }
  }

  function reorder(list, startIndex, endIndex) {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  }

  function onDragEnd(result) {
    if (!result.destination) return;
    const visibleCount = colunas.filter(c => c.visivel).length;
    if (
      (result.source.index < visibleCount && result.destination.index >= visibleCount) ||
      (result.source.index >= visibleCount && result.destination.index < visibleCount)
    ) {
      return;
    }
    const newCols = reorder(ordenadas, result.source.index, result.destination.index);
    setColunas(newCols);
  }

  const renderBloco = (coluna, prov, snapshot, idx) => (
    <div
      ref={prov ? prov.innerRef : undefined}
      {...(prov ? prov.draggableProps : {})}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "15px 20px 15px 0",
        borderBottom: "1px solid #dbeafe",
        background: snapshot && snapshot.isDragging ? "#e3f0fd" : "#f7fbfe",
        color: "#1b2749",
        boxShadow: snapshot && snapshot.isDragging
          ? "0 6px 22px #22aaff25, 0 2px 10px #140c3230"
          : undefined,
        zIndex: snapshot && snapshot.isDragging ? 1001 : "auto",
        borderRadius: 12,
        minHeight: 56,
        border: snapshot && snapshot.isDragging ? "2px solid #38a1ff" : "none",
        fontSize: 18,
        fontWeight: coluna.visivel ? 700 : 500,
        transition: "box-shadow 0.09s, background 0.09s, color 0.09s",
        willChange: "transform",
        userSelect: "none",
        cursor: prov ? "grab" : "default",
        ...((prov && prov.draggableProps) ? prov.draggableProps.style : {}),
      }}
    >
      <div
        {...(prov ? prov.dragHandleProps : {})}
        style={{
          fontSize: 24,
          color: "#38a1ff",
          padding: "0 18px",
          cursor: "grab",
          userSelect: "none",
          opacity: 0.96,
        }}
        title="Arrastar para mover"
      >
        ≡
      </div>
      <span style={{ flex: 1, fontWeight: coluna.visivel ? 800 : 500 }}>
        {coluna.label}
      </span>
      <Switch
        checked={coluna.visivel}
        onChange={() => handleSwitch(
          colunas.findIndex(c => c.key === coluna.key)
        )}
      />
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Configurações do Cadastro"
      ariaHideApp={false}
      style={{
        overlay: {
          backgroundColor: "rgba(16, 11, 40, 0.22)",
          zIndex: 1000,
          backdropFilter: "blur(2px)",
        },
        content: {
          top: "50%",
          left: "50%",
          right: "auto",
          bottom: "auto",
          marginRight: "-50%",
          transform: "translate(-50%, -50%)",
          background: "#fff",
          borderRadius: "32px",
          border: "none",
          padding: "3rem 2.6rem 2.3rem 2.6rem",
          minWidth: 440,
          maxWidth: 520,
          minHeight: 260,
          boxShadow: "0 8px 38px 0 #38a1ff23, 0 1.5px 0.5px #2196f366",
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        },
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
          color: "#38a1ff",
          fontSize: 34,
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
        fontSize: 26,
        marginBottom: 26,
        fontWeight: 900,
        letterSpacing: 0.1,
        textAlign: "left",
        width: "100%",
        fontFamily: "inherit"
      }}>
        Configurar Colunas
      </h2>
      <div style={{ width: "100%", marginBottom: 12 }}>
        <p style={{
          color: "#38a1ff",
          fontWeight: 700,
          fontSize: 17,
          marginBottom: 18
        }}>
          Arraste para reordenar. Ative/desative as colunas desejadas:
        </p>
        <div
          style={{
            borderRadius: 16,
            background: "#f2f8fd",
            padding: 7,
            marginBottom: 20,
            maxHeight: 340,
            overflowY: "auto",
            position: "relative",
            border: "1.5px solid #e5eef7"
          }}
        >
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable
              droppableId="colunas"
              renderClone={(provided, snapshot, rubric) => {
                const coluna = ordenadas[rubric.source.index];
                return renderBloco(coluna, provided, snapshot, rubric.source.index);
              }}
            >
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {ordenadas.map((coluna, idx) => (
                    <Draggable key={coluna.key} draggableId={coluna.key} index={idx}>
                      {(prov, snapshot) => renderBloco(coluna, prov, snapshot, idx)}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
        {erro && (
          <div style={{
            color: "#ff6363",
            background: "#eaf6ff",
            borderRadius: 10,
            padding: "10px 14px",
            marginBottom: 12,
            fontWeight: 700,
            fontSize: 16,
            textAlign: "center",
          }}>
            {erro}
          </div>
        )}
        <button
          style={{
            width: "100%",
            background: "linear-gradient(90deg,#20bbff 0%,#1898ff 100%)",
            color: "#fff",
            border: "none",
            borderRadius: 13,
            padding: "17px 0",
            fontWeight: 900,
            fontSize: 18,
            cursor: (totalMarcados >= 5 && totalMarcados <= 9) ? "pointer" : "not-allowed",
            opacity: (totalMarcados >= 5 && totalMarcados <= 9) ? 1 : 0.6,
            marginTop: 10,
            marginBottom: 12,
            boxShadow: "0 2px 10px #20bbff33",
            transition: "filter .17s"
          }}
          onClick={handleSalvar}
          disabled={!(totalMarcados >= 5 && totalMarcados <= 9)}
        >
          Salvar Alterações
        </button>
        <p style={{
          color: "#38a1ff",
          marginTop: 10,
          fontSize: 15,
          textAlign: "center",
          lineHeight: 1.5,
          marginBottom: 0,
          fontWeight: 700
        }}>
          Selecione de 5 a 9 colunas.<br />
          (Os ativos sempre aparecem no topo)<br />
          Arraste para reordenar.
        </p>
      </div>
    </Modal>
  );
}
