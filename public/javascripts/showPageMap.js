mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/light-v10", // stylesheet location
  center: property.geometry.coordinates, // starting position [lng, lat]
  zoom: 10, // starting zoom
});

map.addControl(new mapboxgl.NavigationControl());

new mapboxgl.Marker()
  .setLngLat(property.geometry.coordinates)
  .setPopup(
    new mapboxgl.Popup({ offset: 25 }).setHTML(
      `<h3>${property.title}</h3><p>${property.location}</p>`
    )
  )
  .addTo(map);
