/**
 * The two guides, described as railway lines: every chapter is a station with a
 * short Japanese name. Used by the station strip on the home page, the stamp
 * book (/sellos/) and the Starlight sidebar/pagination overrides.
 *
 * Keep `href` in sync with the sidebar in astro.config.mjs.
 */
export interface Station {
  href: string;
  /** Spanish label, as in the sidebar. */
  label: string;
  /** Station name in Japanese, its reading, and the stamp's centre character. */
  ja: string;
  kana: string;
  mark: string;
}

export interface Line {
  id: 'japones' | 'llegada';
  code: string;
  name: string;
  ja: string;
  /** CSS colour (custom property) of the line. */
  color: string;
  home: string;
  stations: Station[];
}

export const lines: Line[] = [
  {
    id: 'japones',
    code: 'N',
    name: 'Guía de Japonés',
    ja: '日本語線',
    color: 'var(--purple)',
    home: '/guias/japones/',
    stations: [
      { href: '/guias/japones/', label: 'Introducción', ja: '始発', kana: 'しはつ', mark: '始' },
      { href: '/guias/japones/fundamentos/', label: 'Fundamentos y escritura', ja: '五十音', kana: 'ごじゅうおん', mark: 'あ' },
      { href: '/guias/japones/gramatica/', label: 'Gramática base', ja: '文法', kana: 'ぶんぽう', mark: '文' },
      { href: '/guias/japones/vocabulario/', label: 'Vocabulario y Anki', ja: '単語', kana: 'たんご', mark: '語' },
      { href: '/guias/japones/inmersion/', label: 'Inmersión y listening', ja: '多聴', kana: 'たちょう', mark: '聴' },
      { href: '/guias/japones/hablar/', label: 'Hablar y producción', ja: '会話', kana: 'かいわ', mark: '話' },
      { href: '/guias/japones/jlpt/', label: 'JLPT y exámenes', ja: '試験', kana: 'しけん', mark: '験' },
      { href: '/guias/japones/faq/', label: 'Preguntas frecuentes', ja: '質問', kana: 'しつもん', mark: '問' },
    ],
  },
  {
    id: 'llegada',
    code: 'L',
    name: 'Guía de Llegada',
    ja: '到着線',
    color: 'var(--green)',
    home: '/guias/llegada/',
    stations: [
      { href: '/guias/llegada/', label: 'Introducción', ja: '出発', kana: 'しゅっぱつ', mark: '発' },
      { href: '/guias/llegada/visa/', label: 'Visa y CoE', ja: '査証', kana: 'さしょう', mark: '証' },
      { href: '/guias/llegada/preparacion/', label: 'Antes de salir', ja: '準備', kana: 'じゅんび', mark: '備' },
      { href: '/guias/llegada/aduana/', label: 'El día de la llegada', ja: '入国', kana: 'にゅうこく', mark: '入' },
      { href: '/guias/llegada/tramites/', label: 'Trámites en el ayuntamiento', ja: '手続', kana: 'てつづき', mark: '続' },
      { href: '/guias/llegada/telefono-banco/', label: 'Teléfono, sello y banco', ja: '銀行', kana: 'ぎんこう', mark: '銀' },
      { href: '/guias/llegada/pagos/', label: 'Pagar sin efectivo', ja: '決済', kana: 'けっさい', mark: '決' },
      { href: '/guias/llegada/dia-a-dia/', label: 'El día a día', ja: '日常', kana: 'にちじょう', mark: '常' },
      { href: '/guias/llegada/vivienda/', label: 'Vivienda', ja: '住居', kana: 'じゅうきょ', mark: '住' },
      { href: '/guias/llegada/transporte/', label: 'Transporte', ja: '交通', kana: 'こうつう', mark: '交' },
      { href: '/guias/llegada/salud/', label: 'Salud', ja: '医療', kana: 'いりょう', mark: '医' },
      { href: '/guias/llegada/comida/', label: 'Comida y religión', ja: '食事', kana: 'しょくじ', mark: '食' },
      { href: '/guias/llegada/compras/', label: 'Compras', ja: '買物', kana: 'かいもの', mark: '買' },
      { href: '/guias/llegada/ocio/', label: 'Ocio y viajes', ja: '娯楽', kana: 'ごらく', mark: '楽' },
      { href: '/guias/llegada/trabajo/', label: 'Trabajo y costos', ja: '仕事', kana: 'しごと', mark: '仕' },
      { href: '/guias/llegada/regreso/', label: 'Salir de Japón', ja: '帰国', kana: 'きこく', mark: '帰' },
    ],
  },
];

const trim = (path: string) => path.replace(/\/+$/, '') || '/';

/** Find the line and station for a URL path, if it is a guide chapter. */
export function locate(path: string) {
  for (const line of lines) {
    const index = line.stations.findIndex((s) => trim(s.href) === trim(path));
    if (index !== -1) return { line, index, station: line.stations[index] };
  }
  return undefined;
}

/** "N03". The intro is station 00, so chapter numbers match the guide's sidebar. */
export const stationCode = (line: Line, index: number) => `${line.code}${String(index).padStart(2, '0')}`;

/** How many stamps there are to collect in total. */
export const totalStations = lines.reduce((n, line) => n + line.stations.length, 0);
