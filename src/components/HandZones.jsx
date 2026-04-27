import { useEffect, useMemo, useState } from "react";
import { STAGE_UNITS } from "../types/boardTypes";

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function computeOverlap(count) {
  if (count <= 6) return 0;
  return Math.min(58, (count - 6) * 11);
}

function HandCard({ entity, isOpponent, onPointerDown }) {
  return (
    <button
      type="button"
      onPointerDown={onPointerDown}
      className={`group relative h-36 w-24 rounded-lg border text-left shadow-2xl transition-transform ${
        isOpponent
          ? "scale-[0.6] border-slate-300/35 bg-gradient-to-br from-slate-700 to-slate-900"
          : "border-amber-200/60 bg-gradient-to-br from-amber-200 to-orange-500 text-slate-900 hover:z-20 hover:-translate-y-4 hover:scale-110"
      }`}
    >
      {isOpponent ? (
        <div className="absolute inset-0 rounded-lg bg-[radial-gradient(circle_at_20%_20%,rgba(148,163,184,0.35),transparent_36%),linear-gradient(135deg,#1f2937,#0f172a)]" />
      ) : (
        <div className="flex h-full w-full flex-col justify-between p-2">
          <div className="text-[10px] font-black uppercase">{entity.metadata.type}</div>
          <div className="text-[11px] font-bold leading-tight">{entity.metadata.name}</div>
          <div className="text-[9px] font-semibold opacity-90">HP {entity.properties.HP ?? "-"} / ATK {entity.properties.ATK ?? "-"}</div>
        </div>
      )}
    </button>
  );
}

export default function HandZones({
  entities,
  playerHand,
  opponentHand,
  matrixRect,
  onPlayFromHand,
}) {
  const [dragging, setDragging] = useState(null);
  const playerOverlap = computeOverlap(playerHand.length);
  const opponentOverlap = computeOverlap(opponentHand.length);

  const draggingEntity = useMemo(() => {
    if (!dragging) return null;
    return entities.get(dragging.entityId) ?? null;
  }, [dragging, entities]);

  const startDragFromHand = (entityId, event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    setDragging({ entityId, x: event.clientX, y: event.clientY });
  };

  useEffect(() => {
    if (!dragging) return undefined;

    const onMove = (event) => {
      setDragging((current) => (current ? { ...current, x: event.clientX, y: event.clientY } : current));
    };

    const onUp = (event) => {
      setDragging((current) => {
        if (!current) return current;
        if (!matrixRect) return null;
        const inMatrix =
          event.clientX >= matrixRect.left &&
          event.clientX <= matrixRect.right &&
          event.clientY >= matrixRect.top &&
          event.clientY <= matrixRect.bottom;
        if (inMatrix) {
          const x = clamp(((event.clientX - matrixRect.left) / matrixRect.width) * STAGE_UNITS, 0, STAGE_UNITS);
          const y = clamp(((event.clientY - matrixRect.top) / matrixRect.height) * STAGE_UNITS, 0, STAGE_UNITS);
          onPlayFromHand(current.entityId, { x, y });
        }
        return null;
      });
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp, { once: true });
    window.addEventListener("pointercancel", onUp, { once: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [dragging, matrixRect, onPlayFromHand]);

  return (
    <>
      <div className="pointer-events-none fixed left-1/2 top-1 z-20 -translate-x-1/2">
        <div className="pointer-events-auto flex items-center rounded-2xl border border-slate-100/20 bg-slate-900/30 px-3 py-1 backdrop-blur-md">
          {opponentHand.map((entityId, index) => {
            const entity = entities.get(entityId);
            if (!entity) return null;
            return (
              <div key={entityId} style={{ marginLeft: index === 0 ? 0 : `-${opponentOverlap}px` }}>
                <HandCard entity={entity} isOpponent />
              </div>
            );
          })}
        </div>
      </div>

      <div className="pointer-events-none fixed bottom-3 left-1/2 z-20 -translate-x-1/2">
        <div className="pointer-events-auto flex items-center rounded-2xl border border-slate-100/20 bg-slate-900/35 px-4 py-2 backdrop-blur-md">
          {playerHand.map((entityId, index) => {
            const entity = entities.get(entityId);
            if (!entity) return null;
            return (
              <div key={entityId} style={{ marginLeft: index === 0 ? 0 : `-${playerOverlap}px` }}>
                <HandCard entity={entity} onPointerDown={(event) => startDragFromHand(entityId, event)} />
              </div>
            );
          })}
        </div>
      </div>

      {dragging && draggingEntity ? (
        <div
          className="pointer-events-none fixed z-50 h-36 w-24 -translate-x-1/2 -translate-y-1/2 rounded-lg border border-amber-200/60 bg-gradient-to-br from-amber-200 to-orange-500 p-2 text-slate-900 shadow-[0_18px_36px_rgba(0,0,0,0.45)]"
          style={{ left: dragging.x, top: dragging.y }}
        >
          <div className="text-[10px] font-black uppercase">{draggingEntity.metadata.type}</div>
          <div className="mt-1 text-[11px] font-bold leading-tight">{draggingEntity.metadata.name}</div>
        </div>
      ) : null}
    </>
  );
}
