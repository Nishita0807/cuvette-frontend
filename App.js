import React , {useEffect} from 'react';
function App(){
const [json,setJson]=useState([]);
    useEffect(()=>{
        fetch('http://localhost:8080/api/data').then(res=>res.json()).then(data=>setJson(data));
    },[]);
}