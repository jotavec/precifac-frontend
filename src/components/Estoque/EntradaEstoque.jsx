import React, { useState, useEffect } from "react";
import "./EntradaEstoque.css";
import ModalCadastroManual from "./ModalCadastroManual"; // Produto
import ModalCadastroFornecedor from "./ModalCadastroFornecedor";
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

  // Seleciona produto e já preenche código interno
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

  // Busca produto pelo código interno e preenche o select
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

  // SALVAR ENTRADA DE ESTOQUE
  async function handleSalvarTudo(e) {
    e.preventDefault();
    setMsg("");
    setCarregando(true);

    // VALIDAÇÃO: Fornecedor obrigatório
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
    <div className="estoque-limpo-main">
      <h2 className="estoque-limpo-titulo">Entrada de Estoque</h2>

      {/* === Bloco Fornecedor (Select + botão novo) === */}
      <section className="estoque-limpo-section">
        <h3>Dados do Fornecedor</h3>
        <div style={{ maxWidth: 460 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
            <label style={{ color: "#ffe066", fontWeight: 700 }}>
              Fornecedor *
            </label>
            <button
              type="button"
              title="Cadastrar novo fornecedor"
              style={{
                fontWeight: 700,
                fontSize: 19,
                background: "linear-gradient(90deg, #7c3aed 60%, #ffe066 130%)",
                border: "none",
                color: "#fff",
                borderRadius: 8,
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 1px 7px #37008a29"
              }}
              onClick={() => {
                setNovoFornecedor({});
                setModalFornecedorOpen(true);
              }}
            >+</button>
          </div>
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
          />
          {/* Exibe info ao selecionar */}
          {fornecedorSelecionado && (
            <div style={{ marginTop: 14, color: "#ffe066cc", fontSize: "1.08rem" }}>
              <div><b>Razão Social:</b> {fornecedorSelecionado.razaoSocial}</div>
              <div><b>CNPJ/CPF:</b> {fornecedorSelecionado.cnpjCpf}</div>
              <div><b>Nome:</b> {fornecedorSelecionado.nomeVendedor}</div>
            </div>
          )}
        </div>
      </section>

      {/* Produtos Dinâmicos */}
      <section className="estoque-limpo-section">
        <form onSubmit={handleSalvarTudo}>
          <h3 style={{ display: "flex", alignItems: "center", gap: 12 }}>
            Produtos
            <button
              type="button"
              title="Cadastrar novo produto"
              style={{
                marginLeft: 6,
                fontWeight: 700,
                fontSize: 19,
                background: "linear-gradient(90deg, #7c3aed 60%, #c394fa 100%)",
                border: "none",
                color: "#fff",
                borderRadius: 8,
                width: 34,
                height: 34,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 1px 7px #37008a29"
              }}
              onClick={() => {
                setNovoProduto({});
                setCadastroProdutoModalOpen(true);
              }}
            >+</button>
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
              <h3>Informações do lote</h3>
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
              {carregando ? "Salvando..." : "Finalizar Entrada"}
            </button>
          </div>

          {msg && <div className="estoque-limpo-msg">{msg}</div>}
        </form>
      </section>

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
            background: "rgba(30, 30, 60, 0.58)",
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
              background: "rgba(40, 40, 60, 0.98)",
              borderRadius: 22,
              boxShadow: "0 8px 38px 0 rgba(36, 11, 54, 0.28)",
              padding: "0 0 18px 0",
              minWidth: 390,
              maxWidth: "96vw",
              color: "#f4f4fa",
              position: "relative",
              border: "1.5px solid #7a48ff33",
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
