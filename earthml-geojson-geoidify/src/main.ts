import * as JSONStream from 'JSONStream';
import * as fs from "fs";
import * as es from 'event-stream';
import * as gdal from "gdal";

var open = '{"type":"FeatureCollection","features":[',
    close = ']}';

function parse() {
    var jsonstream = JSONStream.parse('features.*');
    return jsonstream;
};

function stringify () {
    var jsonstream = JSONStream.stringify(open, '\n,\n', close);
    return jsonstream;
};




function printDataset(dataset) {
    console.log("number of bands: " + dataset.bands.count());
    console.log("width: " + dataset.rasterSize.x);
    console.log("height: " + dataset.rasterSize.y);
    console.log("geotransform: " + dataset.geoTransform);
    console.log("srs: " + (dataset.srs ? dataset.srs.toWKT() : 'null'));
}


let egm96 = gdal.open(process.argv[2]);
printDataset(egm96);

let gt = egm96.geoTransform;
let pixels = egm96.bands.get(1).pixels;


function geoidifyCoordinate(coordinate) {
    let px = Math.floor((coordinate[0] - gt[0]) / gt[1]) //x pixel
    let py = Math.floor((coordinate[1] - gt[3]) / gt[5]) //y pixel
    console.log(coordinate);
    coordinate[2] = coordinate[2] + pixels.get(px, py);
    console.log(coordinate);
}
function geoidifyCoordinates(coordinates) {
    for (let coordinate of coordinates) {
        geoidifyCoordinate(coordinate);
    }
}

var geoidify = es.mapSync(function (data) {

    let coordinates = data.geometry.coordinates;
    switch (data.geometry.type) {
        case "MultiLinetring":
        case "Polygon":

            for (let ring of coordinates) {
                geoidifyCoordinates(ring);
            }
            break;
        case "LineString":
        case "MultiPoint":
            geoidifyCoordinates(coordinates);
            break;
        case "Point":
            geoidifyCoordinate(coordinates);
            break;

    }       

   

    return data
})

let reader = fs.createReadStream(process.argv[3], { encoding: 'utf8' }).pipe(parse()).pipe(geoidify).pipe(stringify()).pipe(fs.createWriteStream(process.argv[4]));
