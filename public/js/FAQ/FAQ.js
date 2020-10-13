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

// chatbot DOM Element
const chatbot = document.querySelector('.chatbot_icon');
// chatbot EventListener
chatbot.addEventListener('click', this.displayChatBot);
// chatbot util function
function displayChatBot() {
    const chatbotContainer = document.querySelector('.catbot_container');
    const chatbot_icon = document.querySelector('.chatbot_icon');
    chatbotContainer.classList.toggle('catbot_hidden');
    if (chatbotContainer.classList.contains('catbot_hidden')) {
        chatbot_icon.classList.remove('fa-comment-dots');
        chatbot_icon.classList.add('fa-times-circle');
    } else {
        chatbot_icon.classList.remove('fa-times-circle');
        chatbot_icon.classList.add('fa-comment-dots');
    }
}
