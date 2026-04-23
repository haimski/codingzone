import type { Topic } from '@/types'

export const CURRICULUM: Topic[] = [
  // ─── Phase 0 ───────────────────────────────────────────────────────────────
  { id: 'p0-js-es6',       phase: 0, section: 'JavaScript Foundations', title: 'ES6+ syntax: destructuring, spread, template literals', interviewWeight: 'high',      estimatedHours: 4 },
  { id: 'p0-js-closures',  phase: 0, section: 'JavaScript Foundations', title: 'Closures and lexical scope',                           interviewWeight: 'very-high', estimatedHours: 5 },
  { id: 'p0-js-arrays',    phase: 0, section: 'JavaScript Foundations', title: 'Array extras: map, filter, reduce, flat, flatMap',     interviewWeight: 'high',      estimatedHours: 4 },
  { id: 'p0-js-async',     phase: 0, section: 'JavaScript Foundations', title: 'AJAX, Promises, async/await, error handling',          interviewWeight: 'very-high', estimatedHours: 6 },
  { id: 'p0-js-eventloop', phase: 0, section: 'JavaScript Foundations', title: 'Event loop, call stack, microtask/macrotask queues',   interviewWeight: 'very-high', estimatedHours: 4 },
  { id: 'p0-js-modules',   phase: 0, section: 'JavaScript Foundations', title: 'ES Modules: import/export, default vs named',          interviewWeight: 'medium',    estimatedHours: 2 },
  { id: 'p0-js-proto',     phase: 0, section: 'JavaScript Foundations', title: 'Prototypes, prototype chain, this binding',            interviewWeight: 'high',      estimatedHours: 4 },
  { id: 'p0-css-flex',     phase: 0, section: 'CSS Foundations',        title: 'Flexbox — all container and item properties',          interviewWeight: 'high',      estimatedHours: 4 },
  { id: 'p0-css-grid',     phase: 0, section: 'CSS Foundations',        title: 'CSS Grid — template, areas, auto-fill, minmax',        interviewWeight: 'high',      estimatedHours: 4 },
  { id: 'p0-css-resp',     phase: 0, section: 'CSS Foundations',        title: 'Responsive design, media queries, mobile-first',       interviewWeight: 'high',      estimatedHours: 3 },
  { id: 'p0-css-anim',     phase: 0, section: 'CSS Foundations',        title: 'CSS animations, transitions, custom properties',       interviewWeight: 'medium',    estimatedHours: 3 },
  { id: 'p0-css-arch',     phase: 0, section: 'CSS Foundations',        title: 'CSS architecture: BEM methodology, SCSS basics',       interviewWeight: 'medium',    estimatedHours: 3 },

  // ─── Phase 1 ───────────────────────────────────────────────────────────────
  { id: 'p1-react-mvc',    phase: 1, section: 'React Foundations',      title: 'MVC architecture, React API, JSX deep dive',           interviewWeight: 'very-high', estimatedHours: 6 },
  { id: 'p1-react-vdom',   phase: 1, section: 'React Foundations',      title: 'Virtual DOM, reconciliation, rendering',               interviewWeight: 'very-high', estimatedHours: 5 },
  { id: 'p1-react-props',  phase: 1, section: 'React Foundations',      title: 'Props, validations, one-way data flow',                interviewWeight: 'high',      estimatedHours: 4 },
  { id: 'p1-hooks-state',  phase: 1, section: 'Hooks In Depth',         title: 'useState — immutability, batching, functional updates', interviewWeight: 'very-high', estimatedHours: 4 },
  { id: 'p1-hooks-effect', phase: 1, section: 'Hooks In Depth',         title: 'useEffect — dependencies, cleanup, stale closures',    interviewWeight: 'very-high', estimatedHours: 6 },
  { id: 'p1-hooks-ref',    phase: 1, section: 'Hooks In Depth',         title: 'useRef, useMemo, useCallback, useContext',             interviewWeight: 'high',      estimatedHours: 5 },
  { id: 'p1-hooks-custom', phase: 1, section: 'Hooks In Depth',         title: 'Custom hooks — useFetch, useDebounce, useLocalStorage', interviewWeight: 'high',     estimatedHours: 5 },
  { id: 'p1-hooks-reducer',phase: 1, section: 'Hooks In Depth',         title: 'useReducer — complex state, dispatch pattern',         interviewWeight: 'high',      estimatedHours: 4 },
  { id: 'p1-patterns',     phase: 1, section: 'Component Patterns',     title: 'Compound components, HOCs, render props, composition', interviewWeight: 'high',      estimatedHours: 5 },
  { id: 'p1-lifecycle',    phase: 1, section: 'Component Patterns',     title: 'Lifecycle, error boundaries, React DevTools',          interviewWeight: 'high',      estimatedHours: 4 },
  { id: 'p1-router',       phase: 1, section: 'Routing & PWA',          title: 'React Router v6: nested routes, guards, useNavigate',  interviewWeight: 'high',      estimatedHours: 5 },
  { id: 'p1-pwa',          phase: 1, section: 'Routing & PWA',          title: 'PWAs: service worker, manifest, offline support',      interviewWeight: 'medium',    estimatedHours: 4 },
  { id: 'p1-redux',        phase: 1, section: 'State Management',       title: 'Redux Toolkit: slices, thunks, selectors',             interviewWeight: 'very-high', estimatedHours: 8 },
  { id: 'p1-rquery',       phase: 1, section: 'State Management',       title: 'React Query: useQuery, useMutation, cache invalidation',interviewWeight: 'very-high', estimatedHours: 6 },
  { id: 'p1-zustand',      phase: 1, section: 'State Management',       title: 'Zustand — lightweight global state',                   interviewWeight: 'medium',    estimatedHours: 3 },
  { id: 'p1-perf',         phase: 1, section: 'Advanced React',         title: 'Code splitting, lazy loading, React.memo',             interviewWeight: 'high',      estimatedHours: 5 },
  { id: 'p1-concurrent',   phase: 1, section: 'Advanced React',         title: 'Concurrent features: useTransition, useDeferredValue', interviewWeight: 'high',      estimatedHours: 4 },
  { id: 'p1-ts',           phase: 1, section: 'TypeScript with React',  title: 'Typing components, hooks, props, API responses',       interviewWeight: 'very-high', estimatedHours: 8 },
  { id: 'p1-testing',      phase: 1, section: 'Testing',                title: 'Jest + React Testing Library, renderHook, coverage',   interviewWeight: 'high',      estimatedHours: 8 },
  { id: 'p1-tooling',      phase: 1, section: 'Tooling & System Design',title: 'Vite, ESLint, Prettier, CI/CD basics, Git workflow',   interviewWeight: 'medium',    estimatedHours: 4 },
  { id: 'p1-sysdesign',    phase: 1, section: 'Tooling & System Design',title: 'Frontend system design: a11y, performance, design systems', interviewWeight: 'high', estimatedHours: 6 },

  // ─── Phase 2 ───────────────────────────────────────────────────────────────
  { id: 'p2-node-core',    phase: 2, section: 'Node.js Core',           title: 'Event loop phases, non-blocking I/O, streams, modules', interviewWeight: 'very-high', estimatedHours: 8 },
  { id: 'p2-node-async',   phase: 2, section: 'Node.js Core',           title: 'Async patterns: callbacks, promises, async/await',     interviewWeight: 'very-high', estimatedHours: 5 },
  { id: 'p2-express',      phase: 2, section: 'REST APIs with Express', title: 'Express middleware, routing, error handling',          interviewWeight: 'very-high', estimatedHours: 6 },
  { id: 'p2-rest',         phase: 2, section: 'REST APIs with Express', title: 'REST API design, versioning, status codes, pagination', interviewWeight: 'high',     estimatedHours: 5 },
  { id: 'p2-auth',         phase: 2, section: 'REST APIs with Express', title: 'JWT auth, bcrypt, refresh tokens, RBAC',               interviewWeight: 'very-high', estimatedHours: 8 },
  { id: 'p2-postman',      phase: 2, section: 'REST APIs with Express', title: 'Postman: collections, environments, tests, Newman',    interviewWeight: 'medium',    estimatedHours: 3 },
  { id: 'p2-mongo',        phase: 2, section: 'Databases',              title: 'MongoDB + Mongoose: schemas, virtuals, middleware',    interviewWeight: 'high',      estimatedHours: 6 },
  { id: 'p2-mongo-adv',    phase: 2, section: 'Databases',              title: 'Aggregation pipeline, indexing, transactions',         interviewWeight: 'very-high', estimatedHours: 8 },
  { id: 'p2-sql',          phase: 2, section: 'Databases',              title: 'SQL fundamentals, JOINs, indexes, ACID properties',    interviewWeight: 'high',      estimatedHours: 6 },
  { id: 'p2-security',     phase: 2, section: 'Security & Real-Time',   title: 'OWASP Top 10, helmet, rate limiting, input validation', interviewWeight: 'high',     estimatedHours: 6 },
  { id: 'p2-cache',        phase: 2, section: 'Security & Real-Time',   title: 'Redis caching, TTL, cache-aside, HTTP caching',        interviewWeight: 'high',      estimatedHours: 5 },
  { id: 'p2-sockets',      phase: 2, section: 'Security & Real-Time',   title: 'WebSockets, Socket.io rooms, real-time patterns',      interviewWeight: 'medium',    estimatedHours: 5 },
  { id: 'p2-arch',         phase: 2, section: 'Architecture',           title: 'Clean code, SOLID, repository pattern, service layer', interviewWeight: 'high',      estimatedHours: 6 },
  { id: 'p2-patterns',     phase: 2, section: 'Architecture',           title: 'Design patterns: factory, observer, strategy in Node', interviewWeight: 'high',      estimatedHours: 5 },
  { id: 'p2-ts-node',      phase: 2, section: 'Architecture',           title: 'TypeScript in Node: typed Express, Mongoose models',   interviewWeight: 'high',      estimatedHours: 5 },
  { id: 'p2-micro',        phase: 2, section: 'Microservices & Deploy', title: 'Microservices architecture, API gateway, tradeoffs',   interviewWeight: 'very-high', estimatedHours: 6 },
  { id: 'p2-pubsub',       phase: 2, section: 'Microservices & Deploy', title: 'Pub/Sub, message queues, RabbitMQ, Bull/BullMQ',       interviewWeight: 'high',      estimatedHours: 5 },
  { id: 'p2-docker',       phase: 2, section: 'Microservices & Deploy', title: 'Docker: Dockerfile, compose, container deployment',    interviewWeight: 'high',      estimatedHours: 5 },
  { id: 'p2-cloud',        phase: 2, section: 'Microservices & Deploy', title: 'Cloud: AWS basics, serverless, CI/CD pipelines',       interviewWeight: 'medium',    estimatedHours: 5 },
]

export const SECTIONS = [...new Set(CURRICULUM.map(t => t.section))]

export const PHASE_LABELS: Record<number, string> = {
  0: 'Phase 0 — Foundations',
  1: 'Phase 1 — React & Frontend',
  2: 'Phase 2 — Node.js & Backend',
}

export const TOTAL_HOURS = CURRICULUM.reduce((sum, t) => sum + t.estimatedHours, 0)
