function Image(name) {       // Accept name and age in the constructor
    this.name = name || null;
}

Image.prototype.getUserId = function() {
    return this.userId;
}

Image.prototype.setUserId = function(userId) {
    this.userId = userId;
}

Image.prototype.getImages = function() {
    return this.images;
}

Image.prototype.setImages = function(images) {
    if (!this.images) {
        this.images = images;
    } else {
        
    }
}

Image.prototype.equals = function(otherImage) {
    return otherImage.getName() == this.getName()
        && otherImage.getAge() == this.getAge();
}

Image.prototype.fill = function(newFields) {
    for (var field in newFields) {
        if (this.hasOwnProperty(field) && newFields.hasOwnProperty(field)) {
            if (this[field] !== 'undefined') {
                this[field] = newFields[field];
            }
        }
    }
};

module.exports = Image;  