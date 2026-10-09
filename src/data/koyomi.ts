/**
 * 暦 (koyomi), the old Japanese almanac. The year is cut into 24 solar terms
 * (二十四節気), each into three micro-seasons of about five days (七十二候), and
 * every one has a small poem of a name. The site shows the one Japan is in now.
 * Start dates drift by a day from year to year; these are the usual ones.
 */
export interface Sekki { name: string; kana: string; romaji: string; es: string }
export interface Ko {
  index: number;
  start: [number, number];
  name: string;
  kana: string;
  es: string;
  sekki: Sekki;
  season: 'spring' | 'summer' | 'autumn' | 'winter';
}

const SEKKI: Sekki[] = [
  { name: '立春', kana: 'りっしゅん', romaji: 'Risshun', es: 'Inicio de la primavera' },
  { name: '雨水', kana: 'うすい', romaji: 'Usui', es: 'Agua de lluvia' },
  { name: '啓蟄', kana: 'けいちつ', romaji: 'Keichitsu', es: 'Despertar de los insectos' },
  { name: '春分', kana: 'しゅんぶん', romaji: 'Shunbun', es: 'Equinoccio de primavera' },
  { name: '清明', kana: 'せいめい', romaji: 'Seimei', es: 'Claro y puro' },
  { name: '穀雨', kana: 'こくう', romaji: 'Kokuu', es: 'Lluvia de grano' },
  { name: '立夏', kana: 'りっか', romaji: 'Rikka', es: 'Inicio del verano' },
  { name: '小満', kana: 'しょうまん', romaji: 'Shōman', es: 'Pequeña plenitud' },
  { name: '芒種', kana: 'ぼうしゅ', romaji: 'Bōshu', es: 'Grano en espiga' },
  { name: '夏至', kana: 'げし', romaji: 'Geshi', es: 'Solsticio de verano' },
  { name: '小暑', kana: 'しょうしょ', romaji: 'Shōsho', es: 'Calor menor' },
  { name: '大暑', kana: 'たいしょ', romaji: 'Taisho', es: 'Gran calor' },
  { name: '立秋', kana: 'りっしゅう', romaji: 'Risshū', es: 'Inicio del otoño' },
  { name: '処暑', kana: 'しょしょ', romaji: 'Shosho', es: 'Fin del calor' },
  { name: '白露', kana: 'はくろ', romaji: 'Hakuro', es: 'Rocío blanco' },
  { name: '秋分', kana: 'しゅうぶん', romaji: 'Shūbun', es: 'Equinoccio de otoño' },
  { name: '寒露', kana: 'かんろ', romaji: 'Kanro', es: 'Rocío frío' },
  { name: '霜降', kana: 'そうこう', romaji: 'Sōkō', es: 'Cae la escarcha' },
  { name: '立冬', kana: 'りっとう', romaji: 'Rittō', es: 'Inicio del invierno' },
  { name: '小雪', kana: 'しょうせつ', romaji: 'Shōsetsu', es: 'Nieve menor' },
  { name: '大雪', kana: 'たいせつ', romaji: 'Taisetsu', es: 'Gran nieve' },
  { name: '冬至', kana: 'とうじ', romaji: 'Tōji', es: 'Solsticio de invierno' },
  { name: '小寒', kana: 'しょうかん', romaji: 'Shōkan', es: 'Frío menor' },
  { name: '大寒', kana: 'だいかん', romaji: 'Daikan', es: 'Gran frío' },
];

// [month, day, name, reading, Spanish]
const KO: Array<[number, number, string, string, string]> = [
  [2, 4, '東風解凍', 'はるかぜこおりをとく', 'Sopla el viento del este y funde el hielo'],
  [2, 9, '黄鶯睍睆', 'うぐいすなく', 'Canta el ruiseñor en la montaña'],
  [2, 14, '魚上氷', 'うおこおりをいずる', 'Los peces asoman entre el hielo'],
  [2, 19, '土脉潤起', 'つちのしょううるおいおこる', 'La lluvia humedece la tierra'],
  [2, 24, '霞始靆', 'かすみはじめてたなびく', 'La bruma empieza a flotar'],
  [3, 1, '草木萌動', 'そうもくめばえいずる', 'Brotan la hierba y los árboles'],
  [3, 6, '蟄虫啓戸', 'すごもりむしとをひらく', 'Los insectos salen de su letargo'],
  [3, 11, '桃始笑', 'ももはじめてさく', 'Florecen los primeros melocotoneros'],
  [3, 16, '菜虫化蝶', 'なむしちょうとなる', 'Las orugas se vuelven mariposas'],
  [3, 21, '雀始巣', 'すずめはじめてすくう', 'Los gorriones empiezan a anidar'],
  [3, 26, '桜始開', 'さくらはじめてひらく', 'Se abren los primeros cerezos'],
  [3, 31, '雷乃発声', 'かみなりすなわちこえをはっす', 'Truena a lo lejos'],
  [4, 5, '玄鳥至', 'つばめきたる', 'Vuelven las golondrinas'],
  [4, 10, '鴻雁北', 'こうがんかえる', 'Los gansos salvajes parten al norte'],
  [4, 15, '虹始見', 'にじはじめてあらわる', 'Se ven los primeros arcoíris'],
  [4, 20, '葭始生', 'あしはじめてしょうず', 'Brotan los primeros juncos'],
  [4, 25, '霜止出苗', 'しもやみてなえいずる', 'Cesa la escarcha y crece el arroz'],
  [4, 30, '牡丹華', 'ぼたんはなさく', 'Florecen las peonías'],
  [5, 5, '蛙始鳴', 'かわずはじめてなく', 'Empiezan a croar las ranas'],
  [5, 10, '蚯蚓出', 'みみずいずる', 'Asoman las lombrices'],
  [5, 15, '竹笋生', 'たけのこしょうず', 'Brotan los retoños de bambú'],
  [5, 21, '蚕起食桑', 'かいこおきてくわをはむ', 'Los gusanos de seda devoran la morera'],
  [5, 26, '紅花栄', 'べにばなさかう', 'Florece el cártamo'],
  [5, 31, '麦秋至', 'むぎのときいたる', 'Madura el trigo'],
  [6, 6, '蟷螂生', 'かまきりしょうず', 'Nacen las mantis'],
  [6, 11, '腐草為螢', 'くされたるくさほたるとなる', 'La hierba podrida se vuelve luciérnagas'],
  [6, 16, '梅子黄', 'うめのみきばむ', 'Amarillean las ciruelas'],
  [6, 21, '乃東枯', 'なつかれくさかるる', 'Se marchita la prunela'],
  [6, 27, '菖蒲華', 'あやめはなさく', 'Florecen los lirios'],
  [7, 2, '半夏生', 'はんげしょうず', 'Brota la pinelia'],
  [7, 7, '温風至', 'あつかぜいたる', 'Sopla el viento cálido'],
  [7, 12, '蓮始開', 'はすはじめてひらく', 'Se abren los primeros lotos'],
  [7, 17, '鷹乃学習', 'たかすなわちわざをならう', 'Los halcones aprenden a volar'],
  [7, 23, '桐始結花', 'きりはじめてはなをむすぶ', 'La paulonia da sus frutos'],
  [7, 29, '土潤溽暑', 'つちうるおうてむしあつし', 'La tierra está húmeda y el aire bochornoso'],
  [8, 3, '大雨時行', 'たいうときどきふる', 'A ratos cae una gran lluvia'],
  [8, 8, '涼風至', 'すずかぜいたる', 'Sopla un viento fresco'],
  [8, 13, '寒蝉鳴', 'ひぐらしなく', 'Cantan las cigarras del atardecer'],
  [8, 18, '蒙霧升降', 'ふかききりまとう', 'Desciende una niebla espesa'],
  [8, 23, '綿柎開', 'わたのはなしべひらく', 'Se abren las flores del algodón'],
  [8, 28, '天地始粛', 'てんちはじめてさむし', 'El calor empieza a ceder'],
  [9, 2, '禾乃登', 'こくものすなわちみのる', 'Madura el arroz'],
  [9, 8, '草露白', 'くさのつゆしろし', 'El rocío brilla blanco en la hierba'],
  [9, 13, '鶺鴒鳴', 'せきれいなく', 'Cantan las lavanderas'],
  [9, 18, '玄鳥去', 'つばめさる', 'Se van las golondrinas'],
  [9, 23, '雷乃収声', 'かみなりすなわちこえをおさむ', 'Calla el trueno'],
  [9, 28, '蟄虫坏戸', 'むしかくれてとをふさぐ', 'Los insectos se esconden bajo tierra'],
  [10, 3, '水始涸', 'みずはじめてかるる', 'Se drenan los arrozales'],
  [10, 8, '鴻雁来', 'こうがんきたる', 'Llegan los gansos salvajes'],
  [10, 13, '菊花開', 'きくのはなひらく', 'Florecen los crisantemos'],
  [10, 18, '蟋蟀在戸', 'きりぎりすとにあり', 'Los grillos cantan junto a la puerta'],
  [10, 23, '霜始降', 'しもはじめてふる', 'Cae la primera escarcha'],
  [10, 28, '霎時施', 'こさめときどきふる', 'A ratos llovizna'],
  [11, 2, '楓蔦黄', 'もみじつたきばむ', 'Amarillean el arce y la hiedra'],
  [11, 7, '山茶始開', 'つばきはじめてひらく', 'Florecen las camelias'],
  [11, 12, '地始凍', 'ちはじめてこおる', 'La tierra empieza a helarse'],
  [11, 17, '金盞香', 'きんせんかさく', 'Florecen los narcisos'],
  [11, 22, '虹蔵不見', 'にじかくれてみえず', 'El arcoíris se esconde'],
  [11, 27, '朔風払葉', 'きたかぜこのはをはらう', 'El viento del norte barre las hojas'],
  [12, 2, '橘始黄', 'たちばなはじめてきばむ', 'El tachibana empieza a amarillear'],
  [12, 7, '閉塞成冬', 'そらさむくふゆとなる', 'El frío se asienta y llega el invierno'],
  [12, 12, '熊蟄穴', 'くまあなにこもる', 'Los osos se retiran a su guarida'],
  [12, 17, '鱖魚群', 'さけのうおむらがる', 'Los salmones remontan el río'],
  [12, 22, '乃東生', 'なつかれくさしょうず', 'Brota la prunela'],
  [12, 27, '麋角解', 'さわしかのつのおつる', 'Los ciervos mudan la cornamenta'],
  [1, 1, '雪下出麦', 'ゆきわたりてむぎのびる', 'El trigo brota bajo la nieve'],
  [1, 5, '芹乃栄', 'せりすなわちさかう', 'Prospera el perejil japonés'],
  [1, 10, '水泉動', 'しみずあたたかをふくむ', 'Los manantiales se deshielan'],
  [1, 15, '雉始雊', 'きじはじめてなく', 'Los faisanes empiezan a llamar'],
  [1, 20, '款冬華', 'ふきのはなさく', 'Brota la petasita'],
  [1, 25, '水沢腹堅', 'さわみずこおりつめる', 'El hielo se espesa en los arroyos'],
  [1, 30, '鶏始乳', 'にわとりはじめてとやにつく', 'Las gallinas empiezan a poner'],
];

const SEASONS = ['spring', 'summer', 'autumn', 'winter'] as const;
const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

const toKo = (i: number): Ko => {
  const [month, day, name, kana, es] = KO[i];
  const sekki = Math.floor(i / 3);
  return { index: i + 1, start: [month, day], name, kana, es, sekki: SEKKI[sekki], season: SEASONS[Math.floor(sekki / 6)] };
};

/** The current date and time in Japan, wherever the reader is. */
export function japanNow(at: Date = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Tokyo', year: 'numeric', month: 'numeric', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(at).map((p) => [p.type, p.value]),
  );
  const year = Number(parts.year);
  const month = Number(parts.month);
  const day = Number(parts.day);
  const era = new Intl.DateTimeFormat('ja-JP-u-ca-japanese', { timeZone: 'Asia/Tokyo', era: 'long', year: 'numeric' }).format(at);
  return {
    year, month, day, era,
    weekday: WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()],
    time: `${parts.hour}:${parts.minute}`,
    date: `${year}.${String(month).padStart(2, '0')}.${String(day).padStart(2, '0')}`,
  };
}

/** The micro-season a given moment falls in, in Japan. */
export function currentKo(at: Date = new Date()): Ko {
  const { month, day } = japanNow(at);
  const today = month * 100 + day;
  let best = 0;
  let bestKey = -1;
  KO.forEach(([m, d], i) => {
    const key = m * 100 + d;
    if (key <= today && key > bestKey) { best = i; bestKey = key; }
  });
  return toKo(best);
}

/** "8 al 12 oct", or "28 sep al 2 oct" when the microseason crosses a month. */
export function koRange(ko: Ko): string {
  const next = KO[ko.index % 72];
  const end = new Date(Date.UTC(2001, next[0] - 1, next[1] - 1));
  const [m, d] = ko.start;
  const em = end.getUTCMonth() + 1;
  return m === em ? `${d} al ${end.getUTCDate()} ${MONTHS[m - 1]}` : `${d} ${MONTHS[m - 1]} al ${end.getUTCDate()} ${MONTHS[em - 1]}`;
}
