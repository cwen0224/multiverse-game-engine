import { useMemo, useState } from "react";

export default function DebugConsole({
  entities,
  selectedEntityId,
  setSelectedEntityId,
  executeAction,
  logs,
  clearLogs,
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [jsonInput, setJsonInput] = useState(
    JSON.stringify(
      {
        type: "SET_PROPERTY",
        entityId: "hero-card",
        payload: { key: "HP", value: 9 },
      },
      null,
      2
    )
  );
  const [errorMessage, setErrorMessage] = useState("");

  const monitorData = useMemo(() => {
    if (selectedEntityId === "__ALL__") {
      return Object.fromEntries(entities.entries());
    }
    const entity = entities.get(selectedEntityId);
    return entity ?? { message: `Entity "${selectedEntityId}" not found.` };
  }, [entities, selectedEntityId]);

  const handleExecute = () => {
    try {
      executeAction(jsonInput);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const selectOptions = [
    { id: "__ALL__", label: "All Entities" },
    ...[...entities.values()].map((entity) => ({
      id: entity.id,
      label: `${entity.metadata.name} (${entity.id})`,
    })),
  ];

  const logColor = {
    INFO: "text-emerald-200",
    WARN: "text-amber-200",
    ERROR: "text-rose-300",
  };

  return (
    <aside className="fixed bottom-20 right-4 z-40 w-[360px] max-w-[calc(100vw-1rem)] rounded-xl border border-slate-200/20 bg-slate-950/75 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-slate-200/10 px-3 py-2">
        <h2 className="text-sm font-bold text-slate-100">Dispatcher Console</h2>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-100"
        >
          {isOpen ? "Collapse" : "Expand"}
        </button>
      </div>

      {isOpen ? (
        <div className="space-y-3 p-3">
          <section>
            <div className="mb-1 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-sky-100">State Monitor</h3>
              <select
                value={selectedEntityId}
                onChange={(event) => setSelectedEntityId(event.target.value)}
                className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-100"
              >
                {selectOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <pre className="max-h-36 overflow-auto rounded bg-black/40 p-2 text-[10px] text-slate-200">
              {JSON.stringify(monitorData, null, 2)}
            </pre>
          </section>

          <section>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-sky-100">JSON Injector</h3>
            <textarea
              value={jsonInput}
              onChange={(event) => setJsonInput(event.target.value)}
              className="h-32 w-full rounded bg-black/40 p-2 font-mono text-[11px] text-slate-100 outline-none ring-1 ring-slate-200/10 focus:ring-sky-300/60"
            />
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={handleExecute}
                className="rounded bg-sky-400 px-2 py-1 text-xs font-semibold text-slate-900"
              >
                Execute
              </button>
            </div>
            {errorMessage ? <p className="mt-1 text-xs text-rose-300">{errorMessage}</p> : null}
          </section>

          <section>
            <div className="mb-1 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-sky-100">Live Logs</h3>
              <button type="button" onClick={clearLogs} className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-200">
                Clear
              </button>
            </div>
            <div className="max-h-40 space-y-1 overflow-auto rounded bg-black/40 p-2 text-[10px]">
              {[...logs].reverse().slice(0, 80).map((log) => (
                <div key={log.id} className={logColor[log.level] ?? "text-slate-200"}>
                  [{log.level}] {log.message}
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </aside>
  );
}
