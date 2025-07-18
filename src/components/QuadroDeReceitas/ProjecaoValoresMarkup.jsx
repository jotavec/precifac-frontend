// ============== COMPONENTE PROJEÇÃO DE VALORES & MARKUP ==============
import React, { useState } from "react";
import "./ProjecaoValoresMarkup.css";

function ProjecaoValoresMarkup({ nome, onPrecoVendaChange, custoUnitario }) {
  // Estado para valor desejado de venda
  const [precoVenda, setPrecoVenda] = useState("");
  // Estados para os campos de markup
  const [markupCategoria, setMarkupCategoria] = useState("");
  const [markupFinal, setMarkupFinal] = useState("");
  const [sugestaoPreco, setSugestaoPreco] = useState("");

  // Novos estados para desconto e preço com desconto
  const [descontoReais, setDescontoReais] = useState("");
  const [descontoPercentual, setDescontoPercentual] = useState("");
  const [precoComDesconto, setPrecoComDesconto] = useState("");

  // Função utilitária para transformar R$ em número
  function parseBRL(valor) {
    if (typeof valor === "number") return valor;
    if (!valor) return 0;
    return Number(
      String(valor)
        .replace("R$", "")
        .replace(/\s/g, "")
        .replace(/\./g, "")
        .replace(",", ".")
    );
  }

  // Calcula preço com desconto sempre que preço, desconto em R$ ou % mudar
  React.useEffect(() => {
    const valorVenda = parseBRL(precoVenda);

    let resultado = valorVenda;

    if (descontoReais && parseBRL(descontoReais) > 0) {
      resultado = valorVenda - parseBRL(descontoReais);
    } else if (descontoPercentual && Number(descontoPercentual) > 0) {
      resultado = valorVenda - (valorVenda * (Number(descontoPercentual) / 100));
    }

    // Não deixa negativo
    if (resultado < 0) resultado = 0;

    setPrecoComDesconto(
      resultado > 0
        ? resultado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
        : "R$ 0,00"
    );
  }, [precoVenda, descontoReais, descontoPercentual]);

  return (
    <div className="painel-projecao-valores-markup">
      <h2 className="painel-projecao-titulo">
        Projeção de Valores & Markup
      </h2>

      <div className="preco-venda-container">
        <span className="preco-venda-label">
          Preço de Venda (R$/un.)
        </span>
        <input
          type="text"
          className="preco-venda-input"
          placeholder="R$ 30,00"
          value={precoVenda}
          onChange={e => {
            setPrecoVenda(e.target.value);
            if (typeof onPrecoVendaChange === "function") {
              onPrecoVendaChange(e.target.value);
            }
          }}
        />

        {/* Bloco do simulador de desconto */}
        <div style={{
          marginTop: 18,
          background: "#271a41",
          borderRadius: 12,
          boxShadow: "0 0 18px #00f5ff33",
          padding: "16px 10px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
          minWidth: 0
        }}>
          <div style={{
            fontWeight: 800,
            fontSize: "1.11rem",
            color: "#ffe066",
            marginBottom: 5,
            letterSpacing: 0.5
          }}>
            Simulador de Desconto
          </div>
          <div style={{ display: "flex", gap: 10, width: "100%", justifyContent: "center" }}>
            <input
              type="text"
              placeholder="Valor (R$)"
              style={{
                fontSize: "1.01rem",
                fontWeight: 700,
                borderRadius: 10,
                background: "#1a1532",
                color: "#fff",
                border: "2px solid #73ffff44",
                boxShadow: "0 0 5px #00f5ff44",
                outline: "none",
                width: 100,
                textAlign: "center"
              }}
              value={descontoReais}
              onChange={e => {
                setDescontoReais(e.target.value);
                setDescontoPercentual(""); // Limpa o outro campo
              }}
            />
            <input
              type="text"
              placeholder="%"
              style={{
                fontSize: "1.01rem",
                fontWeight: 700,
                borderRadius: 10,
                background: "#1a1532",
                color: "#fff",
                border: "2px solid #73ffff44",
                boxShadow: "0 0 5px #00f5ff44",
                outline: "none",
                width: 60,
                textAlign: "center"
              }}
              value={descontoPercentual}
              onChange={e => {
                setDescontoPercentual(e.target.value);
                setDescontoReais(""); // Limpa o outro campo
              }}
            />
          </div>

          {/* Valor final com desconto */}
          <div style={{
            marginTop: 10,
            color: "#fff",
            fontWeight: 700,
            fontSize: "1.13rem",
            letterSpacing: 0.4
          }}>
            Valor com desconto: <span style={{ color: "#ffe066", fontWeight: 900 }}>{precoComDesconto}</span>
          </div>
        </div>
      </div>

      {/* BLOCO ÚNICO: Inputs + Tabela */}
      <div className="bloco-markup-completo">
        {/* Inputs do Markup */}
        <div className="painel-markup-row">
          <div className="painel-markup-col">
            <label className="painel-markup-label">
              Markup {nome ? nome : "da Categoria"}
            </label>
            <input
              className="painel-input-unico"
              type="text"
              placeholder="Ex: 2,30"
              value={markupCategoria}
              onChange={e => setMarkupCategoria(e.target.value)}
            />
          </div>
          <div className="painel-markup-col">
            <label className="painel-markup-label">Markup Final</label>
            <input
              className="painel-input-unico"
              type="text"
              placeholder="Ex: 2,15"
              value={markupFinal}
              onChange={e => setMarkupFinal(e.target.value)}
            />
          </div>
          <div className="painel-markup-col">
            <label className="painel-markup-label">Sugestão de Preço</label>
            <input
              className="painel-input-unico"
              type="text"
              placeholder="R$ 00,00"
              value={sugestaoPreco}
              onChange={e => setSugestaoPreco(e.target.value)}
            />
          </div>
        </div>

        {/* Tabela de Receitas */}
        <table className="tabela-resumo-projecao">
          <thead>
            <tr>
              <th>Receitas</th>
              <th>Valor</th>
              <th>%</th>
            </tr>
          </thead>
          <tbody>
            {/* Linha 1: Lucro Bruto (un.): */}
            <tr>
              <td>Lucro Bruto (un.):</td>
              <td>R$ 0,00</td>
              <td>0%</td>
            </tr>

            {/* Linha 2: Lucro Líq. Esperado (un.): */}
            <tr>
              <td>Lucro Líq. Esperado (un.):</td>
              <td>R$ 0,00</td>
              <td>0%</td>
            </tr>

            {/* Linha 3: Faturamento Bruto (total): */}
            <tr className="linha-faturamento">
              <td>Faturamento Bruto (total):</td>
              <td>R$ 0,00</td>
              <td>0%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProjecaoValoresMarkup;
