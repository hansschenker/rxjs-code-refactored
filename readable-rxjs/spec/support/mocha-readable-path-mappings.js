const { join } = require('path');

const root = join(__dirname, '../../..');
const readableSrc = join(root, 'readable-rxjs/src');

// Entry points that resolve directly to a readable index module.
const entryPoints = {
  rxjs: join(readableSrc, 'index'),
  'rxjs/operators': join(readableSrc, 'operators/index'),
  'rxjs/fetch': join(readableSrc, 'fetch/index'),
  'rxjs/webSocket': join(readableSrc, 'webSocket/index'),
};

// Deep internal imports that resolve into a readable source directory.
const internalDirs = [
  { pattern: /^rxjs\/internal\/operators\/(.+)$/, dir: join(readableSrc, 'operators') },
  { pattern: /^rxjs\/internal\/observable\/(.+)$/, dir: join(readableSrc, 'observable') },
  { pattern: /^rxjs\/internal\/scheduler\/(.+)$/, dir: join(readableSrc, 'scheduler') },
];

const mod = require('module');
const originalResolveFilename = mod._resolveFilename;

mod._resolveFilename = function (path, ...rest) {
  if (entryPoints[path]) {
    return originalResolveFilename.call(this, entryPoints[path], ...rest);
  }

  for (const { pattern, dir } of internalDirs) {
    const match = path.match(pattern);
    if (match) {
      return originalResolveFilename.call(this, join(dir, match[1]), ...rest);
    }
  }

  return originalResolveFilename.call(this, path, ...rest);
};
