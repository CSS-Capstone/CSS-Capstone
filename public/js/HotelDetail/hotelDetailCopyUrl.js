// DOM Elements
const toolTipText = document.querySelector('.tooltiptext');
const copyLink = document.querySelector('.copyLink');
// Event listener
copyLink.addEventListener('click', (event) => {
    copyUrl();
    changeToolTipText();
});

copyLink.addEventListener('mouseleave', (event) => {
    resetToolTipText();
});

// Util Function
function copyUrl() {
    const dummyInput = document.createElement('input'),
    text = window.location.href;
    document.body.appendChild(dummyInput);
    dummyInput.value = text;
    dummyInput.select();
    document.execCommand('copy');
    document.body.removeChild(dummyInput);
}
// onclick change textcontent
function changeToolTipText() {
    toolTipText.textContent = `Linked has been Copied`;
}
// on mouse leave change text content
function resetToolTipText() {
    toolTipText.textContent = `Click to Copy URL`;
    
}
