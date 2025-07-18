import React, { useState, useEffect } from "react";
import Select from "react-select";
import { FaTrash } from "react-icons/fa";

// Funções de formatação
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
  return `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas })}`;
}

export default function AbaComposicaoReceita() {
  // ====== ESTADOS ======
  const [ingredientes, setIngredientes] = useState([]);
  const [receitas, setReceitas] = useState([]);
  const [embalagens, setEmbalagens] = useState([]);
  const [produtosEstoque, setProdutosEstoque] = useState([]);

  // Fetch produtos estoque (igual ao cadastro original)
  useEffect(() => {
    fetchProdutosEstoque();
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

  // ========== FUNÇÕES DE MANIPULAÇÃO ==========
  function addIngrediente() {
    setIngredientes([...ingredientes, {
      produtoId: null, marca: "", qtEmb: "", unMedida: "", precoEmb: "", qtUsada: "",
    }]);
  }
  function addReceita() {
    setReceitas([...receitas, { receitaId: null, tipo: "", qt: "", medida: "" }]);
  }
  function addEmbalagem() {
    setEmbalagens([...embalagens, {
      produtoId: null, marca: "", qtEmb: "", unMedida: "", precoEmb: "", qtUsada: "",
    }]);
  }

  // ========== CONFIG SELECT ==========
  const options = produtosEstoque.map(p => ({
    value: String(p.id),
    label: p.nome,
    produto: p
  }));

  // ========== VISUAL ==========
  return (
    <div style={{ padding: 26, color: "#ffe066" }}>
      {/* ================== INGREDIENTES ================== */}
      <div style={{
        background: "#221848",
        borderRadius: 13,
        marginBottom: 36,
        padding: 18,
        boxShadow: "0 2px 16px #14083233"
      }}>
        <div style={{ fontWeight: 800, fontSize: 22, marginBottom: 16 }}>Ingredientes</div>
        <table style={{
          width: "100%",
          borderCollapse: "separate",
          borderSpacing: 0,
          fontSize: "1.09rem",
          marginBottom: 12
        }}>
          <thead>
            <tr>
              <th style={thEstilo}>Ingredientes</th>
              <th style={thEstilo}>Marca</th>
              <th style={thEstilo}>Qt Emb.</th>
              <th style={thEstilo}>Un. Medida</th>
              <th style={thEstilo}>Preço Emb.</th>
              <th style={thEstilo}>Qt.</th>
              <th style={thEstilo}>Custo Un.</th>
              <th style={thEstilo}>Custo Total</th>
              <th style={thEstilo}>Ação</th>
            </tr>
          </thead>
          <tbody>
            {ingredientes.length === 0 ? (
              <tr>
                <td colSpan={9} style={{
                  color: "#fff",
                  textAlign: "center",
                  padding: "26px 0",
                  fontSize: "1.09rem"
                }}>
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
              const custoTotalItem = (precoEmb && qtEmb && item.qtUsada) ? custoUn * Number(item.qtUsada) : null;
              return (
                <tr key={idx}>
                  <td style={tdEstilo}>
                    <Select
                      placeholder="Selecione..."
                      value={optionSelecionada || null}
                      onChange={selected => {
                        if (!selected) {
                          setIngredientes(arr =>
                            arr.map((i, iidx) =>
                              iidx === idx ? { ...i, produtoId: null, marca: "", qtEmb: "", unMedida: "", precoEmb: "", qtUsada: "" } : i
                            )
                          );
                          return;
                        }
                        const produto = selected.produto;
                        setIngredientes(arr =>
                          arr.map((i, iidx) =>
                            iidx === idx ? {
                              ...i,
                              produtoId: String(produto.id),
                              marca: produto.marca,
                              qtEmb: produto.totalEmbalagem,
                              unMedida: produto.unidade,
                              precoEmb: produto.custoTotal,
                              qtUsada: ""
                            } : i
                          )
                        );
                      }}
                      options={options}
                      isClearable
                      styles={{ control: base => ({ ...base, minHeight: 36, background: "#271f3a", color: "#ffe066", borderRadius: 8 }) }}
                    />
                  </td>
                  <td style={tdEstilo}>{marca || "-"}</td>
                  <td style={tdEstilo}>{qtEmb || "-"}</td>
                  <td style={tdEstilo}>{unMedida || "-"}</td>
                  <td style={tdEstilo}>{precoEmb ? formatarDinheiro(precoEmb) : "-"}</td>
                  <td style={tdEstilo}>
                    <input
                      type="number"
                      min={0}
                      value={item.qtUsada || ""}
                      style={{
                        width: 62,
                        background: "transparent",
                        color: "#ffe066",
                        border: "1.5px solid #6646b0",
                        borderRadius: 5,
                        textAlign: "center",
                        fontWeight: "600",
                        fontSize: "1rem"
                      }}
                      disabled={!item.produtoId}
                      onChange={e => {
                        const qt = e.target.value;
                        setIngredientes(arr =>
                          arr.map((i, iidx) =>
                            iidx === idx ? { ...i, qtUsada: qt } : i
                          )
                        );
                      }}
                    />
                  </td>
                  <td style={tdEstilo}>{precoEmb && qtEmb ? formatarCustoUn(custoUn, unMedida) : "-"}</td>
                  <td style={tdEstilo}>
                    {custoTotalItem != null && !isNaN(custoTotalItem)
                      ? formatarDinheiro(custoTotalItem, unMedida && [
                        "Grama (g)", "Miligrama (mg)", "Micrograma (mcg)",
                        "Mililitro (ml)", "Centímetro (cm)", "Milímetro (mm)"
                      ].includes(unMedida) ? 4 : 2)
                      : "-"}
                  </td>
                  <td style={tdEstilo}>
                    <button
                      type="button"
                      onClick={() => setIngredientes(arr => arr.filter((_, iidx) => iidx !== idx))}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#ff5e5e",
                        fontSize: "1.13rem"
                      }}
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
          onClick={addIngrediente}
          style={{
            background: "linear-gradient(90deg,#a17ff5 60%,#73f7ff 100%)",
            color: "#fff",
            fontWeight: 800,
            fontSize: "1.09rem",
            border: "none",
            borderRadius: 11,
            padding: "10px 38px",
            boxShadow: "0 0 12px #00f5ff33",
            cursor: "pointer",
            marginTop: 6
          }}
        >
          + Adicionar Ingrediente
        </button>
      </div>

      {/* ================== SUB RECEITAS ================== */}
      <div style={{
        background: "#221848",
        borderRadius: 13,
        marginBottom: 36,
        padding: 18,
        boxShadow: "0 2px 16px #14083233"
      }}>
        <div style={{ fontWeight: 800, fontSize: 22, marginBottom: 16 }}>Sub Receitas</div>
        <table style={{
          width: "100%",
          borderCollapse: "separate",
          borderSpacing: 0,
          fontSize: "1.09rem",
          marginBottom: 12
        }}>
          <thead>
            <tr>
              <th style={thEstilo}>Sub Receitas</th>
              <th style={thEstilo}>Tipo</th>
              <th style={thEstilo}>Qt.</th>
              <th style={thEstilo}>Medida</th>
              <th style={thEstilo}>Ação</th>
            </tr>
          </thead>
          <tbody>
            {receitas.length === 0 ? (
              <tr>
                <td colSpan={5} style={{
                  color: "#fff",
                  textAlign: "center",
                  padding: "26px 0",
                  fontSize: "1.09rem"
                }}>
                  Nenhuma sub receita adicionada
                </td>
              </tr>
            ) : receitas.map((item, idx) => (
              <tr key={idx}>
                <td style={tdEstilo}>
                  <input
                    type="text"
                    value={item.receitaId || ""}
                    onChange={e => {
                      const val = e.target.value;
                      setReceitas(arr =>
                        arr.map((i, iidx) =>
                          iidx === idx ? { ...i, receitaId: val } : i
                        )
                      );
                    }}
                    style={{
                      background: "#271f3a",
                      color: "#ffe066",
                      border: "1.5px solid #6646b0",
                      borderRadius: 5,
                      width: "100%",
                      textAlign: "center"
                    }}
                  />
                </td>
                <td style={tdEstilo}>
                  <input
                    type="text"
                    value={item.tipo || ""}
                    onChange={e => {
                      const val = e.target.value;
                      setReceitas(arr =>
                        arr.map((i, iidx) =>
                          iidx === idx ? { ...i, tipo: val } : i
                        )
                      );
                    }}
                    style={{
                      background: "#271f3a",
                      color: "#ffe066",
                      border: "1.5px solid #6646b0",
                      borderRadius: 5,
                      width: "100%",
                      textAlign: "center"
                    }}
                  />
                </td>
                <td style={tdEstilo}>
                  <input
                    type="number"
                    value={item.qt || ""}
                    onChange={e => {
                      const val = e.target.value;
                      setReceitas(arr =>
                        arr.map((i, iidx) =>
                          iidx === idx ? { ...i, qt: val } : i
                        )
                      );
                    }}
                    style={{
                      background: "#271f3a",
                      color: "#ffe066",
                      border: "1.5px solid #6646b0",
                      borderRadius: 5,
                      width: "100%",
                      textAlign: "center"
                    }}
                  />
                </td>
                <td style={tdEstilo}>
                  <input
                    type="text"
                    value={item.medida || ""}
                    onChange={e => {
                      const val = e.target.value;
                      setReceitas(arr =>
                        arr.map((i, iidx) =>
                          iidx === idx ? { ...i, medida: val } : i
                        )
                      );
                    }}
                    style={{
                      background: "#271f3a",
                      color: "#ffe066",
                      border: "1.5px solid #6646b0",
                      borderRadius: 5,
                      width: "100%",
                      textAlign: "center"
                    }}
                  />
                </td>
                <td style={tdEstilo}>
                  <button
                    type="button"
                    onClick={() => setReceitas(arr => arr.filter((_, iidx) => iidx !== idx))}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#ff5e5e",
                      fontSize: "1.13rem"
                    }}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          onClick={addReceita}
          style={{
            background: "linear-gradient(90deg,#a17ff5 60%,#73f7ff 100%)",
            color: "#fff",
            fontWeight: 800,
            fontSize: "1.09rem",
            border: "none",
            borderRadius: 11,
            padding: "10px 38px",
            boxShadow: "0 0 12px #00f5ff33",
            cursor: "pointer",
            marginTop: 6
          }}
        >
          + Adicionar Sub Receita
        </button>
      </div>

      {/* ================== EMBALAGENS ================== */}
      <div style={{
        background: "#221848",
        borderRadius: 13,
        marginBottom: 8,
        padding: 18,
        boxShadow: "0 2px 16px #14083233"
      }}>
        <div style={{ fontWeight: 800, fontSize: 22, marginBottom: 16 }}>Embalagem</div>
        <table style={{
          width: "100%",
          borderCollapse: "separate",
          borderSpacing: 0,
          fontSize: "1.09rem",
          marginBottom: 12
        }}>
          <thead>
            <tr>
              <th style={thEstilo}>Embalagem</th>
              <th style={thEstilo}>Marca</th>
              <th style={thEstilo}>Qt. Emb.</th>
              <th style={thEstilo}>Medida</th>
              <th style={thEstilo}>Preço Emb.</th>
              <th style={thEstilo}>Qt.</th>
              <th style={thEstilo}>Custo Un.</th>
              <th style={thEstilo}>Custo Total</th>
              <th style={thEstilo}>Ação</th>
            </tr>
          </thead>
          <tbody>
            {embalagens.length === 0 ? (
              <tr>
                <td colSpan={9} style={{
                  color: "#fff",
                  textAlign: "center",
                  padding: "26px 0",
                  fontSize: "1.09rem"
                }}>
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
              const custoTotalItem = (precoEmb && qtEmb && item.qtUsada) ? custoUn * Number(item.qtUsada) : null;
              return (
                <tr key={idx}>
                  <td style={tdEstilo}>
                    <Select
                      placeholder="Selecione..."
                      value={optionSelecionada || null}
                      onChange={selected => {
                        if (!selected) {
                          setEmbalagens(arr =>
                            arr.map((i, iidx) =>
                              iidx === idx ? { ...i, produtoId: null, marca: "", qtEmb: "", unMedida: "", precoEmb: "", qtUsada: "" } : i
                            )
                          );
                          return;
                        }
                        const produto = selected.produto;
                        setEmbalagens(arr =>
                          arr.map((i, iidx) =>
                            iidx === idx ? {
                              ...i,
                              produtoId: String(produto.id),
                              marca: produto.marca,
                              qtEmb: produto.totalEmbalagem,
                              unMedida: produto.unidade,
                              precoEmb: produto.custoTotal,
                              qtUsada: ""
                            } : i
                          )
                        );
                      }}
                      options={options}
                      isClearable
                      styles={{ control: base => ({ ...base, minHeight: 36, background: "#271f3a", color: "#ffe066", borderRadius: 8 }) }}
                    />
                  </td>
                  <td style={tdEstilo}>{marca || "-"}</td>
                  <td style={tdEstilo}>{qtEmb || "-"}</td>
                  <td style={tdEstilo}>{unMedida || "-"}</td>
                  <td style={tdEstilo}>{precoEmb ? formatarDinheiro(precoEmb) : "-"}</td>
                  <td style={tdEstilo}>
                    <input
                      type="number"
                      min={0}
                      value={item.qtUsada || ""}
                      style={{
                        width: 62,
                        background: "transparent",
                        color: "#ffe066",
                        border: "1.5px solid #6646b0",
                        borderRadius: 5,
                        textAlign: "center",
                        fontWeight: "600",
                        fontSize: "1rem"
                      }}
                      disabled={!item.produtoId}
                      onChange={e => {
                        const qt = e.target.value;
                        setEmbalagens(arr =>
                          arr.map((i, iidx) =>
                            iidx === idx ? { ...i, qtUsada: qt } : i
                          )
                        );
                      }}
                    />
                  </td>
                  <td style={tdEstilo}>{precoEmb && qtEmb ? formatarCustoUn(custoUn, unMedida) : "-"}</td>
                  <td style={tdEstilo}>
                    {custoTotalItem != null && !isNaN(custoTotalItem)
                      ? formatarDinheiro(custoTotalItem, unMedida && [
                        "Grama (g)", "Miligrama (mg)", "Micrograma (mcg)",
                        "Mililitro (ml)", "Centímetro (cm)", "Milímetro (mm)"
                      ].includes(unMedida) ? 4 : 2)
                      : "-"}
                  </td>
                  <td style={tdEstilo}>
                    <button
                      type="button"
                      onClick={() => setEmbalagens(arr => arr.filter((_, iidx) => iidx !== idx))}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#ff5e5e",
                        fontSize: "1.13rem"
                      }}
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
          onClick={addEmbalagem}
          style={{
            background: "linear-gradient(90deg,#a17ff5 60%,#73f7ff 100%)",
            color: "#fff",
            fontWeight: 800,
            fontSize: "1.09rem",
            border: "none",
            borderRadius: 11,
            padding: "10px 38px",
            boxShadow: "0 0 12px #00f5ff33",
            cursor: "pointer",
            marginTop: 6
          }}
        >
          + Adicionar Embalagem
        </button>
      </div>
    </div>
  );
}

// ========== ESTILO DAS TABELAS ==========
const thEstilo = {
  padding: "10px 6px",
  fontWeight: 800,
  color: "#2c1a3b",
  background: "#b59ef9",
  textAlign: "center",
  fontSize: "1.04rem",
  border: "none",
  borderRadius: 8
};
const tdEstilo = {
  padding: "10px 6px",
  color: "#fff",
  fontWeight: 500,
  background: "none",
  textAlign: "center",
  fontSize: "1.02rem"
};