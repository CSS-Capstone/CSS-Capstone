DROP TABLE IF EXISTS `css_capstone`.`USER`;
DROP TABLE IF EXISTS `css_capstone`.`HOTEL`; 
DROP TABLE IF EXISTS `css_capstone`.`BOOKING`;
DROP TABLE IF EXISTS `css_capstone`.`COMMENT`;

CREATE TABLE `css-capstone`.`USER` (
	`user_id` INT NOT NULL AUTO_INCREMENT UNIQUE,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `username` VARCHAR(30) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    -- user address? 
-- 	`country` VARCHAR(30) NOT NULL,
--     `city` VARCHAR(30) NOT NULL,
--     `state` VARCHAR(20) NOT NULL,
--     `zip_code` INT NOT NULL,
--     `address` VARCHAR(100) NOT NULL,
    `is_host` BOOLEAN NOT NULL,
    `is_developer` BOOLEAN NOT NULL,
	PRIMARY KEY(`user_id`));
    
CREATE TABLE `css-capstone`.`HOTEL` (
	`hotel_id` INT NOT NULL AUTO_INCREMENT UNIQUE,
    `hotel_name` VARCHAR(100) NOT NULL,
    -- hotel image needed to be figured out -- 
    `hotel_price` DECIMAL(7,2) NOT NULL,
    -- what if a hotel has more than one rooms
    -- create a new table for a room in each hotel
    `country` VARCHAR(30) NOT NULL,
    `city` VARCHAR(30) NOT NULL,
    `state` VARCHAR(20) NOT NULL,
    `zip_code` INT NOT NULL,
    `address` VARCHAR(100) NOT NULL,
    `isAPI` BOOLEAN NOT NULL,
    `isDeveloper` BOOLEAN NOT NULL,
    `user_id` INT NOT NULL,
	PRIMARY KEY(`hotel_id`),
    FOREIGN KEY(`user_id`) REFERENCES USER(`user_id`));
    
CREATE TABLE `css-capstone`.`BOOKING` (
	`booking_id` INT NOT NULL AUTO_INCREMENT,
	`booking_date` DATE NOT NULL,
    `booking_price` DECIMAL(7,2) NOT NULL,
    `user_id` INT NOT NULL,
    `hotel_id` INT NOT NULL,
	PRIMARY KEY(`booking_id`),
	FOREIGN KEY(`user_id`) REFERENCES USER(`user_id`),
	FOREIGN KEY(`hotel_id`) REFERENCES HOTEL(`hotel_id`));

CREATE TABLE `css-capstone`.`COMMENT`(
	`comment_id` INT NOT NULL AUTO_INCREMENT UNIQUE,
    `rating` DECIMAL(2,1) NOT NULL,
    `comment_date` DATE NOT NULL,
    `comment_content` TEXT NOT NULL,
    `user_id` INT NOT NULL,
    `hotel_id` INT NOT NULL,
	PRIMARY KEY(`comment_id`),
    FOREIGN KEY(`user_id`) REFERENCES USER(`user_id`),
	FOREIGN KEY(`hotel_id`) REFERENCES HOTEL(`hotel_id`));
