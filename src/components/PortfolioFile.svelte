<script>
    export let openFile;
    export let fileDesc;
</script>
<style>
    h2 {
        text-transform: uppercase;
    }
    .fileWindow {
        width: 60%;
        margin: 2rem auto;
        background-color: white;
        color: rgb(98, 0, 255);
        outline: 4px solid rgb(98, 0, 255);
        outline-offset: -5px;
        padding: 2%;
        box-sizing: border-box;
    }
</style>

<div class="fileWindow">
    <h2>{openFile}</h2>
    <p>{fileDesc}</p>
</div>