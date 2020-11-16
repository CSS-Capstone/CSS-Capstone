// DOM Element
const Body_Element = document.querySelector('.body_element');
const Load_Wrapper = document.querySelector('.loader-wrapper');
hideBody_element();
function hideBody_element() {
    Body_Element.style.display = 'none';

    if (Body_Element.style.display == 'none') {
        setTimeout( () => {
            Load_Wrapper.style.display = "none";
            Body_Element.style.display = "block";
        }, 2000);
    }
}
