# User API Documentation

## Endpoints

### 1. Register User

- **URL:** `/api/v1/users/register`
- **Method:** `POST`
- **Description:** Registers a new user.
- **Request Body:**
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  - **Success:** `200 OK`
    ```json
    {
      "user": {
        "_id": "user_id",
        "fullName": {
          "firstName": "John",
          "lastName": "Doe"
        },
        "email": "john.doe@example.com",
        "createdAt": "timestamp",
        "updatedAt": "timestamp"
      },
      "accessToken": "access_token",
      "refreshToken": "refresh_token"
    }
    ```
    - Cookies:
      - `accessToken`: The access token.
      - `refreshToken`: The refresh token.
  - **Error:** `400 Bad Request` if email is already registered.

### 2. Login User

- **URL:** `/api/v1/users/login`
- **Method:** `POST`
- **Description:** Logs in an existing user.
- **Request Body:**
  ```json
  {
    "email": "john.doe@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  - **Success:** `200 OK`
    ```json
    {
      "user": {
        "_id": "user_id",
        "fullName": {
          "firstName": "John",
          "lastName": "Doe"
        },
        "email": "john.doe@example.com"
      },
      "accessToken": "access_token",
      "refreshToken": "refresh_token"
    }
    ```
    - Cookies:
      - `accessToken`: The access token.
      - `refreshToken`: The refresh token.
  - **Error:** `404 Not Found` if user is not found.
  - **Error:** `400 Bad Request` if password is incorrect.

### 3. Logout User

- **URL:** `/api/v1/users/logout`
- **Method:** `POST`
- **Description:** Logs out the current user.
- **Headers:**
  - `Authorization: Bearer <access_token>`
- **Response:**
  - **Success:** `200 OK`
    ```json
    {
      "message": "User logged out successfully"
    }
    ```
    - Cookies:
      - `accessToken`: Cleared.
      - `refreshToken`: Cleared.
  - **Error:** `500 Internal Server Error` if logout fails.

### 4. Register Captain

- **URL:** `/api/v1/captains/register`
- **Method:** `POST`
- **Description:** Registers a new captain.
- **Request Body:**
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "password": "password123",
    "vechicalType": "car",
    "vehicalCapacity": 4,
    "vehicalColor": "red",
    "vehicalPlate": "ABC123"
  }
  ```
- **Response:**
  - **Success:** `200 OK`
    ```json
    {
      "captain": {
        "_id": "captain_id",
        "fullName": {
          "firstName": "John",
          "lastName": "Doe"
        },
        "email": "john.doe@example.com",
        "vehical": {
          "color": "red",
          "plate": "ABC123",
          "capacity": 4,
          "vehicleType": "car"
        },
        "createdAt": "timestamp",
        "updatedAt": "timestamp"
      },
      "accessToken": "access_token",
      "refreshToken": "refresh_token"
    }
    ```
    - Cookies:
      - `captainAccessToken`: The access token.
      - `captainRefreshToken`: The refresh token.
  - **Error:** `400 Bad Request` if email is already registered.

### 5. Login Captain

- **URL:** `/api/v1/captains/login`
- **Method:** `POST`
- **Description:** Logs in an existing captain.
- **Request Body:**
  ```json
  {
    "email": "john.doe@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  - **Success:** `200 OK`
    ```json
    {
      "captain": {
        "_id": "captain_id",
        "fullName": {
          "firstName": "John",
          "lastName": "Doe"
        },
        "email": "john.doe@example.com",
        "vehical": {
          "color": "red",
          "plate": "ABC123",
          "capacity": 4,
          "vehicleType": "car"
        }
      },
      "accessToken": "access_token",
      "refreshToken": "refresh_token"
    }
    ```
    - Cookies:
      - `captainAccessToken`: The access token.
      - `captainRefreshToken`: The refresh token.
  - **Error:** `404 Not Found` if captain is not found.
  - **Error:** `400 Bad Request` if password is incorrect.

### 6. Logout Captain

- **URL:** `/api/v1/captains/logout`
- **Method:** `POST`
- **Description:** Logs out the current captain.
- **Headers:**
  - `Authorization: Bearer <captainAccessToken>`
- **Response:**
  - **Success:** `200 OK`
    ```json
    {
      "message": "Captain logged out successfully"
    }
    ```
    - Cookies:
      - `captainAccessToken`: Cleared.
      - `captainRefreshToken`: Cleared.
  - **Error:** `500 Internal Server Error` if logout fails.

### 7. Create Ride

- **URL:** `/api/v1/rides/create`
- **Method:** `POST`
- **Description:** Creates a new ride.
- **Headers:**
  - `Authorization: Bearer <access_token>`
- **Request Body:**
  ```json
  {
    "pickup": "Pickup location",
    "destination": "Destination location",
    "vehicleType": "car"
  }
  ```
- **Response:**
  - **Success:** `201 Created`
    ```json
    {
      "ride": {
        "_id": "ride_id",
        "user": "user_id",
        "pickup": "Pickup location",
        "destination": "Destination location",
        "fare": 100,
        "otp": "1234",
        "status": "pending",
        "createdAt": "timestamp",
        "updatedAt": "timestamp"
      }
    }
    ```
  - **Error:** `400 Bad Request` if required fields are missing.
  - **Error:** `500 Internal Server Error` if ride creation fails.

### 8. Calculate Fare

- **URL:** `/api/v1/rides/fare`
- **Method:** `POST`
- **Description:** Calculates the fare for a ride.
- **Headers:**
  - `Authorization: Bearer <access_token>`
- **Request Body:**
  ```json
  {
    "pickup": "Pickup location",
    "destination": "Destination location"
  }
  ```
- **Response:**
  - **Success:** `200 OK`
    ```json
    {
      "fare": {
        "auto": 50,
        "car": 100,
        "bike": 30
      }
    }
    ```
  - **Error:** `400 Bad Request` if required fields are missing.
  - **Error:** `500 Internal Server Error` if fare calculation fails.

### 9. Get Coordinates

- **URL:** `/api/v1/maps/get-cordinates`
- **Method:** `GET`
- **Description:** Gets the coordinates for a given address.
- **Headers:**
  - `Authorization: Bearer <access_token>`
- **Query Parameters:**
  - `address`: The address to get coordinates for.
- **Response:**
  - **Success:** `200 OK`
    ```json
    {
      "lat": 40.7128,
      "lng": -74.0060
    }
    ```
  - **Error:** `400 Bad Request` if address is missing or invalid.
  - **Error:** `500 Internal Server Error` if fetching coordinates fails.

### 10. Get Distance and Time

- **URL:** `/api/v1/maps/get-distance-time`
- **Method:** `GET`
- **Description:** Gets the distance and time between two locations.
- **Headers:**
  - `Authorization: Bearer <access_token>`
- **Query Parameters:**
  - `origin`: The origin location.
  - `destination`: The destination location.
- **Response:**
  - **Success:** `200 OK`
    ```json
    {
      "distance": {
        "text": "10 km",
        "value": 10000
      },
      "duration": {
        "text": "15 mins",
        "value": 900
      }
    }
    ```
  - **Error:** `400 Bad Request` if origin or destination is missing.
  - **Error:** `500 Internal Server Error` if fetching distance and time fails.

### 11. Get AutoComplete Suggestions

- **URL:** `/api/v1/maps/get-suggestions`
- **Method:** `GET`
- **Description:** Gets autocomplete suggestions for a given address.
- **Headers:**
  - `Authorization: Bearer <access_token>`
- **Query Parameters:**
  - `address`: The address to get suggestions for.
- **Response:**
  - **Success:** `200 OK`
    ```json
    {
      "predictions": [
        {
          "description": "New York, NY, USA",
          "place_id": "ChIJOwg_06VPwokRYv534QaPC8g"
        },
        {
          "description": "Newark, NJ, USA",
          "place_id": "ChIJHQ6aMnBTwokRkF7gRz8T2kA"
        }
      ]
    }
    ```
  - **Error:** `400 Bad Request` if address is missing or invalid.
  - **Error:** `500 Internal Server Error` if fetching suggestions fails.

## Middleware

### verifyJWT

- **Description:** Middleware to verify JSON Web Token (JWT).
- **Usage:** Applied to protected routes to ensure the user is authenticated.

### verifyCaptainJWT

- **Description:** Middleware to verify JSON Web Token (JWT) for captains.
- **Usage:** Applied to protected routes to ensure the captain is authenticated.

## Models

### User

- **Schema:**
  ```json
  {
    "fullName": {
      "firstName": "String",
      "lastName": "String"
    },
    "email": "String",
    "password": "String",
    "socketId": "String",
    "refreshToken": "String"
  }
  ```

### Captain

- **Schema:**
  ```json
  {
    "fullName": {
      "firstName": "String",
      "lastName": "String"
    },
    "email": "String",
    "password": "String",
    "socketId": "String",
    "status": "String",
    "vehical": {
      "color": "String",
      "plate": "String",
      "capacity": "Number",
      "vehicleType": "String"
    },
    "location": {
      "lat": "Number",
      "lng": "Number"
    },
    "refreshToken": "String"
  }
  ```

### Ride

- **Schema:**
  ```json
  {
    "user": "ObjectId",
    "captain": "ObjectId",
    "pickup": "String",
    "destination": "String",
    "fare": "Number",
    "status": "String",
    "duration": "Number",
    "distance": "Number",
    "paymentID": "String",
    "orderId": "String",
    "signature": "String",
    "otp": "String"
  }
  ```

## Utilities

### generateAccessAndRefreshToken

- **Description:** Generates access and refresh tokens for a user or captain.
- **Parameters:** `userId` or `captainId`
- **Returns:** `{ accessToken, refreshToken }`
