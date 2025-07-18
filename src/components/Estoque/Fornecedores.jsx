import React, { useState, useEffect } from "react";
import ModalCadastroFornecedor from "./ModalCadastroFornecedor"; // IMPORTA O MODAL!

export default function Fornecedores() {
  const [modalAberto, setModalAberto] = useState(false);
  const [editandoIdx, setEditandoIdx] = useState(null);
  const [fornecedores, setFornecedores] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [confirmExcluirIdx, setConfirmExcluirIdx] = useState(null);

  const API = "/api/fornecedores";

  // Buscar fornecedores
  useEffect(() => {
    fetch(API, { credentials: "include" })
      .then(res => {
        if (!res.ok) throw new Error("Não autorizado ou erro no backend");
        return res.json();
      })
      .then(setFornecedores)
      .catch(() => setFornecedores([]))
      .finally(() => setCarregando(false));
  }, []);

  // Adicionar fornecedor
  async function adicionarFornecedor(dados) {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(dados),
    });
    if (res.ok) {
      const novo = await res.json();
      setFornecedores(prev => [novo, ...prev]);
    } else {
      alert("Erro ao cadastrar fornecedor. Faça login ou tente novamente.");
    }
  }

  // Atualizar fornecedor
  async function atualizarFornecedor(idx, dados) {
    const id = fornecedores[idx].id;
    const res = await fetch(`${API}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(dados),
    });
    if (res.ok) {
      const atualizado = await res.json();
      setFornecedores(forns =>
        forns.map((f, i) => (i === idx ? atualizado : f))
      );
    } else {
      alert("Erro ao editar fornecedor.");
    }
  }

  // Excluir fornecedor
  async function excluirFornecedor(idx) {
    const id = fornecedores[idx].id;
    const res = await fetch(`${API}/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok || res.status === 204) {
      setFornecedores(forns => forns.filter((_, i) => i !== idx));
      setConfirmExcluirIdx(null);
    } else {
      alert("Erro ao excluir fornecedor.");
    }
  }

  function handleSalvar(dados) {
    if (editandoIdx !== null) {
      return atualizarFornecedor(editandoIdx, dados);
    } else {
      return adicionarFornecedor(dados);
    }
  }

  function handleEditar(idx) {
    setEditandoIdx(idx);
    setModalAberto(true);
  }

  function handleFecharModal() {
    setModalAberto(false);
    setEditandoIdx(null);
  }

  // --- ESTILOS DA TABELA, BOTÕES E MODAIS ---
  const cadastroMain = {
    padding: "32px 6vw",
    minHeight: "100vh",
    background: "linear-gradient(120deg,#1a1332 70%,#25184b 120%)",
  };
  const cadastroTitulo = {
    color: "#ffe066",
    fontSize: "2.2rem",
    fontWeight: 900,
    marginBottom: 28,
    letterSpacing: "0.5px",
  };
  const novoBtn = {
    background: "linear-gradient(90deg, #7c3aed 80%, #ffe066 120%)",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "13px 32px",
    fontWeight: 700,
    fontSize: "1.1rem",
    marginBottom: 32,
    cursor: "pointer",
    boxShadow: "0 2px 9px #00000038",
    letterSpacing: ".3px",
    marginLeft: 2,
    transition: "filter .18s",
  };
  const listaBox = {
    background: "#27144699",
    borderRadius: 16,
    minHeight: 140,
    padding: 18,
    boxShadow: "0 2px 18px #00000014",
  };
  const listaVazia = {
    color: "#ffe06699",
    fontWeight: 500,
    fontSize: "1.13rem",
    textAlign: "center",
    margin: 12,
  };
  const tabela = {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: "0 5px",
    marginTop: 12,
  };
  const th = {
    color: "#ffe066",
    fontWeight: 700,
    fontSize: "1.07rem",
    padding: "7px 5px",
    background: "#25184b",
    borderRadius: 7,
    textAlign: "left",
  };
  const td = {
    color: "#fff9",
    padding: "6px 5px",
    verticalAlign: "middle",
    fontWeight: 400,
    background: "none",
    borderBottom: "1.5px solid #b388ff22",
  };
  const editBtn = {
    background: "#ffe066",
    color: "#2b184c",
    fontWeight: 800,
    border: "none",
    borderRadius: 7,
    padding: "7px 20px",
    cursor: "pointer",
    fontSize: "1rem",
    marginRight: 6,
    boxShadow: "0 1px 6px #b388ff33",
    transition: "filter .16s",
  };
  const delBtn = {
    background: "#fc7474",
    color: "#fff",
    fontWeight: 800,
    border: "none",
    borderRadius: 7,
    padding: "7px 16px",
    cursor: "pointer",
    fontSize: "1rem",
    boxShadow: "0 1px 6px #fc747433",
    marginLeft: 2,
    transition: "filter .16s",
  };
  const modalOverlay = {
    position: "fixed",
    inset: 0,
    background: "rgba(30, 30, 60, 0.58)",
    backdropFilter: "blur(4px)",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    animation: "fadeIn .22s",
  };
  const modalBox = {
    background: "rgba(40, 40, 60, 0.98)",
    borderRadius: 22,
    boxShadow: "0 8px 38px 0 rgba(36, 11, 54, 0.28)",
    padding: "0 0 18px 0",
    minWidth: 390,
    maxWidth: "96vw",
    color: "#f4f4fa",
    position: "relative",
    border: "1.5px solid #7a48ff33",
    animation: "fadeIn .18s",
  };
  const confirmModal = {
    background: "#24133a",
    color: "#ffe066",
    borderRadius: 16,
    padding: "38px 26px 18px 26px",
    minWidth: 290,
    boxShadow: "0 2px 26px #00000033",
    textAlign: "center",
    zIndex: 2001,
  };
  const overlay = {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 5, 28, 0.72)",
    zIndex: 2000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  };

  return (
    <div style={cadastroMain}>
      <h2 style={cadastroTitulo}>Fornecedores</h2>
      <button
        onClick={() => setModalAberto(true)}
        style={novoBtn}
        onMouseOver={e => e.currentTarget.style.filter = "brightness(1.09)"}
        onMouseOut={e => e.currentTarget.style.filter = ""}
      >
        + Novo Fornecedor
      </button>

      <div style={listaBox}>
        {carregando ? (
          <div style={listaVazia}>Carregando...</div>
        ) : fornecedores.length === 0 ? (
          <div style={listaVazia}>
            Nenhum fornecedor cadastrado ainda.
          </div>
        ) : (
          <table style={tabela}>
            <thead>
              <tr>
                <th style={th}>Razão Social</th>
                <th style={th}>CNPJ/CPF</th>
                <th style={th}>Nome do vendedor</th>
                <th style={th}>Telefone</th>
                <th style={th}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {fornecedores.map((f, idx) => (
                <tr key={f.id}>
                  <td style={td}>{f.razaoSocial}</td>
                  <td style={td}>{f.cnpjCpf}</td>
                  <td style={td}>{f.nomeVendedor}</td>
                  <td style={td}>{f.telefone}</td>
                  <td style={td}>
                    <button
                      style={editBtn}
                      onClick={() => handleEditar(idx)}
                      onMouseOver={e => e.currentTarget.style.filter = "brightness(1.12)"}
                      onMouseOut={e => e.currentTarget.style.filter = ""}
                    >
                      Editar
                    </button>
                    <button
                      style={delBtn}
                      onClick={() => setConfirmExcluirIdx(idx)}
                      onMouseOver={e => e.currentTarget.style.filter = "brightness(1.09)"}
                      onMouseOut={e => e.currentTarget.style.filter = ""}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {confirmExcluirIdx !== null && (
        <div style={overlay}>
          <div style={confirmModal}>
            <div style={{ fontWeight: 700, fontSize: "1.15rem", marginBottom: 18 }}>
              Tem certeza que deseja excluir este fornecedor?
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                onClick={() => excluirFornecedor(confirmExcluirIdx)}
                style={{
                  ...delBtn,
                  minWidth: 88,
                  background: "#d72a5d",
                  color: "#fff",
                }}
              >
                Sim, excluir
              </button>
              <button
                onClick={() => setConfirmExcluirIdx(null)}
                style={{
                  ...editBtn,
                  minWidth: 88,
                  background: "#25184b",
                  color: "#ffe066",
                  border: "1.4px solid #b388ff",
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE FORMULÁRIO */}
      {modalAberto && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <ModalCadastroFornecedor
              onSave={handleSalvar}
              onClose={handleFecharModal}
              dadosIniciais={
                editandoIdx !== null ? fornecedores[editandoIdx] : {}
              }
              editando={editandoIdx !== null}
            />
          </div>
        </div>
      )}
    </div>
  );
}
