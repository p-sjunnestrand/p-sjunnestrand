<script>
    import KeyPress from "../KeyPress.svelte";
    import Terminal from "../Terminal.svelte";
    import Placeholder from "./Placeholder.svelte";

    let displayInput = false;

    export const eduArray = [
        {
            graduationYear: "2022 (present)",
            school: "Medieinstitutet",
            education: "Font end development",
        },
        {
            graduationYear: "2019",
            school: "Uppsala University",
            education: "Master's degree in Semitic Languages",
        },
        {
            graduationYear: "2013",
            school: "Uppsala University",
            education: "Bachelor's degree in Arabic",
        },
    ];

    // export let openFile;
</script>

<style>
    article{
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
    .edu-wrapper {
        border: 1px white solid;
        margin-top: 2rem;
    }
    ul {
        margin: 0;
        padding: 0;
    }
    li {
        list-style-type: none;
    }
    .edu-card {
        display: flex;
        border-bottom: 1px white solid;
    }
    .edu-detail {
        border-right: 1px white dotted;
        padding: 1rem;
        width: 20%;
    }
    .edu-edu {
        border-right: none;
        width: 52%;
    }
    .label {
        text-decoration: underline;
    }
</style>


<KeyPress on:escPress on:enterPress={() => displayInput = true}/>

<article>
    <div class="header">
        <h1>WORK</h1>
        <p>Input <span class="code">> help</span> for list of commands.</p>
    </div>
        <div class="edu-wrapper">
            <ul class="edu-card">
                <li class="label edu-detail">YEAR</li>
                <li class="label edu-detail">SCHOOL</li>
                <li class="label edu-edu edu-detail">EDUCATION</li>
            </ul>
            {#each eduArray as edu}
                <ul class="edu-card">
                    <li class="edu-year edu-detail">{edu.graduationYear}</li>
                    <li class="edu-school edu-detail">{edu.school}</li>
                    <li class="edu-edu edu-detail">{edu.education}</li>
                    <!-- <div class="work-desc work-detail">{work.desc}</div> -->
                </ul>
            {/each}
        </div>
</article>

{#if !displayInput}
    <Placeholder/>
{:else}
    <Terminal on:command/>
{/if}