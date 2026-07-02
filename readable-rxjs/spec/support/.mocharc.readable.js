// Mirrors upstream-rxjs/spec/support/.mocharc.js, with one critical change:
// the readable path mappings are required AFTER upstream's mocha-path-mappings.
// Each mapper wraps the previously installed Module._resolveFilename, so the
// last one required runs first — the readable hook must win for 'rxjs',
// 'rxjs/operators', 'rxjs/fetch', 'rxjs/webSocket' and the internal deep paths,
// delegating everything else to upstream's mapper.
//
// (Passing the readable hook via a CLI `--require` flag does NOT work: mocha
// loads CLI requires before config-file requires, so upstream's mapper would
// install last and route every rxjs import back to the upstream tree.)
//
// All relative paths resolve from the upstream-rxjs working directory.
module.exports = {
  require: [
    'ts-node/register',
    'spec/support/mocha-path-mappings.js',
    '../readable-rxjs/spec/support/mocha-readable-path-mappings.js',
    'spec/helpers/setup.ts',
  ],
  ui: ['spec/helpers/testScheduler-ui.ts'],
  reporter: 'dot',
  extensions: ['ts', 'js'],
  timeout: 5000,
  recursive: true,
  'enable-source-maps': true,
  'expose-gc': true,
  // These three upstream tests race real timers (interval(3) against an 8ms
  // Promise) and are flaky under Windows timer granularity — they fail against
  // the unmodified upstream source as well, and a late uncaught assertion
  // aborts the whole mocha run. Excluded here, documented in the review log.
  grep: 'should buffer when Promise resolves|should skip until Promise resolves|should window when Promise resolves',
  invert: true,
};
