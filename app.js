import dotenv from 'dotenv';
import {TwitterApi} from 'twitter-api-v2';
import esMain from 'es-main';
import CoinGecko from 'coingecko-api';

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
                await this.client.v1.updateAccountProfile({description: `${this.bioText}last BTC/USD $${priceText} - ${cTimeStamp} PST`});
            }
        }
    }
}

(async()=>{
    if(esMain(import.meta)){
        console.log(`Running BlockBio as 'main()' - Enjoy`)
        let blockBio = new BlockBio('#bitcoin - custom bitcoin core .23 node operator and contributor - programming - self taught maker - ');
        for(;;){
            try{
                await blockBio.setPriceBio();
            }
            catch{e=>{
                console.log(`Failed to write Twitter profile description with error: ${e}`);
            }}
            finally{
                await new Promise(resolve => setTimeout(resolve, 180000));
            }
        }
    }
})();
