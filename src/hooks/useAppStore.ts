import { useMemo, useSyncExternalStore } from "react";
import { AppState, appStore } from "../lib/state/store";

const getServerSnapshot = () => appStore.getState();

export const useAppSelector = <T>(selector: (state: AppState) => T): T => {
  const state = useSyncExternalStore(appStore.subscribe, appStore.getState, getServerSnapshot);
  return useMemo(() => selector(state), [state, selector]);
};

export const useAppActions = () => appStore.actions;
