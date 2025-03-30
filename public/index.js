document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.slides img');
    const dots = document.querySelectorAll('.dot');
    let slideIndex = 0;
    let interval = null;

    function showSlide(index) {
        if (index >= slides.length) {
            slideIndex = 0; // Restart at the first slide
        } else if (index < 0) {
            slideIndex = slides.length - 1; // Go to last slide
        } else {
            slideIndex = index; // Set slide index
        }

        slides.forEach(slide => slide.classList.remove('displaySlide'));
        dots.forEach(dot => dot.classList.remove('curr_dot'));
        slides[slideIndex].classList.add('displaySlide');
        dots[slideIndex].classList.add('curr_dot');
    }

    function prevSlide() {
        clearInterval(interval)
        showSlide(slideIndex - 1);
    }

    function nextSlide() {
        showSlide(slideIndex + 1);
    }

    // Attach event listeners
    document.querySelector('.prev')?.addEventListener('click', prevSlide);
    document.querySelector('.next')?.addEventListener('click', nextSlide);

    function initialize() {
        if (slides.length > 0) {
            slides[slideIndex].classList.add('displaySlide'); // Show first slide
            dots[slideIndex].classList.add('curr_dot'); // Highlight first dot
            interval = setInterval(nextSlide, 4000); // Auto-slide every 4 seconds
        }
    }
    initialize();
    const questions = document.querySelectorAll('.question');
    const answers=document.querySelectorAll('.answer');
    for(let i=0;i<questions.length;i++){
        questions[i].addEventListener('click',()=>{
            answers[i].classList.toggle('active');
        })
    }

    const add=document.getElementById('add');
    add.addEventListener('click',()=>{
        fetch('/add_product',{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({
                id:document.getElementById('id').value,
                size:document.getElementById('size').value,
            })
        }).then(response=>{
            if (response.ok){
                document.getElementById('mess').style.display='block'
                document.getElementById('collapse').addEventListener('click',()=>{
                    document.getElementById('mess').style.display='none'
                })
                return response.json();
            }
            return response.json().then(json=>Promise.reject(json));
        }).then(({message})=>{
            console.log(message);
        }).catch(e=>{
            console.error(e.error);
        })
    })
});

