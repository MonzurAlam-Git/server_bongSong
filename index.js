const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

require('dotenv').config();

app.use(express.json())
app.use(cors())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9yfoja3.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    const bongSongArtist = client.db('bongSong').collection('Artists');
    const bongSongAlbums = client.db('bongSong').collection('albums');

    try {
        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: "1d"
            })
            res.send({ accessToken })
        })

        // all artist display
        app.get('/artists', async (req, res) => {

            const query = {}
            const artist = bongSongArtist.find(query);
            const artists = await artist.toArray();
            res.send(artists);
        })

        //all albums show
        app.get('/albums', async (req, res) => {

            const query = {}
            const albums = bongSongAlbums.find(query);
            const album = await albums.toArray();
            res.send(album);
        })

        //get specific album
        app.get('/albums/:id', async (req, res) => {
            const { id } = req.params;
            // const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id) }
            const album = await bongSongAlbums.findOne(query);
            res.send(album)
        })

        // updating stock

        app.put('/albums/:id', async (req, res) => {
            const { id } = req.params;
            const filter = { _id: ObjectId(id) };
            // const options = { upsert: true };
            const updatedQuantity = req.body.updatedQuantity;
            console.log("updatedQuantity", updatedQuantity);

            const finalQuantity = {
                $set: {
                    quantity: updatedQuantity
                }
            }
            console.log(updatedQuantity);

            const result = await bongSongAlbums.updateOne(filter, finalQuantity);
            res.send(result);
            console.log(
                `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s) updatedQuantity :${updatedQuantity};
                `,
            );
        })

        app.put('/albums/:id', async (req, res) => {
            // const { id } = req.params;
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const restockedQuantity = req.body;

            const updatedQuantity = {
                $set: {
                    updatedQuantity: restockedQuantity
                }
            }

            const result = await bongSongAlbums.updateOne(filter, updatedQuantity);
            res.send(result);
            console.log(
                `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`,
            );
        })

        // deleting stock 
        app.delete(`/albums/:id`, async (req, res) => {
            const { id } = req.params;
            const query = { _id: ObjectId(id) };

            const result = await bongSongAlbums.deleteOne(query);
            if (result.deletedCount === 1) {
                console.log("Successfully deleted one document.");
            } else {
                console.log("No documents matched the query. Deleted 0 documents.");
            }
            res.send(result);
        })

        //Add new items
        app.post(`/albums`, async (req, res) => {
            const newData = req.body;
            const result = await bongSongAlbums.insertOne(newData);
            res.send(result);
            console.log(`A document was inserted with the _id: ${result.insertedId}`);

        })


    } finally {
        //
    }
}
run().catch(console.dir);

app.get('/', async (req, res) => {
    // console.log('Alhamdulillah');
    res.send('<center> <h1>alhamdulillah</h1></center>')
})

app.listen(port, () => {
    console.log('Working Fine on', port);
})

