import React, { useState, useEffect } from "react";
import Select from "react-select";
import ModalUpgradePlano from "../modals/ModalUpgradePlano";
import { useAuth } from "../../App";
import "./EntradaEstoque.css"; // Usa o mesmo CSS global do restante

// ====== ESTILO REACT-SELECT (azul/padrão do app) ======
const selectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: "#f8fafd",
    borderColor: state.isFocused ? "#00cfff" : "#e1e9f7",
    color: "#237be7",
    minHeight: 48,
    height: 48,
    borderRadius: 10,
    fontSize: "1.03rem",
    borderWidth: "1.7px",
    boxShadow: state.isFocused ? "0 0 0 2px #00cfff22" : "none",
    "&:hover": { borderColor: "#00cfff" },
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
    color: "#237be7",
    margin: 0,
    padding: 0,
  }),
  singleValue: (base) => ({
    ...base,
    color: "#237be7",
    display: "flex",
    alignItems: "center",
  }),
  indicatorsContainer: (base) => ({
    ...base,
    height: 48,
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "#fff",
    color: "#237be7",
    zIndex: 9999,
    borderRadius: 10,
    marginTop: 2,
    border: "1.5px solid #e1e9f7",
    boxShadow: "0 2px 14px #c1e6fc1c",
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? "#e3f3fc" : "#fff",
    color: "#237be7",
    cursor: "pointer"
  }),
  placeholder: (base) => ({
    ...base,
    color: "#b4c7e8"
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: "#2196f3"
  }),
  indicatorSeparator: (base) => ({
    ...base,
    backgroundColor: "#e1e9f7"
  }),
  clearIndicator: (base) => ({
    ...base,
    color: "#b4c7e8"
  }),
};

export default function SaidaEstoque() {
  // ===== LIMITE DE PLANO =====
  const { user, setAba } = useAuth() || {};
  const plano = user?.plano || "gratuito";
  const isPlanoGratuito = plano === "gratuito";
  const [showUpgrade, setShowUpgrade] = useState(isPlanoGratuito);

  // BLOQUEIA ACESSO NO PLANO GRATUITO
  if (isPlanoGratuito) {
    return (
      <ModalUpgradePlano
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        irParaPlanos={() => {
          setAba("perfil_planos");
          setShowUpgrade(false);
        }}
      />
    );
  }

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
    <div className="estoque-main-full">
      <div className="estoque-container">
        <h2 className="estoque-titulo">Saída de Estoque</h2>
        <section className="estoque-section">
          <form onSubmit={handleSalvarTudo}>
            <h3 style={{ display: "flex", alignItems: "center", gap: 12 }}>
              Produtos
            </h3>

            {produtosList.map((produto, idx) => (
              <div key={idx} className="produto-card">
                <div className="produto-card-titulo">
                  Produto #{idx + 1}
                  {produtosList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoverProduto(idx)}
                      className="produto-card-remove"
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
                    <label>Produto <span style={{ color: "#FF4848" }}>*</span></label>
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
                    <label>Quantidade <span style={{ color: "#FF4848" }}>*</span></label>
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
                className="estoque-btn"
                onClick={handleAdicionarProduto}
              >
                + Adicionar Produto
              </button>
              <button
                className="estoque-btn"
                type="submit"
                disabled={carregando}
              >
                {carregando ? "Salvando..." : "Finalizar Saída"}
              </button>
            </div>

            {msg && <div className="estoque-msg">{msg}</div>}
          </form>
        </section>
      </div>
    </div>
  );
}
