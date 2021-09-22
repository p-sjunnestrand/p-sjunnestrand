<script>
    import {createEventDispatcher} from "svelte";

    const dispatch = createEventDispatcher();

    const keypress = (e) => {
        if(e.key === 'Enter'){
            dispatch('enterPress')
        }
        if(e.key === 'Escape'){
            dispatch('escPress');
        }
    }
</script>

<svelte:window on:keyup={keypress}/>