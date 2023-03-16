<template>
    <div v-if="modalIsOpen">
        <div class="overlay opaque">
            <div id="loading">
                <ion-icon class="rotate" name="reload-circle"></ion-icon>
                {{text}}
            </div>
        </div>
    </div>
</template>

<style scoped>
    
</style>

<script>
export default {
    name: "LoadingComponent",
    props:{
        text: {
            type: String,
            default: 'Please wait...'
        },
    },

    data: function () {
        return {
            modalIsOpen: true,
        }
    },
}
</script>