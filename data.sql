CREATE DATABASE verceldb;

CREATE TABLE
    todos (
        id VARCHAR(255) PRIMARY KEY,
        user_email VARCHAR(255),
        title VARCHAR(300),
        progress INT,
        date VARCHAR(300),
        todayy INT,
    );
    CREATE TABLE 
    tryhard (
        id VARCHAR(255) PRIMARY KEY,
        user_email VARCHAR(255),
        title VARCHAR(300),
        progress INT,
        date VARCHAR(300),
        ,
    );


CREATE TABLE
    users(
        email VARCHAR(255) PRIMARY KEY,
        hashed_password VARCHAR(255),
        streak INT,

    );