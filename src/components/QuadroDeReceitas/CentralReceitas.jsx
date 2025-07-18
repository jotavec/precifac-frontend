import React, { useState } from "react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import AbaGeralReceita from "./AbaGeralReceita";
import AbaComposicaoReceita from "./AbaComposicaoReceita";
// Se quiser mais abas, só importar e adicionar no array ABAS

const receitasFake = [
  {
    id: 1,
    nomeProduto: "Bolo de Cenoura",
    tipoProduto: "Artesanal",
    categoriaMarkup: "Bolos",
    maoObraDireta: "R$ 8,50",
    custoMateriaPrima: "R$ 12,00",
    margemContribuicaoReais: "R$ 10,00",
    margemContribuicaoPorcent: "30%",
    lucroLiquido: "R$ 7,00",
    precoVenda: "R$ 29,99",
    numeroFicha: "001"
  }
];

// Array das abas do modal
const ABAS = [
  { label: "Composição", componente: AbaComposicaoReceita },
  // Exemplo: { label: "Conservação", componente: AbaConservacaoReceita },
  { label: "Geral", componente: AbaGeralReceita },
];

export default function CentralReceitas() {
  const [receitas, setReceitas] = useState(receitasFake);
  const [modalOpen, setModalOpen] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState(0);
  const [nome, setNome] = useState("");

  function handleEditar(receita) {
    alert(`Editar receita: ${receita.nomeProduto}`);
  }
  function handleApagar(id) {
    if (window.confirm("Tem certeza que deseja apagar esta receita?")) {
      setReceitas(receitas.filter(r => r.id !== id));
    }
  }
  function handleCadastrar() {
    setModalOpen(true);
    setAbaAtiva(0);
    setNome("");
  }
  function handleSalvarNova() {
    if (!nome.trim()) return;
    const nova = {
      id: Date.now(),
      nomeProduto: nome,
      tipoProduto: "Artesanal",
      categoriaMarkup: "Bolos",
      maoObraDireta: "R$ 0,00",
      custoMateriaPrima: "R$ 0,00",
      margemContribuicaoReais: "R$ 0,00",
      margemContribuicaoPorcent: "0%",
      lucroLiquido: "R$ 0,00",
      precoVenda: "R$ 0,00",
      numeroFicha: "??"
    };
    setReceitas([nova, ...receitas]);
    setModalOpen(false);
  }

  // Renderizar componente da aba ativa:
  const AbaComp = ABAS[abaAtiva].componente;

  return (
    <div style={{
      padding: "42px 0 0 0",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      background: "none"
    }}>
      <h1 style={{
        color: "#ffe066",
        fontWeight: 900,
        fontSize: "2.5rem",
        marginBottom: 8,
        letterSpacing: 1,
        textAlign: "left",
        width: "90%",
        maxWidth: 1700
      }}>
        Central de Receitas
      </h1>
      <p style={{
        color: "#ffe066cc",
        marginBottom: 32,
        width: "90%",
        maxWidth: 1700,
        textAlign: "left"
      }}>
        Aqui ficará a listagem, edição e consulta das receitas cadastradas.
      </p>

      {/* Botão de cadastrar */}
      <div style={{
        width: "100%",
        maxWidth: 1700,
        display: "flex",
        justifyContent: "flex-end",
        marginBottom: 18
      }}>
        <button
          onClick={handleCadastrar}
          style={{
            background: "linear-gradient(90deg, #a17ff5 60%, #73f7ff 100%)",
            color: "#fff",
            fontWeight: 800,
            fontSize: "1.13rem",
            border: "none",
            borderRadius: 14,
            padding: "13px 34px 13px 22px",
            boxShadow: "0 0 20px #00f5ff55, 0 2px 16px #14083244",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 14,
            transition: "filter .16s"
          }}
        >
          <FaPlus /> Nova Receita
        </button>
      </div>

      {/* TABELA */}
      <div style={{
        width: "100%",
        maxWidth: 1700,
        background: "#1b1530",
        borderRadius: 18,
        boxShadow: "0 8px 40px #0008, 0 1.5px 1.5px #160d3866",
        padding: "0 0 6px 0",
        marginTop: 6
      }}>
        <table style={{
          width: "100%",
          borderCollapse: "separate",
          borderSpacing: 0,
          fontSize: "1.09rem",
          margin: 0
        }}>
          <thead>
            <tr>
              <th style={thEstilo}>Nome do Produto</th>
              <th style={thEstilo}>Tipo do Produto</th>
              <th style={thEstilo}>Categoria Markup</th>
              <th style={thEstilo}>Mão de Obra Direta</th>
              <th style={thEstilo}>Custo de Matéria-Prima</th>
              <th style={thEstilo}>R$ Margem de Contribuição</th>
              <th style={thEstilo}>% Margem de Contribuição</th>
              <th style={thEstilo}>Lucro Líquido Esperado (un.)</th>
              <th style={thEstilo}>Preço de Venda (un.)</th>
              <th style={thEstilo}>Nº Ficha</th>
              <th style={thEstiloAcoes}>Editar</th>
              <th style={thEstiloAcoes}>Apagar</th>
            </tr>
          </thead>
          <tbody>
            {receitas.length === 0 ? (
              <tr>
                <td colSpan={12} style={{
                  color: "#fff",
                  textAlign: "center",
                  padding: "38px 0",
                  fontSize: "1.19rem"
                }}>
                  Nenhuma receita cadastrada.
                </td>
              </tr>
            ) : receitas.map(receita => (
              <tr key={receita.id} style={{
                borderBottom: "1.5px solid #342154",
                transition: "background .18s"
              }}>
                <td style={tdEstilo}>{receita.nomeProduto}</td>
                <td style={tdEstilo}>{receita.tipoProduto}</td>
                <td style={tdEstilo}>{receita.categoriaMarkup}</td>
                <td style={tdEstilo}>{receita.maoObraDireta}</td>
                <td style={tdEstilo}>{receita.custoMateriaPrima}</td>
                <td style={tdEstilo}>{receita.margemContribuicaoReais}</td>
                <td style={tdEstilo}>{receita.margemContribuicaoPorcent}</td>
                <td style={tdEstilo}>{receita.lucroLiquido}</td>
                <td style={tdEstilo}>{receita.precoVenda}</td>
                <td style={tdEstilo}>{receita.numeroFicha}</td>
                <td style={{ ...tdEstilo, textAlign: "center" }}>
                  <button
                    onClick={() => handleEditar(receita)}
                    style={btnAcaoEstilo}
                    title="Editar"
                  >
                    <FaEdit />
                  </button>
                </td>
                <td style={{ ...tdEstilo, textAlign: "center" }}>
                  <button
                    onClick={() => handleApagar(receita.id)}
                    style={{ ...btnAcaoEstilo, color: "#ff5e5e" }}
                    title="Apagar"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL COM ABAS */}
      {modalOpen && (
        <div style={{
          position: "fixed",
          zIndex: 99,
          left: 0, top: 0, width: "100vw", height: "100vh",
          background: "rgba(10,8,24,0.88)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <div
            style={{
              width: "92vw",
              maxWidth: 1700,
              height: "850px", // <-- Altura fixa! Troque esse valor se quiser mais ou menos altura
              background: "#21163b",
              borderRadius: 22,
              padding: "0 0 24px 0",
              boxShadow: "0 8px 60px #1b0c4888",
              display: "flex",
              flexDirection: "column"
            }}
          >
            {/* ABAS NO TOPO */}
            <div style={{
              display: "flex", flexDirection: "row", alignItems: "center",
              height: 58, borderTopLeftRadius: 22, borderTopRightRadius: 22,
              background: "#170e27"
            }}>
              {ABAS.map((aba, idx) => (
                <div
                  key={aba.label}
                  onClick={() => setAbaAtiva(idx)}
                  style={{
                    padding: "0 38px",
                    height: 58,
                    display: "flex",
                    alignItems: "center",
                    fontWeight: 900,
                    fontSize: 20,
                    color: abaAtiva === idx ? "#ffe066" : "#aaa",
                    cursor: "pointer",
                    borderTopLeftRadius: idx === 0 ? 18 : 0,
                    borderTopRightRadius: idx === ABAS.length - 1 ? 18 : 0,
                    background: abaAtiva === idx ? "#21163b" : "#170e27",
                    boxShadow: abaAtiva === idx ? "0 2px 12px #0007" : "none",
                    borderBottom: abaAtiva === idx ? "4px solid #ffe066" : "4px solid transparent",
                    transition: "all .13s"
                  }}
                >
                  {aba.label}
                </div>
              ))}
            </div>

            {/* CONTEÚDO DA ABA ATIVA */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "32px 38px 12px 38px",
                minHeight: 0,
                height: "100%"
              }}
              className="custom-scrollbar"
            >
              <AbaComp nome={nome} setNome={setNome} />
            </div>

            {/* BOTÕES */}
            <div style={{ display: "flex", gap: 24, justifyContent: "flex-end", margin: "0 40px" }}>
              <button
                onClick={() => setModalOpen(false)}
                style={{
                  background: "#27213f",
                  color: "#ffe066",
                  fontWeight: 700,
                  fontSize: "1.08rem",
                  border: "none",
                  borderRadius: 9,
                  padding: "12px 28px",
                  cursor: "pointer"
                }}
              >Cancelar</button>
              <button
                onClick={handleSalvarNova}
                style={{
                  background: "linear-gradient(90deg,#a17ff5 60%,#73f7ff 100%)",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: "1.11rem",
                  border: "none",
                  borderRadius: 9,
                  padding: "12px 38px",
                  cursor: "pointer"
                }}
              >Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const thEstilo = {
  padding: "16px 10px 14px 10px",
  fontWeight: 800,
  color: "#2c1a3b",
  background: "#b59ef9",
  textAlign: "center",
  fontSize: "1.12rem",
  border: "none",
  borderTopLeftRadius: 13,
  borderTopRightRadius: 13,
  letterSpacing: ".04em"
};
const thEstiloAcoes = {
  ...thEstilo,
  minWidth: 64,
  width: 64,
  textAlign: "center",
  borderTopLeftRadius: 0,
  borderTopRightRadius: 0
};
const tdEstilo = {
  padding: "15px 10px",
  color: "#fff",
  fontWeight: 500,
  background: "none",
  textAlign: "center",
  fontSize: "1.08rem"
};
const btnAcaoEstilo = {
  background: "none",
  border: "none",
  color: "#ffe066",
  fontSize: "1.24rem",
  cursor: "pointer",
  padding: 6,
  borderRadius: 8,
  transition: "filter .14s, background .14s",
  filter: "brightness(0.92)"
};
