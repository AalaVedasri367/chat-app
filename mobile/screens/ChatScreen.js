import React, {useEffect, useState, useRef} from 'react';
import { View, Text, TextInput, Button, FlatList, KeyboardAvoidingView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import io from 'socket.io-client';
import axios from 'axios';

export default function ChatScreen({route, navigation}){
  const {conversationId, other} = route.params;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [socket, setSocket] = useState(null);
  const [typing, setTyping] = useState(false);
  const meRef = useRef(null);

  useEffect(()=>{
    const init = async ()=>{
      const token = await AsyncStorage.getItem('token');
      const user = JSON.parse(await AsyncStorage.getItem('user'));
      meRef.current = user;
      const res = await axios.get(`http://10.0.2.2:4000/conversations/${conversationId}/messages`, {headers:{Authorization:'Bearer '+token}});
      setMessages(res.data);
      const s = io('http://10.0.2.2:4000', {auth:{token}});
      setSocket(s);
      s.on('connect', ()=>console.log('socket connected'));
      s.on('message:new', (msg)=>{
        // only add messages of this conversation
        if(String(msg.conversation) === String(conversationId)){
          setMessages(prev=>[...prev, msg]);
        }
      });
      s.on('typing:start', (d)=>{ if(d.conversationId === conversationId) setTyping(true); });
      s.on('typing:stop', (d)=>{ if(d.conversationId === conversationId) setTyping(false); });
      s.on('message:read', (d)=>{ console.log('message read', d); });
    };
    init();
    return ()=>{ if(socket) socket.disconnect(); };
  },[]);

  const send = async ()=>{
    if(!text.trim()) return;
    const payload = {conversationId, to: other._id, content: text};
    socket.emit('message:send', payload);
    setText('');
  };

  let typingTimeout;
  const handleText = (val)=>{
    setText(val);
    if(socket){
      socket.emit('typing:start', {to: other._id, conversationId});
      clearTimeout(typingTimeout);
      typingTimeout = setTimeout(()=> socket.emit('typing:stop', {to: other._id, conversationId}), 1200);
    }
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={{flex:1}}>
      <View style={{height:50,justifyContent:'center',padding:10,borderBottomWidth:1}}>
        <Text style={{fontSize:16}}>{other.name}{typing ? ' · typing…' : ''}</Text>
      </View>
      <FlatList data={messages} keyExtractor={item=>item._id} renderItem={({item})=>(
        <View style={{padding:8, alignSelf: item.from === meRef.current?.id ? 'flex-end' : 'flex-start', maxWidth:'80%'}}>
          <Text style={{backgroundColor:'#eee',padding:8,borderRadius:6}}>{item.content}</Text>
          <Text style={{fontSize:10,color:'#666'}}>{new Date(item.createdAt).toLocaleTimeString()}</Text>
        </View>
      )} />
      <View style={{flexDirection:'row',padding:8,borderTopWidth:1}}>
        <TextInput value={text} onChangeText={handleText} style={{flex:1,borderWidth:1,padding:8,borderRadius:6}} />
        <Button title="Send" onPress={send} />
      </View>
    </KeyboardAvoidingView>
  );
}
