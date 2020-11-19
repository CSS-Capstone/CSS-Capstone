const Image = require();

function Hotel(name) {       // Accept name and age in the constructor
    this.name = name || null;
}

Hotel.prototype.getUserId = function() {
    return this.userId;
}

Hotel.prototype.setUserId = function(userId) {
    this.userId = userId;
}

Hotel.prototype.getHotelId = function() {
    return this.hotelId;
}

Hotel.prototype.setHotelId = function(hotelId) {
    this.hotelId = hotelId;
}

Hotel.prototype.getName = function() {
    return this.name;
}

Hotel.prototype.setName = function(name) {
    this.name = name;
}

Hotel.prototype.getPrice = function() {
    return this.price;
}

Hotel.prototype.setPrice = function(price) {
    this.price = price;
}

Hotel.prototype.getAddress = function() {
    return this.adress;
}

Hotel.prototype.setAddress = function(address) {
    this.address = address;
}

Hotel.prototype.getCity = function() {
    return this.city;
}

Hotel.prototype.setCity = function(city) {
    this.city = city;
}

Hotel.prototype.getCounty = function() {
    return this.country;
}

Hotel.prototype.setCountry = function(city) {
    this.country = country;
}

Hotel.prototype.getImages = function() {
    return this.images;
}

Hotel.prototype.setImages = function(images) {
    if (!this.images) {
        this.images = images;
    } else {

    }
}

Hotel.prototype.equals = function(otherHotel) {
    return otherHotel.getName() == this.getName()
        && otherHotel.getAddress() == this.getAddress()
        && otherHotel.getHotelId() == this.getHotelId();
}

Hotel.prototype.fill = function(newFields) {
    for (var field in newFields) {
        if (this.hasOwnProperty(field) && newFields.hasOwnProperty(field)) {
            if (this[field] !== 'undefined') {
                this[field] = newFields[field];
            }
        }
    }
};

module.exports = Hotel;  