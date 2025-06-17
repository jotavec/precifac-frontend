import React, { useState, useEffect } from "react";

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

// Máscara para percentuais: igual valor em reais, mas só para % (ex: digita 1500, vira 15,00)
function maskPercentBRLInput(v) {
  v = (v ?? "").toString().replace(/[^\d]/g, "");
  if (v.length === 0) return "";
  while (v.length < 3) v = "0" + v;
  let inteiro = v.slice(0, -2);
  let decimal = v.slice(-2);
  inteiro = inteiro.replace(/^0+/, "") || "0";
  return inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "," + decimal;
}

// Exibição final, tira zeros desnecessários das casas decimais
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

export default function EncargosSobreVenda({ data, setData, outros, setOutros }) {
  // ----------- INÍCIO DA CORREÇÃO: Persistência do crédito parcelado -----------  
  // Estado para array de parcelas (persistente)
  const [parcelasArr, setParcelasArr] = useState(() => {
    // tenta pegar do data.creditoParcelado, que deve ser um array
    if (Array.isArray(data.creditoParcelado)) {
      return data.creditoParcelado;
    }
    return [];
  });

  // Sempre que mudar data.creditoParcelado fora, sincroniza
  useEffect(() => {
    if (Array.isArray(data.creditoParcelado)) {
      setParcelasArr(data.creditoParcelado);
    }
  }, [data.creditoParcelado]);

  // Sempre que mudar parcelasArr, salva no objeto data.creditoParcelado
  useEffect(() => {
    setData(prev => ({
      ...prev,
      creditoParcelado: parcelasArr
    }));
    // eslint-disable-next-line
  }, [parcelasArr]);
  // ----------- FIM DA CORREÇÃO -----------

  // Estados para edição dos percentuais
  const [editingPercent, setEditingPercent] = useState({});
  const [percentInput, setPercentInput] = useState({});

  const [editingPercentOutros, setEditingPercentOutros] = useState({});
  const [percentInputOutros, setPercentInputOutros] = useState({});

  // ----------- HANDLERS PARA PERCENTUAIS PADRÃO -----------

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

  // ----------- HANDLERS PARA PARCELAS (agora persistente!) -----------

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

  // ----------- HANDLERS PARA PERCENTUAIS OUTROS -----------

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

  // -------- STYLES ----------
  const inputBlock = {
    background: "#22144c",
    border: "2px solid #8c52ff",
    borderRadius: 16,
    color: "#fff",
    fontWeight: 600,
    fontSize: 18,
    height: 40,
    display: "flex",
    alignItems: "center",
    position: "relative",
    marginRight: 22,
    minWidth: 110,
    marginBottom: 0,
    transition: "border .2s"
  };
  const inputBlockMoney = {
    ...inputBlock,
    minWidth: 130,
    fontWeight: 700,
    marginRight: 0
  };
  const inputInnerPercent = {
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#fff",
    width: 84,
    fontWeight: 600,
    fontSize: 18,
    textAlign: "right",
    padding: "0 8px 0 0"
  };
  const inputInnerMoney = {
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#fff",
    width: 84,
    fontWeight: 700,
    fontSize: 18,
    textAlign: "right",
    padding: "0 10px 0 36px"
  };
  const prefixMoney = {
    position: "absolute",
    left: 13,
    color: "#b388ff",
    fontWeight: 600,
    fontSize: 17
  };
  const suffixPercent = {
    position: "absolute",
    right: 13,
    color: "#b388ff",
    fontWeight: 600,
    fontSize: 17
  };
  const labelStyle = {
    fontSize: 17,
    fontWeight: 500,
    minWidth: 240,
    color: "#e1d6fa"
  };
  const fieldRow = {
    display: "flex",
    alignItems: "center",
    marginBottom: 26,
    marginTop: 0
  };
  const blocosWrapper = {
    display: "flex",
    alignItems: "center",
    marginLeft: 32
  };
  const cardStyle = {
    background: "#18122a",
    borderRadius: 18,
    border: "2px solid #32235e",
    padding: "28px 32px 18px 32px",
    marginBottom: 38,
    boxShadow: "0 2px 12px #140c2a33",
    maxWidth: 800,
    marginLeft: 0,
    marginRight: 0
  };
  const sectionTitleStyle = {
    fontSize: 24,
    color: "#ffe060",
    marginBottom: 18,
    fontWeight: 700,
    letterSpacing: -1,
    background: "transparent"
  };
  const addParcelaButtonStyle = {
    background: "#8c52ff",
    color: "#fff",
    fontWeight: 700,
    fontSize: 17,
    borderRadius: 14,
    border: "none",
    padding: "0 28px",
    height: 40,
    cursor: "pointer",
    marginLeft: 5,
    letterSpacing: 0.5,
    transition: "background .2s",
    boxShadow: "0 1px 6px #0002"
  };
  const trashButtonStyle = {
    background: "transparent",
    border: "none",
    marginLeft: 14,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    padding: 0,
    outline: "none"
  };

  return (
    <div style={{
      color: "#fff",
      maxWidth: 800,
      margin: "36px 0 32px 0",
      marginLeft: 0,
      padding: "0"
    }}>
      {SECTIONS.map(section => (
        <section key={section.title} style={cardStyle}>
          <h3 style={sectionTitleStyle}>
            {section.title}
          </h3>
          <div>
            {section.title === "4. Outros" ? (
              <>
                {outros.map((outro, idx) => (
                  <div key={idx} style={fieldRow}>
                    <span style={labelStyle}>{outro.nome}:</span>
                    <div style={blocosWrapper}>
                      <div style={inputBlock}>
                        <input
                          style={inputInnerPercent}
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
                        <span style={suffixPercent}>%</span>
                      </div>
                      <div style={inputBlockMoney}>
                        <span style={prefixMoney}>R$</span>
                        <input
                          style={inputInnerMoney}
                          type="text"
                          placeholder="0,00"
                          value={maskValueBRLInput(outro.value)}
                          onChange={e => handleChangeOutroValue(e, idx)}
                          maxLength={12}
                          inputMode="numeric"
                          autoComplete="off"
                        />
                      </div>
                      <button
                        style={trashButtonStyle}
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
                  <div style={{ ...fieldRow, justifyContent: "center" }}>
                    <input
                      style={{
                        ...inputInnerMoney,
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
                      style={{
                        ...addParcelaButtonStyle,
                        padding: "0 18px",
                        fontSize: 15,
                        height: 36
                      }}
                      onClick={handleAddOutro}
                    >
                      Adicionar
                    </button>
                    <button
                      style={{
                        ...addParcelaButtonStyle,
                        background: "#333",
                        marginLeft: 8,
                        padding: "0 15px",
                        fontSize: 15,
                        height: 36
                      }}
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
                      style={{
                        ...addParcelaButtonStyle,
                        marginTop: 0,
                        padding: "0 22px",
                        fontSize: 16
                      }}
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
                      <div style={fieldRow}>
                        <span style={labelStyle}>{field.label}:</span>
                        <div style={blocosWrapper}>
                          <button
                            type="button"
                            style={addParcelaButtonStyle}
                            onClick={handleAddParcela}
                          >
                            + Adicionar parcela
                          </button>
                          {parcelasArr.length > 0 && (
                            <button
                              style={trashButtonStyle}
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
                        <div key={"parcela-" + idx} style={{ ...fieldRow, marginLeft: 60 }}>
                          <input
                            style={{
                              ...labelStyle,
                              minWidth: 40,
                              fontWeight: 700,
                              color: "#ffe060",
                              background: "transparent",
                              border: "none",
                              outline: "none",
                              width: 40
                            }}
                            type="text"
                            value={parcela.nome || `${idx + 2}x`}
                            onChange={e => handleChangeParcelaNome(e, idx)}
                            maxLength={20}
                          />
                          <div style={blocosWrapper}>
                            <div style={inputBlock}>
                              <input
                                style={inputInnerPercent}
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
                              <span style={suffixPercent}>%</span>
                            </div>
                            <div style={inputBlockMoney}>
                              <span style={prefixMoney}>R$</span>
                              <input
                                style={inputInnerMoney}
                                type="text"
                                placeholder="0,00"
                                value={maskValueBRLInput(parcela.value || "")}
                                onChange={e => handleChangeParcelaValue(e, idx)}
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
                    <div style={fieldRow}>
                      <span style={labelStyle}>{field.label}:</span>
                      <div style={blocosWrapper}>
                        <div style={inputBlock}>
                          <input
                            style={inputInnerPercent}
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
                          <span style={suffixPercent}>%</span>
                        </div>
                        <div style={inputBlockMoney}>
                          <span style={prefixMoney}>R$</span>
                          <input
                            style={inputInnerMoney}
                            type="text"
                            placeholder="0,00"
                            value={maskValueBRLInput(data[field.key].value)}
                            onChange={e => handleChangeValue(e, field.key)}
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
  );
}