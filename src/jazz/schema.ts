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
    const root = account.root;

    if (!root) {
      account.$jazz.set('root', {
        products: demoProducts,
        routines: demoRoutines,
      });
      return;
    }

    if (!root.$jazz.has('products')) {
      root.$jazz.set('products', demoProducts);
    }

    if (!root.$jazz.has('routines')) {
      root.$jazz.set('routines', demoRoutines);
    }
  });
