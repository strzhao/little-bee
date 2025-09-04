declare module 'next-pwa' {
  import { NextConfig } from 'next';
  
  interface PWAConfig {
    dest?: string;
    disable?: boolean;
    register?: boolean;
    skipWaiting?: boolean;
    sw?: string;
    publicExcludes?: string[];
    buildExcludes?: (RegExp | string | ((chunk: any) => boolean))[];
    cacheOnFrontEndNav?: boolean;
    subdomainPrefix?: string;
    reloadOnOnline?: boolean;
    cacheStartUrl?: boolean;
    dynamicStartUrl?: boolean;
    dynamicStartUrlRedirect?: string;
    fallbacks?: {
      document?: string;
      image?: string;
      audio?: string;
      video?: string;
      font?: string;
    };
    workboxOptions?: any;
    runtimeCaching?: any[];
  }
  
  function withPWA(config: PWAConfig): (nextConfig: NextConfig) => NextConfig;
  
  export default withPWA;
}