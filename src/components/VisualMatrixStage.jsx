import CardEntity from "./CardEntity";

export default function VisualMatrixStage({ cameraPreset, entities, selectedEntityId, onSelectEntity }) {
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
          <div className="relative h-full w-full preserve-3d overflow-hidden rounded-xl border border-sky-200/20 bg-[linear-gradient(0deg,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(180deg,#0f172a,#111827)] bg-[size:8.33%_8.33%,8.33%_8.33%,100%_100%] shadow-[0_26px_50px_rgba(0,0,0,0.35)]">
            <div className="pointer-events-none absolute inset-x-10 bottom-3 h-5 rounded-full bg-black/35 blur-md" />
            {[...entities.values()].map((entity) => (
              <CardEntity
                key={entity.id}
                entity={entity}
                cameraPitch={cameraPreset.pitch}
                isSelected={selectedEntityId === entity.id}
                onSelect={onSelectEntity}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
