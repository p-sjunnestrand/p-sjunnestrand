<script>
    import Terminal from "../Terminal.svelte";
    import Help from "./Help.svelte";

    export let consoleArray;
</script>

<style></style>

<section>
    <h1>CONSOLE</h1>
    <p>Enter commands to execute.</p>
    <p>enter | >help | for list of commands.</p>
    <ul>
        {#each consoleArray as command}
            <li>{command}</li>
        {/each}
    </ul>
    <Terminal on:command/>
</section>