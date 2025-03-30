const mailer=require('nodemailer')
const mongoose = require('mongoose');
require('dotenv').config()

async function SendConfirmation(email,id){
    
    const transporter=mailer.createTransport({
        host: process.env.TRANSPORTER_HOST,
        port: process.env.TRANSPORTER_PORT,
        secure:false,
        auth: {
            user: process.env.TRANSPORTER_USER,
            pass: process.env.TRANSPORTER_PASS
        }
    })
    await transporter.sendMail({
        from: process.env.TRANSPORTER_USER,
        to:`${email}`,
        subject:'EliteWear order confirmation',
        text:`
            Hello,
            This is the confirmation of the order. If you will have any questions please contact us.
            Your order id is: ${id}.

            -EliteWear Team
        `
    })
}

const orderSchema = new mongoose.Schema({
    OrderId: String,
    OrderDate: { type: Date, default: Date.now },
    Mail: String,
    Items: [
        {
            description: String,
            quantity: Number,
            size: String,
        }
    ]
});
const Order = mongoose.model('Order', orderSchema);

async function SaveOrder(items, id, mail) {
    try {
        await mongoose.connect(process.env.MONGO_CONNECT);
        const order_ = new Order({
            OrderId: id,
            OrderDate: new Date(),
            Mail: mail,
            Items: items
        });
        await order_.save();
        console.log('Entry saved');
    } catch (error) {
        console.error('Error saving order:', error);
    } finally {
        await mongoose.connection.close();
    }
}


module.exports = {
    SendConfirmation,
    SaveOrder
}