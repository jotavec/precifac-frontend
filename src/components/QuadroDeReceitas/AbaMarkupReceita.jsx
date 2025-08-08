import React, { useEffect, useState } from "react";
import CurrencyInput from 'react-currency-input-field';
import "./ProjecaoValoresMarkup.css";

const blocoPrincipal = {
  background: "#fff",
  borderRadius: 0,
  boxShadow: "none",
  color: '#2196f3',
  width: "100%",
  maxWidth: "100%",
  padding: 0,
  margin: 0
};
const blocoInterno = { background: "#f8fafd", borderRadius: 16, padding: "20px", color: '#237be7', display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'center', boxShadow: "0 2px 14px #00cfff16" };
const tituloBloco = { color: "#2196f3", fontWeight: 900, fontSize: 22, marginBottom: 18, letterSpacing: 1, textAlign: 'center' };
const inputPillMini = { background: "#f8fafd", color: "#237be7", borderRadius: 13, border: "2px solid #00cfff", minHeight: 44, fontWeight: 700, fontSize: 16, padding: "0 18px", boxShadow: "none", marginBottom: 0, width: "100%", textAlign: 'center', outline: "none" };
const subLabelStyle = { color: '#237be7', fontSize: '1.1rem', fontWeight: 'bold' };
const valueTextStyle = { color: '#2196f3', fontSize: '1.19rem', fontWeight: '700' };
const separatorStyle = { width: '90%', height: '1.5px', background: '#e1e9f7', border: 'none', opacity: 0.5, margin: '8px 0' };

const blocoSubReceita = {
  id: 'subreceita',
  nome: 'SubReceita',
  markupIdeal: 1,
  gastosFaturamento: 0,
  impostos: 0,
  taxasPagamento: 0,
  comissoes: 0,
  outros: 0,
  totalEncargosReais: 0,
};

function parseBRL(valor) {
  if (typeof valor === "number") return valor;
  if (!valor) return 0;
  const valorLimpo = String(valor).replace(/[^0-9,.]/g, "").replace(",", ".");
  if (valorLimpo === "" || isNaN(valorLimpo)) return 0;
  return Number(valorLimpo);
}

// ======== COMPONENTE ==========
export default function AbaMarkupReceita({
  precoVenda, setPrecoVenda,
  pesoUnitario, setPesoUnitario,
  descontoReais, setDescontoReais,
  descontoPercentual, setDescontoPercentual,
  custoUnitario,
  rendimentoNumero,
  blocosMarkup = [],
  blocoMarkupAtivo, setBlocoMarkupAtivo,
}) {
  const [precoComDesconto, setPrecoComDesconto] = useState("");
  const [isPercentFocused, setIsPercentFocused] = useState(false);

  // Sempre garante a subreceita no início
  const blocosMarkupRender = (() => {
    const jaTemSub = blocosMarkup.some(b => (b.nome || "").toLowerCase() === "subreceita");
    if (jaTemSub) return blocosMarkup;
    return [blocoSubReceita, ...blocosMarkup];
  })();

  // Função para obter o ID de cada bloco (string segura)
  function getBlocoChave(bloco, idx) {
    if ((bloco.nome || "").toLowerCase() === "subreceita") return "subreceita";
    return String(bloco.id || bloco.nome || idx);
  }

  useEffect(() => {
    if (blocosMarkupRender.length === 0) return;
    if (!blocoMarkupAtivo) {
      setBlocoMarkupAtivo(getBlocoChave(blocosMarkupRender[0], 0));
      return;
    }
    const existe = blocosMarkupRender.some((bloco, idx) =>
      getBlocoChave(bloco, idx) === blocoMarkupAtivo
    );
    if (!existe) {
      setBlocoMarkupAtivo(getBlocoChave(blocosMarkupRender[0], 0));
    }
    // eslint-disable-next-line
  }, [blocosMarkupRender, blocoMarkupAtivo]);

  const blocoSub = blocosMarkupRender.find(b => (b.nome || "").toLowerCase() === "subreceita");
  const usarSubReceita = blocoMarkupAtivo === "subreceita";

  useEffect(() => {
    if (usarSubReceita) {
      if (blocoSub) {
        setPrecoVenda(calcularSugestaoPreco(blocoSub).replace('R$', '').replace(/\./g, '').replace(',', '.').trim());
        setDescontoReais("");
        setDescontoPercentual("");
      }
    }
    // eslint-disable-next-line
  }, [usarSubReceita]);

  useEffect(() => {
    const precoBase = parseBRL(precoVenda);
    if (precoBase <= 0) {
      setPrecoComDesconto(precoBase.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }));
      return;
    }
    const activeElement = document.activeElement;
    if (activeElement && activeElement.name === "desconto-reais") {
      const val = parseBRL(descontoReais);
      if (precoBase > 0 && val >= 0) {
        const percent = (val / precoBase) * 100;
        const formattedPercent = Number(percent.toFixed(2)).toLocaleString('pt-BR', { maximumFractionDigits: 2 });
        setDescontoPercentual(formattedPercent);
      } else {
        setDescontoPercentual("");
      }
    }
    else if (activeElement && activeElement.name === "desconto-percentual") {
      const perc = parseBRL(descontoPercentual);
      if (precoBase > 0 && perc >= 0) {
        setDescontoReais(((precoBase * perc) / 100).toFixed(2).replace('.', ','));
      } else {
        setDescontoReais("");
      }
    }
    let resultado = precoBase;
    const valorDesconto = parseBRL(descontoReais);
    if (valorDesconto > 0) {
      resultado = precoBase - valorDesconto;
    }
    if (resultado < 0) resultado = 0;
    setPrecoComDesconto(resultado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }));
  }, [precoVenda, descontoReais, descontoPercentual, setDescontoPercentual, setDescontoReais]);

  function calcularPrecoPorKg() {
    const preco = parseBRL(precoComDesconto);
    const peso = parseBRL(pesoUnitario);
    if (!peso || !preco) return "";
    return ((preco / peso) * 1000).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function calcularSugestaoPreco(bloco) {
    const custo = parseBRL(custoUnitario);
    const markup = parseBRL(bloco.markupIdeal);
    let preco = 0;
    if (custo > 0 && markup > 0) {
      preco = custo * markup;
    }
    preco += parseBRL(bloco.totalEncargosReais);
    return preco > 0 ? preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "R$ 0,00";
  }

  function calcularMarkupFinal() {
    const custo = parseBRL(custoUnitario);
    const preco = parseBRL(precoComDesconto);
    if (preco > 0 && custo > 0) {
      return (preco / custo).toLocaleString("pt-BR", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
    }
    return "Ex: 1,000";
  }

  function calcularLucroBrutoUn() {
    const preco = parseBRL(precoComDesconto);
    const custo = parseBRL(custoUnitario);
    if (preco > 0) {
      let resultado = preco - custo;
      if (Math.abs(resultado) < 0.005) resultado = 0;
      return resultado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    }
    return "R$ 0,00";
  }

  function calcularPorcentagemLucroBrutoUn() {
    const preco = parseBRL(precoComDesconto);
    const custo = parseBRL(custoUnitario);
    if (preco > 0) {
      let perc = ((preco - custo) / preco) * 100;
      if (Math.abs(perc) < 0.05) perc = 0;
      return `${perc.toFixed(1)}%`;
    }
    return "0%";
  }

  function calcularLucroLiquidoUn(bloco) {
    const preco = parseBRL(precoComDesconto);
    const custo = parseBRL(custoUnitario);
    const descontoTotalPercent = parseBRL(bloco.gastosFaturamento) + parseBRL(bloco.impostos) + parseBRL(bloco.taxasPagamento) + parseBRL(bloco.comissoes) + parseBRL(bloco.outros);
    const descontoEmReais = preco * (descontoTotalPercent / 100);
    let lucroLiquido = preco - descontoEmReais - custo - parseBRL(bloco.totalEncargosReais);
    if (preco > 0) {
      if (Math.abs(lucroLiquido) < 0.005) lucroLiquido = 0;
      return lucroLiquido.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    }
    return "R$ 0,00";
  }

  function calcularPorcentagemLucroLiquidoUn(bloco) {
    const preco = parseBRL(precoComDesconto);
    const custo = parseBRL(custoUnitario);
    const descontoTotalPercent = parseBRL(bloco.gastosFaturamento) + parseBRL(bloco.impostos) + parseBRL(bloco.taxasPagamento) + parseBRL(bloco.comissoes) + parseBRL(bloco.outros);
    const descontoEmReais = preco * (descontoTotalPercent / 100);
    let lucroLiquido = preco - descontoEmReais - custo - parseBRL(bloco.totalEncargosReais);
    if (preco > 0) {
      let perc = (lucroLiquido / preco) * 100;
      if (Math.abs(perc) < 0.05) perc = 0;
      return `${perc.toFixed(1)}%`;
    }
    return "0%";
  }

  function calcularFaturamentoBruto() {
    const preco = parseBRL(precoComDesconto);
    const rendimento = Number(rendimentoNumero);
    if (preco > 0 && rendimento > 0) {
      return (preco * rendimento).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    }
    return "R$ 0,00";
  }

  const handleDescontoPercentualChange = (e) => {
    const valor = e.target.value.replace('%', '');
    if (/^\d*[,]?\d{0,2}$/.test(valor)) {
      setDescontoPercentual(valor);
    }
  };

  return (
    <div className="projecao-valores-markup-main" style={blocoPrincipal}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* TOPO: Agora com Simulador de Desconto à direita */}
        <div className="projecao-valores-markup-topo" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '28px' }}>
          {/* Preço de Venda (R$/un.) */}
          <div style={blocoInterno}>
            <div style={tituloBloco}>Preço de Venda (R$/un.)</div>
            <CurrencyInput
              className="input-form-brabo preco-venda-input"
              placeholder="Ex: 25,50"
              value={precoVenda}
              onValueChange={value => setPrecoVenda(value || "")}
              intlConfig={{ locale: 'pt-BR', currency: 'BRL' }}
              decimalScale={2}
              onFocus={e => e.target.select()}
              disabled={usarSubReceita}
            />
          </div>
          {/* Peso Unitário (g) */}
          <div style={blocoInterno}>
            <div style={tituloBloco}>Peso Unitário (g)</div>
            <input
              style={inputPillMini}
              className="input-form-brabo"
              placeholder="Ex: 500"
              value={pesoUnitario}
              onChange={e => setPesoUnitario(e.target.value)}
              onFocus={e => e.target.select()}
            />
          </div>
          {/* Preço por KG / Custo Unitário */}
          <div style={blocoInterno}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                <span style={subLabelStyle}>Preço por KG</span>
                <span style={valueTextStyle}>{calcularPrecoPorKg() || '-'}</span>
              </div>
              <div style={separatorStyle}></div>
              <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                <span style={subLabelStyle}>Custo Unitário</span>
                <span style={valueTextStyle}>
                  {(custoUnitario || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </span>
              </div>
            </div>
          </div>
          {/* Simulador de Desconto */}
          <div style={blocoInterno}>
            <div style={tituloBloco}>Simulador de Desconto</div>
            <div style={{ display: "flex", gap: 10, width: "100%", justifyContent: "center" }}>
              <CurrencyInput
                style={inputPillMini}
                name="desconto-reais"
                className="input-form-brabo"
                placeholder="Valor (R$)"
                value={descontoReais}
                onValueChange={(value) => setDescontoReais(value || "")}
                intlConfig={{ locale: 'pt-BR', currency: 'BRL' }}
                decimalScale={2}
                onFocus={(e) => e.target.select()}
                disabled={usarSubReceita}
              />
              <input
                type="text"
                name="desconto-percentual"
                placeholder="%"
                style={inputPillMini}
                className="input-form-brabo"
                value={isPercentFocused ? descontoPercentual : (descontoPercentual ? `${descontoPercentual}%` : "")}
                onChange={handleDescontoPercentualChange}
                onFocus={(e) => { e.target.select(); setIsPercentFocused(true); }}
                onBlur={() => setIsPercentFocused(false)}
                disabled={usarSubReceita}
              />
            </div>
            <div style={{ marginTop: 15, fontWeight: 700, fontSize: "1.13rem", flexGrow: 1, display: 'flex', alignItems: 'center' }}>
              Valor com desconto: <span style={{ color: "#00cfff", fontWeight: 900, marginLeft: 6 }}>{precoComDesconto}</span>
            </div>
          </div>
        </div>

        {/* PAINEL DE BLOCOS MARKUP */}
        <div className="painel-projecao-valores-markup">
          <div className="markup-blocos-container" style={{ flex: 1 }}>
            {blocosMarkupRender.length > 0 ? (
              blocosMarkupRender.map((bloco, index) => {
                const blocoChave = getBlocoChave(bloco, index);
                const isSub = (bloco.nome || '').toLowerCase() === 'subreceita';
                const ativo = blocoMarkupAtivo === blocoChave;
                return (
                  <div
                    className="bloco-markup-completo"
                    key={blocoChave}
                  >
                    <div
                      className="bloco-markup-titulo"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontWeight: 900,
                        fontSize: '2.1rem',
                        minHeight: 52,
                        paddingRight: 0,
                        paddingLeft: 0,
                        gap: 0
                      }}
                    >
                      <span style={{ flex: 1, textAlign: "left" }}>{bloco.nome || "Categoria"}</span>
                      <button
                        type="button"
                        className={`btn-subreceita-ativar${ativo ? " ativo" : ""}`}
                        style={{
                          marginLeft: 12,
                          borderRadius: 22,
                          border: "2.2px solid #00cfff",
                          padding: "5px 18px",
                          color: ativo ? "#fff" : "#00cfff",
                          background: ativo
                            ? "linear-gradient(90deg, #00cfff 0%, #2196f3 100%)"
                            : "#fff",
                          fontWeight: 800,
                          fontSize: 16,
                          letterSpacing: 0.4,
                          boxShadow: ativo
                            ? "0 2px 14px #00cfff22"
                            : "0 1px 8px #00cfff11",
                          cursor: "pointer",
                          outline: "none",
                          transition: "all 0.18s cubic-bezier(.86,.01,.15,.99)",
                          textShadow: ativo ? "0 1px 4px #ffffff99" : "none",
                        }}
                        onClick={() => setBlocoMarkupAtivo(ativo ? null : blocoChave)}
                      >
                        {isSub
                          ? ativo
                            ? "Usando SubReceita"
                            : "Ativar SubReceita"
                          : ativo
                            ? "Usando"
                            : "Ativar"
                        }
                      </button>
                    </div>
                    <div className="painel-markup-row">
                      <div className="painel-markup-col">
                        <label className="painel-markup-label">Markup da Categoria</label>
                        <input className="painel-input-unico input-form-brabo" type="text" value={(parseBRL(bloco.markupIdeal) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 3 })} readOnly tabIndex={-1} />
                      </div>
                      <div className="painel-markup-col">
                        <label className="painel-markup-label">Markup Final</label>
                        <input className="painel-input-unico input-form-brabo" type="text" placeholder="Ex: 1,000" value={calcularMarkupFinal()} readOnly />
                      </div>
                      <div className="painel-markup-col">
                        <label className="painel-markup-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          Sugestão de Preço
                          <span style={{ fontSize: 12, color: "#00cfff99", fontWeight: 500, fontStyle: "italic", whiteSpace: "nowrap" }}>
                            (encargos: {parseBRL(bloco.totalEncargosReais).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })})
                          </span>
                        </label>
                        <input className="painel-input-unico input-form-brabo" type="text" placeholder="R$ 0,00" value={calcularSugestaoPreco(bloco)} readOnly />
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
                          <td>{calcularLucroLiquidoUn(bloco)}</td>
                          <td>{calcularPorcentagemLucroLiquidoUn(bloco)}</td>
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
              })
            ) : (
              <div style={{ color: '#b4c7e8', textAlign: 'center', width: '100%', padding: '20px', fontWeight: 700 }}>
                Nenhuma categoria de markup encontrada. Cadastre uma na tela de "Markup Ideal".
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
