<script>
    import WelcomeLogo from "./WelcomeLogo.svelte";
    import Header from "./Header.svelte";
    import WelcomeScreen from "./WelcomeScreen.svelte";
    import Modules from "./components/Modules.svelte";
    import Work from "./components/Work.svelte";
    import Education from "./components/Education.svelte";
    import Portfolio from "./components/Portfolio.svelte";
    import Specs from "./components/Specs.svelte";
    import Console from "./components/Console.svelte";
    import {createEventDispatcher} from "svelte";

    let logoFinished = true;
    export let displayConsole = false;
    let pageDisplay = "main";
    
    const dispatch = createEventDispatcher();
    //
    const execCommand = (event) => {
        const programArray = ["main", "modules", "work", "edu", "portf", "specs"];
        const command = event.detail.command;
        const argument = event.detail.argument;
        const isNumeric = (value) => {
                return /^\d+$/.test(value);
        }
        // if(command === "help"){
        //     displayConsole = true;
            
        // }
        if(command === "run -p"){
            const program = programArray.find(program => program === argument);
            //Fix this
            if(program === undefined){
                console.log(`${argument} is not a program`);
            } else {
                displayConsole = false;
                pageDisplay = program;
            }
        }
        else if(command === "sys exit"){
            if(!argument){
                dispatch('logout');
            }
            //Fix this
            else {
                console.log(`${argument} is not a valid argument`);
            }
        }
        else if(command === "sys shutdown"){
            if(argument === "-n"){
                dispatch("shutdown");
            //Fix this
            } else if(isNumeric(argument)){
                console.log(`shutting down in ${argument} seconds`);
            } else {
                console.log(`${argument} is not a valid argument`);
            }
        }
        else {
            displayConsole = true;
        }
        //TODO:
        // if(command === "open -f")
        // if(command === "open -d")
        
    }
</script>

<style>
    section{
        height: 100%;
        width: 100%;
    }
</style>

<section>
    {#if !logoFinished}
        <WelcomeLogo on:logoLoaded={() => logoFinished = true}/>
    {:else}
        {#if !displayConsole}
            {#if pageDisplay === "main"}
                <WelcomeScreen on:escPress={() => displayConsole = true} on:command={execCommand}/>
            {:else if pageDisplay === "modules"}
                <Modules on:escPress={() => displayConsole = true} on:command={execCommand}/>
            {:else if pageDisplay === "work"}
                <Work on:escPress={() => displayConsole = true} on:command={execCommand}/>
            {:else if pageDisplay === "edu"}
                <Education on:escPress={() => displayConsole = true} on:command={execCommand}/>
            {:else if pageDisplay === "portf"}
                <Portfolio on:escPress={() => displayConsole = true} on:command={execCommand}/>
            {:else if pageDisplay === "specs"}
                <Specs on:escPress={() => displayConsole = true} on:command={execCommand}/>
            {/if}
        {:else}
            <Console on:command={execCommand}/>
        {/if}
    {/if}
</section>