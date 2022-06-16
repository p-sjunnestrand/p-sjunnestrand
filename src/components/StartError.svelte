<script>
    import {createEventDispatcher} from 'svelte';

    const dispatch = createEventDispatcher();

    const handleKeydown = () => {
        dispatch('errorShutDown');
    }
</script>

<section>
    <article>
        <h2>WARNING!</h2>
        <p>The current user agent device is not safe for usage of the APVLHM due to insufficient chroma saturation of the positronic MAAS condensator.</p>
        <p> Booting with the current configuration might lead to plasmon-polariton cascading, resulting in a complete annihalation of the Vertex stabilization film. We don't need to tell you what that would entail.</p>
        <p> To boot the APVLHM, please use a device with a screen size wider than 800 pixels.</p>
        <p>Press any button to shut down safely.</p>
    </article>
</section>

<svelte:window on:keydown={handleKeydown}/>

<style>
    section{
        display: flex;
        align-items: center;
        justify-content: center;
        inset: 0;
        position: absolute;
    }
    article{
        /* border: 3px solid white; */
        background-color: white;
        color: #6200ff;
        width: 99%;
        padding: 5px;
        box-sizing: border-box;
        /* height: 30%; */
        /* font-size: 3em; */
        /* display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center; */
    }
    h2 {
        color: red;
        text-align: center;
    }
</style>