<script>
    import {createEventDispatcher} from 'svelte';

    const dispatch = createEventDispatcher();

    function typewriter(node, { speed = 0.2 }) {
        const valid = (
            node.childNodes.length === 1 &&
            node.childNodes[0].nodeType === Node.TEXT_NODE
        );

        if (!valid) {
            throw new Error(`This transition only works on elements with a single text node child`);
        }

        
        const text = node.textContent;
        const duration = text.length / (speed * 0.01);

        return {
            
            duration,
            tick: t => {
                const X = '*';
                const i = ~~(text.length * t);
                node.textContent = X.repeat(i) + text.substring(i);
            }
        };
    }
    
    const delayTransition = () => {
        setTimeout(() => {
            dispatch('finishLoad')            
        }, 1500);
    }
</script>

<style>
    p{
        font-family: 'VT323', monospace;
        font-size:  3em;
        text-align: center;
    }
</style>

<p><span in:typewriter on:introend="{() => delayTransition()}">--------</span></p>