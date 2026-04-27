import { BoardProvider, useBoard, useBoardCamera } from "./context/BoardContext";
import DebugConsole from "./components/DebugConsole";
import VisualMatrixStage from "./components/VisualMatrixStage";

function DemoControls() {
  const { cameraMode, cameraPresets, setCameraMode } = useBoardCamera();
  const { executeAction, resetDemo } = useBoard();

  const summonSequence = () => {
    resetDemo();
    setTimeout(() => {
      executeAction({
        type: "SET_VISUAL",
        entityId: "hero-card",
        payload: { gridX: 5, gridY: 6, height: 0, revealed: true, rotation: -5 },
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
        gridX: Math.floor(Math.random() * 10) + 1,
        gridY: Math.floor(Math.random() * 10) + 1,
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
        payload: { gridX: 99, gridY: 99, height: 0 },
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
    <div className="mx-auto mb-6 flex w-full max-w-5xl flex-wrap items-center gap-2">
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
        Illegal Action Test
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
  );
}

function BoardScreen() {
  const { entities, selectedEntityId, setSelectedEntityId, executeAction, logs, clearLogs } = useBoard();
  const { cameraPreset } = useBoardCamera();

  return (
    <main className="min-h-screen p-4 md:p-8">
      <header className="mx-auto mb-4 w-full max-w-5xl">
        <h1 className="text-2xl font-bold text-sky-100 md:text-3xl">The Multiverse Game Engine</h1>
        <p className="text-sm text-sky-100/80 md:text-base">Phase 1 Visual Matrix Stage / Data-driven CSS 3D transitions</p>
      </header>

      <DemoControls />
      <VisualMatrixStage
        cameraPreset={cameraPreset}
        entities={entities}
        selectedEntityId={selectedEntityId}
        onSelectEntity={setSelectedEntityId}
      />
      <DebugConsole
        entities={entities}
        selectedEntityId={selectedEntityId}
        setSelectedEntityId={setSelectedEntityId}
        executeAction={executeAction}
        logs={logs}
        clearLogs={clearLogs}
      />
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
