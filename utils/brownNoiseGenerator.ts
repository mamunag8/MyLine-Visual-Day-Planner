/**
 * MyLine: Visual Day Planner
 * Offline Brown Noise Synthesizer (Zero-Server, 100% Procedural Audio)
 * Supports Web Audio API real-time procedural Brown Noise AND WAV Data URI generation for Expo AV.
 */

class OfflineBrownNoiseEngine {
  private audioCtx: AudioContext | null = null;
  private sourceNode: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying = false;

  public start(): boolean {
    if (this.isPlaying) return true;
    try {
      const AudioContextClass =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return false;

      this.audioCtx = new AudioContextClass();
      const bufferSize = this.audioCtx.sampleRate * 5; // 5-second seamless loop
      const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // Warm brown noise gain compensation
      }

      // Smooth loop boundaries (cross-fade last 512 samples)
      for (let i = 0; i < 512; i++) {
        const fade = i / 512;
        output[bufferSize - 512 + i] =
          output[bufferSize - 512 + i] * (1 - fade) + output[i] * fade;
      }

      // Low-pass filter for extra soothing warmth
      const filterNode = this.audioCtx.createBiquadFilter();
      filterNode.type = 'lowpass';
      filterNode.frequency.value = 420;

      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.setValueAtTime(0.01, this.audioCtx.currentTime);
      this.gainNode.gain.exponentialRampToValueAtTime(0.28, this.audioCtx.currentTime + 0.6);

      this.sourceNode = this.audioCtx.createBufferSource();
      this.sourceNode.buffer = noiseBuffer;
      this.sourceNode.loop = true;

      this.sourceNode.connect(filterNode);
      filterNode.connect(this.gainNode);
      this.gainNode.connect(this.audioCtx.destination);

      this.sourceNode.start(0);
      this.isPlaying = true;
      return true;
    } catch {
      this.isPlaying = false;
      return false;
    }
  }

  public stop(): void {
    if (!this.isPlaying) return;
    try {
      if (this.sourceNode) {
        this.sourceNode.stop();
        this.sourceNode.disconnect();
        this.sourceNode = null;
      }
      if (this.audioCtx) {
        this.audioCtx.close();
        this.audioCtx = null;
      }
    } catch {
      // Ignore cleanup errors
    }
    this.isPlaying = false;
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      return this.start();
    }
  }

  public getStatus(): boolean {
    return this.isPlaying;
  }
}

export const brownNoiseEngine = new OfflineBrownNoiseEngine();

/**
 * Generates a Base64-encoded PCM WAV data URI of soothing Brown Noise for native `expo-av` playback.
 */
export function generateBrownNoiseWavDataUri(durationSeconds = 3, sampleRate = 22050): string {
  const numSamples = durationSeconds * sampleRate;
  const bytesPerSample = 2;
  const dataSize = numSamples * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * bytesPerSample, true);
  view.setUint16(32, bytesPerSample, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  let lastOut = 0.0;
  for (let i = 0; i < numSamples; i++) {
    const white = Math.random() * 2 - 1;
    lastOut = (lastOut + 0.02 * white) / 1.02;
    const sample = Math.max(-1, Math.min(1, lastOut * 2.5));
    view.setInt16(44 + i * 2, sample * 0x7fff, true);
  }

  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = typeof btoa === 'function' ? btoa(binary) : '';
  return `data:audio/wav;base64,${base64}`;
}
