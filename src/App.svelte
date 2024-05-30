<script>
  import Map from "./lib/Map.svelte";
  import Instructions from "./lib/Instructions.svelte";
</script>

<main class="w-full">
  <div class="w-full flex flex-col items-center pb-8">
    <Instructions />
  </div>

  <div class="w-full flex-col items-center flex">
    <div id="map-holder">
      <Map />
    </div>
  </div>
</main>

<style>
  #map-holder {
    height: 80vh;
    width: 80vw;
    background-color: rgb(25, 79, 145);
  }
</style>
