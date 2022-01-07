<script>
    import Terminal from "../Terminal.svelte";

    export let consoleArray;
</script>

<style>
    article{
        height: 92%;
        overflow-y: auto;
    }
    .header{
        border-bottom: 4px double white;
    }
    h1{
        text-align: center;
    }
    li{
        list-style-type: ">";
        padding-left: 2%;
    }
    li:not(:last-child) { 
        margin-bottom: 1%;  
    }
   .help{
       border-bottom: 2px dashed white;
       padding-bottom: 2%;
   }
   .code{
        background-color: white;
        color: rgb(98, 0, 255);
    }
    .end-message {
        border-bottom: 2px dashed white;
        padding: 1% 0;
        text-align: center;
    }
</style>

<article>
    <div class="header">
        <h1>CONSOLE</h1>
        <p>Input commands to execute.</p>
        <p>Input <span class="code">> help</span> for list of commands.</p>
    </div>
    <ul>
        {#each consoleArray as command}
            {#if command === "help"}
                    <div class="help">
                        <h2>HELP</h2>
                        <li><span class="code">> run -p [program]</span> runs program</li>
                        <li>
                            <p>List of programs to run:</p>
                            <ul>
                                <li>main</li>
                                <li>modules</li>
                                <li>work</li>
                                <li>edu</li>
                                <li>portf</li>
                                <li>specs</li>
                            </ul>
                        </li>
                        <li><span class="code">> sys exit -u</span> logs user out to login screen</li>
                        <li><span class="code">> sys shutdown -n</span> shuts computer down</li>
                        <li><span class="code">> sys shutdown [seconds]</span> shuts computer down after specificed amount of seconds</li>
                        <li><span class="code">> sys color [color]</span> changes background color to specified valid hex color</li>
                        <li><span class="code">> sys color -r</span> resets background color</li>
                        <li><span class="code">> open -f [file]</span> opens specified file (portf, modules, work?, edu?)</li>
                        <li><span class="code">> open -d [directory]</span> opens specified directory (portf, work?, edu?)</li>
                    </div>
                    <div class="end-message">END OF HELP</div>
                
            {:else}
                <li>{command}</li>
            {/if}
        {/each}
    </ul>
</article>
<Terminal on:command/>