import type { TestProjectConfiguration } from 'vitest/config';

function project(name: string, root: string): TestProjectConfiguration {
  return { test: { name, root, include: ['**/*.test.{ts,tsx}'], environment: 'node' } };
}

const projects: TestProjectConfiguration[] = [
  project('config', 'packages/config'),
  project('db', 'packages/db'),
  project('modules', 'packages/modules'),
  project('ui', 'packages/ui'),
  project('web', 'apps/web'),
  project('worker', 'apps/worker'),
];

export default projects;
