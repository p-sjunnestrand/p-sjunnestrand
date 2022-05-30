<script>
    import {onDestroy, createEventDispatcher} from 'svelte';
    export let fileObjects;
    export let fileName;

    const dispatch = createEventDispatcher();

    onDestroy(() => {
        dispatch('closeFile');
    });

    const currentFile = fileObjects.find(file => file.title === fileName);
    const currentSkills = currentFile.skills;
    console.log(currentSkills);

    const starCounter = (allocMemory) => {
        const litStars = '*'.repeat(allocMemory/64);
        const darkStars = '*'.repeat(5 - allocMemory/64);

        //Interestingly, the classes created here cannot be reached in the component CSS, but must be styled in the global CSS file.
        const starLine = `<span class="litStars">${litStars}</span><span class="darkStars">${darkStars}</span>`;
        console.log(allocMemory);
        return starLine;
    }
</script>

<style type="text/scss">
    $secondary-background: rgb(98, 0, 255);
    
    .fileWindow{
        // position: absolute;
        width: 60%;
        // top: 35%;
        // left: 20%;
        // z-index: 1;
        margin: 2rem 0;
        background-color: white;
        color: rgb(98, 0, 255);
        outline: 4px solid rgb(98, 0, 255);
        outline-offset: -5px;
        padding: 2%;
        box-sizing: border-box;
    }
    .skillsWrapper{
        display: flex;
        // justify-content: space-around;
        background-color: $secondary-background;
        color: white;
    }
    .skill{
        display: flex;
    }
</style>


<div class="fileWindow">
    <h2>{fileName}</h2>
    <p>{currentFile.text}</p>
    <div class="skillsWrapper">
        {#each currentSkills as skill}
            <div class="skill">
                <div>
                    {skill.name}
                </div>
                {#if skill.subSkills}
                    {#each skill.subSkills as subSkill}
                        <div>{subSkill}</div>
                    {/each}
                {/if}
                <div>
                    {skill.memory}kB
                </div>
                <div>
                    {@html starCounter(skill.memory)}
                </div>
            </div>
        {/each}
        <!-- <div class="skillName">
            {#each currentSkills as skill}
                <div>
                    {skill.name}
                </div>
                {#if skill.subSkills}
                    {#each skill.subSkills as subSkill}
                        <div>{subSkill}</div>
                    {/each}
                {/if}
            {/each}
        </div>
        <div class="skillMemory">
            {#each currentSkills as skill}
                <div>
                    {skill.memory}kB
                </div>
            {/each}
        </div>
        <div class="skillStars">
            {#each currentSkills as skill}
                <div>
                    {@html starCounter(skill.memory)}
                </div>
            {/each}
        </div> -->
    </div>
</div>
