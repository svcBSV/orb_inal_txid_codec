# orb_inal_txid_codec
test encoding of txid into an image for later reference

## run the demo with:
npm i,
npm run devStart

## goals
The idea for this project is to create image based pointers to on chain content that isn't just a raw txid that can be posted on legacy platforms or simply saved for personal use. 
Using an image as a pointer might make it more approachable to people that have become accustomed to QR codes, this could help the wider community discover onchain content.
Another aspect is that these images might be less likely to be censored on legacy platforms, especially if the images are described as NFTs rather than a pointer to content that might otherwise be censored on the platform.

The javascript that does the encoding/decoding is running sever side, but could just as easily run on the client side.
The conversion of letters to numbers to add predictable noise to the image is an area where a user supplied integer could be used to allow for customised encoding, a user could share this adjustment with their audience to ensure their decoding works, or this could be used to allow for "followers only" content control.

Preliminary tests have been done on scaling the images up and down to see if the code can still reproduce the original txid. 
In the current configuration the smallest images that can reliably reproduce the txid are 200px x 200px, hopefully further refinement could reduce this to at least 100px x 100px.
