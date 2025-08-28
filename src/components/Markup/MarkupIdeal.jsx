import React, { useState, useEffect } from "react";
import api, { API_PREFIX } from "../../services/api";
import AbasModal from "./AbasModal";
import DespesasFixasModal from "./DespesasFixasModal";
import EncargosSobreVendaModal from "./EncargosSobreVendaModal";
import ConfirmDeleteModal from "../modals/ConfirmDeleteModal";
import ModalUpgradePlano from "../modals/ModalUpgradePlano";
import { useAuth } from "../../App";
import "./MarkupIdeal.css";

// =====================
// Helpers (TODOS AQUI!)
// =====================
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
  const soma = percentuais.reduce((acc, val) => acc + (parseFloat(val) || 0), 0);
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
function getPercentualGastosFaturamento(idx, funcionarios, despesasFixasSubcats, custosAtivosPorBloco, faturamentoMedia) {
  const mediaFaturamento = faturamentoMedia ? Number(faturamentoMedia) : 0;
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
function somarEncargosReais(ativos, data, outrosEncargos) {
  let total = 0;
  ["icms", "iss", "pisCofins", "irpjCsll", "ipi"].forEach(key => {
    if (ativos[key] && data[key]?.value != null && data[key]?.value !== "") {
      total += Number(data[key].value) / 100;
    }
  });
  ["debito", "credito", "boleto", "pix", "gateway"].forEach(key => {
    if (ativos[key] && data[key]?.value != null && data[key]?.value !== "") {
      total += Number(data[key].value) / 100;
    }
  });
  if (Array.isArray(data.creditoParcelado)) {
    data.creditoParcelado.forEach((parcela, idx) => {
      const key = `creditoParcelado_${parcela.nome || idx}`;
      if (ativos[key] && parcela.value != null && parcela.value !== "") {
        total += Number(parcela.value) / 100;
      }
    });
  }
  ["marketing", "delivery", "saas", "colaboradores"].forEach(key => {
    if (ativos[key] && data[key]?.value != null && data[key]?.value !== "") {
      total += Number(data[key].value) / 100;
    }
  });
  if (Array.isArray(outrosEncargos)) {
    outrosEncargos.forEach(item => {
      const key = item.id ?? item.nome;
      if (ativos[key] && item.value != null && item.value !== "") {
        total += Number(item.value) / 100;
      }
    });
  }
  return total;
}

// ============ COMPONENTE FOLHA DE PAGAMENTO (aba folha) ============
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
    markupEditable,
    onMarkupChange,
    onMarkupFocus,
    onMarkupBlur,
    markupEdit,
    markupValue,
    mediaFaturamento,
  } = props;

  if (label === "Gasto sobre faturamento") {
    return (
      <tr>
        <td className="markup-ideal-row-label" style={{ fontWeight: 900 }}>
          {label}
          {mediaFaturamento && (
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                marginTop: 2,
                marginBottom: -2,
                color: "#8ba2c6",
                display: "block"
              }}
            >
              Média de faturamento: {mediaFaturamento}
            </div>
          )}
        </td>
        <td className="markup-ideal-row-value-set">
          <span className="markup-ideal-box">{formatPercentBRMask(percentual)}</span>
        </td>
      </tr>
    );
  }
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
  if (markupEditable) {
    return (
      <tr>
        <td className="markup-ideal-row-label">{label}</td>
        <td className="markup-ideal-row-value-set">
          <span className="markup-ideal-box">
            <input
              type="text"
              value={markupValue}
              onChange={e => onMarkupChange(maskPercentInput(e.target.value))}
              onFocus={onMarkupFocus}
              onBlur={onMarkupBlur}
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

// ============ BLOCO SUBRECEITA COM TOOLTIP =============
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
        <div className="markup-ideal-tip-tooltip">
          <span className="markup-ideal-tip-icon" tabIndex={0}>
            i
          </span>
          <span className="markup-ideal-tip-tooltip-text">
            <b>Atenção:</b> Este bloco é exclusivo para subprodutos que não são vendidos separadamente, como massas, recheios e coberturas. Ele serve apenas para organizar ingredientes usados em receitas.
          </span>
        </div>
      </div>
    </div>
  );
}

function BlocoCard({
  nome, campos, onChangeNome, onDelete, obs, onConfig, mediaFaturamento, totalEncargosReais
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
                  >⚙️</button>
                )}
                {onDelete && (
                  <button
                    className="markup-ideal-edit-btn"
                    onClick={onDelete}
                    title="Excluir bloco"
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
                mediaFaturamento={linha.label === "Gasto sobre faturamento" ? mediaFaturamento : undefined}
              />
            ))}
          </tbody>
        </table>
        <div className="markup-ideal-total-rs-cinza">
          Total em R$ {totalEncargosReais.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        {obs}
      </div>
    </div>
  );
}

export default function MarkupIdeal({ calcularTotalFuncionarioObj }) {
  const { user, setAba } = useAuth() || {};
  const plano = user?.plano || "gratuito";
  const isPlanoGratuito = plano === "gratuito";
  const [showUpgrade, setShowUpgrade] = useState(false);

  const [mediaTipo, setMediaTipo] = useState("6");
  const [faturamentoLista, setFaturamentoLista] = useState([]);
  const [faturamentoMedia, setFaturamentoMedia] = useState(0);

  const [blocos, setBlocos] = useState([]);
  const [custosAtivosPorBloco, setCustosAtivosPorBloco] = useState({});
  const [modalConfigIdx, setModalConfigIdx] = useState(null);
  const [abaModalSelecionada, setAbaModalSelecionada] = useState("despesas");
  const [inputNovo, setInputNovo] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [idxParaDeletar, setIdxParaDeletar] = useState(null);

  const [despesasFixasSubcats, setDespesasFixasSubcats] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [encargos, setEncargos] = useState({});
  const [outrosEncargos, setOutrosEncargos] = useState([]);

  const [custosAtivosEdicao, setCustosAtivosEdicao] = useState({});
  const [mudouAlgumaCoisa, setMudouAlgumaCoisa] = useState(false);

  async function salvarMarkupBloco(idx) {
    const bloco = blocos[idx];
    if (!bloco?.id) return;

    let totalEncargosReais = 0;
    if (encargos && encargos.data) {
      totalEncargosReais = somarEncargosReais(
        custosAtivosPorBloco[idx] || {},
        encargos.data,
        outrosEncargos || []
      );
    }
    const ativos = custosAtivosPorBloco[idx] || {};
    const impostosTotais = somaImpostos(encargos.data || {}, ativos);
    const taxasTotais = somaTaxas(encargos.data || {}, ativos);
    const comissoesTotais = somaComissoes(encargos.data || {}, ativos);
    const outrosTotais = somaOutros(encargos.data || {}, outrosEncargos || [], ativos);
    const gastoSobreFaturamento = getPercentualGastosFaturamento(
      idx,
      funcionarios,
      despesasFixasSubcats,
      custosAtivosPorBloco,
      faturamentoMedia
    );
    const markupIdeal = calcularMarkupIdeal(
      toDecimal(gastoSobreFaturamento),
      toDecimal(impostosTotais?.percent),
      toDecimal(taxasTotais?.percent),
      toDecimal(comissoesTotais?.percent),
      toDecimal(outrosTotais?.percent),
      toDecimal(bloco.markup)
    );

    try {
      await api.put(
        `${API_PREFIX}/markup-ideal/${bloco.id}`,
        {
          markup: bloco.markup,
          markupIdeal: markupIdeal,
          gastosFaturamento: gastoSobreFaturamento,
          impostos: impostosTotais?.percent ?? 0,
          taxasPagamento: taxasTotais?.percent ?? 0,
          comissoes: comissoesTotais?.percent ?? 0,
          outros: outrosTotais?.percent ?? 0,
          totalEncargosReais: totalEncargosReais,
        },
        { withCredentials: true }
      );
    } catch (err) {
      alert("Erro ao salvar markup: " + err.message);
    }
  }

  useEffect(() => {
    async function fetchFiltro() {
      try {
        const res = await api.get(`${API_PREFIX}/filtro-faturamento`, { withCredentials: true });
        if (res.data?.filtro) {
          setMediaTipo(res.data.filtro);
        } else {
          setMediaTipo("6");
        }
      } catch {
        setMediaTipo("6");
      }
    }
    fetchFiltro();
  }, []);
  useEffect(() => {
    async function fetchFaturamentos() {
      try {
        const res = await api.get(`${API_PREFIX}/sales-results`, { withCredentials: true });
        const lista = Array.isArray(res.data) ? res.data : [];
        setFaturamentoLista(lista);
        let listaFiltrada = mediaTipo === "all" ? lista : lista.slice(-Number(mediaTipo));
        if (listaFiltrada.length > 0) {
          const soma = listaFiltrada.reduce((acc, cur) => acc + cur.value, 0);
          setFaturamentoMedia(soma / listaFiltrada.length);
        } else {
          setFaturamentoMedia(0);
        }
      } catch {
        setFaturamentoLista([]);
        setFaturamentoMedia(0);
      }
    }
    fetchFaturamentos();
  }, [mediaTipo]);
  useEffect(() => {
    async function fetchBlocos() {
      try {
        const response = await api.get(`${API_PREFIX}/markup-ideal`, { withCredentials: true });
        setBlocos(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setBlocos([]);
      }
    }
    async function fetchDespesasFixas() {
      try {
        const res = await api.get(`${API_PREFIX}/despesasfixas`, { withCredentials: true });
        if (Array.isArray(res.data)) {
          setDespesasFixasSubcats(res.data);
        } else if (res.data && Array.isArray(res.data.categorias)) {
          // CORREÇÃO DE PARÊNTESES AQUI
          setDespesasFixasSubcats(
            res.data.categorias.map(cat => ({
              nome: cat.name,
              despesas: (cat.fixedCosts || []).map(cost => ({
                nome: cost.name,
                valor: cost.value
              }))
            }))
          );
        } else {
          setDespesasFixasSubcats([]);
        }
      } catch (err) {
        setDespesasFixasSubcats([]);
      }
    }
    async function fetchFuncionarios() {
      try {
        const res = await api.get(`${API_PREFIX}/folhapagamento/funcionarios`, { withCredentials: true });
        setFuncionarios(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setFuncionarios([]);
      }
    }
    fetchBlocos();
    fetchDespesasFixas();
    fetchFuncionarios();
  }, []);
  useEffect(() => {
    async function fetchEncargos() {
      try {
        const res = await api.get(`${API_PREFIX}/encargos-sobre-venda`, { withCredentials: true });
        if (res.data) {
          setEncargos(res.data);
          if (Array.isArray(res.data.outros)) setOutrosEncargos(res.data.outros);
          else setOutrosEncargos([]);
        }
      } catch (err) {
        setEncargos({});
        setOutrosEncargos([]);
      }
    }
    fetchEncargos();
  }, []);
  useEffect(() => {
    async function fetchEncargos() {
      try {
        const res = await api.get(`${API_PREFIX}/encargos-sobre-venda`, { withCredentials: true });
        if (res.data) {
          setEncargos(res.data);
          if (Array.isArray(res.data.outros)) setOutrosEncargos(res.data.outros);
          else setOutrosEncargos([]);
        }
      } catch (err) {
        setEncargos({});
        setOutrosEncargos([]);
      }
    }
    if (modalConfigIdx !== null) {
      fetchEncargos();
    }
  }, [modalConfigIdx]);
  useEffect(() => {
    if (!Array.isArray(blocos) || !blocos.length) return;
    async function fetchAllAtivos() {
      const ativosPorBloco = {};
      await Promise.all(blocos.map(async (bloco, idx) => {
        try {
          const res = await api.get(`${API_PREFIX}/bloco-ativos/${bloco.id}`, { withCredentials: true });
          ativosPorBloco[idx] = res.data.ativos || {};
        } catch {
          ativosPorBloco[idx] = {};
        }
      }));
      setCustosAtivosPorBloco(ativosPorBloco);
    }
    fetchAllAtivos();
  }, [blocos]);
  useEffect(() => {
    async function fetchBlocoAtivos() {
      if (modalConfigIdx === null || !blocos[modalConfigIdx]) return;
      const blocoId = blocos[modalConfigIdx].id;
      try {
        const res = await api.get(`${API_PREFIX}/bloco-ativos/${blocoId}`, { withCredentials: true });
        setCustosAtivosPorBloco(prev => ({
          ...prev,
          [modalConfigIdx]: res.data.ativos || {}
        }));
      } catch (err) {
        setCustosAtivosPorBloco(prev => ({
          ...prev,
          [modalConfigIdx]: {}
        }));
      }
    }
    fetchBlocoAtivos();
  }, [modalConfigIdx, blocos]);
  useEffect(() => {
    if (modalConfigIdx !== null) {
      setCustosAtivosEdicao({ ...(custosAtivosPorBloco[modalConfigIdx] || {}) });
      setMudouAlgumaCoisa(false);
    }
  }, [modalConfigIdx, custosAtivosPorBloco]);

  const handleAddBloco = async () => {
    if (inputNovo.trim() === "") return;

    // Pré-checagem: no plano gratuito só 1 bloco (além do SubReceita)
    if (isPlanoGratuito && blocos.length >= 1) {
      setShowUpgrade(true);
      return;
    }

    const ativos = custosAtivosPorBloco[blocos.length] || {};
    const totalEncargosReais = somarEncargosReais(
      ativos,
      encargos.data || {},
      outrosEncargos || []
    );

    try {
      const blocoCompleto = {
        nome: inputNovo.trim(),
        markup: "0,00",
        markupIdeal: "1,000",
        gastosFaturamento: "",
        impostos: "",
        taxasPagamento: "",
        comissoes: "",
        outros: "",
        lucroDesejado: "",
        mediaFaturamento: faturamentoMedia,
        custosAtivos: {},
        observacoes: "",
        totalEncargosReais: totalEncargosReais,
      };
      const response = await api.post(
        `${API_PREFIX}/markup-ideal`,
        blocoCompleto,
        { withCredentials: true }
      );
      setBlocos(blocos => [...blocos, response.data]);
      setInputNovo("");
    } catch (err) {
      if (err?.response?.status === 403) {
        setShowUpgrade(true);
        return;
      }
      alert("Erro ao adicionar bloco: " + err.message);
    }
  };

  function montarCamposBloco(idx, markupValue, markupEdit) {
    const ativos = custosAtivosPorBloco[idx] || {};
    const impostosTotais = somaImpostos(encargos.data || {}, ativos);
    const taxasTotais = somaTaxas(encargos.data || {}, ativos);
    const comissoesTotais = somaComissoes(encargos.data || {}, ativos);
    const outrosTotais = somaOutros(encargos.data || {}, outrosEncargos || [], ativos);
    const gastoSobreFaturamento = getPercentualGastosFaturamento(
      idx,
      funcionarios,
      despesasFixasSubcats,
      custosAtivosPorBloco,
      faturamentoMedia
    );
    const mediaFormatada = faturamentoMedia
      ? "R$ " + faturamentoMedia.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : "";
    return [
      {
        label: "Gasto sobre faturamento",
        percentual: formatNumberBRNoZeros((gastoSobreFaturamento ?? "").toString()),
        valor: "",
        centralizado: true,
        mediaFaturamento: mediaFormatada
      },
      { label: "Impostos", percentual: formatNumberBRNoZeros(impostosTotais?.percent) },
      { label: "Taxas de meios de pagamento", percentual: formatNumberBRNoZeros(taxasTotais?.percent) },
      { label: "Comissões e plataformas", percentual: formatNumberBRNoZeros(comissoesTotais?.percent) },
      { label: "Outros", percentual: formatNumberBRNoZeros(outrosTotais?.percent) },
      {
        label: "Lucro desejado sobre venda",
        percentual: "",
        markupEditable: true,
        onMarkupChange: (valor) => handleMarkupBlocoChange(idx, valor),
        onMarkupFocus: () => handleMarkupBlocoFocus(idx),
        onMarkupBlur: () => handleMarkupBlocoBlur(idx),
        markupEdit: markupEdit,
        markupValue: markupValue
      },
      {
        label: "Markup ideal",
        markup: calcularMarkupIdeal(
          toDecimal(gastoSobreFaturamento),
          toDecimal(impostosTotais?.percent),
          toDecimal(taxasTotais?.percent),
          toDecimal(comissoesTotais?.percent),
          toDecimal(outrosTotais?.percent),
          toDecimal(markupValue)
        ),
        bold: true
      }
    ];
  }
  const handleMarkupBlocoChange = (idx, valorFormatado) => {
    setBlocos(blocos =>
      blocos.map((b, i) =>
        i === idx ? { ...b, markup: valorFormatado } : b
      )
    );
  };
  const handleMarkupBlocoFocus = (idx) => {
    setBlocos(blocos =>
      blocos.map((b, i) =>
        i === idx ? { ...b, markupEdit: true } : b
      )
    );
  };
  const handleMarkupBlocoBlur = (idx) => {
    setBlocos(blocos =>
      blocos.map((b, i) =>
        i === idx ? { ...b, markupEdit: false } : b
      )
    );
    salvarMarkupBloco(idx);
  };

  const handleChangeNome = async (idx, novoNome) => {
    setBlocos(blocos =>
      blocos.map((b, i) => i === idx ? { ...b, nome: novoNome } : b)
    );
    try {
      const bloco = blocos[idx];
      if (!bloco?.id) return;
      await api.put(
        `${API_PREFIX}/markup-ideal/${bloco.id}`,
        { nome: novoNome },
        { withCredentials: true }
      );
    } catch (err) {
      alert("Erro ao salvar nome do bloco: " + err.message);
    }
  };

  function pedirConfirmacaoDelete(idx) {
    setIdxParaDeletar(idx);
    setShowConfirmModal(true);
  }
  const apagarConfirmado = async () => {
    const idx = idxParaDeletar;
    setShowConfirmModal(false);
    setIdxParaDeletar(null);
    if (idx == null) return;
    const bloco = blocos[idx];
    try {
      await api.delete(
        `${API_PREFIX}/markup-ideal/${bloco.id}`,
        { withCredentials: true }
      );
      setBlocos(blocos => blocos.filter((_, i) => i !== idx));
      setCustosAtivosPorBloco(prev => {
        const novo = { ...prev };
        delete novo[idx];
        return novo;
      });
    } catch (err) {
      alert("Erro ao deletar bloco: " + err.message);
    }
  };
  function handleToggleCustoEdicao(custoId) {
    setCustosAtivosEdicao(prev => {
      const atual = prev || {};
      const novos = { ...atual, [custoId]: !atual[custoId] };
      setMudouAlgumaCoisa(true);
      return novos;
    });
  }
  async function salvarEdicaoModal() {
    if (modalConfigIdx === null) return;
    const blocoId = blocos[modalConfigIdx]?.id;
    if (!blocoId) return;

    const ativos = custosAtivosEdicao;
    const totalEncargosReais = somarEncargosReais(
      ativos,
      encargos.data || {},
      outrosEncargos || []
    );
    try {
      await api.post(`${API_PREFIX}/bloco-ativos/${blocoId}`,
        { ativos: custosAtivosEdicao },
        { withCredentials: true }
      );
      await api.put(`${API_PREFIX}/markup-ideal/${blocoId}`,
        { totalEncargosReais },
        { withCredentials: true }
      );
      setCustosAtivosPorBloco(prev => ({
        ...prev,
        [modalConfigIdx]: custosAtivosEdicao
      }));
      setMudouAlgumaCoisa(false);
    } catch {
      alert("Erro ao salvar alterações! Tente novamente.");
    }
  }

  const custosAtivos = modalConfigIdx !== null ? (custosAtivosEdicao || {}) : {};

  // ======= Título e input no mesmo bloco (grid) =======
  return (
    <>
      <div className="markup-ideal-header">
        <h1 className="markup-ideal-top-title">Markup Ideal</h1>
        <div className="markup-ideal-input-row">
          <input
            type="text"
            placeholder="Nome do novo card..."
            value={inputNovo}
            onChange={e => setInputNovo(e.target.value)}
            maxLength={40}
            className="markup-ideal-input-edit"
            onKeyDown={e => { if (e.key === "Enter" && inputNovo.trim()) handleAddBloco(); }}
          />
          <button
            className="markup-ideal-add-btn"
            disabled={!inputNovo.trim()}
            onClick={handleAddBloco}
          >
            + Adicionar Card
          </button>
        </div>
      </div>
      <div className="markup-ideal-main">
        <div className="markup-ideal-row-cards">
          <BlocoSubReceita />
          {Array.isArray(blocos) && [...blocos].reverse().map((bloco, i) => {
            const idx = blocos.length - 1 - i;
            let totalEncargosReais = 0;
            if (encargos && encargos.data) {
              totalEncargosReais = somarEncargosReais(
                custosAtivosPorBloco[idx] || {},
                encargos.data,
                outrosEncargos || []
              );
            }
            return (
              <BlocoCard
                key={bloco.id || idx}
                nome={bloco.nome}
                campos={montarCamposBloco(idx, bloco.markup, bloco.markupEdit)}
                onChangeNome={novoNome => handleChangeNome(idx, novoNome)}
                onDelete={() => pedirConfirmacaoDelete(idx)}
                onConfig={() => setModalConfigIdx(idx)}
                mediaFaturamento={
                  faturamentoMedia
                    ? "R$ " + faturamentoMedia.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    : ""
                }
                totalEncargosReais={totalEncargosReais}
              />
            );
          })}
        </div>
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
                  onToggleCusto={handleToggleCustoEdicao}
                  ToggleComponent={ToggleSwitchRoxo}
                />
              )}
              {abaModalSelecionada === "folha" && (
                <FolhaPagamentoModalAba
                  funcionarios={funcionarios}
                  ativos={custosAtivos}
                  onToggle={handleToggleCustoEdicao}
                  calcularTotalFuncionarioObj={calcularTotalFuncionarioObj}
                />
              )}
              {abaModalSelecionada === "encargos" && (
                <EncargosSobreVendaModal
                  encargosData={encargos.data || {}}
                  outrosEncargos={outrosEncargos}
                  ativos={custosAtivos}
                  onToggle={handleToggleCustoEdicao}
                  ToggleComponent={ToggleSwitchRoxo}
                />
              )}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", padding: "18px 24px 0 0" }}>
              <button
                className="markupideal-btn-salvar"
                disabled={!mudouAlgumaCoisa}
                onClick={salvarEdicaoModal}
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
      <ConfirmDeleteModal
        isOpen={showConfirmModal}
        onRequestClose={() => {
          setShowConfirmModal(false);
          setIdxParaDeletar(null);
        }}
        onConfirm={apagarConfirmado}
        itemLabel="bloco"
      />

      {/* Modal de Upgrade quando extrapola limite */}
      <ModalUpgradePlano
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        irParaPlanos={() => {
          setAba("perfil_planos");
          setShowUpgrade(false);
        }}
      />
    </>
  );
}