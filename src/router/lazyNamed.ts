import { ComponentType, lazy } from 'react';

// Adapta un export nombrado (convención de este proyecto) a la forma que
// React.lazy espera (un módulo con export default), sin dejar de usar
// named exports en las páginas.
export const lazyNamed = <T extends ComponentType<unknown>>(
	factory: () => Promise<Record<string, T>>,
	exportName: string
) => lazy(() => factory().then(module => ({ default: module[exportName] })));
