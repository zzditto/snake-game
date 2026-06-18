import type { DecorationDef, GameState, ThemeTokens } from '@/game/types';
import { drawGrassLayer } from '@/game/render/layers/GrassLayer';
import { drawFoodLayer } from '@/game/render/layers/FoodLayer';
import { drawSnakeLayer } from '@/game/render/layers/SnakeLayer';
import { drawEffectsLayer, spawnEatParticles, triggerScreenShake, clearEffects } from '@/game/render/layers/EffectsLayer';
import { drawObstacleLayer } from '@/game/render/layers/ObstacleLayer';
import { drawParticleLayer, initParticleLayer } from '@/game/render/layers/ParticleLayer';

export class Renderer {
  private canvases: Record<string, HTMLCanvasElement> = {};
  private contexts: Record<string, CanvasRenderingContext2D> = {};
  private cellW = 0;
  private cellH = 0;
  private boardSize: number;
  private theme: ThemeTokens;
  private decorations: DecorationDef[];
  private animTime = 0;
  private lastFrameTime = 0;
  private isDead = false;
  private deathTime = 0;
  public hasTriggeredDeath = false;

  constructor(
    container: HTMLElement,
    boardSize: number,
    theme: ThemeTokens,
    decorations: DecorationDef[],
  ) {
    this.boardSize = boardSize;
    this.theme = theme;
    this.decorations = decorations;
    this.cellW = Math.min(container.clientWidth, boardSize * 64) / boardSize;
    this.cellH = this.cellW;
    for (const name of ['grass', 'food', 'obstacle', 'snake', 'effects', 'particle'] as const) {
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
    initParticleLayer(theme.snakeHead === 'spring' ? 'spring' : 'spring');
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

  draw(state: GameState, alpha: number): void {
    const now = performance.now();
    const dt = this.lastFrameTime ? now - this.lastFrameTime : 16;
    this.lastFrameTime = now;
    const dtSec = dt / 1000;
    this.animTime += dtSec;
    if (this.isDead) {
      this.deathTime += dtSec;
    }

    drawFoodLayer(this.ctx('food'), state.foods, this.cellW, this.cellH, this.animTime);
    drawObstacleLayer(this.ctx('obstacle'), state.obstacles, this.cellW, this.cellH);
    drawSnakeLayer(this.ctx('snake'), state.snake, this.cellW, this.cellH, {
      alpha,
      animTime: this.animTime,
      isDead: this.isDead,
      deathTime: this.deathTime,
      theme: this.theme,
    });
    drawEffectsLayer(this.ctx('effects'), dt);
    drawParticleLayer(this.ctx('particle'), dt);
  }

  triggerDeath(): void {
    this.isDead = true;
    this.deathTime = 0;
    triggerScreenShake(6, 400);
  }

  triggerEatParticles(gridX: number, gridY: number, _foodKind: string): void {
    spawnEatParticles(gridX, gridY, this.cellW, this.cellH, _foodKind);
  }

  resetAnimation(): void {
    this.isDead = false;
    this.deathTime = 0;
    this.animTime = 0;
    this.hasTriggeredDeath = false;
    clearEffects();
    initParticleLayer(this.theme.hatSprite === 'hat_cherry_blossom' ? 'spring' : 'spring');
  }

  private drawGrass(): void {
    drawGrassLayer(
      this.ctx('grass'), this.cellW, this.cellH, this.boardSize,
      this.theme, this.decorations,
    );
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
