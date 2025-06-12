import React, { useState, useEffect, useRef } from "react";
import AbasModal from "./AbasModal";
import DespesasFixasModal from "./DespesasFixasModal";

// ==== HELPERS ====
function parsePercent(v) {
  if (typeof v === "string") {
    return Number(
      v.replace("%", "")
        .replace(/\s/g, "")
        .replace(/\./g, "")
        .replace(",", ".")
    ) || 0;
  }
  return Number(v) || 0;
}
function onlyNumbers(s) {
  return (s || "").replace(/\D/g, "");
}
function formatNumberBRNoZeros(v) {
  let value = (v || "").replace(/\D/g, "");
  if (!value) return "0";
  let number = parseFloat(value) / 100;
  let [inteiro, decimal] = number
    .toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .split(",");
  if (decimal === "00") return inteiro;
  return inteiro + "," + decimal;
}
function formatNumberBR(v) {
  let value = (v || "").replace(/\D/g, "");
  if (!value) return "";
  let number = parseFloat(value) / 100;
  return number.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function formatBR(val, casas = 2) {
  if (typeof val === "string") val = val.replace(/[^\d.-]/g, "");
  if (!val || isNaN(val)) val = 0;
  return Number(val).toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
}
function somaImpostos(data) {
  const keys = ["icms", "iss", "pisCofins", "irpjCsll", "ipi"];
  let totalPercent = 0, totalValue = 0;
  keys.forEach(k => {
    totalPercent += parsePercent(data?.[k]?.percent);
    totalValue += parsePercent(data?.[k]?.value);
  });
  return { percent: totalPercent, value: totalValue };
}
function somaTaxas(data) {
  const keys = ["debito", "credito", "creditoParcelado", "boleto", "pix", "gateway"];
  let totalPercent = 0, totalValue = 0;
  keys.forEach(k => {
    totalPercent += parsePercent(data?.[k]?.percent);
    totalValue += parsePercent(data?.[k]?.value);
  });
  return { percent: totalPercent, value: totalValue };
}
function somaComissoes(data) {
  const keys = ["marketing", "delivery", "saas", "colaboradores"];
  let totalPercent = 0, totalValue = 0;
  keys.forEach(k => {
    totalPercent += parsePercent(data?.[k]?.percent);
    totalValue += parsePercent(data?.[k]?.value);
  });
  return { percent: totalPercent, value: totalValue };
}
function somaOutros(data, outros = []) {
  let totalPercent = 0, totalValue = 0;
  (outros || []).forEach(item => {
    totalPercent += parsePercent(item.percent);
    totalValue += parsePercent(item.value);
  });
  return { percent: totalPercent, value: totalValue };
}
function toDecimal(v) {
  if (typeof v === "string") {
    v = v.replace("%", "").replace(/\./g, "").replace(",", ".");
    if (!v.trim()) return 0;
    return Number(v) / 100;
  }
  if (typeof v === "number") return v / 100;
  return 0;
}
function normalizePercentString(v) {
  if (!v) return "0,00";
  v = String(v).replace(",", ".");
  const num = Number(v);
  return num.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function calcularMarkupIdeal(...percentuais) {
  const soma = percentuais.reduce(
    (acc, val) => acc + (parseFloat(val) || 0) / 100, 0
  );
  if (soma >= 1) return "Markup inviável!";
  const result = 1 / (1 - soma);
  return result.toLocaleString("pt-BR", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3
  });
}

// ==== COMPONENTES AUXILIARES ====
function LinhaVisual({ label, percentual, valor, markup, bold, centralizado, lucroEditable, onLucroChange, onLucroFocus, onLucroBlur, lucroInputRef }) {
  if (markup !== undefined) {
    return (
      <tr>
        <td colSpan={2}>
          <div style={{
            marginTop: 14, background: "#211535", borderRadius: 16,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 38px 0 19px", fontWeight: 800, fontSize: 20, height: 54, color: "#fff"
          }}>
            <span style={{ color: "#d4b9fd" }}>{label}</span>
            <span style={{
              display: "flex", alignItems: "center", border: "2px solid #a98ce2",
              background: "rgba(122,60,255,0.10)", borderRadius: 14, padding: "9px 38px",
              fontWeight: 900, fontSize: 22, color: "#fff", boxShadow: "0 1px 6px #0002",
              minWidth: 70, minHeight: 36, justifyContent: "center"
            }}>{markup}</span>
          </div>
        </td>
      </tr>
    );
  }
  if (centralizado) {
    return (
      <tr>
        <td colSpan={2}>
          <div style={{
            background: "#211535", borderRadius: 16, display: "flex", alignItems: "center",
            justifyContent: "space-between", padding: "0 38px 0 19px",
            fontWeight: 700, fontSize: 18, marginBottom: 11, height: 54, color: "#fff"
          }}>
            <span style={{ color: "#d4b9fd" }}>{label}</span>
            {lucroEditable ? (
              <div style={{
                background: "rgba(122,60,255,0.09)", border: "2px solid #a98ce2", borderRadius: 14,
                fontWeight: 700, fontSize: 22, color: "#fff", padding: "9px 32px",
                display: "flex", alignItems: "center", letterSpacing: 1
              }}>
                <input
                  ref={lucroInputRef}
                  type="text"
                  style={{
                    background: "transparent", border: "none", outline: "none", color: "#fff",
                    fontWeight: 700, fontSize: 20, textAlign: "right", width: 65, marginRight: 5
                  }}
                  value={percentual}
                  onChange={onLucroChange}
                  onFocus={onLucroFocus}
                  onBlur={onLucroBlur}
                  maxLength={9}
                  inputMode="numeric"
                  autoComplete="off"
                />
                <span style={{ fontWeight: 500, marginLeft: 0, fontSize: 18, color: "#d4b9fd" }}>%</span>
              </div>
            ) : (
              <div style={{
                background: "rgba(122,60,255,0.09)", border: "2px solid #a98ce2", borderRadius: 14,
                fontWeight: 700, fontSize: 22, color: "#fff", padding: "9px 32px",
                display: "flex", alignItems: "center", letterSpacing: 1
              }}>
                <span>{percentual}</span>
                <span style={{ fontWeight: 500, marginLeft: 6, fontSize: 19, color: "#d4b9fd" }}>%</span>
              </div>
            )}
          </div>
        </td>
      </tr>
    );
  }
  return (
    <tr>
      <td colSpan={2}>
        <div style={{
          background: "#211535", borderRadius: 16, display: "flex", alignItems: "center",
          justifyContent: "space-between", padding: "0 21px 0 19px", fontWeight: 700, fontSize: 18,
          marginBottom: 11, height: 54, color: "#fff"
        }}>
          <span style={{ color: "#d4b9fd" }}>{label}</span>
          <div style={{ display: "flex", gap: 9 }}>
            <div style={{
              display: "flex", alignItems: "center", border: "2px solid #a98ce2",
              background: "rgba(122,60,255,0.10)", borderRadius: 14,
              padding: "8px 20px 8px 17px", fontWeight: 700, fontSize: 18, color: "#fff",
              boxShadow: "0 1px 6px #0002", minWidth: 70, minHeight: 36, justifyContent: "center"
            }}>
              <span>{percentual}</span>
              <span style={{ fontWeight: 500, marginLeft: 5, fontSize: 17, color: "#d4b9fd" }}>%</span>
            </div>
            {valor !== undefined &&
              <div style={{
                display: "flex", alignItems: "center", border: "2px solid #a98ce2",
                background: "rgba(122,60,255,0.10)", borderRadius: 14, padding: "8px 21px 8px 15px",
                fontWeight: 700, fontSize: 18, color: "#fff", boxShadow: "0 1px 6px #0002",
                minWidth: 70, minHeight: 36, justifyContent: "center"
              }}>
                <span style={{ color: "#d4b9fd", marginRight: 4 }}>R$</span>
                <span>{valor}</span>
              </div>
            }
          </div>
        </div>
      </td>
    </tr>
  );
}

// ============== BLOCO SUBRECEITA FIXO (NÃO MEXE!!) ==================
function BlocoSubReceita() {
  const [nome, setNome] = useState("Sub-Receitas");
  const [editando, setEditando] = useState(false);

  return (
    <div style={{
      background: "#21193c", borderRadius: 22, width: "100%", maxWidth: 550, margin: "32px 0 0 0",
      border: "1.5px solid #a98ce260", boxShadow: "0 4px 28px #0003", position: "relative"
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 0, marginTop: 12
      }}>
        <h3 style={{
          background: "#24163c", color: "#fff", borderRadius: 13, border: "2px solid #a98ce2",
          padding: "13px 30px 13px 30px", textAlign: "center", margin: "0 0 22px 0",
          fontWeight: 900, fontSize: 29, letterSpacing: 0.5, minWidth: 270
        }}>
          {nome}
        </h3>
        <span
          onClick={() => setEditando(true)}
          style={{
            cursor: "pointer",
            fontSize: 25,
            userSelect: "none"
          }}
          title="Editar nome"
          role="button"
        >✏️</span>
      </div>
      {editando && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
          <input
            value={nome}
            autoFocus
            onChange={e => setNome(e.target.value)}
            onBlur={() => setEditando(false)}
            onKeyDown={e => { if (e.key === "Enter") setEditando(false); }}
            style={{
              fontWeight: 800, fontSize: 26, color: "#fff", background: "#2c2442", border: "2px solid #a98ce2",
              borderRadius: 9, padding: "10px 16px", width: 300, textAlign: "center", outline: "none"
            }}
            maxLength={40}
          />
        </div>
      )}
      <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
        <tbody>
          <LinhaVisual label="Gasto sobre faturamento" percentual="0" centralizado />
          <LinhaVisual label="Impostos" percentual="0" valor="0,00" />
          <LinhaVisual label="Taxas de meios de pagamento" percentual="0" valor="0,00" />
          <LinhaVisual label="Comissões e plataformas" percentual="0" valor="0,00" />
          <LinhaVisual label="Outros" percentual="0" valor="0,00" />
          <LinhaVisual label="Lucro desejado sobre venda" percentual="0" centralizado />
          <LinhaVisual label="Markup ideal" markup="1,000" bold centralizado />
        </tbody>
      </table>
      <div style={{
        color: "#beadfa", fontSize: 13, background: "#21193c", marginTop: 16,
        borderRadius: 8, padding: "13px 13px 9px 13px", border: "1px dashed #a98ce2"
      }}>
        <b>*Sub-Receita</b> é bloqueado pois serve para subprodutos que não serão vendidos, ou seja,
        serão usados como ingredientes: como massas, recheios, coberturas, etc. Esta categoria garante
        que não haverá duplicação da margem de lucro no produto final.
      </div>
    </div>
  );
}

// ========== BLOCO CUSTOMIZADO ==========
function BlocoCard({ nome, campos, onChangeNome, onDelete, fixo, obs, onConfig }) {
  const [editando, setEditando] = useState(false);
  const [inputNome, setInputNome] = useState(nome);

  const handleNomeBlur = () => {
    setEditando(false);
    if (inputNome.trim() && onChangeNome) onChangeNome(inputNome);
  };

  const [hover, setHover] = useState(false);
  const styleBloco = {
    background: "#21193c", borderRadius: 22, width: "100%", maxWidth: 550, margin: "32px 0 0 0",
    border: hover && !fixo ? "1.5px solid #a98ce2" : "1.5px solid #a98ce260",
    boxShadow: hover && !fixo ? "0 8px 32px #a98ce280" : "0 4px 24px #0002",
    transition: "box-shadow 0.2s, border 0.2s, transform 0.18s",
    position: "relative",
    transform: hover && !fixo ? "translateY(-3px) scale(1.015)" : "none",
  };

  return (
    <div style={styleBloco}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div style={{ display: "flex", alignItems: "center", marginBottom: 0, marginTop: 12, gap: 0 }}>
        <h3
          style={{
            background: fixo ? "#a98ce2" : "#24163c",
            color: fixo ? "#271453" : "#fff",
            borderRadius: 13,
            border: "2px solid #a98ce2",
            padding: "13px 30px 13px 30px",
            textAlign: "center",
            margin: "0 0 22px 0",
            fontWeight: 900,
            fontSize: 27,
            letterSpacing: 0.4,
            minWidth: 230,
            flex: 1,
            display: "flex",
            alignItems: "center"
          }}>
          {editando ? (
            <>
              <input
                type="text"
                value={inputNome}
                autoFocus
                onChange={e => setInputNome(e.target.value)}
                onBlur={handleNomeBlur}
                onKeyDown={e => { if (e.key === "Enter") handleNomeBlur(); }}
                maxLength={30}
                style={{
                  fontWeight: 800, fontSize: 26, color: "#fff", background: "#2c2442",
                  border: "2px solid #a98ce2", borderRadius: 9, padding: "10px 16px",
                  width: 210, textAlign: "center", margin: "0 0 16px 0", outline: "none"
                }}
              />
              <button
                onClick={handleNomeBlur}
                title="Confirmar edição"
                style={{
                  marginLeft: 14, marginBottom: 9, background: "none", border: "none",
                  color: "#5bf67b", fontSize: 30, cursor: "pointer"
                }}
              >✔️</button>
            </>
          ) : (
            <span>{nome}</span>
          )}
        </h3>
        {!fixo && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: 8 }}>
            {/* Lápis */}
            <span
              onClick={() => setEditando(true)}
              title="Editar nome"
              style={{
                cursor: "pointer",
                fontSize: 25,
                userSelect: "none",
                color: "#ffd76f"
              }}
            >✏️</span>
            {/* Engrenagem */}
            <span
              title="Configurações"
              style={{
                cursor: "pointer",
                fontSize: 24,
                color: "#7b57e7"
              }}
              onClick={onConfig}
            >⚙️</span>
            {/* Lixeira */}
            <button
              onClick={onDelete}
              title="Excluir bloco"
              style={{
                background: "none", border: "none", color: "#e15c5c",
                fontSize: 28, fontWeight: 800, cursor: "pointer", marginBottom: 0, marginTop: 0
              }}
            >🗑️</button>
          </div>
        )}
      </div>
      <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
        <tbody>
          {campos.map((linha, idx) => (
            <LinhaVisual key={linha.label} {...linha} />
          ))}
        </tbody>
      </table>
      {obs}
    </div>
  );
}

// ==== MAIN COMPONENT ====
export default function MarkupIdeal({ encargosData = {}, outrosEncargos = [], despesasFixasSubcats = [] }) {
  const [modalConfigIdx, setModalConfigIdx] = useState(null);
  const [abaModalSelecionada, setAbaModalSelecionada] = useState("despesas");
  const [custosAtivosPorBloco, setCustosAtivosPorBloco] = useState({});
  const impostosTotais = somaImpostos(encargosData);
  const taxasTotais = somaTaxas(encargosData);
  const comissoesTotais = somaComissoes(encargosData);
  const outrosTotais = somaOutros(encargosData, outrosEncargos);

  function getPercentualGastosFaturamento() {
    const v = localStorage.getItem("percentualGastosFaturamento");
    return normalizePercentString(v);
  }
  const gastoSobreFaturamento = getPercentualGastosFaturamento();

  // --- BLOCOS CUSTOMIZADOS (dinâmico) ---
  const [blocos, setBlocos] = useState(() => {
    const salvos = localStorage.getItem("markup-blocos-v3");
    return salvos ? JSON.parse(salvos) : [];
  });
  useEffect(() => {
    localStorage.setItem("markup-blocos-v3", JSON.stringify(blocos));
  }, [blocos]);

  function handleLucroBlocoChange(idx, e) {
    const raw = onlyNumbers(e.target.value);
    setBlocos(blocos =>
      blocos.map((b, i) =>
        i === idx ? { ...b, lucro: raw } : b
      )
    );
  }
  function handleLucroBlocoFocus(idx) {
    setBlocos(blocos =>
      blocos.map((b, i) =>
        i === idx ? { ...b, lucroEdit: true } : b
      )
    );
  }
  function handleLucroBlocoBlur(idx) {
    setBlocos(blocos =>
      blocos.map((b, i) =>
        i === idx ? { ...b, lucroEdit: false } : b
      )
    );
  }
  const handleAddBloco = () => {
    if (inputNovo.trim() === "") return;
    setBlocos([...blocos, { nome: inputNovo.trim(), lucro: "", lucroEdit: false }]);
    setInputNovo("");
    setShowInput(false);
  };
  const handleChangeNome = (idx, novoNome) => {
    setBlocos(blocos.map((b, i) => i === idx ? { ...b, nome: novoNome } : b));
  };
  const handleDeleteBloco = idx => {
    setBlocos(blocos.filter((_, i) => i !== idx));
  };

  const [inputNovo, setInputNovo] = useState("");
  const [showInput, setShowInput] = useState(false);

  // --- CUSTOS ATIVOS DE CADA BLOCO (passa pra modal) ---
  const custosAtivos = modalConfigIdx !== null ? (custosAtivosPorBloco[modalConfigIdx] || {}) : {};

  function handleToggleCusto(custoId) {
    if (modalConfigIdx === null) return;
    setCustosAtivosPorBloco(prev => ({
      ...prev,
      [modalConfigIdx]: {
        ...prev[modalConfigIdx],
        [custoId]: !prev[modalConfigIdx]?.[custoId]
      }
    }));
  }

  // Corrigido: montarCamposBloco agora recebe idx
  function montarCamposBloco(idx, lucro, lucroEdit) {
    return [
      {
        label: "Gasto sobre faturamento",
        percentual: formatNumberBRNoZeros(gastoSobreFaturamento.toString()),
        valor: "",
        centralizado: true
      },
      { label: "Impostos", percentual: formatNumberBRNoZeros(impostosTotais.percent.toString()), valor: formatBR(impostosTotais.value) },
      { label: "Taxas de meios de pagamento", percentual: formatNumberBRNoZeros(taxasTotais.percent.toString()), valor: formatBR(taxasTotais.value) },
      { label: "Comissões e plataformas", percentual: formatNumberBRNoZeros(comissoesTotais.percent.toString()), valor: formatBR(comissoesTotais.value) },
      { label: "Outros", percentual: formatNumberBRNoZeros(outrosTotais.percent.toString()), valor: formatBR(outrosTotais.value) },
      {
        label: "Lucro desejado sobre venda",
        percentual: lucroEdit ? formatNumberBR(lucro) : formatNumberBRNoZeros(lucro),
        lucroEditable: true,
        onLucroChange: e => handleLucroBlocoChange(idx, e),
        onLucroFocus: () => handleLucroBlocoFocus(idx),
        onLucroBlur: () => handleLucroBlocoBlur(idx),
        lucroInputRef: null,
        centralizado: true
      },
      { label: "Markup ideal", markup: calcularMarkupIdeal(
        toDecimal(gastoSobreFaturamento),
        toDecimal(impostosTotais.percent),
        toDecimal(taxasTotais.percent),
        toDecimal(comissoesTotais.percent),
        toDecimal(outrosTotais.percent),
        toDecimal(lucro)
      ), bold: true, centralizado: true }
    ];
  }

  // --- RENDER ---
  return (
    <div style={{ width: "100%", minHeight: "100vh", padding: "0px 0 0 0", background: "none" }}>
      {/* HEADER E ADICIONAR BLOCO */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{
          fontSize: 28, fontWeight: 900, letterSpacing: 0.3,
          marginBottom: 22, marginTop: 0, color: "#FFD76F",
          textShadow: "0 2px 12px #0004", marginLeft: 28, paddingLeft: 0
        }}>
          Markup Ideal
        </h2>
        <div style={{ marginRight: 54 }}>
          {!showInput && (
            <button
              style={{
                background: "#a98ce2", color: "#271453", fontWeight: 700, fontSize: 16,
                border: "2px solid #a98ce2", borderRadius: 18, padding: "8px 22px",
                cursor: "pointer", boxShadow: "0 2px 12px #0001", transition: ".2s"
              }}
              onClick={() => setShowInput(true)}
            >
              + Adicionar Campo
            </button>
          )}
          {showInput && (
            <div style={{ display: "flex", alignItems: "center" }}>
              <input
                type="text"
                value={inputNovo}
                onChange={e => setInputNovo(e.target.value)}
                placeholder="Nome do campo..."
                maxLength={30}
                autoFocus
                style={{
                  fontWeight: 700, fontSize: 16, border: "2px solid #a98ce2",
                  borderRadius: 18, padding: "8px 18px", marginRight: 6,
                  background: "#2c2442", color: "#fff", outline: "none", boxShadow: "0 1px 4px #0002"
                }}
                onKeyDown={e => {
                  if (e.key === "Enter") handleAddBloco();
                  if (e.key === "Escape") {
                    setInputNovo("");
                    setShowInput(false);
                  }
                }}
              />
              <button
                onClick={handleAddBloco}
                style={{
                  background: "#a98ce2", color: "#271453", fontWeight: 700, fontSize: 16,
                  border: "2px solid #a98ce2", borderRadius: 18, padding: "8px 18px",
                  cursor: "pointer", marginRight: 3
                }}
              >Adicionar</button>
              <button
                onClick={() => { setInputNovo(""); setShowInput(false); }}
                style={{
                  background: "none", border: "none", color: "#a98ce2",
                  fontWeight: 700, fontSize: 22, cursor: "pointer"
                }}
                title="Cancelar"
              >×</button>
            </div>
          )}
        </div>
      </div>
      <div style={{
        background: "#2c2442", borderRadius: 24, padding: "32px 32px 24px 28px",
        maxWidth: 610, marginLeft: 28, boxShadow: "0 4px 24px #0002", border: "2px solid #7b57e7"
      }}>
        <BlocoSubReceita />
        {blocos.map((bloco, idx) => (
          <BlocoCard
            key={idx}
            nome={bloco.nome}
            campos={montarCamposBloco(idx, bloco.lucro, bloco.lucroEdit)}
            onChangeNome={novoNome => handleChangeNome(idx, novoNome)}
            onDelete={() => handleDeleteBloco(idx)}
            fixo={false}
            obs={null}
            onConfig={() => setModalConfigIdx(idx)}
          />
        ))}
      </div>
      {/* MODAL DE CONFIGURAÇÃO */}
      {modalConfigIdx !== null && (
        <div
          style={{
            position: "fixed",
            left: 0, right: 0, top: 0, bottom: 0,
            zIndex: 3000,
            background: "rgba(20,16,40,0.82)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          onClick={() => setModalConfigIdx(null)}
        >
          <div
            style={{
              background: "#2c2442",
              borderRadius: 18,
              minWidth: 620,
              minHeight: 230,
              boxShadow: "0 6px 48px #0009",
              color: "#ffe95c",
              padding: "32px 44px 24px 44px",
              fontWeight: 900,
              fontSize: 22,
              position: "relative",
              display: "flex",
              flexDirection: "column",
              gap: 20
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 28, color: "#ffe95c", fontWeight: 800 }}>
                {blocos[modalConfigIdx]?.nome}
              </span>
              <button
                onClick={() => setModalConfigIdx(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#fff",
                  fontSize: 28,
                  cursor: "pointer",
                  marginLeft: 22
                }}
                title="Fechar"
              >×</button>
            </div>
            {/* Abas */}
            <AbasModal
              selected={abaModalSelecionada}
              onAbaChange={setAbaModalSelecionada}
            />
            {/* Conteúdo da aba */}
            <div style={{ background: "none", marginTop: 8 }}>
              {abaModalSelecionada === "despesas" && (
                <DespesasFixasModal
                  subcategorias={despesasFixasSubcats}
                  custosAtivos={custosAtivos}
                  onToggleCusto={handleToggleCusto}
                />
              )}
              {/* As próximas abas vão aqui... */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}