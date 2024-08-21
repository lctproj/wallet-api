
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const fs = require('fs').promises;

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// Input `npm start server` to start server


app.get('/', (req, res) => {
    res.status(200).json({"message": "server is running"});	

});

app.get('/total-balances/:user_id',async (req, res) => {
    const {user_id} = req.params;
    console.log('goo');
    try{
        const response = await fs.readFile('./data.json','utf-8');
        const data = JSON.parse(response);

        console.log('data = ' + JSON.stringify(data, null, 2));
        const user = data.find((obj) => obj.user_id == user_id);
        console.log('user = ' + JSON.stringify(user,null,2));
        if(!user){
            return res.status(404).json({"message": 'User not found'});
        }
        const balances = user.balances;

        return res.status(200).json(balances);
        
    }catch(err){
        return res.status(500);
        
    }

});

app.get('/transfers/:user_id', async (req, res) => {
    const {user_id} = req.params;

    console.log('go');
    try{
        const response = await fs.readFile('./data.json','utf-8');
        const data = JSON.parse(response);
        console.log('data = ' + JSON.stringify(data, null, 2));

        const user = data.find((obj) => obj.user_id == user_id);
        console.log('user = ' + JSON.stringify(user,null,2));

 
        const current_time = new Date();
        console.log(current_time);
        const recent_transfers = user.transfers.filter((transfer) => {
            const transferTime = new Date(transfer.timestamp);
            return current_time - Date(transfer.timestamp) <= 8640000;
        });

        return res.status(200).json(recent_transfers);
        ;
    }catch(err){
        return res.status(500);
        
    }
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});