chrome.app.runtime.onLaunched.addListener(function(data) {
  // Open main window
  chrome.app.window.create('index.html',
    { id: 'main',
      innerBounds: {width: 600, height: 345}
    });
});

var data;
var connectionInfo_g;
var weight_data=0;
var settings;


chrome.storage.local.get(['port'], function(result) {
  console.log('add_event');
  settings=result.port;
});





chrome.runtime.onMessageExternal.addListener(
  function (request, sender, sendResponse) {

   // data=request.data;
    console.log(JSON.stringify(request.data));




    if(request.printer=='printer_w'){



      get_data('printer_w');

     

    }

    else if(request.printer=='get_data'){
       sendResponse(weight_data);


    }


    else{
    send_data(request.data,request.printer);      
    }







        sendResponse("Send serial port data to the web page");
  });

  var convertStringToArrayBuffer=function(str) {
    var buf=new ArrayBuffer(str.length);
    var bufView=new Uint8Array(buf);
    for (var i=0; i<str.length; i++) {
      bufView[i]=str.charCodeAt(i);
    }
    return buf;
  }


  function openSelectedPort(port) {
    chrome.serial.connect(port, onOpen);
  }

function getSelectedPortData(port){

  chrome.serial.connect(port, onReceive);

  

}


var weighing_scale_connection_id='';
 var stringReceived = '';
function onReceive(info) {
   stringReceived = '';

   weighing_scale_connection_id=info.connectionId;
chrome.serial.onReceive.addListener(onReceiveCallback);

}

function convertArrayBufferToString(buf){
  var bufView = new Uint8Array(buf);
  var encodedString = String.fromCharCode.apply(null, bufView);
  return decodeURIComponent(encodedString);
}




function disconnect_weighing_scale(){
      chrome.serial.disconnect(weighing_scale_connection_id,function() {

   });
}



function onReceiveCallback(info) {
    if (info.data) {
      var str = convertArrayBufferToString(info.data);
      stringReceived=stringReceived.concat(str);
      var searchTerm = 'kg';
      var indexOfFirst = stringReceived.indexOf(searchTerm);
      if(indexOfFirst>0){
        
        var weight=parseFloat(stringReceived.slice(indexOfFirst-7, indexOfFirst));

        if(weight !='Nan'){

        weight_data=weight;

        stringReceived="";
        }
      }
    }
  }







  function onOpen(connectionInfo) {
    if (!connectionInfo) {
      console.log('Could not open');
      return;
    }
    connectionInfo_g=connectionInfo;
    connectionId = connectionInfo.connectionId;
    console.log("Connected"+JSON.stringify(connectionInfo));


    var totalDataSize = data.length;
    var data_send = new ArrayBuffer(totalDataSize);
    var dataView = new Uint8Array(data_send, 0, totalDataSize);
    dataView.set(data, 0);


    chrome.serial.send(connectionId,data_send, function() {});
   // chrome.serial.send(connectionId, convertStringToArrayBuffer(data), function() {});
    chrome.serial.disconnect(connectionId,function() {
    connectionInfo_g=null;
    });
  };


  function send_data(send_data,printer){
    data=send_data;
    console.log('Data:'+data,'Printer:'+printer);

    let result = settings.filter(obj => {
      return obj.printer === printer
    })
    var current_set=result[0];

   
	console.log('get',send_data);
    var totalDataSize = send_data.length;
    var data_send = new ArrayBuffer(totalDataSize);
    var dataView = new Uint8Array(data_send, 0, totalDataSize);
    dataView.set(send_data, 0);
	
	console.log('Check',data_send);



    switch(current_set.connect){
      case 'serial':
      if (!connectionInfo_g) {
        openSelectedPort(current_set.value);
        return;
      }else{
      //  chrome.serial.send(connectionInfo_g.connectionId, convertStringToArrayBuffer(data), function() {});
      //  chrome.serial.disconnect(connectionId,function() {
       // connectionInfo_g=null;
      //  });
      }
      break;
      case 'usb':
      break;
      case 'net':
      tcpClient = new TcpClient(current_set.value,9100);
      tcpClient.connect(function() {
        console.log('Connected to ' + current_set.value + ':' + 9100);
        tcpClient.sendMessage(data_send,function(){
          tcpClient.disconnect();
        });
     
      });

      break;
    }



  }


  function get_data(printer){
 
    console.log('Data:'+data,'Printer:'+printer);

    let result = settings.filter(obj => {
      return obj.printer === printer
    })
    var current_set=result[0];


console.log('weight_scale',current_set);
   

    switch(current_set.connect){
      case 'serial':
      if (!connectionInfo_g) {
        getSelectedPortData(current_set.value);
        return;
      }else{
      //  chrome.serial.send(connectionInfo_g.connectionId, convertStringToArrayBuffer(data), function() {});
      //  chrome.serial.disconnect(connectionId,function() {
       // connectionInfo_g=null;
      //  });
      }
      break;
      case 'usb':
      break;
      case 'net':
      tcpClient = new TcpClient(current_set.value,9100);
      tcpClient.connect(function() {
        console.log('Connected to ' + current_set.value + ':' + 9100);
        tcpClient.sendMessage(data_send,function(){
          tcpClient.disconnect();
        });
     
      });

      break;
    }



  }








