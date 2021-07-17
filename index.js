var $ = function(id) { return document.getElementById(id); };
var $_class = function(id) { return document.getElementsByClassName(id); };
var $_name =function(id) { return document.getElementsByName(id); };
/**
 * Select and print to USB printers
 */

function save_settings() {
  var select_class= $_class('select_field');
  var devices=[];
  var data;
  for(let item of select_class){
    var str_id =item.id;
    var str_id = str_id.split("_");
    var parameter_value=$_name('value_'+item.value+'_'+str_id[2])[0].value;
    switch(item.value){
      case 'serial':
      console.log('Serial:'+parameter_value);
      break;
      case 'net':
      console.log('NET:'+parameter_value);
      break;
      case 'usb':
      console.log('USB:'+parameter_value);
      break;
  }
   var printer='printer_'+str_id[2];
   data={'printer':printer,'connect':item.value,'value':parameter_value};  
  devices.push(data);
}
console.log(JSON.stringify(devices));






   chrome.storage.local.set({port:devices}, function() {
     console.log('Value is set');
   });
}

function change_select(){

  var str_id =this.id;
  var str_id = str_id.split("_");
  switch(this.value){
    case 'serial':
    console.log('serial');

    document.getElementById("serial_port_"+str_id[2]).style.display  = "block";
    document.getElementById("usb_device_"+str_id[2]).style.display  = "none";
    document.getElementById("network_address_"+str_id[2]).style.display  = "none";
    break;
    case 'net':
    document.getElementById("serial_port_"+str_id[2]).style.display  = "none";
    document.getElementById("usb_device_"+str_id[2]).style.display  = "none";
    document.getElementById("network_address_"+str_id[2]).style.display  = "block";
    break;
    case 'usb':
    document.getElementById("serial_port_"+str_id[2]).style.display  = "none";
    document.getElementById("usb_device_"+str_id[2]).style.display  = "block";
    document.getElementById("network_address_"+str_id[2]).style.display  = "none";    
    break;
  }
}
function click_test(){
  console.log(this.id+'Clicked');

  

  var data=[0x1B,0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0x77, 0x6f, 0x72, 0x6c, 0x64, 0x0a, 0x1d, 0x56, 0x41, 0x03];
  send_data(data,this.id);



  
}


function test_weighing_scale(){

  console.log('click_weight');
  get_data('printer_w');


}




window.addEventListener('DOMContentLoaded', function() {
    var select_class= $_class('select_field');
  $('save').addEventListener('click', save_settings);	
  $('test_weight').addEventListener('click', test_weighing_scale); 


 	
  for(let item of select_class){
    $(item.id).addEventListener('change', change_select);

    var str_id =item.id;
        str_id = str_id.split("_");


    $('printer_'+str_id[2]).addEventListener('click', click_test);	
  }
  console.log('Created');

});

function SelectElement(id, valueToSelect)
{    
    var element = document.getElementById(id);
    element.value = valueToSelect;
}






onload = function() {

  var onDeviceFound = function(devices) {
    console.log(devices);
    var usb_select =$_class('usb_devices');
    for(let item of usb_select){
     
      if(devices.length == 0) {
        console.log('No devices selected');
        return;
      }

          devices.forEach(function(device) {
          var option = document.createElement("option");
          option.text =device.productName+'-'+device.manufacturerName;
          option.value = device.productId+'-'+device.vendorId;
          $(item.id).add(option);
        
      });
    }
  }
// Allow the user to select any devices listed in the manifest
  filters = chrome.runtime.getManifest().optional_permissions[0].usbDevices;
// chrome.usb.getUserSelectedDevices({'multiple': true, 'filters': filters}, onDeviceFound)
  chrome.usb.getDevices({'filters': filters}, onDeviceFound)


  chrome.serial.getDevices(function(ports) {
    var port_select =$_class('ports');
    for(let item of port_select){
      
      if(ports.length == 0) {
        console.log('No ports found');
        return;
      }
         ports.forEach(function(port) {
          var option = document.createElement("option");
          option.text =port.path;
          option.value = port.path;
          $(item.id).add(option);
      });
    }  

  chrome.storage.local.get(['port'], function(result) {
    console.log('add_event');
    console.log(result);
    for(let item of result.port){
      var str_id =item.printer;
      var str_id = str_id.split("_");
      var el = $('connect_printer_'+str_id[1]);
      el.value=item.connect;
      var event = new Event('change');
      el.dispatchEvent(event);
      $_name('value_'+item.connect+'_'+str_id[1])[0].value=item.value;
    }
  });


  });




};
