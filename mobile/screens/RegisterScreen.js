import React, {useState} from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import axios from 'axios';

export default function RegisterScreen({navigation}){
  const [name,setName] = useState('');
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [err,setErr] = useState('');

  const register = async ()=>{
    try{
      const res = await axios.post('http://10.0.2.2:4000/auth/register', {name,email,password});
      navigation.replace('Login');
    }catch(e){ setErr(e.response?.data?.msg || 'Register failed'); }
  };

  return (
    <View style={{flex:1,justifyContent:'center',padding:20}}>
      <TextInput placeholder="Name" value={name} onChangeText={setName} style={{borderWidth:1,marginBottom:10,padding:8}} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize='none' style={{borderWidth:1,marginBottom:10,padding:8}} />
      <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} style={{borderWidth:1,marginBottom:10,padding:8}} />
      <Button title="Register" onPress={register} />
      {err ? <Text style={{color:'red'}}>{err}</Text> : null}
    </View>
  );
}
