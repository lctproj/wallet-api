
const express = require('express');
require('dotenv').config();

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
 
// Input `npm start server` to start server


app.get('/', (req, res) => {
    res.status(200).json({"message": "Hello, world!"});	

});

app.get('/total-balances/:user_id',async (req, res) => {
    const {user_id} = req.params;
    try{
        const response = await fetch('./data.json');
        const data = await response.json();

        const user = data.find((obj) => obj.user_id == user_id);
        const balance = user.balance;

        res.status(200).json(balance);
        return
    }catch(err){
        res.status(500);
        return
    }

});

app.get('/transfers/:user_id', async (req, res) => {
    const {user_id} = req.params;

    try{
        const response = await fetch('./data.json');
        const data = await response.json();
        const user = data.find((obj) => obj.user_id === user_id);

        console.log(user);

        const current_time = new Date();
        const recent_transfers = user.transfer.filter((transfer) => current_time - Date(transfer.timestamp) <= 8640000);

        res.status(200).json(recent_transfers);
        return;
    }catch(err){
        res.status(500);
        return;
    }
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});