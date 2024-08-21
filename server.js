
const express = require('express');
const cors = require('cors');
const currency = require('currency.js');
require('dotenv').config();
const fs = require('fs').promises;

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// Input `nodemon server` to start server


app.get('/', (req, res) => {
    res.status(200).json({"message": "server is running"});	

});

app.get('/total-balances/:user_id',async (req, res) => {
    const {user_id} = req.params;
    console.log('goo');
    try{
        const response = await fs.readFile('./data.json','utf-8');
        const data = JSON.parse(response);

        const user = data.find((obj) => obj.user_id == user_id);
        if(!user){
            return res.status(404).json({"message": 'User not found'});
        }
        const balances = user.balances;

        return res.status(200).json(balances);
        
    }catch(err){
        return res.status(500).json({ "error": 'Internal server error' });
        
    }

});

app.get('/transfers/:user_id', async (req, res) => {
    const {user_id} = req.params;

    try{
        const response = await fs.readFile('./data.json','utf-8');
        const data = JSON.parse(response);

        const user = data.find((obj) => obj.user_id == user_id);
        if(!user){
            return res.status(404).json({"message": 'User not found'});
        }

        const current_time = new Date("2024-08-21T08:00:10"); //new Date();

        const recent_transfers = user.transfers.filter((transfer) => {
            const transfer_time = new Date(transfer.timestamp);
            return current_time - transfer_time <= 86400000;
        });

        const USDT_sum = recent_transfers.filter((transfer) => transfer.currency === 'USDT').reduce((sum, transfer) => sum.add(transfer.amount), currency(0));
        const USDC_sum = recent_transfers.filter((transfer) => transfer.currency === 'USDC').reduce((sum, transfer) => sum.add(transfer.amount), currency(0));
        const ETH_sum = recent_transfers.filter((transfer) => transfer.currency === 'ETH').reduce((sum, transfer) => sum.add(transfer.amount), currency(0));

        const transfer_volumes = {
            "USDT_volumes": USDT_sum,
            "USDC_volumes": USDC_sum,
            "ETH_volumes": ETH_sum
        }

        return res.status(200).json(transfer_volumes);
        
    }catch(err){
        return res.status(500).json({ "error": 'Internal server error' });
        
    }
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});