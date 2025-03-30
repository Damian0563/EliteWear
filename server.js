const express = require('express');
const path = require('path');
const app = express();
const session = require('express-session');
const fs=require('fs');
const cuid=require('cuid')
require('dotenv').config()
const { SendConfirmation, SaveOrder }=require('./post-payment.js')
const stripe=require('stripe')(process.env.STRIPE_KEY);
app.set('view engine', 'ejs');
app.use(session({
    secret: process.env.SECRET, // Replace with a more secure key
    resave: false, // Don't save session if unmodified
    saveUninitialized: true, // Save session even if it's new but not modified
    cookie: { 
      secure: false,  // Set to true if you're using HTTPS
      httpOnly: true, // Cookie is only accessible by the server
      maxAge: 60000 // Cookie expiration time (in ms)
    }
}));
app.use(express.static(path.join(__dirname, "public")));

app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.WEBHOOK_SECRET; 
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error('❌ Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        //console.log('✅ Payment successful for session:', session.id);
        try {
            const customerEmail = session.customer_details.email;
            const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
            const purchasedItems = await Promise.all(
                lineItems.data.map(async (item) => {
                    const product = await stripe.products.retrieve(item.price.product); 
                    return {
                        description: item.description,
                        quantity: item.quantity,
                        size: product.metadata.size || "N/A" // 
                    };
                })
            );
            //console.log('📦 Purchased Items Details:', purchasedItems);
            const id=String(cuid())
            await SaveOrder(purchasedItems,id,customerEmail)
            await SendConfirmation(customerEmail,id);
        } catch (error) {
            console.error('❌ Error retrieving line items:', error.message);
        }
    }
    res.json({ received: true });
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json())

app.get('/products', (req, res) => {
    fs.readFile('./products.json', 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading the file:', err);
          return;
        }
        const jsonData = JSON.parse(data);
        const payload=jsonData['sporting_clothing'];
        res.render('products.ejs', { products: payload });
    });
    
});

app.get('/products/:id', (req, res) => {
    fs.readFile('./products.json', 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading the file:', err);
          return;
        }
        const jsonData = JSON.parse(data);
        const payload=jsonData['sporting_clothing'].find(product=>Number(product.id)==Number(req.params.id));
        if (!payload) {
            return res.status(404).send('Product not found');
        }
        const similar_ids=payload['similar']
        let similar=[]
        for(id of similar_ids){
            similar.push(jsonData['sporting_clothing'].find(product=>Number(product.id)==Number(id)))
        }
        res.render('product.ejs', { product: payload ,similar:similar});
    });
});

app.post('/add_product',(req,res)=>{
    if (!req.session.cart) {
        req.session.cart = [];
    }
    if(!req.session.cart.includes(req.body.id)){
        req.session.cart.push([req.body.id,req.body.size]);
    }
    //console.log(req.session.cart);
    res.redirect('products/'+req.body.id);
})

app.get('/cart', (req, res) => {
    const cart = req.session.cart || [];
    let products=[];
    total=0;
    fs.readFile('./products.json', 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading the file:', err);
          return;
        }
        const jsonData = JSON.parse(data);
        for (let item of cart) {
            let id = item[0]; // Extract ID from cart array
            let product = jsonData['sporting_clothing'].find(p => Number(p.id) === Number(id));
            if (product) {
                products.push([product,item[1]]);
                total += Number(product.price);
            }
        }
        //console.log(products);        
        res.render('cart.ejs', {cart:products});
    });
});

app.post('/cart/:id', (req, res) => {
    const cart = req.session.cart || [];
    let index=-1
    for(let i=0;i<cart.length;i++){
        if (cart[i][0]==req.params.id){
            index=i;
            break;
        }
    }
    if(index!=-1) cart.splice(index,1);
    res.redirect('/cart');
});

app.get('/mission',(req,res)=>{
    res.render('mission.ejs');
})

app.get('/', (req, res) => {
    res.render('hello.ejs');
});


app.post('/checkout_session', async (req, res) => {
    try{
        const checkout=await stripe.checkout.sessions.create({
            payment_method_types:['card'],
            mode:'payment',
            line_items: req.body.items.map(item=>{
                const storeItem=require('./products.json')['sporting_clothing'].find(product=>Number(product.id)==Number(item.id));
                return {
                    price_data:{
                        currency:'usd',
                        product_data:{
                            name:storeItem.name,
                            images:[storeItem.image],
                            metadata: {size:item.metadata.size}
                        },
                        unit_amount:storeItem.price*100
                    },
                    quantity:item.quantity,
                }
            }),
            success_url: `${process.env.HOST}:${process.env.PORT}/`,
            cancel_url: `${process.env.HOST}:${process.env.PORT}/cart`,
        })
        res.json({url:checkout.url});
    }catch(e){
        res.status(500).json({error:e.message});
    }
})

app.listen(process.env.PORT, () => {
    console.log('Server is running on port 3000');
});



