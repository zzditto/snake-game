import { Howl } from 'howler';

type SfxKind =
  | 'eat' | 'eat_fossil' | 'eat_meteor'
  | 'die' | 'unlock' | 'pause'
  | 'page' | 'meteor_spawn';

interface SfxDef {
  key: SfxKind;
  src: string;
  volume?: number;
}

const SFX_LIST: SfxDef[] = [
  { key: 'eat',           src: 'audio/sfx_eat.ogg',           volume: 0.6 },
  { key: 'eat_fossil',    src: 'audio/sfx_eat_fossil.ogg',    volume: 0.7 },
  { key: 'eat_meteor',    src: 'audio/sfx_eat_meteor.ogg',    volume: 0.7 },
  { key: 'die',           src: 'audio/sfx_die.ogg',           volume: 0.8 },
  { key: 'unlock',        src: 'audio/sfx_unlock.ogg',        volume: 0.8 },
  { key: 'pause',         src: 'audio/sfx_pause.ogg',         volume: 0.5 },
  { key: 'page',          src: 'audio/sfx_page.ogg',          volume: 0.4 },
  { key: 'meteor_spawn',  src: 'audio/sfx_meteor_spawn.ogg',  volume: 0.5 },
];

export class AudioManager {
  private bgm: Howl | null = null;
  private sfxMap = new Map<SfxKind, Howl>();
  private sfxBaseVolume = new Map<SfxKind, number>();
  private bgmVolume = 0.5;
  private sfxVolume = 0.7;
  private bgmLoaded = false;
  private sfxLoadedCount = 0;
  private sfxTotalCount = 0;

  constructor() {
    this.sfxTotalCount = SFX_LIST.length;
  }

  loadBgm(src: string = 'audio/bgm_main.ogg'): void {
    this.bgm?.unload();
    this.bgm = new Howl({
      src: [src],
      loop: true,
      volume: this.bgmVolume,
      html5: true,
      onload: () => { this.bgmLoaded = true; },
      onloaderror: () => { console.warn('[Audio] BGM 加载失败:', src); },
    });
  }

  loadAllSfx(): void {
    for (const [key, howl] of this.sfxMap) howl.unload();
    this.sfxMap.clear();
    this.sfxBaseVolume.clear();
    this.sfxLoadedCount = 0;

    for (const def of SFX_LIST) {
      const base = def.volume ?? this.sfxVolume;
      this.sfxBaseVolume.set(def.key, base);
      const howl = new Howl({
        src: [def.src],
        volume: base * this.sfxVolume,
        html5: false,
        onload: () => { this.sfxLoadedCount++; },
        onloaderror: () => { console.warn('[Audio] SFX 加载失败:', def.src); },
      });
      this.sfxMap.set(def.key, howl);
    }
  }

  getLoadProgress(): number {
    const bgmWeight = 0.3;
    const sfxWeight = 0.7;
    const bgmProgress = this.bgmLoaded ? 1 : 0;
    const sfxProgress = this.sfxTotalCount > 0
      ? this.sfxLoadedCount / this.sfxTotalCount
      : 1;
    return bgmProgress * bgmWeight + sfxProgress * sfxWeight;
  }

  playBgm(): void {
    if (!this.bgm) return;
    if (!this.bgm.playing()) this.bgm.play();
  }

  pauseBgm(): void {
    this.bgm?.pause();
  }

  stopBgm(): void {
    this.bgm?.stop();
    this.bgmLoaded = false;
  }

  setBgmVolume(v: number): void {
    this.bgmVolume = Math.max(0, Math.min(1, v));
    this.bgm?.volume(this.bgmVolume);
  }

  setSfxVolume(v: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, v));
    for (const [key, howl] of this.sfxMap) {
      const base = this.sfxBaseVolume.get(key) ?? this.sfxVolume;
      howl.volume(base * this.sfxVolume);
    }
  }

  playSfx(key: SfxKind): void {
    const howl = this.sfxMap.get(key);
    if (!howl) return;
    howl.stop();
    howl.play();
  }

  destroy(): void {
    this.stopBgm();
    for (const howl of this.sfxMap.values()) {
      howl.unload();
    }
    this.sfxMap.clear();
    this.sfxBaseVolume.clear();
    this.bgm = null;
    this.bgmLoaded = false;
    this.sfxLoadedCount = 0;
  }

  get isBgmPlaying(): boolean {
    return this.bgm?.playing() ?? false;
  }
}
