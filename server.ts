import express, { Express, Request, Response } from "express";

const helmet = require('helmet');
const cors = require('cors');
const currency = require('currency.js');
require('dotenv').config();
const fs = require('fs').promises;
const rateLimit = require('express-rate-limit');
const app : Express = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(helmet());

// Input `npm run dev` to start server
const limiter = rateLimit({
    windowMs: 60000,
    max: 10,
  });
  
app.use(limiter);

type Balance = {
    "USDC": number,
    "USDT": number,
    "ETH" : number 
}

type Transfer = {
    "currency": "USDC" | "USDT" | "ETH",
    "amount": number,
    "timestamp": string,
}

type User = {
    "user_id": string ,
    "balances": Balance,
    "transfers": Transfer[]
}

app.get('/', (req: Request, res: Response) => {
    res.status(200).json({"message": "server is running"});	

});

app.get('/total-balances/:user_id',async (req: Request, res: Response) => {
    const {user_id} = req.params;
    try{


        const response = process.env.URL ?  await fetch(`${process.env.URL}`) : await fs.readFile('./data.json','utf-8');
        const data = JSON.parse(response);

        const user = data.find((obj: { user_id: string; }) => obj.user_id == user_id);
        if(!user){
            return res.status(404).json({"message": 'User not found'});
        }
        const balances : Balance = user.balances;

        return res.status(200).json(balances);
        
    }catch(err){
        return res.status(500).json({ "error": 'Internal server error' });
        //testtest
    }

});

app.get('/transfers/:user_id', async (req, res) => {
    const {user_id} = req.params;

    try{
        const response = process.env.URL ?  await fetch(`${process.env.URL}`) : await fs.readFile('./data.json','utf-8');

        const data  = JSON.parse(response);

        console.log('data:' + typeof(data));
        const user   = data.find((obj: { user_id: string; }) => obj.user_id == user_id);
        console.log(typeof(user));
        if(!user){
            return res.status(404).json({"message": 'User not found'});
        }

        const current_time :number = new Date("2024-08-21T08:00:10").getTime(); //replace with generic new Date() when completed testing

        const recent_transfers  = user.transfers.filter((transfer: { timestamp: string | number | Date; }) => {
            const transfer_time = new Date(transfer.timestamp).getTime();
            return current_time - transfer_time <= 86400000;
        });

        console.log(typeof(recent_transfers));

        const USDT_sum :number = recent_transfers
            .filter((transfer: { currency: string; }) => transfer.currency === 'USDT')
            .reduce((sum: { add: (arg0: any) => any; }, transfer: { amount: any; }) => sum.add(transfer.amount), currency(0))
            .value;
        console.log(typeof(USDT_sum));
        const USDC_sum :number= recent_transfers.filter((transfer: { currency: string; }) => transfer.currency === 'USDC').reduce((sum: { add: (arg0: any) => any; }, transfer: { amount: any; }) => sum.add(transfer.amount), currency(0)).value;
        const ETH_sum :number= recent_transfers.filter((transfer: { currency: string; }) => transfer.currency === 'ETH').reduce((sum: { add: (arg0: any) => any; }, transfer: { amount: any; }) => sum.add(transfer.amount), currency(0)).value;

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