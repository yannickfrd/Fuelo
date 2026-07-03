import { useCallback, useState } from 'react';

import { addFillup, deleteFillup, getFillups, updateFillup } from '@/repositories/fillups';
import { FillUp } from '@/types/vehicle';

export function useFillups(vehicleId: number) {
  const [fillups, setFillups] = useState<FillUp[]>(() => getFillups(vehicleId));

  const refresh = useCallback(() => setFillups(getFillups(vehicleId)), [vehicleId]);

  const saveFillup = useCallback(
    (data: Omit<FillUp, 'id'>, editing?: FillUp) => {
      if (editing) {
        updateFillup({ ...data, id: editing.id });
      } else {
        addFillup(data);
      }
      refresh();
    },
    [refresh],
  );

  const removeFillup = useCallback(
    (id: number) => {
      deleteFillup(id);
      refresh();
    },
    [refresh],
  );

  return { fillups, saveFillup, removeFillup };
}
