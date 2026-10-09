/**
 * Results of the cost-of-living survey the SSAJ ran among its members in July
 * 2022 (65 answers), as published in "The SSAJ Student's Guide to Life in
 * Japan" (4th ed.). The original prints them as pie charts in English; here
 * they are data, so `Encuesta.astro` can draw them in Spanish and in the
 * site's own style.
 *
 * Each row is `[franja, porcentaje]`: price bands in ascending order, and the
 * types of housing from the most to the least common.
 */
export type FilaEncuesta = [franja: string, porcentaje: number];

export interface TemaEncuesta {
  /** The survey question, translated. */
  titulo: string;
  filas: FilaEncuesta[];
  /** Anything the reader should know about how the original labels were read. */
  nota?: string;
}

export const ENCUESTA = {
  alojamiento: {
    titulo: '¿En qué tipo de vivienda vives?',
    filas: [
      ['Residencia de la institución', 45.5],
      ['Apartamento 1DK o 1LDK', 21.2],
      ['Apartamento 1R o 1K', 19.7],
      ['Apartamento 2K, 2DK o 2LDK', 9.1],
      ['Casa compartida (share house)', 3.0],
      ['Otro', 1.5],
    ],
  },
  total: {
    titulo: 'Gasto total al mes',
    filas: [
      ['Menos de ¥80.000', 6.7],
      ['¥80.000 a ¥109.999', 13.3],
      ['¥110.000 a ¥139.999', 28.3],
      ['¥140.000 a ¥169.999', 20.0],
      ['¥170.000 a ¥199.999', 8.3],
      ['¥200.000 a ¥229.999', 18.3],
      ['¥230.000 a ¥259.999', 3.3],
      ['Más de ¥300.000', 1.7],
    ],
    nota: 'Nadie respondió entre ¥260.000 y ¥299.999.',
  },
  alquiler: {
    titulo: 'Alquiler',
    filas: [
      ['Menos de ¥20.000', 7.7],
      ['¥20.000 a ¥39.999', 13.8],
      ['¥40.000 a ¥59.999', 20.0],
      ['¥60.000 a ¥79.999', 30.8],
      ['¥80.000 a ¥99.999', 16.9],
      ['Más de ¥100.000', 10.8],
    ],
    nota: 'La primera franja figura en el original como "< JPY5000". Como la siguiente empieza en ¥20.000, aquí se lee como "menos de ¥20.000".',
  },
  comida: {
    titulo: 'Comida',
    filas: [
      ['Menos de ¥30.000', 9.5],
      ['¥30.000 a ¥39.999', 23.8],
      ['¥40.000 a ¥49.999', 20.6],
      ['¥50.000 a ¥59.999', 19.0],
      ['¥60.000 a ¥69.999', 12.7],
      ['¥70.000 a ¥79.999', 6.3],
      ['¥80.000 a ¥89.999', 3.2],
      ['¥90.000 a ¥99.999', 1.6],
      ['Más de ¥100.000', 3.2],
    ],
  },
  servicios: {
    titulo: 'Agua, luz y gas',
    filas: [
      ['Menos de ¥5.000', 20.6],
      ['¥5.000 a ¥9.999', 38.1],
      ['¥10.000 a ¥14.999', 12.7],
      ['Más de ¥15.000', 3.2],
      ['Incluidos en el alquiler', 25.4],
    ],
  },
  transporte: {
    titulo: 'Transporte diario, sin viajes',
    filas: [
      ['Menos de ¥5.000', 19.0],
      ['¥5.000 a ¥7.999', 34.5],
      ['¥8.000 a ¥10.999', 20.7],
      ['¥11.000 a ¥13.999', 19.0],
      ['¥14.000 a ¥16.999', 3.4],
      ['¥17.000 a ¥19.999', 3.4],
    ],
  },
  telefono: {
    titulo: 'Plan de teléfono',
    filas: [
      ['Menos de ¥1.000', 12.1],
      ['¥1.000 a ¥1.999', 30.3],
      ['¥2.000 a ¥2.999', 31.8],
      ['¥3.000 a ¥3.999', 18.2],
      ['¥4.000 a ¥4.999', 4.5],
      ['Más de ¥5.000', 3.0],
    ],
  },
  ocio: {
    titulo: 'Compras, ocio y aficiones',
    filas: [
      ['Menos de ¥10.000', 11.3],
      ['¥10.000 a ¥19.999', 27.4],
      ['¥20.000 a ¥29.999', 29.0],
      ['¥30.000 a ¥39.999', 17.7],
      ['¥40.000 a ¥49.999', 4.8],
      ['Más de ¥50.000', 9.7],
    ],
  },
} satisfies Record<string, TemaEncuesta>;

export type ClaveEncuesta = keyof typeof ENCUESTA;
