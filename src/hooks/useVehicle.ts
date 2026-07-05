import { useState } from 'react';

import { getVehicle } from '@/repositories/vehicles';
import { Vehicle } from '@/types/vehicle';

export function useVehicle(id: number): Vehicle | undefined {
  const [vehicle] = useState(() => getVehicle(id));
  return vehicle;
}
