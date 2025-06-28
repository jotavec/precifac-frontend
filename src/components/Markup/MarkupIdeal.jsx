import React, { useState } from "react";
import AbasModal from "./AbasModal";
import DespesasFixasModal from "./DespesasFixasModal";
import EncargosSobreVendaModal from "./EncargosSobreVendaModal";
import "./MarkupIdeal.css";

// Helpers
function maskPercentInput(valorDigitado) {
  let v = valorDigitado.replace(/\D/g, "");
  if (v.length === 0) v = "0";
  v = v.slice(0, 6);
  while (v.length < 3) v = "0" + v;
  let int = v.slice(0, -2).replace(/^0+/, "") || "0";
  let dec = v.slice(-2);
  return `${int},${dec}`;
}

function formatPercentBRMask(v) {
  if (!v) return "0 %";
  let n = Number(v.replace(",", "."));
  if (isNaN(n)) return "0 %";
  if (Number.isInteger(n)) {
    return n.toLocaleString("pt-BR", { minimumFractionDigits: 0 }) + " %";
  }
  return n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " %";
}

function parsePercent(v) {
  if (typeof v === "string") {
    return Number(v.replace("%", "").replace(/\s/g, "").replace(/\./g, "").replace(",", ".")) || 0;
  }
  return Number(v) || 0;
}

function onlyNumbersAndComma(s) {
  return (s || "").replace(/[^\d,]/g, "");
}

function formatNumberBRNoZeros(v) {
  if (v == null || v === "") return "0";
  let s = v.toString().replace(/[^\d,]/g, "");
  if (!s) return "0";
  if (s.indexOf(",") === -1) s = s.replace(/^0+/, "") || "0";
  let [int, dec = ""] = s.split(",");
  dec = dec.slice(0, 2);
  if (dec === "") return int;
  return int + "," + dec;
}

function formatNumberBR(v) {
  let n = Number((v || "0").toString().replace(",", "."));
  if (isNaN(n)) return "";
  return n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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

function calcularMarkupIdeal(...percentuais) {
  const soma = percentuais.reduce(
    (acc, val) => acc + (parseFloat(val) || 0), 0
  );
  if (soma >= 1) return "Markup inviável!";
  const result = 1 / (1 - soma);
  return result.toLocaleString("pt-BR", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3
  });
}

function somaImpostos(data, ativos = {}) {
  const keys = ["icms", "iss", "pisCofins", "irpjCsll", "ipi"];
  let totalPercent = 0;
  keys.forEach(k => {
    if (!ativos[k]) return;
    totalPercent += parsePercent(data?.[k]?.percent);
  });
  return { percent: totalPercent };
}

function somaTaxas(data, ativos = {}) {
  const keys = ["debito", "credito", "boleto", "pix", "gateway"];
  let totalPercent = 0;
  keys.forEach(k => {
    if (!ativos[k]) return;
    totalPercent += parsePercent(data?.[k]?.percent);
  });
  if (Array.isArray(data.creditoParcelado)) {
    data.creditoParcelado.forEach((parcela, idx) => {
      const keyParcela = `creditoParcelado_${parcela.nome || idx}`;
      if (!ativos[keyParcela]) return;
      totalPercent += parsePercent(parcela.percent);
    });
  }
  return { percent: totalPercent };
}

function somaComissoes(data, ativos = {}) {
  const keys = ["marketing", "delivery", "saas", "colaboradores"];
  let totalPercent = 0;
  keys.forEach(k => {
    if (!ativos[k]) return;
    totalPercent += parsePercent(data?.[k]?.percent);
  });
  return { percent: totalPercent };
}

function somaOutros(data, outros = [], ativos = {}) {
  let totalPercent = 0;
  (outros || []).forEach(item => {
    const key = item.id ?? item.nome;
    if (!ativos[key]) return;
    totalPercent += parsePercent(item.percent);
  });
  return { percent: totalPercent };
}

function getPercentualGastosFaturamento(idx, funcionarios, despesasFixasSubcats, custosAtivosPorBloco) {
  // Removido localStorage! Coloque seu cálculo de média de faturamento vindo do backend/state
  const mediaFaturamento = 0; // Substitua por valor correto do backend/state
  const ativos = custosAtivosPorBloco[idx] || {};
  const totalDespesasFixas = (despesasFixasSubcats || []).reduce((acc, sub) => {
    const subtotal = (sub.despesas || []).reduce((soma, d) => {
      const chave = `${sub.nome}-${d.nome}`;
      if (!ativos[chave]) return soma;
      let valor = d.valor;
      if (typeof valor === "string") {
        valor = valor.replace(/\./g, "").replace(",", ".");
        valor = Number(valor);
      }
      if (valor > 100000) valor = valor / 100;
      return soma + (valor || 0);
    }, 0);
    return acc + subtotal;
  }, 0);
  const totalFolha = (funcionarios || []).reduce((acc, f) => {
    const id = f.id ?? f._id ?? f.nome;
    if (!ativos[id]) return acc;
    let salario = f.salario;
    if (typeof salario === "string") {
      salario = salario.replace(/\./g, "").replace(",", ".");
      salario = Number(salario);
    }
    if (salario > 100000) salario = salario / 100;
    const encargos = [
      "fgts", "inss", "rat", "provisao", "valeTransporte",
      "valeAlimentacao", "valeRefeicao", "planoSaude", "outros"
    ];
    const totalEncargos = encargos.reduce((soma, key) => {
      let perc = f[key];
      if (typeof perc === "string") {
        perc = perc.replace(/\./g, "").replace(",", ".");
        perc = Number(perc);
      }
      if (perc > 100) perc = perc / 100;
      return soma + ((salario || 0) * ((perc || 0) / 100));
    }, 0);
    return acc + salario + totalEncargos;
  }, 0);
  const total = totalDespesasFixas + totalFolha;
  const percentualGastos = mediaFaturamento > 0
    ? (total / mediaFaturamento) * 100
    : 0;
  return percentualGastos.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// Toggle Switch
function ToggleSwitchRoxo({ checked, onChange, disabled }) {
  return (
    <label className="markupideal-switch">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange?.(e.target.checked)}
        disabled={disabled}
      />
      <span className="markupideal-slider" />
    </label>
  );
}

function LinhaVisual(props) {
  const {
    label,
    percentual,
    markup,
    lucroEditable,
    onLucroChange,
    onLucroFocus,
    onLucroBlur,
    lucroEdit,
    lucro
  } = props;

  if (markup !== undefined) {
    return (
      <tr>
        <td className="markup-ideal-row-label" style={{ fontWeight: 900 }}>{label}</td>
        <td className="markup-ideal-row-value-set">
          <span className="markup-ideal-row-markup-value">{markup}</span>
        </td>
      </tr>
    );
  }
  if (lucroEditable) {
    return (
      <tr>
        <td className="markup-ideal-row-label">{label}</td>
        <td className="markup-ideal-row-value-set">
          <span className="markup-ideal-box">
            <input
              type="text"
              value={lucro}
              onChange={e => onLucroChange(maskPercentInput(e.target.value))}
              onFocus={onLucroFocus}
              onBlur={onLucroBlur}
              maxLength={6}
              className="markup-ideal-lucro-input"
              style={{ textAlign: "right" }}
              inputMode="decimal"
              placeholder="0,00"
            />
            <span className="markup-ideal-box-percent">%</span>
          </span>
        </td>
      </tr>
    );
  }
  return (
    <tr>
      <td className="markup-ideal-row-label">{label}</td>
      <td className="markup-ideal-row-value-set">
        <span className="markup-ideal-box">{formatPercentBRMask(percentual)}</span>
      </td>
    </tr>
  );
}

function BlocoSubReceita() {
  const [nome, setNome] = useState("SubReceita");
  const [editando, setEditando] = useState(false);
  const confirmarEdicao = () => setEditando(false);

  return (
    <div className="markup-ideal-outer">
      <div className="markup-ideal-inner">
        <div className="markup-ideal-title-row">
          {editando ? (
            <div className="markup-ideal-title-editbox">
              <input
                value={nome}
                autoFocus
                onChange={e => setNome(e.target.value)}
                onBlur={confirmarEdicao}
                onKeyDown={e => {
                  if (e.key === "Enter") confirmarEdicao();
                }}
                maxLength={40}
                className="markup-ideal-title-input-edit"
              />
              <button
                className="markup-ideal-confirm-btn"
                onClick={confirmarEdicao}
                title="Confirmar edição"
                tabIndex={-1}
              >✔️</button>
            </div>
          ) : (
            <>
              <span className="markup-ideal-title">{nome}</span>
              <div className="markup-ideal-title-group">
                <button
                  className="markup-ideal-edit-btn"
                  onClick={() => setEditando(true)}
                  title="Editar nome"
                >✏️</button>
              </div>
            </>
          )}
        </div>
        <table className="markup-ideal-table">
          <tbody>
            <LinhaVisual label="Gasto sobre faturamento" percentual="0" />
            <LinhaVisual label="Impostos" percentual="0" />
            <LinhaVisual label="Taxas de meios de pagamento" percentual="0" />
            <LinhaVisual label="Comissões e plataformas" percentual="0" />
            <LinhaVisual label="Outros" percentual="0" />
            <LinhaVisual label="Lucro desejado sobre venda" percentual="0" />
            <LinhaVisual label="Markup ideal" markup="1,000" />
          </tbody>
        </table>
        <div className="markup-ideal-tip">
          <b>Atenção:</b> Este bloco é exclusivo para subprodutos que não são vendidos separadamente, como massas, recheios e coberturas. Ele serve apenas para organizar ingredientes usados em outras receitas, evitando que a margem de lucro seja aplicada duas vezes no produto final.
        </div>
      </div>
    </div>
  );
}

function BlocoCard({
  nome, campos, onChangeNome, onDelete, obs, onConfig
}) {
  const [editando, setEditando] = useState(false);
  const [inputNome, setInputNome] = useState(nome);
  const handleNomeBlur = () => {
    setEditando(false);
    if (inputNome.trim() && onChangeNome) onChangeNome(inputNome);
  };
  useEffect(() => {
    setInputNome(nome);
  }, [nome]);
  return (
    <div className="markup-ideal-outer">
      <div className="markup-ideal-inner">
        <div className="markup-ideal-title-row">
          {editando ? (
            <div className="markup-ideal-title-editbox">
              <input
                type="text"
                value={inputNome}
                autoFocus
                onChange={e => setInputNome(e.target.value)}
                onBlur={handleNomeBlur}
                onKeyDown={e => { if (e.key === "Enter") handleNomeBlur(); }}
                maxLength={40}
                className="markup-ideal-title-input-edit"
              />
              <button
                onClick={handleNomeBlur}
                title="Confirmar edição"
                className="markup-ideal-confirm-btn"
                tabIndex={-1}
              >✔️</button>
            </div>
          ) : (
            <>
              <span className="markup-ideal-title">{nome}</span>
              <div className="markup-ideal-title-group">
                {onChangeNome && (
                  <button
                    className="markup-ideal-edit-btn"
                    onClick={() => setEditando(true)}
                    title="Editar nome"
                  >✏️</button>
                )}
                {onConfig && (
                  <button
                    className="markup-ideal-edit-btn"
                    onClick={onConfig}
                    title="Configurar bloco"
                    style={{ color: "#7b57e7" }}
                  >⚙️</button>
                )}
                {onDelete && (
                  <button
                    className="markup-ideal-edit-btn"
                    onClick={onDelete}
                    title="Excluir bloco"
                    style={{ color: "#e15c5c" }}
                  >🗑️</button>
                )}
              </div>
            </>
          )}
        </div>
        <table className="markup-ideal-table">
          <tbody>
            {campos.map((linha, idx) => (
              <LinhaVisual
                key={linha.label}
                {...linha}
              />
            ))}
          </tbody>
        </table>
        {obs}
      </div>
    </div>
  );
}

function FolhaPagamentoModalAba({
  funcionarios = [],
  ativos = {},
  onToggle,
  calcularTotalFuncionarioObj
}) {
  const indiretos = Array.isArray(funcionarios)
    ? funcionarios.filter(f => (f.tipoMaoDeObra || '').toLowerCase() === "indireta")
    : [];

  return (
    <div style={{ marginTop: 10 }}>
      {indiretos.length === 0 && (
        <div style={{ color: "#ffe060", fontWeight: 700 }}>
          Nenhuma mão de obra indireta cadastrada.
        </div>
      )}
      {indiretos.map((f, idx) => {
        const id = f.id ?? f._id ?? f.nome;
        const ativo = !!ativos[id];
        return (
          <div key={id} className="markupideal-listitem">
            <label className="markupideal-switch">
              <input
                type="checkbox"
                checked={ativo}
                onChange={() => onToggle(id)}
              />
              <span className="markupideal-slider" />
            </label>
            <span className="markupideal-listitem-nome" style={{ flex: 1 }}>
              {f.nome}
            </span>
            <span className="markupideal-listitem-valor">
              {calcularTotalFuncionarioObj
                ? calcularTotalFuncionarioObj(f).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                : (f.custoTotal ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
              }
            </span>
          </div>
        );
      })}
    </div>
  );
}

// MarkupIdeal Principal
export default function MarkupIdeal({
  encargosData = {},
  outrosEncargos = [],
  despesasFixasSubcats = [],
  funcionarios = [],
  calcularTotalFuncionarioObj,
  faturamentoLista = [],
  faturamentoMediaTipo = "6"
}) {
  // Aqui só states, nada de localStorage!
  const [blocos, setBlocos] = useState([]);
  const [custosAtivosPorBloco, setCustosAtivosPorBloco] = useState({});
  const [modalConfigIdx, setModalConfigIdx] = useState(null);
  const [abaModalSelecionada, setAbaModalSelecionada] = useState("despesas");
  const [inputNovo, setInputNovo] = useState("");

  function montarCamposBloco(idx, lucro, lucroEdit) {
    const ativos = custosAtivosPorBloco[idx] || {};
    const impostosTotais = somaImpostos(encargosData || {}, ativos);
    const taxasTotais = somaTaxas(encargosData || {}, ativos);
    const comissoesTotais = somaComissoes(encargosData || {}, ativos);
    const outrosTotais = somaOutros(encargosData || {}, outrosEncargos || [], ativos);
    const gastoSobreFaturamento = getPercentualGastosFaturamento(
      idx,
      funcionarios,
      despesasFixasSubcats,
      custosAtivosPorBloco
    );
    return [
      {
        label: "Gasto sobre faturamento",
        percentual: formatNumberBRNoZeros((gastoSobreFaturamento ?? "").toString()),
        valor: "",
        centralizado: true
      },
      { label: "Impostos", percentual: formatNumberBRNoZeros(impostosTotais?.percent) },
      { label: "Taxas de meios de pagamento", percentual: formatNumberBRNoZeros(taxasTotais?.percent) },
      { label: "Comissões e plataformas", percentual: formatNumberBRNoZeros(comissoesTotais?.percent) },
      { label: "Outros", percentual: formatNumberBRNoZeros(outrosTotais?.percent) },
      {
        label: "Lucro desejado sobre venda",
        percentual: "",
        lucroEditable: true,
        onLucroChange: (valor) => handleLucroBlocoChange(idx, valor),
        onLucroFocus: () => handleLucroBlocoFocus(idx),
        onLucroBlur: () => handleLucroBlocoBlur(idx),
        lucroEdit: lucroEdit,
        lucro: lucro
      },
      { 
        label: "Markup ideal", 
        markup: calcularMarkupIdeal(
          toDecimal(gastoSobreFaturamento),
          toDecimal(impostosTotais?.percent),
          toDecimal(taxasTotais?.percent),
          toDecimal(comissoesTotais?.percent),
          toDecimal(outrosTotais?.percent),
          toDecimal(lucro)
        ),
        bold: true 
      }
    ];
  }

  const handleLucroBlocoChange = (idx, valorFormatado) => {
    setBlocos(blocos =>
      blocos.map((b, i) =>
        i === idx ? { ...b, lucro: valorFormatado } : b
      )
    );
  };

  const handleLucroBlocoFocus = (idx) => {
    setBlocos(blocos =>
      blocos.map((b, i) =>
        i === idx ? { ...b, lucroEdit: true } : b
      )
    );
  };

  const handleLucroBlocoBlur = (idx) => {
    setBlocos(blocos =>
      blocos.map((b, i) =>
        i === idx ? { ...b, lucroEdit: false } : b
      )
    );
  };

  const handleAddBloco = () => {
    if (inputNovo.trim() === "") return;
    const novoIdx = blocos.length;
    setBlocos([...blocos, { nome: inputNovo.trim(), lucro: "0,00", lucroEdit: false }]);
    setCustosAtivosPorBloco(prev => ({
      ...prev,
      [novoIdx]: {
        ...getActiveIdsForBloco("despesas"),
        ...getActiveIdsForBloco("folha"),
        ...getActiveIdsForBloco("encargos"),
      }
    }));
    setInputNovo("");
  };

  const handleChangeNome = (idx, novoNome) => {
    setBlocos(blocos.map((b, i) => i === idx ? { ...b, nome: novoNome } : b));
  };

  const handleDeleteBloco = idx => {
    setBlocos(blocos.filter((_, i) => i !== idx));
    setCustosAtivosPorBloco(prev => {
      const novo = { ...prev };
      delete novo[idx];
      return novo;
    });
  };

  function getActiveIdsForBloco(tipo) {
    if (tipo === "despesas") {
      let ativos = {};
      despesasFixasSubcats.forEach(subcat => {
        (subcat.despesas || []).forEach(custo => {
          const key = `${subcat.nome}-${custo.nome}`;
          ativos[key] = true;
        });
      });
      return ativos;
    }
    if (tipo === "folha") {
      let ativos = {};
      funcionarios
        .filter(f => (f.tipoMaoDeObra || '').toLowerCase() === "indireta")
        .forEach(f => {
          const id = f.id ?? f._id ?? f.nome;
          ativos[id] = true;
        });
      return ativos;
    }
    if (tipo === "encargos") {
      let ativos = {};
      [
        "icms", "iss", "pisCofins", "irpjCsll", "ipi",
        "debito", "credito", "creditoParcelado", "boleto", "pix", "gateway",
        "marketing", "delivery", "saas", "colaboradores"
      ].forEach(key => {
        ativos[key] = true;
      });
      if (Array.isArray(encargosData.creditoParcelado)) {
        encargosData.creditoParcelado.forEach((parcela, idx) => {
          const keyParcela = `creditoParcelado_${parcela.nome || idx}`;
          ativos[keyParcela] = true;
        });
      }
      (outrosEncargos || []).forEach(item => {
        const id = item.id ?? item.nome;
        ativos[id] = true;
      });
      return ativos;
    }
    return {};
  }

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

  return (
    <>
      <div className="markup-ideal-main">
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          margin: "18px 0 32px 0"
        }}>
          <input
            type="text"
            placeholder="Nome do novo card..."
            value={inputNovo}
            onChange={e => setInputNovo(e.target.value)}
            maxLength={40}
            className="markup-ideal-input-edit"
            style={{
              width: 260,
              fontWeight: 700,
              fontSize: 20,
              padding: "13px 18px",
              background: "#231d3c",
              border: "2px solid #a780ff",
              color: "#adadff"
            }}
            onKeyDown={e => { if (e.key === "Enter" && inputNovo.trim()) handleAddBloco(); }}
          />
          <button
            className="markup-ideal-add-btn"
            style={{
              color: "#ffe060",
              fontWeight: 800,
              fontSize: 22,
              border: "2px solid #fff",
              borderRadius: 10,
              padding: "12px 26px",
              marginLeft: 8,
              background: inputNovo.trim() ? "#18132a" : "#2a2450",
              boxShadow: "0 3px 20px #0007",
              opacity: inputNovo.trim() ? 1 : 0.5,
              cursor: inputNovo.trim() ? "pointer" : "not-allowed"
            }}
            disabled={!inputNovo.trim()}
            onClick={handleAddBloco}
          >
            + Adicionar Card
          </button>
        </div>

        <BlocoSubReceita />

        {/* BLOCO DINÂMICOS */}
        {blocos.map((bloco, idx) => (
          <BlocoCard
            key={idx}
            nome={bloco.nome}
            campos={montarCamposBloco(idx, bloco.lucro, bloco.lucroEdit)}
            onChangeNome={novoNome => handleChangeNome(idx, novoNome)}
            onDelete={() => handleDeleteBloco(idx)}
            onConfig={() => setModalConfigIdx(idx)}
          />
        ))}
      </div>
      {modalConfigIdx !== null && (
        <div
          className="markup-ideal-modal-bg"
          onClick={() => setModalConfigIdx(null)}
        >
          <div
            className="markup-ideal-modal"
            onClick={e => e.stopPropagation()}
          >
            <div className="markup-ideal-modal-header">
              <span>{blocos[modalConfigIdx]?.nome}</span>
              <button
                className="markup-ideal-modal-close"
                onClick={() => setModalConfigIdx(null)}
                title="Fechar"
              >×</button>
            </div>
            <AbasModal
              selected={abaModalSelecionada}
              onAbaChange={setAbaModalSelecionada}
            />
            <div className="markup-ideal-modal-content">
              {abaModalSelecionada === "despesas" && (
                <DespesasFixasModal
                  subcategorias={despesasFixasSubcats}
                  custosAtivos={custosAtivos}
                  onToggleCusto={handleToggleCusto}
                  ToggleComponent={ToggleSwitchRoxo}
                />
              )}
              {abaModalSelecionada === "folha" && (
                <FolhaPagamentoModalAba
                  funcionarios={funcionarios}
                  ativos={custosAtivos}
                  onToggle={handleToggleCusto}
                  calcularTotalFuncionarioObj={calcularTotalFuncionarioObj}
                />
              )}
              {abaModalSelecionada === "encargos" && (
                <EncargosSobreVendaModal
                  encargosData={encargosData}
                  outrosEncargos={outrosEncargos}
                  ativos={custosAtivos}
                  onToggle={handleToggleCusto}
                  ToggleComponent={ToggleSwitchRoxo}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
