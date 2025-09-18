"use client";

import { Button } from "./Ui/Button";
import { Icon } from "./Ui/Icon";
import { useAppActions, useAppSelector } from "../hooks/useAppStore";

export const LayersPanel = () => {
  const actions = useAppActions();
  const { rings, activeRingId } = useAppSelector((state) => ({
    rings: state.rings,
    activeRingId: state.activeRingId,
  }));

  const handleSelect = (id: number) => actions.setActiveRing(id);
  const handleToggle = (id: number, visible: boolean) => actions.setRingVisibility(id, visible);
  const handleAdd = () => actions.addRing();
  const handleDuplicate = () => actions.duplicateRing();
  const handleDelete = () => {
    if (rings.length <= 1) {
      actions.showToast("Mantenha ao menos 1 anel", false);
      return;
    }
    actions.deleteRing();
  };

  return (
    <section className="card flex min-h-[calc(41vh)] flex-col lg:flex-1 lg:basis-1/2 lg:max-h-[calc(41vh)] lg:overflow-hidden" id="layersCol" data-pip-zone="true">
      <div className="head">
        <h2>Camadas</h2>
      </div>
      <div className="body flex flex-1 min-h-0 flex-col gap-4">
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto" id="layers">
          {rings.map((ring) => {
            const active = ring.id === activeRingId;
            return (
              <div
                key={ring.id}
                className={`layer-item flex items-center gap-3 overflow-hidden rounded-lg border border-white/10 bg-[#101823] px-3 py-2 text-sm transition ${
                  active ? "ring-1 ring-[#21B2D1]" : ""
                }`}
                aria-selected={active}
              >
                <div
                  className="h-8 w-8 flex-shrink-0 rounded-md"
                  style={{
                    background: `linear-gradient(135deg, ${ring.colorA}, ${ring.colorB})`,
                  }}
                  aria-label="Cores da camada"
                />
                <span className="flex-1 min-w-0 truncate font-semibold text-white/90">{ring.name}</span>
                <button
                  type="button"
                  onClick={() => handleToggle(ring.id, !ring.visible)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white/70 transition hover:bg-white/15"
                  aria-label={ring.visible ? "Ocultar camada" : "Mostrar camada"}
                >
                  <Icon name={ring.visible ? "visibility" : "visibility_off"} />
                </button>
                <button
                  type="button"
                  onClick={() => handleSelect(ring.id)}
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition ${
                    active
                      ? "border-[#21B2D1]/60 bg-[#21B2D1]/10 text-[#21B2D1]"
                      : "border-white/15 bg-white/5 text-white/60 hover:bg-white/15"
                  }`}
                  aria-label={active ? "Camada ativa" : "Ativar camada"}
                >
                  <Icon name={active ? "check_circle" : "radio_button_unchecked"} />
                </button>
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" onClick={handleAdd}>
            Adicionar anel
          </Button>
          <Button variant="secondary" onClick={handleDuplicate} disabled={rings.length === 0}>
            Duplicar
          </Button>
          <Button variant="ghost" onClick={handleDelete} disabled={rings.length <= 1}>
            Remover
          </Button>
        </div>
      </div>
    </section>
  );
};
