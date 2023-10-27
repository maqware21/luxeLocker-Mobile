import React from 'react';
import { Dimensions, View, Text, StyleSheet } from 'react-native';
import moment from 'moment';

// Components
import Separator from '@shared/Separator';

// Utils
import Colors from '@utils/Colors';

const screenWidth = Dimensions.get('window').width;

export default ({ data }) => {
  const renderHistory = data?.length == 0 ? <Placeholder /> : data?.map((item) => (
      <AccessHistory
        data={item}
        key={item?.uid}
      />
    ))

  return (
    <View style={{ alignItems: 'center' }}>
      <ListTitle />
      {renderHistory }
    </View>
  );
};

const ListTitle = () => {
  return (
    <View style={{ width: screenWidth * .80, height: 30, paddingBottom: 15 }}>
      <View style={styles.listTitleConatiner}>
        <View style={styles.listTitleItemsContainer}>
          <Text style={styles.listTitleItems}>Date</Text>
        </View>
        <View style={styles.listTitleItemsContainer}>
          <Text style={styles.listTitleItems}>Time</Text>
        </View>
        <View style={styles.listTitleItemsContainer}>
          <Text style={styles.listTitleItems}>Action</Text>
        </View>
      </View>
    </View>
  );
};


const AccessHistory = (item) => {

  const formatAction = (action) => {
    return (action.toUpperCase());
  };

  const formatDate = (date) => {
    const formattedDate = moment(date).format('MM/DD/YYYY');
    return formattedDate;
  };

  const formatTime = (date) => {
    const formattedTime = moment(date).format('h:mm a');
    return formattedTime;
  };

  return (
    <View style={{ width: screenWidth * .80, paddingVertical: 15 }}>
      <View style={{ flexDirection: 'row' }}>
        <View style={styles.historyItemsContainer}>
          <Text style={styles.historyItems}>{formatDate(item?.data?.created)}</Text>
        </View>
        <View style={styles.historyItemsContainer}>
          <Text style={styles.historyItems}>{formatTime(item?.data?.created)}</Text>
        </View>
        <View style={styles.historyItemsContainer}>
          <Text style={styles.historyItems}>{formatAction(item?.data?.action)}</Text>
        </View>
      </View>
    </View>
  );
};


const Placeholder = () => {
  return (
    <View style={{ width: screenWidth * .90, height: 60 }}>
      <Separator height={20} />
      <View>
        <View style={{ alignItems: 'center', paddingBottom: 10 }}>
          <Text style={{ color: Colors.fontColor }}>No Access History</Text>
        </View>
      </View>
      <Separator height={20} />
    </View>
  );
};


const styles = StyleSheet.create({
  listTitleConatiner: { 
    flexDirection: 'row', 
    borderBottomWidth: 1, 
    borderBottomColor: Colors.white, 
    paddingBottom: 10 
  },
  listTitleItemsContainer: { 
    flex: 1, 
    justifyContent: 'flex-end' 
  },
  listTitleItems: { 
    color: Colors.tint, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    fontSize: 18 
  },
  historyItemsContainer: { 
    flex: 1, 
    justifyContent: 'flex-end' 
  },
  historyItems: { 
    color: Colors.fontColor, 
    textAlign: 'center' 
  },
})
