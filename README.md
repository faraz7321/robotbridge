# Elevator to robot

The target of this prototype is to evaluate if we can connect any elevator to the robots of AutoXing.

## REST-API

We developed a standard REST-API to play around with the elevator.

This API can be accessed via SwaggerUI.

It is located under `./openapi`. To launch the swagger ui just run the `start.sh` script of the openapi folder.
It will be hosted under `http://localhost:8080`.

## Links

- Cloud admin console for the robot `https://serviceglobal.autoxing.com/`
- REST-API Book of the robot itself `https://autoxingtech.github.io/axbot_rest_book`

Robot-IP can be obtained form the robots debug page
- Admin dashboard of the robot `http://<robot-ip>:8090/rb-admin/auth/login`
- REST-API of the robot `http://<robot-ip>:8000`


## From AutoXing
### Secondary development related documents
#### I. For secondary development of business functions based on robots, it is recommended to use the SDK access method.
1. SDK is compatible with the development requirements of the following situations:
2. The robot has a host computer and an operation screen, and business functions and applications are developed based on the robot's screen operating system and the host computer on the robot;
3. Based on the terminal operation business development outside the robot, such as based on pads, mobile phones, PCs, other handheld devices, business cloud management systems, etc. to develop robot management functions and applications.
4. The SDK has encapsulated various functions for common business scenarios, including customizing various robot tasks and task management, including local applications and webview applications. You can quickly build the business processes and functions you want based on the SDK and demo, which is simple and easy to use. According to the actual development needs of most customers, the SDK has examples and documents in two languages, js-sdk and java-sdk.
5. The SDK supports multiple connection methods to control the robot, including local direct connection to the robot, LAN connection, and WAN connection.
6. SDK documentation and example code:
- js-SDK documentation: https://autoxingtech.github.io/axdoc/en/
- js-SDK server example: http://serviceglobal.autoxing.com/sdk/v1.0/example/
- js-SDK server example source code (JS version): https://github.com/AutoxingTech/AX_SDK1.0_Example
- js-SDK Android example source code: https://github.com/AutoxingTech/android_webview_demo
- Java-SDK example source code: https://github.com/AutoxingTech/AX_Java_SDK1.0_Example

#### II. If you want to develop in multiple development languages ​​more freely, especially through cloud platforms, WMS and MES systems, mobile devices, etc. to develop between cloud management systems, you can use cloud API to access, you can get the robot status or send tasks
- Cloud API documentation: https://serviceglobal.autoxing.com/docs/api/en-us/
- Cloud API DEMO source code: https://github.com/AutoxingTech/APIDemo

#### III. REST API documentation at the robot chassis control system level: https://autoxingtech.github.io/axbot_rest_book/

**Note:** This type of interface has no business layer logic, such as no task management interface, no information such as points in the business map, and no combined task flow. It is a pure robot chassis interface that simply controls robot actions.This interface is for advanced development users to understand the basic functions of the chassis. It is not open to ordinary developers because it does not have business layer logic and requires customers to develop application logic themselves.Unless specifically customized, this part does not provide additional development technical support.

#### IV. External elevator control access interface:
1. We recommend using our elevator control module hardware. Our elevator control module supports elevator control services by default and does not require additional development.
2. If you want to use a third-party elevator control for robot access, you need to follow the interface definition and connect and transmit the information and status of the third-party elevator control according to this interface protocol, and then you can connect the third-party elevator control to our elevator and robot services:
http://serviceglobal.autoxing.com/docs/elevator-control/ 