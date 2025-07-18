import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { FiX } from "react-icons/fi";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

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
        width: 36, height: 18, borderRadius: 15,
        background: checked ? "#a78bfa" : "#3d3161",
        position: "relative", transition: ".17s", display: "inline-block"
      }}>
        <span style={{
          width: 16, height: 16, borderRadius: "50%",
          background: checked ? "#fff" : "#7c7c93",
          position: "absolute",
          left: checked ? 18 : 2,
          top: 1,
          transition: ".17s"
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

  // Carrega as preferências do backend quando abrir o modal
  useEffect(() => {
    if (isOpen) {
      const userId = localStorage.getItem("user_id") || "1";
      fetch(`http://localhost:3000/api/preferencias/colunas-cadastro/${userId}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0)
            setColunas(data);
          else
            setColunas(COLUNAS_CADASTRO.map(item => ({ ...item, visivel: true })));
        })
        .catch(() => setColunas(COLUNAS_CADASTRO.map(item => ({ ...item, visivel: true }))));
    }
  }, [isOpen]);

  // Enquanto não carregou, retorna null ou loading
  if (!colunas) return null;

  // Mantém as visíveis no topo
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
      const res = await fetch("http://localhost:3000/api/preferencias/colunas-cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, colunas }),
      });
      if (!res.ok) throw new Error("Falha ao salvar preferências");
      alert("Preferências salvas! (Agora no banco 😁)");
      onRequestClose();
    } catch (e) {
      setErro("Erro ao salvar no servidor!");
    }
  }

  // Reordena a lista
  function reorder(list, startIndex, endIndex) {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  }

  function onDragEnd(result) {
    if (!result.destination) return;
    const visibleCount = colunas.filter(c => c.visivel).length;
    // só permite arrastar entre visíveis ou entre invisíveis
    if (
      (result.source.index < visibleCount && result.destination.index >= visibleCount) ||
      (result.source.index >= visibleCount && result.destination.index < visibleCount)
    ) {
      return;
    }
    const newCols = reorder(ordenadas, result.source.index, result.destination.index);
    setColunas(newCols);
  }

  // Bloco visual do item (com melhorias para fluidez)
  const renderBloco = (coluna, prov, snapshot, idx) => (
    <div
      ref={prov ? prov.innerRef : undefined}
      {...(prov ? prov.draggableProps : {})}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "9px 10px 9px 0",
        borderBottom: "1px solid #2f2250",
        background: snapshot && snapshot.isDragging ? "#ffe066" : "rgba(34,22,53,0.96)",
        color: snapshot && snapshot.isDragging ? "#241d39" : "#fff",
        boxShadow: snapshot && snapshot.isDragging
          ? "0 6px 22px #ffe06680, 0 2px 10px #140c3230"
          : "0 1px 2px #140c3210",
        zIndex: snapshot && snapshot.isDragging ? 1001 : "auto",
        borderRadius: 8,
        minHeight: 44,
        border: snapshot && snapshot.isDragging ? "2px solid #a78bfa" : "none",
        fontSize: 16,
        fontWeight: coluna.visivel ? 600 : 400,
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
          fontSize: 20,
          color: "#a78bfa",
          padding: "0 12px",
          cursor: "grab",
          userSelect: "none",
          opacity: 0.95,
        }}
        title="Arrastar para mover"
      >
        ≡
      </div>
      <span style={{ flex: 1, fontWeight: coluna.visivel ? 700 : 400 }}>
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
          backgroundColor: "rgba(16, 11, 40, 0.6)",
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
          background: "linear-gradient(135deg, #241d39 80%, #35215c 100%)",
          borderRadius: 18,
          border: "none",
          padding: "34px 32px 24px 32px",
          minWidth: 350,
          maxWidth: 420,
          minHeight: 220,
          boxShadow: "0 6px 32px #160c3570",
        },
      }}
    >
      <div style={{
        display: "flex",
        alignItems: "center",
        marginBottom: 20,
        gap: 12,
      }}>
        <h2 style={{ flex: 1, color: "#ffe066", fontWeight: 700, fontSize: 22, margin: 0 }}>
          Configurar Colunas
        </h2>
        <button
          style={{
            border: "none",
            background: "none",
            color: "#aaa",
            fontSize: 20,
            cursor: "pointer",
            marginLeft: 10,
          }}
          title="Fechar"
          onClick={onRequestClose}
        >
          <FiX size={26} />
        </button>
      </div>

      <div style={{ color: "#fff", fontSize: 17, marginTop: 10, marginBottom: 8 }}>
        <p style={{ marginBottom: 8, color: "#ffe066", fontWeight: 600 }}>
          Arraste para reordenar. Ative/desative as colunas desejadas:
        </p>
        <div
          style={{
            borderRadius: 10,
            background: "#221635",
            padding: 4,
            marginBottom: 10,
            maxHeight: 340,
            overflowY: "auto",
            position: "relative",
          }}
        >
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable
              droppableId="colunas"
              renderClone={(
                provided,
                snapshot,
                rubric
              ) => {
                const coluna = ordenadas[rubric.source.index];
                return renderBloco(coluna, provided, snapshot, rubric.source.index);
              }}
            >
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {ordenadas.map((coluna, idx) => (
                    <Draggable
                      key={coluna.key}
                      draggableId={coluna.key}
                      index={idx}
                    >
                      {(prov, snapshot) =>
                        renderBloco(coluna, prov, snapshot, idx)
                      }
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
            background: "#231844",
            borderRadius: 8,
            padding: "8px 12px",
            marginBottom: 10,
            marginTop: -2,
            fontWeight: 500,
            fontSize: 15,
            textAlign: "center",
          }}>
            {erro}
          </div>
        )}
        <button
          style={{
            width: "100%",
            background: "#a78bfa",
            color: "#21173A",
            border: "none",
            borderRadius: 8,
            padding: "12px 0",
            fontWeight: 700,
            fontSize: 17,
            cursor: (totalMarcados >= 5 && totalMarcados <= 9) ? "pointer" : "not-allowed",
            opacity: (totalMarcados >= 5 && totalMarcados <= 9) ? 1 : 0.6,
            marginTop: 14,
            boxShadow: "0 2px 10px #160c3530",
            transition: "filter .17s"
          }}
          onClick={handleSalvar}
          disabled={!(totalMarcados >= 5 && totalMarcados <= 9)}
        >
          Salvar Alterações
        </button>
        <p style={{ color: "#ffe066", marginTop: 18, fontSize: 15, textAlign: "center" }}>
          Selecione de 5 a 9 colunas.<br />
          (Os ativos sempre aparecem no topo)<br />
          Arraste para reordenar.
        </p>
      </div>
    </Modal>
  );
}
