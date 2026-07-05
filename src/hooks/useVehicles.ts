import { useCallback, useState } from 'react';

import { addVehicle, deleteVehicle, getVehicles, toggleFavorite, updateVehicle } from '@/repositories/vehicles';
import { Vehicle } from '@/types/vehicle';

export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => getVehicles());

  const refresh = useCallback(() => setVehicles(getVehicles()), []);

  const saveVehicle = useCallback(
    (data: Omit<Vehicle, 'id' | 'isFavorite'>, editing?: Vehicle) => {
      if (editing) {
        updateVehicle({ ...data, id: editing.id, isFavorite: editing.isFavorite });
      } else {
        addVehicle(data);
      }
      refresh();
    },
    [refresh],
  );

  const removeVehicle = useCallback(
    (id: number) => {
      deleteVehicle(id);
      refresh();
    },
    [refresh],
  );

  const toggleVehicleFavorite = useCallback(
    (vehicle: Vehicle) => {
      toggleFavorite(vehicle.id, vehicle.isFavorite !== 1);
      refresh();
    },
    [refresh],
  );

  return { vehicles, saveVehicle, removeVehicle, toggleVehicleFavorite };
}
