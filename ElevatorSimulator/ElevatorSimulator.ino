#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <LedControl.h>
#include <ESP8266WebServer.h>


// #define CLK_PIN   14 // or SCK      D5
//#define DATA_PIN  13 // or MOSI     D7
//#define CS_PIN    15 // or SS //    D8
#define MAX_DEVICES 1

ESP8266WebServer server(80);

LedControl lc = LedControl(DATA_PIN,CLK_PIN, CS_PIN, MAX_DEVICES );

// Display code


// Byte array for arrow up
byte arrowUp[8] = {
  B00001000,
  B00000100,
  B00000010,
  B11111111,
  B11111111,
  B00000010,
  B00000100,
  B00001000
};

// Byte array for arrow down
byte arrowDown[8] = {
  B00010000,
  B00100000,
  B01000000,
  B11111111,
  B11111111,
  B01000000,
  B00100000,
  B00010000
};





//void animateArrow(byte animation[][8]) {
//  // Animate arrow scrolling
//  for (int i = 0; i < 8; i++) {
//    for (int j = 0; j < 8; j++) {
//      lc.setRow(0, j, animation[i][j]);
//    }
//    delay(delaytime);
//  }
//}

void displayArrow(byte pattern[]) {
  for (int i = 0; i < 8; i++) {
    lc.setRow(0, i, pattern[i]);
  }
}

void clearArrow() {
  // Clear the arrow from the display
  lc.clearDisplay(0);
}



// Elevator Code

const int firstFloor = 17; // D0
const int secondFloor = 18; // D1
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

      // Display arrow direction
      if (targetFloorNum > currentFloorNum) {
        displayArrow(arrowUp);   // Display arrow up
        // animateArrow(arrowUpAnimation); // Arrow pointing up
      } else {
        displayArrow(arrowDown); // Display arrow down
        // animateArrow(arrowDownAnimation); // Arrow pointing down
      }
      
      Serial.print("Moving from floor ");
      Serial.print(currentFloorNum);
      Serial.print(" to floor ");
      Serial.println(targetFloorNum);
      // Simulate moving time
      delay(abs(targetFloorNum - currentFloorNum) * 5000); // 1 second per floor
      currentFloor = floor;

      clearArrow();
      // finished switching
      digitalWrite(currentFloor, HIGH);
      openDoors();
    }

    void openDoors() {
      state = DOORS_OPENING;
      Serial.println("Doors opening.");
      delay(3000); // Simulate doors opening
      closeDoors();
    }
    
    void closeDoors() {
      state = DOORS_CLOSING;
      Serial.println("Doors closing.");
      delay(3000); // Simulate doors closing
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

const char* ssid = "FarazWifi";
const char* password = "12345678";

int parseLevel(int level) {
  switch(level) {
    case 1: return firstFloor;
    case 2: return secondFloor;
    case 3: return thirdFloor;
    default: return firstFloor;
  }
}


void callElevator() {
  Serial.println("Call API called");
  if (server.hasArg("level")) {
    String level = server.arg("level");
    Serial.print("Call for Level: ");
    Serial.println(level.toInt());
//    int floor = parseLevel(level);
    elevator.callElevator(parseLevel(level.toInt()));
    server.send(200);
  } else {
    server.send(400);
  }
}

void getElevatorState() {
  int floorNum = elevator.getFloorNumber(elevator.getCurrentFloor());
  server.send(200, F("application/json"), "{\"level\":"+ String(floorNum) + ", \"state\":\"" + elevator.getState() + "\"}");
}


// Define routing
void restServerRouting() {
    server.enableCORS(true);
    server.on("/", HTTP_GET, []() {
        server.send(200, F("text/html"),
            F("Welcome to the REST Web Server"));
    });
    // server.on(F("/helloWorld"), HTTP_GET, getHelloWord);

    server.on(F("/call"), HTTP_POST, callElevator);
    server.on(F("/state"), HTTP_GET, getElevatorState);
}


// Manage not found URL
void handleNotFound() {
  String message = "File Not Found\n\n";
  message += "URI: ";
  message += server.uri();
  message += "\nMethod: ";
  message += (server.method() == HTTP_GET) ? "GET" : "POST";
  message += "\nArguments: ";
  message += server.args();
  message += "\n";
  for (uint8_t i = 0; i < server.args(); i++) {
    message += " " + server.argName(i) + ": " + server.arg(i) + "\n";
  }
  server.send(404, "text/plain", message);
}


void setup() {
  Serial.begin(115200);
  // Wait for Serial to initialize
  while (!Serial) {
    ; // wait for serial port to connect. Needed for native USB
  }


  // Initialize the MAX7219 device
  lc.shutdown(0, false);
  lc.setIntensity(0, 8);  // Set brightness level (0 is min, 15 is max)
  lc.clearDisplay(0);     // Clear display register

    // Set device as a Wi-Fi Station
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  
  pinMode(led, OUTPUT);

  pinMode(firstFloor, OUTPUT);
  pinMode(secondFloor, OUTPUT);
  pinMode(thirdFloor, OUTPUT);

  digitalWrite(firstFloor, HIGH);
  digitalWrite(secondFloor, LOW);
  digitalWrite(thirdFloor, LOW);
  
  digitalWrite(led, LOW);
  delay(100); 
  digitalWrite(led, HIGH);
  
  Serial.println("Elevator simulation started");

  // Set server routing
  restServerRouting();
  // Set not found response
  server.onNotFound(handleNotFound);
  // Start server
  server.begin();
  Serial.println("HTTP server started");
}

void loop() {

  if (WiFi.status() != WL_CONNECTED)
  {
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
      delay(100);
      digitalWrite(led, HIGH);
      delay(100);
      digitalWrite(led, LOW);
    }
    
    digitalWrite(led, HIGH);
    Serial.print("Connected to ");
    Serial.println(ssid);
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
  }

  server.handleClient();
}
