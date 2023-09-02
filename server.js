if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload')
app.use(bodyParser.urlencoded({limit: '10mb', extended:false}))
const methodOverride = require('method-override');
// const fetch = require('node-fetch');
const cors = require('cors');
const { createCanvas, loadImage } = require("canvas");

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('layout', 'layouts/layout');

app.use(expressLayouts)
app.use(methodOverride('_method'))
app.use(express.static('public'))
app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
  }));


app.use(cors());

const {Template} = require('ejs');

app.get('/', (req,res) => {
    txid = ''

    txid_arry = txid.match(/.{1,6}/g) || [];
    
    res.render('index', {txid: txid, colour_arr: txid_arry, genImage: null, txid_decoded: null})
})

app.post('/', async(req, res) => {
    const {sub_txid} = req.body
    txid = sub_txid
    txid_arry = txid.match(/.{1,6}/g) || [];

    const width = 550;
    const height = 550;

    // instantiate the canvas object
    const canvas = createCanvas(width,height)
    const context = canvas.getContext("2d")

    function isLetter(str) {
        return str.length === 1 && str.match(/[a-z]/i);
    }

    let converted
    for(var i =0; i < 11; i++) {

        x = (width/2)
        y = (height/2)
        if( i == 10) {
            colour = txid_arry[i-1].substring(4,6) + txid_arry[i] 
            
        } else {
            colour = txid_arry[i]
        }
        
        if( i == 0 ) {
            converted = 2.18
            endAngle = -2.18
        }


        context.fillStyle = "#"+colour;
        context.strokeStyle = "#"+colour;
        context.beginPath();

        startAngle = endAngle
        endAngle = startAngle+Math.round((converted/(i+1))*Math.PI)

        if(endAngle <= startAngle) {
            endAngle = Math.round(startAngle - 10)
        }

        drawWidth = 50
        radius = Math.round((width/2.5)-(i*18))

        context.arc(x,y,radius,startAngle,endAngle,false);
        context.lineWidth = drawWidth;
        context.stroke();
        

        // Used to check the midpoint calcs

        // context.fillStyle = 'black'
        // midAngle = startAngle+(endAngle-startAngle)/2
        // midx = Math.round(x+Math.cos(midAngle)*(radius+10))
        // midy = Math.round(y+Math.sin(midAngle)*(radius+10))

        // console.log(i,startAngle,endAngle,midx,midy)
        // context.fillRect(midx,midy,2,2)


        if(isLetter(colour.substring(5))) {

            converted = colour.substring(5).charCodeAt(0) -96 //Adding a user supplied intenger here could allow for custom encoding, only shared with intended audience

        } else {
            converted = parseInt(colour.substring(5))
        } 

    }
    
    // resize and send as base64
    const output = createCanvas(275,275)
    const ouputctx = output.getContext("2d")
    ouputctx.drawImage(canvas,0,0,275,275)
    const buffer =canvas.toBuffer("image/png")
    
    base64Img = getBase64Image(output)

    function getBase64Image(canvas) {
    
        var dataURL = canvas.toDataURL("image/png");
    
        return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
    }


    res.render('index', {txid: txid, colour_arr: txid_arry, genImage: base64Img, txid_decoded: null})

})

app.post('/decode', async (req, res) => {

    try {
      if (!req.files) {
        res.send({
          status: false,
          message: 'No file uploaded'
        });
      } else {
        
        let uploadedImage = req.files.image;
      
        // instantiate the canvas object
        const width = 550;
        const height = 550;
        const canvas = createCanvas(width,height)
        const context = canvas.getContext("2d")

        let combined;

        let decoded;
        let converted;
        // do a loop here to build up the full txid
        try {
            decoded = await loadImage(uploadedImage.data).then(image => {
                x = (width/2)
                y = (height/2)


                context.drawImage(image,0,0,width,height);
                for(var i =0; i < 11; i++) {
                    if( i == 0 ) {
                        converted = 2.18
                        endAngle = -2.18
                    }

                   
                    radius = Math.round((width/2.5)-(i*18))
                    startAngle = endAngle
                    endAngle = startAngle+Math.round((converted/(i+1))*Math.PI)

                    if(endAngle <= startAngle) {
                        endAngle = Math.round(startAngle - 10)
                    }

                    midAngle = startAngle+(endAngle-startAngle)/2
                    midx = Math.round(x+Math.cos(midAngle)*(radius+10))
                    midy = Math.round(y+Math.sin(midAngle)*(radius+10))

                    if( i == 10) {
                        
                        pi = context.getImageData(midx, midy, 1, 1).data;
                        

                        var c = ("000000" + rgbToHex(pi[0], pi[1], pi[2])).slice(-6);
                        colour =  c.substring(2,6) 
                    } 
                    else {
                        
                        pi = context.getImageData(midx, midy, 1, 1).data;
                        var hex = ("000000" + rgbToHex(pi[0], pi[1], pi[2])).slice(-6);
                        colour = hex
                    }
                    
                    combined += colour

                    if(isLetter(colour.substring(5))) {

                        converted = colour.substring(5).charCodeAt(0) -96 //Adding a user supplied intenger here could allow for custom encoding, only shared with intended audience            
                    } else {
                        converted = parseInt(colour.substring(5))
                    } 
                }
                
                return combined.slice(9)

            })
        }
        catch(err) {
            console.log(err)
        }

        function isLetter(str) {
            return str.length === 1 && str.match(/[a-z]/i); 
          }

        
        function rgbToHex(r, g, b) {
            if (r > 255 || g > 255 || b > 255)
                throw "Invalid color component";
            return ((r << 16) | (g << 8) | b).toString(16);
        }

        // Send the response
        res.send({
          status: true,
          message: 'File uploaded',
          data: {
            name: uploadedImage.name,
            mimetype: uploadedImage.mimetype,
            size: uploadedImage.size,
            txid: String(await decoded)
            }
        });
      }
    } catch (err) {
      res.status(500).send(err);
    }
  });


const PORT = 3006
app.listen(PORT, () =>console.log(`Server running on port: ${PORT}`) )