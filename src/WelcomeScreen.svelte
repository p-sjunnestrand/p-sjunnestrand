<script>
    import {createEventDispatcher, onMount} from "svelte";
    import Terminal from "./Terminal.svelte";
    import KeyPress from "./KeyPress.svelte";
    import Placeholder from "./components/Placeholder.svelte";

    const dispatch = createEventDispatcher();

    let displayInput = false;
    
</script>
<style type="text/scss">
    article{
        height: 92%;
        width: 100%;
        display: flex;
        flex-direction: column;
        // justify-content: space-between;
        align-items: center;
        overflow: auto;
    }
    p{
        margin: 0;
        text-align: center;
    }
    .name{
        font-family: monospace;
        text-align: center;
    }
    .stupid-dot{
        display: none;
    }
    .header{
        border-bottom: 4px double;
        width: 100%;
    }
    .imgWrapper{
        width: 30%;
    }
    .imgBg{
        background-color: #653ca7;
        width: 200px;
        border: 4px solid;
        margin: 0 auto;
    }
    img{
        width: inherit;
    }
    .infoWrapper{
        display: flex;
        justify-content: space-between;
        margin: auto 0;
    }
    .info{
        width: 60%;
    }
    li{
        list-style-type: ">";
        padding-left: 1%;
        line-height: 100%;
    }
    li:not(:last-child) { 
        margin-bottom: 2%;  
    }       
    // .code{
    //     background-color: white;
    //     color: rgb(98, 0, 255);
    // }
</style>

<!-- <svelte:window on:keyup={keypress}/> -->
<KeyPress on:escPress on:enterPress={() => displayInput = true}/>

<article>
    <div class="header">
        <p id="firstParagraph">Ashat Assabi Industries Inc.</p>
        <p>Autonomous Pseudo-Voltonic Lewitt-Hoffenfeld Manifold, AKA the</p>
        <p style="white-space: pre" class="name"><span class="stupid-dot">.</span><!--If this stupid dot is not here the indentation on the first following line will not work. It's utterly stupid.-->
   ___  _______________________    ____   ____  ___  ___  ___________________  ___   _  _____ 
  / _ \/ __/_  __/_  __/ __/ _ \  / __/_ / / / / / |/ / |/ / __/ __/_  __/ _ \/ _ | / |/ / _ \
 / ___/ _/  / /   / / / _// , _/ _\ \/ // / /_/ /    /    / _/_\ \  / / / , _/ __ |/    / // /
/_/  /___/ /_/   /_/ /___/_/|_| /___/\___/\____/_/|_/_/|_/___/___/ /_/ /_/|_/_/ |_/_/|_/____/
        </p>
        <br/>
        <p>Model 86-q4</p>
    </div>
    <div class="infoWrapper">
        <div class="info">
            <ul>
                <li>
                    This model of the APVLHM, the "Petter Sjunnestrand" is a specialized protocol automaton, proficient in a number of human and computer languages, as specified by the installed modules.
                </li>
                <li>
                    The main uses for the Petter Sjunnestrand are computer programming and cross-language human communication – although some cases of unverified human-feline communication has been reported.
                </li>
                <li>
                    The user interface features a non-threatening, kind-looking human face. For its uses in human to human communication, the tripolaric gaustic grid has been fitted with two arrays of muonic base plates,
                    thus enhancing the attentiveness to human emotion. 
                </li>
                <li>For more specs, input <span class="code">> run -p specs</span></li>
                <li>For a list of all commands, input <span class="code">> help</span></li>
            </ul>
        </div>
        <!-- <div class="separator"></div> -->
        <div class="imgWrapper">
            <div class="imgBg">
                <img src="./img/profile-pic-small.png" alt="ASCII style of Petter Sjunnestrand"/>
            </div>
        </div>
    </div>
</article>
{#if !displayInput}
    <Placeholder/>
{:else}
    <Terminal on:command/>
{/if}