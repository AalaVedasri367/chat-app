import React, {useEffect, useState} from 'react';
import { View, Text, FlatList, TouchableOpacity, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function HomeScreen({navigation}){
  const [users, setUsers] = useState([]);
  const [me, setMe] = useState(null);

  useEffect(()=>{
    const init = async ()=>{
      const token = await AsyncStorage.getItem('token');
      const user = JSON.parse(await AsyncStorage.getItem('user'));
      setMe(user);
      if(!token) return navigation.replace('Login');
      const res = await axios.get('http://10.0.2.2:4000/users', {headers:{Authorization:'Bearer '+token}});
      setUsers(res.data);
    };
    init();
  },[]);

  const openChat = async (other) => {
    const token = await AsyncStorage.getItem('token');
    const res = await axios.post('http://10.0.2.2:4000/conversations', {participantId: other._id}, {headers:{Authorization:'Bearer '+token}});
    const conv = res.data;
    navigation.navigate('Chat', {conversationId: conv._id, other});
  };

  return (
    <View style={{flex:1,padding:10}}>
      <Text style={{fontSize:18,marginBottom:10}}>Users</Text>
      <FlatList data={users} keyExtractor={item=>item._id} renderItem={({item})=>(
        <TouchableOpacity onPress={()=>openChat(item)} style={{padding:12,borderBottomWidth:1}}>
          <Text>{item.name}</Text>
          <Text style={{color:'#666'}}>{item.email}</Text>
        </TouchableOpacity>
      )} />
    </View>
  );
}
