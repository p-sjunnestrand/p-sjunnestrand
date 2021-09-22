<script>
    import Terminal from "../Terminal.svelte";
    import Help from "./Help.svelte";

</script>

<style></style>

<section>
    <h1>CONSOLE</h1>
    <p>Enter commands to execute.</p>
    <p>enter | >help | for list of commands.</p>
    <Terminal on:command/>
</section>