showAllSlides();

        // truncate all 20 top rated haotel and see if they got any pictures
        function showAllSlides() {
            var size = parseInt(document.getElementById("size-of-hotel-rendered").innerText);
            // console.log(size, typeof(size));
            var sliderId = "top-rated-slider-";
            var currSliderNum = "";
            for (let i = 0; i < size; i++) {
                currSliderNum = i.toString();
                sliderId = sliderId + currSliderNum;
                var currSlider = document.getElementById(sliderId);
                // console.log(currSlider);
                if (currSlider !== null) {
                    // console.log(sliderId);
                    currSlider.currSlideIndex = 1;
                    showSlides(currSlider.currSlideIndex, currSlider);
                }
                sliderId = "top-rated-slider-";
            }
        }

        function plusSlides(n, slideshow) {
            console.log(slideshow);
            showSlides(slideshow.currSlideIndex += n, slideshow);
        }
        
        function currentSlide(n, slideshow) {
            showSlides(slideshow.currSlideIndex = n, slideshow);
        }
        
        function showSlides(n, slideshow) {
            var i;
            var slides = slideshow.getElementsByClassName("mySlides");
            if (n > slides.length) {slideshow.currSlideIndex = 1}    
            if (n < 1) {slideshow.currSlideIndex = slides.length}
            for (i = 0; i < slides.length; i++) {
                slides[i].style.display = "none";  
            }
            slides[slideshow.currSlideIndex-1].style.display = "block";  
        }