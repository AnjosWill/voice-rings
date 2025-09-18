"use client";

import React from "react";
import { useAppActions, useAppSelector } from "../hooks/useAppStore";
import { selectGlobalKPercent } from "../lib/state/selectors";
import { Slider } from "./Ui/Slider";
import { Switch } from "./Ui/Switch";
import { Button } from "./Ui/Button";

export const GlobalControls = () => {
  const actions = useAppActions();
  const global = useAppSelector((state) => state.global);
  const kPercent = useAppSelector(selectGlobalKPercent);

  const toggleEnabled = (checked: boolean) => {
    actions.setGlobalEnabled(checked);
    actions.showToast(checked ? "Global ligado" : "Global desligado", true);
  };

  const toggleParam = (key: "osc" | "amp" | "freq" | "rot") =>
    actions.setGlobalParams({ [key]: !global.params[key] });

  const setDirMode = (ev: React.ChangeEvent<HTMLSelectElement>) =>
    actions.setGlobalDirMode(ev.target.value as typeof global.dirMode);

  const apply = () => {
    actions.applyGlobal();
    actions.showToast("Aplicado", true);
  };

  const reset = () => {
    actions.resetGlobal();
    actions.showToast("Reposto", true);
  };

  return (
    <section className="card flex min-h-fit flex-col
             lg:flex-1 lg:basis-1/2 lg:max-h-[calc(36vh)] lg:overflow-hidden" data-pip-zone="true">
      <div className="head">
        <h2>Controles Globais</h2>
      </div>
      <div className="body flex flex-1 min-h-0 flex-col gap-4 lg:overflow-y-auto">
        <div className="flex flex-wrap items-center gap-3">
          <Switch
            checked={global.enabled}
            onCheckedChange={toggleEnabled}
            label="Ativar"
          />
          <div className="flex flex-wrap gap-2 text-xs text-white/70">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={global.params.osc}
                onChange={() => toggleParam("osc")}
              />
              Osc
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={global.params.amp}
                onChange={() => toggleParam("amp")}
              />
              Amp
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={global.params.freq}
                onChange={() => toggleParam("freq")}
              />
              Freq
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={global.params.rot}
                onChange={() => toggleParam("rot")}
              />
              Rot
            </label>
          </div>
          <label className="flex flex-col gap-2 text-sm text-white/80">
            Direção
            <select
              value={global.dirMode}
              onChange={setDirMode}
              disabled={global.kActive && global.enabled && global.dirMode !== "keep"}
              className="rounded-lg border border-white/10 bg-[#0f141a] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#5B4EE6]"
            >
              <option value="keep">Manter</option>
              <option value="cw">Horário</option>
              <option value="ccw">Anti-horário</option>
            </select>
          </label>
        </div>
        <Slider
          id="gK"
          label="Fator K"
          min={-100}
          max={100}
          step={1}
          value={kPercent}
          onChange={(ev) => actions.setGlobalKPercent(Number(ev.target.value))}
          valueDisplay={`${kPercent}%`}
        />
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" onClick={apply}>
            Aplicar
          </Button>
          <Button variant="secondary" onClick={reset}>
            Resetar
          </Button>
        </div>
      </div>
    </section>
  );
};

