#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <espnow.h>


// REPLACE WITH RECEIVER MAC Address
uint8_t broadcastAddress[] = {0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF};

// Structure example to send data
// Must match the receiver structure
typedef struct struct_message {
  int floor;
} struct_message;

// Create a struct_message called myData
String myData;

unsigned long lastTime = 0;  
unsigned long timerDelay = 2000;  // send readings timer

// Callback when data is sent
void onDataSent(uint8_t *mac_addr, uint8_t sendStatus) {
  Serial.print("Last Packet Send Status: ");
  if (sendStatus == 0){
    Serial.println("Delivery success");
  }
  else{
    Serial.println("Delivery fail");
  }
}

// Callback function that will be executed when data is received
void onDataRecv(uint8_t * mac, uint8_t *incomingData, uint8_t len) {
  memcpy(&myData, incomingData, sizeof(myData));
//  Serial.print("Mac address: ");
//  Serial.println(mac);
  Serial.print("Bytes received: ");
  Serial.println(len);
  Serial.print("Received: ");
  Serial.print(myData);
  memcpy(&myData, incomingData, sizeof(myData));
//  Serial.print("call for floor: ");
//  Serial.println(myData.floor);
  Serial.println();
}
 
//void loop() {
//  if ((millis() - lastTime) > timerDelay) {
//    // Set values to send
//    strcpy(myData.a, "THIS IS A CHAR");
//    myData.b = random(1,20);
//    myData.c = 1.2;
//    myData.d = "Hello";
//    myData.e = false;
//
//    // Send message via ESP-NOW
//    esp_now_send(broadcastAddress, (uint8_t *) &myData, sizeof(myData));
//
//    lastTime = millis();
//  }
//}

const int firstFloor = 16; // D0
const int secondFloor = 5; // D1
const int thirdFloor = 4; // D2

class Elevator {
  private:
    int currentFloor;
    int targetFloor;
    enum State { IDLE, MOVING, DOORS_OPENING, DOORS_CLOSING } state;
    void moveToFloor(int floor) {
      if (floor == currentFloor) {
        openDoors();
        return;
      }

      // started to switch floor
      digitalWrite(currentFloor, LOW);
      state = MOVING;
      int currentFloorNum = getFloorNumber(currentFloor);
      int targetFloorNum = getFloorNumber(floor);
      Serial.print("Moving from floor ");
      Serial.print(currentFloorNum);
      Serial.print(" to floor ");
      Serial.println(targetFloorNum);
      // Simulate moving time
      delay(abs(targetFloorNum - currentFloorNum) * 1000); // 1 second per floor
      currentFloor = floor;

      // finished switching
      digitalWrite(currentFloor, HIGH);
      openDoors();
    }

    void openDoors() {
      state = DOORS_OPENING;
      Serial.println("Doors opening.");
      delay(1000); // Simulate doors opening
      closeDoors();
    }
    
    void closeDoors() {
      state = DOORS_CLOSING;
      Serial.println("Doors closing.");
      delay(1000); // Simulate doors closing
      state = IDLE;
    }
      public:
        Elevator() {
          this -> currentFloor = firstFloor;
          this -> targetFloor = firstFloor; 
          this -> state = IDLE;  
        }
    
    void callElevator(int floor) {
      targetFloor = floor;
      moveToFloor(targetFloor);
    }
    
    int getCurrentFloor() const {
      return currentFloor;
    }

    int getFloorNumber(int floor) const {
      switch(floor) {
        case firstFloor: return 1;
        case secondFloor: return 2;
        case thirdFloor: return 3;
        default: return 1;
      }
    }
    
    String getState() const {
      switch (state) {
        case IDLE: return "Idle";
        case MOVING: return "Moving";
        case DOORS_OPENING: return "Doors Opening";
        case DOORS_CLOSING: return "Doors Closing";
        default: return "Unknown";
      }
    }
};

Elevator elevator;

// board LED
const int led = 2;

//const char* ssid = "Schnuffinetz";
//const char* password = "6581771422494752";

void setup() {
  Serial.begin(115200);
  // Wait for Serial to initialize
  while (!Serial) {
    ; // wait for serial port to connect. Needed for native USB
  }

    // Set device as a Wi-Fi Station
  WiFi.mode(WIFI_STA);
  // WiFi.begin(ssid, password);
  // Init ESP-NOW
  if (esp_now_init() != 0) {
    Serial.println("Error initializing ESP-NOW");
    return;
  }
  pinMode(led, OUTPUT);

  pinMode(firstFloor, OUTPUT);
  pinMode(secondFloor, OUTPUT);
  pinMode(thirdFloor, OUTPUT);

  digitalWrite(firstFloor, LOW);
  digitalWrite(secondFloor, LOW);
  digitalWrite(thirdFloor, LOW);
  

  // Once ESPNow is successfully Init, we will register for Send CB to
  // get the status of Trasnmitted packet
  esp_now_set_self_role(ESP_NOW_ROLE_CONTROLLER);
  esp_now_register_send_cb(onDataSent);
  esp_now_register_recv_cb(onDataRecv);
  
  // Register peer
  esp_now_add_peer(broadcastAddress, ESP_NOW_ROLE_SLAVE, 1, NULL, 0);
  
  digitalWrite(led, LOW);
  delay(100); 
  digitalWrite(led, HIGH);
  
  Serial.println("Elevator simulation started");
}

void loop() {

//  if (WiFi.status() != WL_CONNECTED)
//  {
//    WiFi.begin(ssid, password);
//    while (WiFi.status() != WL_CONNECTED) {
//      delay(100);
//      digitalWrite(led, HIGH);
//      delay(100);
//      digitalWrite(led, LOW);
//    }
//    digitalWrite(led, HIGH);
//  }
  // Example usage
  Serial.print("Elevator state: ");
  Serial.print(elevator.getState());
  Serial.print(", Current Floor: ");
  Serial.println(elevator.getCurrentFloor());

  delay(5000); // Wait for 5 seconds before calling to another floor

  elevator.callElevator(secondFloor);
  Serial.print("Elevator state: ");
  Serial.print(elevator.getState());
  Serial.print(", Current Floor: ");
  Serial.println(elevator.getCurrentFloor());

  delay(5000); // Wait for 5 seconds before calling to another floor

  elevator.callElevator(thirdFloor);
  Serial.print("Elevator state: ");
  Serial.print(elevator.getState());
  Serial.print(", Current Floor: ");
  Serial.println(elevator.getCurrentFloor());

  // Add a long delay to avoid repeating the loop too quickly
  delay(5000);
}
