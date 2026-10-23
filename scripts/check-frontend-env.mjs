import {loadEnv} from 'vite';
import {isPublishableKey} from '../src/lib/public-config.ts';
const env=loadEnv('production',process.cwd(),'VITE_');
const key=env.VITE_SUPABASE_PUBLISHABLE_KEY;
if(key&&!isPublishableKey(key))throw new Error('Frontend requires a publishable/anon key. Secret/service_role keys are forbidden.');
