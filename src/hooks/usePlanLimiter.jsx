// src/hooks/usePlanLimiter.js
import { useState, useCallback, useRef } from "react";

/**
 * Hook genérico para limitar recursos por plano (com antirrepique).
 * - isOpen: controla visibilidade do modal de upgrade
 * - openUpgradeModal(): abre o modal (ignora se estiver em período de "cooldown")
 * - closeUpgradeModal(): fecha e ativa um cooldown curto para não reabrir imediatamente
 * - checkLimit(currentCount, limit): true se pode prosseguir; se estourar, abre modal e retorna false
 */
export function usePlanLimiter() {
  const [isOpen, setIsOpen] = useState(false);

  // Evita reabrir imediatamente ao fechar (ex.: re-render dispara a mesma checagem)
  const blockingRef = useRef(false);
  const COOLDOWN_MS = 400; // pode ajustar

  const openUpgradeModal = useCallback(() => {
    if (blockingRef.current) {
      // console.debug("[usePlanLimiter] bloqueado por cooldown; não reabrir agora");
      return;
    }
    // console.debug("[usePlanLimiter] openUpgradeModal()");
    setIsOpen(true);
  }, []);

  const closeUpgradeModal = useCallback(() => {
    // console.debug("[usePlanLimiter] closeUpgradeModal() -> inicia cooldown");
    setIsOpen(false);
    blockingRef.current = true;
    setTimeout(() => {
      blockingRef.current = false;
      // console.debug("[usePlanLimiter] cooldown liberado");
    }, COOLDOWN_MS);
  }, []);

  const checkLimit = useCallback(
    (currentCount, limit) => {
      const atingiuLimite = typeof limit === "number" && currentCount >= limit;
      if (atingiuLimite) {
        openUpgradeModal();
        return false;
      }
      return true;
    },
    [openUpgradeModal]
  );

  return {
    isOpen,
    openUpgradeModal,
    closeUpgradeModal,
    checkLimit,
  };
}
