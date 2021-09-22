<script>
    export let access;
</script>

<style>
    article{
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
    }
    div{
        border: 3px solid white;
        width: 60%;
        height: 30%;
        font-size: 3em;
        text-align: center;
    }
    .denied{
        background-color: red;
        animation: blink 0.5s infinite steps(2, start);
    }
    .allowed{
        background-color: white;
        color: #6200ff;
    }
    @keyframes blink{
        50%{color: black;}
        100%{color: white;}
    }
</style>

<article>
    {#if access === "denied"}
        <div class="denied">
            <p class="denied">ACCESS DENIED</p>
        </div>
    {:else}
        <div class="allowed">
            <p class="allowed">WELCOME ADMIN</p>
        </div>
    {/if}
</article>