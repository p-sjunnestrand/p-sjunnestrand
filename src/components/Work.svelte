<script>
    import KeyPress from "../KeyPress.svelte";
    import Terminal from "../Terminal.svelte";

    let displayInput = false;
</script>

<style>
    article{
        height: 100%;
        display: flex;
        justify-content: space-between;
        flex-direction: column;
        align-items: center;
    }
</style>

<KeyPress on:escPress on:enterPress={() => displayInput = true}/>
<article>
    <h2>Work</h2>
    {#if !displayInput}
        <h3>PRESS ESC FOR CONSOLE. ENTER FOR TERMINAL.</h3>
    {:else}
        <Terminal on:command/>
    {/if}
</article>