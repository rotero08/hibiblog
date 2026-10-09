/*
 * Spanish name → katakana.
 *
 * Foreign names are written in katakana by sound, not by spelling, so this goes
 * in two steps: Spanish spelling → a simple phonemic spelling ("Guillermo" →
 * g-i-J-e-r-m-o), then syllable by syllable into kana (ギ・ジェ・ル・モ).
 *
 * It is an approximation: Japanese has conventions (long vowels, older
 * spellings) that no rule set gets right every time. A short list of very common
 * names that the rules would miss is kept in KNOWN.
 *
 *   toKatakana('María José')
 *   → { kana: 'マリア・ホセ', words: ['マリア', 'ホセ'], parts: [['マ','ma'], ['リ','ri'], ['ア','a'], ...] }
 *
 * Someone who already has their name in Japanese (on a residence card, say)
 * can skip all of that: fromKana() takes what they wrote as it is.
 */

/** One sound: the kana that writes it, and how to read it. */
export type KanaPart = [kana: string, romaji: string];

export interface Katakana {
  /** Every word, joined with the middle dot used between foreign names. */
  kana: string;
  /** The same, word by word. */
  words: string[];
  /** Sound by sound, for a pronunciation guide. */
  parts: KanaPart[];
}

// Names whose usual katakana differs from what the rules below produce
// (English or French spelling, or a customary long vowel).
const KNOWN: Record<string, string> = {
  william: 'ウィリアム', michael: 'マイケル', michelle: 'ミシェル', jennifer: 'ジェニファー', jessica: 'ジェシカ',
  jonathan: 'ジョナサン', john: 'ジョン', james: 'ジェームズ', brian: 'ブライアン', bryan: 'ブライアン',
  kevin: 'ケビン', steven: 'スティーブン', stephanie: 'ステファニー', ashley: 'アシュリー', emily: 'エミリー',
  george: 'ジョージ', charles: 'チャールズ', charlie: 'チャーリー', henry: 'ヘンリー', harry: 'ハリー',
  alex: 'アレックス', max: 'マックス', felix: 'フェリックス', joe: 'ジョー', joel: 'ジョエル',
  valentina: 'バレンティーナ', carolina: 'カロリーナ', cristina: 'クリスティーナ', martina: 'マルティーナ',
  catalina: 'カタリーナ', lorena: 'ロレーナ', renata: 'レナータ', arturo: 'アルトゥーロ', guadalupe: 'グアダルーペ',
  pilar: 'ピラール', leonardo: 'レオナルド', anna: 'アンナ', emma: 'エマ', hannah: 'ハンナ',
  isabella: 'イサベラ', bella: 'ベラ', stella: 'ステラ', kelly: 'ケリー', lily: 'リリー', billy: 'ビリー',
  allison: 'アリソン', ellie: 'エリー', sophie: 'ソフィー', chloe: 'クロエ', noah: 'ノア', liam: 'リアム',
};

const VOWELS = 'aiueo';
// rows are in a-i-u-e-o order; capital letters stand for sounds spelled with
// two letters in Spanish (C = ch, S = sh, J = ll, N = ñ, Y = consonant y, W = w)
const ROWS: Record<string, string[]> = {
  '': ['ア', 'イ', 'ウ', 'エ', 'オ'],
  k: ['カ', 'キ', 'ク', 'ケ', 'コ'],
  g: ['ガ', 'ギ', 'グ', 'ゲ', 'ゴ'],
  s: ['サ', 'シ', 'ス', 'セ', 'ソ'],
  t: ['タ', 'ティ', 'トゥ', 'テ', 'ト'],
  d: ['ダ', 'ディ', 'ドゥ', 'デ', 'ド'],
  n: ['ナ', 'ニ', 'ヌ', 'ネ', 'ノ'],
  h: ['ハ', 'ヒ', 'フ', 'ヘ', 'ホ'],
  f: ['ファ', 'フィ', 'フ', 'フェ', 'フォ'],
  b: ['バ', 'ビ', 'ブ', 'ベ', 'ボ'],
  p: ['パ', 'ピ', 'プ', 'ペ', 'ポ'],
  m: ['マ', 'ミ', 'ム', 'メ', 'モ'],
  r: ['ラ', 'リ', 'ル', 'レ', 'ロ'],
  l: ['ラ', 'リ', 'ル', 'レ', 'ロ'],
  Y: ['ヤ', 'イ', 'ユ', 'イェ', 'ヨ'],
  W: ['ワ', 'ウィ', 'ウ', 'ウェ', 'ウォ'],
  C: ['チャ', 'チ', 'チュ', 'チェ', 'チョ'],
  S: ['シャ', 'シ', 'シュ', 'シェ', 'ショ'],
  J: ['ジャ', 'ジ', 'ジュ', 'ジェ', 'ジョ'],
  N: ['ニャ', 'ニ', 'ニュ', 'ニェ', 'ニョ'],
};
// a consonant with no vowel after it borrows one, as Japanese has no bare consonants (except ン)
const ALONE: Record<string, string> = {
  n: 'ン', m: 'ム', s: 'ス', r: 'ル', l: 'ル', d: 'ド', t: 'ト', k: 'ク', g: 'グ', b: 'ブ',
  p: 'プ', f: 'フ', h: 'フ', C: 'チ', S: 'シュ', J: 'ジ', N: 'ン', Y: 'イ', W: 'ウ',
};

const ACCENTS = /[̀-ͯ]/g;
const TILDE = '̃';
const DIAERESIS = '̈';

/** "Guillermo" → "giJermo": one letter per sound. */
function phonemes(word: string): string {
  return word
    .replace(/chr/g, 'cr')
    .replace(/tx/g, 'ch') // Basque: Txema
    .replace(/ch/g, 'C')
    .replace(/sh/g, 'S')
    .replace(/ph/g, 'f')
    .replace(/th/g, 't')
    .replace(/h/g, '') // silent
    .replace(/qu(?=[ei])/g, 'k')
    .replace(/q/g, 'k')
    .replace(/gü/g, 'gU') // pingüino: this u is pronounced, keep it safe
    .replace(/ü/g, 'u')
    .replace(/gu(?=[ei])/g, 'G') // Miguel: silent u, hard g
    .replace(/g(?=[ei])/g, 'h') // Gerardo, Ángel
    .replace(/G/g, 'g')
    .replace(/U/g, 'u')
    .replace(/c(?=[ei])/g, 's')
    .replace(/c/g, 'k')
    .replace(/z/g, 's')
    .replace(/v/g, 'b')
    .replace(/j/g, 'h') // Juan, Jorge
    .replace(/^x/, 'h') // Ximena
    .replace(/x/g, 'ks')
    .replace(/ll/g, 'J')
    .replace(/ñ/g, 'N')
    .replace(/rr/g, 'r')
    .replace(/w/g, 'W')
    .replace(/y(?=[aiueo])/g, 'Y')
    .replace(/y/g, 'i') // Eloy, Mayra
    .replace(/([^aiueon])\1/g, '$1'); // other doubled consonants count once
}

function wordToKana(word: string): string {
  const p = phonemes(word);
  let out = '';
  for (let i = 0; i < p.length; i++) {
    const ch = p[i];
    const next = p[i + 1] ?? '';
    const v = VOWELS.indexOf(ch);
    if (v !== -1) {
      out += ROWS[''][v];
      continue;
    }
    const row = ROWS[ch];
    if (!row && !ALONE[ch]) continue; // not a letter we know
    const nv = next ? VOWELS.indexOf(next) : -1;
    if (nv !== -1 && row) {
      out += row[nv];
      i++;
    } else if (ch === 'm' && (next === 'b' || next === 'p')) {
      out += 'ン'; // Humberto, Amparo
    } else {
      out += ALONE[ch] ?? '';
    }
  }
  return out;
}

/* ---- reading a kana string back, for the pronunciation guide ---- */
const BASE: Record<string, string> = {
  ア: 'a', イ: 'i', ウ: 'u', エ: 'e', オ: 'o', カ: 'ka', キ: 'ki', ク: 'ku', ケ: 'ke', コ: 'ko',
  ガ: 'ga', ギ: 'gi', グ: 'gu', ゲ: 'ge', ゴ: 'go', サ: 'sa', シ: 'shi', ス: 'su', セ: 'se', ソ: 'so',
  ザ: 'za', ジ: 'ji', ズ: 'zu', ゼ: 'ze', ゾ: 'zo', タ: 'ta', チ: 'chi', ツ: 'tsu', テ: 'te', ト: 'to',
  ダ: 'da', デ: 'de', ド: 'do', ナ: 'na', ニ: 'ni', ヌ: 'nu', ネ: 'ne', ノ: 'no', ハ: 'ha', ヒ: 'hi',
  フ: 'fu', ヘ: 'he', ホ: 'ho', バ: 'ba', ビ: 'bi', ブ: 'bu', ベ: 'be', ボ: 'bo', パ: 'pa', ピ: 'pi',
  プ: 'pu', ペ: 'pe', ポ: 'po', マ: 'ma', ミ: 'mi', ム: 'mu', メ: 'me', モ: 'mo', ヤ: 'ya', ユ: 'yu',
  ヨ: 'yo', ラ: 'ra', リ: 'ri', ル: 'ru', レ: 're', ロ: 'ro', ワ: 'wa', ン: 'n',
  // not produced by the rules above, but people write them in their own names
  ヴ: 'vu', ヲ: 'o', ヂ: 'ji', ヅ: 'zu',
};
const SMALL: Record<string, string> = { ァ: 'a', ィ: 'i', ゥ: 'u', ェ: 'e', ォ: 'o', ャ: 'ya', ュ: 'yu', ョ: 'yo' };

/** 'ティ' → 'ti', 'ジェ' → 'je', 'ニャ' → 'nya', 'ウィ' → 'wi' */
function digraph(base: string, small: string): string {
  const b = BASE[base] ?? '';
  const s = SMALL[small];
  if (b === 'u') return 'w' + s;
  if (b === 'i') return s.length === 1 ? 'y' + s : s;
  let head = b.slice(0, -1); // drop the vowel
  const soft = head === 'sh' || head === 'ch' || head === 'j';
  // ニェ → nye, キェ → kye (but シェ → she, ジェ → je)
  if (s.length === 1 && b.slice(-1) === 'i' && !soft) return head + 'y' + s;
  if (s.length === 2) {
    // ャ ュ ョ
    if (soft) return head + s[1];
    return head + s;
  }
  return head + s;
}

/** Hiragana to katakana, one character. Anything else comes back unchanged. */
const toKata = (ch: string) => (ch >= 'ぁ' && ch <= 'ゖ' ? String.fromCharCode(ch.charCodeAt(0) + 0x60) : ch);

/** Split kana into [kana, romaji] pairs, one per sound. */
export function readKana(kana: string): KanaPart[] {
  const parts: KanaPart[] = [];
  for (let i = 0; i < kana.length; i++) {
    // the text is kept as written; hiragana is read through its katakana twin
    const ch = kana[i];
    const next = kana[i + 1];
    const k = toKata(ch);
    const kNext = next ? toKata(next) : '';
    if (ch === '・') continue;
    if (ch === 'ー') {
      const last = parts[parts.length - 1];
      if (last) {
        last[0] += 'ー';
        last[1] += last[1].slice(-1); // a long vowel: say it twice as long
      }
      continue;
    }
    if (k === 'ッ') {
      parts.push([ch, '·']); // a short pause before the next consonant
      continue;
    }
    if (kNext && SMALL[kNext] && BASE[k]) {
      parts.push([ch + next, digraph(k, kNext)]);
      i++;
      continue;
    }
    parts.push([ch, BASE[k] ?? '']); // kanji and the like have no reading here
  }
  return parts;
}

/* ---- a name that is already written in Japanese ---- */
// hiragana, katakana (with ー and ・), kanji and the repeat mark
const JAPANESE = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff々]/;
const NOT_JAPANESE = /[^\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff々\s]/g;

/** Does the text have any kana or kanji in it? */
export const hasKana = (text: string) => JAPANESE.test(text.normalize('NFKC'));

/**
 * A name its owner typed in Japanese, taken as it is. Half-width kana become
 * full-width, and whatever is not Japanese (stray Latin letters from a keyboard
 * that has not converted yet, digits) is dropped.
 */
export function fromKana(input: string): Katakana {
  const words = String(input || '')
    .normalize('NFKC')
    .replace(NOT_JAPANESE, ' ')
    .split(/[\s・]+/)
    .filter(Boolean)
    .slice(0, 4);
  const kana = words.join('・');
  return { kana, words, parts: readKana(kana) };
}

/** The katakana for a name, however it was typed: converted, or kept if it is Japanese already. */
export const nameToKana = (name: string): Katakana => (hasKana(name) ? fromKana(name) : toKatakana(name));

export function toKatakana(input: string): Katakana {
  const clean = String(input || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(new RegExp('n' + TILDE, 'g'), 'ñ')
    .replace(new RegExp('u' + DIAERESIS, 'g'), 'ü')
    .replace(ACCENTS, '')
    .replace(/[^a-zñü\s'-]/g, ' ');
  const words = clean
    .split(/[\s'-]+/)
    .filter(Boolean)
    .slice(0, 4)
    .map((w) => KNOWN[w] ?? wordToKana(w))
    .filter(Boolean);
  const kana = words.join('・');
  return { kana, words, parts: readKana(kana) };
}

/**
 * Lay a name out for a square seal: vertical columns, read right to left.
 * Returns the columns in reading order, each as a list of sounds, so a sound is
 * never broken in two (ティ stays together). The seal carries the whole name
 * when it is short, otherwise the first word.
 *
 * With so few sounds every way of cutting them can be tried. The best one has
 * the shortest tallest column, then the most even columns, then cuts between
 * words rather than inside them, then a fuller first column.
 */
export function sealColumns(name: Katakana): string[][] {
  if (!name.words.length) return [];
  const whole = name.words.join('').length <= 9;
  const words = (whole ? name.words : name.words.slice(0, 1)).map((w) => readKana(w).map(([kana]) => kana));
  const parts = words.flat();
  // indexes where a new word starts
  const starts = new Set<number>();
  words.reduce((at, w) => (starts.add(at), at + w.length), 0);

  const size = (column: string[]) => column.reduce((n, kana) => n + kana.length, 0);
  const n = size(parts);
  const count = Math.min(parts.length, n <= 3 ? 1 : n <= 8 ? 2 : 3);

  let best: string[][] = [parts];
  let bestScore = Infinity;
  const consider = (cuts: number[]) => {
    const edges = [0, ...cuts, parts.length];
    const columns = edges.slice(1).map((end, i) => parts.slice(edges[i], end));
    const sizes = columns.map(size);
    const tallest = Math.max(...sizes);
    const onWords = cuts.filter((c) => starts.has(c)).length;
    const score = tallest * 1000 + (tallest - Math.min(...sizes)) * 100 - onWords * 10 - sizes[0];
    if (score < bestScore) {
      bestScore = score;
      best = columns;
    }
  };
  if (count === 1) consider([]);
  for (let a = 1; a < parts.length; a++) {
    if (count === 2) consider([a]);
    if (count === 3) for (let b = a + 1; b < parts.length; b++) consider([a, b]);
  }
  return best;
}
