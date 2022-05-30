<script>
    export let terminal;
</script>

<style>
    h3{
        text-align: center;
    }
</style>

{#if terminal === true}
<h3>PRESS ESC FOR CONSOLE. ENTER FOR TERMINAL.</h3>
{:else}
<h3>PRESS ESC TO CLOSE FILE.</h3>
{/if}