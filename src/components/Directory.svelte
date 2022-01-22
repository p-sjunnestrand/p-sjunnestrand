<script>
    import { beforeUpdate, onDestroy, createEventDispatcher } from 'svelte';
    export let openDir;

    const dispatch = createEventDispatcher();

    const projects = [
        {title: "game_of_life", directory: "personal", url: "https://p-sjunnestrand.github.io/game-of-life/"},
        {title: "gridpainter", directory: "personal", url: "https://fed20d-grupp8-gridpainter.herokuapp.com/"},
        {title: "trials_of_norns", directory: "personal", url: "https://p-sjunnestrand.github.io/trials-of-norns/"},
        {title: "forca_fighting", directory: "clients", url: "https://forcafighting.com/"},
    ];
    let currentProjects = projects.filter(project => project.directory === openDir);

    beforeUpdate(() => {
        currentProjects = projects.filter(project => project.directory === openDir);
    })

    onDestroy(() => {
        dispatch('closeDir');
    });
</script>

<style>
    .file-wrapper {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-evenly;
        margin-top: 5%;
    }
    .card {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .file {
        width: 5vw;
    }
</style>

<div class="file-wrapper">
    {#each currentProjects as project}
        <div class="card">
            <img src="./img/folded-file.svg" alt="white paper folded in top right corner" class="file">
            <h2>{project.title}.sys</h2>
        </div>
    {/each}
</div>