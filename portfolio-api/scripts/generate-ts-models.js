const fs = require('fs');
const path = require('path');

// Scan both model and controller packages
const modelDir = path.join(__dirname, '../src/main/java/com/pm/portfolioapi/model');
const controllerDir = path.join(__dirname, '../src/main/java/com/pm/portfolioapi/controller');
const outputFile = path.join(__dirname, '../../frontendclient/src/app/models/api-models.ts');

// Define the mapping from Java types to TypeScript types
const javaToTsTypeMap = {
    'String': 'string',
    'boolean': 'boolean',
    'Boolean': 'boolean',
    'int': 'number',
    'Integer': 'number',
    'long': 'number',
    'Long': 'number',
    'double': 'number',
    'Double': 'number',
    'float': 'number',
    'Float': 'number',
    'short': 'number',
    'Short': 'number',
    'byte': 'number',
    'Byte': 'number',
    'BigDecimal': 'number',
    'LocalDate': 'string',
    'LocalDateTime': 'string',
    'OffsetDateTime': 'string',
    'Instant': 'string',
};

function readJavaSources(dirs) {
  const sources = [];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      console.log(`[generate-ts-models] Directory not found, skipping: ${dir}`);
      continue;
    }
    const javaFiles = fs.readdirSync(dir).filter(f => f.endsWith('.java')).sort();
    for (const file of javaFiles) {
      sources.push({
        file,
        path: path.join(dir, file),
        content: fs.readFileSync(path.join(dir, file), 'utf8'),
        directory: path.basename(dir)
      });
    }
  }
  return sources;
}

function parseEnums(sources) {
  const enums = new Map();
  for (const { content, file } of sources) {
    const enumMatches = content.matchAll(/\benum\s+([A-Za-z_][A-Za-z0-9_]*)\s*\{([\s\S]*?)\}/g);
    for (const match of enumMatches) {
      const name = match[1];
      const body = (match[2] || '').split(';')[0];
      const rawItems = body.split(',').map(x => x.trim()).filter(Boolean);
      const constants = rawItems.map(x => x.split(/\s|\(/)[0]).filter(Boolean);
      if (constants.length > 0) {
        enums.set(name, constants);
        console.log(`[generate-ts-models] Found enum: ${name} with values: ${constants.join(', ')}`);
      }
    }
  }
  return enums;
}

function parseInnerClasses(content) {
  const innerClasses = [];
  // Match public static class declarations
  const innerClassMatches = content.matchAll(/public\s+static\s+class\s+([A-Za-z_][A-Za-z0-9_]*)\s*\{([\s\S]*?)\n\s*\}/g);

  for (const match of innerClassMatches) {
    const className = match[1];
    const classBody = match[2];

    // Parse fields from the inner class
    const fields = parseJavaFields(classBody, new Map(), new Set());
    innerClasses.push({ name: className, fields });
  }

  return innerClasses;
}

function parseClasses(sources) {
  const classes = new Map(); // className -> { fields, isInnerClass }

  for (const { file, content, directory } of sources) {
    // Skip enum-only files
    if (/^\s*public\s+enum\s+/.test(content) && !/\bclass\s+/.test(content)) continue;

    // Parse main class/record
    const mainClassMatch = content.match(/\bclass\s+([A-Za-z_][A-Za-z0-9_]*)\b/) ||
                          content.match(/\brecord\s+([A-Za-z_][A-Za-z0-9_]*)\b/);

    if (mainClassMatch) {
      const className = mainClassMatch[1];
      const fields = parseJavaFields(content, new Map(), new Set());
      classes.set(className, { fields, isInnerClass: false });
      console.log(`[generate-ts-models] Found ${directory} class: ${className}`);
    }

    // Parse inner classes (DTOs in controllers)
    const innerClasses = parseInnerClasses(content);
    for (const innerClass of innerClasses) {
      classes.set(innerClass.name, { fields: innerClass.fields, isInnerClass: true });
      console.log(`[generate-ts-models] Found inner class: ${innerClass.name}`);
    }
  }

  return classes;
}

function simpleName(javaType) {
  const noArray = javaType.replace(/\[\]$/, '');
  const inner = noArray.replace(/^.*[.<]\s*([^>.]+)\s*>?$/, (m, g1) => g1)
                       .replace(/^.*\./, '');
  return inner;
}

function mapJavaTypeToTs(javaType, knownEnums, knownClasses) {
  const t = javaType.trim();

  // List<T> or Set<T>
  const listMatch = t.match(/\b(?:List|Set)<\s*([^>]+)\s*>/);
  if (listMatch) {
    const innerJava = listMatch[1].trim();
    const innerSimple = simpleName(innerJava);
    if (javaToTsTypeMap[innerSimple]) return `${javaToTsTypeMap[innerSimple]}[]`;
    if (knownEnums.has(innerSimple) || knownClasses.has(innerSimple)) return `${innerSimple}[]`;
    return 'string[]';
  }

  // Map<K,V> -> Record<string, V>
  const mapMatch = t.match(/\bMap<\s*([^,>]+)\s*,\s*([^>]+)\s*>/);
  if (mapMatch) {
    const vInner = simpleName(mapMatch[2].trim());
    const vTs = javaToTsTypeMap[vInner] || (knownEnums.has(vInner) || knownClasses.has(vInner) ? vInner : 'string');
    return `Record<string, ${vTs}>`;
  }

  // Array types T[]
  const arrayMatch = t.match(/^(.+)\[\]$/);
  if (arrayMatch) {
    const inner = simpleName(arrayMatch[1].trim());
    const baseTs = javaToTsTypeMap[inner] || (knownEnums.has(inner) || knownClasses.has(inner) ? inner : 'string');
    return `${baseTs}[]`;
  }

  // Direct mappings
  if (javaToTsTypeMap[t]) return javaToTsTypeMap[t];

  // Fully qualified -> simple
  const sn = simpleName(t);
  if (javaToTsTypeMap[sn]) return javaToTsTypeMap[sn];
  if (knownEnums.has(sn) || knownClasses.has(sn)) return sn;

  return 'string';
}

function parseJavaFields(javaContent, knownEnums, knownClasses) {
  const fields = [];
  const fieldRegex = /private\s+([A-Za-z0-9_$.<>\[\]]+)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*;/g;
  let m;
  while ((m = fieldRegex.exec(javaContent)) !== null) {
    const javaType = m[1].trim();
    const name = m[2].trim();
    const tsType = mapJavaTypeToTs(javaType, knownEnums, knownClasses);
    fields.push({ name, type: tsType });
  }
  return fields;
}

function generate() {
  console.log('[generate-ts-models] Scanning Java sources...');
  console.log('[generate-ts-models] Model dir:', modelDir);
  console.log('[generate-ts-models] Controller dir:', controllerDir);

  const sources = readJavaSources([modelDir, controllerDir]);
  if (sources.length === 0) {
    console.warn('[generate-ts-models] No Java files found');
    return;
  }

  const enums = parseEnums(sources);
  const classes = parseClasses(sources);

  let ts = '';
  ts += '// Auto-generated from Java models and DTOs. Do not edit.\n\n';

  // Emit enums first as union types
  for (const [name, values] of enums.entries()) {
    const union = values.map(v => `'${v}'`).join(' | ');
    ts += `export type ${name} = ${union};\n\n`;
  }

  // Emit interfaces for all classes
  for (const [className, { fields }] of classes.entries()) {
    ts += `export interface ${className} {\n`;
    for (const f of fields) {
      ts += `  ${f.name}: ${f.type};\n`;
    }
    ts += '}\n\n';
  }

  const outDir = path.dirname(outputFile);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outputFile, ts.trim() + '\n');

  console.log('[generate-ts-models] Generated:', outputFile);
  console.log('[generate-ts-models] Generated interfaces for:', Array.from(classes.keys()).join(', '));
  if (enums.size > 0) {
    console.log('[generate-ts-models] Generated enums for:', Array.from(enums.keys()).join(', '));
  }
}

// Run the generator
try {
  generate();
} catch (error) {
  console.error('[generate-ts-models] Error:', error.message);
  process.exit(1);
}
