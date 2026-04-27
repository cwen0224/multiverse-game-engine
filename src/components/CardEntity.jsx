import BillboardCounter from "./BillboardCounter";

export default function CardEntity({
  entity,
  cameraPitch,
  isSelected,
  onSelect,
  onPointerDown,
  visualOverride,
}) {
  const visual = visualOverride ?? entity.visual;
  const isTapped = entity.states.includes("TAPPED");
  const isFrozen = entity.states.includes("FROZEN");
  const effectiveRotation = visual.rotation + (isTapped ? 90 : 0);
  const hpValue = entity.properties.HP ?? "-";
  const xpValue = entity.properties.XP ?? "-";

  const cardStyle = {
    "--gridX": visual.gridX,
    "--gridY": visual.gridY,
    "--height": visual.height,
    "--rotation": effectiveRotation,
    transform:
      "translate3d(calc((var(--gridX) / 12) * 100%), calc((var(--gridY) / 12) * 100%), calc(var(--height) * 1px)) rotateZ(calc(var(--rotation) * 1deg))",
    transition: "transform 0.4s ease-out",
    filter: isFrozen ? "saturate(0.8) brightness(0.86)" : "none",
  };

  return (
    <button
      type="button"
      onClick={() => onSelect(entity.id)}
      onPointerDown={(event) => onPointerDown(entity.id, event)}
      className="absolute left-0 top-0 h-[8.33%] w-[8.33%] preserve-3d text-left"
      style={cardStyle}
    >
      <div className="pointer-events-none absolute -top-7 left-1 flex gap-1 preserve-3d">
        <BillboardCounter label="HP" value={hpValue} cameraPitch={cameraPitch} />
        <BillboardCounter label="XP" value={xpValue} cameraPitch={cameraPitch} />
      </div>

      <div
        className={`relative h-full w-full preserve-3d ${isSelected ? "ring-2 ring-cyan-300/80 ring-offset-1 ring-offset-slate-900" : ""}`}
        style={{
          transition: "transform 0.4s ease-out",
          transform: visual.revealed ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        <div className="backface-hidden absolute inset-0 rounded-lg border border-slate-300/40 bg-gradient-to-br from-slate-700 to-slate-900 shadow-2xl">
          {isFrozen ? <div className="absolute inset-0 rounded-lg bg-cyan-300/30" /> : null}
        </div>
        <div className="backface-hidden absolute inset-0 flex items-center justify-center rounded-lg border border-amber-200/60 bg-gradient-to-br from-amber-200 to-orange-500 p-1 text-center text-[10px] font-bold text-slate-900 shadow-2xl"
          style={{ transform: "rotateY(180deg)" }}
        >
          <div className="flex h-full w-full flex-col justify-between">
            <div className="text-[9px] font-black uppercase">{entity.metadata.type}</div>
            <div className="px-1 text-[10px] leading-tight">{entity.metadata.name}</div>
            <div className="grid grid-cols-2 gap-1 text-[8px]">
              {Object.entries(entity.properties)
                .slice(0, 4)
                .map(([key, value]) => (
                  <div key={key} className="rounded bg-black/15 px-1 py-0.5">
                    {key}:{String(value)}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
