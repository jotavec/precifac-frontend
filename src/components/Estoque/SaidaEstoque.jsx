import React, { useState, useEffect } from "react";
import "./EntradaEstoque.css";
import Select from "react-select";

// ====== ESTILO REACT-SELECT (100% igual ao input) ======
const selectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: "#1b1332",
    borderColor: state.isFocused ? "#ffe066" : "#b884fd",
    color: "#fff",
    minHeight: 48,
    height: 48,
    borderRadius: 10,
    fontSize: "1.03rem",
    borderWidth: "2px",
    boxShadow: state.isFocused ? "0 0 0 2px #ffe06644" : "none",
    "&:hover": { borderColor: "#ffe066" },
    transition: "border 0.19s",
  }),
  valueContainer: (base) => ({
    ...base,
    height: 48,
    padding: "0 16px",
    display: "flex",
    alignItems: "center",
  }),
  input: (base) => ({
    ...base,
    color: "#fff",
    margin: 0,
    padding: 0,
  }),
  singleValue: (base) => ({
    ...base,
    color: "#fff",
    display: "flex",
    alignItems: "center",
  }),
  indicatorsContainer: (base) => ({
    ...base,
    height: 48,
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "#231844",
    color: "#eee",
    zIndex: 9999,
    borderRadius: 10,
    marginTop: 2,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? "#381aa7" : "#231844",
    color: "#eee",
    cursor: "pointer"
  }),
  placeholder: (base) => ({
    ...base,
    color: "#cfc6ff"
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: "#cfc6ff"
  }),
  indicatorSeparator: (base) => ({
    ...base,
    backgroundColor: "#b884fd"
  }),
  clearIndicator: (base) => ({
    ...base,
    color: "#cfc6ff"
  }),
};

export default function SaidaEstoque() {
  const [produtosList, setProdutosList] = useState([
    {
      codigoInterno: "",
      produtoId: "",
      quantidade: ""
    }
  ]);
  const [produtos, setProdutos] = useState([]);
  const [msg, setMsg] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    fetch("/api/produtos")
      .then(res => res.json())
      .then(data => setProdutos(data))
      .catch(() => setMsg("Erro ao buscar produtos"));
  }, []);

  function handleAdicionarProduto() {
    setProdutosList([
      ...produtosList,
      {
        codigoInterno: "",
        produtoId: "",
        quantidade: ""
      }
    ]);
  }

  function handleRemoverProduto(idx) {
    setProdutosList(produtosList.filter((_, i) => i !== idx));
  }

  function handleChangeProduto(idx, campo, valor) {
    setProdutosList(list =>
      list.map((prod, i) =>
        i === idx ? { ...prod, [campo]: valor } : prod
      )
    );
  }

  function handleSelecionarProduto(idx, produtoId) {
    const produtoObj = produtos.find(p => p.id === produtoId);
    setProdutosList(list =>
      list.map((item, i) =>
        i === idx
          ? {
              ...item,
              produtoId,
              codigoInterno: produtoObj ? produtoObj.codigo : ""
            }
          : item
      )
    );
  }

  function handleBuscaProdutoPorCodigo(idx, codigoDigitado) {
    if (!codigoDigitado) return;
    const produtoEncontrado = produtos.find(p => String(p.codigo) === String(codigoDigitado));
    if (produtoEncontrado) {
      setProdutosList(list =>
        list.map((item, i) =>
          i === idx
            ? { ...item, produtoId: produtoEncontrado.id }
            : item
        )
      );
    }
  }

  // SALVAR SAÍDA DE ESTOQUE
  async function handleSalvarTudo(e) {
    e.preventDefault();
    setMsg("");
    setCarregando(true);

    const listaFinal = produtosList.map(prod => ({
      produtoId: prod.produtoId,
      quantidade: prod.quantidade,
      data: new Date().toISOString()
    }));

    try {
      for (const saida of listaFinal) {
        if (!saida.produtoId || !saida.quantidade) continue;
        await fetch("/api/produtos/saida-estoque", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(saida)
        });
      }
      setMsg("Saídas registradas com sucesso!");
      setProdutosList([{
        codigoInterno: "",
        produtoId: "",
        quantidade: ""
      }]);
    } catch (error) {
      setMsg("Erro ao registrar saída");
    }
    setCarregando(false);
  }

  return (
    <div className="estoque-limpo-main">
      <h2 className="estoque-limpo-titulo">Saída de Estoque</h2>
      <section className="estoque-limpo-section">
        <form onSubmit={handleSalvarTudo}>
          <h3 style={{ display: "flex", alignItems: "center", gap: 12 }}>
            Produtos
          </h3>

          {produtosList.map((produto, idx) => (
            <div key={idx} style={{ border: "1px solid #38276b", borderRadius: 13, padding: 16, marginBottom: 22, background: "#21194a", position: "relative" }}>
              <div style={{ fontWeight: 700, color: "#ffe066", marginBottom: 10 }}>
                Produto #{idx + 1}
                {produtosList.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoverProduto(idx)}
                    style={{
                      marginLeft: 16,
                      background: "transparent",
                      color: "#FF6666",
                      border: "none",
                      fontSize: 18,
                      cursor: "pointer"
                    }}
                    title="Remover produto"
                  >
                    🗑️
                  </button>
                )}
              </div>
              {/* Primeira linha */}
              <div className="produto-grid produto-grid-3">
                <div>
                  <label>Código Interno</label>
                  <input
                    value={produto.codigoInterno}
                    onChange={e => handleChangeProduto(idx, "codigoInterno", e.target.value)}
                    placeholder="(opcional)"
                    onBlur={e => handleBuscaProdutoPorCodigo(idx, e.target.value)}
                  />
                </div>
                <div>
                  <label>Produto *</label>
                  <Select
                    classNamePrefix="input-form-brabo"
                    options={produtos.map(prod => ({
                      value: prod.id,
                      label: prod.nome
                    }))}
                    value={
                      produtos.find(p => p.id === produto.produtoId)
                        ? { value: produto.produtoId, label: produtos.find(p => p.id === produto.produtoId).nome }
                        : null
                    }
                    onChange={selected => handleSelecionarProduto(idx, selected ? selected.value : "")}
                    placeholder="Selecione..."
                    styles={selectStyles}
                    isClearable
                  />
                </div>
                <div>
                  <label>Quantidade *</label>
                  <input
                    type="number"
                    value={produto.quantidade}
                    onChange={e => handleChangeProduto(idx, "quantidade", e.target.value)}
                    min="1"
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="botoes-produto-finalizar">
            <button
              type="button"
              className="estoque-limpo-btn"
              style={{ background: "linear-gradient(90deg, #7c3aed 60%, #c394fa 100%)" }}
              onClick={handleAdicionarProduto}
            >
              + Adicionar Produto
            </button>

            <button
              className="estoque-limpo-btn"
              type="submit"
              disabled={carregando}
              style={{ background: "linear-gradient(90deg, #7c3aed 60%, #c394fa 100%)" }}
            >
              {carregando ? "Salvando..." : "Finalizar Saída"}
            </button>
          </div>

          {msg && <div className="estoque-limpo-msg">{msg}</div>}
        </form>
      </section>
    </div>
  );
}
