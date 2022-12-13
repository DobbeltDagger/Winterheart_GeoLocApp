// From this excellent so post
// https://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment

///////////////////////////////////////////////
function sqr(x) {
  return x * x
}

///////////////////////////////////////////////
function dist2(v, w) {
  return sqr(v.x - w.x) + sqr(v.y - w.y)
}

///////////////////////////////////////////////
function distToSegmentSquared(p, v, w) {
  var l2 = dist2(v, w);
  if (l2 == 0) return dist2(p, v);
  var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return dist2(p, {
    x: v.x + t * (w.x - v.x),
    y: v.y + t * (w.y - v.y)
  });
}

///////////////////////////////////////////////
// export this function!
function distToSegment(p, v, w) {
  return Math.sqrt(distToSegmentSquared(p, v, w));
}


///////////////////////////////////////////////
// Go through all map points - find distance
function getAllDistances(myLoc, maps) {

  let allDist = [];

  for (let i = 0; i < maps.length; i++) {
    // console.log("maps[" + i + "]", maps[i]);
    for (let j = 0; j < maps[i].length - 1; j++) {
      const firstLinePoint = { x: maps[i][j][0], y: maps[i][j][1] }
      const secondLinePoint = { x: maps[i][j+1][0], y: maps[i][j+1][1] };
      // allDist.push(distToSegment(p, firstLinePoint, secondLinePoint));
      allDist.push({
        myLoc: [myLoc.x, myLoc.y],
        firstLinePoint: [firstLinePoint.x, firstLinePoint.y],
        secondLinePoint: [secondLinePoint.x, secondLinePoint.y],
        distance: distToSegment(myLoc, firstLinePoint, secondLinePoint)
      })
    }
  }

  return allDist;
}


///////////////////////////////////////////////
// Draw the found distances
const drawDistances = (distances, map) => {
  // console.log("distances:", distances);

  let drawPoints = [];
  for (let i = 0; i < distances.length; i++) {
    drawPoints.push(distances[i].firstLinePoint); // IS this right??
    drawPoints.push(distances[i].secondLinePoint);
  }
  console.log("drawDistances -> drawPoints:", drawPoints);

  // clear previous map and layer
  const test = map.getLayer('mapDistances');
  if (typeof test !== 'undefined') {
    map.removeLayer("mapDistances");
    map.removeSource("mapDistances"); // clearing the last one
  }

  const mapName = 'mapDistances'; // + i;
  map.addSource(mapName, {
    'type': 'geojson',
    'data': {
      'type': 'Feature',
      'properties': {},
      'geometry': {
        'type': 'LineString',
        'coordinates': drawPoints
      }
    }
  });
  map.addLayer({
    'id': mapName,
    'type': 'line',
    'source': mapName,
    'layout': { 'line-join': 'round', 'line-cap': 'round' },
    'paint': {
      'line-color': 'red', // '#888',
      'line-width': 10 // 8
    }
  }); 

}



///////////////////////////////////////////////
export {
  distToSegment,
  getAllDistances,
  drawDistances
}
