

function getProfilePhoto(userPhotos) {
    if(userPhotos.length == 0) {
        return "<img class='profile__image' src='images/default_user_profile_img_login.png'/>";
    } else {
        
    }
}

function getSubPhotos(user) {

}

async function getImage() {
    const data = s3.getObject(params).promise();
    return data;
};

function encode(data) {
    let buf = Buffer.from(data);
    let base64 = buf.toString('base64');
    return base64;
}

getImage().then((img) => {
    let image = "<img class='profile__image' src='data:image/jpeg;base64," + encode(img.Body) + "'" + "/>";
    res.render('pages/users', { image });
}).catch((e)=> {
    console.log(e);
});

module.exports = { encode };
