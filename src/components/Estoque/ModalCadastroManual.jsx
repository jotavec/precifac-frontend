import React, { useState, useEffect } from "react";
import Cropper from "react-easy-crop";
import ModalCategorias from "./ModalCategorias";
import ModalRotuloNutricional from "./ModalRotuloNutricional";
import ModalMarcas from "./ModalMarcas";
import { listarMarcasProduto } from "../../services/marcasApi";
import { listarCategoriasProduto } from "../../services/categoriasApi";
import Select from "react-select";
import { FaCog, FaPlus, FaEdit, FaTrash, FaCheck, FaTimes } from "react-icons/fa";
import "./ModalCadastroManual.css";
import { BsInfoCircle } from "react-icons/bs";

function formatarDataBR(dataStr) {
  if (!dataStr) return "";
  if (dataStr.includes("T")) {
    const d = new Date(dataStr);
    return d.toLocaleDateString("pt-BR");
  }
  if (dataStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [ano, mes, dia] = dataStr.split("-");
    return `${dia}/${mes}/${ano}`;
  }
  return dataStr;
}

function gerarCodigoUnico(produtos = []) {
  let novoCodigo;
  do {
    novoCodigo = Date.now().toString().slice(-6) + Math.floor(Math.random() * 900 + 100);
  } while (produtos.some(item => item.codigo === novoCodigo));
  return novoCodigo;
}

function formatCentavosBRL(v) {
  v = (v ?? "").toString().replace(/[^\d]/g, "");
  if (v.length === 0) return "";
  while (v.length < 3) v = "0" + v;
  let reais = v.slice(0, -2);
  let centavos = v.slice(-2);
  reais = reais.replace(/^0+/, "") || "0";
  return `R$ ${reais.replace(/\B(?=(\d{3})+(?!\d))/g, ".")},${centavos}`;
}
function onlyDigits(v) {
  return (v ?? "").toString().replace(/[^\d]/g, "");
}
function parseCentavosToNumber(v) {
  if (!v) return 0;
  v = v.toString().replace(/[^\d]/g, "");
  if (v === "") return 0;
  return Number(v) / 100;
}

function SwitchAtivo({ checked, onChange }) {
  return (
    <div className="switch-ativo-col">
      <label className="switch-ativo-modern">
        <input
          type="checkbox"
          checked={checked}
          onChange={e => onChange(e.target.checked)}
        />
        <span className="switch-slider-modern"></span>
      </label>
      <span className={checked ? "switch-label-ativo-modern" : "switch-label-desativado-modern"}>
        {checked ? "Ativo" : "Desativado"}
      </span>
    </div>
  );
}

function getCroppedImg(imageSrc, crop) {
  return new Promise((resolve) => {
    const image = new window.Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(
        image,
        crop.x, crop.y, crop.width, crop.height,
        0, 0, crop.width, crop.height
      );
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        resolve(url);
      }, "image/jpeg");
    };
  });
}

const PEXELS_API_KEY = "WuzrA5OSZJWxMFWiKxI86odDbKqS3wecYrg3pV7NhvDp1030fglB6YjQ";
async function buscarImagensPexels(nome, page = 1) {
  if (!nome) return [];
  try {
    const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(nome)}%20produto%20packaging&per_page=4&page=${page}`, {
      headers: { Authorization: PEXELS_API_KEY }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.photos || []).map(photo => photo.src.medium || photo.src.original);
  } catch (e) {
    return [];
  }
}

async function buscarNomePorCodigoBarras(codBarras) {
  if (!codBarras) return "";
  try {
    const res = await fetch(`/api/buscar-nome-codbarras/${codBarras}`);
    if (!res.ok) return "";
    const data = await res.json();
    return data.nome || "";
  } catch {
    return "";
  }
}

// ESTILO PADRÃO DOS SELECTS
const selectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: "#f8fafd",
    borderColor: state.isFocused ? "#00cfff" : "#e1e9f7",
    color: "#237be7",
    minHeight: 44,
    boxShadow: state.isFocused ? "0 0 0 2px #00cfff44" : "none",
    "&:hover": { borderColor: "#2196f3" },
    borderRadius: 10,
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "#fff",
    color: "#237be7",
    zIndex: 9999,
    borderRadius: 10,
    marginTop: 2,
    boxShadow: "0 2px 12px #a0cef540"
  }),
  menuPortal: base => ({ ...base, zIndex: 99999 }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused
      ? "#e1e9f7"
      : state.isSelected
        ? "#00cfff22"
        : "#fff",
    color: "#237be7",
    cursor: "pointer"
  }),
  singleValue: (base) => ({
    ...base,
    color: "#237be7"
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: "#f8fafd",
    color: "#237be7",
    border: "1px solid #e1e9f7"
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: "#237be7"
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: "#2196f3",
    ":hover": {
      backgroundColor: "#e1e9f7",
      color: "#ef4444"
    }
  }),
  placeholder: (base) => ({
    ...base,
    color: "#8fb9e7"
  }),
  input: (base) => ({
    ...base,
    color: "#237be7"
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: "#00cfff"
  }),
  indicatorSeparator: (base) => ({
    ...base,
    backgroundColor: "#00cfff"
  }),
  clearIndicator: (base) => ({
    ...base,
    color: "#00cfff"
  }),
};

// ESTILO DOS SELECTS DO ROTULO (com scroll forçado)
const selectStylesRotulo = {
  ...selectStyles,
  menu: (base) => ({
    ...base,
    backgroundColor: "#fff",
    color: "#237be7",
    zIndex: 9999,
    borderRadius: 10,
    marginTop: 2,
    boxShadow: "0 2px 12px #a0cef540",
    maxHeight: 160,
    overflowY: "auto",
    overscrollBehavior: "contain",
  }),
};

const unidadeMedidaOptions = [
  { value: "Unidade", label: "Unidade (un.)" },
  { value: "Pacote", label: "Pacote (pct.)" },
  { value: "Caixa", label: "Caixa" },
  { value: "Dúzia", label: "Dúzia" },
  { value: "Grama", label: "Grama (g)" },
  { value: "Quilograma", label: "Quilograma (kg)" },
  { value: "Miligrama", label: "Miligrama (mg)" },
  { value: "Micrograma", label: "Micrograma (mcg)" },
  { value: "Litro", label: "Litro (l)" },
  { value: "Mililitro", label: "Mililitro (ml)" },
  { value: "Metro", label: "Metro (m)" },
  { value: "Centímetro", label: "Centímetro (cm)" },
  { value: "Milímetro", label: "Milímetro (mm)" },
];

export default function ModalCadastroManual({
  open, onClose, ingrediente, onSave, onDelete, onChange,
  refreshCategorias,
  refreshMarcas,
  produtos
}) {
  const [abaBloco, setAbaBloco] = useState("estoque");
  const [rotuloConfigOpen, setRotuloConfigOpen] = useState(false);

  // ======= ESTADO NOVO: puxa do backend SEMPRE =======
  const [categoriasNutricionais, setCategoriasNutricionais] = useState([]);

  // Busca as opções SEMPRE que abrir o modal OU trocar para aba de rótulo
  useEffect(() => {
    if (open && abaBloco === "rotulo") {
      fetch("/api/categorias-nutricionais", { credentials: "include" })
        .then(res => res.json())
        .then(data => setCategoriasNutricionais(Array.isArray(data) ? data : []));
    }
  }, [open, abaBloco]);

  // Gera as opções para os selects do rótulo
  const descricoesNutricionaisOptions = categoriasNutricionais.map(cat => ({
    value: cat.descricao,
    label: cat.descricao
  }));
  const unidadesNutricionaisOptions = [
    ...new Set(categoriasNutricionais.map(cat => cat.unidade))
  ].map(unidade => ({
    value: unidade,
    label: unidade
  }));

  // --- Demais estados originais (não precisa mexer) ---
  const [editIdx, setEditIdx] = useState(null);
  const [formRotulo, setFormRotulo] = useState({
    descricao: "", quantidade: "", unidade: "", vd: ""
  });

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropperModal, setShowCropperModal] = useState(false);
  const [tempImg, setTempImg] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [modalCategoriasOpen, setModalCategoriasOpen] = useState(false);
  const [marcas, setMarcas] = useState([]);
  const [modalMarcasOpen, setModalMarcasOpen] = useState(false);

  const [sugestoesImg, setSugestoesImg] = useState([]);
  const [paginaImagens, setPaginaImagens] = useState(1);
  const [loadingImagens, setLoadingImagens] = useState(false);
  const [temMaisImagens, setTemMaisImagens] = useState(true);
  const [loadingImgsIndex, setLoadingImgsIndex] = useState([]);

  const [custoTotalRaw, setCustoTotalRaw] = useState("");
  useEffect(() => {
    if (open && ingrediente.custoTotal && ingrediente.custoTotal !== parseCentavosToNumber(custoTotalRaw)) {
      setCustoTotalRaw(onlyDigits((ingrediente.custoTotal * 100).toString()));
    }
    if (open && !ingrediente.custoTotal) {
      setCustoTotalRaw("");
    }
  }, [open]);

  function handleCustoTotalChange(e) {
    const raw = onlyDigits(e.target.value);
    setCustoTotalRaw(raw);
    onChange({
      ...ingrediente,
      custoTotal: parseCentavosToNumber(raw)
    });
  }
  const custoTotalInputFormatted = formatCentavosBRL(custoTotalRaw);

  const custoUnitario =
    Number(ingrediente.totalEmbalagem) > 0 && Number(ingrediente.custoTotal) > 0
      ? ingrediente.custoTotal / Number(ingrediente.totalEmbalagem)
      : 0;

  function formatCustoUnitarioBRL(v) {
    if (!v || isNaN(v)) return "R$ 0,00";
    let [reais, decimais] = v.toFixed(4).split(".");
    reais = reais.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    let visual = `${reais},${decimais.slice(0,2)}`;
    return `R$ ${visual}`;
  }

  useEffect(() => {
    if (!open) setCustoTotalRaw("");
  }, [open]);
  useEffect(() => {
    if (ingrediente.custoTotal && typeof ingrediente.custoTotal === "number") {
      const valRaw = Math.round(Number(ingrediente.custoTotal) * 100).toString();
      if (valRaw !== custoTotalRaw) setCustoTotalRaw(valRaw);
    }
  }, [ingrediente.custoTotal]);

  useEffect(() => {
    if (open) listarMarcasProduto().then(setMarcas);
  }, [open, modalMarcasOpen]);
  useEffect(() => {
    if (open) listarCategoriasProduto().then(setCategorias);
  }, [open, modalCategoriasOpen]);

  useEffect(() => {
    if (!ingrediente.nome) {
      setSugestoesImg([]);
      setPaginaImagens(1);
      setTemMaisImagens(true);
      return;
    }
    let cancelado = false;
    async function buscar() {
      setLoadingImagens(true);
      const imgs = await buscarImagensPexels(ingrediente.nome, paginaImagens);
      if (!cancelado) {
        setSugestoesImg(imgs);
        setLoadingImgsIndex(imgs.map((_, idx) => idx));
        setTemMaisImagens(imgs.length === 4);
      }
      setLoadingImagens(false);
    }
    buscar();
    return () => { cancelado = true };
  }, [ingrediente.nome, paginaImagens]);

  useEffect(() => {
    setPaginaImagens(1);
    setTemMaisImagens(true);
  }, [ingrediente.nome]);

  function handleInput(e) {
    onChange({ ...ingrediente, [e.target.name]: e.target.value });
  }
  function handleAtivoChange(val) {
    onChange({ ...ingrediente, ativo: val });
  }
  function handleSelecionaCategoria(catNome) {
    onChange({ ...ingrediente, categoria: catNome });
  }

  useEffect(() => {
    if (
      open &&
      ingrediente.codBarras &&
      (!ingrediente.nome || ingrediente.nome === "")
    ) {
      buscarNomePorCodigoBarras(ingrediente.codBarras).then(nomeProd => {
        if (
          nomeProd &&
          (!ingrediente.nome || ingrediente.nome === "") &&
          ingrediente.nome !== nomeProd
        ) {
          onChange({ ...ingrediente, nome: nomeProd });
        }
      });
    }
  }, [open, ingrediente.codBarras]);

  function handleAddRotulo() {
    if (!formRotulo.descricao || !formRotulo.unidade) return;
    onChange({
      ...ingrediente,
      rotuloNutricional: [
        ...(ingrediente.rotuloNutricional || []),
        formRotulo
      ]
    });
    setFormRotulo({ descricao: "", quantidade: "", unidade: "", vd: "" });
    setEditIdx(null);
  }
  function handleDeleteRotulo(idx) {
    onChange({
      ...ingrediente,
      rotuloNutricional: (ingrediente.rotuloNutricional || []).filter((_, i) => i !== idx)
    });
  }
  function handleEditRotulo(idx) {
    setEditIdx(idx);
    setFormRotulo((ingrediente.rotuloNutricional || [])[idx]);
  }
  function handleSaveEditRotulo(idx) {
    onChange({
      ...ingrediente,
      rotuloNutricional: (ingrediente.rotuloNutricional || []).map((l, i) =>
        i === idx ? formRotulo : l
      )
    });
    setEditIdx(null);
    setFormRotulo({ descricao: "", quantidade: "", unidade: "", vd: "" });
  }
  function handleCancelEditRotulo() {
    setEditIdx(null);
    setFormRotulo({ descricao: "", quantidade: "", unidade: "", vd: "" });
  }

  const marcaOptions = marcas.map(marca => ({
    value: marca.nome,
    label: marca.nome
  }));
  const categoriaOptions = categorias.map(cat => ({
    value: cat.nome,
    label: cat.nome
  }));
  const unidadeOption = ingrediente.unidade
    ? unidadeMedidaOptions.find(opt => opt.value === ingrediente.unidade)
    : null;

  const [showInfoTooltip, setShowInfoTooltip] = useState(false);

  const [entradas, setEntradas] = useState([]);
  const [loadingEntradas, setLoadingEntradas] = useState(false);

  useEffect(() => {
    if (abaBloco === "historico" && ingrediente?.id) {
      setLoadingEntradas(true);
      fetch(`/api/produtos/${ingrediente.id}/entradas`, { credentials: "include" })
        .then(res => res.json())
        .then(data => setEntradas(Array.isArray(data) ? data : []))
        .catch(() => setEntradas([]))
        .finally(() => setLoadingEntradas(false));
    }
  }, [abaBloco, ingrediente?.id]);

  useEffect(() => {
    if (open && (!ingrediente.codigo || ingrediente.codigo === "")) {
      onChange({
        ...ingrediente,
        codigo: gerarCodigoUnico(produtos),
      });
    }
  }, [open, produtos]);

  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-cadastro-manual">
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Fechar"
        >
          ×
        </button>
        <h2 className="modal-title">Novo Cadastro</h2>
        <div className="cadastro-top-main">
          <div className="bloco-cadastro-esquerda">
            <div className="cadastro-row bloco-nome">
              <label className="label-form-braba" htmlFor="input-nome">
                Nome
              </label>
              <input
                id="input-nome"
                className="input-form-brabo input-grande"
                name="nome"
                value={ingrediente.nome || ""}
                onChange={handleInput}
                placeholder="Digite o nome do produto"
                autoFocus
                autoComplete="off"
                maxLength={60}
              />
            </div>
            <div className="cadastro-row bloco-marca">
              <label className="label-form-braba" htmlFor="input-marca">
                Marca
              </label>
              <div className="select-btn-grid" style={{ gap: 14 }}>
                <div style={{ flex: 1 }}>
                  <Select
                    inputId="input-marca"
                    classNamePrefix="input-form-brabo"
                    styles={selectStyles}
                    theme={theme => ({
                      ...theme,
                      colors: {
                        ...theme.colors,
                        primary: "#00cfff",
                        primary25: "#e1e9f7",
                        primary50: "#b3e6fa",
                        neutral0: "#fff",
                        neutral80: "#237be7",
                        neutral20: "#e1e9f7",
                        neutral30: "#00cfff",
                        neutral10: "#f8fafd",
                      }
                    })}
                    options={marcaOptions}
                    value={
                      Array.isArray(ingrediente.marca)
                        ? marcaOptions.filter(opt => ingrediente.marca.includes(opt.value))
                        : []
                    }
                    onChange={selected => onChange({
                      ...ingrediente,
                      marca: selected ? selected.map(opt => opt.value) : []
                    })}
                    placeholder="Selecione"
                    isClearable
                    isMulti
                  />
                </div>
                <button
                  type="button"
                  className="btn-add clean"
                  onClick={() => setModalMarcasOpen(true)}
                  title="Adicionar nova marca"
                  tabIndex={0}
                  style={{ marginLeft: 0 }}
                >
                  <span className="plus-icon">+</span>
                </button>
              </div>
            </div>
            <div className="cadastro-row bloco-categoria">
              <label className="label-form-braba" htmlFor="input-categoria">
                Categoria
              </label>
              <div className="select-btn-grid" style={{ gap: 14 }}>
                <div style={{ flex: 1 }}>
                  <Select
                    inputId="input-categoria"
                    classNamePrefix="input-form-brabo"
                    styles={selectStyles}
                    theme={theme => ({
                      ...theme,
                      colors: {
                        ...theme.colors,
                        primary: "#00cfff",
                        primary25: "#e1e9f7",
                        primary50: "#b3e6fa",
                        neutral0: "#fff",
                        neutral80: "#237be7",
                        neutral20: "#e1e9f7",
                        neutral30: "#00cfff",
                        neutral10: "#f8fafd",
                      }
                    })}
                    options={categoriaOptions}
                    value={
                      categoriaOptions.find(opt => opt.value === ingrediente.categoria) || null
                    }
                    onChange={selected => handleSelecionaCategoria(selected ? selected.value : "")}
                    placeholder="Selecione"
                    isClearable
                  />
                </div>
                <button
                  type="button"
                  className="btn-add clean"
                  onClick={() => setModalCategoriasOpen(true)}
                  title="Adicionar nova categoria"
                  tabIndex={0}
                  style={{ marginLeft: 0 }}
                >
                  <span className="plus-icon">+</span>
                </button>
              </div>
            </div>
            <div className="cadastro-row bloco-codigos">
              <div className="bloco-cod-interno">
                <label className="label-form-braba" htmlFor="input-codigo">
                  Código Interno
                </label>
                <input
                  id="input-codigo"
                  className="input-form-brabo"
                  name="codigo"
                  value={ingrediente.codigo || ""}
                  onChange={handleInput}
                  placeholder="Digite o código interno"
                  type="number"
                  min="1"
                  required
                  autoComplete="off"
                />
              </div>
              <div className="bloco-cod-barra">
                <label className="label-form-braba" htmlFor="input-codBarras">
                  Código de Barras
                </label>
                <input
                  id="input-codBarras"
                  className="input-form-brabo"
                  name="codBarras"
                  value={ingrediente.codBarras || ""}
                  onChange={handleInput}
                  placeholder="Digite o código de barras"
                  autoComplete="off"
                  maxLength={32}
                />
              </div>
            </div>
          </div>
          <div className="cadastro-top-direita">
            <div className="coluna-direita-fixa">
              <div>
                <div className="form-image grid-marcar">
                  <label htmlFor="input-imagem" className="input-imagem-label">
                    {ingrediente.imagem ? (
                      <img
                        src={ingrediente.imagem}
                        alt="Imagem do produto"
                        className="imagem-produto"
                      />
                    ) : (
                      <>
                        <span style={{ fontSize: 36, marginBottom: 8 }}>📷</span>
                        <span>Sem foto</span>
                        <span style={{ fontSize: 12, marginTop: 2 }}>Clique para adicionar</span>
                      </>
                    )}
                    <input
                      id="input-imagem"
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={e => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setTempImg(reader.result);
                            setShowCropperModal(true);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
                <div className="sugestao-imagem-painel">
                  <div
                    className="sugestao-titulo-independente"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      position: "relative",
                      justifyContent: "center",
                    }}
                  >
                    SUGESTÃO DE IMAGEM
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        cursor: "pointer",
                        marginLeft: 2,
                        position: "relative",
                        opacity: 0.46
                      }}
                      onMouseEnter={() => setShowInfoTooltip(true)}
                      onMouseLeave={() => setShowInfoTooltip(false)}
                      tabIndex={0}
                    >
                      <BsInfoCircle
                        color="#d4cffb"
                        size={14}
                        style={{
                          width: 14,
                          height: 14,
                          minWidth: 14,
                          minHeight: 14,
                          maxWidth: 14,
                          maxHeight: 14,
                          background: "none",
                          borderRadius: 0
                        }}
                      />
                      {showInfoTooltip && (
                        <span
                          style={{
                            position: "absolute",
                            top: 18,
                            left: -8,
                            background: "#211a388f",
                            color: "#ccc",
                            padding: "4px 10px",
                            borderRadius: 6,
                            fontSize: 12.5,
                            minWidth: 120,
                            boxShadow: "0 2px 8px #0e0b2222",
                            zIndex: 20,
                            whiteSpace: "normal",
                            border: "1px solid #343056",
                            fontWeight: 400,
                          }}
                        >
                          Sugestão gerada via <b>Pexels</b> com base no nome.
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="sugestoes-img-row">
                    {sugestoesImg.map((img, idx) => (
                      <div key={idx} style={{
                        display: "inline-block",
                        position: "relative",
                        width: 54,
                        height: 54,
                        marginRight: 7,
                        borderRadius: 9,
                        overflow: "hidden",
                        background: "#e1e9f7",
                        border: ingrediente.imagem === img ? "2px solid #00cfff" : "2px solid #e1e9f7",
                      }}>
                        {loadingImgsIndex.includes(idx) && (
                          <div style={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "rgba(30,18,54,0.12)",
                            zIndex: 2,
                          }}>
                            <div className="loader-bolinha"></div>
                          </div>
                        )}
                        <img
                          src={img}
                          alt={`Sugestão ${idx + 1}`}
                          className="sugestao-thumb"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            filter: loadingImgsIndex.includes(idx) ? "blur(2px) grayscale(60%)" : "",
                            transition: "filter 0.3s",
                          }}
                          onLoad={() =>
                            setLoadingImgsIndex(prev => prev.filter(x => x !== idx))
                          }
                          onClick={() => onChange({ ...ingrediente, imagem: img })}
                        />
                      </div>
                    ))}
                  </div>
                  {!loadingImagens && sugestoesImg.length > 0 && temMaisImagens && (
                    <div
                      onClick={() => setPaginaImagens(p => p + 1)}
                      style={{
                        marginTop: -5,
                        color: "#14c",
                        fontWeight: 500,
                        fontSize: 14,
                        cursor: "pointer",
                        textAlign: "right"
                      }}
                    >
                      Mostrar mais...
                    </div>
                  )}
                  {!loadingImagens && sugestoesImg.length === 0 && (
                    <div className="sugestao-vazia">Sem sugestões para o termo buscado.</div>
                  )}
                </div>
              </div>
              <SwitchAtivo checked={!!ingrediente.ativo} onChange={handleAtivoChange} />
            </div>
          </div>
        </div>

        {/* ABAS E BLOCOS FIXOS */}
        {/* ESTOQUE */}
        {abaBloco === "estoque" && (
          <div className="bloco-estoque-custos">
            <div className="abas-cadastro">
              <button
                className={abaBloco === "estoque" ? "aba-btn ativa" : "aba-btn"}
                onClick={() => setAbaBloco("estoque")}
                type="button"
              >
                Estoque e Custos
              </button>
              <button
                className={abaBloco === "rotulo" ? "aba-btn ativa" : "aba-btn"}
                onClick={() => setAbaBloco("rotulo")}
                type="button"
              >
                Rótulo Nutricional
              </button>
              <button
                className={abaBloco === "historico" ? "aba-btn ativa" : "aba-btn"}
                onClick={() => setAbaBloco("historico")}
                type="button"
              >
                Histórico de Entradas
              </button>
            </div>
            <div className="estoque-custos-grid bloco-escuro-custom">
              <div>
                <label className="label-form-braba" htmlFor="input-totalEmbalagem">
                  Total na Embalagem
                </label>
                <input
                  id="input-totalEmbalagem"
                  className="input-form-brabo"
                  name="totalEmbalagem"
                  value={ingrediente.totalEmbalagem || ""}
                  onChange={handleInput}
                  placeholder="Informe o total"
                  type="number"
                  min="0"
                />
              </div>
              <div>
                <label className="label-form-braba" htmlFor="input-unidade">
                  Unidade de Medida
                </label>
                <Select
                  inputId="input-unidade"
                  classNamePrefix="input-form-brabo"
                  styles={{
                    ...selectStyles,
                    menuPortal: base => ({ ...base, zIndex: 99999 }),
                  }}
                  menuPortalTarget={document.body}
                  theme={theme => ({
                    ...theme,
                    colors: {
                      ...theme.colors,
                      primary: "#00cfff",
                      primary25: "#e1e9f7",
                      primary50: "#b3e6fa",
                      neutral0: "#fff",
                      neutral80: "#237be7",
                      neutral20: "#e1e9f7",
                      neutral30: "#00cfff",
                      neutral10: "#f8fafd",
                    }
                  })}
                  options={unidadeMedidaOptions}
                  value={unidadeOption}
                  onChange={selected =>
                    onChange({ ...ingrediente, unidade: selected ? selected.value : "" })
                  }
                  placeholder="Selecione"
                  isClearable
                  menuPlacement="auto"
                />
              </div>
              <div>
                <label className="label-form-braba" htmlFor="input-custoTotal">
                  Custo Total (R$)
                </label>
                <input
                  id="input-custoTotal"
                  name="custoTotal"
                  className="input-form-brabo"
                  value={custoTotalInputFormatted}
                  onChange={handleCustoTotalChange}
                  placeholder="R$ 0,00"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={20}
                />
              </div>
              <div>
                <label className="label-form-braba" htmlFor="input-custoUnitario">
                  Custo Unitário (R$)
                </label>
                <input
                  id="input-custoUnitario"
                  className="input-form-brabo"
                  value={formatCustoUnitarioBRL(custoUnitario)}
                  disabled
                  placeholder="R$ 0,00"
                />
              </div>
              <div>
                <label className="label-form-braba" htmlFor="input-estoque">
                  Quantidade em Estoque
                </label>
                <input
                  id="input-estoque"
                  className="input-form-brabo"
                  name="estoque"
                  value={ingrediente.estoque || ""}
                  onChange={handleInput}
                  placeholder="0"
                  type="number"
                  min="0"
                />
              </div>
              <div>
                <label className="label-form-braba" htmlFor="input-estoqueMinimo">
                  Estoque Mínimo
                </label>
                <input
                  id="input-estoqueMinimo"
                  className="input-form-brabo"
                  name="estoqueMinimo"
                  value={ingrediente.estoqueMinimo || ""}
                  onChange={handleInput}
                  placeholder="0"
                  type="number"
                  min="0"
                />
              </div>
            </div>
          </div>
        )}

        {/* RÓTULO */}
        {abaBloco === "rotulo" && (
          <div className="bloco-rotulo-nutricional">
            <div className="abas-cadastro">
              <button
                className={abaBloco === "estoque" ? "aba-btn ativa" : "aba-btn"}
                onClick={() => setAbaBloco("estoque")}
                type="button"
              >
                Estoque e Custos
              </button>
              <button
                className={abaBloco === "rotulo" ? "aba-btn ativa" : "aba-btn"}
                onClick={() => setAbaBloco("rotulo")}
                type="button"
              >
                Rótulo Nutricional
              </button>
              <button
                className={abaBloco === "historico" ? "aba-btn ativa" : "aba-btn"}
                onClick={() => setAbaBloco("historico")}
                type="button"
              >
                Histórico de Entradas
              </button>
            </div>
            <div className="rotulo-header" style={{ display: 'flex', justifyContent: 'flex-Cend', gap: 12, marginBottom: 18 }}>
              <button
                type="button"
                className="rotulo-btn-cog"
                title="Gerenciar categorias nutricionais"
                onClick={() => setRotuloConfigOpen(true)}
                style={{ marginRight: 4 }}
              >
                <FaCog />
              </button>
              <button
                onClick={() => setEditIdx(-1)}
                type="button"
                className="rotulo-btn-add"
                title="Adicionar linha"
              >
                <FaPlus />
              </button>
            </div>
            <table className="rotulo-table">
              <thead>
                <tr>
                  <th className="rotulo-td-desc">Descrição</th>
                  <th className="rotulo-td-quant">Quantidade</th>
                  <th className="rotulo-td-unid">Unidade de Medida</th>
                  <th className="rotulo-td-vd">%VD</th>
                  <th className="rotulo-td-acoes"></th>
                </tr>
              </thead>
              <tbody>
                {editIdx === -1 && (
                  <tr style={{ background: "#f8fafd" }}>
                    <td>
                      <Select
                        classNamePrefix="input-form-brabo"
                        styles={{
                          ...selectStylesRotulo,
                          menuPortal: base => ({ ...base, zIndex: 99999 }),
                        }}
                        menuPortalTarget={document.body}
                        theme={theme => ({
                          ...theme,
                          colors: {
                            ...theme.colors,
                            primary: "#00cfff",
                            primary25: "#e1e9f7",
                            primary50: "#b3e6fa",
                            neutral0: "#fff",
                            neutral80: "#237be7",
                            neutral20: "#e1e9f7",
                            neutral30: "#00cfff",
                            neutral10: "#f8fafd",
                          }
                        })}
                        options={descricoesNutricionaisOptions}
                        value={
                          formRotulo.descricao
                            ? { value: formRotulo.descricao, label: formRotulo.descricao }
                            : null
                        }
                        onChange={selected =>
                          setFormRotulo(f => ({ ...f, descricao: selected ? selected.value : "" }))
                        }
                        placeholder="Selecione"
                        isClearable
                        menuPlacement="top"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        placeholder="Quantidade"
                        className="input-form-brabo"
                        value={formRotulo.quantidade}
                        onChange={e => setFormRotulo(f => ({ ...f, quantidade: e.target.value }))}
                      />
                    </td>
                    <td>
                      <Select
                        classNamePrefix="input-form-brabo"
                        styles={{
                          ...selectStylesRotulo,
                          menuPortal: base => ({ ...base, zIndex: 99999 }),
                        }}
                        menuPortalTarget={document.body}
                        theme={theme => ({
                          ...theme,
                          colors: {
                            ...theme.colors,
                            primary: "#00cfff",
                            primary25: "#e1e9f7",
                            primary50: "#b3e6fa",
                            neutral0: "#fff",
                            neutral80: "#237be7",
                            neutral20: "#e1e9f7",
                            neutral30: "#00cfff",
                            neutral10: "#f8fafd",
                          }
                        })}
                        options={unidadesNutricionaisOptions}
                        value={
                          formRotulo.unidade
                            ? { value: formRotulo.unidade, label: formRotulo.unidade }
                            : null
                        }
                        onChange={selected =>
                          setFormRotulo(f => ({ ...f, unidade: selected ? selected.value : "" }))
                        }
                        placeholder="Selecione"
                        isClearable
                        menuPlacement="top"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        placeholder="%VD"
                        className="input-form-brabo"
                        value={formRotulo.vd}
                        onChange={e => setFormRotulo(f => ({ ...f, vd: e.target.value }))}
                      />
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <div className="acoes-rotulo-btns">
                        <button
                          onClick={handleAddRotulo}
                          type="button"
                          className="rotulo-table-btn-save"
                          title="Salvar"
                        >
                          <FaCheck style={{ color: "#237be7", fontSize: "1.4rem" }} />
                        </button>
                        <button
                          onClick={handleCancelEditRotulo}
                          type="button"
                          className="rotulo-table-btn-cancel"
                          title="Cancelar"
                        >
                          <FaTimes style={{ color: "#ef4444", fontSize: "1.4rem" }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
                {(ingrediente.rotuloNutricional || []).length === 0 && (
                  <tr>
                    <td colSpan={5} className="rotulo-nenhuma-linha">
                      Nenhuma linha adicionada.
                    </td>
                  </tr>
                )}
                {(ingrediente.rotuloNutricional || []).map((linha, idx) =>
                  editIdx === idx ? (
                    <tr key={idx} style={{ background: "#f8fafd" }}>
                      <td>
                        <Select
                          classNamePrefix="input-form-brabo"
                          styles={{
                            ...selectStylesRotulo,
                            menuPortal: base => ({ ...base, zIndex: 99999 }),
                          }}
                          menuPortalTarget={document.body}
                          theme={theme => ({
                            ...theme,
                            colors: {
                              ...theme.colors,
                              primary: "#00cfff",
                              primary25: "#e1e9f7",
                              primary50: "#b3e6fa",
                              neutral0: "#fff",
                              neutral80: "#237be7",
                              neutral20: "#e1e9f7",
                              neutral30: "#00cfff",
                              neutral10: "#f8fafd",
                            }
                          })}
                          options={descricoesNutricionaisOptions}
                          value={
                            formRotulo.descricao
                              ? { value: formRotulo.descricao, label: formRotulo.descricao }
                              : null
                          }
                          onChange={selected =>
                            setFormRotulo(f => ({ ...f, descricao: selected ? selected.value : "" }))
                          }
                          placeholder="Selecione"
                          isClearable
                          menuPlacement="top"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="input-form-brabo"
                          value={formRotulo.quantidade}
                          onChange={e => setFormRotulo(f => ({ ...f, quantidade: e.target.value }))}
                        />
                      </td>
                      <td>
                        <Select
                          classNamePrefix="input-form-brabo"
                          styles={{
                            ...selectStylesRotulo,
                            menuPortal: base => ({ ...base, zIndex: 99999 }),
                          }}
                          menuPortalTarget={document.body}
                          theme={theme => ({
                            ...theme,
                            colors: {
                              ...theme.colors,
                              primary: "#00cfff",
                              primary25: "#e1e9f7",
                              primary50: "#b3e6fa",
                              neutral0: "#fff",
                              neutral80: "#237be7",
                              neutral20: "#e1e9f7",
                              neutral30: "#00cfff",
                              neutral10: "#f8fafd",
                            }
                          })}
                          options={unidadesNutricionaisOptions}
                          value={
                            formRotulo.unidade
                              ? { value: formRotulo.unidade, label: formRotulo.unidade }
                              : null
                          }
                          onChange={selected =>
                            setFormRotulo(f => ({ ...f, unidade: selected ? selected.value : "" }))
                          }
                          placeholder="Selecione"
                          isClearable
                          menuPlacement="top"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="input-form-brabo"
                          value={formRotulo.vd}
                          onChange={e => setFormRotulo(f => ({ ...f, vd: e.target.value }))}
                        />
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <div className="acoes-rotulo-btns">
                          <button
                            onClick={() => handleSaveEditRotulo(idx)}
                            className="rotulo-table-btn-save"
                            title="Salvar"
                          >
                            <FaCheck style={{ color: "#237be7", fontSize: "1.4rem" }} />
                          </button>
                          <button
                            onClick={handleCancelEditRotulo}
                            className="rotulo-table-btn-cancel"
                            title="Cancelar"
                          >
                            <FaTimes style={{ color: "#ef4444", fontSize: "1.4rem" }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr key={idx}>
                      <td className="rotulo-td-desc">{linha.descricao}</td>
                      <td className="rotulo-td-quant">{linha.quantidade}</td>
                      <td className="rotulo-td-unid">{linha.unidade}</td>
                      <td className="rotulo-td-vd">{linha.vd ? `${linha.vd}%` : ""}</td>
                      <td className="rotulo-td-acoes" style={{ textAlign: "center" }}>
                        <div className="acoes-rotulo-btns">
                          <button
                            onClick={() => handleEditRotulo(idx)}
                            className="rotulo-table-btn-edit"
                            title="Editar"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteRotulo(idx)}
                            className="rotulo-table-btn-delete"
                            title="Excluir"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* HISTÓRICO */}
        {abaBloco === "historico" && (
          <div className="bloco-historico-entradas bloco-escuro-custom">
            <div className="abas-cadastro">
              <button
                className={abaBloco === "estoque" ? "aba-btn ativa" : "aba-btn"}
                onClick={() => setAbaBloco("estoque")}
                type="button"
              >
                Estoque e Custos
              </button>
              <button
                className={abaBloco === "rotulo" ? "aba-btn ativa" : "aba-btn"}
                onClick={() => setAbaBloco("rotulo")}
                type="button"
              >
                Rótulo Nutricional
              </button>
              <button
                className={abaBloco === "historico" ? "aba-btn ativa" : "aba-btn"}
                onClick={() => setAbaBloco("historico")}
                type="button"
              >
                Histórico de Entradas
              </button>
            </div>
            {loadingEntradas ? (
              <div>Carregando...</div>
            ) : entradas.length === 0 ? (
              <div>Nenhuma entrada registrada ainda.</div>
            ) : (
              <div className="historico-entradas-wrapper">
                <table className="historico-entradas-table">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Quantidade</th>
                      <th>Lote</th>
                      <th>Valor</th>
                      <th>Usuário</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entradas.map((entrada, idx) => (
                      <tr key={entrada.id || idx}>
                        <td>
                          {(() => {
                            const dt = entrada.data || entrada.createdAt;
                            if (!dt) return "";
                            if (/^\d{4}-\d{2}-\d{2}$/.test(dt)) {
                              const [ano, mes, dia] = dt.split("-");
                              return `${dia}/${mes}/${ano}`;
                            }
                            const match = dt.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
                            if (match) return `${match[1]}/${match[2]}/${match[3]}`;
                            if (dt.includes("T")) {
                              const d = new Date(dt);
                              if (!isNaN(d)) return d.toLocaleDateString("pt-BR");
                            }
                            return dt;
                          })()}
                        </td>
                        <td>{entrada.quantidade}</td>
                        <td>{entrada.lote || "-"}</td>
                        <td>{entrada.valor ? `R$ ${Number(entrada.valor).toFixed(2)}` : "-"}</td>
                        <td>{entrada.user?.name || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        <div className="acoes-cadastro-btns-rodape">
          <button
            className="btn-salvar"
            type="button"
            onClick={() => onSave && onSave(ingrediente)}
          >Salvar</button>
          <button
            className="btn-cancelar"
            type="button"
            onClick={onClose}
          >Cancelar</button>
          <button
            className="btn-excluir"
            type="button"
            onClick={() => onDelete && onDelete(ingrediente)}
          >Excluir</button>
        </div>
        {showCropperModal && (
          <div className="modal-backdrop" style={{ zIndex: 200 }}>
            <div
              style={{
                background: "#fff",
                borderRadius: 22,
                padding: 38,
                minWidth: 370,
                minHeight: 440,
                boxShadow: "0 8px 48px #2196f399",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <div
                style={{
                  width: 320,
                  height: 320,
                  background: "#f8fafd",
                  borderRadius: 16,
                  overflow: "hidden",
                  position: "relative",
                  marginBottom: 26,
                  border: "2px solid #00cfff"
                }}
              >
                <Cropper
                  image={tempImg}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="rect"
                  showGrid={false}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={(_, cropped) => setCroppedAreaPixels(cropped)}
                />
              </div>
              <div style={{ display: "flex", gap: 18, marginTop: 5 }}>
                <button
                  className="btn-salvar"
                  type="button"
                  style={{
                    minWidth: 108,
                    background: "linear-gradient(90deg, #00cfff, #2196f3)",
                    color: "#fff",
                    fontWeight: 700,
                    borderRadius: 12,
                    border: "none",
                    padding: "11px 36px",
                    fontSize: 18,
                    cursor: "pointer"
                  }}
                  onClick={async () => {
                    const croppedImg = await getCroppedImg(tempImg, croppedAreaPixels);
                    onChange({ ...ingrediente, imagem: croppedImg });
                    setShowCropperModal(false);
                    setTempImg(null);
                  }}
                >
                  Usar
                </button>
                <button
                  className="btn-cancelar"
                  type="button"
                  style={{
                    minWidth: 108,
                    background: "#e1e9f7",
                    color: "#237be7",
                    fontWeight: 700,
                    borderRadius: 12,
                    border: "none",
                    padding: "11px 36px",
                    fontSize: 18,
                    cursor: "pointer"
                  }}
                  onClick={() => {
                    setShowCropperModal(false);
                    setTempImg(null);
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
        <ModalCategorias
          open={modalCategoriasOpen}
          onClose={() => setModalCategoriasOpen(false)}
          refresh={refreshCategorias}
        />
        <ModalMarcas
          open={modalMarcasOpen}
          onClose={() => setModalMarcasOpen(false)}
          refresh={refreshMarcas}
        />
        <ModalRotuloNutricional
          open={rotuloConfigOpen}
          onClose={() => setRotuloConfigOpen(false)}
          descricoes={categoriasNutricionais.map(cat => cat.descricao)}
          unidades={[...new Set(categoriasNutricionais.map(cat => cat.unidade))]}
          setDescricoes={descArr => setCategoriasNutricionais(categoriasNutricionais.map((cat, i) => ({ ...cat, descricao: descArr[i] || cat.descricao })))}
          setUnidades={unArr => setCategoriasNutricionais(categoriasNutricionais.map((cat, i) => ({ ...cat, unidade: unArr[i] || cat.unidade })))}
        />
      </div>
    </div>
  );
}
