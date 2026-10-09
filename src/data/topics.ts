/**
 * The tags of the short Japanese notes (src/content/japones/*.mdx, field
 * `topic` in the header). The filter chips and the tag pages read this list.
 */
export interface Topic {
  slug: string;
  label: string;
  ja: string;
  /** One line under the title. */
  description: string;
  /** CSS colour (custom property) of the topic. */
  color: string;
}

export const topics: Topic[] = [
  { slug: 'particulas', label: 'Partículas', ja: '助詞', description: 'は, が, を, に, で: una a la vez, con ejemplos cortos.', color: 'var(--stamp)' },
  { slug: 'kanji', label: 'Kanji', ja: '漢字', description: 'Caracteres con su historia, sus partes y sus palabras.', color: 'var(--green)' },
  { slug: 'palabras', label: 'Palabras', ja: '単語', description: 'Una palabra por entrada: de dónde viene y cómo se usa.', color: 'var(--brown)' },
  { slug: 'keigo', label: 'Cortesía', ja: '敬語', description: 'Cómo hablar con respeto en el trabajo, las tiendas y las oficinas.', color: 'var(--purple)' },
];

export const topicBySlug = (slug?: string) => topics.find((t) => t.slug === slug);
