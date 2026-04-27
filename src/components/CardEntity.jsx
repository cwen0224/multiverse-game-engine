import BillboardCounter from "./BillboardCounter";

export default function CardEntity({
  entity,
  cameraPitch,
  isSelected,
  onSelect,
  onPointerDown,
  visualOverride,
  isDragging,
}) {
  const CARD_WIDTH_UNITS = 78;
  const CARD_HEIGHT_UNITS = 112;
  const visual = visualOverride ?? entity.visual;
  const isTapped = entity.states.includes("TAPPED");
  const isFrozen = entity.states.includes("FROZEN");
  const effectiveRotation = visual.rotation + (isTapped ? 90 : 0);
  const hpValue = entity.properties.HP ?? "-";
  const xpValue = entity.properties.XP ?? "-";
  const filters = [isDragging
    ? "drop-shadow(0 18px 16px rgba(0, 0, 0, 0.5))"
    : "drop-shadow(0 8px 8px rgba(0, 0, 0, 0.3))"];
  if (isFrozen) {
    filters.push("saturate(0.8)", "brightness(0.86)");
  }

  const cardStyle = {
    "--x": visual.x,
    "--y": visual.y,
    "--height": visual.height,
    "--rotation": effectiveRotation,
    "--cardWidth": CARD_WIDTH_UNITS,
    "--cardHeight": CARD_HEIGHT_UNITS,
    width: "calc((var(--cardWidth) / 1000) * 100%)",
    height: "calc((var(--cardHeight) / 1000) * 100%)",
    left: "calc((var(--x) / 1000) * 100%)",
    top: "calc((var(--y) / 1000) * 100%)",
    transform:
      "translate3d(-50%, -50%, calc(var(--height) * 1px)) rotateZ(calc(var(--rotation) * 1deg))",
    transition: isDragging ? "none" : "transform 0.4s ease-out",
    filter: filters.join(" "),
    zIndex: isDragging ? 999 : isSelected ? 120 : 20,
  };

  return (
    <button
      type="button"
      onClick={() => onSelect(entity.id)}
      onPointerDown={(event) => onPointerDown(entity.id, event)}
      className="absolute preserve-3d cursor-grab text-left active:cursor-grabbing"
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
