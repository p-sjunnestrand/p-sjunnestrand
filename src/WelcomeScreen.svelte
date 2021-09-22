<script>
    import {createEventDispatcher, onMount} from "svelte";
    import Terminal from "./Terminal.svelte";
    import KeyPress from "./KeyPress.svelte";

    const dispatch = createEventDispatcher();

    let displayInput = false;
    
    onMount(() => displayInput = false);
    // const keypress = (e) => {
    //     if(e.key === 'Enter'){
    //         showInput = true;
    //     }
    //     if(e.key === 'Escape'){
    //         dispatch('esc');
    //     }
    // }
    
</script>
<style type="text/scss">
    article{
        height: 100%;
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
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
    }
    .imgBg{
        background-color: #653ca7;
        width: 200px;
        border: 4px solid;
    }
    img{
        width: inherit;
    }
    .infoWrapper{
        display: flex;
        justify-content: space-between;
    }
    .info{
        width: 50%;
    }
    li{
        list-style-type: ">";
        margin: 1%;
    }
    
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
                    The main uses for the Petter Sjunnestrand are cross-language human communication and computer programming.
                </li>
                <li>
                    The user interface features a non-threatening, kind-looking human face. For its uses in human to human communication, the tripolaric gaustic grid has been fitted with two arrays of muonic base plates,
                    thus enhancing the attentiveness to human emotion. 
                </li>
                <li>For more specs, type >run -p specs</li>
            </ul>
        </div>
        <!-- <div class="separator"></div> -->
        <div>
            <div class="imgBg">
                <img src="./img/profile-pic.png" alt="ASCII style of Petter Sjunnestrand"/>
            </div>
        </div>
    </div>
    {#if !displayInput}
        <h3>PRESS ESC FOR CONSOLE. ENTER FOR TERMINAL.</h3>
    {:else}
        <Terminal on:command/>
    {/if}
</article>