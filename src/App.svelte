<script>
  import Map from "./lib/Map.svelte";
  import Instructions from "./lib/Instructions.svelte";
</script>

<main>
  <Instructions />
  <div id="map-holder">
    <Map />
  </div>
</main>

<style>
  #map-holder {
    height: 80vh;
    width: 80vw;
    background-color: rgb(25, 79, 145);
  }
</style>
