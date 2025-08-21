import React, { useState, useEffect, useRef } from "react";

export default function ModalRotuloNutricional({
  open,
  onClose,
  descricoes = [],
  unidades = [],
  setDescricoes,
  setUnidades
}) {
  const [categoriasApi, setCategoriasApi] = useState([]);
  const [descInput, setDescInput] = useState("");
  const [descEditIdx, setDescEditIdx] = useState(null);
  const [unidInput, setUnidInput] = useState("");
  const [unidEditIdx, setUnidEditIdx] = useState(null);
  const didLoadRef = useRef(false);

  // Carrega uma única vez a cada abertura
  useEffect(() => {
    if (!open) { didLoadRef.current = false; return; }
    if (didLoadRef.current) return;
    didLoadRef.current = true;

    const ac = new AbortController();
    (async () => {
      try {
        const res = await fetch("/api/categorias-nutricionais", {
          credentials: "include",
          cache: "no-store",
          signal: ac.signal,
          headers: { Accept: "application/json" },
        });
        if (!res.ok) return; // evita loop se der 500

        const ct = res.headers.get("content-type") || "";
        const data = ct.includes("application/json") ? await res.json() : [];
        const arr = Array.isArray(data) ? data : [];

        setCategoriasApi(arr);
        setDescricoes(Array.from(new Set(arr.map(d => d?.descricao).filter(Boolean))));
        setUnidades(Array.from(new Set(arr.map(d => d?.unidade).filter(Boolean))));
      } catch {}
    })();

    return () => ac.abort();
  }, [open, setDescricoes, setUnidades]);

  // ---------- DESCRIÇÃO ----------
  function handleAddDescricao() {
    const novaDesc = (descInput || "").trim();
    if (!novaDesc) return;
    if (categoriasApi.some(d => (d.descricao || "").toLowerCase() === novaDesc.toLowerCase())) return;

    // 🔑 Envia SOMENTE descricao
    fetch("/api/categorias-nutricionais", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ descricao: novaDesc }),
    })
      .then(async (res) => {
        if (!res.ok) return null;
        const ct = res.headers.get("content-type") || "";
        return ct.includes("application/json") ? res.json() : null;
      })
      .then((cat) => {
        if (!cat) return;
        setCategoriasApi(prev => [...prev, cat]);
        setDescricoes(prev => Array.from(new Set([...prev, novaDesc])));
        setDescInput("");
        setDescEditIdx(null);
      })
      .catch(() => {});
  }

  function handleEditDescricao(idx) {
    setDescEditIdx(idx);
    setDescInput(descricoes[idx]);
  }

  function handleSaveEditDescricao(idx) {
    const novaDesc = (descInput || "").trim();
    const oldDesc = descricoes[idx];
    if (!novaDesc) return;

    const categoria = categoriasApi.find(c => c.descricao === oldDesc);
    if (!categoria) return;
    if (categoriasApi.some(d => (d.descricao || "").toLowerCase() === novaDesc.toLowerCase() && d.descricao !== oldDesc)) return;

    // 🔑 Atualiza SOMENTE descricao
    fetch(`/api/categorias-nutricionais/${categoria.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ descricao: novaDesc }),
    })
      .then(async (res) => {
        if (!res.ok) return null;
        const ct = res.headers.get("content-type") || "";
        return ct.includes("application/json") ? res.json() : null;
      })
      .then((cat) => {
        if (!cat) return;
        setCategoriasApi(prev => prev.map(c => (c.id === cat.id ? cat : c)));
        setDescricoes(prev => prev.map((d, i) => (i === idx ? novaDesc : d)));
        setDescEditIdx(null);
        setDescInput("");
      })
      .catch(() => {});
  }

  function handleCancelEditDescricao() {
    setDescEditIdx(null);
    setDescInput("");
  }

  function handleDeleteDescricao(idx) {
    const desc = descricoes[idx];
    const categoria = categoriasApi.find(c => c.descricao === desc);
    if (!categoria) return;

    fetch(`/api/categorias-nutricionais/${categoria.id}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then(() => {
        setCategoriasApi(prev => prev.filter(c => c.id !== categoria.id));
        setDescricoes(prev => prev.filter((_, i) => i !== idx));
        setDescEditIdx(null);
        setDescInput("");
      })
      .catch(() => {});
  }

  // ---------- UNIDADE ----------
  function handleAddUnidade() {
    const novaUnid = (unidInput || "").trim();
    if (!novaUnid) return;
    if (categoriasApi.some(u => (u.unidade || "").toLowerCase() === novaUnid.toLowerCase())) return;

    // 🔑 Envia SOMENTE unidade
    fetch("/api/categorias-nutricionais", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ unidade: novaUnid }),
    })
      .then(async (res) => {
        if (!res.ok) return null;
        const ct = res.headers.get("content-type") || "";
        return ct.includes("application/json") ? res.json() : null;
      })
      .then((cat) => {
        if (!cat) return;
        setCategoriasApi(prev => [...prev, cat]);
        setUnidades(prev => Array.from(new Set([...prev, novaUnid])));
        setUnidInput("");
        setUnidEditIdx(null);
      })
      .catch(() => {});
  }

  function handleEditUnidade(idx) {
    setUnidEditIdx(idx);
    setUnidInput(unidades[idx]);
  }

  function handleSaveEditUnidade(idx) {
    const novaUnid = (unidInput || "").trim();
    const oldUnid = unidades[idx];
    if (!novaUnid) return;

    const categoria = categoriasApi.find(c => c.unidade === oldUnid);
    if (!categoria) return;
    if (categoriasApi.some(u => (u.unidade || "").toLowerCase() === novaUnid.toLowerCase() && u.unidade !== oldUnid)) return;

    // 🔑 Atualiza SOMENTE unidade
    fetch(`/api/categorias-nutricionais/${categoria.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ unidade: novaUnid }),
    })
      .then(async (res) => {
        if (!res.ok) return null;
        const ct = res.headers.get("content-type") || "";
        return ct.includes("application/json") ? res.json() : null;
      })
      .then((cat) => {
        if (!cat) return;
        setCategoriasApi(prev => prev.map(c => (c.id === cat.id ? cat : c)));
        setUnidades(prev => prev.map((u, i) => (i === idx ? novaUnid : u)));
        setUnidEditIdx(null);
        setUnidInput("");
      })
      .catch(() => {});
  }

  function handleCancelEditUnidade() {
    setUnidEditIdx(null);
    setUnidInput("");
  }

  function handleDeleteUnidade(idx) {
    const unid = unidades[idx];
    const categoria = categoriasApi.find(c => c.unidade === unid);
    if (!categoria) return;

    fetch(`/api/categorias-nutricionais/${categoria.id}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then(() => {
        setCategoriasApi(prev => prev.filter(c => c.id !== categoria.id));
        setUnidades(prev => prev.filter((_, i) => i !== idx));
        setUnidEditIdx(null);
        setUnidInput("");
      })
      .catch(() => {});
  }

  if (!open) return null;

  return (
    <div className="modal-backdrop" style={{
      zIndex: 1000,
      position: "fixed",
      top: 0, left: 0, width: "100vw", height: "100vh",
      background: "rgba(24,18,42,0.82)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{
        background: "#fff",
        borderRadius: 24,
        minWidth: 640,
        maxWidth: 780,
        width: "95vw",
        padding: "40px 46px 32px 46px",
        boxShadow: "0 10px 48px #a0cef57a",
        color: "#2196f3",
        position: "relative",
        border: "2px solid #e1e9f7",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}>
        <button
          type="button"
          style={{
            position: "absolute",
            top: 24,
            right: 34,
            background: "none",
            border: "none",
            color: "#2196f3",
            fontSize: 28,
            fontWeight: 700,
            cursor: "pointer"
          }}
          onClick={onClose}
        >×</button>

        <h2 style={{ color: "#2196f3", margin: 0, marginBottom: 28, fontSize: 30, fontWeight: 800, letterSpacing: "-1.2px" }}>
          Categorias Nutricionais
        </h2>

        <div style={{ display: "flex", gap: 40, alignItems: "flex-start", width: "100%", marginBottom: 16 }}>
          {/* DESCRIÇÃO */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <b style={{ fontSize: 23, color: "#2196f3", letterSpacing: "-0.5px" }}>Descrição</b>
              <button
                type="button"
                style={{
                  background: "linear-gradient(90deg, #00cfff 60%, #2196f3 100%)",
                  border: "none",
                  color: "#fff",
                  borderRadius: 13,
                  width: 56,
                  height: 44,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                }}
                onClick={() => { setDescEditIdx(-1); setDescInput(""); }}
                title="Adicionar descrição"
              >
                <svg width="32" height="32" viewBox="0 0 512 512" fill="#fff">
                  <path d="M256 0C114.6 0 0 114.6 0 256c0 141.4 114.6 256 256 256s256-114.6 256-256c0-17.7-14.3-32-32-32s-32 14.3-32 32c0 105.9-86.1 192-192 192S64 361.9 64 256 150.1 64 256 64c44.1 0 86.4 15.1 120 43.3 13.5 11.2 33.4 9.3 44.6-4.2s9.3-33.4-4.2-44.6C367.6 39.2 313.1 16 256 16zm0 120c-17.7 0-32 14.3-32 32v64h-64c-17.7 0-32 14.3-32 32s14.3 32 32 32h64v64c0 17.7 14.3 32 32 32s32-14.3 32-32v-64h64c-17.7 0-32-14.3-32-32s-14.3-32-32-32h-64v-64c0-17.7-14.3-32-32-32z" />
                </svg>
              </button>
            </div>

            <div style={{ background: "#f8fafd", minHeight: 130, borderRadius: 14, padding: 15, fontSize: 18, boxShadow: "0 1px 14px #a0cef540", marginBottom: 2 }}>
              {descricoes.length === 0 && descEditIdx !== -1 && (<div style={{ color: "#8fb9e7" }}>Nenhuma descrição.</div>)}

              {descricoes.map((desc, idx) =>
                descEditIdx === idx ? (
                  <div key={idx} style={{ display: "flex", gap: 7, marginBottom: 10 }}>
                    <input
                      style={{ flex: 1, background: "#f8fafd", color: "#237be7", border: "2px solid #00cfff", borderRadius: 8, padding: "8px 11px", fontSize: 17 }}
                      value={descInput}
                      onChange={e => setDescInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") handleSaveEditDescricao(idx); if (e.key === "Escape") handleCancelEditDescricao(); }}
                      autoFocus
                    />
                    <button type="button" onClick={() => handleSaveEditDescricao(idx)} title="Salvar"
                      style={{ background: "linear-gradient(90deg,#00cfff 60%,#2196f3 100%)", border: "none", color: "#fff", borderRadius: 7, fontSize: 17, padding: "0 12px" }}>✔</button>
                    <button type="button" onClick={handleCancelEditDescricao} title="Cancelar"
                      style={{ background: "none", border: "none", color: "#8fb9e7", fontSize: 17, padding: "0 10px" }}>✖</button>
                  </div>
                ) : (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 9 }}>
                    <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#237be7" }}>{desc}</span>
                    <button type="button" onClick={() => handleEditDescricao(idx)} title="Editar"
                      style={{ background: "none", border: "none", color: "#00cfff", cursor: "pointer", fontSize: 19, padding: "0 7px" }}>✎</button>
                    <button type="button" onClick={() => handleDeleteDescricao(idx)} title="Excluir"
                      style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 19, padding: "0 7px" }}>🗑</button>
                  </div>
                )
              )}

              {descEditIdx === -1 && (
                <div style={{ display: "flex", gap: 7, marginBottom: 8, marginTop: 5 }}>
                  <input
                    style={{ flex: 1, background: "#f8fafd", color: "#237be7", border: "2px solid #00cfff", borderRadius: 8, padding: "8px 11px", fontSize: 17 }}
                    placeholder="Nova descrição"
                    value={descInput}
                    onChange={e => setDescInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") handleAddDescricao(); if (e.key === "Escape") handleCancelEditDescricao(); }}
                    autoFocus
                  />
                  <button type="button" onClick={handleAddDescricao} title="Salvar"
                    style={{ background: "linear-gradient(90deg,#00cfff 60%,#2196f3 100%)", border: "none", color: "#fff", borderRadius: 7, fontSize: 17, padding: "0 12px" }}>✔</button>
                  <button type="button" onClick={handleCancelEditDescricao} title="Cancelar"
                    style={{ background: "none", border: "none", color: "#8fb9e7", fontSize: 17, padding: "0 10px" }}>✖</button>
                </div>
              )}
            </div>
          </div>

          {/* UNIDADE */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <b style={{ fontSize: 23, color: "#2196f3", letterSpacing: "-0.5px" }}>Unidade de Medida</b>
              <button
                type="button"
                style={{
                  background: "linear-gradient(90deg, #00cfff 60%, #2196f3 100%)",
                  border: "none",
                  color: "#fff",
                  borderRadius: 13,
                  width: 56,
                  height: 44,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                }}
                onClick={() => { setUnidEditIdx(-1); setUnidInput(""); }}
                title="Adicionar unidade"
              >
                <svg width="32" height="32" viewBox="0 0 512 512" fill="#fff">
                  <path d="M256 0C114.6 0 0 114.6 0 256c0 141.4 114.6 256 256 256s256-114.6 256-256c0-17.7-14.3-32-32-32s-32 14.3-32 32c0 105.9-86.1 192-192 192S64 361.9 64 256 150.1 64 256 64c44.1 0 86.4 15.1 120 43.3 13.5 11.2 33.4 9.3 44.6-4.2s9.3-33.4-4.2-44.6C367.6 39.2 313.1 16 256 16zm0 120c-17.7 0-32 14.3-32 32v64h-64c-17.7 0-32 14.3-32 32s14.3 32 32 32h64v64c0 17.7 14.3 32 32 32s32-14.3 32-32v-64h64c-17.7 0-32-14.3-32-32s-14.3-32-32-32h-64v-64c0-17.7-14.3-32-32-32z" />
                </svg>
              </button>
            </div>

            <div style={{ background: "#f8fafd", minHeight: 130, borderRadius: 14, padding: 15, fontSize: 18, boxShadow: "0 1px 14px #a0cef540", marginBottom: 2 }}>
              {unidades.length === 0 && unidEditIdx !== -1 && (<div style={{ color: "#8fb9e7" }}>Nenhuma unidade.</div>)}

              {unidades.map((unid, idx) =>
                unidEditIdx === idx ? (
                  <div key={idx} style={{ display: "flex", gap: 7, marginBottom: 10 }}>
                    <input
                      style={{ flex: 1, background: "#f8fafd", color: "#237be7", border: "2px solid #00cfff", borderRadius: 8, padding: "8px 11px", fontSize: 17 }}
                      value={unidInput}
                      onChange={e => setUnidInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") handleSaveEditUnidade(idx); if (e.key === "Escape") handleCancelEditUnidade(); }}
                      autoFocus
                    />
                    <button type="button" onClick={() => handleSaveEditUnidade(idx)} title="Salvar"
                      style={{ background: "linear-gradient(90deg,#00cfff 60%,#2196f3 100%)", border: "none", color: "#fff", borderRadius: 7, fontSize: 17, padding: "0 12px" }}>✔</button>
                    <button type="button" onClick={handleCancelEditUnidade} title="Cancelar"
                      style={{ background: "none", border: "none", color: "#8fb9e7", fontSize: 17, padding: "0 10px" }}>✖</button>
                  </div>
                ) : (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 9 }}>
                    <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#237be7" }}>{unid}</span>
                    <button type="button" onClick={() => handleEditUnidade(idx)} title="Editar"
                      style={{ background: "none", border: "none", color: "#00cfff", cursor: "pointer", fontSize: 19, padding: "0 7px" }}>✎</button>
                    <button type="button" onClick={() => handleDeleteUnidade(idx)} title="Excluir"
                      style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 19, padding: "0 7px" }}>🗑</button>
                  </div>
                )
              )}

              {unidEditIdx === -1 && (
                <div style={{ display: "flex", gap: 7, marginBottom: 8, marginTop: 5 }}>
                  <input
                    style={{ flex: 1, background: "#f8fafd", color: "#237be7", border: "2px solid #00cfff", borderRadius: 8, padding: "8px 11px", fontSize: 17 }}
                    placeholder="Nova unidade"
                    value={unidInput}
                    onChange={e => setUnidInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") handleAddUnidade(); if (e.key === "Escape") handleCancelEditUnidade(); }}
                    autoFocus
                  />
                  <button type="button" onClick={handleAddUnidade} title="Salvar"
                    style={{ background: "linear-gradient(90deg,#00cfff 60%,#2196f3 100%)", border: "none", color: "#fff", borderRadius: 7, fontSize: 17, padding: "0 12px" }}>✔</button>
                  <button type="button" onClick={handleCancelEditUnidade} title="Cancelar"
                    style={{ background: "none", border: "none", color: "#8fb9e7", fontSize: 17, padding: "0 10px" }}>✖</button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ textAlign: "right", marginTop: 18 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "linear-gradient(90deg,#00cfff 60%,#2196f3 100%)",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              fontSize: 20,
              fontWeight: 700,
              padding: "10px 38px",
              marginTop: 8,
              cursor: "pointer",
              boxShadow: "0 2px 12px #e1e9f7"
            }}
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
