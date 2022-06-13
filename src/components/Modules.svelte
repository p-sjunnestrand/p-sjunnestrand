<script>
    import KeyPress from "../KeyPress.svelte";
    import Terminal from "../Terminal.svelte";
    import Placeholder from "./Placeholder.svelte";
    import ModuleFile from "./ModuleFile.svelte";

    let displayInput = false;

    export let cardObjects = [
        {
            title: "langtech",
            text: "Module enables two-way communication in selected languages. The MENA-package includes Arabic, Sorani Kurdish and Hebrew. Note that skill in each individual language is controlled by amount of allocated memory. The currently used AKH-program allocates memory as follows:",
            skills: [
                {
                    name: "Swedish",
                    memory: 320,
                },
                {
                    name: "English",
                    memory: 256,
                },
                {
                    name: "Arabic",
                    memory: 192,
                },
                {
                    name: "Sorani",
                    memory: 128,
                },
                {
                    name: "Hebrew",
                    memory: 64,
                },
            ]
        },
        {
            title: "webproc",
            text: "The WebProc-0.6 (Beta) module enables skillful processing of web design tools including HTML, CSS & JavaScript. Note that the module is only in its Beta development stage and all features may not yet be 100% functional. The full release is expected in fall 2022. Allocated memory program below.",
            skills: [
                {
                    name: "HTML",
                    memory: 256,
                },
                {
                    name: "CSS",
                    memory: 256,
                },
                {
                    name: "JavaScript",
                    memory: 256,
                },
            ],
            subSkills: [
                "React",
                "Svelte",
                "Vue",
                "Nodejs",
                "Socket IO",
                "Express",
                "Redux",
                "SASS",
                "Tailwind",
                "Mongodb",
                "MySQL",
                "SQL Server",
            ]
        },
    ]
    export let openFile;
</script>

<style>
    article{
        height: 92%;
        overflow: auto;
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    #modulesWrapper{
        display: flex;
        margin: 5% auto;
        width: 50%;
        justify-content: space-evenly;
        /* height: 30%; */
        flex-wrap: wrap;
    }
    
    h2{
        text-align: center;
    }
    .card{
        display: flex;
        flex-direction: column;
        align-items: center;
        width: max-content;
        height: 80%;
    }
    .file {
        /* position: relative; */
        width: 5vw;
        /* height: 10vh; */
        /* border-radius: 10px; */
        /* background: white;
        color: #888;
        text-align: center; */
    }
</style>
{#if !openFile}
    <KeyPress on:escPress on:enterPress={() => displayInput = true}/>
{:else}
    <KeyPress on:escPress/>
{/if}
<article>
    <div class="header">
        <h1>MODULES</h1>
        <p>Input <span class="code">> open -f [file]</span> to open </p>
        <p>Input <span class="code">> help</span> for list of commands.</p>
    </div>
    {#if openFile}
        <ModuleFile fileName={openFile} fileObjects={cardObjects} on:closeFile/>
        {:else}
        <div id="modulesWrapper">
            {#each cardObjects as cardObject}
                <!-- <ModuleIcon {cardObject}/> -->
                <div class="card">
                    <img src="./img/folded-file.svg" alt="white paper folded in top right corner" class="file">
                    <h2>{cardObject.title}.sys</h2>
                </div>
            {/each}
        </div>
    {/if}
    
</article>
{#if openFile}
    <Placeholder terminal={false}/>
{:else}
    {#if !displayInput}
        <Placeholder terminal={true}/>
    {:else}
        <Terminal on:command/>
    {/if}
{/if}