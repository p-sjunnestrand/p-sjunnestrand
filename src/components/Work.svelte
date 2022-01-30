<script>
    import KeyPress from "../KeyPress.svelte";
    import Terminal from "../Terminal.svelte";
    import WorkFile from "./WorkFile.svelte";
    import Placeholder from "./Placeholder.svelte";

    let displayInput = false;

    export const workArray = [
        {
            index: "0",
            year: "2022 (present)",
            employer: "Nordic Morning",
            title: "Font end developer (internship)",
            desc: "In charge of redesigning internal systems for ..."
        },
        {
            index: "1",
            year: "2021",
            employer: "Uppsala University",
            title: "Course developer",
            desc: "Developed online material for two university courses in Arabic."
        },
        {
            index: "2",
            year: "2020",
            employer: "Uppsala University",
            title: "Arabic teacher",
            desc: "Taught Arabic reading comprehension in a university course in Arabic."
        },
        {
            index: "3",
            year: "2015-2016",
            employer: "Lernia AB",
            title: "Swedish teacher",
            desc: "Taught Swedish for immigrants."
        },
        {
            index: "4",
            year: "2011-2015",
            employer: "ICA",
            title: "Clerk",
            desc: "Worked in various positions, including cashier, charcuterie management, postal service management, and friut and vegetable management."
        },
        
    ];

    export let openFile;
</script>

<style>
    article{
        /* height: 100%;
        display: flex;
        justify-content: space-between;
        flex-direction: column;
        align-items: center; */
        height: 92%;
        overflow: auto;
        position: relative;
    }
    
    /* .code{
        background-color: white;
        color: rgb(98, 0, 255);
    }
    .header{
        border-bottom: 4px double;
        width: 100%;
    } */
    .work-wrapper {
        border: 1px white solid;
        margin-top: 2rem;
        /* padding: 1rem; */
    }
    ul {
        margin: 0;
        padding: 0;
    }
    li {
        list-style-type: none;
    }
    .work-card {
        display: flex;
        border-bottom: 1px white solid;
    }
    .work-detail {
        border-right: 1px white dotted;
        padding: 1rem;
        width: 32%;
    }
    /* .work-desc {
        border: none;
        width: 40%;
    } */
    .work-index {
        width: 8%;
    }
    .work-title {
        border-right: none;
    }
    .label {
        text-decoration: underline;
    }
</style>


<KeyPress on:escPress on:enterPress={() => displayInput = true}/>

<article>
    <div class="header">
        <h1>WORK</h1>
        <p>Input <span class="code">> open -f [index]</span> to open </p>
        <p>Input <span class="code">> help</span> for list of commands.</p>
    </div>
    {#if openFile}
        <WorkFile fileIndex={openFile} {workArray} on:closeFile/>
        {:else}
            <div class="work-wrapper">
                <ul class="work-card">
                    <li class="label work-index work-detail">INDEX</li>
                    <li class="label work-detail">YEAR</li>
                    <li class="label work-detail">EMPLOYER</li>
                    <li class="label work-title work-detail">TITLE</li>
                </ul>
                {#each workArray as work}
                    <ul class="work-card">
                        <li class="work-index work-detail">{work.index}</li>
                        <li class="work-year work-detail">{work.year}</li>
                        <li class="work-employer work-detail">{work.employer}</li>
                        <li class="work-title work-detail">{work.title}</li>
                        <!-- <div class="work-desc work-detail">{work.desc}</div> -->
                    </ul>
                {/each}
            </div>
    {/if}  
</article>
{#if openFile}
    <p>PRESS ESC TO CLOSE FILE</p>
{:else}
    {#if !displayInput}
        <Placeholder/>
    {:else}
        <Terminal on:command/>
    {/if}
{/if}