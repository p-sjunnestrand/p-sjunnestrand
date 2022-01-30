<script>
    import {onDestroy, createEventDispatcher} from 'svelte';
    export let workArray;
    export let fileIndex;

    const dispatch = createEventDispatcher();

    onDestroy(() => {
        dispatch('closeFile');
    })

    const currentFile = workArray.find(file => file.index === fileIndex);

</script>

<style type="text/scss">
    $secondary-background: rgb(98, 0, 255);
    
    .fileWindow{
        // position: absolute;
        width: 60%;
        // top: 35%;
        // left: 20%;
        // z-index: 1;
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
    <h2>{currentFile.title}</h2>
    <h3>{currentFile.year}</h3>
    <p>{currentFile.desc}</p>
</div>
