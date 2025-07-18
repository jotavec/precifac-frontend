import React from "react";
import "./ProjecaoValoresMarkup.css";

// Utilitário para converter BRL em número
function parseBRL(str) {
  if (typeof str === "number") return str;
  if (!str) return 0;
  return Number(
    String(str)
      .replace("R$", "")
      .replace(/\s/g, "")
      .replace(/\./g, "")
      .replace(",", ".")
  );
}

// Componente principal
function BlocoResumoMarkup({
  nome,
  markup,
  custoUnitario,
  precoVenda,
  rendimentoNumero,
  blocosMarkupPorNome,
  gastosFaturamento = 0,
  impostos = 0,
  taxas = 0,
  comissoes = 0,
  outros = 0,
  taxaExtra = 0,
  totalEncargosReais = 0, // <-- recebe o valor do total enviado do backend!
}) {
  // Converte markup/categoria
  let valorMarkupCategoria = blocosMarkupPorNome?.[nome?.trim()] ?? markup;
  if (typeof valorMarkupCategoria === "string") {
    valorMarkupCategoria = Number(valorMarkupCategoria.replace(",", "."));
  }
  const markupCategoria =
    !isNaN(valorMarkupCategoria) && valorMarkupCategoria > 0
      ? valorMarkupCategoria.toLocaleString("pt-BR", {
          minimumFractionDigits: 3,
          maximumFractionDigits: 3,
        })
      : "";

  // Normaliza percentuais e valores
  const percentGastosFaturamento = Number((String(gastosFaturamento) || "0").replace(",", ".")) || 0;
  const percentImpostos = Number(impostos) || 0;
  const percentTaxas = Number(taxas) || 0;
  const percentComissoes = Number(comissoes) || 0;
  const percentOutros = Number(outros) || 0;
  // const valorTaxaExtra = Number(taxaExtra) || 0;
  const valorTotalEncargos = Number(totalEncargosReais) || 0;

  // Sugestão de Preço AGORA soma os encargos reais sempre!
  function calcularSugestaoPreco() {
    const custo = parseBRL(custoUnitario);
    const mk = parseBRL(markupCategoria);
    let preco = 0;
    if (!isNaN(mk) && !isNaN(custo) && mk > 0 && custo > 0) {
      preco = custo * mk;
    }
    // Soma SEMPRE os encargos reais ao preço sugerido!
    preco += valorTotalEncargos;
    return preco > 0
      ? preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
      : "R$ 0,00";
  }

  function calcularMarkupFinal() {
    const custo = parseBRL(custoUnitario);
    const preco = parseBRL(precoVenda);
    if (!isNaN(preco) && !isNaN(custo) && preco > 0 && custo > 0) {
      return (preco / custo).toLocaleString("pt-BR", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
    }
    return "";
  }

  function calcularFaturamentoBruto() {
    const preco = parseBRL(precoVenda);
    const rendimento = Number(rendimentoNumero);
    if (!isNaN(preco) && !isNaN(rendimento) && preco > 0 && rendimento > 0) {
      return (preco * rendimento).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    }
    return "R$ 0,00";
  }

  // Lucro Bruto (un.)
  function calcularLucroBrutoUn() {
    const preco = parseBRL(precoVenda);
    const custo = parseBRL(custoUnitario);
    if (!isNaN(preco) && !isNaN(custo) && preco > 0) {
      return (preco - custo).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    }
    return "R$ 0,00";
  }

  function calcularPorcentagemLucroBrutoUn() {
    const preco = parseBRL(precoVenda);
    const custo = parseBRL(custoUnitario);
    if (!isNaN(preco) && !isNaN(custo) && preco > 0) {
      return (((preco - custo) / preco) * 100).toFixed(1) + "%";
    }
    return "0%";
  }

  // Lucro Líquido Esperado (un.)
  function calcularLucroLiquidoUn() {
    const preco = parseBRL(precoVenda);
    const custo = parseBRL(custoUnitario);
    const descontoTotalPercent = percentGastosFaturamento + percentImpostos + percentTaxas + percentComissoes + percentOutros;
    const descontoEmReais = preco * (descontoTotalPercent / 100);
    const lucroLiquido = preco - descontoEmReais - custo;
    if (!isNaN(lucroLiquido) && preco > 0) {
      return lucroLiquido.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    }
    return "R$ 0,00";
  }

  function calcularPorcentagemLucroLiquidoUn() {
    const preco = parseBRL(precoVenda);
    const custo = parseBRL(custoUnitario);
    const descontoTotalPercent = percentGastosFaturamento + percentImpostos + percentTaxas + percentComissoes + percentOutros;
    const descontoEmReais = preco * (descontoTotalPercent / 100);
    const lucroLiquido = preco - descontoEmReais - custo;
    if (!isNaN(lucroLiquido) && preco > 0) {
      return ((lucroLiquido / preco) * 100).toFixed(1) + "%";
    }
    return "0%";
  }

  // ============ RENDER ============
  return (
    <div className="bloco-markup-completo">
      <div className="bloco-markup-titulo">{nome || "Categoria"}</div>
      <div className="painel-markup-row">
        <div className="painel-markup-col">
          <label className="painel-markup-label">Markup da Categoria</label>
          <input
            className="painel-input-unico"
            type="text"
            placeholder="Ex: 2,30"
            value={markupCategoria}
            readOnly
            style={{
              fontWeight: 700,
              color: "#ffe066",
              background: "#221748",
              cursor: "not-allowed"
            }}
            tabIndex={-1}
          />
        </div>
        <div className="painel-markup-col">
          <label className="painel-markup-label">Markup Final</label>
          <input
            className="painel-input-unico"
            type="text"
            placeholder="Ex: 2,15"
            value={calcularMarkupFinal()}
            readOnly
            style={{ fontWeight: 700, color: "#ffe066" }}
          />
        </div>
        <div className="painel-markup-col">
          <label className="painel-markup-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            Sugestão de Preço
            <span style={{
              fontSize: 12,
              color: "#ffe06699",
              marginLeft: 4,
              fontWeight: 500,
              fontStyle: "italic",
              whiteSpace: "nowrap"
            }}>
              (encargos: {valorTotalEncargos.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })})
            </span>
          </label>
          <input
            className="painel-input-unico"
            type="text"
            placeholder="R$ 00,00"
            value={calcularSugestaoPreco()}
            readOnly
            style={{ fontWeight: 700, color: "#ffe066" }}
          />
        </div>
      </div>
      <table className="tabela-resumo-projecao">
        <thead>
          <tr>
            <th>Receitas</th>
            <th>Valor</th>
            <th>%</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Lucro Bruto (un.):</td>
            <td>{calcularLucroBrutoUn()}</td>
            <td>{calcularPorcentagemLucroBrutoUn()}</td>
          </tr>
          <tr>
            <td>Lucro Líq. Esperado (un.):</td>
            <td>{calcularLucroLiquidoUn()}</td>
            <td>{calcularPorcentagemLucroLiquidoUn()}</td>
          </tr>
          <tr className="linha-faturamento">
            <td>Faturamento Bruto (total):</td>
            <td>{calcularFaturamentoBruto()}</td>
            <td>100%</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default BlocoResumoMarkup;
