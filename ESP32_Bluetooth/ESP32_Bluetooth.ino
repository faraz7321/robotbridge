#include "BluetoothSerial.h"

#if !defined(CONFIG_BT_ENABLED) || !defined(CONFIG_BLUEDROID_ENABLED)
#error Bluetooth is not enabled! Please run `make menuconfig` to and enable it
#endif

BluetoothSerial SerialBT;
String MAC_Address;
String RxBuffer = "";


// Bluetooth Event Handler CallBack Function Definition
void BT_EventHandler(esp_spp_cb_event_t event, esp_spp_cb_param_t *param) {
  Serial.println("Event: " + String(event));
  Serial.printf("ESP_SPP_DATA_IND_EVT len=%d, handle=%d\n\n", param->data_ind.len, param->data_ind.handle);
  // Serial.write(param->data_ind.data, param->data_ind.len);

  // Serial.println("Data: " + String(*param->data_ind.data));
 
  if (event == ESP_SPP_START_EVT) {
    Serial.println("Initialized SPP");
  }
  else if (event == ESP_SPP_SRV_OPEN_EVT ) {
    Serial.println("Client connected");
  }
  else if (event == ESP_SPP_CLOSE_EVT  ) {
    Serial.println("Client disconnected");
  }
  else if (event == ESP_SPP_DATA_IND_EVT ) {
    Serial.println("Data received");
    while (SerialBT.available()) {
      int incoming = SerialBT.read();
      Serial.println(incoming);
    }
  }
}


void setup() {
  Serial.begin(115200);
  SerialBT.begin("ESP32RoboBridge"); //Bluetooth device name
  Serial.println("The device started, now you can pair it with bluetooth!");
  SerialBT.register_callback(BT_EventHandler);
  MAC_Address = SerialBT.getBtAddressString();
  Serial.println(MAC_Address.c_str());
  
}

void loop() {
//  if (SerialBT.available()){
////    String bt_data = SerialBT.readString();
////    Serial.println("Received data: ");
//    Serial.println(SerialBT.read());
//  }

//  while(SerialBT.available() && SerialBT.read() != '\n'){
//    char incomingChar = SerialBT.read();
//    RxBuffer += String(incomingChar);
//  }
//  RxBuffer = "";
//  delay(20);


//  if (Serial.available()) {
//    SerialBT.write(Serial.read());
//  }
//  if (SerialBT.available()) {
//    Serial.write(SerialBT.read());
//  }
//  delay(20);
}
