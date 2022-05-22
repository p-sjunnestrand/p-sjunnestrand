<script>
    import { onMount } from "svelte";
    import {createEventDispatcher} from "svelte";

    const dispatch = createEventDispatcher();

    onMount(() => {
        setTimeout(() => {
            dispatch('logoLoaded')
        }, 6000);
    })
</script>

<style type="text/scss">
    .window{
        height: 100%;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
    }
    .textBox{
        position: relative;
        &:after{
            content: "";
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgb(98, 0, 255);
            animation: shrink 4s steps(50, start) forwards;
            transform-origin: bottom;
        }
    }
    @keyframes shrink{
        100%{
            transform: scaleY(0);
        }
    }
    p{
        margin: 0;
        font-size: 2em;
        text-align: center;
    }
    .diamond{
        font-size: 1000%;
    }
</style>

<div class="window">
    <div class="textBox">
        <p class="diamond">Δ</p>
        <p>ASHATT ASSABI</p>
        <p>INDUSTRIES INC.</p>
    </div>
</div>