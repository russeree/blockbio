import dotenv from 'dotenv';
import {TwitterApi} from 'twitter-api-v2';
import esMain from 'es-main';
import CoinGecko from 'coingecko-api';
import bitcoin_rpc from 'node-bitcoin-rpc';
import {createCanvas,loadImage,registerFont} from 'canvas';
import * as fs from 'fs';


dotenv.config();

class BlockBio{
    constructor(bioText = ''){
        this.bioText = bioText;
        this.client = new TwitterApi({
            appKey: process.env.TWITTER_API_KEY,
            appSecret: process.env.TWITTER_API_KEY_SECRET,
            accessToken: process.env.TWITTER_ACCESS_TOKEN,
            accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET
        });
        this.coinGeckoClient = new CoinGecko();
        this.initBitcoinRPC();
    }
    /**
     *Initialization of the bitcoin RPC
     */
    initBitcoinRPC(){
        bitcoin_rpc.init(
            process.env.BITCOIN_NODE_HOST,
            process.env.BITCOIN_NODE_PORT,
            process.env.BITCOIN_NODE_USERNAME,
            process.env.BITCOIN_NODE_PASSWORD
        )
        bitcoin_rpc.setTimeout(30000);
    }
    /**
     *Appends text to your profile banner.
     */
    async setBitcoinProfileBanner(){
        try{
            registerFont('./fonts/Hack-Bold.ttf', {family: 'Hack'});
            const canvas = createCanvas(1500,500)
            const ctx = canvas.getContext('2d')
            const banner = await loadImage('twitter_banner/1500x500.jpg');
            let timechainInfo = await this.btcCoreDirectRPC('getblockchaininfo');
            let mempoolInfo = await this.btcCoreDirectRPC('getmempoolinfo');
            let networkInfo = await this.btcCoreDirectRPC('getnetworkinfo');
            let current = new Date();
            let cTimeStamp = `${current.toLocaleDateString()} ${current.toLocaleTimeString()}`;
            let mempoolSizeMB = (mempoolInfo.result.bytes/1000000).toFixed(2);
            let sizeOnDiskGB = (timechainInfo.result.size_on_disk/1000000000).toFixed(2);
            ctx.globalAlpha = 0.25;
            ctx.drawImage(banner,0,0);
            ctx.globalAlpha = 1.0;
            ctx.font = '48px Courier';
            ctx.fillStyle = 'black';
            ctx.fillText(`> TIMECHAIN HEIGHT    | ${timechainInfo.result.blocks} BLOCKS`,50,50);
            ctx.fillText(`> TIMECHAIN SIZE      | ${sizeOnDiskGB} GB`, 50,100);
            ctx.fillText(`> MEMPOOL SIZE        | ${mempoolSizeMB} MB`,50,150);
            ctx.fillText(`> MEMPOOL UNCONFIRMED | ${mempoolInfo.result.size} TXs`, 50, 200);
            ctx.fillText(`> MEMPOOL TOTAL FEES  | ${mempoolInfo.result.total_fee} BTC`, 50, 250);
            ctx.fillText(`> NETWORK CONNECTIONS | ${networkInfo.result.connections}`, 50, 300);
            ctx.fillText(`> NETWORK VERSION     | ${networkInfo.result.version}`,50,350);
            ctx.fillText(`  --------------------|`,50,400);
            ctx.fillText(`> UPDATED             | ${cTimeStamp} PST`,50,450);
            // Write the image to file
            const buffer = canvas.toBuffer("image/png");
            await fs.writeFileSync("./banner.png", buffer);
            await this.client.v1.updateAccountProfileBanner("./banner.png", {
                width: 1500,
                height: 500
            })
        }
        catch{e=>{
            console.log(`Failed to updated profile banner with error:${e}`);
        }}
    }
    /**
     *Appends the bitcoin price to bio
     */
    async setPriceBio(){
        let geckoData = await this.coinGeckoClient.exchanges.fetchTickers('bitfinex', {
            coin_ids: ['bitcoin']
        });
        for(let ticker of geckoData.data.tickers){
            if(ticker.target == 'USD'){
                let current = new Date();
                let cTimeStamp = `${current.toLocaleDateString()} ${current.toLocaleTimeString()}`;
                let priceText = parseInt(ticker.last).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                console.log(`Updated bio price with a value of $${priceText}`)
                await this.client.v1.updateAccountProfile({description: `${this.bioText} BTC/USD $${priceText} - ${cTimeStamp} PST`});
            }
        }
    }
    /**
     * Updates a twitter bio by appending mempool/timechain info.
     */
    async setNodeBio(){
        let timechainInfo = await this.btcCoreDirectRPC('getblockchaininfo');
        let mempoolInfo = await this.btcCoreDirectRPC('getmempoolinfo');
        let mempoolSizeMB = (mempoolInfo.result.bytes/1000000).toFixed(2);
        console.log(`Updating Twitter description with block height ${timechainInfo.result.blocks}`)
        await this.client.v1.updateAccountProfile({description: `${this.bioText} - 🟧 timechain height ${timechainInfo.result.blocks} - Mempool Size ${mempoolSizeMB} MB`});
    }
    /**
     *Get the current bitcoin core node mempool info.
     */
    async btcCoreDirectRPC(command, args = []){
        return new Promise((resolve, reject)=>{
            bitcoin_rpc.call(command,args,(err,res)=>{
                if(err !== null){
                    reject(err);
                }
                else{
                    resolve(res);
                }
            });
        });
    }
}
/**
 *Main runtime loop when node used as a class.
 */
(async()=>{
    if(esMain(import.meta)){
        console.log(`Running BlockBio as 'main()' - Enjoy`)
        let blockBio = new BlockBio('#bitcoin - custom btc core .23 node operator & contributor - programming - self taught maker ');
        for(;;){
            try{
                await blockBio.setNodeBio();
                await blockBio.setBitcoinProfileBanner();
            }
            catch{e=>{
                console.log(`Failed to write Twitter profile description with error: ${e}`);
            }}
            finally{
                await new Promise(resolve => setTimeout(resolve, 40000));
            }
        }
    }
})();
