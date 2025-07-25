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
   
  npm init -y
  npm install
  
4. start the server

  npm start
  
6. Open in browser:

  http://localhost:3000

---

## Example POST Request

Use fetch() to add a model and trigger validation:

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

Valid Model Grades

See full list in /database/collections.js

---

## Schema Validation Rules

    modelName: required, 1–50 chars
    
    modelGrade: must match allowed enum
    
    price: must be a valid decimal
    
    streetNumber: integer ≥ 1
    
    province: must be valid Canadian province code
