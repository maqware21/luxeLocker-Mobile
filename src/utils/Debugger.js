import React from 'react';
import { Text } from 'react-native';


export const DebugState = (state) => (
  <Text style={{ color: 'white' }}>{JSON.stringify(state, null, 4)}</Text>
);
