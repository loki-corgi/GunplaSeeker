# GunplaSeeker
A full-stack web application to track, store, and view listings of Gundam model kits.

---

## Features

- Add and list Gundam models
- Schema validation using MongoDB
- Search and filter by model name, grade, price, timestamp, province in ascending or descending order
- Server-side rendering with EJS
  
---

## Technologies Used

- Node.js + Express
- MongoDB (with JSON Schema validation)
- EJS templating
- CSS (custom + Google Fonts)
- JavaScript (client-side + fetch API)

---

## Project Structure

gunplaseeker/

│

├── controllers/ # Logic for routes

├── database/ # database setup/schema

├── public/ # Static assets (CSS, fonts, etc.)

├── routes/ # Express route handlers

├── views/ # EJS templates

├── app.js # Main server file

└── README.md # This file

---

## Setup & Installation

1. Get file from source
2. install dependencies
   
  ``` 
  npm init -y;
  npm install;
  ```

3. start the server
   
  ```
  npm start
  ```

4. Open in browser:

  http://localhost:3000

### Also rendered at

https://gunplaseeker.onrender.com/

---

## Example POST Request

Use fetch() to add a model and trigger validation:

```javascript
fetch("http://localhost:3000/api/v1/model", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded"
  },
  body: new URLSearchParams({
    modelName: "RX-78-2",
    modelGrade: "High Grade",
    price: "29.99",
    storeName: "Hobby Planet",
    streetNumber: "123",
    streetName: "Model Ave",
    city: "Toronto",
    province: "ON"
  })
});
```

Use to fetch a json from api:

```javascript
fetch("http://localhost:3000/api/v1/model", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    modelName: "RX-78-2",
    modelGrade: "High Grade",
    price: "29.99",
    storeName: "Hobby Planet",
    streetNumber: "123",
    streetName: "Model Ave",
    city: "Toronto",
    province: "ON"
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(err => console.error(err));
```

### Valid Model Grades

See full list in /database/collections.js

---

## Schema Validation Rules

| **Collection**         | **Field**        | **BSON Type** | **Validation Rules**                                                                  | **Required** | **Description**                                 |
| ---------------------- | ---------------- | ------------- | ------------------------------------------------------------------------------------- | ------------ | ----------------------------------------------- |
| **gundam-models-list** | **modelName**    | string        | minLength: 1, maxLength: 50                                                           | Yes          | Model Name must be between 1 and 50 characters  |
| **gundam-listings**    | **timestamp**    | date          | Required                                                                              | Yes          | Must be a Date object                           |
|                        | **model\_Id**    | objectId      | Required, references the `gundam-models-list` document                                | Yes          | Reference to the Gundam model document          |
|                        | **modelGrade**   | string        | enum: \['Advance Grade', 'Entry Grade', 'EX Model', ...]                              | Yes          | Must be one of the valid Gundam model grades    |
|                        | **price**        | decimal       | minimum: 0                                                                            | Yes          | Price must be a dollar amount greater than 0    |
|                        | **storeName**    | string        | minLength: 2, maxLength: 40                                                           | Yes          | Store name must be between 2 and 40 characters  |
|                        | **streetNumber** | int           | minimum: 1                                                                            | Yes          | Street number must be an integer greater than 0 |
|                        | **streetName**   | string        | minLength: 2, maxLength: 40                                                           | Yes          | Street name must be between 2 and 40 characters |
|                        | **city**         | string        | minLength: 3, maxLength: 40                                                           | Yes          | City name must be between 3 and 40 characters   |
|                        | **province**     | string        | enum: \['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'] | Yes          | Must be a valid province or territory of Canada |

