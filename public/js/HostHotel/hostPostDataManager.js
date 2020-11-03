// // DOM ELEMENTS
// const allPossibleTabsInForm = document.querySelectorAll('.tab');
// const nextButtonDOMForImageCheck = document.querySelector('#nextBtn');
// // Event Listener
// nextButtonDOMForImageCheck.addEventListener('click', (event) => {
//     if (allPossibleTabsInForm[5].style.display === 'block') {
//         //console.log("Goit it to the image  tab");
//         //window.onload = () => {
//             if (window.File && window.FileList && window.FileReader) {
//                 console.log("Pass Window File Tests");
//                 let imageFileInput = document.querySelector('#imageFiles');
//                 imageFileInput.addEventListener('change', (event) => {
//                     console.log("Change");
//                     let imageFileList = event.target.files;
//                     let outputImageContainer = document.querySelector('#result');
//                     console.log(imageFileList);
//                     for (let i = 0; i < imageFileList.length; i++) {
//                         let eachFile = imageFileList[i];
//                         if (!eachFile.type.match('image')) {
//                             continue;
//                         }
//                         // =========================
//                         // ==========================
//                         let fileReader = new FileReader();
//                         fileReader.addEventListener('load', (event) => {
//                             // const formData = new FormData();
//                             // formData.append('hotelImageFile', event.target);
//                             let imageFileSrc = event.target.result;
//                             let imageFileName = event.target.name;
//                             console.log(event.taget);
//                             let divElementDOM = document.createElement('div');
//                             let iconElementDOM = document.createElement('span');
//                             //iconElementDOM.classList.add("far fa-trash-alt");
//                             divElementDOM.classList.add("imageDivContainer");
//                             iconElementDOM.classList.add("imageTrashSpan");
//                             divElementDOM.innerHTML = `<img class='uploadImageContainer' src="${imageFileSrc}" title="${imageFileName}"/>`;
//                             iconElementDOM.innerHTML = `<i class="far fa-trash-alt "></i>`;
//                             divElementDOM.appendChild(iconElementDOM);
//                             outputImageContainer.insertBefore(divElementDOM, null);
//                             iconElementDOM.addEventListener('click', (event) => {
//                                 console.log(event.target);
//                                 console.log(event.target.parentElement.parentElement);
//                                 event.target.parentElement.parentElement.remove();
//                             });
//                         });
//                         //Read the image
//                         console.log(eachFile);
//                         fileReader.readAsDataURL(eachFile);
//                     }
//                 });
//             } else {
//                 alert('Sorry your browser does not support image upload');
//             }
//         // };
//     }
// });
