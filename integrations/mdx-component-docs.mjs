// @ts-check
/**
 * Editor help for the components that .mdx files use without importing them.
 *
 * With the MDX extension installed, hovering a tag in an .mdx file asks
 * TypeScript what it is. TypeScript only knows the tags listed in a global type
 * called `MDXProvidedComponents`, so this integration writes that type, one
 * entry per auto-imported component:
 *
 *   - its type is the component itself (`typeof import('…/Frases.astro')`),
 *     which the Astro extension resolves, so hovering or completing an
 *     attribute reads the `Props` of the .astro file as it is right now;
 *   - its documentation is put together here from the same file: the comment
 *     at the top, the props with what each one is for, the types they use,
 *     whether it takes content, and a link to the source.
 *
 * So what the hover says is what the component's own comments say. Nothing is
 * written twice: document the component, and its hover follows.
 *
 * The file lands in `.astro/` with Astro's other generated types. It is
 * rewritten by `astro dev`, `build`, `check` and `sync`, and while the dev
 * server runs, every time one of the components is saved.
 */
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const NAME = 'hibi-mdx-components';
const FILE = 'mdx-components.d.ts';

/**
 * @typedef {object} Prop
 * @property {string} name
 * @property {boolean} optional
 * @property {string} type As written in the component, on one line.
 * @property {string} doc
 * @property {string} [fallback] The `@default` of the prop.
 * @property {boolean} [deprecated]
 * @property {Prop[]} members For an object written in place: its documented fields.
 */
/**
 * @typedef {object} Component
 * @property {string} name The tag, taken from the file name.
 * @property {string} file Absolute path of the .astro file.
 * @property {string} doc The comment at the top of the component.
 * @property {string[]} examples Its `@example`s: how the tag is written in MDX.
 * @property {string} tags Its other tags (`@see`, `@deprecated`), as written.
 * @property {Prop[]} props
 * @property {string} [propsType] `Props`, when it is not a plain list of fields.
 * @property {string[]} inherits What `Props` extends.
 * @property {string[]} types Other types of the file that `Props` uses.
 * @property {boolean} content Does it render what is written between its tags?
 * @property {string[]} slots Its named slots.
 */

/**
 * @param {{ components: string[] }} options
 *   `components`: the .astro files, relative to the project root (the same
 *   list that goes to `astro-auto-import`).
 * @returns {import('astro').AstroIntegration}
 */
export default function mdxComponentDocs({ components }) {
  /** @type {string[]} */
  let files = [];
  /** @type {string} */
  let target = '';
  /** @type {string} */
  let root = '';

  /** @param {import('astro').AstroIntegrationLogger} logger */
  function generate(logger) {
    const ts = loadTypeScript();
    if (!ts) logger.warn('typescript is not installed: hovers will not list the props.');
    const found = files.flatMap((file) => {
      if (fs.existsSync(file)) return [readComponent(ts, file)];
      logger.warn(`${path.relative(root, file)} does not exist.`);
      return [];
    });
    return render(found, path.dirname(target), root);
  }

  return {
    name: NAME,
    hooks: {
      'astro:config:done': ({ config, injectTypes, logger }) => {
        root = fileURLToPath(config.root);
        files = components.map((component) => path.resolve(root, component));
        // Where Astro puts a type file injected by an integration with this name.
        // The imports inside the file are written relative to that place.
        target = path.join(root, '.astro', 'integrations', NAME, FILE);
        const written = fileURLToPath(injectTypes({ filename: FILE, content: generate(logger) }));
        if (path.normalize(written) !== path.normalize(target)) {
          logger.warn(`expected ${path.relative(root, target)} but Astro wrote ${path.relative(root, written)}: props will show as "any".`);
          target = written;
        }
      },
      // while the dev server runs: a component is saved, its hover is rewritten
      'astro:server:setup': ({ server, logger }) => {
        const watched = new Set(files.map((file) => path.normalize(file)));
        server.watcher.on('change', (file) => {
          if (!watched.has(path.normalize(file))) return;
          try {
            const next = generate(logger);
            if (fs.existsSync(target) && fs.readFileSync(target, 'utf8') === next) return;
            fs.mkdirSync(path.dirname(target), { recursive: true });
            fs.writeFileSync(target, next);
          } catch (error) {
            logger.warn(`could not rewrite the hover text: ${error instanceof Error ? error.message : error}`);
          }
        });
      },
    },
  };
}

/**
 * TypeScript reads the props. Without it (a production install) the hovers just
 * say less. Loaded with `require`: Astro runs this file through Vite, whose
 * loader is already closed when the hooks run, so an `import()` here would fail.
 *
 * @returns {typeof import('typescript') | undefined}
 */
function loadTypeScript() {
  try {
    return createRequire(import.meta.url)('typescript');
  } catch {
    return undefined;
  }
}

/* ───────────────────────── reading a component ───────────────────────── */

/**
 * @param {typeof import('typescript') | undefined} ts
 * @param {string} file
 * @returns {Component}
 */
function readComponent(ts, file) {
  const source = fs.readFileSync(file, 'utf8');
  // the script between the two `---` fences, then the template
  const fence = /^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/.exec(source);
  const script = fence ? fence[1] : '';
  const template = fence ? source.slice(fence[0].length) : source;

  /** @type {Component} */
  const component = {
    name: path.basename(file, '.astro'),
    file,
    doc: '',
    examples: [],
    tags: '',
    props: [],
    inherits: [],
    types: [],
    content: false,
    slots: [],
  };

  // <slot /> renders what is written between the tags; <slot name="x" /> a named part
  for (const [, attributes] of template.matchAll(/<slot\b([^>]*)>/g)) {
    const named = /\bname\s*=\s*["']([^"']+)["']/.exec(attributes);
    if (!named) component.content = true;
    else if (!component.slots.includes(named[1])) component.slots.push(named[1]);
  }

  // The component's description is the first /** comment that stands before a
  // statement of the script, up to Props (comments further in describe props).
  let comment = /\/\*\*[\s\S]*?\*\//.exec(script)?.[0];
  if (ts) {
    const sourceFile = ts.createSourceFile('component.ts', script, ts.ScriptTarget.Latest, true);
    readProps(ts, sourceFile, component);
    comment = undefined;
    for (const statement of sourceFile.statements) {
      const before = ts.getLeadingCommentRanges(script, statement.getFullStart()) ?? [];
      comment = before.map((range) => script.slice(range.pos, range.end)).find((text) => text.startsWith('/**'));
      const isProps = (ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement)) && statement.name.text === 'Props';
      if (comment || isProps) break;
    }
  }
  if (comment) {
    // the text, then one block per @tag
    /** @type {string[][]} */
    const blocks = [[]];
    let fenced = false;
    for (const line of commentLines(comment)) {
      if (/^\s*(```|~~~)/.test(line)) fenced = !fenced;
      if (!fenced && /^\s*@\w/.test(line)) blocks.push([]);
      blocks[blocks.length - 1].push(line);
    }
    const [text, ...tags] = blocks.map(trimBlankLines);
    component.doc = plainLinks(text.join('\n'));
    /** @type {string[]} */
    const others = [];
    for (const tag of tags) {
      const example = /^\s*@example\b ?(.*)$/.exec(tag[0]);
      if (!example) others.push(...tag);
      else component.examples.push(trimBlankLines([example[1], ...tag.slice(1)]).join('\n'));
    }
    component.tags = others.join('\n');
  }
  return component;
}

/**
 * `{@link Name}` points at a name of the component's own file, which means
 * nothing where the hover text ends up: keep the name, as code. Links to web
 * pages are left alone, editors know what to do with those.
 */
const plainLinks = (/** @type {string} */ text) =>
  text.replace(/\{@link(?:code|plain)?\s+([^}\s|]+)(?:[\s|]+([^}]+))?\}/g, (link, /** @type {string} */ target, /** @type {string | undefined} */ label) =>
    /^https?:/.test(target) ? link : `\`${(label ?? target).trim()}\``,
  );

/** The text of a block comment, line by line, without its asterisks. */
const commentLines = (/** @type {string} */ comment) =>
  comment
    .replace(/^\/\*+/, '')
    .replace(/\*+\/$/, '')
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*\*? ?/, '').trimEnd());

/**
 * Fills in what `Props` says.
 *
 * @param {typeof import('typescript')} ts
 * @param {import('typescript').SourceFile} sourceFile
 * @param {Component} component
 */
function readProps(ts, sourceFile, component) {
  /** @type {Map<string, import('typescript').Statement>} */
  const declared = new Map();
  for (const statement of sourceFile.statements) {
    if (ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement)) declared.set(statement.name.text, statement);
  }
  const props = declared.get('Props');
  if (!props) return;

  /** One line, no comments: how a type is written inside the hover. */
  const oneLine = (/** @type {import('typescript').Node} */ node) =>
    node
      .getText(sourceFile)
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\s+/g, ' ')
      .trim();

  /**
   * @param {import('typescript').NodeArray<import('typescript').TypeElement>} members
   * @returns {Prop[]}
   */
  const readMembers = (members) =>
    members.flatMap((member) => {
      if (!ts.isPropertySignature(member) && !ts.isMethodSignature(member)) return [];
      /** @type {Prop} */
      const prop = {
        name: member.name.getText(sourceFile),
        optional: Boolean(member.questionToken),
        type: ts.isPropertySignature(member) && member.type ? oneLine(member.type) : ts.isMethodSignature(member) ? 'function' : 'any',
        doc: '',
        members: [],
      };
      for (const comment of ts.getJSDocCommentsAndTags(member)) {
        if (!ts.isJSDoc(comment)) continue;
        prop.doc = plainLinks(ts.getTextOfJSDocComment(comment.comment) ?? '');
        for (const tag of comment.tags ?? []) {
          if (tag.tagName.text === 'default') prop.fallback = (ts.getTextOfJSDocComment(tag.comment) ?? '').trim();
          if (tag.tagName.text === 'deprecated') prop.deprecated = true;
        }
      }
      // an object written in place: keep the fields that say what they are
      if (ts.isPropertySignature(member) && member.type && ts.isTypeLiteralNode(member.type)) {
        prop.members = readMembers(member.type.members).filter((field) => field.doc);
      }
      return [prop];
    });

  if (ts.isInterfaceDeclaration(props)) {
    component.props = readMembers(props.members);
    component.inherits = (props.heritageClauses ?? []).flatMap((clause) => clause.types.map(oneLine));
  } else if (ts.isTypeAliasDeclaration(props) && ts.isTypeLiteralNode(props.type)) {
    component.props = readMembers(props.type.members);
  } else if (ts.isTypeAliasDeclaration(props)) {
    component.propsType = oneLine(props.type);
  }

  // the other types of the file that Props mentions, and the ones those mention
  /** @type {string[]} */
  const used = [];
  const collect = (/** @type {import('typescript').Node} */ node) => {
    if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName)) {
      const name = node.typeName.text;
      const declaration = declared.get(name);
      if (declaration && name !== 'Props' && !used.includes(name)) {
        used.push(name);
        collect(declaration);
      }
    }
    ts.forEachChild(node, collect);
  };
  collect(props);
  component.types = [...declared.keys()]
    .filter((name) => used.includes(name))
    .map((name) => lineComments(declared.get(name)?.getText(sourceFile) ?? ''));
}

/** Block comments rewritten as `//` lines: the hover text is itself inside a block comment. */
const lineComments = (/** @type {string} */ text) =>
  text.replace(/([ \t]*)\/\*[\s\S]*?\*\//g, (comment, /** @type {string} */ indent) =>
    commentLines(comment.trimStart())
      .filter(Boolean)
      .map((line) => `${indent}// ${line}`)
      .join('\n'),
  );

/** @param {string[]} lines */
function trimBlankLines(lines) {
  let start = 0;
  let end = lines.length;
  while (start < end && !lines[start].trim()) start++;
  while (end > start && !lines[end - 1].trim()) end--;
  return lines.slice(start, end);
}

/* ───────────────────────── writing the type file ───────────────────────── */

/** A piece of code inside Markdown. */
const code = (/** @type {string} */ text) => (text.includes('`') ? `\`\` ${text} \`\`` : `\`${text}\``);

/**
 * One prop as a list item, written the way a parameter is:
 * `name?: type = default` (required). What it is for.
 *
 * @param {Prop} prop
 * @param {string} indent
 * @returns {string[]}
 */
function propLines(prop, indent) {
  const [first = '', ...rest] = prop.doc.split('\n');
  const signature = `${prop.name}${prop.optional ? '?' : ''}: ${prop.type}${prop.fallback ? ` = ${prop.fallback}` : ''}`;
  const head =
    `${indent}- ${code(signature)}` +
    (prop.optional ? '' : ' (required)') +
    (prop.deprecated ? ' (deprecated)' : '') +
    (first ? `. ${first}` : '');
  return [
    head,
    ...rest.map((line) => (line ? `${indent}  ${line}` : '')),
    ...prop.members.flatMap((member) => propLines(member, `${indent}  `)),
  ];
}

/**
 * What the hover of a component says, in Markdown.
 *
 * @param {Component} component
 * @param {string} root
 */
function hoverText(component, root) {
  // A hover shows a dozen lines before it has to be scrolled, so what a writer
  // needs comes first: what the component is, its props, how it is written.
  // The rest of its description follows.
  const [summary = '', ...details] = component.doc.split(/\n\s*\n/);
  /** @type {string[][]} */
  const blocks = [];
  if (summary) blocks.push(summary.split('\n'));

  const props = component.props.flatMap((prop) => propLines(prop, ''));
  if (component.propsType) props.push(`- ${code(component.propsType)}`);
  for (const parent of component.inherits) props.push(`- and everything in ${code(parent)}`);
  blocks.push(props.length ? ['**Props**', '', ...props] : ['**Props**: none.']);

  if (component.types.length) blocks.push(['```ts', ...component.types.join('\n\n').split('\n'), '```']);

  /** @type {string[]} */
  const takes = [];
  if (component.content) takes.push('**Content**: what is written between its opening and closing tags (Markdown works).');
  if (component.slots.length) takes.push(`**Named slots**: ${component.slots.map(code).join(', ')}.`);
  if (!component.content && !component.slots.length) takes.push('**Content**: none, close the tag with `/>`.');
  blocks.push(takes);

  for (const example of component.examples) {
    const lines = example.split('\n');
    blocks.push(['**Example**', '', ...(/^\s*(```|~~~)/.test(lines[0]) ? lines : ['```mdx', ...lines, '```'])]);
  }

  for (const paragraph of details) blocks.push(paragraph.split('\n'));

  const relative = path.relative(root, component.file).split(path.sep).join('/');
  blocks.push([`Source: [${relative}](${pathToFileURL(component.file).href})`]);

  if (component.tags) blocks.push(component.tags.split('\n'));
  return blocks.flatMap((block, index) => (index ? ['', ...block] : block));
}

/**
 * @param {Component[]} found
 * @param {string} from The folder the file is written to.
 * @param {string} root
 */
function render(found, from, root) {
  const entries = found.map((component) => {
    let specifier = path.relative(from, component.file).split(path.sep).join('/');
    if (!specifier.startsWith('.')) specifier = `./${specifier}`;
    // inside a comment, a comment's end has to be defused
    const text = hoverText(component, root).map((line) => `     * ${line.replaceAll('*/', '*\\/')}`.trimEnd());
    return ['    /**', ...text, '     */', `    ${component.name}: typeof import(${JSON.stringify(specifier)}).default;`].join('\n');
  });
  return [
    '// Written by integrations/mdx-component-docs.mjs from the comments of the components',
    '// that .mdx files use without importing them (AUTO_IMPORTED_COMPONENTS in',
    '// astro.config.mjs). Do not edit: it is rewritten by `astro dev`, `build`, `check`',
    '// and `sync`. To change what a hover says, change the comments in the component.',
    'declare global {',
    '  /** The components every .mdx file can use without importing them. */',
    '  type MDXProvidedComponents = {',
    entries.join('\n'),
    '  };',
    '}',
    'export {};',
    '',
  ].join('\n');
}
