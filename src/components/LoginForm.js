import React, { useEffect, useState } from 'react';
import {over} from 'stompjs';
import SockJS from 'sockjs-client';

var stompClient =null;

const LoginForm = () => {
  const [student, setStudent] = useState({
    username: '',
    connected: false,
    inQueue: false,
    position: 1,
    id: 0
  });

  const [queue, setQueue] = useState([]);

  // const [queue, setQueue] = useState([
  //   {"id":3,"name":"dsfsdf","inQueue":true},
  //   {"id":4,"name":"tghfbv","inQueue":true},
  //   {"id":20,"name":"asdasdasd","inQueue":true}
  // ]);
  
  const [users, setUsers] = useState([
    { "firstName": "plombeer", "role": 'User' },
    { "firstName": 'Vic', "role": 'Admin' }
  ]);


  useEffect(() => {
    console.log(student);
  }, [student]);

  const onConnected = () => {

    stompClient.subscribe('/queue/responselogin', onLoginReceive);
    stompClient.subscribe('/queue/responselogout', onLogoutReceive);
    stompClient.subscribe('/queue/position', onQueueUpdate);

    var loginForm = {
      username: student.username
    };

    stompClient.send("/app/login", {}, JSON.stringify(loginForm));
  } 

  const onLoginReceive = (payload) => {
    var payloadData = JSON.parse(payload.body)

    setStudent({...student,"connected": payloadData.connected});

    console.log("onLoginReceive");
  }

  const onLogoutReceive = (payload) => {
    var payloadData = JSON.parse(payload.body)

    setStudent({...student,"connected": payloadData.connected});

    console.log("onLogoutReceive");
  }

  const onQueueUpdate = (payload) => {
    console.log(payload + "response");
    var payloadData = JSON.parse(payload.body);

    // queue.push(payloadData);
    // setQueue([queue]);

    setQueue(payloadData);
  }
  
  const registerUser=()=>{
    connect();
  }

  const takeQueue = () => {
    var studentForQueue = {
      username: student.username
    };
  
    stompClient.send("/app/take", {}, JSON.stringify(studentForQueue));
  }

  const leaveQueue = () => {
    var studentForQueue = {
      username: student.username
    };
  
    stompClient.send("/app/leave", {}, JSON.stringify(studentForQueue));
  }

  const logout = () => {
    var studentForLeaveQueue = {
      username: student.username
    };
  
    stompClient.send("/app/logout", {}, JSON.stringify(studentForLeaveQueue));
  }

  const connect =()=>{
    console.log("connect");
    let Sock = new SockJS('http://localhost:8080/ws');
    stompClient = over(Sock);
    stompClient.connect({},onConnected, onError);
    
  } 

  const handleUsername=(event)=>{
    const {value}=event.target;
    setStudent({...student,"username": value});
  }

  const onError = (err) => {
    console.log(err);
  }

  return (
    <div>
      {
        student.connected ?
        <div>
            <button type="button" onClick={takeQueue}>
                  take
            </button>
            <button type="button" onClick={leaveQueue}>
                  leave
            </button>
            <button type="button" onClick={logout}>
                  logout
            </button>

            <table className="queue-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>position</th>
                    </tr>
                </thead>
                <tbody>
                    {queue && queue.map(user =>
                        <tr key={user.id}>
                            <td>{user.name}</td>
                            <td>{user.positionInQueue}</td>
                        </tr>
                    )}
                </tbody>
            </table>
          
        </div>
        :
        <div>
          <input
              id="user-name"
              placeholder="Enter your name"
              name="userName"
              value={student.username}
              onChange={handleUsername}
              margin="normal"
            />
            <button type="button" onClick={registerUser}>
                    connect
              </button>
        </div>
      }
          
      </div>
  )
  }

  export default LoginForm;