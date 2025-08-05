import React, { useState, useEffect } from "react";
import "./EntradaEstoque.css";
import ModalCadastroManual from "./ModalCadastroManual"; // Produto
import ModalCadastroFornecedor from "./ModalCadastroFornecedor";
import Select from "react-select";

// ====== ESTILO REACT-SELECT (azul/despesasfixas) ======
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

export default function EntradaEstoque() {
  // ESTADOS DO FORNECEDOR
  const [fornecedores, setFornecedores] = useState([]);
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState(null);
  const [modalFornecedorOpen, setModalFornecedorOpen] = useState(false);
  const [novoFornecedor, setNovoFornecedor] = useState({});

  // Produtos (estoque)
  const [produtosList, setProdutosList] = useState([
    {
      codigoInterno: "",
      produtoId: "",
      quantidade: "",
      lote: "",
      validade: "",
      valor: ""
    }
  ]);
  const [produtos, setProdutos] = useState([]);
  const [msg, setMsg] = useState("");
  const [carregando, setCarregando] = useState(false);

  // Modal cadastro produto (controle)
  const [cadastroProdutoModalOpen, setCadastroProdutoModalOpen] = useState(false);
  const [novoProduto, setNovoProduto] = useState({});

  // Buscar produtos do backend
  useEffect(() => {
    fetch("/api/produtos")
      .then(res => res.json())
      .then(data => setProdutos(data))
      .catch(() => setMsg("Erro ao buscar produtos"));
  }, []);

  // Buscar fornecedores do backend
  useEffect(() => {
    fetch("/api/fornecedores", { credentials: "include" })
      .then(res => res.json())
      .then(data => setFornecedores(data));
  }, []);

  function handleAdicionarProduto() {
    setProdutosList([
      ...produtosList,
      {
        codigoInterno: "",
        produtoId: "",
        quantidade: "",
        lote: "",
        validade: "",
        valor: ""
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

  async function handleSalvarTudo(e) {
    e.preventDefault();
    setMsg("");
    setCarregando(true);

    if (!fornecedorSelecionado) {
      setMsg("Selecione um fornecedor!");
      setCarregando(false);
      return;
    }

    const listaFinal = produtosList.map(prod => ({
      produtoId: prod.produtoId,
      quantidade: prod.quantidade,
      lote: prod.lote,
      valor: prod.valor,
      validade: prod.validade,
      data: new Date().toISOString(),
      fornecedorId: fornecedorSelecionado.value,
      fornecedorRazao: fornecedorSelecionado.razaoSocial,
      fornecedorCnpj: fornecedorSelecionado.cnpjCpf,
      fornecedorNome: fornecedorSelecionado.nomeVendedor
    }));

    try {
      for (const entrada of listaFinal) {
        if (!entrada.produtoId || !entrada.quantidade) continue;
        await fetch("/api/produtos/entrada-estoque", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(entrada)
        });
      }
      setMsg("Entradas adicionadas com sucesso!");
      setProdutosList([{
        codigoInterno: "",
        produtoId: "",
        quantidade: "",
        lote: "",
        validade: "",
        valor: ""
      }]);
    } catch (error) {
      setMsg("Erro ao adicionar entrada");
    }
    setCarregando(false);
  }

  return (
    <div className="estoque-main-full">
      <div className="estoque-container">
        <h2 className="estoque-titulo">Entrada de Estoque</h2>

        {/* === Bloco Fornecedor (Select + botão ao lado direito, grudado na direita) === */}
        <section className="estoque-section">
          <h3>Dados do Fornecedor</h3>
          <div style={{ width: "100%" }}>
            {/* LABEL REMOVIDO AQUI */}
            <div className="fornecedor-select-abs-wrap">
              <Select
                options={fornecedores.map(f => ({
                  value: f.id,
                  label: `${f.razaoSocial} - ${f.cnpjCpf}`,
                  ...f
                }))}
                value={fornecedorSelecionado}
                onChange={setFornecedorSelecionado}
                placeholder="Selecione um fornecedor..."
                styles={selectStyles}
                isClearable
                classNamePrefix="input-form-brabo"
              />
              <button
                type="button"
                title="Cadastrar novo fornecedor"
                className="estoque-btn-fornecedor-abs"
                onClick={() => {
                  setNovoFornecedor({});
                  setModalFornecedorOpen(true);
                }}
              >
                <span style={{ fontSize: "1.25em", fontWeight: 900, marginRight: 7 }}>+</span>
                Cadastrar um fornecedor novo
              </button>
            </div>
            {fornecedorSelecionado && (
              <div style={{ marginTop: 14, color: "#2196f3", fontSize: "1.05rem" }}>
                <div><b>Razão Social:</b> {fornecedorSelecionado.razaoSocial}</div>
                <div><b>CNPJ/CPF:</b> {fornecedorSelecionado.cnpjCpf}</div>
                <div><b>Nome:</b> {fornecedorSelecionado.nomeVendedor}</div>
              </div>
            )}
          </div>
        </section>

        {/* Produtos Dinâmicos */}
        <section className="estoque-section">
          <form onSubmit={handleSalvarTudo}>
            <div className="produtos-header-bar">
              <h3>Produtos</h3>
              <button
                type="button"
                title="Cadastrar novo produto"
                className="estoque-btn btn-cadastrar-produto"
                onClick={() => {
                  setNovoProduto({});
                  setCadastroProdutoModalOpen(true);
                }}
              >
                <span style={{ fontWeight: 900, marginRight: 8, fontSize: "1.17em" }}>+</span>
                cadastrar novo produto
              </button>
            </div>

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
                {/* Valor total */}
                <div className="produto-grid produto-grid-2">
                  <div>
                    <label>Valor total da entrada</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={produto.valor}
                      onChange={e => handleChangeProduto(idx, "valor", e.target.value)}
                      placeholder="Ex: 50.00"
                    />
                  </div>
                </div>
                {/* Lote + Validade */}
                <h3 style={{ fontSize: "1.06rem", color: "#2196f3", marginBottom: 8, marginTop: 8, fontWeight: 900 }}>Informações do lote</h3>
                <div className="produto-grid produto-grid-2">
                  <div>
                    <label>Lote</label>
                    <input
                      value={produto.lote}
                      onChange={e => handleChangeProduto(idx, "lote", e.target.value)}
                      placeholder="(opcional)"
                    />
                  </div>
                  <div>
                    <label>Data de validade</label>
                    <input
                      type="date"
                      value={produto.validade}
                      onChange={e => handleChangeProduto(idx, "validade", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="botoes-produto-finalizar">
              <button
                type="button"
                className="estoque-btn btn-esquerda"
                onClick={handleAdicionarProduto}
              >
                + Adicionar Produto
              </button>

              <button
                className="estoque-btn btn-direita"
                type="submit"
                disabled={carregando}
              >
                {carregando ? "Salvando..." : "Finalizar Entrada"}
              </button>
            </div>

            {msg && <div className="estoque-msg">{msg}</div>}
          </form>
        </section>
      </div>

      {/* MODAL DE CADASTRO DE PRODUTO */}
      {cadastroProdutoModalOpen && (
        <ModalCadastroManual
          open={cadastroProdutoModalOpen}
          onClose={() => setCadastroProdutoModalOpen(false)}
          ingrediente={novoProduto}
          onSave={async (novoProd) => {
            try {
              await fetch("/api/produtos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(novoProd),
              });
              const data = await fetch("/api/produtos").then(r => r.json());
              setProdutos(data);
            } catch {
              alert("Erro ao cadastrar produto!");
            }
            setCadastroProdutoModalOpen(false);
          }}
          onDelete={null}
          onChange={setNovoProduto}
          produtos={produtos}
        />
      )}

      {/* MODAL DE CADASTRO DE FORNECEDOR */}
      {modalFornecedorOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(30, 52, 80, 0.33)",
            backdropFilter: "blur(4px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "fadeIn .22s",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 22,
              boxShadow: "0 8px 38px 0 #a0cef5cc",
              padding: "0 0 18px 0",
              minWidth: 390,
              maxWidth: "96vw",
              color: "#237be7",
              position: "relative",
              border: "1.5px solid #e1e9f7",
              animation: "fadeIn .18s",
            }}
          >
            <ModalCadastroFornecedor
              open={modalFornecedorOpen}
              onClose={() => setModalFornecedorOpen(false)}
              fornecedor={novoFornecedor}
              onSave={async (novoForn) => {
                try {
                  await fetch("/api/fornecedores", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(novoForn),
                  });
                  const data = await fetch("/api/fornecedores", { credentials: "include" }).then(r => r.json());
                  setFornecedores(data);
                  // Seleciona automaticamente o novo
                  const criado = data.find(f => f.cnpjCpf === novoForn.cnpjCpf && f.razaoSocial === novoForn.razaoSocial);
                  if (criado) setFornecedorSelecionado({
                    value: criado.id,
                    label: `${criado.razaoSocial} - ${criado.cnpjCpf}`,
                    ...criado
                  });
                } catch {
                  alert("Erro ao cadastrar fornecedor!");
                }
                setModalFornecedorOpen(false);
              }}
              onDelete={null}
              onChange={setNovoFornecedor}
              fornecedores={fornecedores}
            />
          </div>
        </div>
      )}
    </div>
  );
}