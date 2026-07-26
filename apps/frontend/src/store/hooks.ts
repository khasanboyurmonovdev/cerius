import { useDispatch, useSelector } from 'react-redux';

import type { AppDispatch, RootState } from './index.js';

/** Typed Redux hooks — use these instead of the untyped originals. */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
