import CardEntity from "./CardEntity";

export default function VisualMatrixStage({ cameraPreset, entities, selectedEntityId, onSelectEntity }) {
  return (
    <section className="mx-auto w-full max-w-5xl">
      <div className="relative mx-auto aspect-[16/10] w-full rounded-2xl border border-slate-300/20 bg-slate-900/30 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.6)]" style={{ perspective: "1200px" }}>
        <div
          className="relative h-full w-full preserve-3d"
          style={{
            transition: "transform 0.45s ease-out",
            transform: `rotateX(${cameraPreset.pitch}deg) scale(${cameraPreset.zoom})`,
          }}
        >
          <div className="relative h-full w-full preserve-3d overflow-hidden rounded-xl border border-sky-200/20 bg-[linear-gradient(0deg,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(180deg,#0f172a,#111827)] bg-[size:8.33%_8.33%,8.33%_8.33%,100%_100%]">
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
