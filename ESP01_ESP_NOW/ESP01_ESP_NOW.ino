#include <ESP8266WiFi.h>
#include <espnow.h>

#define MY_BLUE_LED_PIN 1

// REPLACE WITH THE MAC Address of your receiver 
uint8_t broadcastAddress[] = {0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF};

// Callback when data is sent
void OnDataSent(uint8_t *mac_addr, uint8_t sendStatus) {
  Serial.print("Last Packet Send Status: ");
  if (sendStatus == 0){
    Serial.println("Delivery success");
  }
  else{
    Serial.println("Delivery fail");
  }
}

// Callback when data is received
void OnDataRecv(uint8_t * mac_addr, uint8_t *incomingData, uint8_t len) {

  digitalWrite(MY_BLUE_LED_PIN, LOW);   // Turn the LED on (Note that LOW is the voltage level
  // but actually the LED is on; this is because
  // it is active low on the ESP-01)
  delay(500);                      // Wait for a second
  digitalWrite(MY_BLUE_LED_PIN, HIGH);
  
  char macStr[18];
  //Copies the sender Mac Address to a string
  snprintf(macStr, sizeof(macStr), "%02x:%02x:%02x:%02x:%02x:%02x",
           mac_addr[0], mac_addr[1], mac_addr[2], mac_addr[3], mac_addr[4], mac_addr[5]);
  //Prints it on Serial Monitor
  Serial.print(F("Received from: ")); 
  Serial.println(macStr);
  Serial.print("Bytes received: ");
  Serial.println(len);
}

void setup() {
  Serial.begin(115200);

  Serial.println("Setting WiFi Stattion");
  // Set device as a Wi-Fi Station
  WiFi.mode(WIFI_STA);

  pinMode(MY_BLUE_LED_PIN, OUTPUT); 

  // Init ESP-NOW
  if (esp_now_init() != 0) {
    Serial.println("Error initializing ESP-NOW");
    return;
  }

  Serial.println("ESP_NOW started successfully...");

  // Set ESP-NOW Role
  esp_now_set_self_role(ESP_NOW_ROLE_COMBO);

  // Once ESPNow is successfully Init, we will register for Send CB to
  // get the status of Trasnmitted packet
  esp_now_register_send_cb(OnDataSent);
  
  // Register peer
  esp_now_add_peer(broadcastAddress, ESP_NOW_ROLE_COMBO, 1, NULL, 0);
  
  // Register for a callback function that will be called when data is received
  esp_now_register_recv_cb(OnDataRecv);

  Serial.println("Callback registered...");
  
}



void loop() {

}
