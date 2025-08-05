import React, { useEffect, useState } from "react";
import Select from "react-select";
import { FaTrash } from "react-icons/fa";
import "./AbaComposicaoReceita.css";

function formatarCustoUn(custo, unidade) {
  const val = Number(custo);
  if (isNaN(val)) return "-";
  const unidadesQuatroCasas = [
    "Grama (g)", "Miligrama (mg)", "Micrograma (mcg)",
    "Mililitro (ml)", "Centímetro (cm)", "Milímetro (mm)"
  ];
  const casas = unidadesQuatroCasas.includes(unidade) ? 4 : 2;
  return `R$ ${val.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas })}`;
}
function formatarDinheiro(valor, casas = 2) {
  const n = Number(valor);
  if (isNaN(n)) return "-";
  // Corrige -0,00 para 0,00
  const valCorrigido = Math.abs(n) < 0.005 ? 0 : n;
  return `R$ ${valCorrigido.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas })}`;
}

// --- Função para renderizar marca como lista ---
function renderizaMarcas(marca) {
  if (!marca) return "-";
  if (Array.isArray(marca)) {
    if (marca.length === 0) return "-";
    return (
      <ul style={{ margin: 0, paddingLeft: 20 }}>
        {marca.map((m, i) => (
          <li key={i} style={{ margin: 0, padding: 0, lineHeight: 1.2 }}>{m}</li>
        ))}
      </ul>
    );
  }
  if (typeof marca === "string" && marca.includes(",")) {
    return (
      <ul style={{ margin: 0, paddingLeft: 20 }}>
        {marca.split(",").map((m, i) => (
          <li key={i} style={{ margin: 0, padding: 0, lineHeight: 1.2 }}>{m.trim()}</li>
        ))}
      </ul>
    );
  }
  return marca;
}

// Função para garantir número
function parseBRL(valor) {
  if (typeof valor === "number") return valor;
  if (!valor) return 0;
  const valorLimpo = String(valor).replace(/[^0-9,.]/g, "").replace(",", ".");
  if (valorLimpo === "" || isNaN(valorLimpo)) return 0;
  return Number(valorLimpo);
}

export default function AbaComposicaoReceita({
  ingredientes,
  setIngredientes,
  subReceitas,
  setSubReceitas,
  embalagens,
  setEmbalagens,
}) {
  const [produtosEstoque, setProdutosEstoque] = useState([]);
  const [todasReceitas, setTodasReceitas] = useState([]);

  useEffect(() => {
    fetchProdutosEstoque();
    fetchTodasReceitas();
  }, []);

  async function fetchProdutosEstoque() {
    try {
      const res = await fetch("http://localhost:3000/api/produtos");
      const data = await res.json();
      setProdutosEstoque(Array.isArray(data) ? data : []);
    } catch {
      setProdutosEstoque([]);
    }
  }

  async function fetchTodasReceitas() {
    try {
      const res = await fetch("/api/receitas", { credentials: "include" });
      const data = await res.json();
      setTodasReceitas(Array.isArray(data) ? data : []);
    } catch {
      setTodasReceitas([]);
    }
  }

  const options = produtosEstoque.map(p => ({
    value: String(p.id),
    label: p.nome,
    produto: p
  }));

  // SUB RECEITAS: Só as que são bloco "subreceita"
  const optionsSubReceita = todasReceitas
    .filter(r => String(r.blocoMarkupAtivo) === "subreceita")
    .map(r => ({
      value: String(r.id),
      label: r.nomeProduto || r.name || "(sem nome)",
      receita: r
    }));

  // Styles padrão para todos os Selects
  const selectStyles = {
    menuPortal: base => ({ ...base, zIndex: 99999 }),
    control: base => ({
      ...base,
      minHeight: 36,
      background: "#f8fafc",
      color: "#2196f3",
      borderRadius: 8,
      border: "1.6px solid #e1e9f7",
      fontSize: "1.04rem",
      boxShadow: "none"
    }),
    input: base => ({ ...base, color: "#2196f3" }),
    singleValue: base => ({ ...base, color: "#2196f3" }),
  };

  // Função utilitária para buscar receita da subreceita
  function getReceitaPorId(id) {
    return todasReceitas.find(r => String(r.id) === String(id));
  }
  // Função para calcular custo unitário da subreceita (igual à CentralReceitas)
  function calcularCustoUnitario(receita) {
    if (!receita) return null;
    const ing = receita.ingredientes || [];
    const sub = receita.subReceitas || [];
    const emb = receita.embalagens || [];
    const mao = receita.maoDeObra || [];
    const rend = receita.rendimentoNumero || receita.yieldQty || "";
    const custoTotal =
      ing.reduce((acc, cur) => acc + (Number(cur.valorTotal) || 0), 0) +
      sub.reduce((acc, cur) => acc + (Number(cur.valorTotal) || 0), 0) +
      emb.reduce((acc, cur) => acc + (Number(cur.valorTotal) || 0), 0) +
      mao.reduce((acc, cur) => acc + (Number(cur.valorTotal) || 0), 0);
    return rend && custoTotal > 0 ? (custoTotal / Number(rend)) : null;
  }

  // --------- Atualizar valorTotal sempre que subReceita ou quantidade mudarem ---------
  useEffect(() => {
    setSubReceitas(arr =>
      arr.map(item => {
        const receitaSelecionada = getReceitaPorId(item.receitaId);
        const custoUn = calcularCustoUnitario(receitaSelecionada);
        const qt = Number(item.qt) || 0;
        const valorTotal = custoUn != null && !isNaN(qt) ? custoUn * qt : 0;
        return { ...item, valorTotal };
      })
    );
    // eslint-disable-next-line
  }, [todasReceitas, subReceitas.length]);

  return (
    <div className="aba-comp-main">
      {/* INGREDIENTES */}
      <div className="aba-comp-bloco">
        <div className="aba-comp-titulo">Ingredientes</div>
        <table className="aba-comp-tabela">
          <thead>
            <tr>
              <th className="aba-comp-th">Ingredientes</th>
              <th className="aba-comp-th">Marca</th>
              <th className="aba-comp-th">Qt Emb.</th>
              <th className="aba-comp-th">Un. Medida</th>
              <th className="aba-comp-th">Preço Emb.</th>
              <th className="aba-comp-th">Qt.</th>
              <th className="aba-comp-th">Custo Un.</th>
              <th className="aba-comp-th">Custo Total</th>
              <th className="aba-comp-th">Ação</th>
            </tr>
          </thead>
          <tbody>
            {ingredientes.length === 0 ? (
              <tr>
                <td colSpan={9} className="aba-comp-td-vazia">
                  Nenhum ingrediente adicionado
                </td>
              </tr>
            ) : ingredientes.map((item, idx) => {
              const optionSelecionada = options.find(o => o.value === String(item.produtoId));
              let marca = item.marca, qtEmb = item.qtEmb, unMedida = item.unMedida, precoEmb = item.precoEmb;
              if (optionSelecionada && optionSelecionada.produto) {
                const prod = optionSelecionada.produto;
                marca = prod.marca;
                qtEmb = prod.totalEmbalagem;
                unMedida = prod.unidade;
                precoEmb = prod.custoTotal;
              }
              const custoUn = (precoEmb && qtEmb) ? (Number(precoEmb) / Number(qtEmb)) : null;
              const custoTotalItem = item.valorTotal;

              return (
                <tr key={idx}>
                  <td className="aba-comp-td">
                    <Select
                      placeholder="Selecione..."
                      value={optionSelecionada || null}
                      onChange={selected => {
                        setIngredientes(arr =>
                          arr.map((i, iidx) => {
                            if (iidx !== idx) return i;
                            if (!selected) {
                              return { produtoId: null, marca: "", qtEmb: "", unMedida: "", precoEmb: "", qtUsada: "", valorTotal: 0 };
                            }
                            const produto = selected.produto;
                            return {
                              ...i,
                              produtoId: String(produto.id),
                              marca: produto.marca,
                              qtEmb: produto.totalEmbalagem,
                              unMedida: produto.unidade,
                              precoEmb: produto.custoTotal,
                              qtUsada: "",
                              valorTotal: 0,
                            };
                          })
                        );
                      }}
                      options={options}
                      isClearable
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      styles={selectStyles}
                    />
                  </td>
                  <td className="aba-comp-td">{renderizaMarcas(marca)}</td>
                  <td className="aba-comp-td">{qtEmb || "-"}</td>
                  <td className="aba-comp-td">{unMedida || "-"}</td>
                  <td className="aba-comp-td">{precoEmb ? formatarDinheiro(precoEmb) : "-"}</td>
                  <td className="aba-comp-td">
                    <input
                      type="number"
                      min={0}
                      value={item.qtUsada || ""}
                      className="aba-comp-input"
                      disabled={!item.produtoId}
                      onChange={e => {
                        const qt = e.target.value;
                        setIngredientes(arr =>
                          arr.map((i, iidx) => {
                            if (iidx !== idx) return i;
                            const precoEmb = Number(i.precoEmb);
                            const qtEmb = Number(i.qtEmb);
                            const qtUsada = Number(qt);
                            const custoUn = (precoEmb && qtEmb) ? precoEmb / qtEmb : 0;
                            const valorTotal = (custoUn && qtUsada) ? custoUn * qtUsada : 0;
                            return { ...i, qtUsada: qt, valorTotal };
                          })
                        );
                      }}
                    />
                  </td>
                  <td className="aba-comp-td">{precoEmb && qtEmb ? formatarCustoUn(custoUn, unMedida) : "-"}</td>
                  <td className="aba-comp-td">
                    {custoTotalItem != null && !isNaN(custoTotalItem)
                      ? formatarDinheiro(custoTotalItem, 4)
                      : "-"}
                  </td>
                  <td className="aba-comp-td">
                    <button
                      type="button"
                      className="aba-comp-btn-excluir"
                      onClick={() => setIngredientes(arr => arr.filter((_, iidx) => iidx !== idx))}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <button
          className="aba-comp-btn-add"
          onClick={() => setIngredientes([...ingredientes, {
            produtoId: null, marca: "", qtEmb: "", unMedida: "", precoEmb: "", qtUsada: "", valorTotal: 0
          }])}
        >
          + Adicionar Ingrediente
        </button>
      </div>

      {/* SUB RECEITAS */}
      <div className="aba-comp-bloco">
        <div className="aba-comp-titulo">Sub Receitas</div>
        <table className="aba-comp-tabela">
          <thead>
            <tr>
              <th className="aba-comp-th">Receitas</th>
              <th className="aba-comp-th">Tipo</th>
              <th className="aba-comp-th">Qt.</th>
              <th className="aba-comp-th">Medida</th>
              <th className="aba-comp-th">Custo Un.</th>
              <th className="aba-comp-th">Custo Porção</th>
              <th className="aba-comp-th">Ação</th>
            </tr>
          </thead>
          <tbody>
            {subReceitas.length === 0 ? (
              <tr>
                <td colSpan={7} className="aba-comp-td-vazia">
                  Nenhuma sub receita adicionada
                </td>
              </tr>
            ) : subReceitas.map((item, idx) => {
              // --- Select para SUB RECEITA ---
              const optionSelecionada = optionsSubReceita.find(o => o.value === String(item.receitaId));
              const receitaSelecionada = getReceitaPorId(item.receitaId);
              const tipo = receitaSelecionada?.tipoSelecionado?.label || "";
              const medida = receitaSelecionada?.rendimentoUnidade || receitaSelecionada?.yieldUnit || "";
              const custoUn = calcularCustoUnitario(receitaSelecionada);
              const qt = Number(item.qt) || 0;
              const custoPorcao = custoUn != null && !isNaN(qt) ? custoUn * qt : null;

              return (
                <tr key={idx}>
                  <td className="aba-comp-td">
                    <Select
                      placeholder="Selecione a receita..."
                      value={optionSelecionada || null}
                      onChange={selected => {
                        setSubReceitas(arr =>
                          arr.map((i, iidx) => {
                            if (iidx !== idx) return i;
                            if (!selected) {
                              return { receitaId: null, tipo: "", qt: "", medida: "", valorTotal: 0 };
                            }
                            const receita = selected.receita;
                            // Calcular valorTotal direto aqui!
                            const custoUn = calcularCustoUnitario(receita);
                            const qtAtual = Number(i.qt) || 0;
                            const valorTotal = custoUn != null && !isNaN(qtAtual) ? custoUn * qtAtual : 0;
                            return {
                              ...i,
                              receitaId: String(receita.id),
                              tipo: receita.tipoSelecionado?.label || "",
                              qt: "",
                              medida: receita.rendimentoUnidade || "",
                              valorTotal,
                            };
                          })
                        );
                      }}
                      options={optionsSubReceita}
                      isClearable
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      styles={selectStyles}
                    />
                  </td>
                  <td className="aba-comp-td">{tipo}</td>
                  <td className="aba-comp-td">
                    <input
                      type="number"
                      value={item.qt || ""}
                      min={0}
                      onChange={e => {
                        const val = e.target.value;
                        setSubReceitas(arr => arr.map((i, iidx) => {
                          if (iidx !== idx) return i;
                          const receita = getReceitaPorId(i.receitaId);
                          const custoUn = calcularCustoUnitario(receita);
                          const qtAtual = Number(val) || 0;
                          const valorTotal = custoUn != null && !isNaN(qtAtual) ? custoUn * qtAtual : 0;
                          return { ...i, qt: val, valorTotal };
                        }));
                      }}
                      className="aba-comp-input"
                    />
                  </td>
                  <td className="aba-comp-td">{medida}</td>
                  <td className="aba-comp-td">
                    {custoUn != null ? formatarCustoUn(custoUn, medida) : "-"}
                  </td>
                  <td className="aba-comp-td">
                    {custoPorcao != null && !isNaN(custoPorcao)
                      ? formatarDinheiro(custoPorcao, 4)
                      : "-"}
                  </td>
                  <td className="aba-comp-td">
                    <button
                      type="button"
                      className="aba-comp-btn-excluir"
                      onClick={() => setSubReceitas(arr => arr.filter((_, iidx) => iidx !== idx))}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <button
          className="aba-comp-btn-add"
          onClick={() => setSubReceitas([...subReceitas, { receitaId: null, tipo: "", qt: "", medida: "", valorTotal: 0 }])}
        >
          + Adicionar Sub Receita
        </button>
      </div>

      {/* EMBALAGENS */}
      <div className="aba-comp-bloco aba-comp-bloco-embalagem">
        <div className="aba-comp-titulo">Embalagem</div>
        <table className="aba-comp-tabela">
          <thead>
            <tr>
              <th className="aba-comp-th">Embalagem</th>
              <th className="aba-comp-th">Marca</th>
              <th className="aba-comp-th">Qt. Emb.</th>
              <th className="aba-comp-th">Medida</th>
              <th className="aba-comp-th">Preço Emb.</th>
              <th className="aba-comp-th">Qt.</th>
              <th className="aba-comp-th">Custo Un.</th>
              <th className="aba-comp-th">Custo Total</th>
              <th className="aba-comp-th">Ação</th>
            </tr>
          </thead>
          <tbody>
            {embalagens.length === 0 ? (
              <tr>
                <td colSpan={9} className="aba-comp-td-vazia">
                  Nenhuma embalagem adicionada
                </td>
              </tr>
            ) : embalagens.map((item, idx) => {
              const optionSelecionada = options.find(o => o.value === String(item.produtoId));
              let marca = item.marca, qtEmb = item.qtEmb, unMedida = item.unMedida, precoEmb = item.precoEmb;
              if (optionSelecionada && optionSelecionada.produto) {
                const prod = optionSelecionada.produto;
                marca = prod.marca;
                qtEmb = prod.totalEmbalagem;
                unMedida = prod.unidade;
                precoEmb = prod.custoTotal;
              }
              const custoUn = (precoEmb && qtEmb) ? (Number(precoEmb) / Number(qtEmb)) : null;
              const custoTotalItem = item.valorTotal;

              return (
                <tr key={idx}>
                  <td className="aba-comp-td">
                    <Select
                      placeholder="Selecione..."
                      value={optionSelecionada || null}
                      onChange={selected => {
                        setEmbalagens(arr =>
                          arr.map((i, iidx) => {
                            if (iidx !== idx) return i;
                            if (!selected) {
                              return { produtoId: null, marca: "", qtEmb: "", unMedida: "", precoEmb: "", qtUsada: "", valorTotal: 0 };
                            }
                            const produto = selected.produto;
                            return {
                              ...i,
                              produtoId: String(produto.id),
                              marca: produto.marca,
                              qtEmb: produto.totalEmbalagem,
                              unMedida: produto.unidade,
                              precoEmb: produto.custoTotal,
                              qtUsada: "",
                              valorTotal: 0,
                            };
                          })
                        );
                      }}
                      options={options}
                      isClearable
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      styles={selectStyles}
                    />
                  </td>
                  <td className="aba-comp-td">{renderizaMarcas(marca)}</td>
                  <td className="aba-comp-td">{qtEmb || "-"}</td>
                  <td className="aba-comp-td">{unMedida || "-"}</td>
                  <td className="aba-comp-td">{precoEmb ? formatarDinheiro(precoEmb) : "-"}</td>
                  <td className="aba-comp-td">
                    <input
                      type="number"
                      min={0}
                      value={item.qtUsada || ""}
                      className="aba-comp-input"
                      disabled={!item.produtoId}
                      onChange={e => {
                        const qt = e.target.value;
                        setEmbalagens(arr =>
                          arr.map((i, iidx) => {
                            if (iidx !== idx) return i;
                            const precoEmb = Number(i.precoEmb);
                            const qtEmb = Number(i.qtEmb);
                            const qtUsada = Number(qt);
                            const custoUn = (precoEmb && qtEmb) ? precoEmb / qtEmb : 0;
                            const valorTotal = (custoUn && qtUsada) ? custoUn * qtUsada : 0;
                            return { ...i, qtUsada: qt, valorTotal };
                          })
                        );
                      }}
                    />
                  </td>
                  <td className="aba-comp-td">{precoEmb && qtEmb ? formatarCustoUn(custoUn, unMedida) : "-"}</td>
                  <td className="aba-comp-td">
                    {custoTotalItem != null && !isNaN(custoTotalItem)
                      ? formatarDinheiro(custoTotalItem, 4)
                      : "-"}
                  </td>
                  <td className="aba-comp-td">
                    <button
                      type="button"
                      className="aba-comp-btn-excluir"
                      onClick={() => setEmbalagens(arr => arr.filter((_, iidx) => iidx !== idx))}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <button
          className="aba-comp-btn-add"
          onClick={() => setEmbalagens([...embalagens, {
            produtoId: null, marca: "", qtEmb: "", unMedida: "", precoEmb: "", qtUsada: "", valorTotal: 0
          }])}
        >
          + Adicionar Embalagem
        </button>
      </div>
    </div>
  );
}
