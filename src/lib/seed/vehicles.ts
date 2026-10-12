import type { Vehicle } from "@/lib/types";

type Gen = {
  make: string;
  model: string;
  generation: string;
  body?: string;
  yearFrom: number;
  yearTo: number | null;
  engines: [key: string, engine: string][];
};

/**
 * Demo vehicle catalog. This is a curated sample, not a complete automotive database.
 * Vehicle ids follow `v-<make>-<generation>-<engine key>`.
 */
const generations: Gen[] = [
  // BMW 3 Serisi
  { make: "BMW", model: "3 Serisi", generation: "E30", body: "Sedan", yearFrom: 1982, yearTo: 1994,
    engines: [["318i", "318i 1.8 (113 HP)"], ["325i", "325i 2.5 (170 HP)"]] },
  { make: "BMW", model: "3 Serisi", generation: "E36", body: "Sedan", yearFrom: 1990, yearTo: 2000,
    engines: [["316i", "316i 1.6 (102 HP)"], ["318i", "318i 1.8 (115 HP)"], ["328i", "328i 2.8 (193 HP)"]] },
  { make: "BMW", model: "3 Serisi", generation: "E46", body: "Sedan", yearFrom: 1998, yearTo: 2006,
    engines: [["318i", "318i 2.0 (143 HP)"], ["320d", "320d 2.0 (150 HP)"], ["330i", "330i 3.0 (231 HP)"]] },
  { make: "BMW", model: "3 Serisi", generation: "E90", body: "Sedan", yearFrom: 2005, yearTo: 2012,
    engines: [["320i", "320i 2.0 (170 HP)"], ["320d", "320d 2.0 (177 HP)"], ["330i", "330i 3.0 (258 HP)"]] },
  { make: "BMW", model: "3 Serisi", generation: "E92", body: "Coupé", yearFrom: 2006, yearTo: 2013,
    engines: [["320d", "320d 2.0 (184 HP)"], ["335i", "335i 3.0 (306 HP)"]] },
  { make: "BMW", model: "3 Serisi", generation: "G20", body: "Sedan", yearFrom: 2019, yearTo: null,
    engines: [["320i", "320i 2.0 (184 HP)"], ["320d", "320d 2.0 (190 HP)"], ["m340i", "M340i 3.0 (374 HP)"]] },
  // BMW 5 Serisi
  { make: "BMW", model: "5 Serisi", generation: "E39", body: "Sedan", yearFrom: 1995, yearTo: 2004,
    engines: [["520i", "520i 2.2 (170 HP)"], ["530d", "530d 2.9 (193 HP)"], ["m5", "M5 4.9 V8 (400 HP)"]] },
  { make: "BMW", model: "5 Serisi", generation: "E60", body: "Sedan", yearFrom: 2003, yearTo: 2010,
    engines: [["520d", "520d 2.0 (177 HP)"], ["530i", "530i 3.0 (272 HP)"]] },
  { make: "BMW", model: "5 Serisi", generation: "F10", body: "Sedan", yearFrom: 2010, yearTo: 2017,
    engines: [["520d", "520d 2.0 (190 HP)"], ["528i", "528i 2.0 (245 HP)"], ["535i", "535i 3.0 (306 HP)"]] },
  { make: "BMW", model: "5 Serisi", generation: "G30", body: "Sedan", yearFrom: 2017, yearTo: 2023,
    engines: [["520i", "520i 2.0 (184 HP)"], ["520d", "520d 2.0 (190 HP)"], ["530e", "530e 2.0 Plug-in Hybrid (292 HP)"]] },
  // BMW 1 Serisi
  { make: "BMW", model: "1 Serisi", generation: "F20", body: "Hatchback", yearFrom: 2011, yearTo: 2019,
    engines: [["116i", "116i 1.6 (136 HP)"], ["118d", "118d 2.0 (150 HP)"]] },

  { make: "BMW", model: "1 Serisi", generation: "E87", body: "Hatchback", yearFrom: 2004, yearTo: 2011,
    engines: [["116i", "116i 1.6 (122 HP)"], ["120d", "120d 2.0 (177 HP)"]] },
  { make: "BMW", model: "1 Serisi", generation: "F40", body: "Hatchback", yearFrom: 2019, yearTo: null,
    engines: [["118i", "118i 1.5 (140 HP)"]] },
  // BMW 3 Serisi (F30) ve M3
  { make: "BMW", model: "3 Serisi", generation: "F30", body: "Sedan", yearFrom: 2012, yearTo: 2019,
    engines: [["320i-ed", "320i ED 1.6 (170 HP)"], ["320d", "320d 2.0 (190 HP)"]] },
  { make: "BMW", model: "M3", generation: "F80", body: "Sedan", yearFrom: 2014, yearTo: 2018,
    engines: [["m3", "M3 3.0 (431 HP)"]] },
  { make: "BMW", model: "M3", generation: "G80", body: "Sedan", yearFrom: 2021, yearTo: null,
    engines: [["m3-competition", "M3 Competition 3.0 (510 HP)"]] },
  // BMW 4 Serisi
  { make: "BMW", model: "4 Serisi", generation: "F32", body: "Coupé", yearFrom: 2013, yearTo: 2020,
    engines: [["420d", "420d 2.0 (190 HP)"], ["430i", "430i 2.0 (252 HP)"]] },
  { make: "BMW", model: "4 Serisi", generation: "G22", body: "Coupé", yearFrom: 2020, yearTo: null,
    engines: [["420i", "420i 2.0 (184 HP)"], ["m440i", "M440i 3.0 (374 HP)"]] },
  // BMW 7 Serisi
  { make: "BMW", model: "7 Serisi", generation: "F01", body: "Sedan", yearFrom: 2008, yearTo: 2015,
    engines: [["730d", "730d 3.0 (245 HP)"]] },
  { make: "BMW", model: "7 Serisi", generation: "G11", body: "Sedan", yearFrom: 2015, yearTo: 2022,
    engines: [["730d", "730d 3.0 (265 HP)"], ["740i", "740i 3.0 (326 HP)"]] },
  // BMW X serisi
  { make: "BMW", model: "X1", generation: "F48", body: "SUV", yearFrom: 2015, yearTo: 2022,
    engines: [["sdrive18i", "sDrive18i 1.5 (136 HP)"], ["xdrive20d", "xDrive20d 2.0 (190 HP)"]] },
  { make: "BMW", model: "X3", generation: "F25", body: "SUV", yearFrom: 2010, yearTo: 2017,
    engines: [["xdrive20d", "xDrive20d 2.0 (184 HP)"]] },
  { make: "BMW", model: "X3", generation: "G01", body: "SUV", yearFrom: 2017, yearTo: null,
    engines: [["xdrive20d", "xDrive20d 2.0 (190 HP)"], ["xdrive30i", "xDrive30i 2.0 (252 HP)"]] },
  { make: "BMW", model: "X5", generation: "E70", body: "SUV", yearFrom: 2006, yearTo: 2013,
    engines: [["xdrive30d", "xDrive30d 3.0 (245 HP)"]] },
  { make: "BMW", model: "X5", generation: "F15", body: "SUV", yearFrom: 2013, yearTo: 2018,
    engines: [["xdrive30d", "xDrive30d 3.0 (258 HP)"]] },
  { make: "BMW", model: "X5", generation: "G05", body: "SUV", yearFrom: 2018, yearTo: null,
    engines: [["xdrive30d", "xDrive30d 3.0 (286 HP)"]] },
  // BMW Z4
  { make: "BMW", model: "Z4", generation: "E89", body: "Roadster", yearFrom: 2009, yearTo: 2016,
    engines: [["sdrive20i", "sDrive20i 2.0 (184 HP)"]] },
  { make: "BMW", model: "Z4", generation: "G29", body: "Roadster", yearFrom: 2018, yearTo: null,
    engines: [["sdrive30i", "sDrive30i 2.0 (258 HP)"], ["m40i", "M40i 3.0 (340 HP)"]] },
  // Mercedes-Benz
  { make: "Mercedes-Benz", model: "C-Serisi", generation: "W204", body: "Sedan", yearFrom: 2007, yearTo: 2014,
    engines: [["c180", "C 180 1.6 (156 HP)"], ["c220cdi", "C 220 CDI 2.1 (170 HP)"]] },
  { make: "Mercedes-Benz", model: "C-Serisi", generation: "W205", body: "Sedan", yearFrom: 2014, yearTo: 2021,
    engines: [["c200", "C 200 2.0 (184 HP)"], ["c220d", "C 220 d 2.1 (170 HP)"]] },
  { make: "Mercedes-Benz", model: "E-Serisi", generation: "W211", body: "Sedan", yearFrom: 2002, yearTo: 2009,
    engines: [["e220cdi", "E 220 CDI 2.1 (150 HP)"]] },
  { make: "Mercedes-Benz", model: "E-Serisi", generation: "W212", body: "Sedan", yearFrom: 2009, yearTo: 2016,
    engines: [["e200", "E 200 2.0 (184 HP)"], ["e250cdi", "E 250 CDI 2.1 (204 HP)"]] },

  // Porsche
  { make: "Porsche", model: "911", generation: "997", body: "Coupé", yearFrom: 2004, yearTo: 2012,
    engines: [["carrera", "Carrera 3.6 (325 HP)"]] },
  { make: "Porsche", model: "911", generation: "991", body: "Coupé", yearFrom: 2011, yearTo: 2019,
    engines: [["carrera-s", "Carrera S 3.8 (400 HP)"]] },
  { make: "Porsche", model: "Boxster / Cayman", generation: "987", body: "Coupé", yearFrom: 2005, yearTo: 2012,
    engines: [["cayman", "Cayman 2.7 (245 HP)"]] },
  { make: "Porsche", model: "Cayenne", generation: "958", body: "SUV", yearFrom: 2010, yearTo: 2017,
    engines: [["diesel", "Cayenne Diesel 3.0 V6 (245 HP)"]] },

  // Audi
  { make: "Audi", model: "A4", generation: "B7", body: "Sedan", yearFrom: 2004, yearTo: 2008,
    engines: [["20tfsi", "2.0 TFSI (200 HP)"]] },
  { make: "Audi", model: "A4", generation: "B8", body: "Sedan", yearFrom: 2007, yearTo: 2015,
    engines: [["18tfsi", "1.8 TFSI (160 HP)"], ["20tdi", "2.0 TDI (143 HP)"]] },
  { make: "Audi", model: "A4", generation: "B9", body: "Sedan", yearFrom: 2015, yearTo: null,
    engines: [["40tdi", "40 TDI 2.0 (190 HP)"]] },
  { make: "Audi", model: "A3", generation: "8V", body: "Sportback", yearFrom: 2012, yearTo: 2020,
    engines: [["14tfsi", "1.4 TFSI (125 HP)"]] },
];

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const vehicles: Vehicle[] = generations.flatMap((g) =>
  g.engines.map(([key, engine]) => ({
    id: `v-${slug(g.make)}-${slug(g.generation)}-${key}`,
    make: g.make,
    model: g.model,
    generation: g.generation,
    body: g.body,
    yearFrom: g.yearFrom,
    yearTo: g.yearTo,
    engine,
  })),
);
