import { useCallback, useEffect, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { readSave, writeSave, SAVE_KEY, LEGACY_KEY } from "../game/state.js";
import { applyAction } from "../game/engine.js";
import { playSound, startBgm, stopBgm } from "../game/audio.js";

export default function useGame() {
  const [loaded] = useState(() => {
    try {
      return readSave(window.localStorage);
    } catch {
      return readSave({
        getItem() {
          throw new Error("Storage unavailable");
        },
      });
    }
  });
  const [game, setGame] = useState(loaded.state);
  const current = useRef(game);
  const blocked = useRef(loaded.blocked);
  const [saveError, setSaveError] = useState(loaded.error);
  const [feedback, setFeedback] = useState(null);
  const [celebrate, setCelebrate] = useState(false);
  const sequence = useRef(0);
  const act = useCallback((action) => {
    if (action.type === "RESET") {
      try {
        localStorage.removeItem(SAVE_KEY);
        localStorage.removeItem(LEGACY_KEY);
        blocked.current = false;
        setSaveError(null);
      } catch {
        setSaveError("Không thể xóa bản lưu trên thiết bị này.");
      }
    }
    const result = applyAction(current.current, action);
    current.current = result.state;
    setGame(result.state);
    if (result.message) {
      setFeedback({ ...result, id: ++sequence.current, state: undefined });
      try {
        playSound(result.sound, result.state.soundOn);
      } catch {
        /* Audio is optional. */
      }
      if (result.ok && result.state.hapticsOn && Capacitor.isNativePlatform())
        Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
    }
    if (result.completed) setCelebrate(result.completed);
    return result;
  }, []);
  useEffect(() => {
    if (blocked.current) return;
    try {
      writeSave(localStorage, game);
      setSaveError(null);
    } catch {
      setSaveError(
        "Thiết bị không cho phép lưu. Tiến trình hiện tại chỉ tồn tại trong phiên này.",
      );
    }
  }, [game]);
  useEffect(() => {
    const tick = () => act({ type: "TICK" });
    const timer = setInterval(tick, 1000);
    window.addEventListener("focus", tick);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", tick);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [act]);
  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 3500);
    return () => clearTimeout(timer);
  }, [feedback]);
  useEffect(() => {
    const start = () => {
      if (current.current.musicOn && !document.hidden) startBgm();
    };
    const visibility = () => (document.hidden ? stopBgm() : start());
    if (game.musicOn) start();
    else stopBgm();
    window.addEventListener("pointerdown", start);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      stopBgm();
      window.removeEventListener("pointerdown", start);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [game.musicOn]);
  return { game, act, feedback, celebrate, setCelebrate, saveError };
}
