import { EnumVar, TypedEnv } from '@amccarthy1/typed-env';

const env = TypedEnv({
  ENVIRONMENT: EnumVar({ options: ['dev', 'staging', 'prod'] }),
});

console.log(env.ENVIRONMENT);
