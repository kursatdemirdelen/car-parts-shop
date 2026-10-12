import type { Vehicle } from "@/lib/types";

const sortTr = (values: string[]) => [...new Set(values)].sort((a, b) => a.localeCompare(b, "tr"));

export function makes(vehicles: Vehicle[]): string[] {
  return sortTr(vehicles.map((v) => v.make));
}

export function models(vehicles: Vehicle[], make: string): string[] {
  return sortTr(vehicles.filter((v) => v.make === make).map((v) => v.model));
}

/** Generations in data order (roughly chronological), not alphabetical. */
export function generations(vehicles: Vehicle[], make: string, model: string): string[] {
  return [...new Set(vehicles.filter((v) => v.make === make && v.model === model).map((v) => v.generation))];
}

const inRange = (v: Vehicle, year: number, currentYear: number) =>
  year >= v.yearFrom && year <= (v.yearTo ?? currentYear);

/** Production years available for a generation, newest first. Ongoing production ends at `currentYear`. */
export function years(vehicles: Vehicle[], make: string, model: string, generation: string, currentYear: number): number[] {
  const set = new Set<number>();
  for (const v of vehicles) {
    if (v.make !== make || v.model !== model || v.generation !== generation) continue;
    for (let y = v.yearFrom; y <= (v.yearTo ?? currentYear); y++) set.add(y);
  }
  return [...set].sort((a, b) => b - a);
}

export function engines(vehicles: Vehicle[], make: string, model: string, generation: string, year: number): Vehicle[] {
  return vehicles.filter(
    (v) => v.make === make && v.model === model && v.generation === generation && inRange(v, year, year),
  );
}

export function vehicleLabel(v: Vehicle): string {
  return `${v.make} ${v.model} ${v.generation} · ${v.engine}`;
}

export function vehicleShortLabel(v: Vehicle): string {
  return `${v.make} ${v.generation} ${v.engine.split(" ")[0]}`;
}

export function yearRange(v: Vehicle): string {
  return v.yearTo ? `${v.yearFrom}–${v.yearTo}` : `${v.yearFrom}–`;
}
