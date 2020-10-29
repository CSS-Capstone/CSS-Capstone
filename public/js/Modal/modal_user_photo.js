function openForm() {
    console.log("openForm called");
    document.body.classList.add("showForm");
}

function closeForm() {
    document.body.classList.remove("showForm");
}

function upload(input){
    var xhr = new XMLHttpRequest();
    xhr.upload.onprogress = function(e) {
        console.log(e.loaded, e.total)
    }
    xhr.upload.onload = function(e) {
        console.log('file upload')
    }

    xhr.open("POST", "/test/uploadfile.php", true);
    xhr.send(new FormData(input.parentElement));
}