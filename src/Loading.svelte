<script>
    import LoadingDots from "./loadingDots.svelte";
    import StartError from './components/StartError.svelte';
    

    let status = {
        first: false,
        second: false,
        third: false,
        fourth: false,
        fifth: false,
    }

    function typewriter(node, { speed = 5 }) {
        const valid = (
            node.childNodes.length === 1 &&
            node.childNodes[0].nodeType === Node.TEXT_NODE
        );

        if (!valid) {
            throw new Error(`This transition only works on elements with a single text node child`);
        }

        const delay = 1000;
        const text = node.textContent;
        const duration = text.length / (speed * 0.01);

        return {
            delay,
            duration,
            tick: t => {
                const i = ~~(text.length * t);
                node.textContent = text.slice(0, i);
            }
        };
    }

    function detectMob() {
        return ( ( window.innerWidth <= 800 ));
    }
</script>

<style>
    li{
        list-style-type: ">";
        padding-left: 1em;
        margin-top: 1em;
    }
    p{
        margin-top: 4em;
        
    }
</style>

<section>
    <ul>
        <li in:typewriter on:introend="{() => status.second = true}">simulating sub-critical cold start...</li>
        {#if status.second}
            <li in:typewriter on:introend="{() => status.third = true}">firing targis emitter...</li>
        {/if}
        {#if status.third}
            <li in:typewriter on:introend="{() => status.fourth = true}">checking non-Barriar vectors...</li>
        {/if}
        {#if status.fourth}
            <li in:typewriter on:introend="{() => status.fifth = true}">decoupling phase shift rotodrive...</li>
        {/if}
        {#if status.fifth}
            {#if detectMob()}
                <p in:typewriter on:introend="{() => status.seventh = true}">EXCEPTION TYPE 4 DETECTED. ABORTING START UP...</p>
            {:else}
                <p in:typewriter on:introend="{() => status.sixth = true}">ALL SYSTEMS NOMINAL. ENGAGING ROTOLIMBIC CHAMBER.</p>
            {/if}
        {/if}
        {#if status.sixth}
            <LoadingDots on:finishLoad/>
        {/if}
        {#if status.seventh}
            <StartError/>
        {/if}
    </ul>
</section>