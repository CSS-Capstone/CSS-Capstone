//Get all the question elements for enabling dropdown
var questions = document.getElementsByClassName("question_clicker");
var i;

//loop to get to the desired question
for (i = 0; i < questions.length; i++)
{
    questions[i].addEventListener("click", function() {
        // console.log(this.innerHTML);
        
        // change the arrow from up to down and vice versa
        // since we get the icon tag as an HTML element, I use this format
        if(this.getElementsByClassName('fa')[0].className === "fa fa-angle-double-up")
        {
            this.getElementsByClassName('fa')[0].className = "fa fa-angle-double-down";
        }
        else if(this.getElementsByClassName('fa')[0].className == "fa fa-angle-double-down")
        {
            this.getElementsByClassName('fa')[0].className = "fa fa-angle-double-up";
        }
        
        // hover and clicking the questions effect
        this.classList.toggle("active");
        var answer = this.nextElementSibling;
        if(answer.style.display === "block")
        {
            answer.style.display = "none";
        }
        else
        {
            answer.style.display = "block";
        }
    });
}