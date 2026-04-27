import { useEffect, useMemo, useRef, useState } from "react";
import CardEntity from "./CardEntity";

const clampDragGrid = (value) => Math.max(0, Math.min(11.5, value));
const clampCommitGrid = (value) => Math.max(0, Math.min(11, value));

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
          ...dragState.startVisual,
          gridX: dragState.gridX,
          gridY: dragState.gridY,
        },
      ],
    ]);
  }, [dragState]);

  const handleEntityPointerDown = (entityId, event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    const entity = entities.get(entityId);
    if (!entity) return;
    const matrix = matrixRef.current;
    if (!matrix) return;
    const rect = matrix.getBoundingClientRect();
    const cellWidth = rect.width / 12;
    const cellHeight = rect.height / 12;
    if (!cellWidth || !cellHeight) return;

    onSelectEntity(entityId);
    setDragState({
      entityId,
      gridX: entity.visual.gridX,
      gridY: entity.visual.gridY,
      startGridX: entity.visual.gridX,
      startGridY: entity.visual.gridY,
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
        const deltaGridX = (deltaX / safeWidth) * 12;
        const deltaGridY = ((deltaY / safeHeight) * 12) * pitchCompensation;
        const nextGridX = clampDragGrid(current.startGridX + deltaGridX);
        const nextGridY = clampDragGrid(current.startGridY + deltaGridY);
        if (current.gridX === nextGridX && current.gridY === nextGridY) return current;
        return { ...current, gridX: nextGridX, gridY: nextGridY };
      });
    };

    const commitDrag = () => {
      setDragState((current) => {
        if (!current) return current;
        executeAction({
            type: "SET_VISUAL",
            entityId: current.entityId,
            payload: {
              gridX: clampCommitGrid(Math.round(current.gridX)),
              gridY: clampCommitGrid(Math.round(current.gridY)),
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
            className={`relative h-full w-full preserve-3d overflow-hidden rounded-xl border border-sky-200/20 bg-[linear-gradient(0deg,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(180deg,#0f172a,#111827)] bg-[size:8.33%_8.33%,8.33%_8.33%,100%_100%] shadow-[0_26px_50px_rgba(0,0,0,0.35)] ${dragState ? "cursor-grabbing" : ""}`}
          >
            <div className="pointer-events-none absolute inset-x-10 bottom-3 h-5 rounded-full bg-black/35 blur-md" />
            {dragState ? (
              <div
                className="pointer-events-none absolute h-[8.33%] w-[8.33%] rounded-md border border-yellow-200/90 bg-yellow-300/20 shadow-[0_0_14px_rgba(250,204,21,0.6)]"
                style={{
                  transform: `translate3d(calc((${dragState.gridX} / 12) * 100%), calc((${dragState.gridY} / 12) * 100%), 0px)`,
                  transition: "transform 0.05s linear",
                }}
              />
            ) : null}
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
          </div>
        </div>
      </div>
    </section>
  );
}
