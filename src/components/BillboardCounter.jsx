export default function BillboardCounter({ label, value, cameraPitch }) {
  return (
    <div
      className="rounded-md border border-sky-200/50 bg-slate-950/70 px-2 py-1 text-[10px] font-semibold tracking-wide text-sky-100 shadow-lg"
      style={{ transform: `rotateX(${-cameraPitch}deg) translateZ(4px)` }}
    >
      {label}: {value}
    </div>
  );
}
