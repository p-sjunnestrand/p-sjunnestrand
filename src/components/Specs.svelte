<script>
    import {onDestroy} from 'svelte';

    import KeyPress from "../KeyPress.svelte";
    import Terminal from "../Terminal.svelte";
    import Placeholder from "./Placeholder.svelte";

    let displayInput = false;
    let delta = 0;

    const setDelta = () => {
        delta = Math.floor(Math.random() * 90 + 10);
        console.log(delta);
    }
    const interval = setInterval(setDelta, 1000);

    onDestroy(() => {
        clearInterval(interval);
    });

</script>

<style>
    article{
        height: 92%;
        display: flex;
        /* justify-content: space-between; */
        flex-direction: column;
        align-items: center;
    }
</style>

<KeyPress on:escPress on:enterPress={() => displayInput = true}/>
<article>
    <div class="header">
        <h1>Specs</h1>
        <p>Input <span class="code">> help</span> for list of commands.</p>
    </div>
    <section>
        <ul>
            <li>Delta-harmonics tribulation at .{delta}gPz. 1000 fracutations/ms</li>
            <li>Multi spectrum quantifier modulation .01-α through 600-λ...</li>
            <li>Spectrostatic hypo-flux at 13/900γ...</li>
            <li>Linear phase scattering stable...</li>
            <li>Crypto-encabulator running at ∑4/1600V...</li>
        </ul>
        
    </section>
</article>
{#if !displayInput}
    <Placeholder/>
{:else}
    <Terminal on:command/>
{/if}