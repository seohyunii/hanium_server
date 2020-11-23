var mysql = require('mysql');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");
var admin = require("firebase-admin");



var serviceAccount = require("/home/ubuntu/app/node/project/fcm-example-6dbdc-firebase-adminsdk-fgc39-b3dddeaff2.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://hanium-6a6ca.firebaseio.com"
});

const now_date = moment().format('YYYY-MM-DD HH:mm:ss');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.listen(3000, '172.31.35.92', function () {
    console.log('서버 실행 중...');
});

var connection = mysql.createConnection({
    host: "13.209.88.95",
    user: "root",
    database: "iotdevelopers",
    password: "root",
    port: "3306"
});

var io = require('socket.io').listen(3030);

io.on('connection', function (socket) {
    console.log('android connect');

    socket.on('joinRoom_rasp',function(data){
        var roomName1 = data;
        socket.join(roomName1);
        console.log("join_rasp");
    });

    socket.on('joinRoom_app',function(data){
        var roomName2 = data;
        socket.join(roomName2);
        console.log("join_app");
    });

});

app.post('/medic_push',function(request,response)
{
  var mac=request.body.usermac
  var medname=request.body.medicname
  var registrationToken
  var sql='select * from Users where RobotNumber = ?'

connection.query(sql,mac,function(err,results){
  if(err)
  {
    console.log(err)
  }
  else
  {
    if(results.length!=0)
    {
      registrationToken=results[0].UserToken
      console.log(registrationToken)
      console.log(mac)
      console.log(medname)
      var payload={
        data:{
        channel:"10",  
        title:"약시간 알림",
        body:medname+"복용 시간 입니다."
        },
        token:registrationToken
      }
      admin.messaging().send(payload)
      .then(function(response){
       console.log("Successfully sent message:",response)
      })
      .catch(function(error){
  
      console.log("Error sending message",error)
      })

    }
  }
})
  console.log('medic/push')
})
app.post('/fail',function(request,response)
{
  var mac=request.body.usermac
  var medname=request.body.medicname
  var registrationToken
  var sql='select * from Users where RobotNumber = ?'

  connection.query(sql,mac,function(err,results){
    if(err)
    {
      console.log(err)
    }
    else
    {
      if(results.length!=0)
      {
        registrationToken=results[0].UserToken
        console.log(registrationToken)
        console.log(mac)
        console.log(medname)
        var payload={
          data:{
          channel:"10",  
          title:"환자 약복용 정보 알림",
          body:"환자분께서 "+medname+" 복용을 하지 않았습니다."
          },
          token:registrationToken
        }
        admin.messaging().send(payload)
        .then(function(response){
         console.log("Successfully sent message:",response)
        })
        .catch(function(error){
    
        console.log("Error sending message",error)
        })
  
      }
    }
  })
  console.log('/FAIL')
  console.log(medname)
  
  response.send('')
})
app.post('/update',function(request,response){

    var mac=request.body.usermac
    var medicname=request.body.medicname
    
    var sql='select * from Users where RobotNumber = ?'
    var ID
    connection.query(sql,mac,function(err,results)
    {
      if(err)
      {
        console.log(err)
      }
      else{
        if(results.length!=0)
        {
          var sql2='insert into MedicRecords (UserId,medName,TakingTime) values(?,?,?)'
          ID=results[0].UserId
          console.log(ID)
          var date=moment().format('YYYY-MM-DD HH:mm')
          var params=[ID,medicname,date]
          connection.query(sql2,params,function(err,result)
          {
            var message='에러가 발생했습니다.'
            if(err)
            {
             console.log(err)
            }
          })
        }
      }
    })
    console.log('/UPDATE')
  })

  app.post('/vacate',function(request,response)
{
  var mac=request.body.usermac
  var medname=request.body.medicname
  var registrationToken
  var sql='select * from Users where RobotNumber = ?'

connection.query(sql,mac,function(err,results){
  if(err)
  {
    console.log(err)
  }
  else
  {
    if(results.length!=0)
    {
      registrationToken=results[0].UserToken
      console.log(registrationToken)
      console.log(mac)
      console.log(medname)
      var payload={
        data:{
        channel:"10",  
        title:"약소진 알림",
        body:medname+"을 채워주세요"
        },
        token:registrationToken
      }
      admin.messaging().send(payload)
      .then(function(response){
       console.log("Successfully sent message:",response)
      })
      .catch(function(error){
  
      console.log("Error sending message",error)
      })

    }
  }
})
  console.log('/vacate')
})

app.post('/user/join', function (req, res) {
  console.log(req.body);
  var userId = req.body.userId;
  var userPwd = req.body.userPwd;
  var userName = req.body.userName;
  var robotnumber = req.body.robot_number;
  var token=req.body.userToken;

  console.log(req.body.userId);

  var sql = 'INSERT INTO Users VALUES (?,?,?,?,?)';
  var params = [userId, userPwd, userName, robotnumber,token];

  connection.query(sql, params, function (err, result) {
      var resultCode = 404;
      var message = '에러가 발생했습니다';

      if (err) {
          console.log(err);
      } else {
          resultCode = 200;
          message = '회원가입에 성공했습니다.';
      }

      res.json({
          'code': resultCode,
          'message': message
      });
  });
});

app.post('/user/login', function (req, res) {
  var userId = req.body.userId;
  var userPwd = req.body.userPwd;
  var sql = 'select * from Users where UserId = ?';

  connection.query(sql, userId, function (err, result) {
      var resultCode = 404;
      var message = '에러가 발생했습니다(삭제)';

      if (err) {
          console.log(err);
      } else {
          if (result.length === 0) {
              resultCode = 204;
              message = '존재하지 않는 계정입니다!';
          } else if (userPwd !== result[0].UserPwd) {
              resultCode = 204;
              message = '비밀번호가 틀렸습니다!';
          } else {
              resultCode = 200;
              message = '로그인 성공! ' + result[0].UserName + '님 환영합니다!';
          }
      }

      console.log(userId);

      res.json({
          'code': resultCode,
          'message': message,
          'userId' : userId
      });
  })
});

app.post('/user/MedSettings', function(req,res) {
    var UserId = req.body.user_Id;
    var num = req.body.num;
    var medName = req.body.medName;
    var medTime = req.body.medTime;
    var medlist = req.body.medlist;
    date = now_date;

    console.log(UserId, num, medName, medTime, medlist)

    var sql_insert = 'INSERT INTO MedSettings (UserId,num,medName,medTime,medlist,date) VALUES (?,?,?,?,?,?)';
    var sql= 'select * from MedSettings where UserId=? and num=?';
    var params_in = [UserId, num, medName, medTime, medlist, date];
    var socket_param = [medName, medTime, num];
    var params = [UserId, num];

     connection.query(sql, params, function (err, result) {
        if (err) {
            console.log(err);
            var resultCode = 404;
            var message = '에러가 발생했습니다(약 주기 전송)';
        }else if(result.length===0) {
            resultCode = 200;
            connection.query(sql_insert, params_in, function (err, result){
                message = "약 주기 등록 완료"
                io.sockets.in('room1').emit("insert_medicine",socket_param);

            });
        }else if(result.length>0){
            if(req.body.num === result[0].num){
                resultCode = 100;
                console.log(req.body.num)
                console.log(result[0])
                message = "같은 칸에 약 정보가 이미 존재합니다."
            }
        }        

        

        res.json({
            'code': resultCode,
            'message': message,
            'medName' : medName,
            'medTime' : medTime
        })
    });
});

app.post('/user/medlist', function (req, res) {
    var medNameList =[];
    var medTimeList =[];
    var UserId = req.body.user_Id;

    console.log(UserId)
    var sql = 'select * from MedSettings where UserId=?';

    connection.query(sql, UserId, function (err, result) {
        var resultCode = 404;
        var message = '에러가 발생했습니다(med-16)';

        for(i=0; i<6; i++){
            medNameList[i] = null;
            medTimeList[i] = null;
        }

        if (err) {
            console.log(err);
        } else {
            if (result.length === 0) {
                resultCode = 204;
                message='리스트 불러오기';
                console.log("약 정보가 없습니다")
            } else {
                resultCode = 200;
                for(i=0; i<result.length; i++){
                    if(result[i].num==='1'){
                        console.log("1 등록 완료")
                        medNameList[0] = result[i].medName;
                        medTimeList[0] = result[i].medTime;
                    }if(result[i].num==='2'){
                        console.log("2 등록 완료")
                        medNameList[1] = result[i].medName;
                        medTimeList[1] = result[i].medTime;
                    }if(result[i].num==='3'){
                        console.log("3 등록 완료")
                        medNameList[2] = result[i].medName;
                        medTimeList[2] = result[i].medTime;
                    }if(result[i].num==='4'){
                        console.log("4 등록 완료")
                        medNameList[3] = result[i].medName;
                        medTimeList[3] = result[i].medTime;
                    }if(result[i].num==='5'){
                        console.log("5 등록 완료")
                        medNameList[4] = result[i].medName;
                        medTimeList[4] = result[i].medTime;
                    }if(result[i].num==='6'){
                        console.log("6 등록 완료")
                        medNameList[5] = result[i].medName;
                        medTimeList[5] = result[i].medTime;
                    }

                    message='리스트 불러오기';
                }
            
        }
    }
    
        res.json({
            'code': resultCode,
            'message': message,
            'length': result.length,
            'medNameList': medNameList,
            'medTimeList': medTimeList
        })
    })
});

app.post('/user/medpoplist', function (req, res) {
    var medNameList = []; 
    var medTimeList = [];
    var medTextList = [];
    var UserId = req.body.user_Id;
    var num = req.body.num;

    var sql = 'select * from MedSettings where UserId=? and num=?';
    var params = [UserId,num]

    connection.query(sql, params, function (err, result) {
        var resultCode = 404;
        var message = '에러가 발생했습니다(pop-list)';

        medNameList[0] = null;
        medTimeList[0] = null;
        medTextList[0] = null;

        if (err) {
            console.log(err);
        } else {
            if (result.length === 0) {
                resultCode = 204;
                message = '약 정보가 없습니다.'
            } else {
                resultCode = 200;
                message = '약 정보 가져오기'

                medNameList[0] = result[0].medName;
                medTimeList[0] = result[0].medTime;
                medTextList[0] = result[0].medlist;

                console.log(medNameList[0])
                console.log(medTimeList[0])
                console.log(medTextList[0])
            }
                    
            
    }
    
        res.json({
            'code': resultCode,
            'message': message,
            'length': result.length,
            'num':num,
            'medNameList': medNameList,
            'medTimeList': medTimeList,
            'medTextList' : medTextList
        })
    })
});


app.post('/user/meddel', function (req, res) {
    var medNameList = []; 
    var medTimeList = [];
    var UserId = req.body.user_Id;
    var num = req.body.num;

    var sql_del= 'delete from MedSettings where UserId=? and num=?';
    var params_del = [UserId, num];

    connection.query(sql_del, params_del, function (err, result) {
        var resultCode = 404;
        var message = '에러가 발생했습니다(삭제)';

        if (err) {
            console.log(err);
        } else {
            if (result.length === 0) {
                message = '삭제할 데이터가 없습니다.'
                resultCode = 204;
            } else {
                resultCode = 200;
                medNameList[num-1]=null;
                medTimeList[num-1]=null;
                message = '약 삭제 완료'
                console.log("약 삭제 완료" + UserId + num)

                var socket_param1 = num;
                io.sockets.in('room1').emit("delete_medicine",socket_param1);
            }
        }
    
                    
        res.json({
            'code': resultCode,
            'message': message
        })
    })
});

app.post('/user/medpopwarning', function (req, res) {
    var UserId = req.body.user_Id;
    var medList = req.body.medlist; // 약 종류
    var med = [];
    var s_medname;

    var sql = 'select * from MedSettings where UserId=?';

    connection.query(sql, UserId, function (err, result) {
        var resultCode = 404;
        var message=null;
        med[0] = null;

        if (err) {
            console.log(err);
        } else {
            if (result.length === 0) {
                console.log("약 경고 메세지 없음")
                resultCode = 204;
            } else {
                resultCode = 200;
                for(i=0; i<result.length; i++){
                console.log("현재 저장된 약 종류 : " + result[i].medlist)}

                med[0] = medList;
                console.log("저장할 약 종류 : " + med[0])

                switch(med[0]){
                    case '관절염약':
                        for(i=0; i<result.length; i++){
                            if(result[i].medlist == '수면제'){
                                message = "수면제 / 관절염약 동시 복용 금지";
                                mednum = i+1;
                                s_medname = result[i].medlist;
                            }
                        }
                        break;

                    case '수면제':
                        for(i=0; i<result.length; i++){
                            if(result[i].medlist == '관절염약'){
                                message = "수면제 / 관절염약 동시 복용 금지";
                                mednum = i+1;
                                s_medname = result[i].medlist;
                            }
                        }
                        break;

                    case '콜레스테롤약':
                        for(i=0; i<result.length; i++){
                            if(result[i].medlist == '소염진통제'){
                                message = "경고";
                                mednum = i+1;
                                s_medname = result[i].medlist;
                            }
                        }
                        break;

                    case '진통제':
                        for(i=0; i<result.length; i++){
                            if(result[i].medlist == '콜레스테롤약'){
                                message = "경고";
                                mednum = i+1;
                                s_medname = result[i].medlist;
                            }
                            if(result[i].medlist == '종합감기약'){
                                message = "경고 / 간의 해독 능력에 무리를 줄 수 있습니다.";
                                mednum = i+1;
                                s_medname = result[i].medlist;
                            }
                        }
                        break;

                    case '종합감기약':
                        for(i=0; i<result.length; i++){
                            if(result[i].medlist == '진통제'){
                                message = "경고 / 간의 해독 능력에 무리를 줄 수 있습니다.";
                                mednum = i+1;
                                s_medname = result[i].medlist;
                            }
                            if(result[i].medlist == '비타민C'){
                            message = "경고 / 간의 해독 능력에 무리를 줄 수 있습니다.";
                            mednum = i+1;
                            s_medname = result[i].medlist;
                            }
                        }
                        break;   

                    case '혈압약':
                        message = "바나나, 시금치 섭취 금지 권장";
                        break;  
                    
                    case '항생제':
                        message = "유제품 동시 섭취 금지 권장";
                        break;

                    case '항히스타민제':
                        message = "다른 약과 동시 복용 금지";
                        break;

                    case '변비약':
                        message = "유제품 동시 섭취 금지 권장";
                        break;

                    case '빈혈약':
                        message = "녹차 홍차 (차 종류) 동시 섭취 금지 권장";
                        break;

                    case '비타민':
                        message = "녹차 홍차 (차 종류) 동시 섭취 금지 권장";
                        break;
                
                    case '고지혈증약':
                        for(i=0; i<result.length; i++){
                            if(result[i].medlist == '무좀약'){
                                message = "경고 / 간 독성 유발 및 신장 장애 무리를 줄 수 있습니다.";
                                mednum = i+1;
                                s_medname = result[i].medlist;
                            }
                        }
                        break;

                    case '무좀약':
                        for(i=0; i<result.length; i++){
                            if(result[i].medlist == '고지혈증약'){
                                message = "경고 / 간 독성 유발 및 신장 장애 무리를 줄 수 있습니다.";
                                mednum = i+1;
                                s_medname = result[i].medlist;
                            }
                        }
                        break;
                           
                    case '아스피린':
                        for(i=0; i<result.length; i++){
                            if(result[i].medlist == '비타민C'){
                                message = "경고 / 간의 해독 능력에 무리를 줄 수 있습니다.";
                                mednum = i+1;
                                s_medname = result[i].medlist;
                            }
                        }
                        break;

                    case '비타민C':
                        for(i=0; i<result.length; i++){
                            if(result[i].medlist == '아스피린'){
                                message = "경고 / 간의 해독 능력에 무리를 줄 수 있습니다.";
                                mednum = i+1;
                                s_medname = result[i].medlist;
                            }
                            if(result[i].medlist == '비타민C'){
                                message = "경고 / 간의 해독 능력에 무리를 줄 수 있습니다.";
                                mednum = i+1;
                                s_medname = result[i].medlist;
                            }
                        }
                        break;
                    
                    case '종합비타민':
                        for(i=0; i<result.length; i++){
                            if(result[i].medlist == '철분'){
                                message = "동시 복용시 흡수율 저하 ( 철분 식사전, 칼슘 식사 후 권장)";
                                mednum = i;
                                console.log(i)
                                s_medname = result[i].medlist;
                            }
                        }
                        break;

                    case '철분':
                        for(i=0; i<result.length; i++){
                            console.log(result[i].medList);
                            if(result[i].medlist === '종합비타민'){
                                message = "동시 복용시 흡수율 저하 ( 철분 식사전, 칼슘 식사 후 권장)";
                                console.log("철분/종합비타민")
                                mednum = i;
                                s_medname = result[i].medlist;
                            }
                            if(result[i].medlist == '아연'){
                                message = "동시 복용시 흡수 저하";
                                mednum = i+1;
                                s_medname = result[i].medlist;
                            }
                            if(result[i].medlist =='종합비타민(탄닌포함'){
                                message = "동시 복용시 흡수 저하";
                                mednum = i+1;
                                s_medname = result[i].medlist;
                            }
                        }
                        break;
            
    
                    case '셀레늄':
                        for(i=0; i<result.length; i++){
                            if(result[i].medlist == '아연'){
                                message = "동시 복용시 셀레늄 흡수 저하";
                                mednum = i+1;
                                s_medname = result[i].medlist;
                            }
                        }
                        break;
                     
                    case '아연':
                        for(i=0; i<result.length; i++){
                            if(result[i].medlist == '셀레늄'){
                                message = "동시 복용시 셀레늄 흡수 저하";
                                mednum = i+1;
                                s_medname = result[i].medlist;
                            }
                            if(result[i].medlist == '철분'){
                                message = "동시 복용시 흡수 저하";
                                mednum = i+1;
                                s_medname = result[i].medlist;
                            }
                        }
                        break;
                    
                    case '종합비타민(탄닌포함)':
                        for(i=0; i<result.length; i++){
                            if(result[i].medlist == '철분'){
                                message = "동시 복용시 흡수 저하";
                                mednum = i+1;
                                s_medname = result[i].medlist;
                            }
                        }
                        break;

                    case '오메가3':
                        for(i=0; i<result.length; i++){
                            if(result[i].medlist == '아스피린'){
                                message = "동시 복용시 지혈이 어려워지는 문제 발생";
                                mednum = i+1;
                                s_medname = result[i].medlist;
                            }
                        }
                        break;
                    
                    case '아스피린':
                        for(i=0; i<result.length; i++){
                            if(result[i].medlist == '오메가3'){
                                message = "동시 복용시 지혈이 어려워지는 문제 발생";
                                mednum = i+1;
                                s_medname = result[i].medlist;
                            }
                        }
                        break;
                    
                    case '당뇨병약':
                        for(i=0; i<result.length; i++){
                            if(result[i].medlist == '비타민B'){
                                message = "동시 복용 금지";
                                mednum = i+1;
                                s_medname = result[i].medlist;
                            }
                        }
                        break;

                    case '비타민B':
                        for(i=0; i<result.length; i++){
                            if(result[i].medlist == '당뇨병약'){
                                message = "동시 복용 금지";
                                mednum = i+1;
                                s_medname = result[i].medlist;
                            }
                        }
                        break;
                    }
                }
            }
    

        res.json({
            'code': resultCode,
            'message': message,
            's_medname' : s_medname
        })
    })
});


  app.post('/user/getmedtakentime', function (req, res) {
    var medNameApp =[];
    var medTimeApp =[];
    var senddate = req.body.senddate;
    var UserId = req.body.user_id;
    console.log(senddate+'받은날짜');
    console.log(UserId)

    var params =[senddate, UserId];
    var sql = 'select * from MedicRecords where TakingTime like ? and UserId = ?';
    
    connection.query(sql, params, function (err, result) {
        var resultCode = 404;
        if (err) {
            console.log(err);
        } else {
            if (result.length === 0) {
                resultCode = 204;
            } else {
                resultCode = 200;
                for(i=0; i<result.length; i++){
                    medNameApp[i] = result[i].medName;
                    medTimeApp[i] = result[i].TakingTime;
                    console.log("약이름"+medNameApp[i]);
                    console.log("약복용시간"+medTimeApp[i]);
                    console.log(i);
                    console.log(result.length);
                }
            }

        }

        res.json({
            'code': resultCode,
            'length':result.length,
            'medNameApp': medNameApp,
            'medTimeApp' : medTimeApp
        });
    })
});