//Libs for espnow e wifi
#include <esp_now.h>
#include <WiFi.h>
#include "BluetoothSerial.h"

//#if !defined(CONFIG_BT_ENABLED) || !defined(CONFIG_BLUEDROID_ENABLED)
//#error Bluetooth is not enabled! Please run `make menuconfig` to and enable it
//#endif

BluetoothSerial SerialBT;
String MAC_Address;


// Bluetooth Event Handler CallBack Function Definition
void BT_EventHandler(esp_spp_cb_event_t event, esp_spp_cb_param_t *param) {
  Serial.println("Event: " + String(event));
  // Serial.printf("ESP_SPP_DATA_IND_EVT len=%d, handle=%d\n\n", param->data_ind.len, param->data_ind.handle);
  // Serial.write(param->data_ind.data, param->data_ind.len);

  // Serial.println("Data: " + String(*param->data_ind.data));
 
//  if (event == ESP_SPP_START_EVT) {
//    Serial.println(F("Initialized SPP"));
//  }
//  else if (event == ESP_SPP_SRV_OPEN_EVT ) {
//    Serial.println(F("Client connected"));
//  }
//  else if (event == ESP_SPP_CLOSE_EVT  ) {
//    Serial.println(F("Client disconnected"));
//  }
//  else if (event == ESP_SPP_DATA_IND_EVT ) {
//    Serial.println(F("Data received"));
//    while (SerialBT.available()) {
//      int incoming = SerialBT.read();
//      Serial.println(incoming);
//    }
//  }
}


//Callback function that tells us when data from Master is received
void OnDataRecv(const uint8_t *mac_addr, const uint8_t *data, int data_len) {
  char macStr[18];
  //Copies the sender Mac Address to a string
  snprintf(macStr, sizeof(macStr), "%02x:%02x:%02x:%02x:%02x:%02x",
           mac_addr[0], mac_addr[1], mac_addr[2], mac_addr[3], mac_addr[4], mac_addr[5]);
  //Prints it on Serial Monitor
  Serial.print(F("Received from: ")); 
  Serial.println(macStr);
  
}

void setup() {
  Serial.begin(115200);
  
  //Calculation of gpio array size:
  //sizeof(gpios) returns how many bytes "gpios" array points to.
  //Elements in this array are of type uint8_t.
  //sizeof(uint8_t) return how many bytes uint8_t type has.
  //Therefore if we want to know how many gpios there are,
  //we divide the total byte count of the array by how many bytes
  //each element has.

  //Puts ESP in STATION MODE
  WiFi.mode(WIFI_STA);

  //Shows on the Serial Monitor the STATION MODE Mac Address of this ESP
  // Serial.print(F("Mac Address in Station: ")); 
  // Serial.println(WiFi.macAddress());

  //If the initialization was successful
  if (esp_now_init() == ESP_OK) {
    // Serial.println(F("ESPNow Init Success"));
  }
  //If there was an error
  else {
    // Serial.println(F("ESPNow Init Failed"));
    ESP.restart();
  }

  //Registers the callback function that will be executed when 
  //this Slave receives data from the Master.
  //The function in this case is called OnDataRecv
  esp_now_register_recv_cb(OnDataRecv);

    // Serial.begin(115200);
  SerialBT.begin("ESP32RoboBridge"); //Bluetooth device name
  // Serial.println(F("The bluetooth device started, now you can pair it with bluetooth!"));
  SerialBT.register_callback(BT_EventHandler);
  MAC_Address = SerialBT.getBtAddressString();
  Serial.println(MAC_Address.c_str());
}


//We don't do anything on the loop.
//Everytime something comes from Master
//the OnDataRecv function is executed automatically
//because we added it as callback using esp_now_register_recv_cb
void loop() {
}
