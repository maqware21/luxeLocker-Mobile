import React, { useMemo } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';

export default () => {
    const snapPoints = useMemo(() => ['100%', '50%'], []);

      return (
        <View style={styles.container}>
          <BottomSheet
            index={1}
            snapPoints={snapPoints}
            onChange={console.log('handleSheetChanges')}
          >
            <View style={styles.contentContainer}>
              <Text>Awesome 🎉</Text>
            </View>
          </BottomSheet>
        </View>
      );
    };
    
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: 'grey',
      },
      contentContainer: {
        flex: 1,
        alignItems: 'center',
      },
    });
    
