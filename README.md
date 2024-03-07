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