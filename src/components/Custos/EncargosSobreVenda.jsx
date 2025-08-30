import React, { useState, useEffect } from "react";
import api, { API_URL } from "../../services/api";
import "./EncargosSobreVenda.css";

// SECTIONS dos blocos tradicionais:
const SECTIONS = [
  {
    title: "1. Impostos",
    fields: [
      { key: "icms", label: "ICMS" },
      { key: "iss", label: "ISS" },
      { key: "pisCofins", label: "PIS/COFINS" },
      { key: "irpjCsll", label: "IRPJ/CSLL" },
      { key: "ipi", label: "IPI" }
    ]
  },
  {
    title: "2. Taxas de meios de pagamento",
    fields: [
      { key: "debito", label: "Cartão de débito" },
      { key: "credito", label: "Cartão de crédito" },
      { key: "creditoParcelado", label: "Cartão de crédito parcelado", isParcela: true },
      { key: "boleto", label: "Boleto bancário" },
      { key: "pix", label: "PIX" },
      { key: "gateway", label: "Gateways de pagamento" }
    ]
  },
  {
    title: "3. Comissões e plataformas",
    fields: [
      { key: "marketing", label: "Marketing" },
      { key: "delivery", label: "Aplicativos de delivery" },
      { key: "saas", label: "Plataformas SaaS" },
      { key: "colaboradores", label: "Colaboradores" }
    ]
  },
  {
    title: "4. Outros",
    fields: []
  }
];

// Máscara de valor em reais
function maskValueBRLInput(v) {
  v = (v ?? "").toString().replace(/[^\d]/g, "");
  if (v.length === 0) return "";
  while (v.length < 3) v = "0" + v;
  let reais = v.slice(0, -2);
  let centavos = v.slice(-2);
  reais = reais.replace(/^0+/, "") || "0";
  return reais.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "," + centavos;
}

// Máscara para percentuais
function maskPercentBRLInput(v) {
  v = (v ?? "").toString().replace(/[^\d]/g, "");
  if (v.length === 0) return "";
  while (v.length < 3) v = "0" + v;
  let inteiro = v.slice(0, -2);
  let decimal = v.slice(-2);
  inteiro = inteiro.replace(/^0+/, "") || "0";
  return inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "," + decimal;
}

function formatPercentDisplay(v) {
  if (v === "" || v === undefined || v === null) return "0";
  let num = Number(typeof v === "string" ? v.replace(",", ".") : v);
  if (isNaN(num)) return "0";
  if (Number.isInteger(num)) {
    return num.toLocaleString("pt-BR", { minimumFractionDigits: 0 });
  }
  let str = num.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  str = str.replace(/,00$/, "");
  str = str.replace(/,(\d)0$/, ",$1");
  return str;
}

// Dados iniciais zerados (ajuste se precisar)
const INITIAL_DATA = {
  icms: { percent: 0, value: "" },
  iss: { percent: 0, value: "" },
  pisCofins: { percent: 0, value: "" },
  irpjCsll: { percent: 0, value: "" },
  ipi: { percent: 0, value: "" },
  debito: { percent: 0, value: "" },
  credito: { percent: 0, value: "" },
  creditoParcelado: [],
  boleto: { percent: 0, value: "" },
  pix: { percent: 0, value: "" },
  gateway: { percent: 0, value: "" },
  marketing: { percent: 0, value: "" },
  delivery: { percent: 0, value: "" },
  saas: { percent: 0, value: "" },
  colaboradores: { percent: 0, value: "" }
};

export default function EncargosSobreVenda() {
  const [data, setData] = useState(INITIAL_DATA);
  const [outros, setOutros] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await api.get(`${API_URL}/encargos-sobre-venda`, { withCredentials: true });
        if (res.data && res.data.data) {
          setData(res.data.data || INITIAL_DATA);
          setOutros(res.data.outros || []);
        } else {
          setData(INITIAL_DATA);
          setOutros([]);
        }
      } catch {
        setData(INITIAL_DATA);
        setOutros([]);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (loading) return;
    async function saveData() {
      try {
        await api.post(`${API_URL}/encargos-sobre-venda`, { data, outros }, { withCredentials: true });
      } catch (err) { }
    }
    saveData();
  }, [data, outros]);

  const [parcelasArr, setParcelasArr] = useState([]);
  useEffect(() => {
    if (Array.isArray(data.creditoParcelado)) {
      setParcelasArr(data.creditoParcelado);
    }
  }, [data]);
  useEffect(() => {
    if (JSON.stringify(data.creditoParcelado) !== JSON.stringify(parcelasArr)) {
      setData(prev => ({
        ...prev,
        creditoParcelado: parcelasArr
      }));
    }
  }, [parcelasArr]);

  const [editingPercent, setEditingPercent] = useState({});
  const [percentInput, setPercentInput] = useState({});
  const [editingPercentOutros, setEditingPercentOutros] = useState({});
  const [percentInputOutros, setPercentInputOutros] = useState({});

  function handleChangePercent(e, key) {
    setPercentInput(prev => ({
      ...prev,
      [key]: e.target.value.replace(/[^\d]/g, "")
    }));
  }
  function handleFocusPercent(key) {
    setEditingPercent(prev => ({ ...prev, [key]: true }));
    let val = data[key]?.percent;
    if (val === undefined || val === null) val = "";
    else {
      val = Math.round(Number(val) * 100).toString();
    }
    setPercentInput(prev => ({
      ...prev,
      [key]: val
    }));
  }
  function handleBlurPercent(key) {
    let raw = percentInput[key] ?? "";
    if (raw === "") raw = "0";
    while (raw.length < 3) raw = "0" + raw;
    let inteiro = raw.slice(0, -2).replace(/^0+/, "") || "0";
    let decimal = raw.slice(-2);
    const num = Number(inteiro + "." + decimal);
    setData(prev => ({
      ...prev,
      [key]: { ...prev[key], percent: isNaN(num) ? 0 : num }
    }));
    setEditingPercent(prev => ({ ...prev, [key]: false }));
    setPercentInput(prev => ({ ...prev, [key]: undefined }));
  }
  function handleChangeValue(e, key) {
    const value = (e.target.value ?? "").toString().replace(/\D/g, "");
    setData(prev => ({
      ...prev,
      [key]: { ...prev[key], value }
    }));
  }

  function handleChangeParcelaPercent(e, idx) {
    setParcelasArr(prev => {
      const clone = [...prev];
      const value = e.target.value.replace(/[^\d]/g, "");
      clone[idx] = { ...clone[idx], percent: value };
      return clone;
    });
  }
  function handleFocusParcelaPercent(idx) {
    setParcelasArr(prev => {
      const clone = [...prev];
      let val = clone[idx]?.percent;
      if (val === undefined || val === null) val = "";
      else {
        val = Math.round(Number(val) * 100).toString();
      }
      clone[idx] = { ...clone[idx], percent: val };
      return clone;
    });
  }
  function handleBlurParcelaPercent(idx) {
    setParcelasArr(prev => {
      const clone = [...prev];
      let raw = clone[idx]?.percent ?? "";
      if (raw === "") raw = "0";
      while (raw.length < 3) raw = "0" + raw;
      let inteiro = raw.slice(0, -2).replace(/^0+/, "") || "0";
      let decimal = raw.slice(-2);
      const num = Number(inteiro + "." + decimal);
      clone[idx] = { ...clone[idx], percent: isNaN(num) ? 0 : num };
      return clone;
    });
  }
  function handleChangeParcelaValue(e, idx) {
    setParcelasArr(prev => {
      const clone = [...prev];
      const value = (e.target.value ?? "").toString().replace(/\D/g, "");
      clone[idx] = { ...clone[idx], value };
      return clone;
    });
  }
  function handleChangeParcelaNome(e, idx) {
    setParcelasArr(prev => {
      const clone = [...prev];
      clone[idx] = { ...clone[idx], nome: e.target.value };
      return clone;
    });
  }
  function handleAddParcela() {
    setParcelasArr(prev => [
      ...prev,
      { nome: `${prev.length + 2}x`, percent: "", value: "" }
    ]);
  }
  function handleRemoveLastParcela() {
    setParcelasArr(prev => prev.slice(0, -1));
  }

  function handleChangeOutroPercent(e, idx) {
    setPercentInputOutros(prev => ({
      ...prev,
      [idx]: e.target.value.replace(/[^\d]/g, "")
    }));
  }
  function handleFocusOutroPercent(idx) {
    setEditingPercentOutros(prev => ({ ...prev, [idx]: true }));
    let val = outros[idx]?.percent;
    if (val === undefined || val === null) val = "";
    else {
      val = Math.round(Number(val) * 100).toString();
    }
    setPercentInputOutros(prev => ({
      ...prev,
      [idx]: val
    }));
  }
  function handleBlurOutroPercent(idx) {
    let raw = percentInputOutros[idx] ?? "";
    if (raw === "") raw = "0";
    while (raw.length < 3) raw = "0" + raw;
    let inteiro = raw.slice(0, -2).replace(/^0+/, "") || "0";
    let decimal = raw.slice(-2);
    const num = Number(inteiro + "." + decimal);
    setOutros(outros.map((o, i) => i === idx ? { ...o, percent: isNaN(num) ? 0 : num } : o));
    setEditingPercentOutros(prev => ({ ...prev, [idx]: false }));
    setPercentInputOutros(prev => ({ ...prev, [idx]: undefined }));
  }
  function handleChangeOutroValue(e, idx) {
    const value = (e.target.value ?? "").toString().replace(/\D/g, "");
    setOutros(outros.map((o, i) => i === idx ? { ...o, value } : o));
  }
  function handleRemoveOutro(idx) {
    setOutros(outros.filter((_, i) => i !== idx));
  }
  const [criandoOutro, setCriandoOutro] = useState(false);
  const [nomeNovoOutro, setNomeNovoOutro] = useState("");
  function handleAddOutro() {
    if (!nomeNovoOutro.trim()) return;
    setOutros([
      ...outros,
      { nome: nomeNovoOutro.trim(), percent: "", value: "" }
    ]);
    setNomeNovoOutro("");
    setCriandoOutro(false);
  }

  if (loading) return (
    <div style={{ color: "#fff", margin: 60, fontSize: 22, fontWeight: 700 }}>
      Carregando encargos sobre venda...
    </div>
  );

  return (
    <div className="encargos-main">
      <div className="encargos-title">Encargos sobre venda</div>
      <div className="encargos-cards-row">
        {SECTIONS.map(section => (
          <section key={section.title} className="encargos-card">
            <h3 className="encargos-section-title">{section.title}</h3>
            <div>
              {section.title === "4. Outros" ? (
                <>
                  {outros.map((outro, idx) => (
                    <div key={idx} className="encargos-field-row">
                      <span className="encargos-label">{outro.nome}:</span>
                      <div className="encargos-blocos-wrapper">
                        <div className="encargos-input-block">
                          <input
                            className="encargos-input-inner-percent"
                            type="text"
                            placeholder="0,00"
                            value={
                              editingPercentOutros[idx]
                                ? maskPercentBRLInput(percentInputOutros[idx] ?? "")
                                : formatPercentDisplay(outros[idx]?.percent)
                            }
                            onChange={e => handleChangeOutroPercent(e, idx)}
                            onFocus={() => handleFocusOutroPercent(idx)}
                            onBlur={() => handleBlurOutroPercent(idx)}
                            maxLength={13}
                            inputMode="numeric"
                            autoComplete="off"
                          />
                          <span className="encargos-suffix-percent">%</span>
                        </div>
                        <div className="encargos-input-block-money">
                          <span className="encargos-prefix-money">R$</span>
                          <input
                            className="encargos-input-inner-money"
                            type="text"
                            placeholder="0,00"
                            value={maskValueBRLInput(outro.value)}
                            onChange={e => handleChangeOutroValue(e, idx)}
                            onFocus={e => e.target.select()}
                            maxLength={12}
                            inputMode="numeric"
                            autoComplete="off"
                          />
                        </div>
                        <button
                          className="encargos-trash-btn"
                          aria-label="Excluir item"
                          onClick={() => handleRemoveOutro(idx)}
                          title="Excluir item"
                        >
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                            <path d="M9 3h6a1 1 0 0 1 1 1v1H8V4a1 1 0 0 1 1-1zm-3 4h12m-1 2v9a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V7m3 3v6m4-6v6"
                              stroke="#ff6b6b"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                  {criandoOutro ? (
                    <div className="encargos-field-row" style={{ justifyContent: "center" }}>
                      <input
                        className="encargos-input-inner-money"
                        style={{
                          minWidth: 160,
                          marginRight: 12,
                          background: "#22144c",
                          border: "2px solid #8c52ff",
                          borderRadius: 12,
                          color: "#fff"
                        }}
                        type="text"
                        autoFocus
                        placeholder="Nome do item"
                        value={nomeNovoOutro}
                        onChange={e => setNomeNovoOutro(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter") handleAddOutro();
                          if (e.key === "Escape") {
                            setCriandoOutro(false);
                            setNomeNovoOutro("");
                          }
                        }}
                      />
                      <button
                        className="encargos-add-parcela-btn"
                        style={{ padding: "0 18px", fontSize: 15, height: 36 }}
                        onClick={handleAddOutro}
                      >
                        Adicionar
                      </button>
                      <button
                        className="encargos-add-parcela-btn"
                        style={{ background: "#333", marginLeft: 8, padding: "0 15px", fontSize: 15, height: 36 }}
                        onClick={() => {
                          setCriandoOutro(false);
                          setNomeNovoOutro("");
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
                      <button
                        type="button"
                        className="encargos-add-parcela-btn"
                        style={{ marginTop: 0, padding: "0 22px", fontSize: 16 }}
                        onClick={() => setCriandoOutro(true)}
                      >
                        + Adicionar outro item
                      </button>
                    </div>
                  )}
                </>
              ) : (
                section.fields.map(field => (
                  <React.Fragment key={field.key}>
                    {field.isParcela ? (
                      <>
                        <div className="encargos-field-row">
                          <span className="encargos-label">{field.label}:</span>
                          <div className="encargos-blocos-wrapper">
                            <button
                              type="button"
                              className="encargos-add-parcela-btn"
                              onClick={handleAddParcela}
                            >
                              + Adicionar parcela
                            </button>
                            {parcelasArr.length > 0 && (
                              <button
                                className="encargos-trash-btn"
                                aria-label="Remover última parcela"
                                onClick={handleRemoveLastParcela}
                              >
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                  <path d="M9 3h6a1 1 0 0 1 1 1v1H8V4a1 1 0 0 1 1-1zm-3 4h12m-1 2v9a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V7m3 3v6m4-6v6"
                                    stroke="#ff6b6b"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                        {parcelasArr.map((parcela, idx) => (
                          <div key={"parcela-" + idx} className="encargos-field-row" style={{ marginLeft: 60 }}>
                            <div className="encargos-input-nome-parcela">
  {parcela.nome || `${idx + 2}x`}
</div>

                            <div className="encargos-blocos-wrapper">
                              <div className="encargos-input-block">
                                <input
                                  className="encargos-input-inner-percent"
                                  type="text"
                                  placeholder="0,00"
                                  value={
                                    typeof parcela.percent === "string"
                                      ? maskPercentBRLInput(parcela.percent)
                                      : formatPercentDisplay(parcela.percent)
                                  }
                                  onChange={e => handleChangeParcelaPercent(e, idx)}
                                  onFocus={() => handleFocusParcelaPercent(idx)}
                                  onBlur={() => handleBlurParcelaPercent(idx)}
                                  maxLength={13}
                                  inputMode="numeric"
                                  autoComplete="off"
                                />
                                <span className="encargos-suffix-percent">%</span>
                              </div>
                              <div className="encargos-input-block-money">
                                <span className="encargos-prefix-money">R$</span>
                                <input
                                  className="encargos-input-inner-money"
                                  type="text"
                                  placeholder="0,00"
                                  value={maskValueBRLInput(parcela.value || "")}
                                  onChange={e => handleChangeParcelaValue(e, idx)}
                                  onFocus={e => e.target.select()}
                                  maxLength={12}
                                  inputMode="numeric"
                                  autoComplete="off"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="encargos-field-row">
                        <span className="encargos-label">{field.label}:</span>
                        <div className="encargos-blocos-wrapper">
                          <div className="encargos-input-block">
                            <input
                              className="encargos-input-inner-percent"
                              type="text"
                              placeholder="0,00"
                              value={
                                editingPercent[field.key]
                                  ? maskPercentBRLInput(percentInput[field.key] ?? "")
                                  : formatPercentDisplay(data[field.key]?.percent)
                              }
                              onChange={e => handleChangePercent(e, field.key)}
                              onFocus={() => handleFocusPercent(field.key)}
                              onBlur={() => handleBlurPercent(field.key)}
                              maxLength={13}
                              inputMode="numeric"
                              autoComplete="off"
                            />
                            <span className="encargos-suffix-percent">%</span>
                          </div>
                          <div className="encargos-input-block-money">
                            <span className="encargos-prefix-money">R$</span>
                            <input
                              className="encargos-input-inner-money"
                              type="text"
                              placeholder="0,00"
                              value={maskValueBRLInput(data[field.key]?.value)}
                              onChange={e => handleChangeValue(e, field.key)}
                              onFocus={e => e.target.select()}
                              maxLength={12}
                              inputMode="numeric"
                              autoComplete="off"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                ))
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
