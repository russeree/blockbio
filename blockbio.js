import dotenv from 'dotenv';
import {TwitterApi} from 'twitter-api-v2';
import esMain from 'es-main';
import CoinGecko from 'coingecko-api';
import bitcoin_rpc from 'node-bitcoin-rpc';

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
    initBitcoinRPC(){
        bitcoin_rpc.init(
            process.env.BITCOIN_NODE_HOST,
            process.env.BITCOIN_NODE_PORT,
            process.env.BITCOIN_NODE_USERNAME,
            process.env.BITCOIN_NODE_PASSWORD
        )
        bitcoin_rpc.setTimeout(30000);
    }
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

(async()=>{
    if(esMain(import.meta)){
        console.log(`Running BlockBio as 'main()' - Enjoy`)
        let blockBio = new BlockBio('#bitcoin - custom btc core .23 node operator & contributor - programming - self taught maker ');
        for(;;){
            try{
                await blockBio.setNodeBio();
            }
            catch{e=>{
                console.log(`Failed to write Twitter profile description with error: ${e}`);
            }}
            finally{
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    }
})();
