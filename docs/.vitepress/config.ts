import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Readable RxJS Operators',
  description: 'A study edition view of rewritten RxJS 7.8.x operators.',
  cleanUrls: true,
  lastUpdated: true,
  markdown: {
    lineNumbers: true,
  },
  themeConfig: {
    search: {
      provider: 'local',
    },
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Operators', link: '/operators/' },
      { text: 'Observables', link: '/observables/' },
      { text: 'Catalog', link: '/operators/catalog' },
      { text: 'Study Notes', link: '/03-operator-study-notes' },
      { text: 'Review Log', link: '/04-semantic-review-log' },
    ],
    sidebar: [
      {
        text: 'Project',
        items: [
          { text: 'Project Plan', link: '/00-project-plan' },
          { text: 'Refactoring Contract', link: '/01-refactoring-contract' },
          { text: 'Operator Review Groups', link: '/02-operator-review-groups' },
          { text: 'Operator Study Notes', link: '/03-operator-study-notes' },
          { text: 'Semantic Review Log', link: '/04-semantic-review-log' },
          { text: 'Observable Review Groups', link: '/05-observable-review-groups' },
        ],
      },
      {
        text: 'Operators',
        items: [
          { text: 'Operator Index', link: '/operators/' },
          { text: 'Generated Catalog', link: '/operators/catalog' },
          { text: '1. Projection And Selection', link: '/operators/01-projection-selection' },
          { text: '2. Boolean And Terminal Selection', link: '/operators/02-boolean-terminal' },
          { text: '3. Accumulation And Collection', link: '/operators/03-accumulation-collection' },
          { text: '4. Distinctness', link: '/operators/04-distinctness' },
          { text: '5. Prefix, Suffix, Take, Skip', link: '/operators/05-take-skip' },
          { text: '6. Notification And Side Effects', link: '/operators/06-notification-side-effects' },
          { text: '7. Error, Retry, Repeat, Timeout', link: '/operators/07-error-retry-timeout' },
          { text: '8. Time And Rate Limiting', link: '/operators/08-time-rate-limiting' },
          { text: '9. Buffer And Window', link: '/operators/09-buffer-window' },
          { text: '10. Higher-Order Flattening', link: '/operators/10-higher-order-flattening' },
          { text: '11. Combination And Join', link: '/operators/11-combination-join' },
          { text: '12. Multicasting And Sharing', link: '/operators/12-multicasting-sharing' },
          { text: '13. Scheduling Boundaries', link: '/operators/13-scheduling-boundaries' },
        ],
      },
      {
        text: 'Observables',
        items: [
          { text: 'Observable Index', link: '/observables/' },
          { text: 'Generated Catalog', link: '/observables/catalog' },
          { text: '1. Creation Basics', link: '/observables/01-creation-basics' },
          { text: '2. Timing And Generation', link: '/observables/02-timing-generation' },
          { text: '3. Events And Callbacks', link: '/observables/03-events-callbacks' },
          { text: '4. Combination And Join', link: '/observables/04-combination-join' },
          { text: '5. Multicasting', link: '/observables/05-multicasting' },
          { text: '6. DOM Integration', link: '/observables/06-dom-integration' },
        ],
      },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/ReactiveX/rxjs' },
    ],
  },
});
