import { co } from 'jazz-tools';
import {
  CosmeticProductSchema,
  RoutineStepSchema,
  demoProducts,
  demoRoutines,
} from './types';

export const SkincareAccountRoot = co.map({
  products: co.list(CosmeticProductSchema),
  routines: co.list(RoutineStepSchema),
});

export const SkincareAccount = co
  .account({
    profile: co.profile(),
    root: SkincareAccountRoot,
  })
  .withMigration((account) => {
    if (!account.$jazz.has('root')) {
      account.$jazz.set('root', {
        products: demoProducts,
        routines: demoRoutines,
      });
      return;
    }

    if (!account.root.$jazz.has('products')) {
      account.root.$jazz.set('products', demoProducts);
    }

    if (!account.root.$jazz.has('routines')) {
      account.root.$jazz.set('routines', demoRoutines);
    }
  });
