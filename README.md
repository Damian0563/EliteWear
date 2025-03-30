
# EliteWear
E-commerce web application
=======
This project was made by Damian Piechocki.
It is an e-commerce service which allows users to order products.
The app supports in-session cart manipulation, checkouts, e-mail confirmations.
Frontend is fairly well developed.

## Worthwhile commands:
    stripe listen --forward-to
    node server.js 

## Technologies used:
    node.js
    mongodb
    ejs templating language, css
Additionally, the app makes use of third party services such as **stripe dashboard** and **mailslurp**.
The products are read from a json file, each product contains its unique id. The products seen on site
are fetched from the web, these **products are not for sale**. 

What is more the payment system is in test mode,
which means that it's validity can be checked by inputting **4242 4242 4242 4242** in the card number and **expired date**
in the appropraite input field.

In addition, the **mailslurp email domain usage requires renewal once every 3 days**, which is not ideal, but at least it is free.
The sent and received mails can be seen on mailslurp's dashboard uppon loging in **https://www.mailslurp.com/**.
