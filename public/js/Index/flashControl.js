const indexFlashContainer = document.querySelector('.index_flash_container_error');
setTimeout( () => {
    if (indexFlashContainer) {
        indexFlashContainer.style.display = "none";
    }
}, 3000);
