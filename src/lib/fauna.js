import faunadb, { query as q } from "faunadb";

const client = new faunadb.Client({
    secret: "fnAFirrUcUAAQOTvGOI2LD8h7JFBtOq5Jd8jPmry",
    domain: "db.us.fauna.com"
});

export const writeConstellation = async (shapeString) => {

    return new Promise((resolve, reject) => {

        client.query(
            q.Create(
                q.Collection('constellations'),
                { data: { shape: shapeString } },
            )
        )
            .then((d) => { resolve(d); })
            .catch((err) => {
                console.error(
                    'Error: [%s] %s: %s',
                    err.name,
                    err.message,
                    err.errors()[0].description,
                );
                reject();
            })
    });

}

export const loadDrawing = async (ref) => {

    return new Promise((resolve, reject) => {

        client.query(
            q.Get(q.Ref(q.Collection('constellations'), ref)),
        )
            .then((d) => { resolve(d); })
            .catch((err) => {
                console.error(err);
                reject();
            })
    });

}