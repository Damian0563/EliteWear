document.addEventListener('DOMContentLoaded', () => {
    const checkout = document.getElementById('checkout');
    checkout.addEventListener('click',()=>{
        let prods=[]
        let ids=document.getElementsByName('id');
        let quantities=document.getElementsByName('quantity');
        let sizes=document.getElementsByName('size');
        for (let i=0;i<ids.length;i++){
            prods.push({id:ids[i].value,quantity:quantities[i].value,metadata:{size:sizes[i].value}});
        }
        fetch('/checkout_session',{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({
                items:prods
            })
        }).then(response=>{
            if (response.ok){
                return response.json();
            }
            return response.json().then(json=>Promise.reject(json));
        }).then(({url})=>{
            window.location=url
        }).catch(e=>{
            console.error(e.error);
        })
    })
    function getTotal(){
        let numbers = document.getElementsByName('quantity');
        let values = document.getElementsByName('price');
        let total = 0;

        for (let i = 0; i < numbers.length; i++) {
            let quantity = Number(numbers[i].value);
            let price = Number(values[i].textContent.replace('.00$', '').trim()); // Remove currency formatting

            if (!isNaN(quantity) && !isNaN(price)) {
                total += quantity * price;
            } else {
                console.error("Invalid number:", quantity, price);
            }
        }
        document.getElementById('total').innerHTML = `Total: ${total}.00$`;
    }
    const ids = document.getElementsByName('id');

    ids.forEach(idElement => {
        let id = idElement.value; // Extract the actual ID

        let plus = document.getElementById(`plus-${id}`);
        let minus = document.getElementById(`minus-${id}`);
        let quantityInput = document.getElementById(`quantity-${id}`);

        if (plus) {
            plus.addEventListener('click', () => {
                quantityInput.value = Number(quantityInput.value) + 1;
                getTotal();
            });
        }

        if (minus) {
            minus.addEventListener('click', () => {
                if (quantityInput.value >= 2) {
                    quantityInput.value = Number(quantityInput.value) - 1;
                    getTotal();
                }
            });
        }
    });
    getTotal();
})