const { join } = require('path');

const root = join(__dirname, '../../..');
const readableRoot = join(root, 'readable-rxjs/src/operators');

const mod = require('module');
const originalResolveFilename = mod._resolveFilename;

mod._resolveFilename = function (path, ...rest) {
  if (path === 'rxjs/operators') {
    return originalResolveFilename.call(this, join(readableRoot, 'index'), ...rest);
  }

  const internalOperatorMatch = path.match(/^rxjs\/internal\/operators\/(.+)$/);
  if (internalOperatorMatch) {
    return originalResolveFilename.call(this, join(readableRoot, internalOperatorMatch[1]), ...rest);
  }

  return originalResolveFilename.call(this, path, ...rest);
};
