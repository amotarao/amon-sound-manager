import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const useUniqueId = (prefix?: string): string => {
  const [uniqueId] = useState(`${prefix ? `${prefix}-` : ''}${uuidv4()}`);
  return uniqueId;
};
