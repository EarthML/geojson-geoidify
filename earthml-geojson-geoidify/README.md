# earthml-geojson-geoidify

For updating geojson files given in WGS84 where z coordinate is representing the MSL. After processing the new Z value will be Ellipsoid height, from MSL + geoid undulation.

One reason for doing this is when using coordinate transformation to local coordinate systems that will expect ellipsoid heights instead of MSL.


Streaming geojson files from /data/in.geojson to /data/out.geojson where all z coordinates have been added the geoid undulation.


```
docker run -v geoids:/geoids -v data:/data earthml/geojson-geoidify /geoids/egm96-15.tif in.geojson out.geojson
```
