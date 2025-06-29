import React, { useState, useRef, useEffect } from "react";
import Modal from "react-modal";
import { FiEdit2, FiTrash2, FiCheck, FiX } from "react-icons/fi";
import ConfirmDeleteModal from "../modals/ConfirmDeleteModal";

Modal.setAppElement("#root");

export default function DespesasFixas({
  subcategorias = [],
  setSubcategorias
}) {
  const [subcatIdx, setSubcatIdx] = useState(0);
  const [editandoSubcatIdx, setEditandoSubcatIdx] = useState(null);
  const [nomeSubcatTemp, setNomeSubcatTemp] = useState("");
  const [editandoDespesaIdx, setEditandoDespesaIdx] = useState(null);
  const [despesaTemp, setDespesaTemp] = useState({ nome: "", valor: "" });
  const inputRefs = useRef([]);
  const [modalAberto, setModalAberto] = useState(false);

  // Modal de confirmação de exclusão
  const [modalDelete, setModalDelete] = useState({ open: false, idx: null });

  // CRUD Subcategoria
  function handleAddSubcat() {
    const novas = [...subcategorias, { nome: "Nova Subcategoria", despesas: [] }];
    setSubcategorias(novas);
    setSubcatIdx(novas.length - 1);
    setEditandoSubcatIdx(novas.length - 1);
    setNomeSubcatTemp("");
  }
  function handleSalvarSubcat(idx) {
    if (!nomeSubcatTemp.trim()) return;
    const novas = [...subcategorias];
    novas[idx].nome = nomeSubcatTemp.trim();
    setSubcategorias(novas);
    setEditandoSubcatIdx(null);
    setNomeSubcatTemp("");
  }
  function handleEditarSubcat(idx) {
    setEditandoSubcatIdx(idx);
    setNomeSubcatTemp(subcategorias[idx].nome);
  }
  function handleApagarSubcat(idx) {
    const novas = [...subcategorias];
    novas.splice(idx, 1);
    setSubcategorias(novas);
    setSubcatIdx(0);
    setEditandoSubcatIdx(null);
  }

  // CRUD Despesa
  function handleAddDespesa() {
    setEditandoDespesaIdx("novo");
    setDespesaTemp({ nome: "", valor: "" });
  }
  function handleSalvarDespesa(idx) {
    if (!despesaTemp.nome.trim() || despesaTemp.valor === "") return;
    const novas = [...subcategorias];
    if (editandoDespesaIdx === "novo") {
      novas[subcatIdx].despesas.push({
        nome: despesaTemp.nome.trim(),
        valor: despesaTemp.valor
      });
    } else {
      novas[subcatIdx].despesas[idx] = {
        nome: despesaTemp.nome.trim(),
        valor: despesaTemp.valor
      };
    }
    setSubcategorias(novas);
    setEditandoDespesaIdx(null);
    setDespesaTemp({ nome: "", valor: "" });
  }
  function handleEditarDespesa(idx) {
    setEditandoDespesaIdx(idx);
    setDespesaTemp({
      nome: subcategorias[subcatIdx].despesas[idx].nome,
      valor: subcategorias[subcatIdx].despesas[idx].valor
    });
  }
  function handleExcluirDespesa(idx) {
    const novas = [...subcategorias];
    novas[subcatIdx].despesas.splice(idx, 1);
    setSubcategorias(novas);
    setEditandoDespesaIdx(null);
    setDespesaTemp({ nome: "", valor: "" });
  }

  const somaSubcat = subcat =>
    subcat?.despesas?.reduce((acc, d) => acc + (Number(String(d.valor).replace(/\./g, "").replace(",", ".")) || 0), 0) || 0;

  const formatarValor = (valor) => {
    if (!valor) return "R$ 0,00";
    return Number(String(valor).replace(/\./g, "").replace(",", ".")).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  useEffect(() => {
    setModalAberto(editandoDespesaIdx !== null);
    if (editandoDespesaIdx !== null) {
      setTimeout(() => {
        if (inputRefs.current[0]) inputRefs.current[0].focus();
      }, 100);
    }
  }, [editandoDespesaIdx]);

  function fecharModal() {
    setEditandoDespesaIdx(null);
    setModalAberto(false);
  }

  // -- ESTADO VAZIO: mostra mensagem e botão caso não tenha subcategorias --
  if (!subcategorias.length) {
    return (
      <div style={{
        margin: "70px auto",
        textAlign: "center",
        color: "#fff",
        fontSize: 22,
        fontWeight: 700
      }}>
        Nenhuma subcategoria cadastrada.<br />
        <button
          onClick={handleAddSubcat}
          style={{
            background: "#b388ff",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "14px 34px",
            fontWeight: 700,
            fontSize: 18,
            marginTop: 24,
            cursor: "pointer",
            transition: "background .2s"
          }}
        >
          + Adicionar categoria
        </button>
      </div>
    );
  }

  const subcat = subcategorias[subcatIdx];

  return (
    <div>
      {/* Título */}
      <div style={{ fontWeight: 900, fontSize: 32, marginBottom: 8, color: "#ffe060" }}>
        Despesas Fixas
      </div>

      {/* Valor total das despesas */}
      <div style={{
        fontWeight: 700,
        fontSize: 20,
        marginBottom: 18,
        color: "#b388ff"
      }}>
        Valor Total das Despesas:{" "}
        <span style={{ color: "#ffe060", fontWeight: 900 }}>
          {formatarValor(subcategorias.reduce((acc, sc) => acc + somaSubcat(sc), 0))}
        </span>
      </div>

      {/* Abas de subcategorias */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 18 }}>
        {subcategorias.map((sc, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              background: subcatIdx === i ? "#7d3cff" : "transparent",
              borderRadius: "13px 13px 0 0",
              padding: "0 18px",
              height: 41,
              fontWeight: 800,
              fontSize: 18,
              color: subcatIdx === i ? "#fff" : "#bbb",
              cursor: "pointer",
              marginRight: 10,
              borderBottom: subcatIdx === i ? "4px solid #ffe060" : "4px solid transparent",
              position: "relative",
              minWidth: 120,
              userSelect: "none"
            }}
            // Torna a aba inteira clicável para trocar de aba (exceto quando está editando o nome)
            onClick={() => {
              if (editandoSubcatIdx !== i) {
                setSubcatIdx(i);
                setEditandoDespesaIdx(null);
                setEditandoSubcatIdx(null);
              }
            }}
          >
            {editandoSubcatIdx === i ? (
              <>
                <input
                  value={nomeSubcatTemp}
                  onChange={e => setNomeSubcatTemp(e.target.value)}
                  autoFocus
                  style={{
                    padding: "2px 7px",
                    borderRadius: 5,
                    fontWeight: 700,
                    fontSize: 17,
                    border: "1.5px solid #b388ff",
                    outline: "none",
                    marginRight: 6,
                    background: "#2d2153",
                    color: "#ffe060"
                  }}
                  onKeyDown={e => {
                    if (e.key === "Enter") handleSalvarSubcat(i);
                    if (e.key === "Escape") setEditandoSubcatIdx(null);
                  }}
                  onClick={e => e.stopPropagation()}
                />
                <button
                  onClick={e => {
                    e.stopPropagation();
                    handleSalvarSubcat(i);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#ffe060",
                    fontSize: 20,
                    cursor: "pointer",
                    marginLeft: 2,
                    marginRight: 2,
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <FiCheck size={20} />
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setEditandoSubcatIdx(null);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#fff",
                    fontSize: 20,
                    cursor: "pointer",
                    marginLeft: 2,
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <FiX size={20} />
                </button>
              </>
            ) : (
              <>
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: 17,
                    color: subcatIdx === i ? "#fff" : "#bbb",
                    marginRight: 8
                  }}
                >
                  {sc.nome}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setSubcatIdx(i);
                      handleEditarSubcat(i);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#ffe060",
                      fontSize: 18,
                      cursor: "pointer",
                      padding: "2px 6px"
                    }}
                    title="Editar"
                  ><FiEdit2 size={17} /></button>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setModalDelete({ open: true, idx: i });
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#ff4e4e",
                      fontSize: 18,
                      cursor: "pointer",
                      padding: "2px 6px"
                    }}
                    title="Apagar"
                  ><FiTrash2 size={17} /></button>
                </span>
              </>
            )}
          </div>
        ))}
        <button
          onClick={handleAddSubcat}
          style={{
            background: "#b388ff",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "8px 18px",
            fontWeight: 700,
            fontSize: 17,
            marginLeft: 5,
            cursor: "pointer",
            height: 41
          }}
        >
          + Adicionar categoria
        </button>
      </div>

      {/* Card da subcategoria */}
      <div
        style={{
          background: "linear-gradient(135deg, #20184d 80%, #ffe06010 100%)",
          borderRadius: 22,
          padding: 28,
          marginTop: 0,
          marginBottom: 22,
          boxShadow: "0 10px 32px #0001",
          minWidth: 320,
          maxWidth: 700,
          border: "1.5px solid #38287a20",
          transition: "box-shadow 0.2s",
        }}
      >
        <div style={{
          fontWeight: 800,
          fontSize: 22,
          marginBottom: 18,
          color: "#ffe060",
          letterSpacing: 0.7,
          textShadow: "0 2px 12px #000a"
        }}>
          {subcat?.nome}
        </div>
        <table style={{
          width: "100%",
          color: "#f7f7fa",
          borderCollapse: "separate",
          borderSpacing: 0,
          fontSize: 16,
        }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "8px 10px", fontWeight: 700, letterSpacing: 0.5, borderBottom: "2.5px solid #2c235c" }}>Nome</th>
              <th style={{ textAlign: "right", padding: "8px 10px", fontWeight: 700, minWidth: 120, borderBottom: "2.5px solid #2c235c" }}>Valor (R$)</th>
              <th style={{ textAlign: "center", padding: "8px 10px", fontWeight: 700, minWidth: 120, borderBottom: "2.5px solid #2c235c" }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {subcat?.despesas?.length === 0 && (
              <tr>
                <td colSpan={3} style={{ color: "#aaa", textAlign: "center", padding: 32, fontSize: 17 }}>
                  Nenhum custo cadastrado.<br />
                  Clique em <b>Adicionar custo</b> para começar.
                </td>
              </tr>
            )}
            {subcat?.despesas?.map((custo, idx) => (
              <tr
                key={idx}
                style={{
                  borderBottom: "1px solid #34296a50",
                  background: idx % 2 === 0 ? "#251e4a60" : "transparent",
                  transition: "background .2s"
                }}
              >
                <td style={{
                  padding: "12px 10px",
                  maxWidth: 320,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  wordBreak: "break-word"
                }}>
                  {custo.nome}
                </td>
                <td style={{ padding: "12px 10px", textAlign: "right", fontWeight: 700, color: "#b388ff" }}>
                  {formatarValor(custo.valor)}
                </td>
                <td style={{ padding: "12px 10px", textAlign: "center" }}>
                  <button
                    onClick={() => handleEditarDespesa(idx)}
                    title="Editar"
                    style={{
                      color: "#fff",
                      background: "transparent",
                      border: "none",
                      borderRadius: 6,
                      padding: "7px 10px",
                      marginRight: 6,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontSize: 18,
                      transition: "background .2s",
                      outline: "none"
                    }}
                  >
                    <FiEdit2 size={19} color="#ffe060" />
                  </button>
                  <button
                    onClick={() => handleExcluirDespesa(idx)}
                    title="Excluir"
                    style={{
                      color: "#fff",
                      background: "transparent",
                      border: "none",
                      borderRadius: 6,
                      padding: "7px 10px",
                      fontWeight: 700,
                      fontSize: 18,
                      cursor: "pointer",
                      transition: "background .2s",
                      outline: "none"
                    }}
                  >
                    <FiTrash2 size={19} color="#ff7c7c" />
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
              background: "linear-gradient(90deg, #a780ff 60%, #ffe060 140%)",
              color: "#251e4a",
              border: "none",
              borderRadius: 12,
              padding: "13px 34px",
              fontWeight: 800,
              fontSize: 17,
              cursor: "pointer",
              boxShadow: "0 2px 12px #0002",
              transition: "background .2s, color .2s"
            }}
            onMouseOver={e => e.currentTarget.style.background = "linear-gradient(90deg, #bfa7ff 50%, #ffe060 110%)"}
            onMouseOut={e => e.currentTarget.style.background = "linear-gradient(90deg, #a780ff 60%, #ffe060 140%)"}
          >
            + Adicionar custo
          </button>
        </div>
        <div style={{
          marginTop: 28,
          textAlign: "right",
        }}>
          <span style={{
            display: "inline-block",
            background: "linear-gradient(90deg, #ffe060 60%, #b388ff 180%)",
            color: "#251e4a",
            borderRadius: 40,
            padding: "8px 28px",
            fontWeight: 900,
            fontSize: 20,
            boxShadow: "0 1px 4px #0001",
            letterSpacing: 1,
          }}>
            Total: {formatarValor(somaSubcat(subcat))}
          </span>
        </div>
      </div>

      {/* Modal de adicionar/editar custo */}
      <Modal
        isOpen={modalAberto}
        onRequestClose={fecharModal}
        contentLabel={editandoDespesaIdx === "novo" ? "Adicionar Custo" : "Editar Custo"}
        style={{
          overlay: { backgroundColor: "rgba(16,11,40,0.55)", backdropFilter: "blur(2px)", zIndex: 1000, transition: "background .25s" },
          content: {
            zIndex: 1100,
            top: "50%", left: "50%", right: "auto", bottom: "auto",
            marginRight: "-50%", transform: "translate(-50%, -50%)",
            background: "linear-gradient(135deg, #241d39 80%, #ffe06020 100%)",
            color: "#fff", borderRadius: 18,
            padding: 40, minWidth: 360, maxWidth: 440, border: "1.5px solid #3e2464",
            boxShadow: "0 11px 36px #0005",
            display: "flex", flexDirection: "column", gap: 0,
            overflow: "visible",
            transition: "box-shadow 0.2s"
          }
        }}
        shouldCloseOnOverlayClick={true}
      >
        <h2 style={{
          marginBottom: 24,
          fontWeight: 900,
          fontSize: 25,
          textAlign: "left",
          color: "#ffe060",
          letterSpacing: 1.1,
          textShadow: "0 2px 9px #0008"
        }}>
          {editandoDespesaIdx === "novo" ? "Adicionar Custo" : "Editar Custo"}
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <input
            ref={el => inputRefs.current[0] = el}
            value={despesaTemp.nome}
            onChange={e => setDespesaTemp({ ...despesaTemp, nome: e.target.value })}
            placeholder="Nome do custo"
            style={{
              display: "block",
              width: "100%",
              background: "#191730",
              border: "1.5px solid #3e246440",
              borderRadius: 8,
              color: "#ffe060",
              fontSize: 16,
              padding: "13px 15px",
              fontWeight: 700,
              outline: "none",
              boxSizing: "border-box",
              transition: "border-color 0.2s",
              marginBottom: 2,
              letterSpacing: 0.2
            }}
            maxLength={60}
            autoFocus
            onFocus={e => e.target.style.borderColor = "#ffe060"}
            onBlur={e => e.target.style.borderColor = "#3e246440"}
          />
          <div style={{ position: "relative" }}>
            <input
              ref={el => inputRefs.current[1] = el}
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
                border: "1.5px solid #3e246440",
                borderRadius: 8,
                color: "#ffe060",
                fontSize: 16,
                padding: "13px 15px 13px 48px",
                fontWeight: 700,
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.2s"
              }}
              maxLength={15}
              autoComplete="off"
              onFocus={e => e.target.style.borderColor = "#ffe060"}
              onBlur={e => e.target.style.borderColor = "#3e246440"}
            />
            <span style={{
              position: "absolute",
              left: 15,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#ffe060b9",
              fontSize: 18,
              pointerEvents: "none",
              fontWeight: 800,
              letterSpacing: 1
            }}>R$</span>
          </div>
          <div style={{
            display: "flex",
            gap: 10,
            marginTop: 30,
            justifyContent: "center"
          }}>
            <button
              onClick={() => { handleSalvarDespesa(editandoDespesaIdx); fecharModal(); }}
              style={{
                background: "linear-gradient(90deg, #a780ff 50%, #ffe060 110%)",
                color: "#251e4a",
                border: "none",
                borderRadius: 9,
                padding: "12px 38px",
                fontWeight: 900,
                fontSize: 17,
                cursor: "pointer",
                marginRight: 8,
                boxShadow: "0 2px 8px #0002",
                transition: "background .2s, color .2s",
                display: "flex",
                alignItems: "center",
                gap: 7,
              }}
              onMouseOver={e => e.currentTarget.style.background = "linear-gradient(90deg, #bfa7ff 50%, #ffe060 110%)"}
              onMouseOut={e => e.currentTarget.style.background = "linear-gradient(90deg, #a780ff 50%, #ffe060 110%)"}
            >
              <FiCheck size={21} />
              Salvar
            </button>
            <button
              onClick={fecharModal}
              style={{
                background: "#fff",
                color: "#251e4a",
                border: "none",
                borderRadius: 9,
                padding: "12px 38px",
                fontSize: 17,
                fontWeight: 900,
                boxShadow: "0 2px 8px #0001",
                display: "flex",
                alignItems: "center",
                gap: 7
              }}
            >
              <FiX size={21} />
              Cancelar
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de confirmação de exclusão de subcategoria */}
      <ConfirmDeleteModal
        isOpen={modalDelete.open}
        onRequestClose={() => setModalDelete({ open: false, idx: null })}
        onConfirm={() => {
          if (modalDelete.idx !== null) handleApagarSubcat(modalDelete.idx);
          setModalDelete({ open: false, idx: null });
        }}
        itemLabel="subcategoria"
      />
    </div>
  );
}