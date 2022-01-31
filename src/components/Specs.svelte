<script>
    import {onDestroy, onMount} from 'svelte';

    import KeyPress from "../KeyPress.svelte";
    import Terminal from "../Terminal.svelte";
    import Placeholder from "./Placeholder.svelte";

    let displayInput = false;
    let delta = 11;
    let hypoflux = 13;
    let crypto = 4;
    let dotArray = Array(35).fill('.');
    const progressDots = ['.', ':'];
    let randomStringArray = [];


    const setValues = () => {
        delta = Math.floor(Math.random() * 90 + 10);
        hypoflux = Math.floor(Math.random() * 4 + 12);
        crypto = Math.floor(Math.random() * 3 + 3);
        dotArray = runDotArray();
        randomStringArray = makeRandomString();
    }

    const interval = setInterval(setValues, 1000);


    const makeRandomString = () => {
        let newRandomStringArray = randomStringArray.slice();
        let newRandomString = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < 41; i++) {
            newRandomString += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        newRandomStringArray.push(newRandomString);
        if(newRandomStringArray.length > 9) {
            newRandomStringArray.shift();
        }
        return newRandomStringArray;
    }

    const runDotArray = () => {
        const randomDot = Math.floor(Math.random() * 2);
        let newDotArray = dotArray.slice();
        newDotArray.push(progressDots[randomDot]);
        newDotArray.shift();
        return newDotArray
    }

    onDestroy(() => {
        clearInterval(interval);
    });
</script>

<style type="text/scss">
    h2 {
        margin: .5rem 0;
        font-size: 1.2rem;
    }
    article{
        height: 92%;
        display: flex;
        /* justify-content: space-between; */
        flex-direction: column;
        /* align-items: center; */
    }
    ul {
        padding: 0;
        margin: 1rem 2px;
    }
    li {
        list-style-type: none;
    }
    .dots {
        border: solid 1px white;
        width: min-content;
    }
    .randomStrings {
        border: solid 1px white;
        width: 270px;
        height: 145px;
        padding: 2px;
        text-align: center; 

        ul {
            margin: 0;
        }
    }
    .statusWrapper {
        display: flex;
    }
    .tech-talk {
        width: 35%;
        li {
            border-bottom: dotted 1px white;
        }
    }
    .visuals {
        display: flex;
        width: 100%;
        justify-content: space-evenly;
        flex-wrap: wrap;
        div {
            display: flex;
            flex-direction: column;
            align-items: center;
        }
    }
</style>

<KeyPress on:escPress on:enterPress={() => displayInput = true}/>
<article>
    <div class="header">
        <h1>Specs</h1>
        <p>Input <span class="code">> help</span> for list of commands.</p>
    </div>
    <section>
        <div class="statusWrapper">
            <ul class="tech-talk">
                <li>Delta-harmonics tribulation at</li>
                <li>Multi spectrum quantifier modulation</li>
                <li>Spectrostatic hypo-flux at</li>
                <li>Crypto-encabulator running at</li>
                <li>Linear phase scattering</li>
            </ul>
            <ul>
                <li>.{delta}gPz. 1000 fracutations/ms</li>
                <li>.01-α through 600-λ</li>
                <li>{hypoflux}/900γ</li>
                <li>stable</li>
                <li>∑{crypto}/1600V</li>
            </ul>
        </div>
        <div class="visuals">
            <div>
                <h2>Panametric nanoflux instabilities</h2>
                <div class="dots">
                    {#each dotArray as dot}
                        {dot}
                    {/each}
                </div>
            </div>
            <div>
                <h2>Bodkin spilwave parameters (within 20spn margin)</h2>
                <div class="randomStrings">
                    <ul>
                        {#each randomStringArray as randomString}
                            <li>{randomString}</li>
                        {/each}
                    </ul>
                </div>
            </div>
        </div>
    </section>
</article>
{#if !displayInput}
    <Placeholder/>
{:else}
    <Terminal on:command/>
{/if}