# mars-guide
Mobile app (IOS, Android) on Cordova.
- video guide (HTML5 player)
- locate user with BLE iBeacons
- interact with installations

copy  *./src/config.example.js* to *./src/config.js*, then edit it.

### npm run
```sh
"copy": "cp -R ./src/res ./dist/",
"build": "npm run copy && export NODE_ENV='production' && webpack",
"dev": "npm run copy && export NODE_ENV='development' && webpack -w"
````