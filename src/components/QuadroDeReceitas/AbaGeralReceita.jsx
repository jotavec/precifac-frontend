import React, { useRef, useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import imageCompression from "browser-image-compression";
import { FaUpload, FaCamera, FaPlus, FaTrash } from "react-icons/fa";
import "./AbaGeralReceita.css";

/** BACKEND base para montar URL pública em dev/prod */
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

/** Normaliza caminhos:
 * - base64: retorna como está
 * - absoluta (http/https): retorna como está
 * - relativa começando por /uploads: prefixa BACKEND_URL
 * - fallback: retorna original
 */
function toPublicUrl(url) {
  if (!url) return url;
  if (url.startsWith("data:image")) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/uploads/")) return `${BACKEND_URL}${url}`;
  return url;
}

// ========== COMPONENTE UPLOADER ============= //
function UploaderDeImagem({ imagemInicial, onImagemFinalAlterada }) {
  const [imagemFonte, setImagemFonte] = useState(null);
  const [imagemCortada, setImagemCortada] = useState(imagemInicial);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCrop, setShowCrop] = useState(false);
  const inputImgRef = useRef(null);
  console.log("imagemCortada (preview):", imagemCortada);

  useEffect(() => {
    setImagemCortada(imagemInicial);
  }, [imagemInicial]);

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      let compressed = file;
      try {
        compressed = await imageCompression(file, {
          maxSizeMB: 0.2,
          maxWidthOrHeight: 800,
          useWebWorker: true,
        });
      } catch (err) {
        alert("Erro ao comprimir imagem.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagemFonte(ev.target.result);
        setShowCrop(true);
      };
      reader.readAsDataURL(compressed);
    }
  };

  const aplicarCorte = async () => {
    if (!imagemFonte || !croppedAreaPixels) return;
    const image = new window.Image();
    image.src = imagemFonte;
    await new Promise((r) => (image.onload = r));
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 800;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      800,
      800
    );
    // Envia para backend usando FormData
    canvas.toBlob(
      async (blob) => {
        const formData = new FormData();
        formData.append("file", blob, "imagem-receita.jpg");
        try {
          const res = await fetch("/api/uploads/receita", {
            method: "POST",
            body: formData,
            credentials: "include",
          });
          if (!res.ok) throw new Error("Falha no upload");
          const data = await res.json();
          // data.url deve ser algo como "/uploads/receitas/xxx.jpg"
          const urlPublica = toPublicUrl(data.url);
          setImagemCortada(urlPublica);                // mostra corretamente no preview
          onImagemFinalAlterada(data.url);             // envia caminho relativo para o parent salvar
        } catch (err) {
          alert("Erro ao enviar imagem.");
        }
        setShowCrop(false);
        setImagemFonte(null);
      },
      "image/jpeg",
      0.92
    );
  };

  const removerImagem = (e) => {
    e.stopPropagation();
    setImagemCortada(null);
    setImagemFonte(null);
    onImagemFinalAlterada(null);
    if (inputImgRef.current) {
      inputImgRef.current.value = "";
    }
  };

  // Monta o src correto para preview (dev/prod)
  const getPreviewSrc = () => {
    if (!imagemCortada) return null;
    return toPublicUrl(imagemCortada);
  };

  const isPreviewValida =
    typeof imagemCortada === "string" &&
    imagemCortada.length > 4 &&
    !imagemCortada.startsWith("data:image") &&
    (imagemCortada.startsWith("/") || imagemCortada.startsWith("http"));

  return (
    <>
      <div
        className="receita-uploader-imagem"
        onClick={() => inputImgRef.current && inputImgRef.current.click()}
        title="Clique para adicionar ou alterar a imagem"
      >
        <input
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          ref={inputImgRef}
          onChange={handleFileChange}
        />
        {isPreviewValida ? (
          <>
            <img
              src={getPreviewSrc()}
              alt="Preview da Receita"
              className="receita-uploader-preview"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <button
              onClick={removerImagem}
              title="Remover imagem"
              className="receita-uploader-remove"
            >
              ×
            </button>
          </>
        ) : (
          <div className="receita-uploader-placeholder">
            <FaUpload size={50} />
            Clique para adicionar uma imagem
          </div>
        )}
      </div>
      {showCrop && (
        <div className="receita-cropper-bg">
          <div className="receita-cropper-modal">
            <div className="receita-cropper-content">
              <Cropper
                image={imagemFonte}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="receita-cropper-footer">
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="receita-cropper-zoom"
              />
              <div className="receita-cropper-actions">
                <button onClick={aplicarCorte} className="receita-cropper-btn">
                  Salvar Corte
                </button>
                <button
                  onClick={() => setShowCrop(false)}
                  className="receita-cropper-btn cancelar"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ========== COMPONENTE PASSO DE PREPARO ========== //
function PassoPreparo({ passo, index, onDescricaoChange, onImagemChange, onRemove }) {
  const inputImagemRef = useRef(null);
  const handleImagemClick = () => {
    inputImagemRef.current.click();
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onImagemChange(passo.id, event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  return (
    <div className="receita-passo-row">
      <span className="receita-passo-label">Passo {index + 1}</span>
      <textarea
        value={passo.descricao}
        onChange={(e) => onDescricaoChange(passo.id, e.target.value)}
        placeholder="Descreva o passo..."
        className="receita-passo-textarea"
      />
      <input
        type="file"
        accept="image/*"
        ref={inputImagemRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <button
        title="Adicionar imagem ao passo"
        className="receita-passo-img-btn"
        onClick={handleImagemClick}
      >
        {passo.imagem ? (
          <img
            src={passo.imagem}
            alt={`Passo ${index + 1}`}
            className="receita-passo-img-thumb"
          />
        ) : (
          <FaCamera />
        )}
      </button>
      <button
        title="Remover passo"
        onClick={() => onRemove(passo.id)}
        className="receita-passo-remove-btn"
      >
        <FaTrash size={22} color="#d32f2f" />
      </button>
    </div>
  );
}

const unidades = [
  { singular: "dia", plural: "dias" },
  { singular: "mês", plural: "meses" },
  { singular: "hora", plural: "horas" },
  { singular: "ano", plural: "anos" },
];

export default function AbaGeralReceita({
  nome,
  setNome,
  imagemFinal,
  setImagemFinal,
  conservacaoData,
  setConservacaoData,
  observacoes,
  setObservacoes,
  passosPreparo,
  setPassosPreparo,
}) {
  const [tempFocusIndex, setTempFocusIndex] = useState(null);

  function handleConservacaoChange(index, field, value) {
    const newData = [...conservacaoData];
    const finalValue = field === "tempoUnidade" ? Number(value) : value;
    newData[index][field] = finalValue;
    setConservacaoData(newData);
  }

  function getTempDisplay(item, index) {
    if (tempFocusIndex === index) return item.temp || "";
    if (item.temp && item.temp !== "") return `${item.temp}°C`;
    return "";
  }

  const adicionarPasso = () => {
    setPassosPreparo([
      ...passosPreparo,
      { id: Date.now(), descricao: "", imagem: null },
    ]);
  };
  const removerPasso = (id) => {
    setPassosPreparo(passosPreparo.filter((passo) => passo.id !== id));
  };
  const atualizarDescricaoPasso = (id, descricao) => {
    setPassosPreparo(
      passosPreparo.map((passo) =>
        passo.id === id ? { ...passo, descricao } : passo
      )
    );
  };
  const atualizarImagemPasso = (id, imagem) => {
    setPassosPreparo(
      passosPreparo.map((passo) =>
        passo.id === id ? { ...passo, imagem } : passo
      )
    );
  };

  return (
    <>
      <div className="receita-geral-main">
        <UploaderDeImagem
          imagemInicial={toPublicUrl(imagemFinal)}
          onImagemFinalAlterada={setImagemFinal}
        />
        <div className="receita-geral-formcol">
          {/* NOME DA RECEITA */}
          <div className="receita-geral-nome-box">
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Digite o nome da receita..."
              className="receita-geral-nome"
              autoFocus
              maxLength={140}
            />
          </div>
          <div className="receita-geral-row">
            <div className="receita-geral-bloco">
              <div className="receita-geral-bloco-titulo">Conservação:</div>
              <table className="receita-geral-tabela-cons">
                <thead>
                  <tr>
                    <th className="receita-geral-th-cons">Descrição</th>
                    <th className="receita-geral-th-cons">Temp. °C</th>
                    <th className="receita-geral-th-cons">Tempo</th>
                  </tr>
                </thead>
                <tbody>
                  {conservacaoData.map((item, idx) => (
                    <tr key={idx}>
                      <td className="receita-geral-td-cons">{item.descricao}</td>
                      <td className="receita-geral-td-cons">
                        <input
                          type="text"
                          value={getTempDisplay(item, idx)}
                          onFocus={(e) => {
                            setTempFocusIndex(idx);
                            setTimeout(() => e.target.select(), 0);
                          }}
                          onBlur={() => setTempFocusIndex(null)}
                          onChange={(e) =>
                            handleConservacaoChange(
                              idx,
                              "temp",
                              e.target.value.replace(/[^\d\-]/g, "")
                            )
                          }
                          className="receita-geral-input-cons"
                          style={{ width: 55 }}
                        />
                      </td>
                      <td className="receita-geral-td-cons">
                        <div className="receita-geral-td-flex">
                          <input
                            type="text"
                            value={item.tempoNum}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) =>
                              handleConservacaoChange(
                                idx,
                                "tempoNum",
                                e.target.value.replace(/[^\d]/g, "")
                              )
                            }
                            className="receita-geral-input-cons"
                            style={{ width: 45 }}
                          />
                          <select
                            className="receita-geral-input-cons"
                            style={{ width: 90, padding: "4px 8px", textAlign: "left" }}
                            value={item.tempoUnidade}
                            onChange={(e) =>
                              handleConservacaoChange(
                                idx,
                                "tempoUnidade",
                                e.target.value
                              )
                            }
                          >
                            {unidades.map((u, i) => (
                              <option key={i} value={i}>
                                {parseInt(item.tempoNum, 10) === 1
                                  ? u.singular
                                  : u.plural}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="receita-geral-bloco">
              <div className="receita-geral-bloco-titulo">Observações:</div>
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Adicione observações importantes sobre a receita..."
                className="receita-geral-textarea"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bloco do modo de preparo ocupando a largura TOTAL */}
      <div className="receita-geral-bloco modo-preparo">
        <div className="receita-geral-bloco-titulo">Modo de Preparo:</div>
        <div className="receita-geral-preparo-list">
          {passosPreparo.map((passo, index) => (
            <PassoPreparo
              key={passo.id}
              passo={passo}
              index={index}
              onDescricaoChange={atualizarDescricaoPasso}
              onImagemChange={atualizarImagemPasso}
              onRemove={removerPasso}
            />
          ))}
        </div>
        <button onClick={adicionarPasso} className="receita-geral-btn-addpasso">
          <FaPlus size={12} /> Adicionar Passo
        </button>
      </div>
    </>
  );
}
