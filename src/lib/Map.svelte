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
  import Draw from "ol/interaction/Draw.js";
  import WKT from "ol/format/WKT.js";

  import "ol/ol.css";

  import { onMount } from "svelte";

  import stars from "../assets/stars-aeqd.json";
  import constellations from "../assets/constellations.lines.min.json";
  import constellationsCn from "../assets/constellations.lines.cn.min.json";

  import Toggle from "./ui/Toggle.svelte";
  import { writeConstellation } from "./fauna";

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
  let draw = new Draw({
    source: drawSource,
    type: "LineString",
    style: {
      "circle-radius": 5,
      "circle-fill-color": "red",
      "stroke-color": "yellow",
      "stroke-width": 2,
    },
  });

  let s = "blank";

  const clearDrawing = () => {
    draw.finishDrawing();
    drawSource.clear();
    s = "blank";
  };

  let shapeString = "";

  const goToDonate = () => {
    s = "saving";
    let w = new WKT();
    let f = drawSource.getFeatures()[0];
    shapeString = w.writeFeature(f);
    writeConstellation(shapeString).then((d) => {
      window.location.href = `https://leventhalmap.donorsupport.co/page/JUNE2024?drawing-id=${d.ref.value.id}`;
    }).catch(()=>{window.alert("Sorry, something went wrong. Do you mind refreshing and trying again?"); s = "blank"; });
  };

  draw.on("drawstart", () => {
    s = "currentlyDrawing";
  });

  draw.on("drawend", () => {
    s = "finishedDrawing";
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

    map.addInteraction(draw);
  });
</script>

{#if s === "saving"}
  <div
    class="relative z-10"
    aria-labelledby="modal-title"
    role="dialog"
    aria-modal="true"
  >
    <div
      class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
    ></div>

    <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
      <div
        class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0"
      >
        <div
          class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6"
        >
          <div>
            <div class="text-center">
              <h3
                class="text-base font-semibold leading-6 text-gray-900"
                id="modal-title"
              >
                Saving your constellation ...
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<div id="outer-div" class="flex flex-col">
  <div id="map-div" class="flex-grow w-full"></div>
  <div class="p-4 text-white flex flex-col items-center">
    <div class="font-black bg-blue-900 p-3 text-lg">
      {#if s == "blank"}
        Click the red dot in the star chart to start drawing your constellation.
      {:else if s == "finishedDrawing"}
        Looks great! ✨ You can keep adding shapes, or<br/> <button
          type="button"
          on:click={goToDonate}
          class="rounded-md text-blue-900 bg-white/80 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-white/70"
          >Donate and name your constellation</button
        >
        <button
          type="button"
          on:click={clearDrawing}
          class="rounded-md bg-white/10 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-white/20"
          >Start over</button
        >
      {:else if s == "currentlyDrawing"}
        Keep clicking to add points, then double-click to finish your shape
      {/if}
    </div>
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
    <div class="p-2">
      <button
        type="button"
        on:click={clearDrawing}
        class="rounded-md bg-white/10 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-white/20"
        >Reset drawing</button
      >
    </div>
  </div>
</div>

<style>
  #outer-div {
    width: 100%;
    height: 100%;
  }
</style>
