<script>
  import GeoJSON from "ol/format/GeoJSON.js";
  import Map from "ol/Map.js";
  import { get } from "ol/proj";
  import VectorLayer from "ol/layer/Vector.js";
  import VectorSource from "ol/source/Vector.js";
  import WebGLPointsLayer from "ol/layer/WebGLPoints.js";
  import View from "ol/View.js";
  import proj4 from "proj4";
  import { register } from "ol/proj/proj4.js";
  import WKT from "ol/format/WKT.js";

  import "ol/ol.css";

  import { onMount } from "svelte";

  import stars from "../assets/stars-aeqd.json";
  import constellations from "../assets/constellations.lines.min.json";
  import constellationsCn from "../assets/constellations.lines.cn.min.json";

  import Toggle from "./ui/Toggle.svelte";
  import { loadDrawing } from "./fauna";

  export let constellationId;

  proj4.defs(
    "AEQD",
    "+proj=aeqd +lat_0=90 +lon_0=0.0 +x_0=0 +y_0=0 +a=6371000 +b=6371000 +units=m",
  );
  register(proj4);
  var aeqd = get("AEQD");
  var maxdist = 6371000 * 3.14159265;
  aeqd.setExtent([-maxdist, -maxdist, maxdist, maxdist]);

  const drawSource = new VectorSource({ wrapX: false });

  const drawVector = new VectorLayer({
    source: drawSource,
    style: {
      "stroke-width": 3,
      "stroke-color": "yellow",
    },
  });

  const starLayer = new WebGLPointsLayer({
    source: new VectorSource({
      features: new GeoJSON().readFeatures(stars),
    }),
    style: {
      "circle-radius": [
        "interpolate",
        ["exponential", 0.7],
        ["get", "mag"],
        5,
        0.75,
        1,
        2.5,
      ],
      "circle-fill-color": "white",
    },
  });

  const constellationEnLayer = new VectorLayer({
    source: new VectorSource({
      features: new GeoJSON().readFeatures(constellations, {
        dataProjection: "EPSG:4326",
        featureProjection: aeqd,
      }),
    }),
    style: {
      "stroke-width": 0.75,
      "stroke-color": "rgba(255,255,255,0.5)",
    },
  });

  const constellationCnLayer = new VectorLayer({
    source: new VectorSource({
      features: new GeoJSON().readFeatures(constellationsCn, {
        dataProjection: "EPSG:4326",
        featureProjection: aeqd,
      }),
    }),
    style: {
      "stroke-width": 0.5,
      "stroke-color": "rgba(255,255,255,0.75)",
    },
  });

  let showConstellations = false;
  let showCnConstellations = false;

  let map;

  let drawing;

  let wktReader = new WKT();

  loadDrawing(constellationId)
    .then((d) => {
      drawing = d.data.shape;
      drawing.forEach(shape => {
        drawSource.addFeature(wktReader.readFeature(shape))
      });
      console.log(drawing);
    })
    .catch(() => {
      window.alert("Data loading failed");
    });

  onMount(() => {
    map = new Map({
      keyboardEventTarget: document,
      layers: [starLayer, drawVector],
      target: "map-div",
      view: new View({
        center: [0, 0],
        projection: aeqd,
        zoom: 1.5,
      }),
    });
  });
</script>

<div id="outer-div" class="flex flex-col">
  <div class="my-8 font-bold">Drawing ID {constellationId}</div>
  <div id="map-div" class="flex-grow w-full"></div>
  <div class="p-4 text-white flex flex-col items-center">
    <div class="flex items-center p-2">
      <Toggle
        enabled={showConstellations}
        on:click={() => {
          if (showConstellations) {
            map.removeLayer(constellationEnLayer);
            showConstellations = false;
          } else {
            map.addLayer(constellationEnLayer);
            showConstellations = true;
          }
        }}
      /> <span class="ml-2">Show European constellations</span>
    </div>

    <div class="flex items-center p-2">
      <Toggle
        enabled={showCnConstellations}
        on:click={() => {
          if (showCnConstellations) {
            map.removeLayer(constellationCnLayer);
            showCnConstellations = false;
          } else {
            map.addLayer(constellationCnLayer);
            showCnConstellations = true;
          }
        }}
      />
      <span class="ml-2">Show Chinese constellations</span>
    </div>
  </div>
</div>

<style>
  #outer-div {
    width: 100%;
    height: 100%;
  }
</style>
