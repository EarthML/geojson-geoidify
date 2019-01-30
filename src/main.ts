import * as JSONStream from 'JSONStream';
import * as fs from "fs";
import * as es from 'event-stream';
import * as gdal from "gdal";
import * as csv from "csv";

var open = '{"type":"FeatureCollection","features":[',
    close = ']}';

var add = process.argv.length > 5 && process.argv[5] === "--add";

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

function getUndulation(coordinate) {
    let px = Math.floor((coordinate[0] - gt[0]) / gt[1]) //x pixel
    let py = Math.floor((coordinate[1] - gt[3]) / gt[5]) //y pixel
 
   return pixels.get(px, py);
   
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

//let reader = fs.createReadStream(process.argv[3], { encoding: 'utf8' }).pipe(parse()).pipe(geoidify).pipe(stringify()).pipe(fs.createWriteStream(process.argv[4]));

var getCentroid = function (coord) {
    var center = coord.reduce(function (x, y) {
        return [x[0] + y[0] / coord.length, x[1] + y[1] / coord.length]
    }, [0, 0])
    return center;
}

let worker = fs.createReadStream(process.argv[3], { encoding: 'utf8' })
    .pipe(csv.parse())
    .pipe(csv.transform(function (record) {
    //    console.log(record[12]);
        var height = parseFloat(record[12]);
        var coordinates = record[10];
       // console.log(coordinates);
       // console.log(height);
        var latlng = coordinates.split(' ').map(parseFloat);
        var coords = [];
        for (let i = 0; i < latlng.length; i += 2) {
            coords.push([latlng[i+1],latlng[i]]);
        }
        var center = getCentroid(coords);
      //  console.log(center);
        var undulation = getUndulation(center);
       // console.log(undulation);

        record[12] = add ? height + undulation : height - undulation;
        console.log(`Updating at ${center[0]} ${center[1]} from ${height} to ${record[12]} using ${add}`);

      

        return record;

        //return record.map(function (value) {
        //    return value.toUpperCase()
        //});
    })).pipe(csv.stringify()).pipe(fs.createWriteStream(process.argv[4]));