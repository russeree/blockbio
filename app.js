import dotenv from 'dotenv';
import {TwitterApi} from 'twitter-api-v2';
import esMain from 'es-main'

dotenv.config();

class BlockBio{
    constructor(){
        this.client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);
    }
    async getBio(){
        console.log(await this.client.v2.me())
    }
}

if(esMain(import.meta)){
    console.log(`Running BlockBio as 'main()' - Enjoy`)
    let blockBio = new BlockBio();
    blockBio.getBio();
}
