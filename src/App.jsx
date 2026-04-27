import { useEffect, useState } from "react";
import { BoardProvider, useBoard, useBoardCamera } from "./context/BoardContext";
import DebugConsole from "./components/DebugConsole";
import HandZones from "./components/HandZones";
import VisualMatrixStage from "./components/VisualMatrixStage";

const ENGINE_VERSION = "v0.2.8 - Hand Zone Alpha";

function ControlDrawer() {
  const { cameraMode, cameraPresets, setCameraMode } = useBoardCamera();
  const { executeAction, resetDemo } = useBoard();
  const [isOpen, setIsOpen] = useState(false);

  const summonSequence = () => {
    resetDemo();
    setTimeout(() => {
      executeAction({
        type: "SET_VISUAL",
        entityId: "hero-card",
        payload: { x: 500, y: 520, height: 0, revealed: true, rotation: -5 },
      });
    }, 60);
  };

  const moveSequence = () => {
    executeAction({
      type: "PATCH_PROPERTIES",
      entityId: "hero-card",
      payload: { XP: Math.floor(Math.random() * 20) + 1 },
    });
    executeAction({
      type: "SET_VISUAL",
      entityId: "hero-card",
      payload: {
        x: Math.random() * 880 + 40,
        y: Math.random() * 880 + 40,
        height: 0,
        rotation: Math.floor(Math.random() * 360),
      },
    });
  };

  const stressProperties = () => {
    for (let index = 0; index < 15; index += 1) {
      setTimeout(() => {
        executeAction({
          type: "SET_PROPERTY",
          entityId: "hero-card",
          payload: { key: "HP", value: 20 - index },
        });
      }, index * 55);
    }
  };

  const illegalActionTest = () => {
    try {
      executeAction({
        type: "MOVE_ENTITY",
        entityId: "hero-card",
        payload: { x: 1400, y: 1400, height: 0 },
      });
    } catch (error) {
      window.alert(`Illegal action blocked: ${error.message}`);
    }
  };

  const toggleTapped = () => {
    executeAction({
      type: "ADD_STATE",
      entityId: "hero-card",
      payload: { state: "TAPPED" },
    });
  };

  const toggleFrozen = () => {
    executeAction({
      type: "ADD_STATE",
      entityId: "hero-card",
      payload: { state: "FROZEN" },
    });
  };

  const clearStates = () => {
    executeAction({
      type: "SET_STATES",
      entityId: "hero-card",
      payload: { states: [] },
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-30 flex items-end gap-2">
      {isOpen ? (
        <div className="w-[min(90vw,360px)] rounded-2xl border border-slate-100/20 bg-slate-900/55 p-3 shadow-2xl backdrop-blur-md">
          <div className="mb-2 flex flex-wrap gap-2">
            {Object.values(cameraPresets).map((preset) => (
              <button
                key={preset.key}
                onClick={() => setCameraMode(preset.key)}
                className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                  cameraMode === preset.key
                    ? "bg-sky-300 text-slate-900"
                    : "bg-slate-800 text-slate-100 hover:bg-slate-700"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={summonSequence} className="rounded-md bg-emerald-400 px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-emerald-300">
              Summon
            </button>
            <button onClick={moveSequence} className="rounded-md bg-amber-300 px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-200">
              Move
            </button>
            <button onClick={stressProperties} className="rounded-md bg-rose-300 px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-rose-200">
              Stress HP
            </button>
            <button onClick={illegalActionTest} className="rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-400">
              Illegal Test
            </button>
            <button onClick={toggleTapped} className="rounded-md bg-cyan-300 px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-cyan-200">
              Add TAPPED
            </button>
            <button onClick={toggleFrozen} className="rounded-md bg-blue-300 px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-blue-200">
              Add FROZEN
            </button>
            <button onClick={clearStates} className="rounded-md bg-indigo-400 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-300">
              Clear States
            </button>
            <button onClick={resetDemo} className="rounded-md bg-slate-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-500">
              Reset
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-200/85">Press H to toggle all UI layers.</p>
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="rounded-full border border-slate-100/30 bg-slate-900/65 px-4 py-2 text-sm font-semibold text-slate-100 shadow-xl backdrop-blur-md"
      >
        {isOpen ? "Hide Tools" : "Tools"}
      </button>
    </div>
  );
}

function BoardScreen() {
  const {
    entities,
    playerHand,
    opponentHand,
    selectedEntityId,
    setSelectedEntityId,
    executeAction,
    playCardFromHand,
    logs,
    clearLogs,
  } = useBoard();
  const { cameraPreset } = useBoardCamera();
  const [isUiVisible, setIsUiVisible] = useState(true);
  const [matrixRect, setMatrixRect] = useState(null);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key.toLowerCase() !== "h") return;
      const targetTag = event.target?.tagName?.toLowerCase();
      if (targetTag === "input" || targetTag === "textarea" || event.target?.isContentEditable) return;
      event.preventDefault();
      setIsUiVisible((prev) => !prev);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      <div className="pointer-events-none absolute left-4 z-30 rounded-md border border-slate-100/25 bg-slate-900/45 px-3 py-1 text-xs font-semibold tracking-wide text-slate-100 backdrop-blur-md top-3">
        {ENGINE_VERSION}
      </div>
      {isUiVisible ? (
        <header className="pointer-events-none absolute left-4 top-10 z-20 max-w-[min(92vw,900px)]">
          <h1 className="text-2xl font-bold text-sky-100 md:text-3xl">The Multiverse Game Engine</h1>
          <p className="text-sm text-sky-100/80 md:text-base">Phase 2 Visual Matrix / Press H for clean mode</p>
        </header>
      ) : null}

      <VisualMatrixStage
        cameraPreset={cameraPreset}
        entities={entities}
        selectedEntityId={selectedEntityId}
        onSelectEntity={setSelectedEntityId}
        executeAction={executeAction}
        hiddenEntityIds={[...playerHand, ...opponentHand]}
        onMatrixRectChange={setMatrixRect}
      />
      <HandZones
        entities={entities}
        playerHand={playerHand}
        opponentHand={opponentHand}
        matrixRect={matrixRect}
        onPlayFromHand={playCardFromHand}
      />
      {isUiVisible ? <ControlDrawer /> : null}
      {isUiVisible ? (
        <DebugConsole
          entities={entities}
          selectedEntityId={selectedEntityId}
          setSelectedEntityId={setSelectedEntityId}
          executeAction={executeAction}
          logs={logs}
          clearLogs={clearLogs}
        />
      ) : null}
    </main>
  );
}

export default function App() {
  return (
    <BoardProvider>
      <BoardScreen />
    </BoardProvider>
  );
}
