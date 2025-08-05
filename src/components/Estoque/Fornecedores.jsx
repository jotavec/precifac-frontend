import React, { useState, useEffect } from "react";
import ModalCadastroFornecedor from "./ModalCadastroFornecedor";
import "./Fornecedores.css";

export default function Fornecedores() {
  const [modalAberto, setModalAberto] = useState(false);
  const [editandoIdx, setEditandoIdx] = useState(null);
  const [fornecedores, setFornecedores] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [confirmExcluirIdx, setConfirmExcluirIdx] = useState(null);

  const API = "/api/fornecedores";

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

  return (
    <div className="fornecedores-main">

      {/* HEADER EM LINHA: TÍTULO À ESQUERDA, BOTÃO À DIREITA */}
      <div className="fornecedores-header-row">
        <h2 className="fornecedores-titulo">Fornecedores</h2>
        <button
          className="fornecedores-novo-btn"
          onClick={() => setModalAberto(true)}
          onMouseOver={e => e.currentTarget.style.filter = "brightness(1.09)"}
          onMouseOut={e => e.currentTarget.style.filter = ""}
        >
          + Novo Fornecedor
        </button>
      </div>

      <div className="fornecedores-lista-box">
        {carregando ? (
          <div className="fornecedores-lista-vazia">Carregando...</div>
        ) : fornecedores.length === 0 ? (
          <div className="fornecedores-lista-vazia">
            Nenhum fornecedor cadastrado ainda.
          </div>
        ) : (
          <table className="fornecedores-table">
            <thead>
              <tr>
                <th className="fornecedores-th">Razão Social</th>
                <th className="fornecedores-th">CNPJ/CPF</th>
                <th className="fornecedores-th">Nome do vendedor</th>
                <th className="fornecedores-th">Telefone</th>
                <th className="fornecedores-th">Ações</th>
              </tr>
            </thead>
            <tbody>
              {fornecedores.map((f, idx) => (
                <tr key={f.id}>
                  <td className="fornecedores-td">{f.razaoSocial}</td>
                  <td className="fornecedores-td">{f.cnpjCpf}</td>
                  <td className="fornecedores-td">{f.nomeVendedor}</td>
                  <td className="fornecedores-td">{f.telefone}</td>
                  <td className="fornecedores-td">
                    <button
                      className="fornecedores-edit-btn"
                      onClick={() => handleEditar(idx)}
                      onMouseOver={e => e.currentTarget.style.filter = "brightness(1.12)"}
                      onMouseOut={e => e.currentTarget.style.filter = ""}
                    >
                      Editar
                    </button>
                    <button
                      className="fornecedores-del-btn"
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
        <div className="fornecedores-overlay">
          <div className="fornecedores-confirm-modal">
            <div style={{ fontWeight: 700, fontSize: "1.15rem", marginBottom: 18, color: "#2196f3" }}>
              Tem certeza que deseja excluir este fornecedor?
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                onClick={() => excluirFornecedor(confirmExcluirIdx)}
                className="fornecedores-del-btn"
                style={{
                  minWidth: 88,
                  background: "#d72a5d",
                  color: "#fff",
                }}
              >
                Sim, excluir
              </button>
              <button
                onClick={() => setConfirmExcluirIdx(null)}
                className="fornecedores-edit-btn"
                style={{
                  minWidth: 88,
                  background: "#23244b",
                  color: "#2196f3",
                  border: "1.4px solid #2196f3",
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
        <div className="fornecedores-modal-overlay">
          <div className="fornecedores-modal-box">
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
