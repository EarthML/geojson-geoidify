"use strict";
var JSONStream = require("JSONStream");
var fs = require("fs");
var es = require("event-stream");
var gdal = require("gdal");
var open = '{"type":"FeatureCollection","features":[', close = ']}';
function parse() {
    var jsonstream = JSONStream.parse('features.*');
    return jsonstream;
}
;
function stringify() {
    var jsonstream = JSONStream.stringify(open, '\n,\n', close);
    return jsonstream;
}
;
var readStream = fs.createReadStream(process.argv[2], { encoding: 'utf8' });
function printDataset(dataset) {
    console.log("number of bands: " + dataset.bands.count());
    console.log("width: " + dataset.rasterSize.x);
    console.log("height: " + dataset.rasterSize.y);
    console.log("geotransform: " + dataset.geoTransform);
    console.log("srs: " + (dataset.srs ? dataset.srs.toWKT() : 'null'));
}
var egm96 = gdal.open("C:/eg-hm/egm96-15.tif");
printDataset(egm96);
var gt = egm96.geoTransform;
var pixels = egm96.bands.get(1).pixels;
function geoidifyCoordinate(coordinate) {
    var px = Math.floor((coordinate[0] - gt[0]) / gt[1]); //x pixel
    var py = Math.floor((coordinate[1] - gt[3]) / gt[5]); //y pixel
    console.log(coordinate);
    coordinate[2] = coordinate[2] + pixels.get(px, py);
    console.log(coordinate);
}
function geoidifyCoordinates(coordinates) {
    for (var _i = 0, coordinates_1 = coordinates; _i < coordinates_1.length; _i++) {
        var coordinate = coordinates_1[_i];
        geoidifyCoordinate(coordinate);
    }
}
var geoidify = es.mapSync(function (data) {
    var coordinates = data.geometry.coordinates;
    switch (data.geometry.type) {
        case "MultiLinetring":
        case "Polygon":
            for (var _i = 0, coordinates_2 = coordinates; _i < coordinates_2.length; _i++) {
                var ring = coordinates_2[_i];
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
    return data;
});
var reader = readStream.pipe(parse()).pipe(geoidify).pipe(stringify()).pipe(fs.createWriteStream("test.geojson"));
//# sourceMappingURL=main.js.map