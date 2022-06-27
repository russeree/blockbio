# Blockbio 🐦 Bitcoin Price for Your Twitter Bio

## Inspiration
This project was formed out of a weekend warmup exercise with the goal 
of creating unique updates to my 'bio' to prevent impersonating accounts
from having a look of being genuine. This is because twitter bots don't
update frequently and will not carry the latest price and timestamp attached 
to their bio.

## What this repo is
This is a loose NodeJS Script to update your twitter bio 'description' with 
the latest USD/BTC pair price priced from CoinGecko. This script is meant to be ran in the form of

`path/to/node app.js`

To customize this script to fit your needs edit the class constructor argument for `BlockBio` to fit your profile 'bio' please remember the 160 char limit on your bio. The addition of the price and timestamp consumes ~35 characters when the timezone is included. 

There also needs to be a .env file inyour project directory of the format ...
`
TWITTER_API_KEY="api_key"
TWITTER_API_KEY_SECRET="api_key_secret"
TWITTER_ACCESS_TOKEN=
TWITTER_ACCESS_TOKEN_SECRET=
`

This project is a non-production release designed to just be a **proof of concept**. 

## What this repo is not
This is not a readymade application, steps must be taken to obtain
a compatible API key with read/write permissions to your twitter profile

## How to get your Twitter API keys (v1.1) required
This process is quite dificult and this app doesn't have the 3 legged OAuth 1/2 support enabled so users need to obtain their own API keys. To do this you will need to sign up for the Twitter API v2.0 which is free and automatic. Do this at the [Twitter Developer Portal](https://developer.twitter.com/ "Twitter Developer Portal"). After registering create a 'standalone app'. You now need to obtain elevated access to the Twitter API v.1.1 to be able to change your profile desctipion (bio) after that apply for elevated access. The aproval proccess involves and email and aproval in around 48 hours. Next setup Oauth 1.0 Access and enabled read/write.
