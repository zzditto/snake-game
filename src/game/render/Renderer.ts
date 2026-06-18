import type { GameState, ThemeTokens } from '@/game/types';
import { drawGrassLayer } from '@/game/render/layers/GrassLayer';
import { drawFoodLayer } from '@/game/render/layers/FoodLayer';
import { drawSnakeLayer } from '@/game/render/layers/SnakeLayer';
import { drawEffectsLayer } from '@/game/render/layers/EffectsLayer';
import { drawObstacleLayer } from '@/game/render/layers/ObstacleLayer';

export class Renderer {
  private canvases: Record<string, HTMLCanvasElement> = {};
  private contexts: Record<string, CanvasRenderingContext2D> = {};
  private cellW = 0;
  private cellH = 0;
  private boardSize: number;
  private theme: ThemeTokens;

  constructor(container: HTMLElement, boardSize: number, theme: ThemeTokens) {
    this.boardSize = boardSize;
    this.theme = theme;
    this.resize(container.clientWidth, container.clientHeight);
    for (const name of ['grass', 'food', 'obstacle', 'snake', 'effects'] as const) {
      const canvas = document.createElement('canvas');
      canvas.style.position = 'absolute';
      canvas.style.inset = '0';
      canvas.width = this.cellW * boardSize;
      canvas.height = this.cellH * boardSize;
      container.appendChild(canvas);
      this.canvases[name] = canvas;
      this.contexts[name] = canvas.getContext('2d')!;
    }
    this.drawGrass();
  }

  resize(containerW: number, _containerH: number): void {
    const size = Math.min(containerW, this.boardSize * 64);
    this.cellW = size / this.boardSize;
    this.cellH = this.cellW;
    for (const c of Object.values(this.canvases)) {
      c.width = this.cellW * this.boardSize;
      c.height = this.cellH * this.boardSize;
    }
    this.drawGrass();
  }

  draw(state: GameState, _alpha: number): void {
    drawFoodLayer(this.ctx('food'), state.foods, this.cellW, this.cellH);
    drawObstacleLayer(this.ctx('obstacle'), state.obstacles, this.cellW, this.cellH);
    drawSnakeLayer(
      this.ctx('snake'), state.snake, this.cellW, this.cellH,
      this.theme.snakeHead, this.theme.snakeBodyEnd,
    );
    drawEffectsLayer(this.ctx('effects'));
  }

  private drawGrass(): void {
    drawGrassLayer(this.ctx('grass'), this.cellW, this.cellH, this.boardSize, this.theme);
  }

  private ctx(name: string): CanvasRenderingContext2D {
    return this.contexts[name]!;
  }

  destroy(): void {
    for (const c of Object.values(this.canvases)) c.remove();
    this.canvases = {};
    this.contexts = {};
  }
}
