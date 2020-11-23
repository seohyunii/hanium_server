var path = require('path');
var fs = require('fs');
var fs1 = require('fs');
var dir = './Pictures/';
var exec = require('child_process').exec
var SerialPort = require('serialport');
 
// 아두이노와 시리얼 통신하기 위한 포트 개방 
var port = new SerialPort('/dev/ttyACM0',{ 
        baudRate:9600,
        parser: new SerialPort.parsers.Readline('\n')
});
port.on('open',function(){
	console.log("port open");
}); 

var io = require("socket.io-client"); 
const socketClient = io("http://13.209.88.95:3030");

socketClient.on("connect", () => {
    console.log("connection server"); 

    // 라즈베리파이를 소켓 roomspace - room1 으로 지정
    socketClient.emit('joinRoom_rasp','room1');

    // 약 등록 : medName, medTime, num
    socketClient.on("insert_medicine", function(data){
        console.log("등록 :" + data)
	    var send = data[0]+","+data[1]+","+data[2];
	    port.write(send);
	    send = "";     
    });

    // 약 삭제 : num
    socketClient.on("delete_medicine", function(data){
        console.log("삭제 :" + "* ,", data)
	    var send1 = "* ,"+data;
	    port.write(send1);
	    send1 = "";     
    });

})
