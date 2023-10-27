import Styles from 'mobile/utils/Styles';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, ScrollView, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Divider, ListItem, Overlay } from 'react-native-elements';
import { listFacilities } from 'mobile/redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import { parseErrorMessage } from 'mobile/utils/Helpers';
import Colors from 'mobile/utils/Colors';


const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

export default function SelectFacility ({ onSelect, isVisible, onBackdropPress }) {
  const dispatch = useDispatch();
  const { data } = useSelector((state) => state.facilities);
  const [facilitiesByState, setFacilitiesByState] = useState([]);
  useEffect(() => {
    const initialize = async () => {
      try {
        await dispatch(listFacilities());
      } catch (error) {
        const errorMessage = (error?.response)
          ? parseErrorMessage(error?.response?.data)
          : 'Something went wrong';
        Alert.alert(null, errorMessage);
      }
    };
    initialize();
  }, []);

  useEffect(() => {
    const states = [...new Set(data?.map((item) => item?.state))].sort((a, b) => (a > b) ? 1 : -1);
    const _data = states?.map((state) => {
      return {
        name: state,
        facilities: data?.filter((facility) => facility?.state == state),
      };
    });
    setFacilitiesByState(_data);
  }, [data]);

  const divider = (item.facilities.length !== index + 1) && <Divider />

  const facility = item?.facilities?.map((facility, index) => (
      <View
      key={facility?.uid}
      >
        <TouchableOpacity
          onPress={() => onSelect(facility)}
        >
          <ListItem>
            <View
              style={styles.facilityList}
            >
              <ListItem.Title
                style={{
                  color: Colors.semiBlack,
                }}
              >
              {facility?.name}
              </ListItem.Title>
              <ListItem.Chevron
                type="entypo"
                name="chevron-right"
              />
            </View>
          </ListItem>
        </TouchableOpacity>
        {divider}
      </View>
    ))

  const facilityByState = facilitiesByState?.map((item) => (
    <View key={item?.name}>
      <ListItem>
        <ListItem.Content
          style={styles.listItemContent}
        >
          <ListItem.Title
            style={styles.listItemTitle}
          >
            {item?.name}
          </ListItem.Title>
        </ListItem.Content>
      </ListItem>
      {facility}
    </View>
  ));

  return (
    <Overlay
      isVisible={isVisible}
      onBackdropPress={onBackdropPress && onBackdropPress}
      overlayStyle={[Styles.overlayStyle, { height: screenHeight * .4, width: screenWidth * .75 }]}
    >
      <ScrollView>
        {facilityByState}
      </ScrollView>
    </Overlay>
  );
}

const styles = StyleSheet.create({
  listItemContent: {
    flex: 1,
    backgroundColor: Colors.tint,
    alignItems: 'center',
  },
  listItemTitle: {
    fontSize: 25,
    textAlign: 'center',
    color: Colors.white,
    fontWeight: 'bold',
  },
  facilityList: {
    flex: 1,
    paddingHorizontal: 15,
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
})