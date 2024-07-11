<script>
  import Map from "./lib/Map.svelte";
  import Instructions from "./lib/Instructions.svelte";
  import ExportMap from "./lib/ExportMap.svelte";
  import url from "./lib/url";

  import lmecLogo from "./assets/LMEC-logo.webp";
</script>

{#if $url.hash.includes("#/export")}
  <main class="w-full">
    <div id="map-holder">
      <ExportMap constellationId={$url.hash.substring(9)} />
    </div>
  </main>
{:else}
  <main class="w-full">
    <div class="w-full flex flex-col items-center pb-8">
      <Instructions />
    </div>

    <div class="w-full flex-col items-center flex">
      <div id="map-holder">
        <Map />
      </div>
    </div>

    <div class="mt-12 p-4 w-full items-center flex flex-col bg-slate-50">
      <a
        href="http://leventhalmap.org"
        target="_blank"
        rel="noopener noreferrer"
        ><img
          src={lmecLogo}
          alt="Leventhal Map & Education Center Logo"
          class="w-36"
        /></a
      >
    </div>
  </main>
{/if}

<style>
  #map-holder {
    height: 80vh;
    width: 80vw;
    background-color: rgb(25, 79, 145);
  }
</style>
