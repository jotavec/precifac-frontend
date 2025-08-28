import React, { useRef, useState, useEffect } from "react";
import { API_PREFIX } from "../../services/api";
import { FaPlus, FaEdit, FaTrash, FaCalendarAlt } from "react-icons/fa";
import "./AbaProjecaoReceita.css";

function ModalNovoTipoProduto({ aberto, onClose, tipos, onAdd, onDelete, onEdit }) {
  const [novoTipo, setNovoTipo] = useState("");
  const [editandoIdx, setEditandoIdx] = useState(null);
  const [editNome, setEditNome] = useState("");
  if (!aberto) return null;

  function handleAddTipo(e) {
    e.preventDefault();
    const nome = (novoTipo || "").trim();
    if (nome) {
      onAdd(nome);
      setNovoTipo("");
    }
  }
  function handleStartEdit(idx) {
    setEditandoIdx(idx);
    setEditNome(tipos[idx].label);
  }
  function handleSaveEdit(idx) {
    if (editNome.trim()) {
      onEdit(idx, editNome.trim());
      setEditandoIdx(null);
    }
  }
  return (
    <div className="modal-novo-tipo-backdrop">
      <div className="modal-novo-tipo-box">
        <button onClick={onClose} className="modal-novo-tipo-fechar">×</button>
        <div className="modal-novo-tipo-titulo">Tipos de Produto</div>
        <div className="modal-novo-tipo-lista">
          {tipos.length === 0 && (
            <div style={{ color: "#b4c7e8", textAlign: "center", marginBottom: 16 }}>Nenhum tipo cadastrado</div>
          )}
          {tipos.map((tipo, idx) => (
            <div key={tipo.value} className="modal-novo-tipo-item">
              {editandoIdx === idx ? (
                <>
                  <input
                    className="modal-novo-tipo-input-edit"
                    value={editNome}
                    onChange={e => setEditNome(e.target.value)}
                  />
                  <button className="modal-novo-tipo-btn-icon" onClick={() => handleSaveEdit(idx)}>✓</button>
                  <button className="modal-novo-tipo-btn-icon" onClick={() => setEditandoIdx(null)}>✗</button>
                </>
              ) : (
                <>
                  <span>{tipo.label}</span>
                  <span style={{ display: "flex", gap: 6 }}>
                    {/* <button className="modal-novo-tipo-btn-icon" onClick={() => handleStartEdit(idx)}><FaEdit /></button> */}
                    <button className="modal-novo-tipo-btn-icon" onClick={() => onDelete(idx)}><FaTrash /></button>
                  </span>
                </>
              )}
            </div>
          ))}
        </div>
        <form className="modal-novo-tipo-form" onSubmit={handleAddTipo}>
          <input
            type="text"
            placeholder="Novo tipo"
            className="modal-novo-tipo-input"
            value={novoTipo}
            onChange={e => setNovoTipo(e.target.value)}
            maxLength={40}
            autoComplete="off"
          />
          <button type="submit" className="modal-novo-tipo-btn-add">Adicionar</button>
        </form>
      </div>
    </div>
  );
}

export default function AbaProjecaoReceita({
  ingredientes = [],
  subReceitas = [],
  embalagens = [],
  maoDeObra, setMaoDeObra,
  tipoSelecionado, setTipoSelecionado,
  rendimentoNumero, setRendimentoNumero,
  rendimentoUnidade, setRendimentoUnidade,
  tempoTotal, setTempoTotal,
  tempoUnidade, setTempoUnidade,
  custoUnitario,
  dataUltimaAtualizacao, setDataUltimaAtualizacao,
}) {
  const [showModalTipo, setShowModalTipo] = useState(false);
  const [showFormMaoObra, setShowFormMaoObra] = useState(false);
  const [formMaoObra, setFormMaoObra] = useState({ cargo: "", quantidade: "", unidade: "minutos" });
  const [editandoIdx, setEditandoIdx] = useState(null);
  const [profissoesDiretas, setProfissoesDiretas] = useState([]);
  const [cargosComValorHora, setCargosComValorHora] = useState([]);
  const [tiposProduto, setTiposProduto] = useState([]);
  const inputDateRef = useRef();

  useEffect(() => {
    fetchTiposProduto();
    fetchProfissoesDiretas();
    fetchCargosValorHora();
  }, []);

  async function fetchTiposProduto() {
    try {
      const res = await fetch(`${API_PREFIX}/receitas/tipos-produto`, { credentials: "include" });
      const data = await res.json();
      setTiposProduto(
        Array.isArray(data)
          ? data.map(tp => ({ value: tp.id, label: tp.nome }))
          : []
      );
    } catch (error) {
      setTiposProduto([]);
    }
  }

  async function handleAddTipo(novoNome) {
    try {
      const res = await fetch(`${API_PREFIX}/receitas/tipos-produto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ nome: novoNome }),
      });
      if (res.ok) {
        const data = await res.json();
        const novo = { value: data.id, label: data.nome };
        setTiposProduto(prev => [...prev, novo]);
        setTipoSelecionado(novo);
      }
    } catch (error) {
      alert("Erro ao adicionar tipo de produto.");
    }
  }

  async function handleDeleteTipo(idx) {
    const tipo = tiposProduto[idx];
    if (!tipo) return;
    try {
      const res = await fetch(`${API_PREFIX}/receitas/tipos-produto/${tipo.value}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setTiposProduto(arr => arr.filter((_, i) => i !== idx));
        if (tipoSelecionado && tipoSelecionado.value === tipo.value) {
          setTipoSelecionado(null);
        }
      }
    } catch (error) {
      alert("Erro ao remover tipo de produto.");
    }
  }

  function handleEditTipo(idx, novoNome) {
    // Futuro: implementar PUT
  }

  useEffect(() => {
    if (!tipoSelecionado || !tiposProduto.length) return;
    const found = tiposProduto.find(t => t.value === tipoSelecionado.value);
    if (!found) setTipoSelecionado(null);
  }, [tiposProduto]);

  const opcoesRendimento = [
    { value: "unidade", label: "Unidade (un)" },
    { value: "grama", label: "Grama (g)" },
    { value: "quilo", label: "Quilo (kg)" },
    { value: "litro", label: "Litro (l)" },
    { value: "mililitro", label: "Mililitro (ml)" },
  ];
  const opcoesTempo = [
    { value: "minutos", label: "minutos" },
    { value: "horas", label: "horas" },
    { value: "dias", label: "dias" },
  ];

  function calcularValorHoraFuncionario(f) {
    const salario = Number(String(f.salario).replace(/\./g, '').replace(',', '.')) || 0;
    const horas = Number(f.totalHorasMes || 220) || 1;
    return salario && horas ? salario / horas : 0;
  }
  async function fetchProfissoesDiretas() {
    try {
      const res = await fetch(`${API_PREFIX}/folhapagamento/funcionarios/profissoes-diretas`, { credentials: "include" });
      const data = await res.json();
      setProfissoesDiretas(Array.isArray(data) ? data.map(cargo => ({ value: cargo, label: cargo })) : []);
    } catch (error) {
      setProfissoesDiretas([]);
    }
  }
  async function fetchCargosValorHora() {
    try {
      const res = await fetch(`${API_PREFIX}/folhapagamento/funcionarios`, { credentials: "include" });
      const data = await res.json();
      const cargos = Array.isArray(data) ? data.map(f => ({ cargo: f.cargo, valorHora: calcularValorHoraFuncionario(f) })) : [];
      setCargosComValorHora(cargos);
    } catch (error) {
      setCargosComValorHora([]);
    }
  }

  const custoMaoObra = maoDeObra.reduce((acc, cur) => acc + (Number(cur.valorTotal) || 0), 0);
  const custoIngredientes = ingredientes.reduce((acc, cur) => acc + (Number(cur.valorTotal) || 0), 0);
  const custoReceitas = subReceitas.reduce((acc, cur) => acc + (Number(cur.valorTotal) || 0), 0);
  const custoEmbalagem = embalagens.reduce((acc, cur) => acc + (Number(cur.valorTotal) || 0), 0);

  const totalCustos = custoMaoObra + custoIngredientes + custoReceitas + custoEmbalagem;

  return (
    <>
      <ModalNovoTipoProduto
        aberto={showModalTipo}
        onClose={() => setShowModalTipo(false)}
        tipos={tiposProduto}
        onAdd={handleAddTipo}
        onDelete={handleDeleteTipo}
        onEdit={handleEditTipo}
      />
      <div className="aba-projecao-main">
        <div className="aba-projecao-row">
          <div>
            <div className="aba-projecao-bloco bloco-dados-produto">
              <div className="aba-projecao-titulo">Dados do Produto</div>
              <div className="aba-projecao-linha" style={{ marginBottom: 30 }}>
                <span className="aba-projecao-label">Tipo do Produto</span>
                <div style={{ flex: 1, display: "flex", gap: 12 }}>
                  <select
                    className="aba-projecao-select"
                    value={tipoSelecionado?.value || ""}
                    onChange={e => {
                      const found = tiposProduto.find(t => t.value === e.target.value);
                      setTipoSelecionado(found || null);
                    }}
                  >
                    <option value="">Selecione...</option>
                    {tiposProduto.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <button
                    className="aba-projecao-btn-icon"
                    onClick={() => setShowModalTipo(true)}
                    type="button"
                    title="Adicionar novo tipo"
                  >
                    <FaPlus size={22} />
                  </button>
                </div>
              </div>
              <div className="aba-projecao-linha" style={{ marginBottom: 30 }}>
                <span className="aba-projecao-label">Última Atualização</span>
                <div className="input-icon-wrapper">
                  <input
                    ref={inputDateRef}
                    type="date"
                    className="aba-projecao-input input-date-hide-arrows"
                    placeholder="dd/mm/aaaa"
                    value={dataUltimaAtualizacao || ""}
                    onChange={e => setDataUltimaAtualizacao(e.target.value)}
                    style={{ paddingRight: 38 }}
                  />
                  <FaCalendarAlt
                    className="input-icon"
                    style={{ right: 16, cursor: "pointer" }}
                    onClick={() => {
                      if (inputDateRef.current) {
                        inputDateRef.current.showPicker
                          ? inputDateRef.current.showPicker()
                          : inputDateRef.current.focus();
                      }
                    }}
                  />
                </div>
              </div>
              <div className="aba-projecao-linha" style={{ marginBottom: 0 }}>
                <span className="aba-projecao-label">Rendimento</span>
                <div style={{ flex: 1, display: "flex", gap: 8 }}>
                  <input
                    className="aba-projecao-input"
                    placeholder="Ex: 1"
                    value={rendimentoNumero}
                    onChange={e => setRendimentoNumero(e.target.value)}
                  />
                  <select
                    className="aba-projecao-pill-select"
                    value={rendimentoUnidade}
                    onChange={e => setRendimentoUnidade(e.target.value)}
                  >
                    {opcoesRendimento.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="aba-projecao-bloco bloco-tempo-preparo">
              <div className="aba-projecao-titulo">Tempo de Preparo</div>
              <div className="aba-projecao-linha linha-btn-direita linha-tempo-total">
                <span className="aba-projecao-label">Tempo de Preparo (Total)</span>
                <div className="tempo-total-inputs">
                  <input
                    className="aba-projecao-input tamanho-pequeno"
                    placeholder="Ex: 35"
                    value={tempoTotal}
                    onChange={e => setTempoTotal(e.target.value)}
                  />
                  <select
                    className="aba-projecao-pill-select select-tamanho-medio"
                    value={tempoUnidade}
                    onChange={e => setTempoUnidade(e.target.value)}
                  >
                    {opcoesTempo.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="aba-projecao-linha linha-btn-direita">
                <span className="aba-projecao-label">Tempo de Preparo (Mão de Obra)</span>
                <button
                  className="aba-projecao-btn-add btn-adicionar-mao-obra"
                  onClick={() => {
                    setShowFormMaoObra(true);
                    setFormMaoObra({ cargo: "", quantidade: "", unidade: "minutos" });
                    setEditandoIdx(null);
                  }}
                  type="button"
                >
                  + Adicionar
                </button>
              </div>
              <div
                style={{
                  background: "#f8fafd",
                  borderRadius: 16,
                  marginTop: 16,
                  padding: 0,
                  overflow: "hidden",
                  border: "1.5px solid #e1e9f7",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 0
                }}
              >
                <div
                  className="aba-projecao-tabela-scroll"
                  style={{
                    overflowY: "auto",
                    overflowX: "hidden",
                    flex: 1,
                    maxHeight: "210px",
                    minHeight: 0
                  }}
                >
                  <table className="aba-projecao-tabela" style={{ tableLayout: "fixed", width: "100%" }}>
                    <colgroup>
                      <col style={{ width: "20%" }} />
                      <col style={{ width: "18%" }} />
                      <col style={{ width: "15%" }} />
                      <col style={{ width: "15%" }} />
                      <col style={{ width: "18%" }} />
                      <col style={{ width: "14%" }} />
                    </colgroup>
                    <thead>
                      <tr>
                        <th className="aba-projecao-th">CARGO</th>
                        <th className="aba-projecao-th">VALOR/HORA</th>
                        <th className="aba-projecao-th">TEMPO</th>
                        <th className="aba-projecao-th">UNID.</th>
                        <th className="aba-projecao-th">VALOR TOTAL</th>
                        <th className="aba-projecao-th">AÇÕES</th>
                      </tr>
                    </thead>
                    <tbody>
                      {showFormMaoObra && editandoIdx === null && (
                        <tr style={{ background: '#e8f4fd' }}>
                          <td className="aba-projecao-td">
                            <select
                              className="aba-projecao-input"
                              style={{ width: "100%", minWidth: 0, maxWidth: "100%", padding: '0 5px' }}
                              value={formMaoObra.cargo}
                              onChange={e => setFormMaoObra(f => ({ ...f, cargo: e.target.value }))}
                            >
                              <option value="">Selecione</option>
                              {profissoesDiretas.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          </td>
                          <td className="aba-projecao-td-right">
                            {formMaoObra.cargo
                              ? (cargosComValorHora.find(c => c.cargo === formMaoObra.cargo)?.valorHora || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                              : "--"}
                          </td>
                          <td className="aba-projecao-td">
                            <input
                              className="aba-projecao-input"
                              style={{ width: "100%", minWidth: 0, maxWidth: "100%", padding: '0 7px' }}
                              type="number"
                              value={formMaoObra.quantidade}
                              onChange={e => setFormMaoObra(f => ({ ...f, quantidade: e.target.value }))}
                              min="0"
                            />
                          </td>
                          <td className="aba-projecao-td">
                            <select
                              className="aba-projecao-input"
                              style={{ width: "100%", minWidth: 0, maxWidth: "100%", padding: '0 5px' }}
                              value={formMaoObra.unidade}
                              onChange={e => setFormMaoObra(f => ({ ...f, unidade: e.target.value }))}
                            >
                              <option value="minutos">minutos</option>
                              <option value="horas">horas</option>
                              <option value="dias">dias</option>
                            </select>
                          </td>
                          <td className="aba-projecao-td-right">
                            {(() => {
                              const cargo = cargosComValorHora.find(c => c.cargo === formMaoObra.cargo);
                              const valorHora = cargo?.valorHora || 0;
                              let valorTotal = 0;
                              if (formMaoObra.unidade === "minutos") {
                                valorTotal = (Number(formMaoObra.quantidade) / 60) * valorHora;
                              } else if (formMaoObra.unidade === "horas") {
                                valorTotal = Number(formMaoObra.quantidade) * valorHora;
                              } else if (formMaoObra.unidade === "dias") {
                                valorTotal = Number(formMaoObra.quantidade) * valorHora * 8;
                              }
                              return isNaN(valorTotal) ? "--" : valorTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
                            })()}
                          </td>
                          <td className="aba-projecao-td">
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                              <button
                                className="modal-novo-tipo-btn-icon"
                                onClick={() => {
                                  if (!formMaoObra.cargo || !formMaoObra.quantidade) return;
                                  const cargoInfo = cargosComValorHora.find(c => c.cargo === formMaoObra.cargo);
                                  const valorHora = cargoInfo?.valorHora || 0;
                                  let valorTotal = 0;
                                  if (formMaoObra.unidade === "minutos") {
                                    valorTotal = (Number(formMaoObra.quantidade) / 60) * valorHora;
                                  } else if (formMaoObra.unidade === "horas") {
                                    valorTotal = Number(formMaoObra.quantidade) * valorHora;
                                  } else if (formMaoObra.unidade === "dias") {
                                    valorTotal = Number(formMaoObra.quantidade) * valorHora * 8;
                                  }
                                  setMaoDeObra(prev => [
                                    ...prev,
                                    {
                                      ...formMaoObra,
                                      label: profissoesDiretas.find(p => p.value === formMaoObra.cargo)?.label || "",
                                      valorHora,
                                      valorTotal,
                                    },
                                  ]);
                                  setShowFormMaoObra(false);
                                  setFormMaoObra({ cargo: "", quantidade: "", unidade: "minutos" });
                                }}
                                type="button"
                              >✓</button>
                              <button
                                className="modal-novo-tipo-btn-icon"
                                onClick={() => {
                                  setShowFormMaoObra(false);
                                  setFormMaoObra({ cargo: "", quantidade: "", unidade: "minutos" });
                                }}
                                type="button"
                              >✗</button>
                            </div>
                          </td>
                        </tr>
                      )}
                      {maoDeObra.length === 0 && !showFormMaoObra && (
                        <tr>
                          <td colSpan={6} style={{ color: "#b4c7e8", textAlign: "center", padding: 18, fontWeight: 700, fontSize: 16 }}>Nenhuma mão de obra adicionada</td>
                        </tr>
                      )}
                      {maoDeObra.map((item, idx) =>
                        editandoIdx === idx ? (
                          <tr key={idx} style={{ background: "#e1e9f7" }}>
                            <td className="aba-projecao-td">
                              <select
                                className="aba-projecao-input"
                                style={{ width: "100%", minWidth: 0, maxWidth: "100%", padding: '0 5px' }}
                                value={formMaoObra.cargo}
                                onChange={e => setFormMaoObra(f => ({ ...f, cargo: e.target.value }))}
                              >
                                <option value="">Selecione</option>
                                {profissoesDiretas.map(opt => (
                                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                              </select>
                            </td>
                            <td className="aba-projecao-td-right">
                              {formMaoObra.cargo
                                ? (cargosComValorHora.find(c => c.cargo === formMaoObra.cargo)?.valorHora || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                                : "--"}
                            </td>
                            <td className="aba-projecao-td">
                              <input
                                className="aba-projecao-input"
                                style={{ width: "100%", minWidth: 0, maxWidth: "100%", padding: '0 7px' }}
                                type="number"
                                value={formMaoObra.quantidade}
                                onChange={e => setFormMaoObra(f => ({ ...f, quantidade: e.target.value }))}
                                min="0"
                              />
                            </td>
                            <td className="aba-projecao-td">
                              <select
                                className="aba-projecao-input"
                                style={{ width: "100%", minWidth: 0, maxWidth: "100%", padding: '0 5px' }}
                                value={formMaoObra.unidade}
                                onChange={e => setFormMaoObra(f => ({ ...f, unidade: e.target.value }))}
                              >
                                <option value="minutos">minutos</option>
                                <option value="horas">horas</option>
                                <option value="dias">dias</option>
                              </select>
                            </td>
                            <td className="aba-projecao-td-right">
                              {(() => {
                                const cargo = cargosComValorHora.find(c => c.cargo === formMaoObra.cargo);
                                const valorHora = cargo?.valorHora || 0;
                                let valorTotal = 0;
                                if (formMaoObra.unidade === "minutos") {
                                  valorTotal = (Number(formMaoObra.quantidade) / 60) * valorHora;
                                } else if (formMaoObra.unidade === "horas") {
                                  valorTotal = Number(formMaoObra.quantidade) * valorHora;
                                } else if (formMaoObra.unidade === "dias") {
                                  valorTotal = Number(formMaoObra.quantidade) * valorHora * 8;
                                }
                                return isNaN(valorTotal) ? "--" : valorTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
                              })()}
                            </td>
                            <td className="aba-projecao-td">
                              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                                <button
                                  className="modal-novo-tipo-btn-icon"
                                  onClick={() => {
                                    if (!formMaoObra.cargo || !formMaoObra.quantidade) return;
                                    const cargoInfo = cargosComValorHora.find(c => c.cargo === formMaoObra.cargo);
                                    const valorHora = cargoInfo?.valorHora || 0;
                                    let valorTotal = 0;
                                    if (formMaoObra.unidade === "minutos") {
                                      valorTotal = (Number(formMaoObra.quantidade) / 60) * valorHora;
                                    } else if (formMaoObra.unidade === "horas") {
                                      valorTotal = Number(formMaoObra.quantidade) * valorHora;
                                    } else if (formMaoObra.unidade === "dias") {
                                      valorTotal = Number(formMaoObra.quantidade) * valorHora * 8;
                                    }
                                    setMaoDeObra(prev =>
                                      prev.map((item, i) =>
                                        i === idx
                                          ? {
                                            ...formMaoObra,
                                            label: profissoesDiretas.find(p => p.value === formMaoObra.cargo)?.label || "",
                                            valorHora,
                                            valorTotal,
                                          }
                                          : item
                                      )
                                    );
                                    setEditandoIdx(null);
                                    setFormMaoObra({ cargo: "", quantidade: "", unidade: "minutos" });
                                  }}
                                  type="button"
                                >✓</button>
                                <button
                                  className="modal-novo-tipo-btn-icon"
                                  onClick={() => {
                                    setEditandoIdx(null);
                                    setFormMaoObra({ cargo: "", quantidade: "", unidade: "minutos" });
                                  }}
                                  type="button"
                                >✗</button>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          <tr key={idx}>
                            <td className="aba-projecao-td">{item.label}</td>
                            <td className="aba-projecao-td-right">{(item.valorHora || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                            <td className="aba-projecao-td" style={{ textAlign: 'center' }}>{item.quantidade}</td>
                            <td className="aba-projecao-td" style={{ textAlign: 'center' }}>{item.unidade}</td>
                            <td className="aba-projecao-td-right">{(item.valorTotal || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                            <td className="aba-projecao-td" style={{ textAlign: 'center' }}>
                              <button
                                className="modal-novo-tipo-btn-icon"
                                onClick={() => {
                                  setEditandoIdx(idx);
                                  setFormMaoObra({
                                    cargo: item.cargo || "",
                                    quantidade: item.quantidade || "",
                                    unidade: item.unidade || "minutos"
                                  });
                                  setShowFormMaoObra(false);
                                }}
                                type="button"
                              ><FaEdit /></button>
                              <button
                                className="modal-novo-tipo-btn-icon"
                                onClick={() => setMaoDeObra(maoDeObra.filter((_, i) => i !== idx))}
                                type="button"
                              ><FaTrash /></button>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="aba-projecao-bloco">
          <div className="aba-projecao-titulo">Custos</div>
          <table className="aba-projecao-tabela" style={{ marginTop: 16 }}>
            <thead>
              <tr>
                <th className="aba-projecao-th-left">Custos</th>
                <th className="aba-projecao-th-right">Valor</th>
                <th className="aba-projecao-th-right">%</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="aba-projecao-td">Mão de Obra Direta</td>
                <td className="aba-projecao-td-right">{custoMaoObra.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td className="aba-projecao-td-right">{totalCustos > 0 ? ((custoMaoObra / totalCustos) * 100).toFixed(0) + '%' : '0%'}</td>
              </tr>
              <tr>
                <td className="aba-projecao-td">Ingredientes</td>
                <td className="aba-projecao-td-right">{custoIngredientes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td className="aba-projecao-td-right">{totalCustos > 0 ? ((custoIngredientes / totalCustos) * 100).toFixed(0) + '%' : '0%'}</td>
              </tr>
              <tr>
                <td className="aba-projecao-td">Receitas</td>
                <td className="aba-projecao-td-right">{custoReceitas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td className="aba-projecao-td-right">{totalCustos > 0 ? ((custoReceitas / totalCustos) * 100).toFixed(0) + '%' : '0%'}</td>
              </tr>
              <tr>
                <td className="aba-projecao-td">Embalagem</td>
                <td className="aba-projecao-td-right">{custoEmbalagem.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td className="aba-projecao-td-right">{totalCustos > 0 ? ((custoEmbalagem / totalCustos) * 100).toFixed(0) + '%' : '0%'}</td>
              </tr>
              <tr>
                <td className="aba-projecao-td" style={{ color: "#97a6ba", fontWeight: 900 }}>TOTAL</td>
                <td className="aba-projecao-td-right" style={{ color: "#97a6ba", fontWeight: 900 }}>{totalCustos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td className="aba-projecao-td-right" style={{ color: "#97a6ba", fontWeight: 900 }}>{totalCustos > 0 ? '100%' : '0%'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
