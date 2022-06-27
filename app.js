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
    async getBio(){
        let geckoData = await this.coinGeckoClient.exchanges.fetchTickers('bitfinex', {
            coin_ids: ['bitcoin']
        });
        for(let ticker of geckoData.data.tickers){
            if(ticker.target == 'USD'){
                await this.client.v1.updateAccountProfile({description: `${this.bioText} - Last BTC/USD $${parseInt(ticker.last).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`});
                console.log(ticker);
            }
        }
    }
}

(async()=>{
    if(esMain(import.meta)){
        console.log(`Running BlockBio as 'main()' - Enjoy`)
        let blockBio = new BlockBio('#bitcoin - custom bitcoin core .23 node operator and contributor - programming - self taught maker and investor - no price talk');
        for(;;){
            try{
                await new Promise(resolve => setTimeout(resolve, 5000));
                await blockBio.getBio();
            }
            catch{e=>{
                console.log(`Failed to write Twitter profile description with error: ${e}`);
            }}
            finally{
            }
        }
    }
})();
