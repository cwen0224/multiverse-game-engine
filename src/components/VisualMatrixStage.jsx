import { useEffect, useMemo, useRef, useState } from "react";
import CardEntity from "./CardEntity";

const clampGrid = (value) => Math.max(0, Math.min(11, value));

export default function VisualMatrixStage({
  cameraPreset,
  entities,
  selectedEntityId,
  onSelectEntity,
  executeAction,
}) {
  const matrixRef = useRef(null);
  const [dragState, setDragState] = useState(null);

  const dragPreviewById = useMemo(() => {
    if (!dragState) return new Map();
    return new Map([
      [
        dragState.entityId,
        {
          ...dragState.originalVisual,
          gridX: dragState.gridX,
          gridY: dragState.gridY,
        },
      ],
    ]);
  }, [dragState]);

  const pointerToGrid = (clientX, clientY) => {
    const matrix = matrixRef.current;
    if (!matrix) return null;
    const rect = matrix.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    const xRatio = (clientX - rect.left) / rect.width;
    const yRatio = (clientY - rect.top) / rect.height;
    return {
      gridX: clampGrid(Math.floor(xRatio * 12)),
      gridY: clampGrid(Math.floor(yRatio * 12)),
    };
  };

  const handleEntityPointerDown = (entityId, event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    const entity = entities.get(entityId);
    if (!entity) return;
    const initialGrid = pointerToGrid(event.clientX, event.clientY);
    onSelectEntity(entityId);
    if (!initialGrid) return;
    setDragState({
      entityId,
      gridX: initialGrid.gridX,
      gridY: initialGrid.gridY,
      originalVisual: entity.visual,
    });
  };

  useEffect(() => {
    if (!dragState) return undefined;

    const handlePointerMove = (event) => {
      const nextGrid = pointerToGrid(event.clientX, event.clientY);
      if (!nextGrid) return;
      setDragState((current) => {
        if (!current) return current;
        if (current.gridX === nextGrid.gridX && current.gridY === nextGrid.gridY) return current;
        return { ...current, ...nextGrid };
      });
    };

    const commitDrag = () => {
      setDragState((current) => {
        if (!current) return current;
        executeAction({
          type: "SET_VISUAL",
          entityId: current.entityId,
          payload: {
            gridX: current.gridX,
            gridY: current.gridY,
            height: current.originalVisual.height,
            rotation: current.originalVisual.rotation,
            revealed: current.originalVisual.revealed,
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
  }, [dragState, executeAction]);

  return (
    <section className="relative h-full w-full overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden" style={{ perspective: "1500px" }}>
        <div
          className="relative preserve-3d"
          style={{
            width: "min(85vw, 85vh)",
            height: "min(85vw, 85vh)",
            transition: "transform 0.45s ease-out",
            transform: `rotateX(${cameraPreset.pitch}deg) scale(${cameraPreset.zoom})`,
          }}
        >
          <div
            ref={matrixRef}
            className="relative h-full w-full preserve-3d overflow-hidden rounded-xl border border-sky-200/20 bg-[linear-gradient(0deg,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(180deg,#0f172a,#111827)] bg-[size:8.33%_8.33%,8.33%_8.33%,100%_100%] shadow-[0_26px_50px_rgba(0,0,0,0.35)]"
          >
            <div className="pointer-events-none absolute inset-x-10 bottom-3 h-5 rounded-full bg-black/35 blur-md" />
            {[...entities.values()].map((entity) => (
              <CardEntity
                key={entity.id}
                entity={entity}
                cameraPitch={cameraPreset.pitch}
                isSelected={selectedEntityId === entity.id}
                onSelect={onSelectEntity}
                onPointerDown={handleEntityPointerDown}
                visualOverride={dragPreviewById.get(entity.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
