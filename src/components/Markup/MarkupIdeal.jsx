import React, { useState, useEffect } from "react";
import AbasModal from "./AbasModal";
import DespesasFixasModal from "./DespesasFixasModal";
import EncargosSobreVendaModal from "./EncargosSobreVendaModal";
import "./MarkupIdeal.css";

// ==== HELPERS ====
function parsePercent(v) {
  if (typeof v === "string") {
    return Number(v.replace("%", "").replace(/\s/g, "").replace(/\./g, "").replace(",", ".")) || 0;
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
function somaValoresEncargosSobreVenda(data, outros = []) {
  let total = 0;
  Object.values(data || {}).forEach(item => {
    if (item && item.value !== undefined && item.value !== null && !isNaN(item.value)) {
      total += Number(item.value) / 100;
    }
  });
  (outros || []).forEach(item => {
    if (item && item.value !== undefined && item.value !== null && !isNaN(item.value)) {
      total += Number(item.value) / 100;
    }
  });
  return total;
}

// ==== TOGGLE SWITCH COMPONENT (INLINE) ====
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

// ==== COMPONENTES AUXILIARES ====
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
    lucro,
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
              value={lucroEdit ? formatNumberBR(lucro) : formatNumberBRNoZeros(lucro)}
              onChange={onLucroChange}
              onFocus={onLucroFocus}
              onBlur={onLucroBlur}
              maxLength={6}
              className="markup-ideal-lucro-input"
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
        <span className="markup-ideal-box">{percentual} %</span>
      </td>
    </tr>
  );
}

function BlocoSubReceita() {
  const [nome, setNome] = useState("subreceita");
  const [editando, setEditando] = useState(false);

  const confirmarEdicao = () => setEditando(false);

  return (
    <div className="markup-ideal-outer">
      <div className="markup-ideal-inner">
        <div className="markup-ideal-title-row">
          <span className="markup-ideal-title">{nome}</span>
          <div className="markup-ideal-title-group">
            {!editando && (
              <button
                className="markup-ideal-edit-btn"
                onClick={() => setEditando(true)}
                title="Editar nome"
              >✏️</button>
            )}
            {editando && (
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
            )}
          </div>
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
          <b>*Sub-Receita</b> é bloqueado pois serve para subprodutos que não serão vendidos, ou seja,
          serão usados como ingredientes: como massas, recheios, coberturas, etc. Esta categoria garante
          que não haverá duplicação da margem de lucro no produto final.
        </div>
      </div>
    </div>
  );
}

// BlocoCard
function BlocoCard({
  nome, campos, onChangeNome, onDelete, obs, lucro, lucroEdit, onLucroChange, onLucroFocus, onLucroBlur, markupIdeal, onConfig, encargosData, outrosEncargos
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

  const totalEncargosReais = somaValoresEncargosSobreVenda(encargosData, outrosEncargos);

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
                <button
                  className="markup-ideal-edit-btn"
                  onClick={() => setEditando(true)}
                  title="Editar nome"
                >✏️</button>
                <button
                  className="markup-ideal-edit-btn"
                  onClick={onConfig}
                  title="Configurar bloco"
                  style={{ color: "#7b57e7" }}
                >⚙️</button>
                <button
                  className="markup-ideal-edit-btn"
                  onClick={onDelete}
                  title="Excluir bloco"
                  style={{ color: "#e15c5c" }}
                >🗑️</button>
              </div>
            </>
          )}
        </div>
        <table className="markup-ideal-table">
          <tbody>
            {campos.map((linha, idx) =>
              <LinhaVisual key={linha.label} {...linha} />
            )}
          </tbody>
        </table>
        {(typeof totalEncargosReais === "number" && !isNaN(totalEncargosReais) && totalEncargosReais > 0) && (
          <div className="markup-ideal-total-rs">
            total em {totalEncargosReais.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </div>
        )}
        {obs}
      </div>
    </div>
  );
}

// FolhaPagamentoModalAba
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
            <ToggleSwitchRoxo
              checked={ativo}
              onChange={() => onToggle(id)}
            />
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

// ==== LÓGICA DE FATURAMENTO E GASTOS ====
// AGORA: Recebe por props do FaturamentoRealizado!
function getMediaFaturamentoGlobal(lista, mediaTipo) {
  let listaMedia;
  if (mediaTipo === "all") listaMedia = lista;
  else listaMedia = lista.slice(-Number(mediaTipo));

  const mediaCustom = listaMedia.length > 0
    ? listaMedia.reduce((acc, cur) => acc + (Number(cur.value) || 0), 0) / listaMedia.length
    : 0;

  return mediaCustom;
}

// AJUSTE: calcula só com custos ATIVOS do bloco
function getPercentualGastosFaturamento(idx, funcionarios, despesasFixasSubcats, custosAtivosPorBloco, mediaFaturamento) {
  const ativos = custosAtivosPorBloco[idx] || {};

  // Soma despesas fixas ATIVAS do bloco
  const totalDespesasFixas = (despesasFixasSubcats || []).reduce(
    (acc, sub) => acc + (sub.despesas?.reduce((soma, d) => {
      const chave = `${sub.nome}-${d.nome}`;
      return ativos[chave] ? soma + (Number(String(d.valor).replace(/\./g, "").replace(",", ".")) || 0) : soma;
    }, 0) || 0), 0
  );

  // Soma funcionários ATIVOS do bloco
  const totalFolha = (funcionarios || []).reduce((a, f) => {
    const id = f.id ?? f._id ?? f.nome;
    if (!ativos[id]) return a;
    return a + (
      (Number(String(f.salario).replace(/\./g, "").replace(",", ".")) || 0) +
      [
        "fgts", "inss", "rat", "provisao", "valeTransporte",
        "valeAlimentacao", "valeRefeicao", "planoSaude", "outros"
      ].reduce((soma, key) => {
        const perc = Number(String(f[key]).replace(/\./g, "").replace(",", ".")) || 0;
        return soma + ((Number(String(f.salario).replace(/\./g, "").replace(",", ".")) || 0) * (perc / 100));
      }, 0)
    );
  }, 0);

  const totalCustos = totalDespesasFixas + totalFolha;

  const percentualGastos = mediaFaturamento > 0
    ? (totalCustos / mediaFaturamento) * 100
    : 0;

  // Mostra sempre DUAS casas decimais, igual tela de faturamento!
  return percentualGastos.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ==== COMPONENTE PRINCIPAL ====
export default function MarkupIdeal({
  encargosData = {},
  outrosEncargos = [],
  despesasFixasSubcats = [],
  funcionarios = [],
  calcularTotalFuncionarioObj,
  faturamentoLista = [],
  faturamentoMediaTipo = "6"
}) {
  // Persistência dos blocos no localStorage
  const [blocos, setBlocos] = useState(() => {
    const salvo = localStorage.getItem("markup-blocos-v4");
    return salvo ? JSON.parse(salvo) : [];
  });
  useEffect(() => {
    localStorage.setItem("markup-blocos-v4", JSON.stringify(blocos));
  }, [blocos]);

  // Persistência dos custos ativos por bloco
  const [custosAtivosPorBloco, setCustosAtivosPorBloco] = useState(() => {
    const salvo = localStorage.getItem("markup-custosAtivosPorBloco-v1");
    return salvo ? JSON.parse(salvo) : {};
  });
  useEffect(() => {
    localStorage.setItem("markup-custosAtivosPorBloco-v1", JSON.stringify(custosAtivosPorBloco));
  }, [custosAtivosPorBloco]);

  const [modalConfigIdx, setModalConfigIdx] = useState(null);
  const [abaModalSelecionada, setAbaModalSelecionada] = useState("despesas");
  const [inputNovo, setInputNovo] = useState("");
  const impostosTotais = somaImpostos(encargosData || {});
  const taxasTotais = somaTaxas(encargosData || {});
  const comissoesTotais = somaComissoes(encargosData || {});
  const outrosTotais = somaOutros(encargosData || {}, outrosEncargos || []);

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
      (outrosEncargos || []).forEach(item => {
        const id = item.id ?? item.nome;
        ativos[id] = true;
      });
      return ativos;
    }
    return {};
  }

  const handleLucroBlocoChange = (idx, e) => {
    const raw = onlyNumbers(e.target.value);
    setBlocos(blocos =>
      blocos.map((b, i) =>
        i === idx ? { ...b, lucro: raw } : b
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
    setBlocos([...blocos, { nome: inputNovo.trim(), lucro: "", lucroEdit: false }]);
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

  function montarCamposBloco(idx, lucro, lucroEdit) {
    const mediaFaturamento = getMediaFaturamentoGlobal(faturamentoLista, faturamentoMediaTipo);
    const gastoSobreFaturamento = getPercentualGastosFaturamento(
      idx,
      funcionarios,
      despesasFixasSubcats,
      custosAtivosPorBloco,
      mediaFaturamento
    );
    return [
      {
        label: "Gasto sobre faturamento",
        percentual: formatNumberBRNoZeros((gastoSobreFaturamento ?? "").toString()),
        valor: "",
        centralizado: true
      },
      { label: "Impostos", percentual: formatNumberBRNoZeros(((impostosTotais?.percent ?? "")).toString()) },
      { label: "Taxas de meios de pagamento", percentual: formatNumberBRNoZeros(((taxasTotais?.percent ?? "")).toString()) },
      { label: "Comissões e plataformas", percentual: formatNumberBRNoZeros(((comissoesTotais?.percent ?? "")).toString()) },
      { label: "Outros", percentual: formatNumberBRNoZeros(((outrosTotais?.percent ?? "")).toString()) },
      {
        label: "Lucro desejado sobre venda",
        percentual: lucroEdit ? formatNumberBR(lucro) : formatNumberBRNoZeros(lucro),
        lucroEditable: true,
        onLucroChange: e => handleLucroBlocoChange(idx, e),
        onLucroFocus: () => handleLucroBlocoFocus(idx),
        onLucroBlur: () => handleLucroBlocoBlur(idx),
        lucroEdit: lucroEdit,
        lucro: lucro,
        centralizado: true
      },
      { label: "Markup ideal", markup: calcularMarkupIdeal(
        toDecimal(gastoSobreFaturamento),
        toDecimal(impostosTotais?.percent),
        toDecimal(taxasTotais?.percent),
        toDecimal(comissoesTotais?.percent),
        toDecimal(outrosTotais?.percent),
        toDecimal(lucro)
      ), bold: true }
    ];
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
        {blocos.map((bloco, idx) => (
          <BlocoCard
            key={idx}
            nome={bloco.nome}
            campos={montarCamposBloco(idx, bloco.lucro, bloco.lucroEdit)}
            onChangeNome={novoNome => handleChangeNome(idx, novoNome)}
            onDelete={() => handleDeleteBloco(idx)}
            lucro={bloco.lucro}
            lucroEdit={bloco.lucroEdit}
            onLucroChange={e => handleLucroBlocoChange(idx, e)}
            onLucroFocus={() => handleLucroBlocoFocus(idx)}
            onLucroBlur={() => handleLucroBlocoBlur(idx)}
            markupIdeal={calcularMarkupIdeal(
              toDecimal(getPercentualGastosFaturamento(
                idx, funcionarios, despesasFixasSubcats, custosAtivosPorBloco,
                getMediaFaturamentoGlobal(faturamentoLista, faturamentoMediaTipo)
              )),
              toDecimal(impostosTotais?.percent),
              toDecimal(taxasTotais?.percent),
              toDecimal(comissoesTotais?.percent),
              toDecimal(outrosTotais?.percent),
              toDecimal(bloco.lucro)
            )}
            obs={null}
            onConfig={() => setModalConfigIdx(idx)}
            encargosData={encargosData}
            outrosEncargos={outrosEncargos}
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