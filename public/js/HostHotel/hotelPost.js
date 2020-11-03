let globalIndex = 0;
displayTabs(0);

function displayTabs(index) {
    let allFormTabs = document.querySelectorAll('.tab');
    let prevBtn = document.querySelector('#prevBtn');
    let nextBtn = document.querySelector('#nextBtn');
    // console.log(allFormTabs);
    // console.log(globalIndex);
    allFormTabs[index].style.display = "block";
    if (index === 0) {
        prevBtn.style.display = 'none';
    } else {
        prevBtn.style.display = 'block';
    }
    if (index === (allFormTabs.length - 1)) {
        nextBtn.innerHTML = 'Submit';
    } else {
        nextBtn.innerHTML = 'Next';
    }
    indicateTheSteps(index);
}

function manageIndexByButton(indexVal) {
    let allFormTabs = document.querySelectorAll('.tab');
    let prevBtn = document.querySelector('#prevBtn');
    let nextBtn = document.querySelector('#nextBtn');
    let formSubmition = document.querySelector('#regForm');
    if (indexVal == 1 && !inputValidation()) {
        return false;
    }

    allFormTabs[globalIndex].style.display = 'none';
    globalIndex = globalIndex + indexVal;
    if (globalIndex >= allFormTabs.length) {
        formSubmition.submit();
        return false;
    }
    displayTabs(globalIndex);
}

function indicateTheSteps(n) {
    // This function removes the "active" class of all steps...
    let allSteps = document.querySelectorAll('.step');
    for (let i = 0; i < allSteps.length; i++) {
        allSteps[i].className = allSteps[i].className.replace(" active", "");
    }
    //... and adds the "active" class on the current step:
    allSteps[n].className += " active";
}

function inputValidation() {
    let allFormTabs = document.querySelectorAll('.tab');
    let inputTags = allFormTabs[globalIndex].getElementsByTagName("input");
    let isValid = true;
    for (var i = 0; i < inputTags.length; i++) {
        // GIVE ALL PAGE RESTRICTION 
        if (inputTags[i].value == "") {
            inputTags[i].className += " invalid";
            isValid = false;
        }     
    }
    
    if (globalIndex == 1) {
        console.log("Global Index is 1");
        let hotelCostValue = inputTags[0].value;
        console.log(hotelCostValue);
        if (isNaN(hotelCostValue)) {
            console.log("it is not a number");
            inputTags[0].className += " invalid";
            isValid = false;
        }
    }

    if (isValid) {
        document.querySelectorAll('.step')[globalIndex].className += " finish";
    }
    return isValid;
}

function manageData() {
    let allFormTabs = document.querySelectorAll('.tab');
    let inputTags = allFormTabs[globalIndex].getElementsByTagName("input");
    if (globalIndex == 2) {
        let cityValue = inputTags[globalIndex].value;
        console.log("The City is ", cityValue);
    }
}
