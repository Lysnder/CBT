import type { NextConfig } from 'next';
import { getEnv } from '@cbt/config/env';

// Açılışta ortam değişkenlerini doğrular; eksikse EnvError ile durur.
getEnv();

const nextConfig: NextConfig = {
  transpilePackages: ['@cbt/config', '@cbt/ui'],
};

export default nextConfig;
