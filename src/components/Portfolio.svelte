<script>
    import KeyPress from "../KeyPress.svelte";
    import Terminal from "../Terminal.svelte";
    import Directory from "../components/Directory.svelte";
    import Placeholder from "../components/Placeholder.svelte";

    let displayInput = false;

    const dirArray = ["personal", "clients"];
    export const projects = [
        {title: "game_of_life", directory: "personal", url: "https://p-sjunnestrand.github.io/game-of-life/"},
        {title: "gridpainter", directory: "personal", url: "https://fed20d-grupp8-gridpainter.herokuapp.com/"},
        {title: "trials_of_norns", directory: "personal", url: "https://p-sjunnestrand.github.io/trials-of-norns/"},
        {title: "forca_fighting", directory: "clinets", url: "https://forcafighting.com/"},
    ];
</script>

<style>
    article{
        height: 92%;
        display: flex;
        /* justify-content: space-between; */
        /* flex-direction: column; */
        align-items: center;
    }
</style>

<KeyPress on:escPress on:enterPress={() => displayInput = true}/>
<article>
    <div class="header">
        <h1>MODULES</h1>
        <p>Input <span class="code">> open -f [file]</span> to open </p>
        <p>Input <span class="code">> help</span> for list of commands.</p>
    </div>
    <h2>Portfolio</h2>
    <div class="portfolio-wrapper">
        {#each dirArray as dir}
        <div class="card">
            <img src="./img/dir.svg" alt="A file directory">
            <h2>{dir}</h2>
        </div>
        {/each}
    </div>
</article>
{#if !displayInput}
    <Placeholder/>
{:else}
    <Terminal on:command/>
{/if}