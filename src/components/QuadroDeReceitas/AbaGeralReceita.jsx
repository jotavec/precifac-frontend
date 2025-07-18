import React, { useRef, useState, useCallback } from "react";
import Cropper from "react-easy-crop";

const defaultConservacao = [
  { descricao: "Congelado", temp: "-18", unidade: "°C", tempoNum: "6", tempoUnidade: "meses" },
  { descricao: "Refrigerado", temp: "4", unidade: "°C", tempoNum: "3", tempoUnidade: "dias" },
  { descricao: "Ambiente", temp: "20", unidade: "°C", tempoNum: "2", tempoUnidade: "horas" }
];

export default function AbaGeralReceita() {
  // IMAGEM
  const [imgPreview, setImgPreview] = useState(null);
  const inputImgRef = useRef(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCrop, setShowCrop] = useState(false);

  // CONSERVAÇÃO
  const [conservacao, setConservacao] = useState(defaultConservacao);

  // Funções imagem/cropper
  function handleImgChange(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImgPreview(ev.target.result);
        setShowCrop(true);
      };
      reader.readAsDataURL(file);
    }
  }
  function handleClickUpload() {
    inputImgRef.current && inputImgRef.current.click();
  }
  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);
  async function showCroppedImage() {
    if (!imgPreview || !croppedAreaPixels) return;
    const image = new window.Image();
    image.src = imgPreview;
    await new Promise(r => image.onload = r);
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(
      image,
      croppedAreaPixels.x, croppedAreaPixels.y, croppedAreaPixels.width, croppedAreaPixels.height,
      0, 0, 400, 400
    );
    setImgPreview(canvas.toDataURL("image/jpeg"));
    setShowCrop(false);
  }

  // Função para editar valor
  function handleEdit(idx, campo, valor) {
    setConservacao(arr =>
      arr.map((item, i) => i === idx ? { ...item, [campo]: valor } : item)
    );
  }

  return (
    <div style={{
      display: "flex",
      gap: 32,
      justifyContent: "flex-start",
      alignItems: "flex-start",
      width: "100%",
      maxWidth: 1000,
      margin: "0 auto",
      padding: "18px 0 18px 0"
    }}>
      {/* BLOCO IMAGEM */}
      <div
        onClick={handleClickUpload}
        style={{
          minWidth: 210,
          minHeight: 210,
          borderRadius: 16,
          border: "2px dashed #ffe06688",
          background: "#261954",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#cbb165",
          fontWeight: 800,
          fontSize: 22,
          textAlign: "center",
          cursor: "pointer",
          boxSizing: "border-box",
          position: "relative"
        }}
        title="Clique para adicionar/editar imagem"
      >
        <input
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          ref={inputImgRef}
          onChange={handleImgChange}
        />
        {showCrop && (
          <div style={{
            position: "fixed",
            left: 0, top: 0, width: "100vw", height: "100vh",
            zIndex: 99,
            background: "rgba(10,8,24,0.88)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <div style={{
              background: "#231a34",
              borderRadius: 22,
              boxShadow: "0 8px 60px #1b0c4888",
              padding: "24px",
              minWidth: 350
            }}>
              <Cropper
                image={imgPreview}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="rect"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
              <div style={{ marginTop: 16, display: "flex", gap: 16 }}>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  style={{ width: 120 }}
                />
                <button onClick={showCroppedImage}>Salvar corte</button>
                <button onClick={() => setShowCrop(false)}>Cancelar</button>
              </div>
            </div>
          </div>
        )}
        {imgPreview
          ? <img src={imgPreview} alt="Imagem" style={{
              maxWidth: "95%", maxHeight: "95%", objectFit: "cover", borderRadius: 12
            }} />
          : <>Clique para<br />adicionar<br />uma imagem</>
        }
      </div>

      {/* BLOCO CONSERVAÇÃO */}
      <div style={{
        flex: 1,
        background: "#24154a",
        borderRadius: 16,
        padding: "20px 24px 18px 24px",
        minWidth: 350,
        boxSizing: "border-box",
        border: "none"
      }}>
        <div style={{
          fontWeight: 900,
          fontSize: 24,
          color: "#ffe066",
          marginBottom: 10,
          letterSpacing: 1
        }}>
          Conservação:
        </div>
        <table style={{
          width: "100%",
          borderCollapse: "collapse",
        }}>
          <thead>
            <tr style={{ background: "#24154a" }}>
              <th style={thCons}>Descrição</th>
              <th style={thCons}>Temp. °C</th>
              <th style={thCons}>Tempo</th>
            </tr>
          </thead>
          <tbody>
            {conservacao.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: "1px solid #37276a33" }}>
                <td style={tdCons}>{item.descricao}</td>
                <td style={tdCons}>
                  <span style={pillInput}>
                    <input
                      type="text"
                      value={item.temp + item.unidade}
                      onChange={e => {
                        let v = e.target.value.replace(/[^\d\-]/g, "");
                        handleEdit(idx, "temp", v);
                      }}
                      style={{
                        ...inputNoBg,
                        width: 44,
                        color: "#fff",
                        textAlign: "center"
                      }}
                    />
                  </span>
                </td>
                <td style={tdCons}>
                  <span style={pillInput}>
                    <input
                      type="text"
                      value={item.tempoNum}
                      onChange={e => handleEdit(idx, "tempoNum", e.target.value.replace(/[^\d]/g, ""))}
                      style={{
                        ...inputNoBg,
                        width: 28,
                        color: "#fff",
                        textAlign: "center"
                      }}
                    />
                  </span>
                  <span style={{
                    color: "#ffe066",
                    marginLeft: 12,
                    fontWeight: 700,
                    fontSize: 17,
                  }}>
                    {item.tempoUnidade}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ======= ESTILOS =======
const thCons = {
  color: "#ffe066",
  fontWeight: 900,
  fontSize: 18,
  background: "#170e27",
  padding: "10px 8px",
  textAlign: "center",
  border: "none"
};
const tdCons = {
  color: "#fff",
  fontWeight: 600,
  fontSize: 17,
  padding: "13px 8px",
  background: "none",
  textAlign: "center",
  border: "none"
};
const pillInput = {
  display: "inline-block",
  borderRadius: 12,
  background: "rgba(44,255,255,0.13)",
  boxShadow: "0 0 10px #00f6ff99",
  padding: "2px 13px",
  margin: "0 1px"
};
const inputNoBg = {
  background: "transparent",
  border: "none",
  outline: "none",
  fontWeight: 800,
  fontSize: 17,
  letterSpacing: 1
};
