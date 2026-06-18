import type { Food, IslandId, ModeId } from '@/game/types';

export type GameEvents = {
  eat: { food: Food; snakeLength: number };
  die: { score: number; length: number; island: IslandId; mode: ModeId };
  start: { island: IslandId; mode: ModeId };
  pause: undefined;
  resume: undefined;
  tick: { tickCount: number };
};

type Handler<T> = (payload: T) => void;

export class EventBus<EMap extends Record<string, unknown> = GameEvents> {
  private listeners = new Map<keyof EMap, Set<Handler<unknown>>>();

  on<K extends keyof EMap>(type: K, handler: Handler<EMap[K]>): () => void {
    let set = this.listeners.get(type);
    if (!set) {
      set = new Set();
      this.listeners.set(type, set);
    }
    set.add(handler as Handler<unknown>);
    return () => this.off(type, handler);
  }

  off<K extends keyof EMap>(type: K, handler: Handler<EMap[K]>): void {
    this.listeners.get(type)?.delete(handler as Handler<unknown>);
  }

  emit<K extends keyof EMap>(type: K, payload: EMap[K]): void {
    const set = this.listeners.get(type);
    if (!set) return;
    for (const h of set) (h as Handler<EMap[K]>)(payload);
  }

  clear(): void {
    this.listeners.clear();
  }
}
