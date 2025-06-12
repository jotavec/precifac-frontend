import React from "react";
import Modal from "react-modal";

Modal.setAppElement("#root");

export default function DespesasFixas({
  subcat = { nome: "", despesas: [] },
  editandoDespesaIdx,
  setEditandoDespesaIdx,
  despesaTemp,
  setDespesaTemp,
  handleAddDespesa,
  handleSalvarDespesa,
  handleEditarDespesa,
  handleExcluirDespesa,
  somaSubcat,
}) {
  const [modalAberto, setModalAberto] = React.useState(false);
  const inputRefs = React.useRef([]);

  React.useEffect(() => {
    setModalAberto(editandoDespesaIdx !== null);
    if (editandoDespesaIdx !== null) {
      setTimeout(() => {
        if (inputRefs.current[0]) inputRefs.current[0].focus();
      }, 100);
    }
  }, [editandoDespesaIdx]);

  function handleTab(e, idx) {
    if (e.key === "Tab") {
      e.preventDefault();
      const totalInputs = inputRefs.current.length;
      let nextIdx = e.shiftKey
        ? (idx === 0 ? totalInputs - 1 : idx - 1)
        : (idx === totalInputs - 1 ? 0 : idx + 1);
      inputRefs.current[nextIdx]?.focus();
    }
  }

  const formatarValor = (valor) => {
    if (!valor) return "R$ 0,00";
    return Number(String(valor).replace(/\./g, "").replace(",", ".")).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  function fecharModal() {
    setEditandoDespesaIdx(null);
    setModalAberto(false);
  }

  return (
    <div>
      {/* Card da subcategoria */}
      <div
        style={{
          background: "#19113A",
          borderRadius: 24,
          padding: 24,
          marginTop: 10,
          marginBottom: 16,
          boxShadow: "0 4px 24px #0002",
          minWidth: 320,
          maxWidth: 740,
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 16, color: "#ffe060" }}>
          {subcat?.nome === "Despesas Gerais" ? "Despesas Fixas" : subcat?.nome}
        </div>
        <table style={{ width: "100%", background: "transparent", color: "#fff", borderCollapse: "separate", borderSpacing: 0 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #302c60" }}>
              <th style={{ textAlign: "left", padding: "8px 8px", fontWeight: 700, letterSpacing: 0.5 }}>Nome</th>
              <th style={{ textAlign: "right", padding: "8px 8px", fontWeight: 700, letterSpacing: 0.5, minWidth: 120 }}>Valor (R$)</th>
              <th style={{ textAlign: "center", padding: "8px 8px", fontWeight: 700, letterSpacing: 0.5, minWidth: 160 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {subcat?.despesas?.length === 0 && (
              <tr>
                <td colSpan={3} style={{ color: "#aaa", textAlign: "center", padding: 24 }}>
                  Nenhum custo cadastrado.<br />
                  Clique em <b>Adicionar custo</b> para começar.
                </td>
              </tr>
            )}
            {subcat?.despesas?.map((custo, idx) => (
              <tr
                key={idx}
                style={{
                  borderBottom: "1.5px solid #25224b",
                  background: idx % 2 === 0 ? "#18173b" : "transparent",
                  transition: "background .2s"
                }}
              >
                <td style={{
                  padding: "10px 8px",
                  maxWidth: 320,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  wordBreak: "break-word"
                }}>
                  {custo.nome}
                </td>
                <td style={{ padding: "10px 8px", textAlign: "right", fontWeight: 600, color: "#b388ff" }}>
                  {formatarValor(custo.valor)}
                </td>
                <td style={{ padding: "10px 8px", textAlign: "center" }}>
                  <button
                    onClick={() => handleEditarDespesa(idx)}
                    style={{
                      color: "#212",
                      background: "#ffe060",
                      border: "none",
                      borderRadius: 6,
                      padding: "5px 16px",
                      marginRight: 8,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontSize: 15,
                      transition: "background .2s"
                    }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleExcluirDespesa(idx)}
                    style={{
                      color: "#fff",
                      background: "#3c3160",
                      border: "none",
                      borderRadius: 6,
                      padding: "5px 16px",
                      fontWeight: 700,
                      fontSize: 15,
                      cursor: "pointer",
                      transition: "background .2s"
                    }}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: 22, textAlign: "left" }}>
          <button
            onClick={handleAddDespesa}
            style={{
              background: "#a780ff",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "12px 30px",
              fontWeight: 700,
              fontSize: 16,
              cursor: "pointer",
              boxShadow: "0 2px 8px #0002",
              transition: "background .2s"
            }}
          >
            + Adicionar custo
          </button>
        </div>
        <div style={{
          marginTop: 22,
          textAlign: "right",
          fontWeight: 800,
          fontSize: 19,
          color: "#b388ff"
        }}>
          Total de Custos:{" "}
          <span style={{ color: "#b388ff" }}>
            {formatarValor(somaSubcat(subcat))}
          </span>
        </div>
      </div>

      {/* Modal de adicionar/editar custo */}
      <Modal
        isOpen={modalAberto}
        onRequestClose={fecharModal}
        contentLabel={editandoDespesaIdx === "novo" ? "Adicionar Custo" : "Editar Custo"}
        style={{
          overlay: { backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000 },
          content: {
            zIndex: 1100,
            top: "50%", left: "50%", right: "auto", bottom: "auto",
            marginRight: "-50%", transform: "translate(-50%, -50%)",
            background: "#221c3a", color: "#fff", borderRadius: 18,
            padding: 38, minWidth: 360, maxWidth: 440, border: "1.5px solid #3e2464",
            boxShadow: "0 6px 32px #0005",
            display: "flex", flexDirection: "column", gap: 0,
            overflow: "visible"
          }
        }}
        shouldCloseOnOverlayClick={true}
      >
        <h2 style={{
          marginBottom: 18,
          fontWeight: 800,
          fontSize: 24,
          textAlign: "left"
        }}>
          {editandoDespesaIdx === "novo" ? "Adicionar Custo" : "Editar Custo"}
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <input
            ref={el => inputRefs.current[0] = el}
            onKeyDown={e => handleTab(e, 0)}
            value={despesaTemp.nome}
            onChange={e => setDespesaTemp({ ...despesaTemp, nome: e.target.value })}
            placeholder="Nome do custo"
            style={{
              display: "block",
              width: "100%",
              background: "#191730",
              border: "none",
              borderRadius: 7,
              color: "#fff",
              fontSize: 15,
              padding: "10px 12px",
              fontWeight: 600,
              outline: "none",
              height: "44px",
              margin: 0,
              boxSizing: "border-box"
            }}
            maxLength={60}
          />
          <div style={{ position: "relative" }}>
            <input
              ref={el => inputRefs.current[1] = el}
              onKeyDown={e => handleTab(e, 1)}
              value={despesaTemp.valor}
              type="text"
              onChange={e => {
                let value = e.target.value.replace(/[^\d]/g, "");
                if (!value) return setDespesaTemp({ ...despesaTemp, valor: "" });
                if (value.length > 9) value = value.slice(0, 9);
                let number = parseFloat(value) / 100;
                let formatted = number.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                setDespesaTemp({ ...despesaTemp, valor: formatted });
              }}
              placeholder="Valor (R$)"
              style={{
                display: "block",
                width: "100%",
                background: "#191730",
                border: "none",
                borderRadius: 7,
                color: "#fff",
                fontSize: 15,
                padding: "10px 12px 10px 42px",
                fontWeight: 600,
                outline: "none",
                height: "44px",
                margin: 0,
                boxSizing: "border-box"
              }}
              maxLength={15}
              autoComplete="off"
            />
            <span style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#bbb",
              fontSize: 16,
              pointerEvents: "none",
              fontWeight: 600
            }}>R$</span>
          </div>
          <div style={{
            display: "flex",
            gap: 10,
            marginTop: 20,
            justifyContent: "center"
          }}>
            <button
              onClick={() => { handleSalvarDespesa(editandoDespesaIdx); fecharModal(); }}
              style={{
                background: "#a780ff",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "10px 32px",
                fontWeight: 700,
                fontSize: 16,
                cursor: "pointer",
                marginRight: 8
              }}
            >Salvar</button>
            <button
              onClick={fecharModal}
              style={{
                background: "#bbb",
                color: "#222",
                border: "none",
                borderRadius: 8,
                padding: "10px 32px",
                fontSize: 16,
                fontWeight: 700
              }}
            >Cancelar</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
