<script>
    import KeyPress from "../KeyPress.svelte";
    import Terminal from "../Terminal.svelte";
    import Directory from "../components/Directory.svelte";
    import Placeholder from "../components/Placeholder.svelte";
    import PortfolioFile from "./PortfolioFile.svelte";
    export let openFile;
    export let openDir;
    export let fileDesc;
    export let fileUrl;

    let displayInput = false;

    const dirArray = ["personal", "clients"];
</script>

<style>
    article{
        height: 92%;
        overflow-y: auto;
        /* display: flex; */
        /* justify-content: space-between; */
        /* flex-direction: column; */
        /* align-items: center; */
    }
    /* .header {
        border-bottom: 4px double;
        width: 100%;
    } */
    .portfolio-wrapper{
        display: flex;
        margin: 5% auto;
        width: 50%;
        justify-content: space-evenly;
        /* height: 30%; */
        flex-wrap: wrap;
    }
    .dir-image {
        width: 10vw;
    }
</style>

<KeyPress on:escPress on:enterPress={() => displayInput = true}/>
<article>
    <div class="header">
        <h1>PORTFOLIO</h1>
        <p>Input <span class="code">> open -d [directory]</span> to open </p>
        <p>Input <span class="code">> open -f [file]</span> to open </p>
        <p>Input <span class="code">> help</span> for list of commands.</p>
    </div>
    {#if openDir}
        <Directory {openDir} on:closeDir/>
    {:else if openFile}
        <PortfolioFile {openFile} {fileDesc} {fileUrl} on:closeFile/>
    {:else}
        <div class="portfolio-wrapper">
            {#each dirArray as dir}
            <div class="card">
                <img src="./img/dir.svg" alt="A file directory" class="dir-image">
                <h2>{dir}</h2>
            </div>
            {/each}
        </div>
    {/if}
</article>
{#if !displayInput}
    <Placeholder/>
{:else}
    <Terminal on:command/>
{/if}