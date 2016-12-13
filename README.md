# WarKu

![warku.png](https://github.com/ReiiYuki/WarKu/raw/master/Client/picture/logo.png)

WarKu is real-time strategy game which people can manage the village and create troop to have fun with the upgrading resource.

## Purpose

We took Database course. Professor assigned us to work on some project. So we purposed real-time strategy web-based game, because at that time I was Travian-addicted.

## Working Functions

There are a lot of function which is incomplete in this project. This following functions are working.
* Member Service
* Resource Upgrading
* Map
* Building Upgrading

## Tool

MySQL
Node.js
jQuery

## Installation Guide

1.  clone this repository

  ```
  https://github.com/ReiiYuki/WarKu.git
  ```

2. Setup your database in `Server\engine.js` and `Server\install.js`

  ```js
  var con = mysql.createConnection({
    host: "YOUR_HOST",
    user: "USERNAME",
    password: "PASSWORD",
    database: "DB_NAME"
  });
  ```

3. Setup game database in

  ```
  cd Server
  node install.js
  ```

4. Start Server

  ```
  node index.js
  ```

5. Now it works at PORT 5555 you can change port at the bottom of `Server\index.js`

## Project Status

We won't have any plan to continue this project on this repository.

## Inspiration

Travian which is real-time strategy web-based game from Germany.

## Background/Town sprite

All right served to Travian

## Contributors
* [Voraton Lertrattanapaisal (ReiiYuki)](https://github.com/ReiiYuki)
* [Wanchanapon Thanwaranurak (Paiizz)](https://github.com/PaiizZ)
* [Phasin Sarunpornkul (gunhappy)](https://github.com/gunhappy)

## License
MIT
