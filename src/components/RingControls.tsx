"use client";

import React from "react";
import { useAppActions, useAppSelector } from "../hooks/useAppStore";
import { selectActiveRing } from "../lib/state/selectors";
import { Slider } from "./Ui/Slider";
import { Button } from "./Ui/Button";

export const RingControls = () => {
  const actions = useAppActions();
  const activeRing = useAppSelector(selectActiveRing);
  const global = useAppSelector((state) => state.global);

  if (!activeRing) {
    return (
      <section className="card flex min-h-0 flex-1 flex-col" data-pip-zone="true">
        <div className="head">
          <h2>Controles do Anel</h2>
        </div>
        <div className="body flex-1 min-h-0 text-sm text-white/60">Nenhum anel selecionado.</div>
      </section>
    );
  }

  const lockOsc = global.kActive && global.params.osc;
  const lockAmp = global.kActive && global.params.amp;
  const lockFreq = global.kActive && global.params.freq;
  const lockRot = global.kActive && global.params.rot;
  const lockDir = global.kActive && global.enabled && global.dirMode !== "keep";

  const handleNameChange = (ev: React.ChangeEvent<HTMLInputElement>) =>
    actions.updateRing(activeRing.id, { name: ev.target.value });
  const handleVisibleChange = (ev: React.ChangeEvent<HTMLSelectElement>) =>
    actions.setRingVisibility(activeRing.id, ev.target.value === "1");
  const handleSizeChange = (ev: React.ChangeEvent<HTMLInputElement>) =>
    actions.updateRing(activeRing.id, { baseRadius: Number(ev.target.value) / 2 });
  const handleThickChange = (ev: React.ChangeEvent<HTMLInputElement>) =>
    actions.updateRing(activeRing.id, { lineWidthBase: Number(ev.target.value) });
  const handleOscChange = (ev: React.ChangeEvent<HTMLInputElement>) =>
    actions.updateRing(activeRing.id, { expandPct: Number(ev.target.value) / 100 });
  const handleAmpChange = (ev: React.ChangeEvent<HTMLInputElement>) =>
    actions.updateRing(activeRing.id, { ampScale: Number(ev.target.value) / 100 });
  const handleFreqChange = (ev: React.ChangeEvent<HTMLInputElement>) =>
    actions.updateRing(activeRing.id, { freqScale: Number(ev.target.value) / 100 });
  const handleRotChange = (ev: React.ChangeEvent<HTMLInputElement>) =>
    actions.updateRing(activeRing.id, { rotateBase: Number(ev.target.value) });
  const handleDirChange = (ev: React.ChangeEvent<HTMLSelectElement>) =>
    actions.updateRing(activeRing.id, { rotateSign: Number(ev.target.value) as 1 | -1 });
  const handleColorA = (ev: React.ChangeEvent<HTMLInputElement>) =>
    actions.updateRing(activeRing.id, { colorA: ev.target.value });
  const handleColorB = (ev: React.ChangeEvent<HTMLInputElement>) =>
    actions.updateRing(activeRing.id, { colorB: ev.target.value });
  const swapColors = () =>
    actions.updateRing(activeRing.id, { colorA: activeRing.colorB, colorB: activeRing.colorA });

  return (
    <section className="card flex min-h-0 flex-col lg:flex-1 lg:basis-1/2 lg:max-h-[calc(58vh)] lg:overflow-hidden" data-pip-zone="true">
      <div className="head">
        <h2>Controles do Anel</h2>
      </div>
      <div className="body flex flex-1 min-h-0 flex-col gap-4 lg:overflow-y-auto">
        <div className="row flex flex-wrap items-center gap-3">
          <label className="flex flex-1 min-w-[180px] flex-col gap-2 text-sm text-white/80">
            Nome
            <input
              id="ringName"
              type="text"
              value={activeRing.name}
              onChange={handleNameChange}
              className="rounded-lg border border-white/10 bg-[#0f141a] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#5B4EE6]"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-white/80">
            Visível
            <select
              id="ringVisible"
              value={activeRing.visible ? "1" : "0"}
              onChange={handleVisibleChange}
              className="rounded-lg border border-white/10 bg-[#0f141a] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#5B4EE6]"
            >
              <option value="1">Sim</option>
              <option value="0">Não</option>
            </select>
          </label>
        </div>
        <Slider
          id="size"
          label="Diâmetro"
          min={200}
          max={300}
          step={1}
          value={Math.round(activeRing.baseRadius * 2)}
          onChange={handleSizeChange}
          valueDisplay={`${Math.round(activeRing.baseRadius * 2)}px`}
        />
        <Slider
          id="thick"
          label="Espessura"
          min={2}
          max={4}
          step={0.1}
          value={activeRing.lineWidthBase}
          onChange={handleThickChange}
          valueDisplay={activeRing.lineWidthBase.toFixed(1)}
        />
        <Slider
          id="osc"
          label="Oscilação"
          min={0}
          max={8}
          step={0.1}
          value={Math.round(activeRing.expandPct * 100)}
          onChange={handleOscChange}
          disabled={lockOsc}
          valueDisplay={`${Math.round(activeRing.expandPct * 100)}%`}
        />
        <Slider
          id="amp"
          label="Amplitude"
          min={0}
          max={300}
          step={1}
          value={Math.round(activeRing.ampScale * 100)}
          onChange={handleAmpChange}
          disabled={lockAmp}
          valueDisplay={`${Math.round(activeRing.ampScale * 100)}%`}
        />
        <Slider
          id="freq"
          label="Frequência"
          min={50}
          max={200}
          step={1}
          value={Math.round(activeRing.freqScale * 100)}
          onChange={handleFreqChange}
          disabled={lockFreq}
          valueDisplay={`${Math.round(activeRing.freqScale * 100)}%`}
        />
        <Slider
          id="rot"
          label="Rotação"
          min={0}
          max={1}
          step={0.01}
          value={Number(activeRing.rotateBase.toFixed(2))}
          onChange={handleRotChange}
          disabled={lockRot}
          valueDisplay={activeRing.rotateBase.toFixed(2)}
        />
        <div className="row flex flex-wrap items-center gap-3 text-sm text-white/80">
          <label className="flex flex-col gap-2">
            Direção
            <select
              id="dir"
              value={String(activeRing.rotateSign)}
              onChange={handleDirChange}
              disabled={lockDir}
              className="rounded-lg border border-white/10 bg-[#0f141a] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#5B4EE6]"
            >
              <option value="1">Horário</option>
              <option value="-1">Anti-horário</option>
            </select>
          </label>
          <label className="flex flex-col gap-2">
            Cor A
            <input
              id="colA"
              type="color"
              value={activeRing.colorA}
              onChange={handleColorA}
              className="h-10 w-16 cursor-pointer rounded-lg border border-white/20 bg-[#0b0f14]"
            />
          </label>
          <label className="flex flex-col gap-2">
            Cor B
            <input
              id="colB"
              type="color"
              value={activeRing.colorB}
              onChange={handleColorB}
              className="h-10 w-16 cursor-pointer rounded-lg border border-white/20 bg-[#0b0f14]"
            />
          </label>
          <Button variant="ghost" onClick={swapColors}>
            Inverter cores
          </Button>
        </div>
      </div>
    </section>
  );
};

