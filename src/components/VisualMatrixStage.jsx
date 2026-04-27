import { useEffect, useMemo, useRef, useState } from "react";
import { STAGE_UNITS } from "../types/boardTypes";
import CardEntity from "./CardEntity";

const clampStage = (value) => Math.max(0, Math.min(STAGE_UNITS, value));

export default function VisualMatrixStage({
  cameraPreset,
  entities,
  selectedEntityId,
  onSelectEntity,
  executeAction,
}) {
  const matrixRef = useRef(null);
  const [dragState, setDragState] = useState(null);
  const [viewport, setViewport] = useState({
    width: typeof window === "undefined" ? 1280 : window.innerWidth,
    height: typeof window === "undefined" ? 720 : window.innerHeight,
  });

  useEffect(() => {
    const onResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const autoFitScale = Math.max(
    0.2,
    Math.min((viewport.width * 0.86) / STAGE_UNITS, (viewport.height * 0.86) / STAGE_UNITS)
  );

  const dragPreviewById = useMemo(() => {
    if (!dragState) return new Map();
    return new Map([
      [
        dragState.entityId,
        {
          ...dragState.startVisual,
          x: dragState.x,
          y: dragState.y,
        },
      ],
    ]);
  }, [dragState]);

  const handleEntityPointerDown = (entityId, event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    const entity = entities.get(entityId);
    const matrix = matrixRef.current;
    if (!entity || !matrix) return;
    const rect = matrix.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    onSelectEntity(entityId);
    setDragState({
      entityId,
      x: entity.visual.x,
      y: entity.visual.y,
      startX: entity.visual.x,
      startY: entity.visual.y,
      startVisual: entity.visual,
      startPointerX: event.clientX,
      startPointerY: event.clientY,
      matrixWidth: rect.width,
      matrixHeight: rect.height,
    });
  };

  useEffect(() => {
    if (!dragState) return undefined;

    const handlePointerMove = (event) => {
      setDragState((current) => {
        if (!current) return current;
        const deltaX = event.clientX - current.startPointerX;
        const deltaY = event.clientY - current.startPointerY;
        const safeWidth = Math.max(1, current.matrixWidth);
        const safeHeight = Math.max(1, current.matrixHeight);
        const pitchCos = Math.cos((cameraPreset.pitch * Math.PI) / 180);
        const pitchCompensation = 1 / Math.max(0.35, pitchCos);
        const nextX = clampStage(current.startX + (deltaX / safeWidth) * STAGE_UNITS);
        const nextY = clampStage(current.startY + ((deltaY / safeHeight) * STAGE_UNITS) * pitchCompensation);
        if (current.x === nextX && current.y === nextY) return current;
        return { ...current, x: nextX, y: nextY };
      });
    };

    const commitDrag = () => {
      setDragState((current) => {
        if (!current) return current;
        executeAction({
          type: "SET_VISUAL",
          entityId: current.entityId,
          payload: {
            x: current.x,
            y: current.y,
            height: current.startVisual.height,
            rotation: current.startVisual.rotation,
            revealed: current.startVisual.revealed,
          },
        });
        return null;
      });
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", commitDrag, { once: true });
    window.addEventListener("pointercancel", commitDrag, { once: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", commitDrag);
      window.removeEventListener("pointercancel", commitDrag);
    };
  }, [cameraPreset.pitch, dragState, executeAction]);

  return (
    <section className="relative h-full w-full overflow-hidden">
      <div className="absolute inset-0 overflow-hidden" style={{ perspective: "1500px" }}>
        <div
          className="absolute left-1/2 top-1/2 preserve-3d"
          style={{
            width: `${STAGE_UNITS}px`,
            height: `${STAGE_UNITS}px`,
            transition: "transform 0.45s ease-out",
            transform: `translate(-50%, -50%) rotateX(${cameraPreset.pitch}deg) scale(${autoFitScale * cameraPreset.zoom})`,
          }}
        >
          <div
            ref={matrixRef}
            className={`relative h-full w-full preserve-3d overflow-hidden rounded-xl border border-slate-200/15 shadow-[0_30px_70px_rgba(0,0,0,0.45)] ${dragState ? "cursor-grabbing" : ""}`}
            style={{
              backgroundColor: "#0d1a30",
              backgroundImage:
                "radial-gradient(circle at center, rgba(148,163,184,0.22) 0.7px, transparent 0.7px), linear-gradient(180deg, rgba(13,26,48,0.95), rgba(7,15,28,0.98))",
              backgroundSize: "12px 12px, 100% 100%",
            }}
          >
            <div className="pointer-events-none absolute inset-x-8 bottom-2 h-6 rounded-full bg-black/35 blur-md" />
            {[...entities.values()].map((entity) => (
              <CardEntity
                key={entity.id}
                entity={entity}
                cameraPitch={cameraPreset.pitch}
                isSelected={selectedEntityId === entity.id}
                onSelect={onSelectEntity}
                onPointerDown={handleEntityPointerDown}
                visualOverride={dragPreviewById.get(entity.id)}
                isDragging={dragState?.entityId === entity.id}
              />
            ))}
            {dragState ? (
              <div
                className="pointer-events-none absolute rounded-full bg-black/45 blur-md"
                style={{
                  width: "calc((110 / 1000) * 100%)",
                  height: "calc((36 / 1000) * 100%)",
                  transform: `translate3d(calc((${dragState.x} / 1000) * 100%), calc((${dragState.y + 95} / 1000) * 100%), 0px)`,
                }}
              />
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
