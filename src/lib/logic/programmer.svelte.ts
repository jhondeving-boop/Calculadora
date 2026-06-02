import { api, type BaseConversion } from "../api/tauri";

export type Base = "HEX" | "DEC" | "OCT" | "BIN";

const RADIX_MAP: Record<Base, number> = {
  HEX: 16,
  DEC: 10,
  OCT: 8,
  BIN: 2,
};

export class ProgrammerEngine {
  currentBase = $state<Base>("DEC");
  input = $state<string>("0");
  hex = $state<string>("");
  dec = $state<string>("");
  oct = $state<string>("");
  bin = $state<string>("");
  loading = $state(false);

  constructor() {
    this.updateConversions();
  }

  async updateConversions() {
    if (this.input === "0" || this.input === "") {
      this.hex = "0";
      this.dec = "0";
      this.oct = "0";
      this.bin = "0000";
      return;
    }

    this.loading = true;
    try {
      const result: BaseConversion = await api.convertBase(
        this.input,
        this.currentBase
      );
      this.hex = result.hex;
      this.dec = result.dec;
      this.oct = result.oct;
      this.bin = result.bin;
    } catch (e) {
      console.error("Conversion error:", e);
    } finally {
      this.loading = false;
    }
  }

  press(key: string): void {
    if (key === "AC") {
      this.input = "0";
      this.updateConversions();
      return;
    }

    if (key === "⌫") {
      this.input = this.input.length > 1 ? this.input.slice(0, -1) : "0";
      this.updateConversions();
      return;
    }

    if (!this.isKeyAllowed(key)) return;

    if (this.input === "0") {
      this.input = key;
    } else {
      this.input += key;
    }
    this.updateConversions();
  }

  isKeyAllowed(key: string): boolean {
    const hexKeys = ["A", "B", "C", "D", "E", "F"];
    const decKeys = ["2", "3", "4", "5", "6", "7", "8", "9"];
    const binKeys = ["0", "1"];

    if (this.currentBase === "BIN") return binKeys.includes(key);
    if (this.currentBase === "OCT")
      return [...binKeys, "2", "3", "4", "5", "6", "7"].includes(key);
    if (this.currentBase === "DEC")
      return [...binKeys, ...decKeys].includes(key);
    return true;
  }

  async setBase(base: Base): Promise<void> {
    const currentRadix = RADIX_MAP[this.currentBase];
    const currentVal = parseInt(this.input, currentRadix);

    this.currentBase = base;

    if (!isNaN(currentVal)) {
      this.input = currentVal.toString(RADIX_MAP[base]).toUpperCase();
    }
    await this.updateConversions();
  }

  clear(): void {
    this.input = "0";
    this.updateConversions();
  }
}

export const programmer = new ProgrammerEngine();